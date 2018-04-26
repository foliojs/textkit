import GraphemeBreaker from 'grapheme-breaker';

const ELLIPSIS = 0x2026;
const OFFSET_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1
};

/**
 * A TruncationEngine is used by a Typesetter to perform
 * line truncation and ellipsization.
 */
class TruncationEngine {
  truncate(lineFragment, mode = 'right') {
    let glyphIndex = Math.floor(lineFragment.length * OFFSET_FACTORS[mode]);

    // If mode is center, get the visual center instead of the index center.
    if (mode === 'center') {
      const offset = lineFragment.rect.width * OFFSET_FACTORS[mode];
      glyphIndex = lineFragment.glyphIndexAtOffset(offset);
    }

    let stringIndex = lineFragment.stringIndexForGlyphIndex(glyphIndex);
    const run = lineFragment.runAtGlyphIndex(glyphIndex);
    const font = run.attributes.font;
    const ellipsisGlyph = font.glyphForCodePoint(ELLIPSIS);
    const ellipsisWidth = ellipsisGlyph.advanceWidth;

    while (lineFragment.advanceWidth + ellipsisWidth > lineFragment.rect.width) {
      let nextGlyph;

      // Find the next grapheme cluster break
      if (mode === 'right') {
        stringIndex = GraphemeBreaker.previousBreak(lineFragment.string, stringIndex);
        nextGlyph = lineFragment.glyphIndexForStringIndex(stringIndex);
      } else {
        const nextStringIndex = GraphemeBreaker.nextBreak(lineFragment.string, stringIndex);
        nextGlyph = lineFragment.glyphIndexForStringIndex(nextStringIndex) - 1;
      }

      // Delete the cluster
      const min = Math.min(glyphIndex, nextGlyph, lineFragment.length - 1);
      const max = Math.min(Math.max(glyphIndex, nextGlyph), lineFragment.length - 1);

      for (let i = max; i >= min; i--) {
        lineFragment.deleteGlyph(i);
      }

      if (mode === 'right') {
        glyphIndex = nextGlyph;
      }
    }

    // Insert ellpisis
    lineFragment.insertGlyph(glyphIndex, ELLIPSIS);

    // Remove whitespace on either side of the ellipsis
    for (let i = glyphIndex + 1; lineFragment.isWhiteSpace(i); i++) {
      lineFragment.deleteGlyph(i);
    }

    for (let i = glyphIndex - 1; lineFragment.isWhiteSpace(i); i--) {
      lineFragment.deleteGlyph(i);
    }
  }
}

export default () => TruncationEngine;
