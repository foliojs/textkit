import path from 'path';
import fontkit from 'fontkit';
import Attachment from '../../src/models/Attachment';
import { glyphRunFactory } from '../utils/glyphRuns';

const khmer = fontkit.openSync(path.resolve(__dirname, '../data/Khmer.ttf'));
const openSans = fontkit.openSync(path.resolve(__dirname, '../data/OpenSans-Regular.ttf'));

const createKhmerRun = glyphRunFactory(khmer);
const createLatinRun = glyphRunFactory(openSans);

const round = num => Math.round(num * 100) / 100;

describe('GlyphRun', () => {
  test('should get correct length', () => {
    const { glyphRun, glyphs } = createLatinRun();

    expect(glyphRun.length).toBe(glyphs.length);
  });

  test('should get correct start', () => {
    const { glyphRun } = createLatinRun();

    expect(glyphRun.start).toBe(0);
  });

  test('should get correct start (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });

    expect(glyphRun.start).toBe(0);
  });

  test('should get correct end', () => {
    const { glyphRun } = createLatinRun();

    expect(glyphRun.end).toBe(11);
  });

  test('should get correct end (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });

    expect(glyphRun.end).toBe(16);
  });

  test('should get ascent correctly when no attachments', () => {
    const { glyphRun, attrs } = createLatinRun();
    const scale = attrs.fontSize / openSans.unitsPerEm;

    expect(glyphRun.ascent).toBe(openSans.ascent * scale);
  });

  test('should get ascent correctly when higher attachments', () => {
    const attachment = new Attachment(20, 50);
    const { glyphRun } = createLatinRun({ attributes: { attachment } });

    expect(glyphRun.ascent).toBe(50);
  });

  test('should get ascent correctly when lower attachments', () => {
    const attachment = new Attachment(20, 10);
    const { glyphRun, attrs } = createLatinRun({ attributes: { attachment } });
    const scale = attrs.fontSize / openSans.unitsPerEm;

    expect(glyphRun.ascent).toBe(openSans.ascent * scale);
  });

  test('should get descent correctly when no attachments', () => {
    const fontSize = 20;
    const { glyphRun } = createLatinRun({ attributes: { fontSize } });
    const scale = fontSize / openSans.unitsPerEm;

    expect(glyphRun.descent).toBe(openSans.descent * scale);
  });

  test('should get descent correctly when no attachments', () => {
    const fontSize = 20;
    const { glyphRun } = createLatinRun({ attributes: { fontSize } });
    const scale = fontSize / openSans.unitsPerEm;

    expect(glyphRun.descent).toBe(openSans.descent * scale);
  });

  test('should get lineGap correctly when no attachments', () => {
    const fontSize = 20;
    const { glyphRun } = createLatinRun({ attributes: { fontSize } });
    const scale = fontSize / openSans.unitsPerEm;

    expect(glyphRun.lineGap).toBe(openSans.lineGap * scale);
  });

  test('should get height correctly when no attachments', () => {
    const fontSize = 20;
    const { glyphRun } = createLatinRun({ attributes: { fontSize } });
    const scale = fontSize / openSans.unitsPerEm;

    const expectedHeight = (openSans.ascent - openSans.descent + openSans.lineGap) * scale;
    expect(glyphRun.height).toBe(expectedHeight);
  });

  test('should exact slice range return same run', () => {
    const { glyphRun } = createLatinRun({ start: 0 });
    const sliced = glyphRun.slice(0, 11);

    expect(sliced.start).toBe(0);
    expect(sliced.end).toBe(11);
  });

  test('should slice containing range', () => {
    const { glyphRun } = createLatinRun({ start: 0 });
    const sliced = glyphRun.slice(2, 5);

    expect(sliced.start).toBe(2);
    expect(sliced.end).toBe(5);
  });

  test('should slice exceeding range', () => {
    const { glyphRun } = createLatinRun({ start: 0 });
    const sliced = glyphRun.slice(2, 20);

    expect(sliced.start).toBe(2);
    expect(sliced.end).toBe(11);
  });

  test('should slice containing range when start not zero', () => {
    const { glyphRun } = createLatinRun({ start: 5 });
    const sliced = glyphRun.slice(2, 5);

    expect(sliced.start).toBe(7);
    expect(sliced.end).toBe(10);
  });

  test('should slice exceeding range when start not zero', () => {
    const { glyphRun } = createLatinRun({ start: 5 });
    const sliced = glyphRun.slice(2, 20);

    expect(sliced.start).toBe(7);
    expect(sliced.end).toBe(11);
  });

  test('should correctly slice glyphs', () => {
    //  47    82    85    72    80    3    918   83    86    88    80
    //   l     o     r    e     m          i     p     s     u     m
    const { glyphRun } = createLatinRun({ start: 0 });
    const { glyphs } = glyphRun.slice(2, 8);

    expect(glyphs.map(g => g.id)).toEqual([85, 72, 80, 3, 918, 83]);
  });

  test('should correctly slice glyphs (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });
    const { glyphs } = glyphRun.slice(1, 8);

    expect(glyphs.map(g => g.id)).toEqual([153, 177, 112, 248, 188, 49, 296]);
  });

  test('should exact slice return same glyphs', () => {
    //  47    82    85    72    80    3    918   83    86    88    80
    //   l     o     r    e     m          i     p     s     u     m
    const { glyphRun } = createLatinRun({ start: 0 });
    const { glyphs } = glyphRun.slice(0, 11);

    expect(glyphs.map(g => g.id)).toEqual([47, 82, 85, 72, 80, 3, 918, 83, 86, 88, 80]);
  });

  test('should exact slice return same glyphs (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });
    const { glyphs } = glyphRun.slice(0, 21);

    expect(glyphs.map(g => g.id)).toEqual([
      45,
      153,
      177,
      112,
      248,
      188,
      49,
      296,
      44,
      187,
      149,
      44,
      117,
      236,
      188,
      63
    ]);
  });

  test('should correctly slice positions', () => {
    // 6.23  7.25  4.66  6.73  11.16  3.12  3.35  7.35  5.72  7.37  11.16
    //   l     o     r    e      m            i     p     s     u     m
    const { glyphRun } = createLatinRun({ start: 0 });
    const sliced = glyphRun.slice(2, 8);
    const positions = sliced.positions.map(p => round(p.xAdvance));

    expect(positions).toEqual([4.66, 6.73, 11.16, 3.12, 3.35, 7.35]);
  });

  test('should correctly slice positions (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });
    const sliced = glyphRun.slice(1, 8);
    const positions = sliced.positions.map(p => round(p.xAdvance));

    expect(positions).toEqual([0, 0, 0, 9.08, 4.54, 9.08, 18.16]);
  });

  test('should exact slice return same positions', () => {
    // 6.23  7.25  4.66  6.73  11.16  3.12  3.35  7.35  5.72  7.37  11.16
    //   l     o     r    e      m            i     p     s     u     m
    const { glyphRun } = createLatinRun({ start: 0 });
    const sliced = glyphRun.slice(0, 11);
    const positions = sliced.positions.map(p => round(p.xAdvance));

    expect(positions).toEqual([6.23, 7.25, 4.66, 6.73, 11.16, 3.12, 3.35, 7.35, 5.72, 7.37, 11.16]);
  });

  test('should exact slice return same positions (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });
    const sliced = glyphRun.slice(0, 21);
    const positions = sliced.positions.map(p => round(p.xAdvance));

    expect(positions).toEqual([
      9.08,
      0,
      0,
      0,
      9.08,
      4.54,
      9.08,
      18.16,
      9.08,
      13.62,
      0,
      9.08,
      0,
      9.08,
      4.54,
      9.08
    ]);
  });

  test('should correctly slice string indices', () => {
    const { glyphRun } = createLatinRun({ start: 0 });
    const { stringIndices } = glyphRun.slice(2, 8);

    expect(stringIndices).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test('should correctly slice string indices (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });
    const { stringIndices } = glyphRun.slice(1, 8);

    expect(stringIndices).toEqual([0, 2, 3, 4, 5, 6, 7]);
  });

  test('should exact slice return same string indices', () => {
    const { glyphRun } = createLatinRun({ start: 0 });
    const { stringIndices } = glyphRun.slice(0, 11);

    expect(stringIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('should exact slice return same string indices (non latin)', () => {
    const { glyphRun } = createKhmerRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន', start: 0 });
    const { stringIndices } = glyphRun.slice(0, 21);

    expect(stringIndices).toEqual([0, 1, 3, 4, 5, 6, 7, 8, 12, 13, 14, 16, 17, 18, 19, 20]);
  });

  test('should correctly slice glyph indices', () => {
    const { glyphRun } = createLatinRun({ start: 0 });
    const { glyphIndices } = glyphRun.slice(2, 8);

    expect(glyphIndices).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
