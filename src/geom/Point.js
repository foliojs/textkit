/**
 * Represents a 2d point
 */
export default class Point {
  /** @public */
  constructor(x = 0, y = 0) {
    /**
     * The x-coordinate of the point
     * @type {number}
     */
    this.x = x;

    /**
     * The y-coordinate of the point
     * @type {number}
     */
    this.y = y;
  }

  /**
   * Returns a copy of this point
   * @return {Point}
   */
  copy() {
    return new Point(this.x, this.y);
  }

  transform(m0, m1, m2, m3, m4, m5) {
    const x = m0 * this.x + m2 * this.y + m4;
    const y = m1 * this.x + m3 * this.y + m5;
    return new Point(x, y);
  }
}
