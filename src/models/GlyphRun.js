import Run from './Run';

class GlyphRun extends Run {
  constructor(start, end, attributes, glyphs, positions, stringIndices, preScaled) {
    super(start, end, attributes);
    this.glyphs = glyphs;
    this.positions = positions;
    this.stringIndices = stringIndices;
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
    return this.ascent - this.descent + this.lineGap;
  }

  slice(start, end) {
    const glyphStart = this.glyphIndices[start];
    let glyphEnd = this.glyphIndices[end];

    if (glyphEnd === undefined) {
      glyphEnd = this.glyphIndices[this.glyphIndices.length - 1] + 1;
    }

    let glyphs;
    let positions;
    let stringIndices;

    if (glyphEnd === 0) {
      glyphs = [this.glyphs[glyphStart]];
      positions = [this.positions[glyphStart]];
      stringIndices = [this.stringIndices[glyphStart]];
    } else {
      glyphs = this.glyphs.slice(glyphStart, glyphEnd);
      positions = this.positions.slice(glyphStart, glyphEnd);
      stringIndices = this.stringIndices.slice(glyphStart, glyphEnd);
    }

    stringIndices = stringIndices.map(index => index - this.stringIndices[glyphStart]);

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
