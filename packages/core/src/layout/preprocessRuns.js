import flattenRuns from './flattenRuns';
import AttributedString from '../models/AttributedString';

const fontSubstitution = engines => attributedString => {
  const { string, runs } = attributedString;
  return engines.fontSubstitutionEngine.getRuns(string, runs);
};

const scriptItemization = engines => attributedString =>
  engines.scriptItemizer.getRuns(attributedString.string);

const preprocessRuns = engines => attributedString => {
  const fontRuns = fontSubstitution(engines)(attributedString);
  const scriptRuns = scriptItemization(engines)(attributedString);
  const stringRuns = attributedString.runs.map(run => {
    const {
      attributes: { font, ...attributes }
    } = run;
    return { ...run, attributes };
  });

  const runs = flattenRuns([...stringRuns, ...fontRuns, ...scriptRuns]);
  return new AttributedString(attributedString.string, runs);
};

export default preprocessRuns;
