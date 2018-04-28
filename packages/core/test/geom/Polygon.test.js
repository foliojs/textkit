import Polygon from '../../src/geom/Polygon';

describe('Polygon', () => {
  test('should construct empty polygon as default', () => {
    const polygon = new Polygon();

    expect(polygon.contours).toHaveLength(0);
  });

  test('should add contour', () => {
    const contour = 'some contour';
    const polygon = new Polygon();

    polygon.addContour(contour);

    expect(polygon.contours).toHaveLength(1);
    expect(polygon.contours[0]).toBe(contour);
  });
});
