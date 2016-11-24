import Run from './Run';

export default class AttributedString {
  constructor(string = '', runs = [], start, end) {
    this.string = string;
    this.runs = runs;
    this.length = string.length;
    this.start = start || 0;
    this.end = end || this.string.length - this.start + 1;
  }

  static fromFragments(fragments = []) {
    let string = '';
    let runs = [];
    let offset = 0;

    for (let fragment of fragments) {
      string += fragment.string;
      runs.push(new Run(offset, offset + fragment.string.length, fragment.attributes));
      offset += fragment.string.length;
    }

    return new AttributedString(string, runs);
  }

  runIndexAtIndex(index) {
    index += this.start;
    for (let i = 0; i < this.runs.length; i++) {
      if (this.runs[i].start <= index && index < this.runs[i].end) {
        return i;
      }
    }

    return this.runs.length - 1;
  }

  slice(start, end) {
    let startRunIndex = this.runIndexAtIndex(start);
    let endRunIndex = this.runIndexAtIndex(end);

    let startRun = this.runs[startRunIndex];
    let endRun = this.runs[endRunIndex];

    let runs = [];

    runs.push(startRun.slice(start + this.start - startRun.start, end + this.start - startRun.start));

    if (endRunIndex !== startRunIndex) {
      runs.push(...this.runs.slice(startRunIndex + 1, endRunIndex).map(r => r.copy()));

      if (this.end - endRun.start !== 0) {
        runs.push(endRun.slice(0, this.end - endRun.start));
      }
    }

    let offset = start + this.start;
    for (let run of runs) {
      run.start -= offset;
      run.end -= offset;
    }

    return new AttributedString(this.string.slice(start, end), runs, start + this.start, end + this.start);
  }
}
