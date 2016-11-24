// import BidiEngine from './BidiEngine';
import flattenRuns from './flattenRuns';
import FontSubstitutionEngine from './FontSubstitutionEngine';
import GlyphRun from './models/GlyphRun';
import GlyphString from './models/GlyphString';
import Run from './models/Run';
import RunStyle from './models/RunStyle';
import ScriptItemizer from './ScriptItemizer';

export default class GlyphGenerator {
  constructor() {
    this.resolvers = [
      // new BidiEngine,
      new FontSubstitutionEngine,
      new ScriptItemizer
    ];
  }

  generateGlyphs(attributedString) {
    // Resolve runs
    let runs = this.resolveRuns(attributedString);

    // Generate glyphs
    let glyphIndex = 0;
    let glyphRuns = runs.map(run => {
      let str = attributedString.string.slice(run.start, run.end);
      let glyphRun = run.attributes.font.layout(str, run.attributes.features, run.attributes.script);
      let end = glyphIndex + glyphRun.glyphs.length;
      let res = new GlyphRun(glyphIndex, end, run.attributes, glyphRun);
      glyphIndex = end;
      return res;
    });

    return new GlyphString(attributedString.string, glyphRuns);
  }

  resolveRuns(attributedString) {
    // Map attributes to RunStyle objects
    let r = attributedString.runs.map(run => {
      return new Run(run.start, run.end, new RunStyle(run.attributes))
    });

    // Resolve run ranges and additional attributes
    let runs = [];
    for (let resolver of this.resolvers) {
      let resolved = resolver.getRuns(attributedString.string, r);
      runs.push(...resolved);
    }

    // Ignore resolved properties
    let styles = attributedString.runs.map(run => {
      let attrs = Object.assign({}, run.attributes);
      delete attrs.font;
      delete attrs.fontDescriptor;
      return new Run(run.start, run.end, attrs);
    });

    // Flatten runs
    let resolvedRuns = flattenRuns([...styles, ...runs]);
    for (let run of resolvedRuns) {
      run.attributes = new RunStyle(run.attributes);
    }

    return resolvedRuns;
  }
}
