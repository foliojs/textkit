import { Run } from '../../core/src';
import createScriptItemizerEngine from '../index';

const ScriptItemizer = createScriptItemizerEngine()({ Run });
const instance = new ScriptItemizer();

describe('ScriptItemizerEngine', () => {
  test('should return empty array for empty string', () => {
    const runs = instance.getRuns('');

    expect(runs).toEqual([]);
  });

  test('should return empty array for null string', () => {
    const runs = instance.getRuns(null);

    expect(runs).toEqual([]);
  });

  test('should return run with correct script', () => {
    const runs = instance.getRuns('Lorem');

    expect(runs).toHaveLength(1);
    expect(runs[0].attributes.script).toBe('Latin');
  });

  test('should return runs with correct script for many scripts', () => {
    const runs = instance.getRuns('Lorem  ្ញុំអាចញ៉ាំកញ្');

    expect(runs).toHaveLength(2);
    expect(runs[0].attributes.script).toBe('Latin');
    expect(runs[1].attributes.script).toBe('Khmer');
  });
});
