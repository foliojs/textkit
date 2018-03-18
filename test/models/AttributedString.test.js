import Run from '../../src/models/Run';
import AttributedString from '../../src/models/AttributedString';

const testString = 'Lorem ipsum';
const testRuns = [new Run(0, 6, { attr: 1 }), new Run(6, 11, { attr: 2 })];

describe('AttributedString', () => {
  test('should handle passed string', () => {
    const attributedString = new AttributedString(testString);

    expect(attributedString.string).toBe(testString);
    expect(attributedString.length).toBe(testString.length);
  });

  test('should not have runs when created', () => {
    const string = new AttributedString();

    expect(string.runs).toHaveLength(0);
  });

  test('should handle passed runs', () => {
    const attributedString = new AttributedString(testString, testRuns);

    expect(attributedString.runs).toBe(testRuns);
  });

  test('should be constructed by fragments', () => {
    const attributedString = AttributedString.fromFragments([
      { string: 'Hey' },
      { string: ' ho' }
    ]);

    const expectedString = 'Hey ho';

    expect(attributedString.string).toBe(expectedString);
    expect(attributedString.length).toBe(expectedString.length);
    expect(attributedString.runs[0].start).toBe(0);
    expect(attributedString.runs[1].start).toBe(3);
  });

  test('should slice with one run', () => {
    const run = [new Run(0, 11, { attr: 1 })];
    const attributedString = new AttributedString(testString, run);
    const splittedString = attributedString.slice(2, 8);

    expect(splittedString.length).toBe(6);
    expect(splittedString.string).toBe('rem ip');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 6);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 1 });
  });

  test('should return correct run index', () => {
    const attributedString = new AttributedString(testString, testRuns);

    expect(attributedString.runIndexAtIndex(0)).toBe(0);
    expect(attributedString.runIndexAtIndex(5)).toBe(0);
    expect(attributedString.runIndexAtIndex(6)).toBe(1);
    expect(attributedString.runIndexAtIndex(10)).toBe(1);
  });

  test('should slice with two runs', () => {
    const attributedString = new AttributedString(testString, testRuns);
    const splittedString = attributedString.slice(2, 8);

    expect(splittedString.length).toBe(6);
    expect(splittedString.string).toBe('rem ip');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 4);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 1 });
    expect(splittedString.runs[1]).toHaveProperty('start', 4);
    expect(splittedString.runs[1]).toHaveProperty('end', 6);
    expect(splittedString.runs[1]).toHaveProperty('attributes', { attr: 2 });
  });

  test('should slice with several runs', () => {
    const runs = [
      new Run(0, 3, { attr: 1 }),
      new Run(3, 6, { attr: 2 }),
      new Run(6, 11, { attr: 3 })
    ];
    const attributedString = new AttributedString(testString, runs);
    const splittedString = attributedString.slice(2, 8);

    expect(splittedString.length).toBe(6);
    expect(splittedString.string).toBe('rem ip');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 1);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 1 });
    expect(splittedString.runs[1]).toHaveProperty('start', 1);
    expect(splittedString.runs[1]).toHaveProperty('end', 4);
    expect(splittedString.runs[1]).toHaveProperty('attributes', { attr: 2 });
    expect(splittedString.runs[2]).toHaveProperty('start', 4);
    expect(splittedString.runs[2]).toHaveProperty('end', 6);
    expect(splittedString.runs[2]).toHaveProperty('attributes', { attr: 3 });
  });

  test('should ignore unnecesary leading runs when slice', () => {
    const attributedString = new AttributedString(testString, testRuns);
    const splittedString = attributedString.slice(6, 11);

    expect(splittedString.length).toBe(5);
    expect(splittedString.runs.length).toBe(1);
    expect(splittedString.string).toBe('ipsum');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 5);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 2 });
  });

  test('should ignore unnecesary trailing runs when slice', () => {
    const attributedString = new AttributedString(testString, testRuns);
    const splittedString = attributedString.slice(1, 6);

    expect(splittedString.length).toBe(5);
    expect(splittedString.runs.length).toBe(1);
    expect(splittedString.string).toBe('orem ');
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 5);
    expect(splittedString.runs[0]).toHaveProperty('attributes', { attr: 1 });
  });
});
