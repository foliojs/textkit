import LineFragment from '../models/LineFragment';

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
  constructor(engines = {}) {
    this.lineBreaker = engines.lineBreaker;
    this.lineFragmentGenerator = engines.lineFragmentGenerator;
    this.justificationEngine = engines.justificationEngine;
    this.truncationEngine = engines.truncationEngine;
    this.decorationEngine = engines.decorationEngine;
    this.tabEngine = engines.tabEngine;
  }

  layoutLineFragments(start, lineRect, glyphString, container, paragraphStyle, stringOffset) {
    const lineString = glyphString.slice(start, glyphString.length);

    // Guess the line height using the full line before intersecting with the container.
    lineRect.height = lineString.slice(0, lineString.glyphIndexAtOffset(lineRect.width)).height;

    // Generate line fragment rectangles by intersecting with the container.
    const fragmentRects = this.lineFragmentGenerator.generateFragments(lineRect, container);

    if (fragmentRects.length === 0) return [];

    let pos = 0;
    const lineFragments = [];
    let lineHeight = paragraphStyle.lineHeight;

    for (const fragmentRect of fragmentRects) {
      const line = lineString.slice(pos, lineString.length);

      if (this.tabEngine) {
        this.tabEngine.processLineFragment(line, container);
      }

      const bk = this.lineBreaker.suggestLineBreak(line, fragmentRect.width, paragraphStyle);

      if (bk) {
        bk.position += pos;

        const lineFragment = new LineFragment(fragmentRect, lineString.slice(pos, bk.position));

        lineFragment.stringStart =
          stringOffset + glyphString.stringIndexForGlyphIndex(lineFragment.start);
        lineFragment.stringEnd =
          stringOffset + glyphString.stringIndexForGlyphIndex(lineFragment.end);

        lineFragments.push(lineFragment);
        lineHeight = Math.max(lineHeight, lineFragment.height);

        pos = bk.position;
        if (pos >= lineString.length) {
          break;
        }
      }
    }

    // Update the fragments on this line with the computed line height
    if (lineHeight !== 0) lineRect.height = lineHeight;

    for (const fragment of lineFragments) {
      fragment.rect.height = lineHeight;
    }

    return lineFragments;
  }

  finalizeLineFragment(lineFragment, paragraphStyle, isLastFragment, isTruncated) {
    const align =
      isLastFragment && !isTruncated ? paragraphStyle.alignLastLine : paragraphStyle.align;

    if (isLastFragment && isTruncated && paragraphStyle.truncationMode) {
      this.truncationEngine.truncate(lineFragment, paragraphStyle.truncationMode);
    }

    this.adjustLineFragmentRectangle(lineFragment, paragraphStyle, align);

    if (align === 'justify' || lineFragment.advanceWidth > lineFragment.rect.width) {
      this.justificationEngine.justify(lineFragment, {
        factor: paragraphStyle.justificationFactor
      });
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
      lineFragment.overflowRight += lineFragment.getGlyphWidth(--end);
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
    const remainingWidth = lineFragment.rect.width - lineFragment.advanceWidth;
    lineFragment.rect.x += remainingWidth * ALIGNMENT_FACTORS[align];
  }
}
