export default class LineFragment {
  constructor(rect, glyphString) {
    this.rect = rect;
    this.runs = glyphString.glyphRuns;
  }

  // @cache
  get advanceWidth() {
    let width = 0;
    for (let run of this.runs) {
      width += run.advanceWidth;
    }

    return width;
  }

  // @cache
  get height() {
    let height = 0;
    for (let run of this.runs) {
      height = Math.max(height, run.height);
    }

    return height;
  }
}
