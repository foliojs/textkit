class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  get length() {
    return this.end - this.start + 1;
  }

  equals(other) {
    return other.start === this.start && other.end === this.end;
  }

  copy() {
    return new Range(this.start, this.end);
  }

  contains(index) {
    return index >= this.start && index <= this.end;
  }

  extend(index) {
    this.start = Math.min(this.start, index);
    this.end = Math.max(this.end, index);
  }

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
