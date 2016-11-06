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
  }

  layout(attributedString, path, exclusionPaths = []) {
    let paragraphs = splitParagraphs(attributedString);
    let blocks = paragraphs.map(paragraph => this.layoutParagraph(paragraph));
    return new Container(blocks);
  }

  layoutParagraph(attributedString, path, exclusionPaths) {
    let runs = this.resolveRuns(attributedString);
    let glyphIndex = 0;
    let glyphRuns = runs.map(run => {
      let str = attributedString.string.slice(run.start, run.end);
      let g = run.attributes.font.layout(str, run.attributes.features, run.attributes.script);
      let r = new GlyphRun(glyphIndex, glyphIndex + g.glyphs.length, run.attributes, g);
      glyphIndex += g.glyphs.length;
      return r;
    });

    let breaker = new LineBreaker;
    let gen = new LineFragmentGenerator;
    let just = new JustificationEngine;

    let bbox = path.bbox;
    let lineHeight = glyphRuns.reduce((h, run) => Math.max(h, run.height), 0);
    let rect = new Rect(path.bbox.minX, path.bbox.minY, path.bbox.width, lineHeight);

    let fragments = [];
    let pos = 0;

    let glyphString = new GlyphString(attributedString.string, glyphRuns);

    while (rect.y < bbox.maxY && pos < glyphString.length) {
      let rects = gen.generateFragments(rect, path, exclusionPaths);

      if (rects.length === 0) {
        rect.y += lineHeight;
        continue;
      }

      let lh = 0;
      let lineFragments = [];
      for (let r of rects) {
        let bk = breaker.suggestLineBreak(glyphString.slice(pos, glyphString.length), r.width);
        if (bk) {
          bk.position += pos;

          let end = bk.position;
          while (glyphString.isWhiteSpace(end - 1)) {
            end--;
          }

          let frag = new LineFragment(r, glyphString.slice(pos, end));
          just.justify(frag);
          lineFragments.push(frag);
          pos = bk.position;

          lh = Math.max(lh, frag.height);
        }

        if (pos >= glyphString.length) {
          break;
        }
      }

      // Update the fragments on this line with the computed line height
      if (lh !== 0) {
        lineHeight = lh;
      }

      for (let fragment of lineFragments) {
        fragment.rect.height = lineHeight;
      }

      fragments.push(...lineFragments);

      rect.y += lineHeight;
      rect.height = lineHeight;
    }

    return new Block(fragments, new ParagraphStyle(attributedString.runs[0].attributes));
  }

  resolveRuns(attributedString) {
    let r = attributedString.runs.map(run => {
      return new Run(run.start, run.end, new RunStyle(run.attributes))
    });

    // Resolve runs using engines
    let runs = this.engines.map(engine =>
      engine.getRuns(attributedString.string, r)
    ).reduce((p, r) => p.concat(r), []);

    let resolvedRuns = flattenRuns([...attributedString.runs, ...runs]);
    for (let run of resolvedRuns) {
      run.attributes = new RunStyle(run.attributes);
    }

    return resolvedRuns;
  }
}
