import bidi from 'bidi';

export default () => () =>
  class BidiEngine {
    getRuns(string) {
      const classes = bidi.getClasses(string);
      return bidi.getLevelRuns(classes);
    }

    reorderLine(glyphs, runs, paragraphLevel) {
      return bidi.reorder(glyphs, runs, paragraphLevel);
    }
  };
