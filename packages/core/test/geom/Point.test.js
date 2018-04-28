import Point from '../../src/geom/Point';

describe('Point', () => {
  test('should construct origin point as default', () => {
    const point = new Point();

    expect(point).toHaveProperty('x', 0);
    expect(point).toHaveProperty('y', 0);
  });

  test('should apply translation matrix', () => {
    const point = new Point(5, 5);
    const transformed = point.transform(1, 0, 0, 1, 5, 5);

    expect(transformed).toHaveProperty('x', 10);
    expect(transformed).toHaveProperty('y', 10);
  });

  test('should apply scaling matrix', () => {
    const point = new Point(5, 5);
    const transformed = point.transform(0.5, 0, 0, 2, 0, 0);

    expect(transformed).toHaveProperty('x', 2.5);
    expect(transformed).toHaveProperty('y', 10);
  });

  test('should apply rotation matrix', () => {
    const point = new Point(0, -5);
    const sin = Math.sin(Math.PI / 2);
    const cos = Math.cos(Math.PI / 2);
    const transformed = point.transform(cos, sin, -sin, cos, 0, 0);

    expect(transformed.x).toBeCloseTo(5);
    expect(transformed.y).toBeCloseTo(0);
  });

  test('should copy point', () => {
    const point = new Point(5, 5);
    const newPoint = point.copy();

    expect(newPoint.x).toBe(point.x);
    expect(newPoint.y).toBe(point.y);
  });
});
