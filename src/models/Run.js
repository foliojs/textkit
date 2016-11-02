import RunStyle from './RunStyle';

export default class Run {
  constructor(start, end, attributes = {}) {
    this.start = start;
    this.end = end;
    this.attributes = attributes;
  }
}
