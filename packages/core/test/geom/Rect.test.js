import Rect from '../../src/geom/Rect';
import Point from '../../src/geom/Point';

describe('Rect', () => {
  test('should construct origin rect as default', () => {
    const rect = new Rect();

    expect(rect).toHaveProperty('x', 0);
    expect(rect).toHaveProperty('y', 0);
    expect(rect).toHaveProperty('width', 0);
    expect(rect).toHaveProperty('height', 0);
  });

  test('should correctly get maxX', () => {
    const rect = new Rect(5, 5, 10, 10);

    expect(rect.maxX).toBe(15);
  });

  test('should correctly get maxY', () => {
    const rect = new Rect(0, 0, 10, 10);

    expect(rect.maxY).toBe(10);
  });

  test('should correctly get area', () => {
    const rect = new Rect(0, 0, 5, 10);

    expect(rect.area).toBe(50);
  });

  test('should correctly get topLeft point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const { topLeft } = rect;

    expect(topLeft.x).toBe(5);
    expect(topLeft.y).toBe(5);
  });

  test('should correctly get topRight point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const { topRight } = rect;

    expect(topRight.x).toBe(10);
    expect(topRight.y).toBe(5);
  });

  test('should correctly get bottomLeft point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const { bottomLeft } = rect;

    expect(bottomLeft.x).toBe(5);
    expect(bottomLeft.y).toBe(15);
  });

  test('should correctly get bottomRight point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const { bottomRight } = rect;

    expect(bottomRight.x).toBe(10);
    expect(bottomRight.y).toBe(15);
  });

  test('should intersects return true for intersecting rect', () => {
    const rect1 = new Rect(5, 5, 5, 10);
    const rect2 = new Rect(7, 10, 10, 10);

    expect(rect1.intersects(rect2)).toBeTruthy();
  });

  test('should intersects return false for non-intersecting rect', () => {
    const rect1 = new Rect(5, 5, 5, 10);
    const rect2 = new Rect(20, 20, 5, 5);

    expect(rect1.intersects(rect2)).toBeFalsy();
  });

  test('should contains be true for containing rect', () => {
    const rect1 = new Rect(5, 5, 10, 10);
    const rect2 = new Rect(10, 10, 3, 3);

    expect(rect1.containsRect(rect2)).toBeTruthy();
  });

  test('should contains be false for non-containing intersecting rect', () => {
    const rect1 = new Rect(5, 5, 5, 10);
    const rect2 = new Rect(7, 10, 10, 10);

    expect(rect1.containsRect(rect2)).toBeFalsy();
  });

  test('should contains be false for non-containing non-intersec. rect', () => {
    const rect1 = new Rect(5, 5, 5, 10);
    const rect2 = new Rect(20, 20, 10, 10);

    expect(rect1.containsRect(rect2)).toBeFalsy();
  });

  test('should containsPoint be true for inner point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const point = new Point(10, 10);

    expect(rect.containsPoint(point)).toBeTruthy();
  });

  test('should containsPoint be true for edge point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const point = new Point(5, 7);

    expect(rect.containsPoint(point)).toBeTruthy();
  });

  test('should containsPoint be false for outside point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const point = new Point(20, 20);

    expect(rect.containsPoint(point)).toBeFalsy();
  });

  test('should equals be true for equal rect', () => {
    const rect1 = new Rect(5, 5, 5, 10);
    const rect2 = new Rect(5, 5, 5, 10);

    expect(rect1.equals(rect2)).toBeTruthy();
  });

  test('should equals be false for outside point', () => {
    const rect1 = new Rect(5, 5, 5, 10);
    const rect2 = new Rect(10, 10, 5, 10);

    expect(rect1.equals(rect2)).toBeFalsy();
  });

  test('should pointEquals be true for equal point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const point = new Point(5, 5);

    expect(rect.pointEquals(point)).toBeTruthy();
  });

  test('should pointEquals be false for non-equal point', () => {
    const rect = new Rect(5, 5, 5, 10);
    const point = new Point(0, 0);

    expect(rect.pointEquals(point)).toBeFalsy();
  });

  test('should sizeEquals be true', () => {
    const rect = new Rect(5, 5, 5, 10);
    const size = { width: 5, height: 10 };

    expect(rect.sizeEquals(size)).toBeTruthy();
  });

  test('should sizeEquals be false', () => {
    const rect = new Rect(5, 5, 5, 10);
    const size = { width: 10, height: 10 };

    expect(rect.sizeEquals(size)).toBeFalsy();
  });

  test('should copy rect', () => {
    const rect = new Rect(5, 5, 10, 10);
    const newRect = rect.copy();

    expect(newRect.x).toBe(rect.x);
    expect(newRect.y).toBe(rect.y);
    expect(newRect.width).toBe(rect.width);
    expect(newRect.height).toBe(rect.height);
  });
});
