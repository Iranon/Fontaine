export function getScreenplayCss(): string {
  return `
    body {
      font-family: 'Courier Prime', 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 1in;
      background-color: #f5f5f5;
      color: #000;
    }
    .script-container {
      background-color: white;
      padding: 1in;
      min-height: 11in;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      position: relative;
    }
    
    /* Title Page */
    .title-page {
      display: flex;
      flex-direction: column;
      height: 9in;
      justify-content: space-between;
      margin-bottom: 2in;
      page-break-after: always;
      text-align: center;
    }
    .title-section {
      margin-top: 3.5in;
    }
    .title-section h1 {
      font-weight: bold;
      font-size: 12pt;
      line-height: 1.2;
      margin: 0 0 1em 0;
      text-transform: uppercase;
    }
    .credit { margin-bottom: 1em; }
    .author { margin-bottom: 1em; }
    .source { margin-bottom: 1em; }
    
    .bottom-section {
      text-align: left;
      margin-bottom: 0;
      width: 100%;
    }
    .contact { 
      margin-top: 1em;
      white-space: pre-wrap;
    }
    .draft-date {
      margin-bottom: 1em;
    }

    /* Scene Heading */
    .scene-heading {
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 2em;
      margin-bottom: 1em;
      position: relative;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    .scene-number {
      position: absolute;
      right: 0;
      font-weight: normal;
    }

    /* Action */
    .action {
      margin-bottom: 1em;
      white-space: pre-wrap;
    }

    /* Character */
    .character {
      margin-top: 1em;
      margin-bottom: 0;
      margin-left: 40%;
      width: 50%;
      text-transform: uppercase;
      page-break-after: avoid;
    }

    /* Dialogue */
    .dialogue {
      margin-bottom: 1em;
      margin-left: 25%;
      width: 60%;
    }
    .dialogue-break {
      margin-bottom: 0.5em;
      margin-top: 0.5em;
    }

    /* Parenthetical */
    .parenthetical {
      margin-bottom: 0;
      margin-left: 30%;
      width: 80%;
      page-break-before: avoid;
      page-break-after: avoid;
    }

    /* Transition */
    .transition {
      text-align: right;
      text-transform: uppercase;
      margin-top: 1em;
      margin-bottom: 1em;
    }

    /* Centered */
    .centered {
      text-align: center;
      margin-bottom: 1em;
    }

    /* Page Break */
    .page-break {
      border-bottom: 2px dashed #666;
      margin: 2em 0;
      page-break-after: always;
      height: 0;
    }
    .page-break + * {
      margin-top: 1in;
    }

    /* Suppress redundant page break immediately after title page */
    .title-page + .page-break {
      display: none;
      page-break-after: none;
    }

    /* Lyric */
    .lyric {
      font-style: italic;
      margin-left: 15%;
      margin-bottom: 0.5em;
    }

    /* Section Headings (outline, not printed) */
    .section-heading {
      color: #666;
      font-weight: normal;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    .section-1 { font-size: 1.2em; }
    .section-2 { font-size: 1.1em; }
    .section-3 { font-size: 1em; }
    .section-4 { font-size: 0.95em; }
    .section-5 { font-size: 0.9em; }
    .section-6 { font-size: 0.85em; }

    /* Synopsis (outline, not printed) */
    .synopsis {
      color: #888;
      font-style: italic;
      margin-bottom: 0.5em;
    }
    .synopsis::before {
      content: '= ';
    }

    /* Notes */
    .note {
      display: none;
    }
    .note-inline {
      background-color: #fff8c5;
      color: #666;
      font-size: 0.85em;
      padding: 0 0.25em;
      border-radius: 2px;
    }

    /* Dual Dialogue */
    .dual-dialogue-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1em;
      page-break-inside: avoid;
    }
    .dual-left, .dual-right {
      width: 45%;
    }
    .dual-left .character, .dual-right .character {
      margin-left: 0;
      width: 100%;
      text-align: center;
    }
    .dual-left .dialogue, .dual-right .dialogue {
      margin-left: 0;
      width: 100%;
    }
    .dual-left .parenthetical, .dual-right .parenthetical {
      margin-left: 10%;
      width: 80%;
    }

    /* Print styles */
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .script-container {
        box-shadow: none;
        padding: 0;
      }
      .section-heading,
      .synopsis,
      .note,
      .note-inline {
        display: none !important;
      }
      .page-break {
        border: none;
        page-break-after: always;
      }
      .title-page + .page-break {
        display: none !important;
        page-break-after: none;
      }
    }
  `;
}
