import Run from './Run';
import Attachment from './Attachment';

export default class GlyphRun extends Run {
  constructor(start, end, attributes, glyphs, positions, stringIndices, preScaled) {
    super(start, end, attributes);
    // this.run = run;
    this.glyphs = glyphs;
    this.positions = positions;
    this.stringIndices = stringIndices;
    this.scale = attributes.fontSize / attributes.font.unitsPerEm;

    this.stringStart = Math.min(...stringIndices);
    this.stringEnd = Math.max(...stringIndices);

    this.glyphIndices = [];

    for (let i = 0; i < stringIndices.length; i++) {
      this.glyphIndices[stringIndices[i]] = i;
    }

    if (!preScaled) {
      for (const pos of this.positions) {
        pos.xAdvance *= this.scale;
        pos.yAdvance *= this.scale;
        pos.xOffset *= this.scale;
        pos.yOffset *= this.scale;
      }
    }
  }

  get length() {
    return this.glyphs.length;
  }

  // @cache
  get advanceWidth() {
    let width = 0;
    for (const position of this.positions) {
      width += position.xAdvance;
    }

    return width;
  }

  // @cache
  get ascent() {
    const ascent = this.attributes.font.ascent * this.scale;
    if (this.attributes.attachment && this.hasAttachmentGlyphs) {
      return Math.max(ascent, this.attributes.attachment.height);
    }

    return ascent;
  }

  // @cache
  get descent() {
    return this.attributes.font.descent * this.scale;
  }

  // @cache
  get lineGap() {
    return this.attributes.font.lineGap * this.scale;
  }

  get height() {
    return this.ascent - this.descent + this.lineGap;
  }

  get hasAttachmentGlyphs() {
    return this.glyphs.some(g => g.codePoints[0] === Attachment.CODEPOINT);
  }

  slice(start, end) {
    start += this.start;
    end += this.start;
    end = Math.min(end, this.start + this.glyphs.length);

    const glyphs = this.glyphs.slice(start - this.start, end - this.start);
    const positions = this.positions.slice(start - this.start, end - this.start);
    const stringIndices = this.stringIndices.slice(start - this.start, end - this.start);
    // let run = new this.run.constructor(glyphs, positions);

    return new GlyphRun(start, end, this.attributes, glyphs, positions, stringIndices, true);
  }
}
