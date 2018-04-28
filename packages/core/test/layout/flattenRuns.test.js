import Run from '../../src/models/Run';
import flattenRuns from '../../src/layout/flattenRuns';

describe('flattenRuns', () => {
  test('should return empty array if no runs passed', () => {
    const runs = flattenRuns();

    expect(runs).toHaveLength(0);
  });

  test('should return empty run', () => {
    const runs = flattenRuns([new Run(0, 0, { strike: true })]);

    expect(runs).toHaveLength(1);
    expect(runs[0].attributes).toEqual({ strike: true });
  });

  test('should merge two empty runs', () => {
    const runs = flattenRuns([new Run(0, 0, { strike: true }), new Run(0, 0, { color: 'red' })]);

    expect(runs).toHaveLength(1);
    expect(runs[0].attributes).toEqual({ strike: true, color: 'red' });
  });

  test('should merge two equal runs into one', () => {
    const runs = flattenRuns([new Run(0, 10, { strike: true }), new Run(0, 10, { color: 'red' })]);

    expect(runs).toHaveLength(1);
    expect(runs[0]).toHaveProperty('start', 0);
    expect(runs[0]).toHaveProperty('end', 10);
    expect(runs[0].attributes).toEqual({ strike: true, color: 'red' });
  });

  test('should split containing runs in two', () => {
    const runs = flattenRuns([new Run(0, 10, { strike: true }), new Run(0, 15, { color: 'red' })]);

    expect(runs).toHaveLength(2);

    expect(runs[0]).toHaveProperty('start', 0);
    expect(runs[0]).toHaveProperty('end', 10);
    expect(runs[0].attributes).toEqual({ strike: true, color: 'red' });

    expect(runs[1]).toHaveProperty('start', 10);
    expect(runs[1]).toHaveProperty('end', 15);
    expect(runs[1].attributes).toEqual({ color: 'red' });
  });

  test('should split containing runs in three', () => {
    const runs = flattenRuns([new Run(0, 10, { strike: true }), new Run(5, 15, { color: 'red' })]);

    expect(runs).toHaveLength(3);

    expect(runs[0]).toHaveProperty('start', 0);
    expect(runs[0]).toHaveProperty('end', 5);
    expect(runs[0].attributes).toEqual({ strike: true });

    expect(runs[1]).toHaveProperty('start', 5);
    expect(runs[1]).toHaveProperty('end', 10);
    expect(runs[1].attributes).toEqual({ strike: true, color: 'red' });

    expect(runs[2]).toHaveProperty('start', 10);
    expect(runs[2]).toHaveProperty('end', 15);
    expect(runs[2].attributes).toEqual({ color: 'red' });
  });

  test('should leave disjoint runs as they are', () => {
    const runs = flattenRuns([new Run(0, 10, { strike: true }), new Run(10, 20, { color: 'red' })]);

    expect(runs).toHaveLength(2);

    expect(runs[0]).toHaveProperty('start', 0);
    expect(runs[0]).toHaveProperty('end', 10);
    expect(runs[0].attributes).toEqual({ strike: true });

    expect(runs[1]).toHaveProperty('start', 10);
    expect(runs[1]).toHaveProperty('end', 20);
    expect(runs[1].attributes).toEqual({ color: 'red' });
  });

  test('should fill empty spaces with empty runs', () => {
    const runs = flattenRuns([new Run(0, 10, { strike: true }), new Run(15, 20, { color: 'red' })]);

    expect(runs).toHaveLength(3);

    expect(runs[1]).toHaveProperty('start', 10);
    expect(runs[1]).toHaveProperty('end', 15);
    expect(runs[1].attributes).toEqual({});
  });
});
