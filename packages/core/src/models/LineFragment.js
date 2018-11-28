import GlyphString from './GlyphString';

export default class LineFragment extends GlyphString {
  constructor(rect, glyphString) {
    super(glyphString.string, glyphString.glyphRuns);

    this.rect = rect;
    this.decorationLines = [];
    this.overflowLeft = 0;
    this.overflowRight = 0;
    this.stringStart = null;
    this.stringEnd = null;
  }
}
