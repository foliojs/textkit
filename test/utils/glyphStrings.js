import GlyphString from '../../src/models/GlyphString';
import { glyphRunFactory } from './glyphRuns';

/* eslint-disable-next-line */
export const glyphStringFactory = font => ({
  value = 'Lorem ipsum',
  steps = [[0, value.length]]
} = {}) => {
  const createRun = glyphRunFactory(font);

  const glyphRuns = steps.map(
    step =>
      createRun({
        value,
        start: step[0],
        end: step[1]
      }).glyphRun
  );

  return new GlyphString(value, glyphRuns);
};
