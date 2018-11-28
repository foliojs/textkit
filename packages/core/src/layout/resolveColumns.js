import Rect from '../geom/Rect';

const resolveColumns = container => {
  const { bbox, columns, columnGap } = container;
  const columnWidth = (bbox.width - columnGap * (columns - 1)) / columns;

  let x = bbox.minX;
  const result = [];

  for (let index = 0; index < columns; index++) {
    result.push(new Rect(x, bbox.minY, columnWidth, bbox.height));
    x += columnWidth + container.columnGap;
  }

  return result;
};

export default resolveColumns;
