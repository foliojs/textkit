import LineBreak from 'linebreak';

export default class LineBreaker {
  suggestLineBreak(string, glyphRuns, width) {
    let breaker = new LineBreak(string);
    let bk = null;
    let last = null;
    let spaceLeft = width;
    let buffer = [];

    let glyphIndex = glyphIndexAtOffset(glyphRuns, width);
    if (glyphIndex === -1) return;

    // let stringIndex = getStringIndexForGlyphIndex(glyphIndex);

    // let hardBreak = findHardBreak(string, stringIndex);
    // if (hardBreak !== -1) {
    //   return hardBreak;
    // }

    if (glyphIndex === string.length) {
      return {position: string.length, required: true};
    }

    return findBreakPreceeding(string, glyphIndex);
  }
}

function glyphIndexAtOffset(glyphRuns, width) {
  let offset = 0;
  let index = 0;
  for (let run of glyphRuns) {
    if (offset + run.advanceWidth > width) {
      for (let position of run.run.positions) {
        let w = position.xAdvance * run.scale;
        if (offset + w > width) {
          return index;
        } else {
          offset += w;
          index++;
        }
      }
    } else {
      offset += run.advanceWidth;
      index += run.run.glyphs.length;
    }
  }

  return index;
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
