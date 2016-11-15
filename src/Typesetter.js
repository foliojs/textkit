import LineBreaker from './LineBreaker';
import LineFragment from './models/LineFragment';
import LineFragmentGenerator from './LineFragmentGenerator';
import JustificationEngine from './JustificationEngine';
import TruncationEngine from './TruncationEngine';
import DecorationLine from './models/DecorationLine';

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
    this.truncationEngine = new TruncationEngine;
  }

  layoutLineFragments(lineRect, glyphString, path, exclusionPaths, paragraphStyle) {
    let fragmentRects = this.lineFragmentGenerator.generateFragments(lineRect, path, exclusionPaths);
    if (fragmentRects.length === 0) {
      return [];
    }

    let lineHeight = 0;
    let lineFragments = [];
    let pos = 0;
    for (let fragmentRect of fragmentRects) {
      let bk = this.lineBreaker.suggestLineBreak(
        glyphString.slice(pos, glyphString.length),
        fragmentRect.width,
        paragraphStyle.hyphenationFactor
      );

      if (bk) {
        bk.position += pos;

        let lineFragment = new LineFragment(fragmentRect, glyphString.slice(pos, bk.position));
        lineFragments.push(lineFragment);
        lineHeight = Math.max(lineHeight, lineFragment.height);

        pos = bk.position;
        if (pos >= glyphString.length) {
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

  finalizeLineFragment(lineFragment, paragraphStyle, isLastFragment, isTruncated) {
    let align = isLastFragment && !isTruncated ? paragraphStyle.alignLastLine : paragraphStyle.align;

    if (isLastFragment && isTruncated && paragraphStyle.truncationMode) {
      this.truncationEngine.truncate(lineFragment, paragraphStyle.truncationMode);
    }

    this.adjustLineFragmentRectangle(lineFragment, paragraphStyle, align);

    if (align === 'justify' || lineFragment.advanceWidth > lineFragment.rect.width) {
      this.justificationEngine.justify(lineFragment, {factor: paragraphStyle.justificationFactor});
    }

    this.createDecorationLines(lineFragment);
    console.log(lineFragment.decorationLines);
  }

  adjustLineFragmentRectangle(lineFragment, paragraphStyle, align) {
    let start = 0;
    let end = lineFragment.length;

    // Ignore whitespace at the start and end of a line for alignment
    while (lineFragment.isWhiteSpace(start)) {
      lineFragment.overflowLeft += lineFragment.getGlyphWidth(start++);
    }

    while (lineFragment.isWhiteSpace(end - 1)) {
      lineFragment.overflowRight +=  lineFragment.getGlyphWidth(--end);
    }

    // Adjust line rect for hanging punctuation
    if (paragraphStyle.hangingPunctuation) {
      if (align === 'left' || align === 'justify') {
        if (lineFragment.isHangingPunctuationStart(start)) {
          lineFragment.overflowLeft += lineFragment.getGlyphWidth(start++);
        }
      }

      if (align === 'right' || align === 'justify') {
        if (lineFragment.isHangingPunctuationEnd(end - 1)) {
          lineFragment.overflowRight += lineFragment.getGlyphWidth(--end);
        }
      }
    }

    lineFragment.rect.x -= lineFragment.overflowLeft;
    lineFragment.rect.width += lineFragment.overflowLeft + lineFragment.overflowRight;

    // Adjust line offset for alignment
    let remainingWidth = lineFragment.rect.width - lineFragment.advanceWidth;
    lineFragment.rect.x += remainingWidth * ALIGNMENT_FACTORS[align];
  }

  createDecorationLines(lineFragment) {
    let x = lineFragment.overflowLeft;
    let maxX = lineFragment.rect.width - lineFragment.overflowRight;

    for (let run of lineFragment.glyphRuns) {
      let endY = x + run.advanceWidth;

      if (run.attributes.underline) {
        let line = new DecorationLine(x, Math.min(maxX, endY), lineFragment.ascent, run.attributes);
        lineFragment.addDecorationLine(line);
      }

      if (run.attributes.strike) {
        let y = 2 * lineFragment.ascent / 3;
        let line = new DecorationLine(x, Math.min(maxX, endY), y, run.attributes);
        lineFragment.addDecorationLine(line);
      }

      x = endY;
    }
  }
}
