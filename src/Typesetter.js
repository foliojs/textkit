import LineBreaker from './LineBreaker';
import LineFragment from './models/LineFragment';
import LineFragmentGenerator from './LineFragmentGenerator';
import JustificationEngine from './JustificationEngine';

export default class Typesetter {
  constructor() {
    this.lineBreaker = new LineBreaker;
    this.lineFragmentGenerator = new LineFragmentGenerator;
    this.justificationEngine = new JustificationEngine;

  }

  layoutLineFragments(lineRect, glyphString, path, exclusionPaths) {
    let fragmentRects = this.lineFragmentGenerator.generateFragments(lineRect, path, exclusionPaths);
    if (fragmentRects.length === 0) {
      return [];
    }

    let lineHeight = 0;
    let lineFragments = [];
    for (let fragmentRect of fragmentRects) {
      let bk = this.lineBreaker.suggestLineBreak(glyphString, fragmentRect.width);
      if (bk) {
        let lineFragment = new LineFragment(fragmentRect, glyphString.slice(0, bk.position));
        this.adjustLineFragmentRectangle(lineFragment);

        this.justificationEngine.justify(lineFragment);
        lineFragments.push(lineFragment);
        lineHeight = Math.max(lineHeight, lineFragment.height);

        if (bk.position >= glyphString.length) {
          break;
        }
      }
    }

    // Update the fragments on this line with the computed line height
    if (lineHeight !== 0) {
      lineRect.height = lineHeight;
    }

    for (let fragment of lineFragments) {
      fragment.rect.height = lineHeight;
    }

    return lineFragments;
  }

  adjustLineFragmentRectangle(lineFragment) {
    let start = 0;
    let end = lineFragment.length;

    while (lineFragment.isWhiteSpace(start)) {
      let w = lineFragment.getGlyphWidth(start++);
      lineFragment.rect.x -= w;
      lineFragment.rect.width += w;
    }

    while (lineFragment.isWhiteSpace(end - 1)) {
      lineFragment.rect.width += lineFragment.getGlyphWidth(--end);
    }
  }
}
