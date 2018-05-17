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
    this.string = string;
    this._glyphRuns = glyphRuns;
    this.start = start || 0;
    this._end = end;
    this._glyphRunsCache = null;
    this._glyphRunsCacheEnd = null;
  }

  get end() {
    if (this._glyphRuns.length === 0) {
      return 0;
    }

    const glyphEnd = this._glyphRuns[this._glyphRuns.length - 1].end;

    if (this._end) {
      return Math.min(this._end, glyphEnd);
    }

    return this._glyphRuns.length > 0 ? glyphEnd : 0;
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

    if (this._glyphRuns.length === 0) {
      this._glyphRunsCache = [];
      this._glyphRunsCacheEnd = this.end;
      return [];
    }

    const startRunIndex = this.runIndexAtGlyphIndex(0);
    const endRunIndex = this.runIndexAtGlyphIndex(this.length);
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
    const stringStart = this.stringIndexForGlyphIndex(start);
    const stringEnd = this.stringIndexForGlyphIndex(end);

    return new GlyphString(
      this.string.slice(stringStart, stringEnd),
      this._glyphRuns,
      start + this.start,
      end + this.start
    );
  }

  runIndexAtGlyphIndex(index) {
    index += this.start;
    let count = 0;

    for (let i = 0; i < this._glyphRuns.length; i++) {
      const run = this._glyphRuns[i];

      if (count <= index && index < count + run.glyphs.length) {
        return i;
      }

      count += run.glyphs.length;
    }

    return this._glyphRuns.length - 1;
  }

  runAtGlyphIndex(index) {
    index += this.start;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      const run = this.glyphRuns[i];

      if (run.start <= index && run.end > index) {
        return run;
      }
    }

    return this.glyphRuns[this.glyphRuns.length - 1];
  }

  runIndexAtStringIndex(index) {
    let offset = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      const run = this.glyphRuns[i];

      if (offset + run.stringStart <= index && offset + run.stringEnd >= index) {
        return i;
      }

      offset += run.stringEnd;
    }

    return this._glyphRuns.length - 1;
  }

  runAtStringIndex(index) {
    return this.glyphRuns[this.runIndexAtStringIndex(index)];
  }

  glyphAtIndex(index) {
    const run = this.runAtGlyphIndex(index);
    return run.glyphs[this.start + index - run.start];
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

      if (offset <= index && offset + run.length > index) {
        return count + run.stringIndices[index + this.start - run.start];
      }

      offset += run.length;
      count += run.glyphIndices.length;
    }

    return count;
  }

  glyphIndexForStringIndex(index) {
    let run;
    let count = 0;
    let offset = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      run = this.glyphRuns[i];

      if (offset <= index && index < offset + run.stringEnd + 1) {
        return count + run.glyphIndices[index - offset];
      }

      count += run.glyphs.length;
      offset += run.stringEnd + 1;
    }

    return offset;
  }

  codePointAtGlyphIndex(glyphIndex) {
    return this.string.codePointAt(this.stringIndexForGlyphIndex(glyphIndex));
  }

  charAtGlyphIndex(glyphIndex) {
    return this.string.charAt(this.stringIndexForGlyphIndex(glyphIndex));
  }

  offsetAtGlyphIndex(glyphIndex) {
    let offset = 0;
    let count = glyphIndex;

    for (const run of this.glyphRuns) {
      for (let i = 0; i < run.glyphs.length; i++) {
        if (count === 0) {
          return offset;
        }

        offset += run.positions[i].xAdvance;
        count -= 1;
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
    const { font, fontSize } = run.attributes;
    const glyph = run.attributes.font.glyphForCodePoint(codePoint);
    const scale = fontSize / font.unitsPerEm;
    const glyphIndex = this.start + index - run.start;

    if (this._end) {
      this._end += 1;
    }

    run.glyphs.splice(glyphIndex, 0, glyph);
    run.stringIndices.splice(glyphIndex, 0, run.stringIndices[glyphIndex]);

    for (let i = 0; i < run.glyphIndices.length; i++) {
      if (run.glyphIndices[i] >= glyphIndex) {
        run.glyphIndices[i] += 1;
      }
    }

    run.positions.splice(glyphIndex, 0, {
      xAdvance: glyph.advanceWidth * scale,
      yAdvance: 0,
      xOffset: 0,
      yOffset: run.attributes.yOffset * font.unitsPerEm
    });

    run.end += 1;

    for (let i = runIndex + 1; i < this._glyphRuns.length; i++) {
      this._glyphRuns[i].start += 1;
      this._glyphRuns[i].end += 1;
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
    run.stringIndices.splice(glyphIndex, 1);

    for (let i = 0; i < run.glyphIndices.length; i++) {
      if (run.glyphIndices[i] >= glyphIndex) {
        run.glyphIndices[i] -= 1;
      }
    }

    run.end--;

    for (let i = runIndex + 1; i < this._glyphRuns.length; i++) {
      this._glyphRuns[i].start--;
      this._glyphRuns[i].end--;
    }

    this._glyphRunsCache = null;
  }

  *[Symbol.iterator]() {
    let x = 0;
    for (const run of this.glyphRuns) {
      for (let i = 0; i < run.glyphs.length; i++) {
        yield {
          glyph: run.glyphs[i],
          position: run.positions[i],
          run,
          x,
          index: run.start + i
        };

        x += run.positions[i].xAdvance;
      }
    }
  }
}

export default GlyphString;
