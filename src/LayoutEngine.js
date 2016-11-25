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
      let y = container.bbox.minY;

      while (start < attributedString.length && y < container.bbox.maxY) {
        let next = attributedString.string.indexOf('\n', start);
        if (next === -1) {
          next = attributedString.string.length;
        }

        let paragraph = attributedString.slice(start, next);
        console.log("PARA", y, container.bbox.maxY)

        let block = this.layoutParagraph(paragraph, container, y, isLastContainer);
        container.blocks.push(block);

        y += block.bbox.height + block.style.paragraphSpacing;
        start += block.stringLength;

        if (attributedString.string[start] === '\n') {
          start++;
        }

        // If entire paragraph did not fit, move on to the next container.
        if (start < next) {
          break;
        }
      }
    }
  }

  layoutParagraph(attributedString, container, y, isLastContainer) {
    let glyphString = this.glyphGenerator.generateGlyphs(attributedString);
    let paragraphStyle = new ParagraphStyle(attributedString.runs[0].attributes);

    let bbox = container.bbox;
    let lineHeight = glyphString.height;
    let rect = new Rect(
      container.bbox.minX + paragraphStyle.marginLeft + paragraphStyle.indent,
      y,
      container.bbox.width - paragraphStyle.marginLeft - paragraphStyle.indent - paragraphStyle.marginRight,
      lineHeight
    );

    console.log(container.bbox)

    let fragments = [];
    let pos = 0;
    let firstLine = true;
    let lines = 0;

    while (rect.y < bbox.maxY && pos < glyphString.length && lines < paragraphStyle.maxLines) {
      let lineFragments = this.typesetter.layoutLineFragments(
        rect,
        glyphString.slice(pos, glyphString.length),
        container,
        paragraphStyle
      );

      rect.y += rect.height + paragraphStyle.lineSpacing;

      if (lineFragments.length > 0) {
        fragments.push(...lineFragments);
        pos = lineFragments[lineFragments.length - 1].end;
        lines++;

        if (firstLine) {
          rect.x -= paragraphStyle.indent;
          rect.width += paragraphStyle.indent;
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
