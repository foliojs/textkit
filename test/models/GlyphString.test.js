import path from 'path';
import fontkit from 'fontkit';
import { glyphStringFactory } from '../utils/glyphStrings';

const openSans = fontkit.openSync(path.resolve(__dirname, '../data/OpenSans-Regular.ttf'));
const khmer = fontkit.openSync(path.resolve(__dirname, '../data/Khmer.ttf'));

const createLatinString = glyphStringFactory(openSans);
const createKhmerString = glyphStringFactory(khmer);

const round = num => Math.round(num * 100) / 100;

describe('GlyphString', () => {
  test('should get string value', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.string).toBe('Lorem ipsum');
  });

  test('should get string end', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.end).toBe(11);
  });

  test('should get string end (non latin)', () => {
    const string = createKhmerString({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });

    expect(string.end).toBe(16);
  });

  test('should get string length', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.length).toBe(11);
  });

  test('should get string length (non latin)', () => {
    const string = createKhmerString({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });

    expect(string.length).toBe(16);
  });

  test('should get string advance width', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.advanceWidth).toBeCloseTo(74, 0);
  });

  test('should get string height', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.height).toBeCloseTo(16, 0);
  });

  test('should get string ascent', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.ascent).toBeCloseTo(13, 0);
  });

  test('should get string descent', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.descent).toBeCloseTo(-3.5, 1);
  });

  test('should get glyph runs', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.glyphRuns).toHaveLength(2);
    expect(string.glyphRuns[0].start).toBe(0);
    expect(string.glyphRuns[0].end).toBe(6);
    expect(string.glyphRuns[1].start).toBe(6);
    expect(string.glyphRuns[1].end).toBe(11);
  });

  test('should get glyphs run (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.glyphRuns).toHaveLength(2);
    expect(string.glyphRuns[0].start).toBe(0);
    expect(string.glyphRuns[0].end).toBe(7);
    expect(string.glyphRuns[1].start).toBe(7);
    expect(string.glyphRuns[1].end).toBe(16);
  });

  test('should get glyph runs for sliced string', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(2, 8);

    expect(sliced.glyphRuns).toHaveLength(2);
    expect(sliced.glyphRuns[0].start).toBe(2);
    expect(sliced.glyphRuns[0].end).toBe(6);
    expect(sliced.glyphRuns[1].start).toBe(6);
    expect(sliced.glyphRuns[1].end).toBe(8);
  });

  test('should get glyphs run for sliced string (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(1, 15);

    expect(sliced.glyphRuns).toHaveLength(2);
    expect(sliced.glyphRuns[0].start).toBe(1);
    expect(sliced.glyphRuns[0].end).toBe(7);
    expect(sliced.glyphRuns[1].start).toBe(7);
    expect(sliced.glyphRuns[1].end).toBe(15);
  });

  test('should isWhiteSpace return true if white space', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.isWhiteSpace(5)).toBeTruthy();
  });

  test('should isWhiteSpace return false if non white space', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });

    expect(string.isWhiteSpace(3)).toBeFalsy();
  });

  test('should slice containing range', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });
    const sliced = string.slice(2, 6);

    expect(sliced.string).toBe('rem ');
    expect(sliced.glyphRuns[0].start).toBe(2);
    expect(sliced.glyphRuns[0].end).toBe(6);
    expect(sliced.glyphRuns[0].glyphs.length).toBe(4);
  });

  test('should slice exceeding range', () => {
    const string = createLatinString({ value: 'Lorem ipsum' });
    const sliced = string.slice(2, 14);

    expect(sliced.string).toBe('rem ipsum');
    expect(sliced.glyphRuns[0].start).toBe(2);
    expect(sliced.glyphRuns[0].end).toBe(11);
    expect(sliced.glyphRuns[0].glyphs.length).toBe(9);
  });

  test('should ignore unnecesary trailing runs when slice', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(2, 6);

    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(2);
    expect(sliced.glyphRuns[0].end).toBe(6);
  });

  test('should ignore unnecesary leading runs when slice', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(6, 9);

    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(6);
    expect(sliced.glyphRuns[0].end).toBe(9);
  });

  test('should return correct run index at glyph index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runIndexAtGlyphIndex(2)).toBe(0);
    expect(string.runIndexAtGlyphIndex(9)).toBe(1);
  });

  test('should return correct run index at glyph index (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.runIndexAtGlyphIndex(0)).toBe(0);
    expect(string.runIndexAtGlyphIndex(4)).toBe(0);
    expect(string.runIndexAtGlyphIndex(6)).toBe(0);
    expect(string.runIndexAtGlyphIndex(7)).toBe(1);
    expect(string.runIndexAtGlyphIndex(11)).toBe(1);
    expect(string.runIndexAtGlyphIndex(15)).toBe(1);
  });

  test('should return correct run index at glyph index for sliced strings', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runIndexAtGlyphIndex(0)).toBe(0);
    expect(sliced.runIndexAtGlyphIndex(1)).toBe(0);
    expect(sliced.runIndexAtGlyphIndex(2)).toBe(1);
    expect(sliced.runIndexAtGlyphIndex(9)).toBe(1);
  });

  test('should return correct run index at glyph index for sliced strings (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runIndexAtGlyphIndex(0)).toBe(0);
    expect(sliced.runIndexAtGlyphIndex(2)).toBe(0);
    expect(sliced.runIndexAtGlyphIndex(3)).toBe(1);
    expect(sliced.runIndexAtGlyphIndex(6)).toBe(1);
  });

  test('should return correct run at glyph index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runAtGlyphIndex(2).start).toBe(0);
    expect(string.runAtGlyphIndex(9).start).toBe(6);
  });

  test('should return correct run at glyph index for sliced strings', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runAtGlyphIndex(0).start).toBe(4);
    expect(sliced.runAtGlyphIndex(1).start).toBe(4);
    expect(sliced.runAtGlyphIndex(2).start).toBe(6);
    expect(sliced.runAtGlyphIndex(5).start).toBe(6);
  });

  test('should return correct run index at string index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runIndexAtStringIndex(2)).toBe(0);
    expect(string.runIndexAtStringIndex(5)).toBe(0);
    expect(string.runIndexAtStringIndex(6)).toBe(1);
    expect(string.runIndexAtStringIndex(9)).toBe(1);
  });

  test('should return correct run index at string index (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.runIndexAtStringIndex(0)).toBe(0);
    expect(string.runIndexAtStringIndex(4)).toBe(0);
    expect(string.runIndexAtStringIndex(7)).toBe(0);
    expect(string.runIndexAtStringIndex(8)).toBe(1);
    expect(string.runIndexAtStringIndex(14)).toBe(1);
    expect(string.runIndexAtStringIndex(20)).toBe(1);
  });

  test('should return correct run index at string index for sliced strings', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runIndexAtStringIndex(0)).toBe(0);
    expect(sliced.runIndexAtStringIndex(1)).toBe(0);
    expect(sliced.runIndexAtStringIndex(2)).toBe(1);
    expect(sliced.runIndexAtStringIndex(5)).toBe(1);
  });

  test('should return correct run index at string index for sliced strings (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runIndexAtStringIndex(0)).toBe(0);
    expect(sliced.runIndexAtStringIndex(2)).toBe(0);
    expect(sliced.runIndexAtStringIndex(3)).toBe(1);
    expect(sliced.runIndexAtStringIndex(5)).toBe(1);
    expect(sliced.runIndexAtStringIndex(6)).toBe(1);
  });

  test('should return correct run at string index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runAtStringIndex(2).start).toBe(0);
    expect(string.runAtStringIndex(9).start).toBe(6);
  });

  test('should return correct run at string index (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.runAtStringIndex(2).start).toBe(0);
    expect(string.runAtStringIndex(7).start).toBe(0);
    expect(string.runAtStringIndex(8).start).toBe(7);
    expect(string.runAtStringIndex(20).start).toBe(7);
  });

  test('should return correct run at string index for sliced strings', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runAtStringIndex(0).start).toBe(4);
    expect(sliced.runAtStringIndex(1).start).toBe(4);
    expect(sliced.runAtStringIndex(2).start).toBe(6);
    expect(sliced.runAtStringIndex(5).start).toBe(6);
  });

  test('should return correct run at string index for sliced strings (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runAtStringIndex(0).start).toBe(4);
    expect(sliced.runAtStringIndex(1).start).toBe(4);
    expect(sliced.runAtStringIndex(2).start).toBe(4);
    expect(sliced.runAtStringIndex(3).start).toBe(7);
    expect(sliced.runAtStringIndex(6).start).toBe(7);
  });

  test('should return correct glyph at index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const firstRunGlyphs = string._glyphRuns[0].glyphs;
    const secondRunGlyphs = string._glyphRuns[1].glyphs;

    expect(string.glyphAtIndex(2).id).toBe(firstRunGlyphs[2].id);
    expect(string.glyphAtIndex(9).id).toBe(secondRunGlyphs[3].id);
  });

  test('should return correct glyph at index (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const firstRunGlyphs = string._glyphRuns[0].glyphs;
    const secondRunGlyphs = string._glyphRuns[1].glyphs;

    expect(string.glyphAtIndex(2).id).toBe(firstRunGlyphs[2].id);
    expect(string.glyphAtIndex(6).id).toBe(firstRunGlyphs[6].id);
    expect(string.glyphAtIndex(7).id).toBe(secondRunGlyphs[0].id);
    expect(string.glyphAtIndex(15).id).toBe(secondRunGlyphs[8].id);
  });

  test('should return correct glyph at index for sliced strings', () => {
    const string = createLatinString({
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

  test('should return correct glyph at index for sliced strings (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);
    const firstRunGlyphs = sliced._glyphRuns[0].glyphs;
    const secondRunGlyphs = sliced._glyphRuns[1].glyphs;

    expect(sliced.glyphAtIndex(0).id).toBe(firstRunGlyphs[4].id);
    expect(sliced.glyphAtIndex(2).id).toBe(firstRunGlyphs[6].id);
    expect(sliced.glyphAtIndex(3).id).toBe(secondRunGlyphs[0].id);
  });

  test('should return correct glyph width at index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const firstRunPositions = string._glyphRuns[0].positions;
    const secondRunPositions = string._glyphRuns[1].positions;

    expect(string.getGlyphWidth(2)).toBe(firstRunPositions[2].xAdvance);
    expect(string.getGlyphWidth(9)).toBe(secondRunPositions[3].xAdvance);
  });

  test('should return correct glyph width at index (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const firstRunPositions = string._glyphRuns[0].positions;
    const secondRunPositions = string._glyphRuns[1].positions;

    expect(string.getGlyphWidth(0)).toBe(firstRunPositions[0].xAdvance);
    expect(string.getGlyphWidth(6)).toBe(firstRunPositions[6].xAdvance);
    expect(string.getGlyphWidth(7)).toBe(secondRunPositions[0].xAdvance);
    expect(string.getGlyphWidth(15)).toBe(secondRunPositions[8].xAdvance);
  });

  test('should return correct glyph width at index for sliced strings', () => {
    const string = createLatinString({
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

  test('should return correct glyph width at index for sliced strings (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);
    const firstRunPositions = sliced._glyphRuns[0].positions;
    const secondRunPositions = sliced._glyphRuns[1].positions;

    expect(sliced.getGlyphWidth(0)).toBe(firstRunPositions[4].xAdvance);
    expect(sliced.getGlyphWidth(1)).toBe(firstRunPositions[5].xAdvance);
    expect(sliced.getGlyphWidth(3)).toBe(secondRunPositions[0].xAdvance);
    expect(sliced.getGlyphWidth(4)).toBe(secondRunPositions[1].xAdvance);
  });

  test('should return correct glyph index at offset', () => {
    //   l     o     r    e      m            i     p     s     u     m
    // 6.22  7.24  4.65  6.73  11.16  3.11  3.03  7.35  5.72  7.36  11.16
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.glyphIndexAtOffset(5)).toBe(0);
    expect(string.glyphIndexAtOffset(17)).toBe(2);
    expect(string.glyphIndexAtOffset(39)).toBe(5);
    expect(string.glyphIndexAtOffset(50)).toBe(8);
  });

  test('should return correct glyph index at offset (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.glyphIndexAtOffset(8)).toBe(0);
    expect(string.glyphIndexAtOffset(10)).toBe(4);
    expect(string.glyphIndexAtOffset(24)).toBe(6);
    expect(string.glyphIndexAtOffset(32)).toBe(7);
    expect(string.glyphIndexAtOffset(51)).toBe(8);
    expect(string.glyphIndexAtOffset(92)).toBe(14);
  });

  test('should return correct glyph index at offset for sliced strings', () => {
    const string = createLatinString({
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

  test('should return correct glyph index at offset for sliced strings (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.glyphIndexAtOffset(0)).toBe(0);
    expect(sliced.glyphIndexAtOffset(10)).toBe(1);
    expect(sliced.glyphIndexAtOffset(14)).toBe(2);
    expect(sliced.glyphIndexAtOffset(24)).toBe(3);
    expect(sliced.glyphIndexAtOffset(43)).toBe(4);
    expect(sliced.glyphIndexAtOffset(52)).toBe(5);
  });

  test('should return correct string index for glyph index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.stringIndexForGlyphIndex(0)).toBe(0);
    expect(string.stringIndexForGlyphIndex(2)).toBe(2);
    expect(string.stringIndexForGlyphIndex(9)).toBe(9);
    expect(string.stringIndexForGlyphIndex(10)).toBe(10);
  });

  test('should return correct string index for glyph index (non latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.stringIndexForGlyphIndex(0)).toBe(0);
    expect(string.stringIndexForGlyphIndex(2)).toBe(3);
    expect(string.stringIndexForGlyphIndex(6)).toBe(7);
    expect(string.stringIndexForGlyphIndex(7)).toBe(8);
    expect(string.stringIndexForGlyphIndex(8)).toBe(12);
    expect(string.stringIndexForGlyphIndex(11)).toBe(16);
    expect(string.stringIndexForGlyphIndex(15)).toBe(20);
  });

  test('should return correct string index for glyph index for sliced strings', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.stringIndexForGlyphIndex(0)).toBe(0);
    expect(sliced.stringIndexForGlyphIndex(2)).toBe(2);
    expect(sliced.stringIndexForGlyphIndex(6)).toBe(6);
  });

  test('should return correct string index for glyph index for sliced strings (not latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.stringIndexForGlyphIndex(0)).toBe(0);
    expect(sliced.stringIndexForGlyphIndex(1)).toBe(1);
    expect(sliced.stringIndexForGlyphIndex(3)).toBe(3);
    expect(sliced.stringIndexForGlyphIndex(4)).toBe(7);
    expect(sliced.stringIndexForGlyphIndex(5)).toBe(8);
    expect(sliced.stringIndexForGlyphIndex(6)).toBe(9);
  });

  test('should return correct glyph index for string index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.glyphIndexForStringIndex(0)).toBe(0);
    expect(string.glyphIndexForStringIndex(2)).toBe(2);
    expect(string.glyphIndexForStringIndex(9)).toBe(9);
    expect(string.glyphIndexForStringIndex(10)).toBe(10);
  });

  test('should return correct glyph index for string index (not latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.glyphIndexForStringIndex(0)).toBe(0);
    expect(string.glyphIndexForStringIndex(4)).toBe(3);
    expect(string.glyphIndexForStringIndex(7)).toBe(6);
    expect(string.glyphIndexForStringIndex(8)).toBe(7);
    expect(string.glyphIndexForStringIndex(12)).toBe(8);
  });

  test('should return correct glyph index for string index for sliced strings', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(2, 6);

    expect(sliced.glyphIndexForStringIndex(0)).toBe(0);
    expect(sliced.glyphIndexForStringIndex(1)).toBe(1);
    expect(sliced.glyphIndexForStringIndex(2)).toBe(2);
    expect(sliced.glyphIndexForStringIndex(3)).toBe(3);
  });

  test('should return correct glyph index for string index for sliced strings (not latin)', () => {
    const string = createKhmerString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 15);

    expect(sliced.glyphIndexForStringIndex(0)).toBe(0);
    expect(sliced.glyphIndexForStringIndex(3)).toBe(3);
    expect(sliced.glyphIndexForStringIndex(4)).toBe(4);
  });

  test('should return correct glyph code at glyph index', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.codePointAtGlyphIndex(2)).toBe('r'.charCodeAt(0));
    expect(string.codePointAtGlyphIndex(9)).toBe('u'.charCodeAt(0));
  });

  test('should return correct glyph code at glyph index for sliced strings', () => {
    const string = createLatinString({
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
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.charAtGlyphIndex(2)).toBe('r');
    expect(string.charAtGlyphIndex(9)).toBe('u');
  });

  test('should return correct char at glyph index for sliced strings', () => {
    const string = createLatinString({
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
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.offsetAtGlyphIndex(0)).toBeCloseTo(0);
    expect(string.offsetAtGlyphIndex(1)).toBeCloseTo(6.2, 1);
    expect(string.offsetAtGlyphIndex(5)).toBeCloseTo(36, 1);
    expect(string.offsetAtGlyphIndex(8)).toBeCloseTo(49.5, 1);
  });

  test('should return correct offset at glyph index for sliced strings', () => {
    const string = createLatinString({
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
    const string = createLatinString({
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
    const string = createLatinString({
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
    const string = createLatinString({
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
    const string = createLatinString({ value: 'L ' });

    expect(string.isWhiteSpace(0)).toBeFalsy();
    expect(string.isWhiteSpace(1)).toBeTruthy();
  });

  test('should return if is white space for index for sliced string', () => {
    const string = createLatinString({ value: 'someL ' });

    const sliced = string.slice(4, string.length);

    expect(sliced.isWhiteSpace(0)).toBeFalsy();
    expect(sliced.isWhiteSpace(1)).toBeTruthy();
  });

  test('should successfully insert glyph', () => {
    const char = 0x002d; // "-"
    const string = createLatinString({ value: 'Lorem ipsum', runs: [[0, 6], [6, 11]] });

    string.insertGlyph(2, char);

    expect(string.start).toBe(0);
    expect(string.end).toBe(12);
    expect(string.glyphRuns[0].start).toBe(0);
    expect(string.glyphRuns[0].end).toBe(7);
    expect(string.glyphRuns[1].start).toBe(7);
    expect(string.glyphRuns[1].end).toBe(12);
    expect(string.glyphRuns[0].glyphs[2].id).toBe(16);

    // Test string indices.
    // The new glyph shouldn't interfer with current indices
    expect(string.glyphRuns[0].stringIndices[2]).toBe(2);
    expect(string.glyphRuns[0].stringIndices[3]).toBe(2);
  });

  test('should successfully insert glyph for sliced strings', () => {
    const char = 0x002d; // "-"
    const string = createLatinString({ value: 'Lorem ipsum', runs: [[0, 6], [6, 11]] });
    const sliced = string.slice(4, string.length);

    sliced.insertGlyph(2, char);

    expect(sliced.start).toBe(4);
    expect(sliced.end).toBe(12);
    expect(sliced._glyphRuns[0].start).toBe(0);
    expect(sliced._glyphRuns[0].end).toBe(6);
    expect(sliced._glyphRuns[1].start).toBe(6);
    expect(sliced._glyphRuns[1].end).toBe(12);
    expect(sliced._glyphRuns[1].glyphs[0].id).toBe(16);

    // Test string indices.
    // The new glyph shouldn't interfer with current indices
    expect(string._glyphRuns[1].stringIndices[0]).toBe(0);
    expect(string._glyphRuns[1].stringIndices[1]).toBe(0);
  });

  test('should be able to iterate through glyph runs', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const glyphs = [];
    const indices = [];
    const positions = [];
    const xs = [];

    for (const { position, x, index, glyph } of string) {
      glyphs.push(glyph.id);
      indices.push(index);
      positions.push(round(position.xAdvance));
      xs.push(round(x));
    }

    expect(glyphs).toEqual([47, 82, 85, 72, 80, 3, 76, 83, 86, 88, 80]);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(positions).toEqual([6.23, 7.25, 4.66, 6.73, 11.16, 3.12, 3.04, 7.35, 5.72, 7.37, 11.16]);
    expect(xs).toEqual([0, 6.23, 13.48, 18.13, 24.87, 36.03, 39.15, 42.18, 49.54, 55.26, 62.63]);
  });

  test('should be able to iterate through glyph runs for sliced string', () => {
    const string = createLatinString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 8);

    const glyphs = [];
    const indices = [];
    const positions = [];
    const xs = [];

    for (const { position, x, index, glyph } of sliced) {
      glyphs.push(glyph.id);
      indices.push(index);
      positions.push(round(position.xAdvance));
      xs.push(round(x));
    }

    expect(glyphs).toEqual([80, 3, 76, 83]);
    expect(indices).toEqual([4, 5, 6, 7]);
    expect(positions).toEqual([11.16, 3.12, 3.04, 7.35]);
    expect(xs).toEqual([0, 11.16, 14.28, 17.31]);
  });
});
