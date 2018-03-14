import Run from '../src/models/Run';
import AttributedString from '../src/models/AttributedString';

const testString = 'Lorem ipsum';
const testRuns = [
  new Run(0, 6, { something: 'blah' }),
  new Run(6, 12, { somethingElse: 'blah' })
];

describe('AttributedString', () => {
  test('should handle passed string', () => {
    const attributedString = new AttributedString(testString);

    expect(attributedString.string).toBe(testString);
    expect(attributedString.length).toBe(testString.length);
    expect(attributedString.start).toBe(0);
    expect(attributedString.end).toBe(testString.length + 1);
  });

  test('should handle custom start and end', () => {
    const attributedString = new AttributedString(testString, [], 10, 20);

    expect(attributedString.start).toBe(10);
    expect(attributedString.end).toBe(20);
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

  test.only('should slice with several runs', () => {
    const attributedString = new AttributedString(testString, testRuns);
    const splittedString = attributedString.slice(2, 8);

    expect(splittedString.string).toBe(testString.slice(2, 8));
    expect(splittedString.runs[0]).toHaveProperty('start', 0);
    expect(splittedString.runs[0]).toHaveProperty('end', 4);
    expect(splittedString.runs[1]).toHaveProperty('start', 4);
    // expect(splittedString.runs[1]).toHaveProperty('end', 8);
  });
});
