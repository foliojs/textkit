import unicode from 'unicode-properties';

// https://www.w3.org/TR/css-text-3/#hanging-punctuation
const HANGING_PUNCTUATION_START_CATEGORIES = new Set(['Ps', 'Pi', 'Pf']);
const HANGING_PUNCTUATION_END_CATEGORIES = new Set(['Pe', 'Pi', 'Pf']);
const HANGING_PUNCTUATION_END_CODEPOINTS = new Set([
  0x002c, // COMMA
  0x002e, // FULL STOP
  0x060c, // ARABIC COMMA
  0x06d4, // ARABIC FULL STOP
  0x3001, // IDEOGRAPHIC COMMA
  0x3002, // IDEOGRAPHIC FULL STOP
  0xff0c, // FULLWIDTH COMMA
  0xff0e, // FULLWIDTH FULL STOP
  0xfe50, // SMALL COMMA
  0xfe51, // SMALL IDEOGRAPHIC COMMA
  0xfe52, // SMALL FULL STOP
  0xff61, // HALFWIDTH IDEOGRAPHIC FULL STOP
  0xff64, // HALFWIDTH IDEOGRAPHIC COMMA
  0x002d // HYPHEN
]);

export default class GlyphString {
  constructor(string, glyphRuns) {
    this.string = string;
    this.glyphRuns = glyphRuns;
  }

  get end() {
    return this.glyphRuns.length > 0 ? this.glyphRuns[this.glyphRuns.length - 1].end : 0;
  }

  get length() {
    return this.string.length;
  }

  get advanceWidth() {
    return this.glyphRuns.reduce((acc, run) => acc + run.advanceWidth, 0);
  }

  get height() {
    return this.glyphRuns.reduce((acc, run) => Math.max(acc, run.height), 0);
  }

  get ascent() {
    return this.glyphRuns.reduce((acc, run) => Math.max(acc, run.ascent), 0);
  }

  get descent() {
    return this.glyphRuns.reduce((acc, run) => Math.min(acc, run.descent), 0);
  }

  runIndexAtGlyphIndex(index) {
    for (let i = 0; i < this.glyphRuns.length; i++) {
      if (this.glyphRuns[i].start <= index && index < this.glyphRuns[i].end) {
        return i;
      }
    }

    return this.glyphRuns.length - 1;
  }

  runAtGlyphIndex(index) {
    return this.glyphRuns[this.runIndexAtGlyphIndex(index)];
  }

  runIndexAtStringIndex(index) {
    index += this.glyphRuns[0].start;
    for (let i = 0; i < this.glyphRuns.length; i++) {
      if (this.glyphRuns[i].start <= index && index < this.glyphRuns[i].end) {
        return i;
      }
    }

    return this.glyphRuns.length - 1;
  }

  runAtStringIndex(index) {
    return this.glyphRuns[this.runIndexAtStringIndex(index)];
  }

  slice(start, end) {
    const startRunIndex = this.runIndexAtStringIndex(start);
    const endRunIndex = this.runIndexAtStringIndex(end - 1);
    const startRun = this.glyphRuns[startRunIndex];
    const endRun = this.glyphRuns[endRunIndex];
    const runs = [];

    runs.push(startRun.slice(start - startRun.start, end));

    if (startRunIndex !== endRunIndex) {
      runs.push(...this.glyphRuns.slice(startRunIndex + 1, endRunIndex).map(r => r.copy()));

      if (endRun.start !== 0) {
        runs.push(endRun.slice(0, end - endRun.start));
      }
    }

    for (const run of runs) {
      run.start -= start;
      run.end -= start;
    }

    return new GlyphString(this.string.slice(start, end), runs);
  }

  getGlyphWidth(index) {
    const run = this.runAtGlyphIndex(index);
    return run.positions[index - run.start].xAdvance;
  }

