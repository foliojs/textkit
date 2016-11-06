import Run from './Run';

export default class AttributedString {
  constructor(string = '', runs = []) {
    this.string = string;
    this.runs = runs;
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
}
