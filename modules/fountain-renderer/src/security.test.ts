
import { describe, it, expect } from 'bun:test';
import { renderHtml } from './renderer.js';
import type { FountainScript, FountainElement } from 'fountain-parser';

describe('Security', () => {
    const XSS_PAYLOAD = '<script>alert("xss")</script>';
    const ESCAPED_PAYLOAD = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
    const ATTRIBUTE_PAYLOAD = '"><img src=x onerror=alert(1)>';
    const ESCAPED_ATTRIBUTE = '&quot;&gt;&lt;img src=x onerror=alert(1)&gt;';

    it('should escape HTML in scene numbers', () => {
        const script: FountainScript = {
            title: 'Test',
            elements: [
                {
                    type: 'scene_heading',
                    text: 'EXT. TEST - DAY',
                    scene_number: XSS_PAYLOAD
                }
            ]
        };

        const html = renderHtml(script);
        expect(html).not.toContain(XSS_PAYLOAD);
        expect(html).toContain(ESCAPED_PAYLOAD);
    });

    it('should escape HTML in title page fields', () => {
        const script: FountainScript = {
            title: XSS_PAYLOAD,
            credit: XSS_PAYLOAD,
            author: XSS_PAYLOAD,
            source: XSS_PAYLOAD,
            draft_date: XSS_PAYLOAD,
            contact: XSS_PAYLOAD,
            elements: []
        };
        const html = renderHtml(script);
        
        expect(html).not.toContain(XSS_PAYLOAD);
        expect(html).toContain(ESCAPED_PAYLOAD);
        expect(html).not.toMatch(/<script>/i);
    });

    const elementTypes = [
        'scene_heading', 
        'action', 
        'character', 
        'dialogue', 
        'parenthetical', 
        'transition', 
        'centered', 
        'section_heading', 
        'synopsis', 
        'note', 
        'lyric'
    ] as const;

    elementTypes.forEach(type => {
        it(`should escape HTML in ${type} elements`, () => {
             const element: FountainElement = {
                type: type,
                text: XSS_PAYLOAD
            };
            
            // Special handling for extra properties
            if (type === 'scene_heading') {
                element.scene_number = XSS_PAYLOAD;
            }
            if (type === 'section_heading') {
                element.depth = 1;
            }

            const script: FountainScript = {
                elements: [element]
            };

            const html = renderHtml(script);

            expect(html).not.toContain(XSS_PAYLOAD);
            
            // page_break has no text content usually (or it is ignored) but let's stick to the list above which doesn't include page_break
            expect(html).toContain(ESCAPED_PAYLOAD);
            
            // Check scene number specifically if applicable
            if (type === 'scene_heading') {
                // It renders scene number separately
                 expect(html).toContain(ESCAPED_PAYLOAD); // Matches scene number too because it's same payload
            }
        });
    });

    it('should escape HTML in dual dialogue', () => {
        const script: FountainScript = {
            elements: [
                { type: 'character', text: XSS_PAYLOAD, dual: 'left' },
                { type: 'dialogue', text: XSS_PAYLOAD },
                { type: 'character', text: XSS_PAYLOAD, dual: 'right' },
                { type: 'dialogue', text: XSS_PAYLOAD }
            ]
        };
        const html = renderHtml(script);
        expect(html).not.toContain(XSS_PAYLOAD);
        expect(html).toContain(ESCAPED_PAYLOAD);
    });
    
    it('should handle attribute injection attempts', () => {
        const script: FountainScript = {
            elements: [
                { type: 'action', text: ATTRIBUTE_PAYLOAD }
            ]
        };
        const html = renderHtml(script);
        expect(html).not.toContain(ATTRIBUTE_PAYLOAD);
        expect(html).toContain(ESCAPED_ATTRIBUTE);
    });
});
