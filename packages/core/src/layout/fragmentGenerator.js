import Rect from '../geom/Rect';

const LEFT = 0;
const RIGHT = 1;
const BELOW = 1;
const INSIDE = 2;
const ABOVE = 3;
const INTERIOR = 1;
const EXTERIOR = 2;

const BELOW_TO_INSIDE = (BELOW << 4) | INSIDE;
const BELOW_TO_ABOVE = (BELOW << 4) | ABOVE;
const INSIDE_TO_BELOW = (INSIDE << 4) | BELOW;
const INSIDE_TO_ABOVE = (INSIDE << 4) | ABOVE;
const ABOVE_TO_INSIDE = (ABOVE << 4) | INSIDE;
const ABOVE_TO_BELOW = (ABOVE << 4) | BELOW;

const xIntersection = (e, t, n) => {
  const r = e - n.y;
  const i = t.y - n.y;
  return (r / i) * (t.x - n.x) + n.x;
};

const splitLineRect = (lineRect, polygon, type) => {
  const minY = lineRect.y;
  const maxY = lineRect.maxY;
  const markers = [];
  let wrapState = BELOW;
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < polygon.contours.length; i++) {
    const contour = polygon.contours[i];
    let index = -1;
    let state = -1;

    // Find the first point outside the line rect.
    do {
      const point = contour[++index];
      state = point.y <= minY ? BELOW : point.y >= maxY ? ABOVE : INSIDE;
    } while (state === INSIDE && index < contour.length - 1);

    // Contour is entirely inside the line rect. Skip it.
    if (state === INSIDE) {
      continue;
    }

    const dir = type === EXTERIOR ? 1 : -1;
    let idx = type === EXTERIOR ? index : contour.length + index;
    let currentPoint;

    for (let index = 0; index <= contour.length; index++, idx += dir) {
      const point = contour[idx % contour.length];

      if (index === 0) {
        currentPoint = point;
        state = point.y <= minY ? BELOW : point.y >= maxY ? ABOVE : INSIDE;
        continue;
      }

      const s = point.y <= minY ? BELOW : point.y >= maxY ? ABOVE : INSIDE;
      const x = point.x;

      if (s !== state) {
        const stateChangeType = (state << 4) | s;
        switch (stateChangeType) {
          case BELOW_TO_INSIDE: {
            // console.log('BELOW_TO_INSIDE')
            const xIntercept = xIntersection(minY, point, currentPoint);
            min = Math.min(xIntercept, x);
            max = Math.max(xIntercept, x);
            wrapState = BELOW;
            break;
          }

          case BELOW_TO_ABOVE: {
            // console.log('BELOW_TO_ABOVE')
            const x1 = xIntersection(minY, point, currentPoint);
            const x2 = xIntersection(maxY, point, currentPoint);
            markers.push({
              type: LEFT,
              position: Math.max(x1, x2)
            });
            break;
          }

          case ABOVE_TO_INSIDE: {
            // console.log('ABOVE_TO_INSIDE')
            const xIntercept = xIntersection(maxY, point, currentPoint);
            min = Math.min(xIntercept, x);
            max = Math.max(xIntercept, x);
            wrapState = ABOVE;
            break;
          }

          case ABOVE_TO_BELOW: {
            // console.log('ABOVE_TO_BELOW')
            const x1 = xIntersection(minY, point, currentPoint);
            const x2 = xIntersection(maxY, point, currentPoint);
            markers.push({
              type: RIGHT,
              position: Math.min(x1, x2)
            });
            break;
          }

          case INSIDE_TO_ABOVE: {
            // console.log('INSIDE_TO_ABOVE')
            const x1 = xIntersection(maxY, point, currentPoint);
            max = Math.max(max, x1);

            markers.push({ type: LEFT, position: max });

            if (wrapState === ABOVE) {
              min = Math.min(min, x1);
              markers.push({ type: RIGHT, position: min });
            }

            break;
          }

          case INSIDE_TO_BELOW: {
            // console.log('INSIDE_TO_BELOW')
            const x1 = xIntersection(minY, point, currentPoint);
            min = Math.min(min, x1);

            markers.push({ type: RIGHT, position: min });

            if (wrapState === BELOW) {
              max = Math.max(max, x1);
              markers.push({ type: LEFT, position: max });
            }

            break;
          }

          default:
            throw new Error('Unknown state change');
        }
        state = s;
      } else if (s === INSIDE) {
        min = Math.min(min, x);
        max = Math.max(max, x);
      }

      currentPoint = point;
    }
  }

  markers.sort((a, b) => a.position - b.position);

  let G = 0;
  if (type === '' || (markers.length > 0 && markers[0].type === LEFT)) {
    G++;
  }

  let minX = lineRect.x;
  const { maxX } = lineRect;
  const { height } = lineRect;
  const rects = [];

  for (const marker of markers) {
    if (marker.type === RIGHT) {
      if (G === 0) {
        const p = Math.min(maxX, marker.position);
        if (p >= minX) {
          rects.push(new Rect(minX, minY, p - minX, height));
        }
      }

      G++;
    } else {
      G--;
      if (G === 0 && marker.position > minX) {
        minX = marker.position;
      }
    }
  }

  if (G === 0 && maxX >= minX) {
    rects.push(new Rect(minX, minY, maxX - minX, height));
  }

  return rects;
};

/**
 * A LineFragmentGenerator splits line rectangles into fragments,
 * wrapping inside a container's polygon, and outside its exclusion polygon.
 */
const generateLineFragments = (lineRect, container) => {
  const exclusion = container.exclusionPolygon;
  const rects = splitLineRect(lineRect, container.polygon, INTERIOR);

  if (exclusion) {
    const res = [];
    for (const rect of rects) {
      res.push(...splitLineRect(rect, exclusion, EXTERIOR));
    }

    return res;
  }

  return rects;
};

const generateFragments = (paragraphRect, lineHeight, container) => {
  const lineFragements = [];
  let yCount = paragraphRect.y;

  while (paragraphRect.height + paragraphRect.y >= yCount + lineHeight) {
    const lineRect = new Rect(paragraphRect.x, yCount, paragraphRect.width, lineHeight);
    lineFragements.push(...generateLineFragments(lineRect, container));
    yCount += lineHeight;
  }

  return lineFragements;
};

export default generateFragments;
