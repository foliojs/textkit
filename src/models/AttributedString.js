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
    let offset = 0;
    const runs = [];

    fragments.forEach(fragment => {
      string += fragment.string;
      runs.push(
        new Run(offset, offset + fragment.string.length, fragment.attributes)
      );
      offset += fragment.string.length;
    });

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
    const startRunIndex = this.runIndexAtIndex(start);
    const endRunIndex = this.runIndexAtIndex(end);
    const startRun = this.runs[startRunIndex];
    const endRun = this.runs[endRunIndex];
    const runs = [];

    runs.push(
      startRun.slice(
        start + this.start - startRun.start,
        end + this.start - startRun.start
      )
    );

    if (startRunIndex !== endRunIndex) {
      runs.push(
        ...this.runs.slice(startRunIndex + 1, endRunIndex).map(r => r.copy())
      );

      if (this.end - endRun.start !== 0) {
        runs.push(endRun.slice(0, this.end - endRun.start));
      }
    }

    const offset = start + this.start;

    for (const run of runs) {
      run.start -= offset;
      run.end -= offset;
    }

    return new AttributedString(
      this.string.slice(start, end),
      runs,
      start + this.start,
      end + this.start
    );
  }
}
