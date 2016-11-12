import unicode from 'unicode-properties';

// https://www.w3.org/TR/css-text-3/#hanging-punctuation
const HANGING_PUNCTUATION_START_CATEGORIES = new Set(['Ps', 'Pi', 'Pf']);
const HANGING_PUNCTUATION_END_CATEGORIES = new Set(['Pe', 'Pi', 'Pf']);
const HANGING_PUNCTUATION_END_CODEPOINTS = new Set([
  0x002C, // COMMA
  0x002E, // FULL STOP
  0x060C, // ARABIC COMMA
  0x06D4, // ARABIC FULL STOP
  0x3001, // IDEOGRAPHIC COMMA
  0x3002, // IDEOGRAPHIC FULL STOP
  0xFF0C, // FULLWIDTH COMMA
  0xFF0E, // FULLWIDTH FULL STOP
  0xFE50, // SMALL COMMA
  0xFE51, // SMALL IDEOGRAPHIC COMMA
  0xFE52, // SMALL FULL STOP
  0xFF61, // HALFWIDTH IDEOGRAPHIC FULL STOP
  0xFF64, // HALFWIDTH IDEOGRAPHIC COMMA
]);

export default class GlyphString {
  constructor(string, glyphRuns) {
    this.string = string;
    this.glyphRuns = glyphRuns;
  }

  get start() {
    return this.glyphRuns.length > 0
      ? this.glyphRuns[0].start
      : 0;
  }

  get end() {
    return this.glyphRuns.length > 0
      ? this.glyphRuns[this.glyphRuns.length - 1].end
      : 0;
  }

  get length() {
    return this.end - this.start;
  }

  get advanceWidth() {
    let width = 0;
    for (let run of this.glyphRuns) {
      width += run.advanceWidth;
    }

    return width;
  }

  get height() {
    let height = 0;
    for (let run of this.glyphRuns) {
      height = Math.max(height, run.height);
    }

    return height;
  }

  runIndexAtGlyphIndex(index) {
    for (let i = 0; i < this.glyphRuns.length; i++) {
      if (this.glyphRuns[i].start <= index && index < this.glyphRuns[i].end) {
        return i;
      }
    }

    return this.glyphRuns.length - 1;
  }

  slice(start, end) {
    start += this.start;
    end += this.start;

    let startRunIndex = this.runIndexAtGlyphIndex(start);
    let endRunIndex = this.runIndexAtGlyphIndex(end);

    let startRun = this.glyphRuns[startRunIndex];
    let endRun = this.glyphRuns[endRunIndex];

    let runs = [];

    runs.push(startRun.slice(start - startRun.start, end - startRun.start));

    if (endRunIndex !== startRunIndex) {
      runs.push(...this.glyphRuns.slice(startRunIndex + 1, endRunIndex));

      if (end - endRun.start !== 0) {
        runs.push(endRun.slice(0, end - endRun.start));
      }
    }

    return new GlyphString(this.string.slice(this.stringIndexForGlyphIndex(start - this.start), this.stringIndexForGlyphIndex(end - this.start)), runs);
  }

  glyphAtIndex(index) {
    index += this.start;
    let runIndex = this.runIndexAtGlyphIndex(index);
    let run = this.glyphRuns[runIndex];
    return run.run.glyphs[index - run.start];
  }

  getGlyphWidth(index) {
    index += this.start;
    let runIndex = this.runIndexAtGlyphIndex(index);
    let run = this.glyphRuns[runIndex];
    return run.run.glyphs[index - run.start].advanceWidth * run.scale;
  }

  glyphIndexAtOffset(width) {
    let offset = 0;
    let index = 0;
    for (let run of this.glyphRuns) {
      if (offset + run.advanceWidth > width) {
        for (let position of run.run.positions) {
          let w = position.xAdvance * run.scale;
          if (offset + w > width) {
            return index;
          } else {
            offset += w;
            index++;
          }
        }
      } else {
        offset += run.advanceWidth;
        index += run.run.glyphs.length;
      }
    }

    return index;
  }

  stringIndexForGlyphIndex(glyphIndex) {
    if (glyphIndex === 0) {
      return 0;
    }

    let stringIndex = 0;
    for (let run of this.glyphRuns) {
      for (let glyph of run.run.glyphs) {
        stringIndex += String.fromCodePoint(...glyph.codePoints).length;
        glyphIndex--;

        if (glyphIndex === 0) {
          return stringIndex;
        }
      }
    }

    return stringIndex;
  }

  glyphIndexForStringIndex(stringIndex) {
    if (stringIndex === 0) {
      return 0;
    }

    let glyphIndex = 0;
    for (let run of this.glyphRuns) {
      for (let glyph of run.run.glyphs) {
        stringIndex -= String.fromCodePoint(...glyph.codePoints).length;
        glyphIndex++;

        if (stringIndex <= 0) {
          return glyphIndex;
        }
      }
    }

    return glyphIndex;
  }

  getUnicodeCategory(index) {
    let glyph = this.glyphAtIndex(index);
    return glyph ? unicode.getCategory(glyph.codePoints[0]) : null;
  }

  isWhiteSpace(index) {
    let glyph = this.glyphAtIndex(index);
    return glyph && unicode.isWhiteSpace(glyph.codePoints[0]);
  }

  isHangingPunctuationStart(index) {
    return HANGING_PUNCTUATION_START_CATEGORIES.has(this.getUnicodeCategory(index));
  }

  isHangingPunctuationEnd(index) {
    return HANGING_PUNCTUATION_END_CATEGORIES.has(this.getUnicodeCategory(index))
      || HANGING_PUNCTUATION_END_CODEPOINTS.has(this.glyphAtIndex(index).codePoints[0]);
  }
}
