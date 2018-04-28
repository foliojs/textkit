import Range from '../../src/models/Range';

describe('Range', () => {
  test('should handle passed start and end', () => {
    const range = new Range(5, 10);

    expect(range).toHaveProperty('start', 5);
    expect(range).toHaveProperty('end', 10);
  });

  test('should calculate length correctly', () => {
    const range = new Range(5, 10);

    expect(range.length).toBe(6);
  });

  test('should equals with equal range', () => {
    const range1 = new Range(5, 10);
    const range2 = new Range(5, 10);

    expect(range1.equals(range2)).toBeTruthy();
  });

  test('should not equals with different range', () => {
    const range1 = new Range(5, 10);
    const range2 = new Range(0, 5);

    expect(range1.equals(range2)).toBeFalsy();
  });

  test('should contain valid index', () => {
    const range = new Range(5, 10);

    expect(range.contains(6)).toBeTruthy();
  });

  test('should contain lower inclusive index', () => {
    const range = new Range(5, 10);

    expect(range.contains(5)).toBeTruthy();
  });

  test('should contain upper inclusive index', () => {
    const range = new Range(5, 10);

    expect(range.contains(10)).toBeTruthy();
  });

  test('should not contain invalid index', () => {
    const range = new Range(5, 10);

    expect(range.contains(11)).toBeFalsy();
  });

  test('should extend for lower values', () => {
    const range = new Range(5, 10);

    range.extend(2);

    expect(range).toHaveProperty('start', 2);
    expect(range).toHaveProperty('end', 10);
  });

  test('should extend for inner values', () => {
    const range = new Range(5, 10);

    range.extend(7);

    expect(range).toHaveProperty('start', 5);
    expect(range).toHaveProperty('end', 10);
  });

  test('should extend for upper values', () => {
    const range = new Range(5, 10);

    range.extend(12);

    expect(range).toHaveProperty('start', 5);
    expect(range).toHaveProperty('end', 12);
  });

  test('should merge containing ranges', () => {
    const rangeA = new Range(5, 10);
    const rangeB = new Range(6, 9);

    const merged = Range.merge([rangeA, rangeB]);

    expect(merged).toHaveLength(1);
    expect(merged[0].start).toBe(5);
    expect(merged[0].end).toBe(10);
  });

  test('should merge containing ranges', () => {
    const rangeA = new Range(5, 10);
    const rangeB = new Range(6, 9);

    const merged = Range.merge([rangeA, rangeB]);

    expect(merged).toHaveLength(1);
    expect(merged[0].start).toBe(5);
    expect(merged[0].end).toBe(10);
  });

  test('should merge intersecting ranges', () => {
    const rangeA = new Range(5, 10);
    const rangeB = new Range(7, 12);

    const merged = Range.merge([rangeA, rangeB]);

    expect(merged).toHaveLength(1);
    expect(merged[0].start).toBe(5);
    expect(merged[0].end).toBe(12);
  });

  test('should merge non-intersecting ranges', () => {
    const rangeA = new Range(5, 10);
    const rangeB = new Range(15, 25);

    const merged = Range.merge([rangeA, rangeB]);

    expect(merged).toHaveLength(2);
    expect(merged[0].start).toBe(5);
    expect(merged[0].end).toBe(10);
    expect(merged[1].start).toBe(15);
    expect(merged[1].end).toBe(25);
  });

  test('should merge many unsorted ranges', () => {
    const rangeA = new Range(8, 12);
    const rangeB = new Range(5, 10);
    const rangeC = new Range(0, 2);

    const merged = Range.merge([rangeA, rangeB, rangeC]);

    expect(merged).toHaveLength(2);
    expect(merged[0].start).toBe(0);
    expect(merged[0].end).toBe(2);
    expect(merged[1].start).toBe(5);
    expect(merged[1].end).toBe(12);
  });
});
