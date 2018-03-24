import path from 'path';
import fontkit from 'fontkit';
import { glyphStringFactory } from '../utils/glyphStrings';

const font = fontkit.openSync(path.resolve(__dirname, '../data/OpenSans-Regular.ttf'));

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
    expect(sliced.glyphRuns[0].start).toBe(2);
    expect(sliced.glyphRuns[0].end).toBe(6);
    expect(sliced.glyphRuns[0].glyphs).toHaveLength(4);
  });

  test('should slice exceeding range', () => {
    const string = createString({ value: 'Lorem ipsum' });
    const sliced = string.slice(2, 14);

    expect(sliced.string).toBe('rem ipsum');
    expect(sliced.glyphRuns[0].start).toBe(2);
    expect(sliced.glyphRuns[0].end).toBe(11);
    expect(sliced.glyphRuns[0].glyphs).toHaveLength(9);
  });

  test('should ignore unnecesary trailing runs when slice', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(2, 6);

    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(2);
    expect(sliced.glyphRuns[0].end).toBe(6);
  });

  test('should ignore unnecesary leading runs when slice', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(6, 9);

    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(6);
    expect(sliced.glyphRuns[0].end).toBe(9);
  });

  test('should return correct run index at glyph index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runIndexAtGlyphIndex(2)).toBe(0);
    expect(string.runIndexAtGlyphIndex(9)).toBe(1);
  });

  test('should return correct run index at glyph index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runIndexAtGlyphIndex(0)).toBe(0);
    expect(sliced.runIndexAtGlyphIndex(1)).toBe(0);
    expect(sliced.runIndexAtGlyphIndex(2)).toBe(1);
    expect(sliced.runIndexAtGlyphIndex(9)).toBe(1);
  });

  test('should return correct run at glyph index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runAtGlyphIndex(2).start).toBe(0);
    expect(string.runAtGlyphIndex(9).start).toBe(6);
  });

  test('should return correct run at glyph index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runAtGlyphIndex(0).start).toBe(0);
    expect(sliced.runAtGlyphIndex(1).start).toBe(0);
    expect(sliced.runAtGlyphIndex(2).start).toBe(6);
    expect(sliced.runAtGlyphIndex(5).start).toBe(6);
  });

  test('should return correct run index at string index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runIndexAtStringIndex(2)).toBe(0);
    expect(string.runIndexAtStringIndex(9)).toBe(1);
  });

  test('should return correct run index at string index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runIndexAtStringIndex(0)).toBe(0);
    expect(sliced.runIndexAtStringIndex(1)).toBe(0);
    expect(sliced.runIndexAtStringIndex(2)).toBe(1);
    expect(sliced.runIndexAtStringIndex(5)).toBe(1);
  });

  test('should return correct run at string index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runAtStringIndex(2).start).toBe(0);
    expect(string.runAtStringIndex(9).start).toBe(6);
  });

  test('should return correct run at string index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runAtStringIndex(0).start).toBe(0);
    expect(sliced.runAtStringIndex(1).start).toBe(0);
    expect(sliced.runAtStringIndex(2).start).toBe(6);
    expect(sliced.runAtStringIndex(5).start).toBe(6);
  });

  test('should return correct glyph at index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const firstRunGlyphs = string._glyphRuns[0].glyphs;
    const secondRunGlyphs = string._glyphRuns[1].glyphs;

    expect(string.glyphAtIndex(2).id).toBe(firstRunGlyphs[2].id);
    expect(string.glyphAtIndex(9).id).toBe(secondRunGlyphs[3].id);
  });

  test('should return correct glyph at index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);
    const firstRunGlyphs = sliced._glyphRuns[0].glyphs;
    const secondRunGlyphs = sliced._glyphRuns[1].glyphs;

    expect(sliced.glyphAtIndex(0).id).toBe(firstRunGlyphs[4].id);
    expect(sliced.glyphAtIndex(1).id).toBe(firstRunGlyphs[5].id);
    expect(sliced.glyphAtIndex(2).id).toBe(secondRunGlyphs[0].id);
    expect(sliced.glyphAtIndex(5).id).toBe(secondRunGlyphs[3].id);
  });

  test('should return correct glyph width at index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const firstRunPositions = string._glyphRuns[0].positions;
    const secondRunPositions = string._glyphRuns[1].positions;

    expect(string.getGlyphWidth(2)).toBe(firstRunPositions[2].xAdvance);
    expect(string.getGlyphWidth(9)).toBe(secondRunPositions[3].xAdvance);
  });

  test('should return correct glyph width at index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);
    const firstRunPositions = sliced._glyphRuns[0].positions;
    const secondRunPositions = sliced._glyphRuns[1].positions;

    expect(sliced.getGlyphWidth(0)).toBe(firstRunPositions[4].xAdvance);
    expect(sliced.getGlyphWidth(1)).toBe(firstRunPositions[5].xAdvance);
    expect(sliced.getGlyphWidth(2)).toBe(secondRunPositions[0].xAdvance);
    expect(sliced.getGlyphWidth(5)).toBe(secondRunPositions[3].xAdvance);
  });

  test('should return correct glyph index at offset', () => {
    //   l     o     r    e      m            i     p     s     u     m
    // 6.22  7.24  4.65  6.73  11.16  3.11  3.03  7.35  5.72  7.36  11.16
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.glyphIndexAtOffset(5)).toBe(0);
    expect(string.glyphIndexAtOffset(17)).toBe(2);
    expect(string.glyphIndexAtOffset(39)).toBe(5);
    expect(string.glyphIndexAtOffset(50)).toBe(8);
  });

  test('should return correct glyph index at offset for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    //   m            i     p     s     u     m
    // 11.16  3.11  3.03  7.35  5.72  7.36  11.16
    const sliced = string.slice(4, 11);

    expect(sliced.glyphIndexAtOffset(5)).toBe(0);
    expect(sliced.glyphIndexAtOffset(11)).toBe(0);
    expect(string.glyphIndexAtOffset(17)).toBe(2);
    expect(sliced.glyphIndexAtOffset(30)).toBe(4);
    expect(sliced.glyphIndexAtOffset(31)).toBe(5);
    expect(sliced.glyphIndexAtOffset(39)).toBe(6);
  });

  test('should return correct string index for glyph index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.stringIndexForGlyphIndex(0)).toBe(0);
    expect(string.stringIndexForGlyphIndex(2)).toBe(2);
    expect(string.stringIndexForGlyphIndex(9)).toBe(9);
    expect(string.stringIndexForGlyphIndex(10)).toBe(10);
  });

  test('should return correct string index for glyph index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.stringIndexForGlyphIndex(0)).toBe(0);
    expect(sliced.stringIndexForGlyphIndex(2)).toBe(2);
    expect(sliced.stringIndexForGlyphIndex(6)).toBe(6);
  });

  test('should return correct glyph index for string index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.glyphIndexForStringIndex(0)).toBe(0);
    expect(string.glyphIndexForStringIndex(2)).toBe(2);
    expect(string.glyphIndexForStringIndex(9)).toBe(9);
    expect(string.glyphIndexForStringIndex(10)).toBe(10);
  });

  test('should return correct glyph index for string index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.glyphIndexForStringIndex(0)).toBe(0);
    expect(sliced.glyphIndexForStringIndex(2)).toBe(2);
    expect(sliced.glyphIndexForStringIndex(6)).toBe(6);
  });

  test('should return correct glyph code at glyph index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.codePointAtGlyphIndex(2)).toBe('r'.charCodeAt(0));
    expect(string.codePointAtGlyphIndex(9)).toBe('u'.charCodeAt(0));
  });

  test('should return correct glyph code at glyph index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.codePointAtGlyphIndex(0)).toBe('m'.charCodeAt(0));
    expect(sliced.codePointAtGlyphIndex(1)).toBe(' '.charCodeAt(0));
    expect(sliced.codePointAtGlyphIndex(2)).toBe('i'.charCodeAt(0));
    expect(sliced.codePointAtGlyphIndex(5)).toBe('u'.charCodeAt(0));
  });

  test('should return correct char at glyph index', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.charAtGlyphIndex(2)).toBe('r');
    expect(string.charAtGlyphIndex(9)).toBe('u');
  });

  test('should return correct char at glyph index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.charAtGlyphIndex(0)).toBe('m');
    expect(sliced.charAtGlyphIndex(1)).toBe(' ');
    expect(sliced.charAtGlyphIndex(2)).toBe('i');
    expect(sliced.charAtGlyphIndex(5)).toBe('u');
  });

  test('should return correct offset at glyph index', () => {
    //   l     o     r    e      m            i     p     s     u     m
    // 6.22  7.24  4.65  6.73  11.16  3.11  3.03  7.35  5.72  7.36  11.16
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.offsetAtGlyphIndex(0)).toBeCloseTo(0);
    expect(string.offsetAtGlyphIndex(1)).toBeCloseTo(6.2, 1);
    expect(string.offsetAtGlyphIndex(5)).toBeCloseTo(36, 1);
    expect(string.offsetAtGlyphIndex(8)).toBeCloseTo(49.5, 1);
  });

  test('should return correct offset at glyph index for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    //   m            i     p     s     u     m
    // 11.16  3.11  3.03  7.35  5.72  7.36  11.16
    const sliced = string.slice(4, 11);

    expect(sliced.offsetAtGlyphIndex(0)).toBeCloseTo(0);
    expect(sliced.offsetAtGlyphIndex(1)).toBeCloseTo(11.16, 2);
    expect(sliced.offsetAtGlyphIndex(4)).toBeCloseTo(24.67, 2);
    expect(sliced.offsetAtGlyphIndex(5)).toBeCloseTo(30.39, 2);
    expect(sliced.offsetAtGlyphIndex(6)).toBeCloseTo(37.76, 2);
  });

  test('should return correct index of', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.indexOf('L')).toBe(0);
    expect(string.indexOf('r')).toBe(2);
    expect(string.indexOf('p')).toBe(7);
    expect(string.indexOf('m')).toBe(4);
    expect(string.indexOf('m', 5)).toBe(10);
    expect(string.indexOf('z')).toBe(-1);
  });

  test('should return correct index of for sliced strings', () => {
    const string = createString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.indexOf('m')).toBe(0);
    expect(sliced.indexOf(' ')).toBe(1);
    expect(sliced.indexOf('i')).toBe(2);
    expect(sliced.indexOf('s')).toBe(4);
    expect(sliced.indexOf('m', 2)).toBe(6);
  });

  test('should return correct unicode category', () => {
    const string = createString({
      value: 'Lo1.+ '
    });

    expect(string.getUnicodeCategory(0)).toBe('Lu');
    expect(string.getUnicodeCategory(1)).toBe('Ll');
    expect(string.getUnicodeCategory(2)).toBe('Nd');
    expect(string.getUnicodeCategory(3)).toBe('Po');
    expect(string.getUnicodeCategory(4)).toBe('Sm');
    expect(string.getUnicodeCategory(5)).toBe('Zs');
  });

  test('should return if is white space for index', () => {
    const string = createString({
      value: 'L '
    });

    expect(string.isWhiteSpace(0)).toBeFalsy();
    expect(string.isWhiteSpace(1)).toBeTruthy();
  });

  test('should return if is white space for index for sliced string', () => {
    const string = createString({
      value: 'someL '
    });

    const sliced = string.slice(4, string.length);

    expect(sliced.isWhiteSpace(0)).toBeFalsy();
    expect(sliced.isWhiteSpace(1)).toBeTruthy();
  });
});
