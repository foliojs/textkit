import path from 'path';
import fontkit from 'fontkit';
import { glyphStringFactory } from '../utils/glyphStrings';

const font = fontkit.openSync(
  path.resolve(__dirname, '../data/OpenSans-Regular.ttf')
);

const createString = glyphStringFactory(font);

describe('GlyphString', () => {
  test('should get string value', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.string).toBe('Lorem ipsum');
  });

  test('should get string end', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.end).toBe(11);
  });

  test('should get string length', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.length).toBe(11);
  });

  test('should get string advance width', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.advanceWidth).toBeCloseTo(74, 0);
  });

  test('should get string height', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.height).toBeCloseTo(16, 0);
  });

  test('should get string ascent', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.ascent).toBeCloseTo(13, 0);
  });

  test('should get string descent', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.descent).toBeCloseTo(-3.5, 1);
  });

  test('should isWhiteSpace return true if white space', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.isWhiteSpace(5)).toBeTruthy();
  });

  test('should isWhiteSpace return false if non white space', () => {
    const string = createString({ value: 'Lorem ipsum' });

    expect(string.isWhiteSpace(3)).toBeFalsy();
  });

  test('should slice containing range', () => {
    const string = createString({ value: 'Lorem ipsum' });
    const sliced = string.slice(2, 6);

    expect(sliced.string).toBe('rem ');
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(4);
    expect(sliced.glyphRuns[0].glyphs).toHaveLength(4);
  });

  test('should slice exceeding range', () => {
    const string = createString({ value: 'Lorem ipsum' });
    const sliced = string.slice(2, 14);

    expect(sliced.string).toBe('rem ipsum');
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(9);
    expect(sliced.glyphRuns[0].glyphs).toHaveLength(9);
  });

  test('should ignore unnecesary trailing runs when slice', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(2, 6);

    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(4);
  });

  test('should ignore unnecesary leading runs when slice', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(6, 9);

    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(3);
  });
});
