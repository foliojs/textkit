import Run from './Run';

export default class GlyphRun extends Run {
  constructor(start, end, attributes, run) {
    super(start, end, attributes);
    this.run = run;
    this.scale = attributes.fontSize / attributes.font.unitsPerEm;
  }

  // @cache
  get advanceWidth() {
    return this.run.advanceWidth * this.scale;
  }

  // @cache
  get ascent() {
    return this.attributes.font.ascent * this.scale;
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
