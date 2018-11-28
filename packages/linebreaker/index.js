import LineBreak from 'linebreak';

const HYPHEN = 0x002d;
const SHRINK_FACTOR = 0.04;

/**
 * A LineBreaker is used by the Typesetter to perform
 * Unicode line breaking and hyphenation.
 */
export default () => () =>
  class LineBreaker {
    suggestLineBreak(glyphString, syllables, availableWidths, paragraphStyle) {
      const width = availableWidths[0];
      const hyphenationFactor = paragraphStyle.hyphenationFactor || 0;
      const lines = [];

      // let string = glyphString;
      // let bk = this.findLineBreak(string, width, hyphenationFactor);

      // while (bk && bk.position !== 0) {
      //   lines.push(string.slice(0, bk.position));
      //   string = string.slice(bk.position, string.length);
      //   bk = this.findLineBreak(string, width, hyphenationFactor);
      // }

      // console.log(lines);

      return [glyphString];
    }

    // findLineBreak(glyphString, width, hyphenationFactor) {
    //   const glyphIndex = glyphString.glyphIndexAtOffset(width);

    //   if (glyphIndex === -1) return null;

    //   if (glyphIndex === glyphString.length) {
    //     return { position: glyphString.length, required: true };
    //   }

    //   let stringIndex = glyphString.stringIndexForGlyphIndex(glyphIndex);
    //   const bk = this.findBreakPreceeding(glyphString.string, stringIndex);

    //   if (bk) {
    //     let breakIndex = glyphString.glyphIndexForStringIndex(bk.position);

    //     if (
    //       bk.next != null &&
    //       this.shouldHyphenate(glyphString, breakIndex, width, hyphenationFactor)
    //     ) {
    //       const lineWidth = glyphString.offsetAtGlyphIndex(glyphIndex);
    //       const shrunk = lineWidth + lineWidth * SHRINK_FACTOR;

    //       const shrunkIndex = glyphString.glyphIndexAtOffset(shrunk);
    //       stringIndex = Math.min(bk.next, glyphString.stringIndexForGlyphIndex(shrunkIndex));

    //       const point = this.findHyphenationPoint(
    //         glyphString.string.slice(bk.position, bk.next),
    //         stringIndex - bk.position
    //       );

    //       if (point > 0) {
    //         bk.position += point;
    //         breakIndex = glyphString.glyphIndexForStringIndex(bk.position);

    //         if (bk.position < bk.next) {
    //           glyphString.insertGlyph(breakIndex++, HYPHEN);
    //         }
    //       }
    //     }

    //     bk.position = breakIndex;
    //   }

    //   return bk;
    // }

    // findBreakPreceeding(string, index) {
    //   const breaker = new LineBreak(string);
    //   let last = null;
    //   let bk = null;

    //   while ((bk = breaker.nextBreak())) {
    //     // console.log(bk);
    //     if (bk.position > index) {
    //       if (last) {
    //         last.next = bk.position;
    //       }

    //       return last;
    //     }

    //     if (bk.required) {
    //       return bk;
    //     }

    //     last = bk;
    //   }

    //   return null;
    // }

    // shouldHyphenate(glyphString, glyphIndex, width, hyphenationFactor) {
    //   const lineWidth = glyphString.offsetAtGlyphIndex(glyphIndex);
    //   return lineWidth / width < hyphenationFactor;
    // }

    // findHyphenationPoint(string, index) {
    //   const parts = hyphenator.hyphenate(string);
    //   let count = 0;

    //   for (const part of parts) {
    //     if (count + part.length > index) {
    //       break;
    //     }

    //     count += part.length;
    //   }

    //   return count;
    // }
  };
