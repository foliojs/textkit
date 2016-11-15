import GlyphString from './GlyphString';

export default class LineFragment extends GlyphString {
  constructor(rect, glyphString) {
    super(glyphString.string, glyphString.glyphRuns, glyphString.start, glyphString.end);
    this.rect = rect;
    this.decorationLines = [];
    this.overflowLeft = 0;
    this.overflowRight = 0;
  }

  addDecorationLine(line) {
    let last = this.decorationLines[this.decorationLines.length - 1];
    if (!last || !last.merge(line)) {
      this.decorationLines.push(line);
    }
  }
}
