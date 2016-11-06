import LineBreak from 'linebreak';

export default class LineBreaker {
  suggestLineBreak(glyphString, width) {
    let glyphIndex = glyphString.glyphIndexAtOffset(width);
    if (glyphIndex === -1) return;

    if (glyphIndex === glyphString.length) {
      return {position: glyphString.length, required: true};
    }

    let stringIndex = glyphString.stringIndexForGlyphIndex(glyphIndex);
    let bk = findBreakPreceeding(glyphString.string, stringIndex);

    if (bk) {
      bk.position = glyphString.glyphIndexForStringIndex(bk.position);
    }

    return bk;
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
