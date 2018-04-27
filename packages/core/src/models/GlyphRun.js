import Run from './Run';

class GlyphRun extends Run {
  constructor(start, end, attributes, glyphs, positions, stringIndices, preScaled) {
    super(start, end, attributes);
    this.glyphs = glyphs || [];
    this.positions = positions || [];
    this.stringIndices = stringIndices || [];
    this.scale = attributes.fontSize / attributes.font.unitsPerEm;
    this._glyphIndices = null;

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
    return this.end - this.start;
  }

  get glyphIndices() {
    if (this._glyphIndices) {
      return this._glyphIndices;
    }

    const glyphIndices = [];

    for (let i = 0; i < this.stringIndices.length; i++) {
      glyphIndices[this.stringIndices[i]] = i;
    }

    let lastValue = 0;
    for (let i = glyphIndices.length - 1; i >= 0; i--) {
      if (glyphIndices[i] === undefined) {
        glyphIndices[i] = lastValue;
      } else {
        lastValue = glyphIndices[i];
      }
    }

    this._glyphIndices = glyphIndices;
    return glyphIndices;
  }

  get stringStart() {
    return Math.min(...this.stringIndices);
  }

  get stringEnd() {
    return Math.max(...this.stringIndices);
  }

  get advanceWidth() {
    let width = 0;
    for (const position of this.positions) {
      width += position.xAdvance;
    }

    return width;
  }

  get ascent() {
    const ascent = this.attributes.font.ascent * this.scale;

    if (this.attributes.attachment) {
      return Math.max(ascent, this.attributes.attachment.height);
    }

    return ascent;
  }

  get descent() {
    return this.attributes.font.descent * this.scale;
  }

  get lineGap() {
    return this.attributes.font.lineGap * this.scale;
  }

  get height() {
    return this.attributes.lineHeight || this.ascent - this.descent + this.lineGap;
  }

  slice(start, end) {
    const glyphs = this.glyphs.slice(start, end);
    const positions = this.positions.slice(start, end);
    let stringIndices = this.stringIndices.slice(start, end);

    stringIndices = stringIndices.map(index => index - this.stringIndices[start]);

    start += this.start;
    end += this.start;
    end = Math.min(end, this.end);

    return new GlyphRun(start, end, this.attributes, glyphs, positions, stringIndices, true);
  }

  copy() {
    return new GlyphRun(
      this.start,
      this.end,
      this.attributes,
      this.glyphs,
      this.positions,
      this.stringIndices,
      true
    );
  }
}

export default GlyphRun;
