const BASE_FONT_SIZE = 16;

export default class DecorationLine {
  constructor(startX, endX, y, attributes) {
    this.startX = startX;
    this.endX = endX;
    this.y = y;
    this.color = attributes.underlineColor || attributes.color || 'black';
    this.thickness = Math.max(0.5, Math.floor(attributes.fontSize / BASE_FONT_SIZE));
  }

  merge(line) {
    if (this.endX === line.startX && this.y === line.y) {
      this.thickness = line.thickness = Math.max(this.thickness, line.thickness);

      if (this.color === line.color) {
        this.endX = line.endX;
        return true;
      }
    }

    return false;
  }
}
