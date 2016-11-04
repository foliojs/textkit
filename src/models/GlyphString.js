export default class GlyphString {
  constructor(string, glyphRuns) {
    this.string = string;
    this.glyphRuns = glyphRuns;
  }

  get length() {
    // TODO: fix
    return this.string.length;
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
    let startRunIndex = this.runIndexAtGlyphIndex(start);
    let endRunIndex = this.runIndexAtGlyphIndex(end);

    let startRun = this.glyphRuns[startRunIndex];
    let endRun = this.glyphRuns[endRunIndex];

    // console.log(start, end, startRunIndex, endRunIndex, startRun.start, endRun.start);


    let runs = [];

    runs.push(startRun.slice(start - startRun.start, end - startRun.start));
    // console.log(start - startRun.start, end - startRun.start)

    if (endRunIndex !== startRunIndex) {
      runs.push(...this.glyphRuns.slice(startRun + 1, endRun));

      if (end - endRun.start !== 0) {
        runs.push(endRun.slice(0, end - endRun.start));
      }
    }

    return new GlyphString(this.string.slice(start, end), runs);
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
}
