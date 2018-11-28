import GlyphRun from '../../src/models/GlyphRun';
import GlyphString from '../../src/models/GlyphString';
import { layout, createCamboyanTestRun } from './glyphRuns';
import testFont from './font';

export const createLatinTestString = ({
  value = 'Lorem ipsum',
  runs = [[0, value.length]]
} = {}) => {
  let glyphIndex = 0;
  const attrs = { font: testFont, fontSize: 12, characterSpacing: 0 };

  const glyphRuns = runs.map(run => {
    const { glyphs, positions, stringIndices, glyphIndices } = layout(value.slice(run[0], run[1]));

    const glyphRun = new GlyphRun(
      glyphIndex,
      glyphIndex + glyphs.length,
      attrs,
      glyphs,
      positions,
      stringIndices,
      glyphIndices
    );

    glyphIndex += glyphRun.length;

    return glyphRun;
  });

  return new GlyphString(value, glyphRuns);
};

export const createCamboyanTestString = ({
  value = 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
  runs = [[0, value.length]]
} = {}) => {
  const glyphRuns = runs.map(run => {
    const glyphRun = createCamboyanTestRun({
      value,
      end: run[1],
      start: run[0]
    });

    return glyphRun;
  });

  return new GlyphString(value, glyphRuns, 0, value.length);
};
