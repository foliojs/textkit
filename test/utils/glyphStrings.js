import GlyphString from '../../src/models/GlyphString';
import { glyphRunFactory } from './glyphRuns';

/* eslint-disable-next-line */
export const glyphStringFactory = font => ({
  value = 'Lorem ipsum',
  runs = [[0, value.length]]
} = {}) => {
  const createRun = glyphRunFactory(font);

  const glyphRuns = runs.map(
    run =>
      createRun({
        value,
        start: run[0],
        end: run[1]
      }).glyphRun
  );

  return new GlyphString(value, glyphRuns, 0, value.length);
};
