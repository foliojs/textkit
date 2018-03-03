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
    let width = 0;
    for (const run of this.glyphRuns) {
      width += run.advanceWidth;
    }

    return width;
  }

  get height() {
    let height = 0;
    for (const run of this.glyphRuns) {
      height = Math.max(height, run.height);
    }

    return height;
  }

  get ascent() {
    let height = 0;
    for (const run of this.glyphRuns) {
      height = Math.max(height, run.ascent);
    }

    return height;
  }

  get descent() {
    let height = 0;
    for (const run of this.glyphRuns) {
      height = Math.min(height, run.descent);
    }

    return height;
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

  runIndexAtGlyphIndex(index) {
    index += this.start;
    for (let i = 0; i < this._glyphRuns.length; i++) {
      if (this._glyphRuns[i].start <= index && index < this._glyphRuns[i].end) {
        return i;
      }
    }

    return this._glyphRuns.length - 1;
  }

  runAtGlyphIndex(index) {
    return this._glyphRuns[this.runIndexAtGlyphIndex(index)];
  }

  runIndexAtStringIndex(index) {
    index += this._glyphRuns[0].stringStart;
    for (let i = 0; i < this._glyphRuns.length; i++) {
      if (this._glyphRuns[i].stringStart <= index && index < this._glyphRuns[i].stringEnd) {
        return i;
      }
    }

    return this._glyphRuns.length - 1;
  }

  runAtStringIndex(index) {
    return this._glyphRuns[this.runIndexAtStringIndex(index)];
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
    const run = this.runAtGlyphIndex(index);
    return run.glyphs[this.start + index - run.start];
  }

  getGlyphWidth(index) {
    const run = this.runAtGlyphIndex(index);
    return run.positions[this.start + index - run.start].xAdvance;
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
    console.log(
      glyphIndex,
      run.start,
      this.start + glyphIndex - run.start,
      run.stringIndices.length,
      run.stringIndices[glyphIndex - run.start],
      this.glyphRuns[0].stringStart
    );
    return run.stringIndices[glyphIndex - run.start] - this.glyphRuns[0].stringStart;

    // let gid = glyphIndex;
    // if (glyphIndex === 0) {
    //   return 0;
    // }
    //
    // let stringIndex = 0;
    // let s = '';
    // for (let run of this.glyphRuns) {
    //   for (let glyph of run.glyphs) {
    //     if (!glyph.inserted) {
    //       stringIndex += String.fromCodePoint(...glyph.codePoints).length;
    //       s += String.fromCodePoint(...glyph.codePoints);
    //     }
    //     glyphIndex--;
    //
    //     if (glyphIndex === 0) {
    //       if (glyph.inserted) {
    //         console.log('stringIndexForGlyphIndex', s, gid, stringIndex, glyph.inserted, new Error().stack)
    //       }
    //       return stringIndex;
    //     }
    //   }
    // }
    //
    // console.log('stringIndexForGlyphIndex', s)
    // return stringIndex;
  }

  glyphIndexForStringIndex(stringIndex) {
    const run = this.runAtStringIndex(stringIndex);
    return run.glyphIndices[stringIndex - run.stringStart] - this.start;
    // if (stringIndex === 0) {
    //   return 0;
    // }
    //
    // let glyphIndex = 0;
    // for (let run of this.glyphRuns) {
    //   for (let glyph of run.glyphs) {
    //     if (glyph.inserted) {
    //       glyphIndex++;
    //       continue;
    //     }
    //
    //     if (stringIndex <= 0 && glyph.codePoints.length > 0) {
    //       return glyphIndex;
    //     }
    //
    //     stringIndex -= String.fromCodePoint(...glyph.codePoints).length;
    //     glyphIndex++;
    //   }
    // }
    //
    // return glyphIndex;
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
    const run = this._glyphRuns[runIndex];
    const glyph = run.attributes.font.glyphForCodePoint(codePoint);

    glyph.inserted = true; // TODO: don't do this
    run.glyphs.splice(this.start + index - run.start, 0, glyph);
    run.positions.splice(this.start + index - run.start, 0, {
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
