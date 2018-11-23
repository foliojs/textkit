import Run from './Run';

class GlyphRun extends Run {
  constructor(start, end, attributes, glyphs, positions, stringIndices, glyphIndices, preScaled) {
    super(start, end, attributes);

    this.glyphs = glyphs || [];
    this.positions = positions || [];
    this.glyphIndices = glyphIndices || [];
    this.stringIndices = stringIndices || [];
    this.scale = attributes.fontSize / attributes.font.unitsPerEm;

    if (!preScaled) {
      this.positions = this.positions.map((pos, index) => {
        const xAdvance =
          index === this.positions.length - 1
            ? pos.xAdvance * this.scale
            : pos.xAdvance * this.scale + attributes.characterSpacing;

        return {
          xAdvance,
          yAdvance: pos.yAdvance * this.scale,
          xOffset: pos.xOffset * this.scale,
          yOffset: pos.yOffset * this.scale
        };
      });
    }
  }

  get length() {
    return this.end - this.start;
  }

  get stringStart() {
    return 0;
  }

  get stringEnd() {
    return this.glyphIndices.length - 1;
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
    let glyphIndices = this.glyphIndices.filter(i => i >= start && i < end);

    glyphIndices = glyphIndices.map(index => index - start);
    stringIndices = stringIndices.map(index => index - this.stringIndices[start]);

    start += this.start;
    end += this.start;
    end = Math.min(end, this.end);

    return new GlyphRun(
      start,
      end,
      this.attributes,
      glyphs,
      positions,
      stringIndices,
      glyphIndices,
      true
    );
  }

  copy() {
    return new GlyphRun(
      this.start,
      this.end,
      this.attributes,
      [...this.glyphs],
      [...this.positions],
      [...this.stringIndices],
      [...this.glyphIndices],
      true
    );
  }
}

export default GlyphRun;
