import Point from './Point';

/**
 * Represents a rectangle
 */
export default class Rect {
  /** @public */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    /**
     * The x-coordinate of the rectangle
     * @type {number}
     */
    this.x = x;

    /**
     * The y-coordinate of the rectangle
     * @type {number}
     */
    this.y = y;

    /**
     * The width of the rectangle
     * @type {number}
     */
    this.width = width;

    /**
     * The height of the rectangle
     * @type {number}
     */
    this.height = height;
  }

  /**
   * The maximum x-coordinate in the rectangle
   * @type {number}
   */
  get maxX() {
    return this.x + this.width;
  }

  /**
   * The maximum y-coordinate in the rectangle
   * @type {number}
   */
  get maxY() {
    return this.y + this.height;
  }

  /**
   * The area of the rectangle
   * @type {number}
   */
  get area() {
    return this.width * this.height;
  }

  /**
   * The top left corner of the rectangle
   * @type {Point}
   */
  get topLeft() {
    return new Point(this.x, this.y);
  }

  /**
   * The top right corner of the rectangle
   * @type {Point}
   */
  get topRight() {
    return new Point(this.maxX, this.y);
  }

  /**
   * The bottom left corner of the rectangle
   * @type {Point}
   */
  get bottomLeft() {
    return new Point(this.x, this.maxY);
  }

  /**
   * The bottom right corner of the rectangle
   * @type {Point}
   */
  get bottomRight() {
    return new Point(this.maxX, this.maxY);
  }

  /**
   * Returns whether this rectangle intersects another rectangle
   * @param {Rect} rect - The rectangle to check
   * @return {boolean}
   */
  intersects(rect) {
    return this.x <= rect.x + rect.width
        && rect.x <= this.x + this.width
        && this.y <= rect.y + rect.height
        && rect.y <= this.y + this.height;
  }

  /**
   * Returns whether this rectangle fully contains another rectangle
   * @param {Rect} rect - The rectangle to check
   * @return {boolean}
   */
  containsRect(rect) {
    return this.x <= rect.x
        && this.y <= rect.y
        && this.maxX >= rect.maxX
        && this.maxY >= rect.maxY;
  }

  /**
   * Returns whether the rectangle contains the given point
   * @param {Point} point - The point to check
   * @return {boolean}
   */
  containsPoint(point) {
    return this.x <= point.x
        && this.y <= point.y
        && this.maxX >= point.x
        && this.maxY >= point.y;
  }

  /**
   * Returns the first corner of this rectangle (from top to bottom, left to right)
   * that is contained in the given rectangle, or null of the rectangles do not intersect.
   * @param {Rect} rect - The rectangle to check
   * @return {string}
   */
  getCornerInRect(rect) {
    for (let key of ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']) {
      if (rect.containsPoint(this[key])) {
        return key;
      }
    }

    return null;
  }

  equals(rect) {
    return rect.x === this.x
        && rect.y === this.y
        && rect.width === this.width
        && rect.height === this.height;
  }

  pointEquals(point) {
    return rect.x === point.x
        && rect.y === point.y;
  }

  sizeEquals(size) {
    return rect.width === size.width
        && rect.height === size.height;
  }

  /**
   * Returns a copy of this rectangle
   * @return {Rect}
   */
  copy() {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}
