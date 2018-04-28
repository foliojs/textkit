import BBox from '../../src/geom/BBox';
import Rect from '../../src/geom/Rect';

describe('BBox', () => {
  test('should construct infinite bbox as default', () => {
    const box = new BBox();

    expect(box).toHaveProperty('minX', Infinity);
    expect(box).toHaveProperty('minY', Infinity);
    expect(box).toHaveProperty('maxX', -Infinity);
    expect(box).toHaveProperty('maxY', -Infinity);
  });

  test('should get width', () => {
    const box = new BBox(5, 5, 10, 20);

    expect(box.width).toBe(5);
  });

  test('should get height', () => {
    const box = new BBox(5, 5, 10, 20);

    expect(box.height).toBe(15);
  });

  test('should add inner point', () => {
    const box = new BBox(5, 5, 10, 20);

    box.addPoint(7, 10);

    expect(box).toHaveProperty('minX', 5);
    expect(box).toHaveProperty('minY', 5);
    expect(box).toHaveProperty('maxX', 10);
    expect(box).toHaveProperty('maxY', 20);
  });

  test('should add x exceeding point', () => {
    const box = new BBox(5, 5, 10, 20);

    box.addPoint(15, 10);

    expect(box).toHaveProperty('minX', 5);
    expect(box).toHaveProperty('minY', 5);
    expect(box).toHaveProperty('maxX', 15);
    expect(box).toHaveProperty('maxY', 20);
  });

  test('should add y exceeding point', () => {
    const box = new BBox(5, 5, 10, 20);

    box.addPoint(7, 25);

    expect(box).toHaveProperty('minX', 5);
    expect(box).toHaveProperty('minY', 5);
    expect(box).toHaveProperty('maxX', 10);
    expect(box).toHaveProperty('maxY', 25);
  });

  test('should add x & y exceeding point', () => {
    const box = new BBox(5, 5, 10, 20);

    box.addPoint(20, 25);

    expect(box).toHaveProperty('minX', 5);
    expect(box).toHaveProperty('minY', 5);
    expect(box).toHaveProperty('maxX', 20);
    expect(box).toHaveProperty('maxY', 25);
  });

  test('should add inner rect', () => {
    const box = new BBox(5, 5, 20, 20);
    const rect = new Rect(10, 10, 5, 5);

    box.addRect(rect);

    expect(box).toHaveProperty('minX', 5);
    expect(box).toHaveProperty('minY', 5);
    expect(box).toHaveProperty('maxX', 20);
    expect(box).toHaveProperty('maxY', 20);
  });

  test('should add x exceeding rect', () => {
    const box = new BBox(5, 5, 20, 20);
    const rect = new Rect(10, 10, 15, 5);

    box.addRect(rect);

    expect(box).toHaveProperty('minX', 5);
    expect(box).toHaveProperty('minY', 5);
    expect(box).toHaveProperty('maxX', 25);
    expect(box).toHaveProperty('maxY', 20);
  });

  test('should add y exceeding rect', () => {
    const box = new BBox(5, 5, 20, 20);
    const rect = new Rect(10, 10, 5, 15);

    box.addRect(rect);

    expect(box).toHaveProperty('minX', 5);
    expect(box).toHaveProperty('minY', 5);
    expect(box).toHaveProperty('maxX', 20);
    expect(box).toHaveProperty('maxY', 25);
  });

  test('should copy bbox', () => {
    const box = new BBox(5, 5, 10, 20);
    const newBox = box.copy();

    expect(newBox.minX).toBe(box.minX);
    expect(newBox.minY).toBe(box.minY);
    expect(newBox.maxX).toBe(box.maxX);
    expect(newBox.maxY).toBe(box.maxY);
  });
});
