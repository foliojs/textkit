import GlyphRun from '../models/GlyphRun';
import GlyphString from '../models/GlyphString';

const resolveGlyphIndices = (string, stringIndices) => {
  const glyphIndices = [];

  for (let i = 0; i < string.length; i++) {
    for (let j = 0; j < stringIndices.length; j++) {
      if (stringIndices[j] >= i) {
        glyphIndices[i] = j;
        break;
      }

      glyphIndices[i] = undefined;
    }
  }

  let lastValue = glyphIndices[glyphIndices.length - 1];
  for (let i = glyphIndices.length - 1; i >= 0; i--) {
    if (glyphIndices[i] === undefined) {
      glyphIndices[i] = lastValue;
    } else {
      lastValue = glyphIndices[i];
    }
  }

  lastValue = glyphIndices[0];
  for (let i = 0; i < glyphIndices.length; i++) {
    if (glyphIndices[i] === undefined) {
      glyphIndices[i] = lastValue;
    } else {
      lastValue = glyphIndices[i];
    }
  }

  return glyphIndices;
};

const stringToGlyphs = attributedString => {
  let glyphIndex = 0;
  const glyphRuns = attributedString.runs.map(run => {
    const { start, end, attributes } = run;
    const str = attributedString.string.slice(start, end);
    const glyphRun = run.attributes.font.layout(str, attributes.features, attributes.script);
    const glyphEnd = glyphIndex + glyphRun.glyphs.length;
    const glyphIndices = resolveGlyphIndices(str, glyphRun.stringIndices);

    const res = new GlyphRun(
      glyphIndex,
      glyphEnd,
      attributes,
      glyphRun.glyphs,
      glyphRun.positions,
      glyphRun.stringIndices,
      glyphIndices
    );

    glyphIndex = glyphEnd;
    return res;
  });

  return new GlyphString(attributedString.string, glyphRuns);
};

const generateGlyphs = () => paragraph => ({
  syllables: paragraph.syllables,
  value: stringToGlyphs(paragraph.attributedString)
});

export default generateGlyphs;
