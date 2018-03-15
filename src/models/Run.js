import Range from './Range';

class Run extends Range {
  constructor(start, end, attributes = {}) {
    super(start, end);

    this.attributes = attributes;
  }

  slice(start, end) {
    return new Run(
      start + this.start,
      Math.min(this.end, end + this.start),
      this.attributes
    );
  }

  copy() {
    return new Run(this.start, this.end, this.attributes);
  }
}

export default Run;
