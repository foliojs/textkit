import GlyphString from '../../src/models/GlyphString';
import { createLatinTestRun, createCamboyanTestRun } from './glyphRuns';

export const createLatinTestString = ({
  value = 'Lorem ipsum',
  runs = [[0, value.length]]
} = {}) => {
  const glyphRuns = runs.map(run => {
    const glyphRun = createLatinTestRun({
      value,
      end: run[1],
      start: run[0]
    });

    return glyphRun;
  });

  return new GlyphString(value, glyphRuns, 0, value.length);
};

export const createCamboyanTestString = ({
  value = 'ខ្ញុំអាចញ៉ាំកញ្ចក់បាន',
  runs = [[0, value.length]]
} = {}) => {
  const glyphRuns = runs.map(run => {
    const glyphRun = createCamboyanTestRun({
      value,
      end: run[1],
      start: run[0]
    });

    return glyphRun;
  });

  return new GlyphString(value, glyphRuns, 0, value.length);
};
