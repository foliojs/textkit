import LineBreaker from './engines/LineBreaker';
import LineFragment from './models/LineFragment';
import LineFragmentGenerator from './generators/LineFragmentGenerator';
import JustificationEngine from './engines/JustificationEngine';
import TruncationEngine from './engines/TruncationEngine';
import TextDecorationEngine from './engines/TextDecorationEngine';
import TabEngine from './engines/TabEngine';

const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

/**
 * A Typesetter performs glyph line layout, including line breaking,
 * hyphenation, justification, truncation, hanging punctuation,
 * and text decoration. It uses several underlying objects to perform
 * these tasks, which could be overridden in order to customize the
 * typesetter's behavior.
 */
export default class Typesetter {
  constructor() {
    this.lineBreaker = new LineBreaker;
    this.lineFragmentGenerator = new LineFragmentGenerator;
    this.justificationEngine = new JustificationEngine;
    this.truncationEngine = new TruncationEngine;
    this.decorationEngine = new TextDecorationEngine;
    this.tabEngine = new TabEngine;
  }

  layoutLineFragments(lineRect, glyphString, container, paragraphStyle) {
    // Guess the line height using the full line before intersecting with the container.
    lineRect.height = glyphString.slice(0, glyphString.glyphIndexAtOffset(lineRect.width)).height;

    // Generate line fragment rectangles by intersecting with the container.
    let fragmentRects = this.lineFragmentGenerator.generateFragments(lineRect, container);
    if (fragmentRects.length === 0) {
      return [];
    }

    let lineHeight = 0;
    let lineFragments = [];
    let pos = 0;
    for (let fragmentRect of fragmentRects) {
      let line = glyphString.slice(pos, glyphString.length);
      this.tabEngine.processLineFragment(line, container);

      let bk = this.lineBreaker.suggestLineBreak(
        line,
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

    this.decorationEngine.createDecorationLines(lineFragment);
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
}
