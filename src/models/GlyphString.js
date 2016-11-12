import unicode from 'unicode-properties';

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

  isWhiteSpace(index) {
    let glyph = this.glyphAtIndex(index);
    return glyph && unicode.isWhiteSpace(glyph.codePoints[0]);
  }
}
