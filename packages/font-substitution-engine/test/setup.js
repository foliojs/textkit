import fontkit from 'fontkit';
import FontManager from 'font-manager';

jest.mock('fontkit');
jest.mock('font-manager');

FontManager.findFontSync.mockImplementation(({ family }) => ({
  path: family,
  postscriptName: family
}));

FontManager.substituteFontSync.mockImplementation(postscriptName => ({
  postscriptName: `${postscriptName}_replace`
}));

const fontCache = {};
fontkit.openSync.mockImplementation(path => {
  const hasGlyphForCodePoint = codePoint => codePoint !== 32;

  return {
    postscriptName: path,
    hasGlyphForCodePoint,
    getFont: () => {
      if (!fontCache[path]) {
        fontCache[path] = {
          postscriptName: path,
          hasGlyphForCodePoint
        };
      }

      return fontCache[path];
    }
  };
});
