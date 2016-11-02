import bidi from 'bidi';
import Run from './Run';

export default class BidiEngine {
  getRuns(string) {
    let classes = bidi.getClasses(string);
    return bidi.getLevelRuns(classes);
  }

  reorderLine(glyphs, runs, paragraphLevel) {
    return bidi.reorder(glyphs, runs, paragraphLevel);
  }
}
