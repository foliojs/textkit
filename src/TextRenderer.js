/**
 * A TextRenderer renders text layout objects to a graphics context.
 */
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
    this.ctx.lineWidth(line.rect.height);

    if (/dashed/.test(line.style)) {
      this.ctx.dash(3 * line.rect.height);
    } else if (/dotted/.test(line.style)) {
      this.ctx.dash(line.rect.height);
    }

    if (/wavy/.test(line.style)) {
      let dist = Math.max(2, line.rect.height);
      let step = 1.1 * dist;
      let stepCount = Math.floor(line.rect.width / (2 * step));

      // Adjust step to fill entire width
      let remainingWidth = line.rect.width - (stepCount * 2 * step);
      let adjustment = remainingWidth / stepCount / 2;
      step += adjustment;

      let cp1y = line.rect.y + dist;
      let cp2y = line.rect.y - dist;
      let x = line.rect.x;

      this.ctx.moveTo(line.rect.x, line.rect.y);

      for (let i = 0; i < stepCount; i++) {
        this.ctx.bezierCurveTo(x + step, cp1y, x + step, cp2y, x + 2 * step, line.rect.y);
        x += 2 * step;
      }
    } else {
      this.ctx.moveTo(line.rect.x, line.rect.y);
      this.ctx.lineTo(line.rect.maxX, line.rect.y);

      if (/double/.test(line.style)) {
        this.ctx.moveTo(line.rect.x, line.rect.y + line.rect.height * 2);
        this.ctx.lineTo(line.rect.maxX, line.rect.y + line.rect.height * 2);
      }
    }

    this.ctx.stroke(line.color);
  }
}
