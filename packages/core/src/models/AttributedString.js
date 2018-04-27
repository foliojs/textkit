import Run from './Run';

class AttributedString {
  constructor(string = '', runs = []) {
    this.string = string;
    this.runs = runs;
    this.length = string.length;
  }

  static fromFragments(fragments = []) {
    let string = '';
    let offset = 0;
    const runs = [];

    fragments.forEach(fragment => {
      string += fragment.string;
      runs.push(new Run(offset, offset + fragment.string.length, fragment.attributes));
      offset += fragment.string.length;
    });

    return new AttributedString(string, runs);
  }

  runIndexAt(index) {
    for (let i = 0; i < this.runs.length; i++) {
      if (this.runs[i].start <= index && index < this.runs[i].end) {
        return i;
      }
    }

    return this.runs.length - 1;
  }

  trim() {
    let i;
    for (i = this.string.length - 1; i >= 0; i--) {
      if (this.string[i] !== ' ') {
        break;
      }
    }

    return this.slice(0, i + 1);
  }

  slice(start, end) {
    if (this.string.length === 0) return this;

    const startRunIndex = this.runIndexAt(start);
    const endRunIndex = this.runIndexAt(end - 1);
    const startRun = this.runs[startRunIndex];
    const endRun = this.runs[endRunIndex];
    const runs = [];

    runs.push(startRun.slice(start - startRun.start, end));

    if (startRunIndex !== endRunIndex) {
      runs.push(...this.runs.slice(startRunIndex + 1, endRunIndex).map(r => r.copy()));

      if (endRun.start !== 0) {
        runs.push(endRun.slice(0, end - endRun.start));
      }
    }

    for (const run of runs) {
      run.start -= start;
      run.end -= start;
    }

    return new AttributedString(this.string.slice(start, end), runs);
  }
}

export default AttributedString;
