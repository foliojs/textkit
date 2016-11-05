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
    this.ctx.translate(line.rect.x, line.rect.maxY);
    this.ctx.scale(1, -1, {});

    for (let run of line.runs) {
      this.renderRun(run);
    }

    this.ctx.restore();
  }

  renderRun(run) {
    if (this.outlineRuns) {
      this.ctx.rect(0, 0, run.advanceWidth, run.height).stroke();
    }

    for (let i = 0; i < run.run.glyphs.length; i++) {
      run.run.glyphs[i].render(this.ctx, run.attributes.fontSize);
      this.ctx.translate(run.run.positions[i].xAdvance * run.scale, 0)
    }
  }
}
