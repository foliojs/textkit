import Path from '../../src/geom/Path';
import Container from '../../src/models/Container';

/* eslint-disable-next-line */
export const createRectContainer = (x, y, width, height, attrs) => {
  const path = new Path();
  path.rect(x, y, width, height);
  return new Container(path, attrs);
};
