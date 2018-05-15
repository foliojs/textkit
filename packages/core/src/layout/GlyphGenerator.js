import GlyphRun from '../models/GlyphRun';
import GlyphString from '../models/GlyphString';
import Run from '../models/Run';
import RunStyle from '../models/RunStyle';
import flattenRuns from './flattenRuns';

/**
 * A GlyphGenerator is responsible for mapping characters in
 * an AttributedString to glyphs in a GlyphString. It resolves
 * style attributes such as the font and Unicode script and
 * directionality properties, and creates GlyphRuns using fontkit.
 */
export default class GlyphGenerator {
  constructor(engines = {}) {
    this.resolvers = [engines.fontSubstitutionEngine, engines.scriptItemizer];
  }

  generateGlyphs(attributedString) {
    // Resolve runs
    const runs = this.resolveRuns(attributedString);

    // Generate glyphs
    let glyphIndex = 0;
    const glyphRuns = runs.map(run => {
      const str = attributedString.string.slice(run.start, run.end);
      const glyphRun = run.attributes.font.layout(
        str,
        run.attributes.features,
        run.attributes.script
      );
      const end = glyphIndex + glyphRun.glyphs.length;
      const glyphIndices = this.resolveGlyphIndices(str, glyphRun.stringIndices);

      const res = new GlyphRun(
        glyphIndex,
        end,
        run.attributes,
        glyphRun.glyphs,
        glyphRun.positions,
        glyphRun.stringIndices,
        glyphIndices
      );

      this.resolveAttachments(res);
      this.resolveYOffset(res);

      glyphIndex = end;
      return res;
    });

    return new GlyphString(attributedString.string, glyphRuns);
  }

  resolveGlyphIndices(string, stringIndices) {
    const glyphIndices = [];

    for (let i = 0; i < string.length; i++) {
      for (let j = 0; j < stringIndices.length; j++) {
        if (stringIndices[j] >= i) {
          glyphIndices[i] = j;
          break;
        }

        glyphIndices[i] = undefined;
      }
    }

    let lastValue = glyphIndices[glyphIndices.length - 1];
    for (let i = glyphIndices.length - 1; i >= 0; i--) {
      if (glyphIndices[i] === undefined) {
        glyphIndices[i] = lastValue;
      } else {
        lastValue = glyphIndices[i];
      }
    }

    lastValue = glyphIndices[0];
    for (let i = 0; i < glyphIndices.length; i++) {
      if (glyphIndices[i] === undefined) {
        glyphIndices[i] = lastValue;
      } else {
        lastValue = glyphIndices[i];
      }
    }

    return glyphIndices;
  }

  resolveRuns(attributedString) {
    // Map attributes to RunStyle objects
    const r = attributedString.runs.map(
      run => new Run(run.start, run.end, new RunStyle(run.attributes))
    );

    // Resolve run ranges and additional attributes
    const runs = [];
    for (const resolver of this.resolvers) {
      const resolved = resolver.getRuns(attributedString.string, r);
      runs.push(...resolved);
    }

    // Ignore resolved properties
    const styles = attributedString.runs.map(run => {
      const attrs = Object.assign({}, run.attributes);
      delete attrs.font;
      delete attrs.fontDescriptor;
      return new Run(run.start, run.end, attrs);
    });

    // Flatten runs
    const resolvedRuns = flattenRuns([...styles, ...runs]);
    for (const run of resolvedRuns) {
      run.attributes = new RunStyle(run.attributes);
    }

    return resolvedRuns;
  }

  resolveAttachments(glyphRun) {
    const { font, attachment } = glyphRun.attributes;

    if (!attachment) {
      return;
    }

    const objectReplacement = font.glyphForCodePoint(0xfffc);

    for (let i = 0; i < glyphRun.length; i++) {
      const glyph = glyphRun.glyphs[i];
      const position = glyphRun.positions[i];

      if (glyph === objectReplacement) {
        position.xAdvance = attachment.width;
      }
    }
  }

  resolveYOffset(glyphRun) {
    const { font, yOffset } = glyphRun.attributes;

    if (!yOffset) {
      return;
    }

    for (let i = 0; i < glyphRun.length; i++) {
      glyphRun.positions[i].yOffset += yOffset * font.unitsPerEm;
    }
  }
}
