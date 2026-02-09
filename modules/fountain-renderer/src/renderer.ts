import type { FountainScript, FountainElement } from 'fountain-parser';

export function renderHtml(script: FountainScript): string {
  let html = '<div class="script-container">\n';

  const hasTitlePageContent = hasTitlePage(script);

  // Title Page
  if (hasTitlePageContent) {
      html += '<div class="title-page">';
      
      // Top section: Title, Credit, Author, Source
      html += '<div class="title-section">';
      if (script.title) html += `<h1>${formatTitleText(script.title).replace(/\n/g, '<br/>')}</h1>`;
      if (script.credit) html += `<p class="credit">${formatTitleText(script.credit).replace(/\n/g, '<br/>')}</p>`;
      if (script.author) html += `<p class="author">${formatTitleText(script.author).replace(/\n/g, '<br/>')}</p>`;
      if (script.source) html += `<p class="source">${formatTitleText(script.source).replace(/\n/g, '<br/>')}</p>`;
      html += '</div>';

      // Bottom section: Draft, Contact
      html += '<div class="bottom-section">';
      if (script.draft_date) html += `<p class="draft-date">${formatText(script.draft_date).replace(/\n/g, '<br/>')}</p>`;
      if (script.contact) html += `<p class="contact">${formatText(trimLines(script.contact)).replace(/\n/g, '<br/>')}</p>`;
      html += '</div>';
      
      html += '</div>\n';
  }

  // Track whether the first page_break after title page should be suppressed
  let suppressNextPageBreak = hasTitlePageContent;

  for (let i = 0; i < script.elements.length; i++) {
    const element = script.elements[i];

    // Suppress the first page_break immediately after the title page
    // (the title page already has page-break-after: always)
    if (suppressNextPageBreak && element.type === 'page_break') {
        suppressNextPageBreak = false;
        continue;
    }
    // Any non-page-break element means we're past the title page boundary
    if (suppressNextPageBreak && element.type !== 'page_break') {
        suppressNextPageBreak = false;
    }
    
    // Dual Dialogue handling
    if (element.type === 'character' && element.dual === 'left') {
        html += '<div class="dual-dialogue-row">';
        html += '<div class="dual-left">';
        html += renderElement(element);
        // Render subsequent dialogue/parenthetical until next character or non-dialogue
        let j = i + 1;
        while(j < script.elements.length) {
            const next = script.elements[j];
            if (next.type === 'parenthetical' || next.type === 'dialogue') {
                html += renderElement(next);
                j++;
            } else {
                break;
            }
        }
        html += '</div>'; // Close left
        i = j - 1; // Advance main loop
        continue;
    }
    
    if (element.type === 'character' && element.dual === 'right') {
        html += '<div class="dual-right">';
        html += renderElement(element);
        let j = i + 1;
        while(j < script.elements.length) {
            const next = script.elements[j];
            if (next.type === 'parenthetical' || next.type === 'dialogue') {
                html += renderElement(next);
                j++;
            } else {
                break;
            }
        }
        html += '</div>'; // Close right
        html += '</div>'; // Close row
        i = j - 1;
        continue;
    }

    html += renderElement(element);
  }

  html += '</div>';
  return html;
}

function hasTitlePage(script: FountainScript): boolean {
    return !!(script.title || script.author || script.credit || script.source);
}

function renderElement(element: FountainElement): string {
  const content = formatText(element.text);
  
  switch (element.type) {
    case 'scene_heading': {
      const sceneNumHtml = element.scene_number 
        ? `<span class="scene-number">${escapeHtml(element.scene_number)}</span>` 
        : '';
      return `<div class="scene-heading">${sceneNumHtml}${content}</div>\n`;
    }
    case 'action':
      // Preserve leading whitespace for action
      return `<div class="action">${content}</div>\n`;
    case 'character':
      return `<div class="character">${content}</div>\n`;
    case 'dialogue':
      // Handle dialogue continuation (empty line with spaces in source)
      if (element.continued) {
        return `<div class="dialogue dialogue-break">&nbsp;</div>\n`;
      }
      return `<div class="dialogue">${content}</div>\n`;
    case 'parenthetical':
      return `<div class="parenthetical">${content}</div>\n`;
    case 'transition':
      return `<div class="transition">${content}</div>\n`;
    case 'centered':
      return `<div class="centered">${content}</div>\n`;
    case 'page_break':
      return `<div class="page-break"></div>\n`;
    case 'section_heading': {
      const depth = element.depth || 1;
      const tag = `h${Math.min(depth + 1, 6)}`; // h2-h6 (h1 reserved for title)
      return `<${tag} class="section-heading section-${depth}">${content}</${tag}>\n`;
    }
    case 'synopsis':
      return `<div class="synopsis">${content}</div>\n`;
    case 'note':
      return `<div class="note">[[${content}]]</div>\n`;
    case 'lyric':
      return `<div class="lyric">${content}</div>\n`;
    case 'boneyard':
      // Boneyard should not render
      return '';
    default:
      return `<div class="unknown">${content}</div>\n`;
  }
}

function formatText(text: string): string {
  // Escape HTML first
  let temp = escapeHtml(text);

  // Handle escaped emphasis markers (backslash escapes)
  // Replace \* \_ with HTML entities temporarily
  temp = temp.replace(/\\\*/g, '&#42;');
  temp = temp.replace(/\\_/g, '&#95;');

  // Handle inline notes [[note]] - render with special styling
  temp = temp.replace(/\[\[([^\]]*?)\]\]/g, '<span class="note-inline">[[$1]]</span>');

  // Bold Italics ***text***
  temp = temp.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold **text**
  temp = temp.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italics *text* (but not standalone asterisks)
  temp = temp.replace(/\*([^\s*][^*]*[^\s*]|[^\s*])\*/g, '<em>$1</em>');
  // Underline _text_
  temp = temp.replace(/_([^\s_][^_]*[^\s_]|[^\s_])_/g, '<u>$1</u>');

  // Preserve whitespace for action indentation
  temp = temp.replace(/^( +)/gm, (match) => '&nbsp;'.repeat(match.length));
  temp = temp.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

  return temp;
}

// Trim leading whitespace from each line (for multi-line fields like Contact)
function trimLines(text: string): string {
  return text.split('\n').map(line => line.trim()).join('\n');
}

// Format title page text - handles underscore markers for underlined title lines
function formatTitleText(text: string): string {
  // Process each line separately to handle per-line underlining
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    // Trim the line and check if it has underscore markers (e.g., _**TITLE**_)
    const trimmed = line.trim();
    const underlineMatch = trimmed.match(/^_(.+)_$/);
    let content = underlineMatch ? underlineMatch[1] : trimmed;
    let shouldUnderline = !!underlineMatch;
    
    // Escape HTML
    content = escapeHtml(content);

    // Handle escaped emphasis markers
    content = content.replace(/\\\*/g, '&#42;');
    content = content.replace(/\\_/g, '&#95;');

    // Bold Italics ***text***
    content = content.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold **text**
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics *text*
    content = content.replace(/\*([^\s*][^*]*[^\s*]|[^\s*])\*/g, '<em>$1</em>');

    // Apply underline if the line had _ markers
    if (shouldUnderline) {
      content = `<u>${content}</u>`;
    }
    
    return content;
  });
  
  return processedLines.join('\n');
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"'\u0080-\uFFFF]/g, (match) => {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return `&#${match.charCodeAt(0)};`;
        }
    });
}
