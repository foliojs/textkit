import LineBreaker from './LineBreaker';
import LineFragment from './models/LineFragment';
import LineFragmentGenerator from './LineFragmentGenerator';
import JustificationEngine from './JustificationEngine';

const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

export default class Typesetter {
  constructor() {
    this.lineBreaker = new LineBreaker;
    this.lineFragmentGenerator = new LineFragmentGenerator;
    this.justificationEngine = new JustificationEngine;

  }

  layoutLineFragments(lineRect, glyphString, path, exclusionPaths, paragraphStyle) {
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
        let isLastLine = bk.position >= glyphString.length;
        let align = isLastLine ? paragraphStyle.alignLastLine : paragraphStyle.align;

        this.adjustLineFragmentRectangle(lineFragment, paragraphStyle, align);

        if (align === 'justify') {
          this.justificationEngine.justify(lineFragment, {factor: paragraphStyle.justificationFactor});
        }

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

  adjustLineFragmentRectangle(lineFragment, paragraphStyle, align) {
    let start = 0;
    let end = lineFragment.length;

    // Ignore whitespace at the start and end of a line for alignment
    while (lineFragment.isWhiteSpace(start)) {
      let w = lineFragment.getGlyphWidth(start++);
      lineFragment.rect.x -= w;
      lineFragment.rect.width += w;
    }

    while (lineFragment.isWhiteSpace(end - 1)) {
      lineFragment.rect.width += lineFragment.getGlyphWidth(--end);
    }

    // Adjust line rect for hanging punctuation
    if (paragraphStyle.hangingPunctuation) {
      if (align === 'left' || align === 'justify') {
        while (lineFragment.isHangingPunctuationStart(start)) {
          let w = lineFragment.getGlyphWidth(start++);
          lineFragment.rect.x -= w;
          lineFragment.rect.width += w;
        }
      }

      if (align === 'right' || align === 'justify') {
        while (lineFragment.isHangingPunctuationEnd(end - 1)) {
          lineFragment.rect.width += lineFragment.getGlyphWidth(--end);
        }
      }
    }

    // Adjust line offset for alignment
    let remainingWidth = lineFragment.rect.width - lineFragment.advanceWidth;
    lineFragment.rect.x += remainingWidth * ALIGNMENT_FACTORS[align];
  }
}
