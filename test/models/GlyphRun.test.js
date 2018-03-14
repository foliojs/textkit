import fontkit from 'fontkit';
import RunStyle from '../../src/models/RunStyle';
import GlyphRun from '../../src/models/GlyphRun';
import Attachment from '../../src/models/Attachment';

const font = fontkit.openSync(`${__dirname}/data/OpenSans-Regular.ttf`);

describe('GlyphRun', () => {
  let attrs;
  let glyphs;
  let positions;
  let stringIndices;

  const createRun = (value = 'Lorem Ipsum', attributes = {}) => {
    const run = font.layout(value);

    attrs = new RunStyle(Object.assign({}, { font }, attributes));

    glyphs = run.glyphs;
    positions = run.positions;
    stringIndices = run.stringIndices;

    return new GlyphRun(
      0,
      glyphs.length,
      attrs,
      glyphs,
      positions,
      stringIndices
    );
  };

  test('should get correct length', () => {
    const glyphRun = createRun();

    expect(glyphRun.length).toBe(glyphs.length);
  });

  test('should get ascent correctly when no attachments', () => {
    const glyphRun = createRun();
    const scale = attrs.fontSize / font.unitsPerEm;

    expect(glyphRun.ascent).toBe(font.ascent * scale);
  });

  test('should get ascent correctly when higher attachments', () => {
    const attachment = new Attachment(20, 50);
    const glyphRun = createRun(undefined, { attachment });

    expect(glyphRun.ascent).toBe(50);
  });

  test('should get ascent correctly when lower attachments', () => {
    const attachment = new Attachment(20, 10);
    const glyphRun = createRun(undefined, { attachment });
    const scale = attrs.fontSize / font.unitsPerEm;

    expect(glyphRun.ascent).toBe(font.ascent * scale);
  });

  test('should get descent correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createRun(undefined, { fontSize });
    const scale = fontSize / font.unitsPerEm;

    expect(glyphRun.descent).toBe(font.descent * scale);
  });

  test('should get descent correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createRun(undefined, { fontSize });
    const scale = fontSize / font.unitsPerEm;

    expect(glyphRun.descent).toBe(font.descent * scale);
  });

  test('should get lineGap correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createRun(undefined, { fontSize });
    const scale = fontSize / font.unitsPerEm;

    expect(glyphRun.lineGap).toBe(font.lineGap * scale);
  });

  test('should get height correctly when no attachments', () => {
    const fontSize = 20;
    const glyphRun = createRun(undefined, { fontSize });
    const scale = fontSize / font.unitsPerEm;

    const expectedHeight = (font.ascent - font.descent + font.lineGap) * scale;
    expect(glyphRun.height).toBe(expectedHeight);
  });

  test('should slice containing range', () => {
    const glyphRun = createRun();
    const sliced = glyphRun.slice(2, 5);

    const getId = g => g.id;
    const expectedGlyphs = glyphRun.glyphs.slice(2, 5);
    const expectedPositions = glyphRun.positions.slice(2, 5);
    const expectedIndices = glyphRun.stringIndices.slice(2, 5);

    expect(sliced.start).toBe(2);
    expect(sliced.end).toBe(5);
    expect(sliced.glyphs.map(getId)).toEqual(expectedGlyphs.map(getId));
    expect(sliced.positions).toEqual(expectedPositions);
    expect(sliced.stringIndices).toEqual(expectedIndices);
  });

  test('should slice exceeding range', () => {
    const glyphRun = createRun();
    const sliced = glyphRun.slice(2, 20);

    const getId = g => g.id;
    const expectedGlyphs = glyphRun.glyphs.slice(2);
    const expectedPositions = glyphRun.positions.slice(2);
    const expectedIndices = glyphRun.stringIndices.slice(2);

    expect(sliced.start).toBe(2);
    expect(sliced.end).toBe(glyphRun.end);
    expect(sliced.glyphs.map(getId)).toEqual(expectedGlyphs.map(getId));
    expect(sliced.positions).toEqual(expectedPositions);
    expect(sliced.stringIndices).toEqual(expectedIndices);
  });
});
