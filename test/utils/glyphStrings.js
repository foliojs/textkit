import RunStyle from '../../src/models/RunStyle';
import GlyphRun from '../../src/models/GlyphRun';
import GlyphString from '../../src/models/GlyphString';

/* eslint-disable-next-line */
export const glyphStringFactory = font => ({
  value = 'Lorem ipsum',
  runs = [[0, value.length]]
} = {}) => {
  let glyphIndex = 0;

  const glyphRuns = runs.map(run => {
    const string = value.slice(run[0], run[1]);
    const attrs = new RunStyle(Object.assign({}, { font }));
    const { glyphs, positions, stringIndices } = font.layout(string);
    const glyphRun = new GlyphRun(
      glyphIndex,
      glyphIndex + glyphs.length,
      attrs,
      glyphs,
      positions,
      stringIndices
    );

    glyphIndex += glyphs.length;

    return glyphRun;
  });

  return new GlyphString(value, glyphRuns, 0, value.length);
};
