import Block from '../../src/models/Block';
import BBox from '../../src/geom/BBox';
import Rect from '../../src/geom/Rect';

const testLines = [
  { string: 'Lorem ipsum dolor sit amet, ', rect: new Rect(0, 0, 20, 20) },
  { string: 'consectetur adipiscing elit, ', rect: new Rect(10, 10, 20, 20) }
];

describe('Block', () => {
  test('should have empty style by default', () => {
    const block = new Block();

    expect(block.style).toEqual({});
  });

  test('should have no lines by default', () => {
    const block = new Block();

    expect(block.lines).toHaveLength(0);
  });

  test('should return string length 0 by default', () => {
    const block = new Block();

    expect(block.stringLength).toBe(0);
  });

  test('should have empty bbox by default', () => {
    const block = new Block();

    expect(block.bbox).toEqual(new BBox());
  });

  test('should return passed styles', () => {
    const style = { someStyle: 'someValue' };
    const block = new Block([], style);

    expect(block.style).toEqual(style);
  });

  test('should return lines string length', () => {
    const block = new Block(testLines);

    expect(block.stringLength).toBe(28 + 29);
  });

  test('should return lines bounding box', () => {
    const block = new Block(testLines);

    expect(block.bbox.minX).toBe(0);
    expect(block.bbox.minY).toBe(0);
    expect(block.bbox.maxX).toBe(30);
    expect(block.bbox.maxY).toBe(30);
  });
});
