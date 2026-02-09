export type ElementType = 
| 'scene_heading'
| 'action'
| 'character'
| 'dialogue'
| 'parenthetical'
| 'transition'
| 'centered'
| 'page_break'
| 'section_heading'
| 'synopsis'
| 'note'
| 'boneyard'
| 'lyric';

export type DualDialogue = 'left' | 'right';

export interface FountainElement {
  type: ElementType;
  text: string;
  scene_number?: string;
  dual?: DualDialogue;
  depth?: number; // For section headings (1-6)
  continued?: boolean; // For dialogue continuation
}

/**
 * Title page properties as defined by Fountain spec.
 * Standard properties are: Title, Credit, Author/Authors, Source,
 * Draft date, Contact, Copyright, Notes
 */
export interface FountainScript {
  // Title page properties
  title?: string;
  credit?: string;
  author?: string;
  authors?: string;
  source?: string;
  draft_date?: string;
  contact?: string;
  copyright?: string;
  notes?: string;
  
  // Script content
  elements: FountainElement[];
  
  // Allow additional custom title page properties
  [key: string]: string | FountainElement[] | undefined;
}
