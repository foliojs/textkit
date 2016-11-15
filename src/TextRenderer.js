export default class TextRenderer {
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this.outlineBlocks = options.outlineBlocks || false;
    this.outlineLines = options.outlineLines || false;
    this.outlineRuns = options.outlineRuns || false;
  }

  render(container) {
    for (let block of container.blocks) {
      this.renderBlock(block);
    }
  }

  renderBlock(block) {
    if (this.outlineBlocks) {
      this.ctx.rect(block.bbox.minX, block.bbox.minY, block.bbox.width, block.bbox.height).stroke();
    }

    for (let line of block.lines) {
      this.renderLine(line);
    }
  }

  renderLine(line) {
    if (this.outlineLines) {
      this.ctx.rect(line.rect.x, line.rect.y, line.rect.width, line.rect.height).stroke();
    }

    this.ctx.save();
    this.ctx.translate(line.rect.x, line.rect.y + line.ascent);
    this.ctx.scale(1, -1, {});

    for (let run of line.glyphRuns) {
      this.renderRun(run);
    }

    this.ctx.restore();

    this.ctx.save();
    this.ctx.translate(line.rect.x, line.rect.y);

    for (let decorationLine of line.decorationLines) {
      this.renderDecorationLine(decorationLine);
    }

    this.ctx.restore();
  }

  renderRun(run) {
    if (this.outlineRuns) {
      this.ctx.rect(0, 0, run.advanceWidth, run.height).stroke();
    }

    let x = 0, y = 0;

    for (let i = 0; i < run.run.glyphs.length; i++) {
      let position = run.run.positions[i];

      this.ctx.save();
      this.ctx.translate(position.xOffset * run.scale, position.yOffset * run.scale);
      run.run.glyphs[i].render(this.ctx, run.attributes.fontSize);
      this.ctx.restore();

      this.ctx.translate(position.xAdvance * run.scale, position.yAdvance * run.scale);
    }
  }

  renderDecorationLine(line) {
    let y = line.y + Math.max(1, Math.ceil(line.thickness / 2));

    this.ctx.lineWidth(line.thickness);
    this.ctx.moveTo(line.startX, y);
    this.ctx.lineTo(line.endX, y);
    this.ctx.stroke(line.color);
  }
}
