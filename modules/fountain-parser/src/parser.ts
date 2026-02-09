import type { FountainScript, ElementType } from './types.js';

// Regex definitions
const SCENE_HEADING_REGEX = /^((?:INT|EXT|EST|INT\.?\/EXT\.?|I\/E)[.\s].*)|^\.(.+)$/i;
const SCENE_NUMBER_REGEX = /#([A-Za-z0-9\-\.]+)#\s*$/;
const CHARACTER_REGEX = /^[A-Z][A-Z0-9 \t.\-']*( *\(.*\))?( *\^)?$/;
const FORCED_CHARACTER_REGEX = /^@(.+)$/;
const PARENTHETICAL_REGEX = /^\(.*\)$/;
const TRANSITION_REGEX = /^[A-Z\s]+TO:$/;
const CENTERED_REGEX = /^>.*<$/;
const PAGE_BREAK_REGEX = /^={3,}$/;
const SECTION_REGEX = /^(#+)\s*(.+)/;
const SYNOPSIS_REGEX = /^=(?!=)\s*(.+)/;
const NOTE_REGEX = /^\[\[(.*)\]\]$/;
const LYRIC_REGEX = /^~(.+?)~?\s*$/;
const FORCED_TRANSITION_REGEX = /^>(?![<])(.*)$/;
const FORCED_ACTION_REGEX = /^!(.*)$/;

// Preprocess multi-line notes: [[note spanning
// multiple lines]] becomes [[note spanning multiple lines]]
function preprocessMultiLineNotes(text: string): string {
  // Handle multi-line notes by collapsing them to single line
  // Notes can span lines if blank lines within have 2+ spaces
  return text.replace(/\[\[([^\]]*?)\]\]/gs, (match, content) => {
    // Collapse newlines to spaces, but preserve double-space blank lines
    const collapsed = content.replace(/\n  \n/g, ' ').replace(/\n/g, ' ');
    return `[[${collapsed}]]`;
  });
}

export function parseFountain(text: string): FountainScript {
  const script: FountainScript = { elements: [] };
  
  // First, handle boneyard (/* ... */) by removing it entirely
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Preprocess multi-line notes
  text = preprocessMultiLineNotes(text);
  
  const lines = text.split(/\r?\n/);
  
  let i = 0;
  
  // 1. Parse Title Page (must be at the start)
  while (i < lines.length) {
      const line = lines[i];
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match && line.trim() !== '') {
          const key = match[1].toLowerCase().replace(/ /g, '_');
          let value = match[2].trim();
          
          // Handle multi-line values (indented lines)
          let j = i + 1;
          while (j < lines.length) {
              const nextLine = lines[j];
              // Indented line (3+ spaces or tab) continues the value
              if (nextLine.match(/^(\t|   )/) && !nextLine.match(/^[^:]+:/)) {
                  value += '\n' + nextLine.trimEnd();
                  j++;
              } else {
                  break;
              }
          }
          (script as any)[key] = value;
          i = j;
      } else if (line.trim() === '') {
          // Check if title page continues after blank line
          if (lines[i+1] && !lines[i+1].match(/^([^:]+):/)) {
              i++;
              break;
          }
          i++;
      } else {
          break;
      }
  }

  let inDialogue = false;
  let lastNonEmptyLineType: ElementType | null = null;

  for (; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1]?.trim() : '';

    // Blank line handling
    if (line === '') {
      // Check for dialogue continuation (line with only spaces - 2+)
      if (rawLine.length >= 2 && rawLine.trim() === '' && inDialogue) {
        // This is a blank line with spaces - continues dialogue with visual break
        script.elements.push({ type: 'dialogue', text: '', continued: true });
        continue;
      }
      inDialogue = false;
      lastNonEmptyLineType = null;
      continue;
    }

    // Sections (# heading)
    const sectionMatch = line.match(SECTION_REGEX);
    if (sectionMatch) {
        const depth = sectionMatch[1].length;
        script.elements.push({ 
            type: 'section_heading', 
            text: sectionMatch[2].trim(),
            depth: Math.min(depth, 6)
        });
        inDialogue = false;
        lastNonEmptyLineType = 'section_heading';
        continue;
    }

    // Synopsis (= text) - but not page break (===)
    const synopsisMatch = line.match(SYNOPSIS_REGEX);
    if (synopsisMatch && !PAGE_BREAK_REGEX.test(line)) {
        script.elements.push({ type: 'synopsis', text: synopsisMatch[1].trim() });
        inDialogue = false;
        lastNonEmptyLineType = 'synopsis';
        continue;
    }

    // Notes [[text]]
    const noteMatch = line.match(NOTE_REGEX);
    if (noteMatch) {
        script.elements.push({ type: 'note', text: noteMatch[1].trim() });
        inDialogue = false;
        lastNonEmptyLineType = 'note';
        continue;
    }

    // Forced Action (!)
    const forcedActionMatch = line.match(FORCED_ACTION_REGEX);
    if (forcedActionMatch) {
        script.elements.push({ type: 'action', text: forcedActionMatch[1] });
        inDialogue = false;
        lastNonEmptyLineType = 'action';
        continue;
    }

    // Forced Scene Heading (.)
    if (line.startsWith('.') && line.length > 1 && /[a-zA-Z0-9]/.test(line[1])) {
        let sceneText = line.substring(1).trim();
        let sceneNumber: string | undefined;
        
        const sceneNumMatch = sceneText.match(SCENE_NUMBER_REGEX);
        if (sceneNumMatch) {
            sceneNumber = sceneNumMatch[1];
            sceneText = sceneText.replace(SCENE_NUMBER_REGEX, '').trim();
        }
        
        script.elements.push({ 
            type: 'scene_heading', 
            text: sceneText,
            scene_number: sceneNumber
        });
        inDialogue = false;
        lastNonEmptyLineType = 'scene_heading';
        continue;
    }

    // Centered (>text<)
    if (CENTERED_REGEX.test(line)) {
        script.elements.push({ type: 'centered', text: line.replace(/^>|<$/g, '').trim() });
        inDialogue = false;
        lastNonEmptyLineType = 'centered';
        continue;
    }

    // Forced Transition (>text but not >text<)
    const forcedTransitionMatch = line.match(FORCED_TRANSITION_REGEX);
    if (forcedTransitionMatch && !CENTERED_REGEX.test(line)) {
        script.elements.push({ type: 'transition', text: forcedTransitionMatch[1].trim() });
        inDialogue = false;
        lastNonEmptyLineType = 'transition';
        continue;
    }

    // Scene Heading (INT./EXT./etc.)
    if (SCENE_HEADING_REGEX.test(line) && prevLine === '') {
        let sceneText = line;
        let sceneNumber: string | undefined;
        
        const sceneNumMatch = sceneText.match(SCENE_NUMBER_REGEX);
        if (sceneNumMatch) {
            sceneNumber = sceneNumMatch[1];
            sceneText = sceneText.replace(SCENE_NUMBER_REGEX, '').trim();
        }
        
        script.elements.push({ 
            type: 'scene_heading', 
            text: sceneText,
            scene_number: sceneNumber
        });
        inDialogue = false;
        lastNonEmptyLineType = 'scene_heading';
        continue;
    }

    // Page Break (=== or more)
    if (PAGE_BREAK_REGEX.test(line)) {
        script.elements.push({ type: 'page_break', text: '' });
        inDialogue = false;
        lastNonEmptyLineType = 'page_break';
        continue;
    }
    
    // Lyrics (~text)
    const lyricMatch = line.match(LYRIC_REGEX);
    if (lyricMatch) {
        script.elements.push({ type: 'lyric', text: lyricMatch[1].trim() });
        // Lyrics can appear in or out of dialogue context
        lastNonEmptyLineType = 'lyric';
        continue;
    }

    // Transition (UPPERCASE ending in TO:)
    if (TRANSITION_REGEX.test(line) && prevLine === '' && nextLine === '') {
        script.elements.push({ type: 'transition', text: line });
        inDialogue = false;
        lastNonEmptyLineType = 'transition';
        continue;
    }

    // Forced Character (@name) — always recognized, even without following dialogue
    const forcedCharMatch = line.match(FORCED_CHARACTER_REGEX);
    if (forcedCharMatch) {
        const charText = forcedCharMatch[1].trim();
        const isDual = charText.endsWith('^');
        const cleanText = charText.replace(/\^$/, '').trim();
        
        script.elements.push({ 
            type: 'character', 
            text: cleanText,
            dual: isDual ? 'right' : undefined
        });
        
        if (isDual) {
            markPreviousCharacterAsLeft(script);
        }
        
        inDialogue = true;
        lastNonEmptyLineType = 'character';
        continue;
    }

    // Character (UPPERCASE with optional extension/dual marker)
    if (!inDialogue && CHARACTER_REGEX.test(line) && prevLine === '' && nextLine !== '') {
        const isDual = line.trim().endsWith('^');
        const cleanText = line.replace(/\^$/, '').trim();
        
        script.elements.push({ 
            type: 'character', 
            text: cleanText,
            dual: isDual ? 'right' : undefined
        });
        
        if (isDual) {
            markPreviousCharacterAsLeft(script);
        }
        
        inDialogue = true;
        lastNonEmptyLineType = 'character';
        continue;
    }

    // Parenthetical (within dialogue)
    if (inDialogue && PARENTHETICAL_REGEX.test(line)) {
        script.elements.push({ type: 'parenthetical', text: line });
        lastNonEmptyLineType = 'parenthetical';
        continue;
    }

    // Dialogue (follows character or parenthetical)
    if (inDialogue) {
        script.elements.push({ type: 'dialogue', text: line });
        lastNonEmptyLineType = 'dialogue';
        continue;
    }

    // Action (default - preserves leading whitespace)
    script.elements.push({ type: 'action', text: rawLine });
    lastNonEmptyLineType = 'action';
  }

  return script;
}

/**
 * Searches backwards from the most recent element to find the preceding
 * character cue and mark it as the left side of dual dialogue.
 * Stops searching if it hits a non-dialogue element (action, scene heading, etc.)
 * to avoid accidentally marking an unrelated character block.
 */
function markPreviousCharacterAsLeft(script: FountainScript): void {
    for (let k = script.elements.length - 2; k >= 0; k--) {
        const el = script.elements[k];
        if (el.type === 'character') {
            el.dual = 'left';
            break;
        }
        // Stop searching if we hit something that isn't dialogue-related
        if (el.type !== 'dialogue' && el.type !== 'parenthetical') {
            break;
        }
    }
}
