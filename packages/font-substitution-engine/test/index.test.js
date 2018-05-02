import fontkit from 'fontkit';
import FontManager from 'font-manager';
import { Run, RunStyle } from '../../core/src';
import createFontSubstitutionEngine from '../index';

// Mock dependencies
jest.mock('fontkit');
jest.mock('font-manager');

// We mock dummy fonts in order to make font equals work
const fontCache = {};

// Return simple object with dummy path and postscriptName
FontManager.findFontSync.mockImplementation(({ family }) => ({
  path: family,
  postscriptName: family
}));

// Return simple object with dummy postscriptName
FontManager.substituteFontSync.mockImplementation(postscriptName => ({
  postscriptName: `${postscriptName}_replace`
}));

// Return dummy font object
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

// Test implementation
const FontSubstitution = createFontSubstitutionEngine()({ Run });
const instance = new FontSubstitution();

describe('FontSubstitutionEngine', () => {
  test('should return empty array if no runs passed', () => {
    const runs = instance.getRuns('', []);

    expect(runs).toEqual([]);
  });

  test('should return empty array for empty string', () => {
    const run = new Run(0, 0, new RunStyle());
    const runs = instance.getRuns('', [run]);

    expect(runs).toEqual([]);
  });

  test('should merge equal runs', () => {
    const run1 = new Run(0, 3, new RunStyle({ font: 'Helvetica' }));
    const run2 = new Run(3, 5, new RunStyle({ font: 'Helvetica' }));
    const runs = instance.getRuns('Lorem', [run1, run2]);

    expect(runs).toHaveLength(1);
    expect(runs[0].start).toBe(0);
    expect(runs[0].end).toBe(5);
  });

  test('should substitute many runs', () => {
    const run1 = new Run(0, 3, new RunStyle({ font: 'Courier' }));
    const run2 = new Run(3, 5, new RunStyle({ font: 'Helvetica' }));
    const runs = instance.getRuns('Lorem', [run1, run2]);

    expect(runs).toHaveLength(2);
    expect(runs[0].start).toBe(0);
    expect(runs[0].end).toBe(3);
    expect(runs[1].start).toBe(3);
    expect(runs[1].end).toBe(5);
  });

  test.only('should use fallback font if char not present', () => {
    const run = new Run(0, 11, new RunStyle({ font: 'Helvetica' }));
    const runs = instance.getRuns('Lorem ipsum', [run]);

    expect(runs).toHaveLength(3);
    expect(runs[0].start).toBe(0);
    expect(runs[0].end).toBe(5);
    expect(runs[1].start).toBe(5);
    expect(runs[1].end).toBe(6);
    expect(runs[2].start).toBe(6);
    expect(runs[2].end).toBe(11);
    expect(FontManager.substituteFontSync.mock.calls).toHaveLength(1);
  });
});
