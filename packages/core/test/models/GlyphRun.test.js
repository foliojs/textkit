import Attachment from '../../src/models/Attachment';
import testFont from '../utils/font';
import { createLatinTestRun, createCamboyanTestRun } from '../utils/glyphRuns';

const round = num => Math.round(num * 100) / 100;

describe('GlyphRun', () => {
  test('should get correct length', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });

    expect(glyphRun.length).toBe(11);
  });

  test('should get correct start', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });

    expect(glyphRun.start).toBe(0);
  });

  test('should get correct start (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });

    expect(glyphRun.start).toBe(0);
  });

  test('should get correct end', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });

    expect(glyphRun.end).toBe(11);
  });

  test('should get correct end (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });

    expect(glyphRun.end).toBe(16);
  });

  test('should get ascent correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum', attributes: { fontSize } });
    const scale = fontSize / testFont.unitsPerEm;

    expect(glyphRun.ascent).toBe(testFont.ascent * scale);
  });

  test('should get ascent correctly when higher attachments', () => {
    const attachment = new Attachment(20, 50);
    const glyphRun = createLatinTestRun({ attributes: { attachment } });

    expect(glyphRun.ascent).toBe(50);
  });

  test('should get ascent correctly when lower attachments', () => {
    const fontSize = 30;
    const attachment = new Attachment(20, 10);
    const glyphRun = createLatinTestRun({ attributes: { attachment, fontSize } });
    const scale = fontSize / testFont.unitsPerEm;

    expect(glyphRun.ascent).toBe(testFont.ascent * scale);
  });

  test('should get descent correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createLatinTestRun({ attributes: { fontSize } });
    const scale = fontSize / testFont.unitsPerEm;

    expect(glyphRun.descent).toBe(testFont.descent * scale);
  });

  test('should get descent correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createLatinTestRun({ attributes: { fontSize } });
    const scale = fontSize / testFont.unitsPerEm;

    expect(glyphRun.descent).toBe(testFont.descent * scale);
  });

  test('should get lineGap correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createLatinTestRun({ attributes: { fontSize } });
    const scale = fontSize / testFont.unitsPerEm;

    expect(glyphRun.lineGap).toBe(testFont.lineGap * scale);
  });

  test('should get height correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createLatinTestRun({ attributes: { fontSize } });
    const { ascent, descent, lineGap, unitsPerEm } = testFont;

    const scale = fontSize / unitsPerEm;
    const expectedHeight = (ascent - descent + lineGap) * scale;

    expect(glyphRun.height).toBe(expectedHeight);
  });

  test('should exact slice range return same run', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const sliced = glyphRun.slice(0, 11);

    expect(sliced.start).toBe(0);
    expect(sliced.end).toBe(11);
  });

  test('should slice containing range', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const sliced = glyphRun.slice(2, 5);

    expect(sliced.start).toBe(2);
    expect(sliced.end).toBe(5);
  });

  test('should slice exceeding range', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const sliced = glyphRun.slice(2, 20);

    expect(sliced.start).toBe(2);
    expect(sliced.end).toBe(11);
  });

  test('should slice containing range when start not zero', () => {
    const glyphRun = createLatinTestRun({ start: 5 });
    const sliced = glyphRun.slice(2, 5);

    expect(sliced.start).toBe(7);
    expect(sliced.end).toBe(10);
  });

  test('should slice exceeding range when start not zero', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum', start: 5 });
    const sliced = glyphRun.slice(2, 20);

    expect(sliced.start).toBe(7);
    expect(sliced.end).toBe(11);
  });

  test('should correctly slice glyphs', () => {
    //  76    111   114  101   109   32   73    112   115   117   109
    //   l     o     r    e     m          i     p     s     u     m
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const { glyphs } = glyphRun.slice(2, 8);

    expect(glyphs.map(g => g.id)).toEqual([114, 101, 109, 32, 73, 112]);
  });

  test('should correctly slice glyphs (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });
    const { glyphs } = glyphRun.slice(1, 8);

    expect(glyphs.map(g => g.id)).toEqual([6098, 6025, 6075, 6086, 6050, 6070, 6021]);
  });

  test('should exact slice return same glyphs', () => {
    //  76    111   114  101   109   32   73    112   115   117   109
    //   l     o     r    e     m          i     p     s     u     m
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const { glyphs } = glyphRun.slice(0, 11);

    expect(glyphs.map(g => g.id)).toEqual([76, 111, 114, 101, 109, 32, 73, 112, 115, 117, 109]);
  });

  test('should exact slice return same glyphs (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });
    const { glyphs } = glyphRun.slice(0, 21);

    expect(glyphs.map(g => g.id)).toEqual([
      6017,
      6098,
      6025,
      6075,
      6086,
      6050,
      6070,
      6021,
      6025,
      6089,
      6070,
      6086,
      6016,
      6025,
      6098,
      6021
    ]);
  });

  test('should correctly slice positions', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const sliced = glyphRun.slice(2, 8);
    const positions = sliced.positions.map(p => round(p.xAdvance));

    expect(positions).toEqual([6, 6, 6, 3, 6, 6]);
  });

  test('should correctly slice positions (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });
    const sliced = glyphRun.slice(1, 8);
    const positions = sliced.positions.map(p => round(p.xAdvance));

    expect(positions).toEqual([0, 0, 0, 9.08, 4.54, 9.08, 18.16]);
  });

  test('should exact slice return same positions', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const sliced = glyphRun.slice(0, 11);
    const positions = sliced.positions.map(p => round(p.xAdvance));

    expect(positions).toEqual([6, 6, 6, 6, 6, 3, 6, 6, 6, 6, 6]);
  });

  test('should exact slice return same positions (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });
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
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const { stringIndices } = glyphRun.slice(2, 8);

    expect(stringIndices).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test('should correctly slice string indices (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });
    const { stringIndices } = glyphRun.slice(1, 8);

    expect(stringIndices).toEqual([0, 2, 3, 4, 5, 6, 7]);
  });

  test('should exact slice return same string indices', () => {
    const glyphRun = createLatinTestRun({ value: 'Lorem Ipsum' });
    const { stringIndices } = glyphRun.slice(0, 11);

    expect(stringIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  test('should exact slice return same string indices (non latin)', () => {
    const glyphRun = createCamboyanTestRun({ value: 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន' });
    const { stringIndices } = glyphRun.slice(0, 21);

    expect(stringIndices).toEqual([0, 1, 3, 4, 5, 6, 7, 8, 12, 13, 14, 16, 17, 18, 19, 20]);
  });
});
