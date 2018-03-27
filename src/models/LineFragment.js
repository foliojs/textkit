import GlyphString from './GlyphString';

export default class LineFragment extends GlyphString {
  constructor(rect, glyphString) {
    super(glyphString.string, glyphString._glyphRuns, glyphString.start, glyphString.end);
    this.rect = rect;
    this.decorationLines = [];
    this.overflowLeft = 0;
    this.overflowRight = 0;
  }
}
