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
    // let ascent = -Infinity;
    // for (let glyph of this.run.glyphs) {
    //   ascent = Math.max(ascent, glyph.ascent * this.scale);
    // }
    //
    // return ascent;
  }

  // @cache
  get descent() {
    return this.attributes.font.descent * this.scale;
    // let descent = Infinity;
    // for (let glyph of this.run.glyphs) {
    //   descent = Math.min(descent, glyph.descent * this.scale);
    // }
    //
    // return descent;
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
