// import BidiEngine from './BidiEngine';
import GlyphRun from '../models/GlyphRun';
import GlyphString from '../models/GlyphString';
import Attachment from '../models/Attachment';
import Run from '../models/Run';
import RunStyle from '../models/RunStyle';
import FontSubstitutionEngine from '../layout/FontSubstitutionEngine';
import flattenRuns from './flattenRuns';
import ScriptItemizer from './ScriptItemizer';

/**
 * A GlyphGenerator is responsible for mapping characters in
 * an AttributedString to glyphs in a GlyphString. It resolves
 * style attributes such as the font and Unicode script and
 * directionality properties, and creates GlyphRuns using fontkit.
 */
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

      let res = new GlyphRun(glyphIndex, end, run.attributes, glyphRun.glyphs, glyphRun.positions, glyphRun.stringIndices);
      this.resolveAttachments(res);

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

  resolveAttachments(glyphRun) {
    let attachment = glyphRun.attributes.attachment;
    if (!attachment) {
      return;
    }

    for (let i = 0; i < glyphRun.length; i++) {
      let glyph = glyphRun.glyphs[i];
      let position = glyphRun.positions[i];
      if (glyph.codePoints[0] === Attachment.CODEPOINT) {
        position.xAdvance = attachment.width;
      }
    }
  }
}