  glyphIndexAtOffset(width) {
    let offset = 0;
    let index = 0;

    for (const run of this.glyphRuns) {
      if (offset + run.advanceWidth > width) {
        for (const position of run.positions) {
          const w = position.xAdvance;
          if (offset + w > width) {
            return index;
          }

          offset += w;
          index++;
        }
      } else {
        offset += run.advanceWidth;
        index += run.glyphs.length;
      }
    }

    return index;
  }

  stringIndexForGlyphIndex(glyphIndex) {
    const run = this.runAtGlyphIndex(glyphIndex);
    if (glyphIndex >= run.end) {
      return -1;
    }
    return run.start + run.stringIndices[glyphIndex - run.start];
  }

  glyphIndexForStringIndex(stringIndex) {
    const run = this.runAtStringIndex(stringIndex);
    return run.start + run.glyphIndices[stringIndex - run.start];
  }

  codePointAtGlyphIndex(glyphIndex) {
    return this.string.codePointAt(this.stringIndexForGlyphIndex(glyphIndex));
  }

  charAtGlyphIndex(glyphIndex) {
    return this.string.charAt(this.stringIndexForGlyphIndex(glyphIndex));
  }

  offsetAtGlyphIndex(glyphIndex) {
    let offset = 0;
    for (const run of this.glyphRuns) {
      for (let i = 0; i < run.glyphs.length; i++) {
        if (glyphIndex === 0) {
          return offset;
        }

        offset += run.positions[i].xAdvance;
        glyphIndex--;
      }
    }

    return offset;
  }

  indexOf(string, index = 0) {
    const stringIndex = this.stringIndexForGlyphIndex(index);
    const nextIndex = this.string.indexOf(string, stringIndex);

    if (nextIndex === -1) {
      return this.length;
    }

    return this.glyphIndexForStringIndex(nextIndex);
  }

  getUnicodeCategory(index) {
    const codePoint = this.codePointAtGlyphIndex(index);
    return codePoint ? unicode.getCategory(codePoint) : null;
  }

  isWhiteSpace(index) {
    const codePoint = this.codePointAtGlyphIndex(index);
    return codePoint ? unicode.isWhiteSpace(codePoint) : false;
  }

  isHangingPunctuationStart(index) {
    return HANGING_PUNCTUATION_START_CATEGORIES.has(this.getUnicodeCategory(index));
  }

  isHangingPunctuationEnd(index) {
    return (
      HANGING_PUNCTUATION_END_CATEGORIES.has(this.getUnicodeCategory(index)) ||
      HANGING_PUNCTUATION_END_CODEPOINTS.has(this.codePointAtGlyphIndex(index))
    );
  }

  insertGlyph(index, codePoint) {
    const runIndex = this.runIndexAtGlyphIndex(index);
    const run = this.glyphRuns[runIndex];
    const glyph = run.attributes.font.glyphForCodePoint(codePoint);

    glyph.inserted = true; // TODO: don't do this
    run.glyphs.splice(index - run.start, 0, glyph);
    run.positions.splice(index - run.start, 0, {
      xAdvance: glyph.advanceWidth,
      yAdvance: 0,
      xOffset: 0,
      yOffset: 0
    });

    run.end++;

    for (let i = runIndex + 1; i < this.glyphRuns.length; i++) {
      this.glyphRuns[i].start++;
      this.glyphRuns[i].end++;
    }

    this.glyphRunsCache = null;
  }

  deleteGlyph(index) {
    if (index < 0 || index >= this.length) {
      return;
    }

    const runIndex = this.runIndexAtGlyphIndex(index);
    const run = this.glyphRuns[runIndex];
    const glyphIndex = index - run.start;

    run.glyphs.splice(glyphIndex, 1);
    run.positions.splice(glyphIndex, 1);

    // TODO: fix string indexes

    run.end--;

    for (let i = runIndex + 1; i < this.glyphRuns.length; i++) {
      this.glyphRuns[i].start--;
      this.glyphRuns[i].end--;
    }

    this.glyphRunsCache = null;
  }
}
