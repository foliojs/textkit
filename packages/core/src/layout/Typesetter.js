import generateFragments from './fragmentGenerator';
import Block from '../models/Block';
import LineFragment from '../models/LineFragment';

const NEW_LINE = 10;
const ALIGNMENT_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  justify: 0
};

const finalizeLineFragment = engines => (line, style, isLastFragment, isTruncated) => {
  const align = isLastFragment && !isTruncated ? style.alignLastLine : style.align;

  if (isLastFragment && isTruncated && style.truncationMode) {
    engines.truncationEngine.truncate(line, style.truncationMode);
  }

  let start = 0;
  let end = line.length;

  // Remove new line char at the end of line
  if (line.codePointAtGlyphIndex(line.length - 1) === NEW_LINE) {
    line.deleteGlyph(line.length - 1);
  }

  // Ignore whitespace at the start and end of a line for alignment
  while (line.isWhiteSpace(start)) {
    line.overflowLeft += line.getGlyphWidth(start++);
  }

  while (line.isWhiteSpace(end - 1)) {
    line.overflowRight += line.getGlyphWidth(--end);
  }

  // Adjust line rect for hanging punctuation
  if (style.hangingPunctuation) {
    if (align === 'left' || align === 'justify') {
      if (line.isHangingPunctuationStart(start)) {
        line.overflowLeft += line.getGlyphWidth(start++);
      }
    }

    if (align === 'right' || align === 'justify') {
      if (line.isHangingPunctuationEnd(end - 1)) {
        line.overflowRight += line.getGlyphWidth(--end);
      }
    }
  }

  line.rect.x -= line.overflowLeft;
  line.rect.width += line.overflowLeft + line.overflowRight;

  // Adjust line offset for alignment
  const remainingWidth = line.rect.width - line.advanceWidth;
  line.rect.x += remainingWidth * ALIGNMENT_FACTORS[align];

  if (align === 'justify' || line.advanceWidth > line.rect.width) {
    engines.justificationEngine.justify(line, {
      factor: style.justificationFactor
    });
  }

  engines.decorationEngine.createDecorationLines(line);
};

const layoutParagraph = engines => (paragraph, container, lineRect) => {
  const { value, syllables } = paragraph;
  const style = value.glyphRuns[0].attributes;

  // Guess the line height using the full line before intersecting with the container.
  // Generate line fragment rectangles by intersecting with the container.
  const lineHeight = value.slice(0, value.glyphIndexAtOffset(lineRect.width)).height;
  const fragmentRects = generateFragments(lineRect, lineHeight, container);
  const wrappingWidths = fragmentRects.map(rect => rect.width);
  const lines = engines.lineBreaker.suggestLineBreak(value, syllables, wrappingWidths, style);

  let currentY = lineRect.y;
  const lineFragments = lines.map((line, i) => {
    const lineBox = fragmentRects[Math.min(i, fragmentRects.length - 1)].copy();
    const fragmentHeight = Math.max(line.height, style.lineHeight);

    lineBox.y = currentY;
    lineBox.height = fragmentHeight;
    currentY += fragmentHeight;

    return new LineFragment(lineBox, line);
  });

  lineFragments.forEach((lineFragment, i) => {
    finalizeLineFragment(engines)(lineFragment, style, i === lineFragments.length - 1);
  });

  return new Block(lineFragments);
};

const typesetter = engines => containers => glyphStrings => {
  const paragraphs = [...glyphStrings];

  const layoutContainer = (rect, container) => {
    let paragraphRect = rect.copy();
    let nextParagraph = paragraphs.shift();

    while (nextParagraph) {
      const block = layoutParagraph(engines)(nextParagraph, container, paragraphRect);

      if (paragraphRect.height >= block.height) {
        container.blocks.push(block);
        paragraphRect = paragraphRect.copy();
        paragraphRect.y += block.height;
        paragraphRect.height -= block.height;
        nextParagraph = paragraphs.shift();
      } else {
        paragraphs.unshift(nextParagraph);
        break;
      }
    }
  };

  return containers.forEach(container => {
    layoutContainer(container.bbox.toRect(), container);
  });
};

export default typesetter;
