import { describe, it, expect } from 'bun:test';
import { renderHtml } from './renderer.js';
import type { FountainScript } from 'fountain-parser';

describe('renderHtml', () => {
  describe('Title Page', () => {
    it('renders title page with all fields', () => {
      const script: FountainScript = {
        title: 'My Script',
        author: 'John Doe',
        credit: 'Written by',
        source: 'Based on the novel',
        draft_date: '2023-11-27',
        contact: '  123 Main St\n  City, State  ',
        elements: []
      };
      const html = renderHtml(script);
      expect(html).toContain('title-page');
      expect(html).toContain('My Script');
      expect(html).toContain('John Doe');
      expect(html).toContain('Based on the novel');
      expect(html).toContain('2023-11-27');
      expect(html).toContain('123 Main St<br/>City, State'); // trimLines should handle this
    });

    it('skips title page if no title fields', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'Some action' }]
      };
      const html = renderHtml(script);
      expect(html).not.toContain('title-page');
    });

    it('renders underlined fields in title page', () => {
      const script: FountainScript = {
        title: '_MY UNDERLINED TITLE_',
        elements: []
      };
      const html = renderHtml(script);
      expect(html).toContain('<u>MY UNDERLINED TITLE</u>');
    });

    it('renders nested formatting in title page fields', () => {
      const script: FountainScript = {
        title: '_**BOLD UNDERLINED**_',
        elements: []
      };
      const html = renderHtml(script);
      expect(html).toContain('<u><strong>BOLD UNDERLINED</strong></u>');
    });
  });

  describe('Scene Headings', () => {
    it('renders scene heading with class', () => {
      const script: FountainScript = {
        elements: [{ type: 'scene_heading', text: 'INT. HOUSE - DAY' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="scene-heading"');
      expect(html).toContain('INT. HOUSE - DAY');
    });

    it('renders scene number in span', () => {
      const script: FountainScript = {
        elements: [{ type: 'scene_heading', text: 'INT. HOUSE - DAY', scene_number: '1A' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="scene-number"');
      expect(html).toContain('1A');
    });
  });

  describe('Character and Dialogue', () => {
    it('renders character with uppercase class', () => {
      const script: FountainScript = {
        elements: [{ type: 'character', text: 'JOHN' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="character"');
    });

    it('renders dialogue', () => {
      const script: FountainScript = {
        elements: [
          { type: 'character', text: 'JOHN' },
          { type: 'dialogue', text: 'Hello!' }
        ]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="dialogue"');
      expect(html).toContain('Hello!');
    });

    it('renders dialogue break with continued flag', () => {
      const script: FountainScript = {
        elements: [
          { type: 'character', text: 'JOHN' },
          { type: 'dialogue', text: 'Line one' },
          { type: 'dialogue', text: '', continued: true },
          { type: 'dialogue', text: 'Line two' }
        ]
      };
      const html = renderHtml(script);
      expect(html).toContain('dialogue-break');
    });

    it('renders parenthetical', () => {
      const script: FountainScript = {
        elements: [{ type: 'parenthetical', text: '(whispering)' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="parenthetical"');
    });
  });

  describe('Dual Dialogue', () => {
    it('renders dual dialogue in row container', () => {
      const script: FountainScript = {
        elements: [
          { type: 'character', text: 'BRICK', dual: 'left' },
          { type: 'dialogue', text: 'Hello!' },
          { type: 'character', text: 'STEEL', dual: 'right' },
          { type: 'dialogue', text: 'Hi!' }
        ]
      };
      const html = renderHtml(script);
      expect(html).toContain('dual-dialogue-row');
      expect(html).toContain('dual-left');
      expect(html).toContain('dual-right');
    });
  });

  describe('Transitions', () => {
    it('renders transition', () => {
      const script: FountainScript = {
        elements: [{ type: 'transition', text: 'CUT TO:' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="transition"');
    });
  });

  describe('Action', () => {
    it('renders action', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'They drink beer.' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="action"');
    });
  });

  describe('Lyrics', () => {
    it('renders lyrics', () => {
      const script: FountainScript = {
        elements: [{ type: 'lyric', text: 'Willy Wonka!' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="lyric"');
    });
  });

  describe('Centered Text', () => {
    it('renders centered text', () => {
      const script: FountainScript = {
        elements: [{ type: 'centered', text: 'THE END' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="centered"');
    });
  });

  describe('Sections', () => {
    it('renders section with depth class', () => {
      const script: FountainScript = {
        elements: [{ type: 'section_heading', text: 'Act Two', depth: 2 }]
      };
      const html = renderHtml(script);
      expect(html).toContain('section-2');
      expect(html).toContain('<h3');
    });
  });

  describe('Synopsis', () => {
    it('renders synopsis', () => {
      const script: FountainScript = {
        elements: [{ type: 'synopsis', text: 'This is a synopsis.' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="synopsis"');
    });
  });

  describe('Notes', () => {
    it('renders note', () => {
      const script: FountainScript = {
        elements: [{ type: 'note', text: 'A note' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="note"');
    });
  });

  describe('Page Break', () => {
    it('renders page break', () => {
      const script: FountainScript = {
        elements: [{ type: 'page_break', text: '' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('class="page-break"');
    });
  });

  describe('Text Formatting', () => {
    it('renders bold text', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'This is **bold** text' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('<strong>bold</strong>');
    });

    it('renders italic text', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'This is *italic* text' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('<em>italic</em>');
    });

    it('renders underline text', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'This is _underline_ text' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('<u>underline</u>');
    });

    it('renders bold italic text', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'This is ***bold italic*** text' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('<strong><em>bold italic</em></strong>');
    });

    it('escapes emphasis with backslash', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'Code: \\*not italic\\*' }]
      };
      const html = renderHtml(script);
      expect(html).not.toContain('<em>');
      expect(html).toContain('&#42;not italic&#42;');
    });

    it('renders inline notes', () => {
      const script: FountainScript = {
        elements: [{ type: 'action', text: 'Text [[note]] more text' }]
      };
      const html = renderHtml(script);
      expect(html).toContain('note-inline');
    });

    it('escapes non-ASCII characters in escapeHtml', () => {
        const script: FountainScript = {
            elements: [{ type: 'action', text: '© 2023' }]
        };
        const html = renderHtml(script);
        expect(html).toContain('&#169; 2023');
    });
  });
});
