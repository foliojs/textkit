export default class TextRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(container) {
    for (let block of container.blocks) {
      this.renderBlock(block);
    }
  }

  renderBlock(block) {
    for (let line of block.lines) {
      this.renderLine(line);
    }
  }

  renderLine(line) {
    for (let run of block.runs) {
      this.renderRun(run);
    }
  }

  renderRun(run) {
    this.ctx.renderGlyphs(run.glyphs, run.positions);
  }
}
