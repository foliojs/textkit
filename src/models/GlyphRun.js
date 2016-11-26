import Run from './Run';
import Attachment from './Attachment';

export default class GlyphRun extends Run {
  constructor(start, end, attributes, run) {
    super(start, end, attributes);
    this.run = run;
    this.scale = attributes.fontSize / attributes.font.unitsPerEm;
  }

  get length() {
    return this.run.glyphs.length;
  }

  // @cache
  get advanceWidth() {
    return this.run.advanceWidth * this.scale;
  }

  // @cache
  get ascent() {
    let ascent = this.attributes.font.ascent * this.scale;
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
    return this.run.glyphs.some(g => g.codePoints[0] === Attachment.CODEPOINT);
  }

  slice(start, end) {
    start += this.start;
    end += this.start;
    end = Math.min(end, this.start + this.run.glyphs.length);

    let glyphs = this.run.glyphs.slice(start - this.start, end - this.start);
    let positions = this.run.positions.slice(start - this.start, end - this.start);
    let run = new this.run.constructor(glyphs, positions);
    return new GlyphRun(start, end, this.attributes, run);
  }
}
