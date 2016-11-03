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

    return runs;
  }
}
