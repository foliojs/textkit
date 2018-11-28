import AttributedString from '../models/AttributedString';

const wrapWords = engines => attributedString => {
  const syllables = [];
  const fragments = [];

  for (const run of attributedString.runs) {
    let string = '';
    const tokens = attributedString.string
      .slice(run.start, run.end)
      .split(/([ ]+)/g)
      .filter(Boolean);

    for (const token of tokens) {
      const parts = engines.wordHyphenation.hyphenateWord(token);
      syllables.push(...parts);
      string += parts.join('');
    }

    fragments.push({ string, attributes: run.attributes });
  }

  return { attributedString: AttributedString.fromFragments(fragments), syllables };
};

export default wrapWords;
