import { createLatinTestString, createCamboyanTestString } from '../utils/glyphStrings';

const round = num => Math.round(num * 100) / 100;

describe('GlyphString', () => {
  test('should get string value', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.string).toBe('Lorem ipsum');
  });

  test('should get string length', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.length).toBe(11);
  });

  test('should get string length (non latin)', () => {
    const string = createCamboyanTestString({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });

    expect(string.length).toBe(16);
  });

  test('should get string advance width', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.advanceWidth).toBeCloseTo(63, 0);
  });

  test('should get string height', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.height).toBeCloseTo(14, 0);
  });

  test('should get string ascent', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.ascent).toBeCloseTo(11, 0);
  });

  test('should get string descent', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.descent).toBeCloseTo(-2.9, 1);
  });

  test('should get glyph runs', () => {
    const string = createLatinTestString({
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
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(2, 8);

    expect(sliced.glyphRuns).toHaveLength(2);
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(4);
    expect(sliced.glyphRuns[1].start).toBe(4);
    expect(sliced.glyphRuns[1].end).toBe(6);
  });

  test('should get glyphs run for sliced string (non latin)', () => {
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(1, 15);

    expect(sliced.glyphRuns).toHaveLength(2);
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(6);
    expect(sliced.glyphRuns[1].start).toBe(6);
    expect(sliced.glyphRuns[1].end).toBe(14);
  });

  test('should isWhiteSpace return true if white space', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.isWhiteSpace(5)).toBeTruthy();
  });

  test('should isWhiteSpace return false if non white space', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });

    expect(string.isWhiteSpace(3)).toBeFalsy();
  });

  test('should slice exact range', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });
    const sliced = string.slice(0, string.length);

    expect(sliced.string).toBe('Lorem ipsum');
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(string.length);
  });

  test('should slice containing range', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });
    const sliced = string.slice(2, 6);

    expect(sliced.length).toBe(4);
    expect(sliced.string).toBe('rem ');
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(4);
    expect(sliced.glyphRuns[0].glyphs.length).toBe(4);
  });

  test('should slice exceeding range', () => {
    const string = createLatinTestString({ value: 'Lorem ipsum' });
    const sliced = string.slice(2, 14);

    expect(sliced.length).toBe(9);
    expect(sliced.string).toBe('rem ipsum');
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(9);
    expect(sliced.glyphRuns[0].glyphs.length).toBe(9);
  });

  test('should ignore unnecesary trailing runs when slice', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(2, 6);

    expect(sliced.length).toBe(4);
    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(4);
  });

  test('should ignore unnecesary leading runs when slice', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(6, 9);

    expect(sliced.length).toBe(3);
    expect(sliced.string).toBe('ips');
    expect(sliced.glyphRuns).toHaveLength(1);
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(3);
  });

  test('should return correct run index at glyph index', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runIndexAtGlyphIndex(2)).toBe(0);
    expect(string.runIndexAtGlyphIndex(9)).toBe(1);
  });

  test('should return correct run index at glyph index (non latin)', () => {
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
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
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runAtGlyphIndex(2).start).toBe(0);
    expect(string.runAtGlyphIndex(9).start).toBe(6);
  });

  test('should return correct run at glyph index for sliced strings', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runAtGlyphIndex(0).start).toBe(0);
    expect(sliced.runAtGlyphIndex(1).start).toBe(0);
    expect(sliced.runAtGlyphIndex(2).start).toBe(2);
    expect(sliced.runAtGlyphIndex(5).start).toBe(2);

    const sliced2 = string.slice(7, 11);

    expect(sliced2.runAtGlyphIndex(0).start).toBe(0);
    expect(sliced2.runAtGlyphIndex(1).start).toBe(0);
    expect(sliced2.runAtGlyphIndex(2).start).toBe(0);
  });

  test('should return correct run index at string index', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runIndexAtStringIndex(2)).toBe(0);
    expect(string.runIndexAtStringIndex(5)).toBe(0);
    expect(string.runIndexAtStringIndex(6)).toBe(1);
    expect(string.runIndexAtStringIndex(9)).toBe(1);
  });

  test('should return correct run index at string index (non latin)', () => {
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
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
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.runAtStringIndex(2).start).toBe(0);
    expect(string.runAtStringIndex(9).start).toBe(6);
  });

  test('should return correct run at string index (non latin)', () => {
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    expect(string.runAtStringIndex(2).start).toBe(0);
    expect(string.runAtStringIndex(7).start).toBe(0);
    expect(string.runAtStringIndex(8).start).toBe(7);
    expect(string.runAtStringIndex(20).start).toBe(7);
  });

  test('should return correct run at string index for sliced strings', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.string).toBe('m ipsum');
    expect(sliced.runAtStringIndex(0).start).toBe(0);
    expect(sliced.runAtStringIndex(1).start).toBe(0);
    expect(sliced.runAtStringIndex(2).start).toBe(2);
    expect(sliced.runAtStringIndex(5).start).toBe(2);
    expect(sliced.runAtStringIndex(5).end).toBe(7);
  });

  test('should return correct run at string index for sliced strings (non latin)', () => {
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.runAtStringIndex(0).start).toBe(0);
    expect(sliced.runAtStringIndex(1).start).toBe(0);
    expect(sliced.runAtStringIndex(2).start).toBe(0);
    expect(sliced.runAtStringIndex(3).start).toBe(3);
    expect(sliced.runAtStringIndex(6).start).toBe(3);
  });

  test('should return correct glyph at index', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const firstRunGlyphs = string.glyphRuns[0].glyphs;
    const secondRunGlyphs = string.glyphRuns[1].glyphs;

    expect(string.glyphAtIndex(2).id).toBe(firstRunGlyphs[2].id);
    expect(string.glyphAtIndex(9).id).toBe(secondRunGlyphs[3].id);
  });

  test('should return correct glyph at index (non latin)', () => {
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const firstRunGlyphs = string.glyphRuns[0].glyphs;
    const secondRunGlyphs = string.glyphRuns[1].glyphs;

    expect(string.glyphAtIndex(2).id).toBe(firstRunGlyphs[2].id);
    expect(string.glyphAtIndex(6).id).toBe(firstRunGlyphs[6].id);
    expect(string.glyphAtIndex(7).id).toBe(secondRunGlyphs[0].id);
    expect(string.glyphAtIndex(15).id).toBe(secondRunGlyphs[8].id);
  });

  test('should return correct glyph at index for sliced strings', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);
    const firstRunGlyphs = sliced.glyphRuns[0].glyphs;
    const secondRunGlyphs = sliced.glyphRuns[1].glyphs;

    expect(sliced.glyphAtIndex(0).id).toBe(firstRunGlyphs[0].id);
    expect(sliced.glyphAtIndex(1).id).toBe(firstRunGlyphs[1].id);
    expect(sliced.glyphAtIndex(2).id).toBe(secondRunGlyphs[0].id);
    expect(sliced.glyphAtIndex(5).id).toBe(secondRunGlyphs[3].id);
  });

  test('should return correct glyph at index for sliced strings (non latin)', () => {
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);
    const firstRunGlyphs = sliced.glyphRuns[0].glyphs;
    const secondRunGlyphs = sliced.glyphRuns[1].glyphs;

    expect(sliced.glyphAtIndex(0).id).toBe(firstRunGlyphs[0].id);
    expect(sliced.glyphAtIndex(2).id).toBe(firstRunGlyphs[2].id);
    expect(sliced.glyphAtIndex(3).id).toBe(secondRunGlyphs[0].id);
  });

  test('should return correct glyph width at index', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const firstRunPositions = string.glyphRuns[0].positions;
    const secondRunPositions = string.glyphRuns[1].positions;

    expect(string.getGlyphWidth(2)).toBe(firstRunPositions[2].xAdvance);
    expect(string.getGlyphWidth(9)).toBe(secondRunPositions[3].xAdvance);
  });

  test('should return correct glyph width at index (non latin)', () => {
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const firstRunPositions = string.glyphRuns[0].positions;
    const secondRunPositions = string.glyphRuns[1].positions;

    expect(string.getGlyphWidth(0)).toBe(firstRunPositions[0].xAdvance);
    expect(string.getGlyphWidth(6)).toBe(firstRunPositions[6].xAdvance);
    expect(string.getGlyphWidth(7)).toBe(secondRunPositions[0].xAdvance);
    expect(string.getGlyphWidth(15)).toBe(secondRunPositions[8].xAdvance);
  });

  test('should return correct glyph width at index for sliced strings', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);
    const firstRunPositions = sliced.glyphRuns[0].positions;
    const secondRunPositions = sliced.glyphRuns[1].positions;

    expect(sliced.getGlyphWidth(0)).toBe(firstRunPositions[0].xAdvance);
    expect(sliced.getGlyphWidth(1)).toBe(firstRunPositions[1].xAdvance);
    expect(sliced.getGlyphWidth(2)).toBe(secondRunPositions[0].xAdvance);
    expect(sliced.getGlyphWidth(5)).toBe(secondRunPositions[3].xAdvance);
  });

  test('should return correct glyph width at index for sliced strings (non latin)', () => {
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 11);
    const firstRunPositions = sliced.glyphRuns[0].positions;
    const secondRunPositions = sliced.glyphRuns[1].positions;

    expect(sliced.getGlyphWidth(0)).toBe(firstRunPositions[0].xAdvance);
    expect(sliced.getGlyphWidth(1)).toBe(firstRunPositions[1].xAdvance);
    expect(sliced.getGlyphWidth(3)).toBe(secondRunPositions[0].xAdvance);
    expect(sliced.getGlyphWidth(4)).toBe(secondRunPositions[1].xAdvance);
  });

  test('should return correct glyph index at offset', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.glyphIndexAtOffset(5)).toBe(0);
    expect(string.glyphIndexAtOffset(17)).toBe(2);
    expect(string.glyphIndexAtOffset(39)).toBe(7);
    expect(string.glyphIndexAtOffset(50)).toBe(8);
  });

  test('should return correct glyph index at offset (non latin)', () => {
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    //   m          i     p     s     u     m
    //   6     3    6     6     6     6     6
    const sliced = string.slice(4, 11);

    expect(sliced.glyphIndexAtOffset(5)).toBe(0);
    expect(sliced.glyphIndexAtOffset(7)).toBe(1);
    expect(string.glyphIndexAtOffset(13)).toBe(2);
    expect(sliced.glyphIndexAtOffset(17)).toBe(3);
    expect(sliced.glyphIndexAtOffset(27)).toBe(5);
    expect(sliced.glyphIndexAtOffset(34)).toBe(6);
  });

  test('should return correct glyph index at offset for sliced strings (non latin)', () => {
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.stringIndexForGlyphIndex(0)).toBe(0);
    expect(string.stringIndexForGlyphIndex(2)).toBe(2);
    expect(string.stringIndexForGlyphIndex(9)).toBe(9);
    expect(string.stringIndexForGlyphIndex(10)).toBe(10);
  });

  test('should slice with ligatures at the end', () => {
    const string = createLatinTestString({
      value: 'Lorft'
    });

    const sliced = string.slice(0, 4);

    expect(sliced.string).toBe('Lorft');
    expect(sliced.glyphRuns.length).toBe(1);
    expect(sliced.glyphRuns[0].stringIndices).toEqual([0, 1, 2, 3]);
    expect(sliced.glyphRuns[0].glyphIndices).toEqual([0, 1, 2, 3, 3]);
  });

  test('should return correct string index for glyph index with ligatures (end)', () => {
    const string = createLatinTestString({
      value: 'Lorft ipsum',
      runs: [[0, 5], [5, 11]]
    });

    expect(string.isWhiteSpace(3)).toBeFalsy();
    expect(string.isWhiteSpace(4)).toBeTruthy();
    expect(string.stringIndexForGlyphIndex(0)).toBe(0);
    expect(string.stringIndexForGlyphIndex(2)).toBe(2);
    expect(string.stringIndexForGlyphIndex(3)).toBe(3);
    expect(string.stringIndexForGlyphIndex(4)).toBe(5);
    expect(string.stringIndexForGlyphIndex(5)).toBe(6);
    expect(string.stringIndexForGlyphIndex(9)).toBe(10);
  });

  test('should return correct string index for glyph index with ligatures (middle)', () => {
    const string = createLatinTestString({
      value: 'Lftem ipsum',
      runs: [[0, 5], [5, 11]]
    });

    expect(string.isWhiteSpace(3)).toBeFalsy();
    expect(string.isWhiteSpace(4)).toBeTruthy();
    expect(string.stringIndexForGlyphIndex(0)).toBe(0);
    expect(string.stringIndexForGlyphIndex(1)).toBe(1);
    expect(string.stringIndexForGlyphIndex(2)).toBe(3);
    expect(string.stringIndexForGlyphIndex(4)).toBe(5);
    expect(string.stringIndexForGlyphIndex(5)).toBe(6);
    expect(string.stringIndexForGlyphIndex(9)).toBe(10);
  });

  test('should return correct string index for glyph index (non latin)', () => {
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    const sliced = string.slice(4, 11);

    expect(sliced.stringIndexForGlyphIndex(0)).toBe(0);
    expect(sliced.stringIndexForGlyphIndex(2)).toBe(2);
    expect(sliced.stringIndexForGlyphIndex(6)).toBe(6);
  });

  test('should return correct string index for glyph index for sliced strings (not latin)', () => {
    const string = createCamboyanTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.glyphIndexForStringIndex(0)).toBe(0);
    expect(string.glyphIndexForStringIndex(2)).toBe(2);
    expect(string.glyphIndexForStringIndex(9)).toBe(9);
    expect(string.glyphIndexForStringIndex(10)).toBe(10);
  });

  // test('should return correct glyph index for string index (not latin)', () => {
  //   const string = createCamboyanTestString({
  //     value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
  //     runs: [[0, 8], [8, 21]]
  //   });

  //   // console.log(string.string);
  //   // console.log(string.glyphRuns);

  //   // expect(string.glyphIndexForStringIndex(0)).toBe(0);
  //   // expect(string.glyphIndexForStringIndex(4)).toBe(3);
  //   // expect(string.glyphIndexForStringIndex(7)).toBe(6);
  //   // expect(string.glyphIndexForStringIndex(8)).toBe(7);
  //   // expect(string.glyphIndexForStringIndex(12)).toBe(8);
  // });

  test('should return correct glyph index for string index for sliced strings', () => {
    const string = createLatinTestString({
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
    const string = createCamboyanTestString({
      value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
      runs: [[0, 8], [8, 21]]
    });

    const sliced = string.slice(4, 15);

    expect(sliced.glyphIndexForStringIndex(0)).toBe(0);
    expect(sliced.glyphIndexForStringIndex(3)).toBe(3);
    expect(sliced.glyphIndexForStringIndex(4)).toBe(4);
  });

  test('should return correct glyph code at glyph index', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.codePointAtGlyphIndex(2)).toBe('r'.charCodeAt(0));
    expect(string.codePointAtGlyphIndex(9)).toBe('u'.charCodeAt(0));
  });

  test('should return correct glyph code at glyph index for sliced strings', () => {
    const string = createLatinTestString({
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
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.charAtGlyphIndex(2)).toBe('r');
    expect(string.charAtGlyphIndex(9)).toBe('u');
  });

  test('should return correct char at glyph index for sliced strings', () => {
    const string = createLatinTestString({
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
    //   l     o     r    e     m            i     p     s     u     m
    //   6     6     6    6     6      3     6     6     6     6     6
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    expect(string.offsetAtGlyphIndex(0)).toBeCloseTo(0);
    expect(string.offsetAtGlyphIndex(1)).toBeCloseTo(6, 1);
    expect(string.offsetAtGlyphIndex(5)).toBeCloseTo(30, 1);
    expect(string.offsetAtGlyphIndex(8)).toBeCloseTo(45, 1);
  });

  test('should return correct offset at glyph index for sliced strings', () => {
    const string = createLatinTestString({
      value: 'Lorem ipsum',
      runs: [[0, 6], [6, 11]]
    });

    //   m       i   p   s   u   m
    //   6   3   6   6   6   6   6
    const sliced = string.slice(4, 11);

    expect(sliced.offsetAtGlyphIndex(0)).toBeCloseTo(0);
    expect(sliced.offsetAtGlyphIndex(1)).toBeCloseTo(6, 2);
    expect(sliced.offsetAtGlyphIndex(4)).toBeCloseTo(21, 2);
    expect(sliced.offsetAtGlyphIndex(5)).toBeCloseTo(27, 2);
    expect(sliced.offsetAtGlyphIndex(6)).toBeCloseTo(33, 2);
  });

  test('should return correct index of', () => {
    const string = createLatinTestString({
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
    const string = createLatinTestString({
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
    const string = createLatinTestString({
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
    const string = createLatinTestString({ value: 'L ' });

    expect(string.isWhiteSpace(0)).toBeFalsy();
    expect(string.isWhiteSpace(1)).toBeTruthy();
  });

  test('should return if is white space for index for sliced string', () => {
    const string = createLatinTestString({ value: 'someL ' });

    const sliced = string.slice(4, string.length);

    expect(sliced.isWhiteSpace(0)).toBeFalsy();
    expect(sliced.isWhiteSpace(1)).toBeTruthy();
  });

  test('should successfully insert glyph', () => {
    const char = 0x002d; // "-"
    const string = createLatinTestString({ value: 'Lorem ipsum', runs: [[0, 6], [6, 11]] });

    string.insertGlyph(2, char);

    expect(string.glyphRuns[0].start).toBe(0);
    expect(string.glyphRuns[0].end).toBe(7);
    expect(string.glyphRuns[1].start).toBe(7);
    expect(string.glyphRuns[1].end).toBe(12);
    expect(string.glyphRuns[0].glyphs[2].id).toBe(45);

    // Test string indices.
    // The new glyph shouldn't interfer with current indices
    expect(string.glyphRuns[0].stringIndices[2]).toBe(2);
    expect(string.glyphRuns[0].stringIndices[3]).toBe(2);

    // Test glyph indices.
    // Should increment glyph indices
    expect(string.glyphRuns[0].glyphIndices[1]).toBe(1);
    expect(string.glyphRuns[0].glyphIndices[2]).toBe(3);
  });

  test('should successfully insert glyph for sliced strings', () => {
    const char = 0x002d; // "-"
    const string = createLatinTestString({ value: 'Lorem ipsum', runs: [[0, 6], [6, 11]] });
    const sliced = string.slice(4, string.length);

    sliced.insertGlyph(2, char);

    expect(sliced.start).toBe(0);
    expect(sliced.end).toBe(8);
    expect(sliced.glyphRuns[0].start).toBe(0);
    expect(sliced.glyphRuns[0].end).toBe(2);
    expect(sliced.glyphRuns[1].start).toBe(2);
    expect(sliced.glyphRuns[1].end).toBe(8);
    expect(sliced.glyphRuns[1].glyphs[0].id).toBe(45);
  });

  test('should be able to iterate through glyph runs', () => {
    const string = createLatinTestString({
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

    expect(glyphs).toEqual([76, 111, 114, 101, 109, 32, 105, 112, 115, 117, 109]);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(positions).toEqual([6, 6, 6, 6, 6, 3, 6, 6, 6, 6, 6]);
    expect(xs).toEqual([0, 6, 12, 18, 24, 30, 33, 39, 45, 51, 57]);
  });

  test('should be able to iterate through glyph runs for sliced string', () => {
    const string = createLatinTestString({
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

    expect(glyphs).toEqual([109, 32, 105, 112]);
    expect(indices).toEqual([0, 1, 2, 3]);
    expect(positions).toEqual([6, 3, 6, 6]);
    expect(xs).toEqual([0, 6, 9, 15]);
  });
});
