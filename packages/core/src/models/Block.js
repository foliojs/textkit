import BBox from '../geom/BBox';

export default class Block {
  constructor(lines = [], style = {}) {
    this.lines = lines;
    this.style = style;
  }

  get bbox() {
    const bbox = new BBox();
    for (const line of this.lines) {
      bbox.addRect(line.rect);
    }

    return bbox;
  }

  get height() {
    let height = 0;
    for (const line of this.lines) {
      height += line.height;
    }

    return height;
  }

  get stringLength() {
    let length = 0;
    for (const line of this.lines) {
      length += line.string.length;
    }

    return length;
  }
}
