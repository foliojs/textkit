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

class GlyphString {
  constructor(string, glyphRuns, start, end) {
    this._string = string;
    this._glyphRuns = glyphRuns;
    this.start = start || 0;
    this._end = end;
    this._glyphRunsCache = null;
    this._glyphRunsCacheEnd = null;
  }

  get string() {
    return this._string.slice(this.start, this.end);
  }

  get end() {
    if (this._end != null) {
      return this._end;
    }

    return this._glyphRuns.length > 0 ? this._glyphRuns[this._glyphRuns.length - 1].end : 0;
  }

  get length() {
    return this.end - this.start;
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

  get glyphRuns() {
    if (this._glyphRunsCache && this._glyphRunsCacheEnd === this.end) {
      return this._glyphRunsCache;
    }

    const startRunIndex = this.runIndexAtStringIndex(0);
    const endRunIndex = this.runIndexAtStringIndex(this.length);
    const startRun = this._glyphRuns[startRunIndex];
    const endRun = this._glyphRuns[endRunIndex];
    const runs = [];

    runs.push(startRun.slice(this.start - startRun.start, this.end - startRun.start));

    if (endRunIndex !== startRunIndex) {
      runs.push(...this._glyphRuns.slice(startRunIndex + 1, endRunIndex));

      if (this.end - endRun.start !== 0) {
        runs.push(endRun.slice(0, this.end - endRun.start));
      }
    }

    this._glyphRunsCache = runs;
    this._glyphRunsCacheEnd = this.end;
    return runs;
  }

  slice(start, end) {
    return new GlyphString(this._string, this._glyphRuns, start + this.start, end + this.start);
  }

  runIndexAtGlyphIndex(index) {
    let count = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      const run = this.glyphRuns[i];

      if (count <= index && index < count + run.glyphs.length) {
        return i;
      }

      count += run.glyphs.length;
    }

    return this.glyphRuns.length - 1;
  }

  runAtGlyphIndex(index) {
    return this._glyphRuns[this.runIndexAtGlyphIndex(index)];
  }

  runIndexAtStringIndex(index) {
    const idx = index + this._glyphRuns[0].start + this.start;

    for (let i = 0; i < this._glyphRuns.length; i++) {
      if (this._glyphRuns[i].start <= idx && idx < this._glyphRuns[i].end) {
        return i;
      }
    }

    return this._glyphRuns.length - 1;
  }

  runAtStringIndex(index) {
    return this._glyphRuns[this.runIndexAtStringIndex(index)];
  }

  glyphAtIndex(index) {
    let run;
    let count = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      run = this.glyphRuns[i];

      if (count <= index && index < count + run.glyphs.length) {
        return run.glyphs[index - count];
      }

      count += run.glyphs.length;
    }

    return run.glyphs[run.glyphs.length - 1];
  }

  positionAtIndex(index) {
    let run;
    let count = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      run = this.glyphRuns[i];

      if (count <= index && index < count + run.positions.length) {
        return run.positions[index - count];
      }

      count += run.positions.length;
    }

    return run.positions[run.positions.length - 1];
  }

  getGlyphWidth(index) {
    return this.positionAtIndex(index).xAdvance;
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

  stringIndexForGlyphIndex(index) {
    let run;
    let count = 0;
    let offset = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      run = this.glyphRuns[i];

      if (count <= index && index < count + run.glyphs.length) {
        return offset + run.stringIndices[index - count];
      }

      offset += run.stringEnd + 1;
      count += run.glyphs.length;
    }

    return run.stringIndices[run.stringIndices.length - 1];
  }

  glyphIndexForStringIndex(index) {
    let run;
    let count = 0;
    let offset = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      run = this.glyphRuns[i];

      if (count <= index && index < count + run.length) {
        return offset + run.glyphIndices[index - count];
      }

      count += run.length;
      offset += run.glyphs.length;
    }

    return run.glyphIndices[run.glyphIndices.length - 1];
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
      return -1;
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
    const run = this._glyphRuns[runIndex];
    const glyph = run.attributes.font.glyphForCodePoint(codePoint);
    const idx = this.start + index - run.start;

    run.glyphs.splice(idx, 0, glyph);
    run.glyphIndices.splice(idx, 0, run.glyphIndices[idx]);
    run.stringIndices.splice(idx, 0, run.stringIndices[idx]);
    run.positions.splice(idx, 0, {
      xAdvance: glyph.advanceWidth,
      yAdvance: 0,
      xOffset: 0,
      yOffset: 0
    });

    run.end++;

    for (let i = runIndex + 1; i < this._glyphRuns.length; i++) {
      this._glyphRuns[i].start++;
      this._glyphRuns[i].end++;
    }

    if (this._end != null) {
      this._end++;
    }

    this._glyphRunsCache = null;
  }

  deleteGlyph(index) {
    if (index < 0 || index >= this.length) {
      return;
    }

    const runIndex = this.runIndexAtGlyphIndex(index);
    const run = this._glyphRuns[runIndex];
    const glyphIndex = this.start + index - run.start;

    run.glyphs.splice(glyphIndex, 1);
    run.positions.splice(glyphIndex, 1);

    // TODO: fix string indexes

    run.end--;

    for (let i = runIndex + 1; i < this._glyphRuns.length; i++) {
      this._glyphRuns[i].start--;
      this._glyphRuns[i].end--;
    }

    if (this._end != null) {
      this._end--;
    }

    this._glyphRunsCache = null;
  }
}

export default GlyphString;
