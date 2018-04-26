/**
 * This class represents a numeric range between
 * a starting and ending value, inclusive.
 */
class Range {
  /**
   * Creates a new Range
   * @param {number} start the starting index of the range
   * @param {number} end the ending index of the range, inclusive
   */
  constructor(start, end) {
    /**
     * The starting index of the range
     * @type {number}
     */
    this.start = start;

    /**
     * The ending index of the range, inclusive
     * @type {number}
     */
    this.end = end;
  }

  /**
   * The length of the range
   * @type {number}
   */
  get length() {
    return this.end - this.start + 1;
  }

  /**
   * Returns whether this range is equal to the given range
   * @param {Range} other the range to compare
   * @return {boolean}
   */
  equals(other) {
    return other.start === this.start && other.end === this.end;
  }

  /**
   * Returns a copy of the range
   * @return {Range}
   */
  copy() {
    return new Range(this.start, this.end);
  }

  /**
   * Returns whether the given value is in the range
   * @param {number} index the index to check
   * @return {boolean}
   */
  contains(index) {
    return index >= this.start && index <= this.end;
  }

  /**
   * Extends the range to include the given index
   * @param {number} index the index to ad
   */
  extend(index) {
    this.start = Math.min(this.start, index);
    this.end = Math.max(this.end, index);
  }

  /**
   * Merge intersecting ranges
   * @param {number} ranges array of valid Range objects
   * @return {array}
   */
  static merge(ranges) {
    ranges.sort((a, b) => a.start - b.start);

    const merged = [ranges[0]];

    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      const next = ranges[i];

      if (next.start <= last.end && next.end <= last.end) {
        // Ignore this range completely.
        // Next is contained inside last
        continue;
      } else if (next.start <= last.end) {
        last.end = next.end;
      } else {
        merged.push(next);
      }
    }

    return merged;
  }
}

export default Range;
