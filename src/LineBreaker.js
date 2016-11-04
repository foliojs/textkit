import LineBreak from 'linebreak';

export default class LineBreaker {
  suggestLineBreak(glyphString, width) {
    let bk = null;
    let last = null;
    let spaceLeft = width;
    let buffer = [];

    let glyphIndex = glyphString.glyphIndexAtOffset(width);
    if (glyphIndex === -1) return;

    // let stringIndex = getStringIndexForGlyphIndex(glyphIndex);

    // let hardBreak = findHardBreak(string, stringIndex);
    // if (hardBreak !== -1) {
    //   return hardBreak;
    // }

    if (glyphIndex === glyphString.length) {
      return {position: glyphString.length, required: true};
    }

    return findBreakPreceeding(glyphString.string, glyphIndex);
  }
}

function findBreakPreceeding(string, index) {
  let breaker = new LineBreak(string);
  let last = null;
  let bk = null;

  while (bk = breaker.nextBreak()) {
    if (bk.position > index) {
      return last;
    }

    if (bk.required) {
      return bk;
    }

    last = bk;
  }

  return null;
}
