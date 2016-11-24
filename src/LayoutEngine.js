// import BidiEngine from './BidiEngine';
import FontSubstitutionEngine from './FontSubstitutionEngine';
import ScriptItemizer from './ScriptItemizer';
import flattenRuns from './flattenRuns';
import AttributedString from './models/AttributedString';
import RunStyle from './models/RunStyle';
import Run from './models/Run';
import GlyphRun from './models/GlyphRun';
import LineBreaker from './LineBreaker';
import LineFragment from './models/LineFragment';
import LineFragmentGenerator from './LineFragmentGenerator';
import Rect from './geom/Rect';
import Block from './models/Block';
import JustificationEngine from './JustificationEngine';
import ParagraphStyle from './models/ParagraphStyle';
import GlyphString from './models/GlyphString';
import Typesetter from './Typesetter';

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
    this.engines = [
      // new BidiEngine,
      new FontSubstitutionEngine,
      new ScriptItemizer
    ];

    this.typesetter = new Typesetter;
  }

  layout(attributedString, containers) {
    // let paragraphs = splitParagraphs(attributedString);
    // let blocks = paragraphs.map(paragraph => this.layoutParagraph(paragraph));

    let start = 0;

    for (let container of containers) {
      console.log("NEXT CONTAINER", start, attributedString.string.length)
      let y = container.bbox.minY;

      while (start < attributedString.string.length && y < container.bbox.maxY) {
        let next = attributedString.string.indexOf('\n', start);
        if (next === -1) {
          next = attributedString.string.length;
        }

        let paragraph = attributedString.slice(start, next);
        console.log(paragraph, y)

        let block = this.layoutParagraph(paragraph, container, y);
        container.blocks.push(block);

        y += block.bbox.height + block.style.paragraphSpacing;
        console.log(start, block.lines.length)
        // start = block.lines.length ? start + block.lines[block.lines.length - 1].end + 1 : next + 1;
        if (block.lines.length) {
          console.log(block.lines)
          start += block.stringLength;
          if (attributedString.string[start] === '\n')
            start++;
          console.log('start', start, block.stringLength)
        } else {
          break;
        }
      }
    }
  }

  layoutParagraph(attributedString, container, y) {
    let runs = this.resolveRuns(attributedString);
    // console.log(runs)
    let glyphIndex = 0;
    let glyphRuns = runs.map(run => {
      let str = attributedString.string.slice(run.start, run.end);
      let g = run.attributes.font.layout(str, run.attributes.features, run.attributes.script);
      let r = new GlyphRun(glyphIndex, glyphIndex + g.glyphs.length, run.attributes, g);
      glyphIndex += g.glyphs.length;
      return r;
    });

    let paragraphStyle = new ParagraphStyle(attributedString.runs[0].attributes);
    let glyphString = new GlyphString(attributedString.string, glyphRuns);

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

    let isTruncated = pos < glyphString.length;
    for (let i = 0; i < fragments.length; i++) {
      let fragment = fragments[i];
      let isLastFragment = i === fragments.length - 1;

      this.typesetter.finalizeLineFragment(fragment, paragraphStyle, isLastFragment, isTruncated);
    }

    return new Block(fragments, paragraphStyle);
  }

  resolveRuns(attributedString) {
    let r = attributedString.runs.map(run => {
      return new Run(run.start, run.end, new RunStyle(run.attributes))
    });

    // Resolve runs using engines
    let runs = this.engines.map(engine =>
      engine.getRuns(attributedString.string, r)
    ).reduce((p, r) => p.concat(r), []);

    let styles = attributedString.runs.map(run => {
      let attrs = Object.assign({}, run.attributes);
      delete attrs.font;
      delete attrs.fontDescriptor;
      return new Run(run.start, run.end, attrs);
    });

    let resolvedRuns = flattenRuns([...styles, ...runs]);
    for (let run of resolvedRuns) {
      run.attributes = new RunStyle(run.attributes);
    }

    return resolvedRuns;
  }
}
