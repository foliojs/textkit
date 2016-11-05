import BBox from '../geom/BBox';

export default class Block {
  constructor(lines = [], style = {}) {
    this.lines = lines;
    this.style = style;
  }

  get bbox() {
    let bbox = new BBox;
    for (let line of this.lines) {
      bbox.addRect(line.rect);
    }

    return bbox;
  }
}
