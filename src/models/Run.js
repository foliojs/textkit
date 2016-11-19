import Range from './Range';

export default class Run extends Range {
  constructor(start, end, attributes = {}) {
    super(start, end);
    this.attributes = attributes;
  }
}
