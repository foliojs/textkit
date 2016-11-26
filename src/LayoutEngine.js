import AttributedString from './models/AttributedString';
import LineBreaker from './LineBreaker';
import LineFragment from './models/LineFragment';
import LineFragmentGenerator from './LineFragmentGenerator';
import Rect from './geom/Rect';
import Block from './models/Block';
import JustificationEngine from './JustificationEngine';
import ParagraphStyle from './models/ParagraphStyle';
import Typesetter from './Typesetter';
import GlyphGenerator from './GlyphGenerator';

// 1. split into paragraphs
// 2. get bidi runs and paragraph direction
// 3. font substitution - map to resolved font runs
// 4. script itemization
// 5. font shaping - text to glyphs
// 6. line breaking
// 7. bidi reordering
// 8. justification

// 1. get a list of rectangles by intersecting path, line, and exclusion paths
// 2. perform line breaking to get acceptable break points for each fragment
// 3. ellipsize line if necessary
// 4. bidi reordering
// 5. justification

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a list of Container objects
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 */
export default class LayoutEngine {
  constructor() {
    this.glyphGenerator = new GlyphGenerator;
    this.typesetter = new Typesetter;
  }

  layout(attributedString, containers) {
    let start = 0;

    for (let i = 0; i < containers.length && start < attributedString.length; i++) {
      let container = containers[i];
      let isLastContainer = i === containers.length - 1;

      let bbox = container.bbox;
      let columnWidth = (bbox.width - (container.columnGap * (container.columns - 1))) / container.columns;
      let rect = new Rect(bbox.minX, bbox.minY, columnWidth, bbox.height);

      for (let j = 0; j < container.columns && start < attributedString.length; j++) {
        start = this.layoutColumn(attributedString, start, container, rect.copy(), isLastContainer);
        rect.x += columnWidth + container.columnGap;
      }
    }
  }

  layoutColumn(attributedString, start, container, rect, isLastContainer) {
    while (start < attributedString.length && rect.height > 0) {
      let next = attributedString.string.indexOf('\n', start);
      if (next === -1) {
        next = attributedString.string.length;
      }

      let paragraph = attributedString.slice(start, next);
      let block = this.layoutParagraph(paragraph, container, rect, isLastContainer);
      container.blocks.push(block);

      let height = block.bbox.height + block.style.paragraphSpacing;

      rect.y += height;
      rect.height -= height;
      start += block.stringLength;

      if (attributedString.string[start] === '\n') {
        start++;
      }

      // If entire paragraph did not fit, move on to the next column or container.
      if (start < next) {
        break;
      }
    }

    return start;
  }

  layoutParagraph(attributedString, container, rect, isLastContainer) {
    let glyphString = this.glyphGenerator.generateGlyphs(attributedString);
    let paragraphStyle = new ParagraphStyle(attributedString.runs[0].attributes);

    let lineRect = new Rect(
      rect.x + paragraphStyle.marginLeft + paragraphStyle.indent,
      rect.y,
      rect.width - paragraphStyle.marginLeft - paragraphStyle.indent - paragraphStyle.marginRight,
      glyphString.height
    );

    let fragments = [];
    let pos = 0;
    let firstLine = true;
    let lines = 0;

    while (lineRect.y < rect.maxY && pos < glyphString.length && lines < paragraphStyle.maxLines) {
      let lineFragments = this.typesetter.layoutLineFragments(
        lineRect,
        glyphString.slice(pos, glyphString.length),
        container,
        paragraphStyle
      );

      lineRect.y += lineRect.height + paragraphStyle.lineSpacing;

      if (lineFragments.length > 0) {
        fragments.push(...lineFragments);
        pos = lineFragments[lineFragments.length - 1].end;
        lines++;

        if (firstLine) {
          lineRect.x -= paragraphStyle.indent;
          lineRect.width += paragraphStyle.indent;
          firstLine = false;
        }
      }
    }

    let isTruncated = isLastContainer && pos < glyphString.length;
    for (let i = 0; i < fragments.length; i++) {
      let fragment = fragments[i];
      let isLastFragment = i === fragments.length - 1 && pos === glyphString.length;

      this.typesetter.finalizeLineFragment(fragment, paragraphStyle, isLastFragment, isTruncated);
    }

    return new Block(fragments, paragraphStyle);
  }
}
