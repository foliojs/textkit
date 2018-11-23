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

const runIndexAtGlyphIndex = (glyphRuns, index) => {
  let count = 0;

  for (let i = 0; i < glyphRuns.length; i++) {
    const run = glyphRuns[i];

    if (count <= index && index < count + run.glyphs.length) {
      return i;
    }

    count += run.glyphs.length;
  }

  return glyphRuns.length - 1;
};

const sliceRuns = (glyphRuns, start, end) => {
  if (glyphRuns.length === 0) return [];

  const startRunIndex = runIndexAtGlyphIndex(glyphRuns, start);
  const endRunIndex = runIndexAtGlyphIndex(glyphRuns, end);
  const startRun = glyphRuns[startRunIndex];
  const endRun = glyphRuns[endRunIndex];
  const runs = [];

  runs.push(startRun.slice(start - startRun.start, end - startRun.start));

  if (endRunIndex !== startRunIndex) {
    runs.push(...glyphRuns.slice(startRunIndex + 1, endRunIndex));

    if (end - endRun.start !== 0) {
      runs.push(endRun.slice(0, end - endRun.start));
    }
  }

  for (const run of runs) {
    run.start -= start;
    run.end -= start;
    run.stringIndices = run.stringIndices.map(s => s - start);
  }

  return runs;
};

const normalizeStringIndices = glyphRuns => {
  glyphRuns.forEach(run => {
    run.stringIndices = run.stringIndices.map(index => index - run.stringIndices[0]);
  });
  return glyphRuns;
};

class GlyphString {
  constructor(string, glyphRuns = []) {
    this.string = string;
    this.glyphRuns = normalizeStringIndices(glyphRuns);
  }

  get start() {
    if (this.glyphRuns.length === 0) return 0;
    return this.glyphRuns[0].start;
  }

  get end() {
    if (this.glyphRuns.length === 0) return 0;
    return this.glyphRuns[this.glyphRuns.length - 1].end;
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

  slice(start, end) {
    const stringStart = this.stringIndexForGlyphIndex(start);
    const stringEnd = this.stringIndexForGlyphIndex(end);
    const glyphRuns = sliceRuns(this.glyphRuns, start, end);

    const result = new GlyphString(this.string.slice(stringStart, stringEnd), glyphRuns);

    // Ligature splitting. If happens to slice in a ligature, we split create
    const previousGlyph = this.glyphAtIndex(start - 1);
    const lastGlyph = this.glyphAtIndex(end - 1);

    if (lastGlyph && lastGlyph.isLigature) {
      result.deleteGlyph(result.length - 1);
      result.insertGlyph(result.length, lastGlyph.codePoints[0]);
    }

    // Add the ligature remaining chars to result
    if (previousGlyph && previousGlyph.isLigature) {
      for (let i = 1; i < previousGlyph.codePoints.length; i++) {
        result.insertGlyph(i - 1, previousGlyph.codePoints[i]);
      }
    }

    return result;
  }

  runIndexAtGlyphIndex(index) {
    return runIndexAtGlyphIndex(this.glyphRuns, index);
  }

  runAtGlyphIndex(index) {
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

    return this.glyphRuns.length - 1;
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
    let count = 0;
    let offset = 0;

    for (let i = 0; i < this.glyphRuns.length; i++) {
      const run = this.glyphRuns[i];

      if (offset <= index && offset + run.length > index) {
        return count + run.stringIndices[index - run.start];
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

    if (nextIndex === -1) return -1;

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
    const { font, fontSize } = run.attributes;
    const glyph = run.attributes.font.glyphForCodePoint(codePoint);
    const scale = fontSize / font.unitsPerEm;
    const glyphIndex = this.start + index - run.start;

    if (this._end) this._end += 1;

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

    for (let i = runIndex + 1; i < this.glyphRuns.length; i++) {
      this.glyphRuns[i].start += 1;
      this.glyphRuns[i].end += 1;
    }

    this.glyphRunsCache = null;
  }

  deleteGlyph(index) {
    if (index < 0 || index >= this.length) return;

    const runIndex = this.runIndexAtGlyphIndex(index);
    const run = this.glyphRuns[runIndex];
    const glyphIndex = this.start + index - run.start;

    if (this._end) this._end -= 1;

    run.glyphs.splice(glyphIndex, 1);
    run.positions.splice(glyphIndex, 1);
    run.stringIndices.splice(glyphIndex, 1);

    for (let i = 0; i < run.glyphIndices.length; i++) {
      if (run.glyphIndices[i] >= glyphIndex) {
        run.glyphIndices[i] -= 1;
      }
    }

    run.end--;

    for (let i = runIndex + 1; i < this.glyphRuns.length; i++) {
      this.glyphRuns[i].start--;
      this.glyphRuns[i].end--;
    }

    this.glyphRunsCache = null;
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
