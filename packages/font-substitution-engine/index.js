import FontManager from 'font-manager';
import fontkit from 'fontkit';

/**
 * A FontSubstitutionEngine is used by a GlyphGenerator to resolve
 * font runs in an AttributedString, performing font substitution
 * where necessary.
 */
export default () => ({ Run }) =>
  class FontSubstitutionEngine {
    constructor() {
      this.fontCache = new Map();
    }

    getFont(fontDescriptor) {
      if (this.fontCache.has(fontDescriptor.postscriptName)) {
        return this.fontCache.get(fontDescriptor.postscriptName);
      }
      let font = fontkit.openSync(fontDescriptor.path);
      if (font.postscriptName !== fontDescriptor.postscriptName) {
        font = font.getFont(fontDescriptor.postscriptName);
      }

      this.fontCache.set(font.postscriptName, font);
      return font;
    }

    getRuns(string, runs) {
      const res = [];
      let lastDescriptor = null;
      let lastFont = null;
      let lastIndex = 0;
      let index = 0;

      for (const run of runs) {
        let defaultFont;
        const defaultDescriptor = FontManager.findFontSync(run.attributes.fontDescriptor);

        if (typeof run.attributes.font === 'string') {
          defaultFont = this.getFont(defaultDescriptor);
        } else {
          defaultFont = run.attributes.font;
        }

        for (const char of string.slice(run.start, run.end)) {
          const codePoint = char.codePointAt();
          let descriptor = null;
          let font = null;

          if (defaultFont.hasGlyphForCodePoint(codePoint)) {
            descriptor = defaultDescriptor;
            font = defaultFont;
          } else {
            descriptor = FontManager.substituteFontSync(defaultDescriptor.postscriptName, char);
            font = this.getFont(descriptor);
          }

          if (font !== lastFont) {
            if (lastFont) {
              res.push(
                new Run(lastIndex, index, {
                  font: lastFont,
                  fontDescriptor: lastDescriptor
                })
              );
            }

            lastFont = font;
            lastDescriptor = descriptor;
            lastIndex = index;
          }

          index += char.length;
        }
      }

      if (lastIndex < string.length) {
        res.push(
          new Run(lastIndex, string.length, {
            font: lastFont,
            fontDescriptor: lastDescriptor
          })
        );
      }

      return res;
    }
  };
