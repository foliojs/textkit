import RunStyle from '../../src/models/RunStyle';
import GlyphRun from '../../src/models/GlyphRun';
import testFont from './font';

/*
  Returns a glyph index based on a string index and a string indices array
*/
const getGlyphIndex = stringIndices => index => {
  let res = 0;
  while (stringIndices[res] < index) res += 1;
  return res;
};

/*
  Text layout generator.
  Calculates chars id based on the glyph code point only for testing purposes
  Calculates position with fixed value based on if it's white space or not
*/
const layout = value => {
  const chars = value.replace(/fs/, 'f').split('');
  const glyphs = chars.map(char => ({ id: char.charCodeAt(0) }));
  const stringIndices = chars.map((_, index) => index);
  const glyphIndices = chars.map((_, index) => index);
  const positions = chars.map(char => ({
    xAdvance: char === ' ' ? 512 : 1024
  }));

  return {
    glyphs,
    positions,
    stringIndices,
    glyphIndices
  };
};

/*
  Dummy Latin language GlyphRun constructor that simulates fontkit's work.
  We don't use fontkit here because string indices are not merged into master yet
*/
export const createLatinTestRun = ({
  value = 'Lorem Ipsum',
  attributes = {},
  start = 0,
  end = value.length
} = {}) => {
  const string = value.slice(start, end);
  const attrs = new RunStyle(Object.assign({}, { font: testFont }, attributes));
  const { glyphs, positions, stringIndices, glyphIndices } = layout(string);

  return new GlyphRun(
    start,
    start + glyphs.length,
    attrs,
    glyphs,
    positions,
    stringIndices,
    glyphIndices
  );
};

/*
  Dummy Non-Latin language GlyphRun constructor that simulates fontkit's work.
  We don't use fontkit here because string indices are not merged into master yet
  Values were taken by using Khmer font
*/
export const createCamboyanTestRun = ({
  value = 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
  attributes = {},
  start = 0,
  end = value.length
} = {}) => {
  const stringIndices = [0, 1, 3, 4, 5, 6, 7, 8, 12, 13, 14, 16, 17, 18, 19, 20];
  const glyphIndices = [0, 1, 2, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 9, 10, 11, 11, 12, 13, 14, 15];
  const getIndex = getGlyphIndex(stringIndices);
  const startGlyphIndex = getIndex(start);
  const endGlyphIndex = getIndex(end);
  const string = value.slice(startGlyphIndex, endGlyphIndex);
  const attrs = new RunStyle(Object.assign({}, { font: testFont }, attributes));
  const positions = [
    { xAdvance: 1549 },
    { xAdvance: 0 },
    { xAdvance: 0 },
    { xAdvance: 0 },
    { xAdvance: 1549 },
    { xAdvance: 775 },
    { xAdvance: 1549 },
    { xAdvance: 3099 },
    { xAdvance: 1549 },
    { xAdvance: 2324 },
    { xAdvance: 0 },
    { xAdvance: 1549 },
    { xAdvance: 0 },
    { xAdvance: 1549 },
    { xAdvance: 775 },
    { xAdvance: 1549 }
  ];

  return new GlyphRun(
    startGlyphIndex,
    endGlyphIndex,
    attrs,
    layout(string).glyphs,
    positions.slice(startGlyphIndex, endGlyphIndex),
    stringIndices.slice(startGlyphIndex, endGlyphIndex),
    glyphIndices.slice(start, end)
  );
};
