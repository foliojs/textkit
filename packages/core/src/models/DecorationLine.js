import Rect from '../geom/Rect';

export default class DecorationLine {
  constructor(rect, color, style) {
    this.rect = rect;
    this.color = color || 'black';
    this.style = style || 'solid';
  }

  merge(line) {
    if (this.rect.maxX === line.rect.x && this.rect.y === line.rect.y) {
      const height = Math.max(this.rect.height, line.rect.height);
      this.rect.height = height;
      line.rect.height = height;

      if (this.color === line.color) {
        this.rect.width += line.rect.width;
        return true;
      }
    }

    return false;
  }

  slice(startX, endX) {
    const rect = new Rect(startX, this.rect.y, endX - startX, this.rect.height);
    return new DecorationLine(rect, this.color, this.style);
  }
}
