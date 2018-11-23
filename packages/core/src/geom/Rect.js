import Point from './Point';

const CORNERS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

class Rect {
  /** @public */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get maxX() {
    return this.x + this.width;
  }

  get maxY() {
    return this.y + this.height;
  }

  get area() {
    return this.width * this.height;
  }

  get topLeft() {
    return new Point(this.x, this.y);
  }

  get topRight() {
    return new Point(this.maxX, this.y);
  }

  get bottomLeft() {
    return new Point(this.x, this.maxY);
  }

  get bottomRight() {
    return new Point(this.maxX, this.maxY);
  }

  intersects(rect) {
    return (
      this.x <= rect.x + rect.width &&
      rect.x <= this.x + this.width &&
      this.y <= rect.y + rect.height &&
      rect.y <= this.y + this.height
    );
  }

  containsRect(rect) {
    return this.x <= rect.x && this.y <= rect.y && this.maxX >= rect.maxX && this.maxY >= rect.maxY;
  }

  containsPoint(point) {
    return this.x <= point.x && this.y <= point.y && this.maxX >= point.x && this.maxY >= point.y;
  }

  getCornerInRect(rect) {
    for (const key of CORNERS) {
      if (rect.containsPoint(this[key])) {
        return key;
      }
    }

    return null;
  }

  equals(rect) {
    return (
      rect.x === this.x &&
      rect.y === this.y &&
      rect.width === this.width &&
      rect.height === this.height
    );
  }

  pointEquals(point) {
    return this.x === point.x && this.y === point.y;
  }

  sizeEquals(size) {
    return this.width === size.width && this.height === size.height;
  }

  copy() {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}

export default Rect;
