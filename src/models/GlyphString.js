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
  constructor(string, glyphRuns, start, end) {
    this.string = string;
    this._glyphRuns = glyphRuns;
    this.start = start || 0;
    this._end = end;
    this._glyphRunsCache = null;
    this._glyphRunsCacheEnd = null;
  }

  get glyphRuns() {
    if (this._glyphRunsCache && this._glyphRunsCacheEnd === this.end) {
      return this._glyphRunsCache;
    }

    let startRunIndex = this.runIndexAtGlyphIndex(this.start);
    let endRunIndex = this.runIndexAtGlyphIndex(this.end);

    let startRun = this._glyphRuns[startRunIndex];
    let endRun = this._glyphRuns[endRunIndex];

    let runs = [];

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

  get end() {
    if (this._end != null) {
      return this._end;
    }

    return this._glyphRuns.length > 0
      ? this._glyphRuns[this._glyphRuns.length - 1].end
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
    for (let i = 0; i < this._glyphRuns.length; i++) {
      if (this._glyphRuns[i].start <= index && index < this._glyphRuns[i].end) {
        return i;
      }
    }

    return this._glyphRuns.length - 1;
  }

  slice(start, end) {
    return new GlyphString(
      this.string.slice(this.stringIndexForGlyphIndex(start), this.stringIndexForGlyphIndex(end)),
      this._glyphRuns,
      start + this.start,
      end + this.start
    );
  }

  glyphAtIndex(index) {
    index += this.start;
    let runIndex = this.runIndexAtGlyphIndex(index);
    let run = this._glyphRuns[runIndex];
    return run.run.glyphs[index - run.start];
  }

  getGlyphWidth(index) {
    index += this.start;
    let runIndex = this.runIndexAtGlyphIndex(index);
    let run = this._glyphRuns[runIndex];
    return run.run.positions[index - run.start].xAdvance * run.scale;
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
        if (!glyph.inserted) {
          stringIndex += String.fromCodePoint(...glyph.codePoints).length;
        }
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
        if (stringIndex <= 0 && glyph.codePoints.length > 0) {
          return glyphIndex;
        }

        stringIndex -= String.fromCodePoint(...glyph.codePoints).length;
        glyphIndex++;
      }
    }

    return glyphIndex;
  }

  offsetAtGlyphIndex(glyphIndex) {
    let offset = 0;
    for (let run of this.glyphRuns) {
      for (let glyph of run.run.glyphs) {
        if (glyphIndex === 0) {
          return offset;
        }

        offset += glyph.advanceWidth * run.scale;
        glyphIndex--;
      }
    }

    return offset;
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

  insertGlyph(index, codePoint) {
    index += this.start;
    let runIndex = this.runIndexAtGlyphIndex(index);
    let run = this._glyphRuns[runIndex];

    let glyph = run.attributes.font.glyphForCodePoint(codePoint);
    glyph.inserted = true; // TODO: don't do this
    run.run.glyphs.splice(index - run.start, 0, glyph);
    run.run.positions.splice(index - run.start, 0, {
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
  }
}
