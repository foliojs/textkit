import Run from '../src/models/Run';

describe('Run', () => {
  test('should handle passed start and end', () => {
    const run = new Run(5, 10);

    expect(run).toHaveProperty('start', 5);
    expect(run).toHaveProperty('end', 10);
  });

  test('should handle passed attributes', () => {
    const attrs = { something: 'blah' };
    const run = new Run(5, 10, attrs);

    expect(run).toHaveProperty('attributes', attrs);
  });

  test('should handle passed attributes', () => {
    const attrs = { something: 'blah' };
    const run = new Run(5, 10, attrs);

    expect(run).toHaveProperty('attributes', attrs);
  });

  test('should slice containing range', () => {
    const run = new Run(5, 15);
    const slice = run.slice(2, 5);

    expect(slice).toHaveProperty('start', 7);
    expect(slice).toHaveProperty('end', 10);
  });

  test('should slice exceeding range', () => {
    const run = new Run(5, 15);
    const slice = run.slice(8, 13);

    expect(slice).toHaveProperty('start', 13);
    expect(slice).toHaveProperty('end', 15);
  });
});
