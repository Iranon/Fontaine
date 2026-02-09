import { describe, it, expect } from 'bun:test';
import { parseFountain } from './parser.js';

describe('parseFountain', () => {
  describe('Title Page', () => {
    it('parses simple title page', () => {
      const input = `Title: My Script
Author: John Doe

EXT. LOCATION - DAY`;
      const result = parseFountain(input);
      expect(result.title).toBe('My Script');
      expect(result.author).toBe('John Doe');
    });

    it('parses multi-line title page values', () => {
      const input = `Title:
    BRICK & STEEL
    FULL RETIRED
Author: Jane Doe
Draft date: 2023-11-27
Contact: 
    Agent Smith
    LA, California
Notes: Some notes.

EXT. LOCATION - DAY`;
      const result = parseFountain(input);
      expect(result.title).toContain('BRICK & STEEL');
      expect(result.title).toContain('FULL RETIRED');
      expect(result['draft_date']).toBe('2023-11-27');
      expect(result['contact']).toContain('Agent Smith');
      expect(result['contact']).toContain('LA, California');
      expect(result['notes']).toBe('Some notes.');
    });
  });

  describe('Scene Headings', () => {
    it('parses INT scene heading', () => {
      const input = `Title: Test

INT. HOUSE - DAY`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].text).toBe('INT. HOUSE - DAY');
    });

    it('parses EXT scene heading', () => {
      const input = `Title: Test

EXT. PARK - NIGHT`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].text).toBe('EXT. PARK - NIGHT');
    });

    it('parses EST scene heading', () => {
      const input = `EST. HOUSE - DAY`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].text).toBe('EST. HOUSE - DAY');
    });

    it('parses INT/EXT and I/E scene heading', () => {
      const input = `INT/EXT. CAR - NIGHT
I/E HOUSE - DAY`;
      const result = parseFountain(input);
      expect(result.elements[0].text).toBe('INT/EXT. CAR - NIGHT');
      expect(result.elements[1].text).toBe('I/E HOUSE - DAY');
    });

    it('parses forced scene heading with period', () => {
      const input = `Title: Test

.SNIPER SCOPE POV`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].text).toBe('SNIPER SCOPE POV');
    });

    it('parses scene numbers', () => {
      const input = `Title: Test

INT. HOUSE - DAY #1A#`;
      const result = parseFountain(input);
      expect(result.elements[0].scene_number).toBe('1A');
    });
  });

  describe('Characters and Dialogue', () => {
    it('parses character and dialogue', () => {
      const input = `Title: Test

JOHN
Hello, world!`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].text).toBe('JOHN');
      expect(result.elements[1].type).toBe('dialogue');
      expect(result.elements[1].text).toBe('Hello, world!');
    });

    it('parses forced character with @', () => {
      const input = `Title: Test

@McCLANE
Yippie ki-yay!`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].text).toBe('McCLANE');
    });

    it('parses character names with numbers and symbols', () => {
      const input = `MR. 10 (O.S.)
Hello.`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].text).toBe('MR. 10 (O.S.)');
    });

    it('handles forced character followed by empty line as action', () => {
      const input = `@NOT_A_CHARACTER
      
Action.`;
      const result = parseFountain(input);
      // It should be action because nextLine is '' during character check
      expect(result.elements[0].type).toBe('action');
    });

    it('parses parenthetical', () => {
      const input = `Title: Test

JOHN
(whispering)
Hello`;
      const result = parseFountain(input);
      expect(result.elements[1].type).toBe('parenthetical');
      expect(result.elements[2].type).toBe('dialogue');
    });

    it('parses dual dialogue', () => {
      const input = `Title: Test

BRICK
Screw retirement.

STEEL ^
Screw retirement.`;
      const result = parseFountain(input);
      expect(result.elements[0].dual).toBe('left');
      expect(result.elements[2].dual).toBe('right');
    });
  });

  describe('Transitions', () => {
    it('parses transition ending in TO:', () => {
      const input = `Title: Test

Some action.

CUT TO:

INT. NEW LOCATION - DAY`;
      const result = parseFountain(input);
      const transition = result.elements.find(e => e.type === 'transition');
      expect(transition).toBeDefined();
      expect(transition!.text).toBe('CUT TO:');
    });

    it('parses forced transition with >', () => {
      const input = `Title: Test

Some action.

>BURN TO WHITE.`;
      const result = parseFountain(input);
      const transition = result.elements.find(e => e.type === 'transition');
      expect(transition).toBeDefined();
    });
  });

  describe('Action', () => {
    it('parses basic action', () => {
      const input = `Title: Test

They drink beer.`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('action');
    });

    it('parses forced action with !', () => {
      const input = `Title: Test

!SCANNING THE AISLES
Where is that pit boss?`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('action');
      expect(result.elements[0].text).toBe('SCANNING THE AISLES');
    });

    it('preserves leading whitespace', () => {
      const input = `Title: Test

    Indented text`;
      const result = parseFountain(input);
      expect(result.elements[0].text).toBe('    Indented text');
    });
  });

  describe('Lyrics', () => {
    it('parses lyrics with ~', () => {
      const input = `Title: Test

~Willy Wonka! Willy Wonka!`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('lyric');
      expect(result.elements[0].text).toBe('Willy Wonka! Willy Wonka!');
    });
  });

  describe('Centered Text', () => {
    it('parses centered text with >...<', () => {
      const input = `Title: Test

>THE END<`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('centered');
      expect(result.elements[0].text).toBe('THE END');
    });
  });

  describe('Sections and Synopses', () => {
    it('parses section with depth', () => {
      const input = `Title: Test

## Act Two`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('section_heading');
      expect(result.elements[0].depth).toBe(2);
    });

    it('parses synopsis', () => {
      const input = `Title: Test

= This describes the scene.`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('synopsis');
    });
  });

  describe('Notes', () => {
    it('parses standalone note', () => {
      const input = `Title: Test

[[This is a note]]`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('note');
    });

    it('parses multi-line note', () => {
      const input = `[[This note spans
multiple lines]]`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('note');
      expect(result.elements[0].text).toContain('spans');
      expect(result.elements[0].text).toContain('multiple');
    });

    it('collapses double-space blank lines in notes to single space', () => {
      const input = `[[Note with
  
blank line]]`;
      const result = parseFountain(input);
      expect(result.elements[0].text).toBe('Note with blank line');
    });
  });

  describe('Page Break', () => {
    it('parses page break with ===', () => {
      const input = `Title: Test

===`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('page_break');
    });

    it('parses page break with 5+ equals', () => {
      const input = `Title: Test

=====`;
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('page_break');
    });
  });

  describe('Boneyard', () => {
    it('removes boneyard content', () => {
      const input = `Title: Test

Some action.
/* This is in the boneyard
IGNORED CHARACTER
Ignored dialogue.
*/
More action.`;
      const result = parseFountain(input);
      const ignored = result.elements.find(e => e.text?.includes('IGNORED'));
      expect(ignored).toBeUndefined();
    });
  });

  describe('Dialogue Continuation', () => {
    it('handles blank line with spaces in dialogue', () => {
      const input = `Title: Test

DEALER
Ten.
Four.
  
Hit or stand?`;
      const result = parseFountain(input);
      const dialogues = result.elements.filter(e => e.type === 'dialogue');
      expect(dialogues.length).toBeGreaterThan(3);
      const continued = dialogues.find(d => d.continued === true);
      expect(continued).toBeDefined();
    });
  });
});
