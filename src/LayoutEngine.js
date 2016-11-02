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
    let glyphRuns = runs.map(run => {
      let str = attributedString.string.slice(run.start, run.end);
      let g = run.attributes.font.layout(str, run.attributes.features, run.attributes.script);
      return new GlyphRun(run.start, run.end, run.attributes, g);
    });

    let breaker = new LineBreaker;
    let gen = new LineFragmentGenerator;
    let just = new JustificationEngine;

    let bbox = path.bbox;
    let lineHeight = glyphRuns.reduce((h, run) => Math.max(h, run.ascent - run.descent + run.lineGap), 0);
    let rect = new Rect(path.bbox.minX, path.bbox.minY, path.bbox.width, lineHeight);

    console.log(glyphRuns)
    console.log(rect)

    let fragments = [];
    let pos = 0;

    let run = glyphRuns[0];
    console.log(run.run.glyphs.length, attributedString.string.length)

    while (rect.y < bbox.maxY && pos < attributedString.string.length) {
      let rects = gen.generateFragments(rect, path, exclusionPaths);
      rect.y += lineHeight;
      // console.log(rects)

      if (rects.length === 0) {
        continue;
      }

      for (let r of rects) {
        let bk = breaker.suggestLineBreak(attributedString.string.slice(pos), [run.slice(pos, run.run.glyphs.length)], r.width);
        if (bk) {
          bk.position += pos;
          console.log(bk, attributedString.string.slice(pos, bk.position));

          let end = bk.position;
          while (attributedString.string[end - 1] === ' ') {
            end--;
          }

          // break;
          let frag = new LineFragment(r, [run.slice(pos, end)]);
          just.justify(frag);
          fragments.push(frag);
          pos = bk.position;
          console.log(pos, attributedString.string.length)
        }

        if (pos >= attributedString.string.length) {
          break;
        }
      }
    }

    console.log(fragments)
    // return fragments[0]
    return new Block(fragments);

    // let lines = [];
    // let lineHeight =

    // let lines = this.lineBreaker.break(attributedString.string, glyphRuns);
    // return new Block(lines, new ParagraphStyle(attributedString.runs[0].attributes));
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
    console.log(attributedString.runs, runs)
    for (let run of resolvedRuns) {
      run.attributes = new RunStyle(run.attributes);
    }
    console.log('ABC', resolvedRuns[0])

    return resolvedRuns;
  }
}
