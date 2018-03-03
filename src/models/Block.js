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

  get stringLength() {
    let length = 0;
    for (const line of this.lines) {
      length += line.string.length;
    }

    return length;
  }
}
