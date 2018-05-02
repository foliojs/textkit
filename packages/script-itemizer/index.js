import unicode from 'unicode-properties';

const ignoredScripts = ['Common', 'Inherited', 'Unknown'];

/**
 * A ScriptItemizer is used by a GlyphGenerator to resolve
 * Unicode script runs in an AttributedString.
 */
export default () => ({ Run }) =>
  class ScriptItemizer {
    getRuns(string) {
      let lastIndex = 0;
      let lastScript = 'Unknown';
      let index = 0;
      const runs = [];

      if (!string) {
        return [];
      }

      for (const char of string) {
        const codePoint = char.codePointAt();
        const script = unicode.getScript(codePoint);

        if (script !== lastScript && !ignoredScripts.includes(script)) {
          if (lastScript !== 'Unknown') {
            runs.push(new Run(lastIndex, index - 1, { script: lastScript }));
          }

          lastIndex = index;
          lastScript = script;
        }

        index += char.length;
      }

      if (lastIndex < string.length) {
        runs.push(new Run(lastIndex, string.length, { script: lastScript }));
      }

      return runs;
    }
  };
