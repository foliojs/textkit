import Range from './Range';

export default class Run extends Range {
  constructor(start, end, attributes = {}) {
    super(start, end);
    this.attributes = attributes;
  }

  slice(start, end) {
    start += this.start;
    end += this.start;
    end = Math.min(this.end, end);
    return new Run(start, end, this.attributes);
  }

  copy() {
    return new Run(this.start, this.end, this.attributes);
  }
}
