import FontManager from 'font-manager';
import fontkit from 'fontkit';
import Run from './models/Run';

export default class FontSubstitutionEngine {
  constructor() {
    this.fontCache = new Map;
  }

  getFont(fontDescriptor) {
    if (this.fontCache.has(fontDescriptor.postscriptName)) {
      return this.fontCache.get(fontDescriptor.postscriptName);
    }

    // TODO: don't always send postscriptName - only if font container...
    let font = fontkit.openSync(fontDescriptor.path, fontDescriptor.postscriptName);
    this.fontCache.set(font.postscriptName, font);
    return font;
  }

  getRuns(string, runs) {
    let res = [];
    let lastDescriptor = null;
    let lastFont = null;
    let lastIndex = 0;
    let index = 0;

    for (let run of runs) {
      let defaultDescriptor = FontManager.findFontSync(run.attributes.fontDescriptor);
      let defaultFont = this.getFont(defaultDescriptor);

      for (let char of string.slice(run.start, run.end)) {
        let codePoint = char.codePointAt();
        let descriptor = null;
        let font = null;

        if (defaultFont.hasGlyphForCodePoint(codePoint)) {
          descriptor = defaultDescriptor
          font = defaultFont;
        } else {
          descriptor = FontManager.substituteFontSync(defaultDescriptor.postscriptName, char);
          font = this.getFont(descriptor);
        }

        if (font !== lastFont) {
          if (lastFont) {
            res.push(new Run(lastIndex, index, {font: lastFont, fontDescriptor: lastDescriptor}));
          }

          lastFont = font;
          lastDescriptor = descriptor;
          lastIndex = index;
        }

        index += char.length;
      }

      if (lastIndex < string.length) {
        res.push(new Run(lastIndex, string.length, {font: lastFont, fontDescriptor: lastDescriptor}));
      }
    }

    return res;
  }
}
