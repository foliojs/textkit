import unicode from 'unicode-properties';
import Run from './models/Run';

/**
 * A ScriptItemizer is used by a GlyphGenerator to resolve
 * Unicode script runs in an AttributedString.
 */
export default class ScriptItemizer {
  getRuns(string) {
    let lastIndex = 0;
    let lastScript = 'Unknown';
    let runs = [];

    let index = 0;

    for (let char of string) {
      let codePoint = char.codePointAt();
      let script = unicode.getScript(codePoint);
      if (script === 'Common' || script === 'Inherited' || script === 'Unknown') {
        // TODO: deal with paired brackets?
      } else if (script !== lastScript && lastIndex !== 0) {
        runs.push(new Run(lastIndex, index - 1, {script: lastScript}));

        lastIndex = index;
        lastScript = script;
      }

      index += char.length;
    }

    if (lastIndex < string.length) {
      runs.push(new Run(lastIndex, string.length, {script: lastScript}));
    }

    return runs;
  }
}
