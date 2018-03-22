import RunStyle from '../../src/models/RunStyle';
import GlyphRun from '../../src/models/GlyphRun';

/* eslint-disable-next-line */
export const glyphRunFactory = font => ({
  attributes = {},
  value = 'Lorem Ipsum',
  start = 0,
  end = value.length
} = {}) => {
  const string = value.slice(start, end);
  const run = font.layout(string);
  const attrs = new RunStyle(Object.assign({}, { font }, attributes));
  const { glyphs, positions, stringIndices } = run;
  const glyphRun = new GlyphRun(
    start,
    glyphs.length,
    attrs,
    glyphs,
    positions,
    stringIndices
  );

  return { glyphRun, glyphs, positions, stringIndices, attrs };
};
