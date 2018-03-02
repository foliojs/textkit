import BBox from './BBox';
import Polygon from './Polygon';
import Point from './Point';
import cubic2quad from 'cubic2quad';

const SVG_COMMANDS = {
  moveTo: 'M',
  lineTo: 'L',
  quadraticCurveTo: 'Q',
  bezierCurveTo: 'C',
  closePath: 'Z'
};

// This constant is used to approximate a symmetrical arc using a cubic Bezier curve.
const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);

/**
 * Path objects are returned by glyphs and represent the actual
 * vector outlines for each glyph in the font. Paths can be converted
 * to SVG path data strings, or to functions that can be applied to
 * render the path to a graphics context.
 */
export default class Path {
  constructor() {
    this.commands = [];
    this._bbox = null;
    this._cbox = null;
    this._bezier = false;
    this._quadratic = false;
  }

  rect(x, y, width, height) {
    this.moveTo(x, y);
    this.lineTo(x + width, y);
    this.lineTo(x + width, y + height);
    this.lineTo(x, y + height);
    this.closePath();
    return this;
  }

  ellipse(x, y, r1, r2 = r1) {
    // based on http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas/2173084#2173084
    x -= r1;
    y -= r2;
    let ox = r1 * KAPPA;
    let oy = r2 * KAPPA;
    let xe = x + r1 * 2;
    let ye = y + r2 * 2;
    let xm = x + r1;
    let ym = y + r2;

    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    this.closePath();
    return this;
  }

  circle(x, y, radius) {
    this.ellipse(x, y, radius);
  }

  append(path) {
    for (let { command, args } of path.commands) {
      this[command](...args);
    }

    return this;
  }

  /**
   * Compiles the path to a JavaScript function that can be applied with
   * a graphics context in order to render the path.
   * @return {string}
   */
  toFunction() {
    let cmds = this.commands.map(
      c => `  ctx.${c.command}(${c.args.join(', ')});`
    );
    return new Function('ctx', cmds.join('\n'));
  }

  /**
   * Converts the path to an SVG path data string
   * @return {string}
   */
  toSVG() {
    let cmds = this.commands.map(c => {
      let args = c.args.map(arg => Math.round(arg * 100) / 100);
      return `${SVG_COMMANDS[c.command]}${args.join(' ')}`;
    });

    return cmds.join('');
  }

  /**
   * Gets the 'control box' of a path.
   * This is like the bounding box, but it includes all points including
   * control points of bezier segments and is much faster to compute than
   * the real bounding box.
   * @type {BBox}
   */
  get cbox() {
    if (!this._cbox) {
      let cbox = new BBox();
      for (let command of this.commands) {
        for (let i = 0; i < command.args.length; i += 2) {
          cbox.addPoint(command.args[i], command.args[i + 1]);
        }
      }

      this._cbox = Object.freeze(cbox);
    }

    return this._cbox;
  }

  /**
   * Gets the exact bounding box of the path by evaluating curve segments.
   * Slower to compute than the control box, but more accurate.
   * @type {BBox}
   */
  get bbox() {
    if (this._bbox) {
      return this._bbox;
    }

    let bbox = new BBox();
    let cx = 0,
      cy = 0;

    let f = t =>
      Math.pow(1 - t, 3) * p0[i] +
      3 * Math.pow(1 - t, 2) * t * p1[i] +
      3 * (1 - t) * Math.pow(t, 2) * p2[i] +
      Math.pow(t, 3) * p3[i];

    for (let { command, args } of this.commands) {
      switch (command) {
        case 'moveTo':
        case 'lineTo':
          let [x, y] = args;
          bbox.addPoint(x, y);
          cx = x;
          cy = y;
          break;

        case 'quadraticCurveTo':
          args = quadraticToBezier(cx, cy, ...args);
        // fall through

        case 'bezierCurveTo':
          let [cp1x, cp1y, cp2x, cp2y, p3x, p3y] = args;

          // http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
          bbox.addPoint(p3x, p3y);

          var p0 = [cx, cy];
          var p1 = [cp1x, cp1y];
          var p2 = [cp2x, cp2y];
          var p3 = [p3x, p3y];

          for (var i = 0; i <= 1; i++) {
            let b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
            let a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
            let c = 3 * p1[i] - 3 * p0[i];

            if (a === 0) {
              if (b === 0) {
                continue;
              }

              let t = -c / b;
              if (0 < t && t < 1) {
                if (i === 0) {
                  bbox.addPoint(f(t), bbox.maxY);
                } else if (i === 1) {
                  bbox.addPoint(bbox.maxX, f(t));
                }
              }

              continue;
            }

            let b2ac = Math.pow(b, 2) - 4 * c * a;
            if (b2ac < 0) {
              continue;
            }

            let t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
            if (0 < t1 && t1 < 1) {
              if (i === 0) {
                bbox.addPoint(f(t1), bbox.maxY);
              } else if (i === 1) {
                bbox.addPoint(bbox.maxX, f(t1));
              }
            }

            let t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
            if (0 < t2 && t2 < 1) {
              if (i === 0) {
                bbox.addPoint(f(t2), bbox.maxY);
              } else if (i === 1) {
                bbox.addPoint(bbox.maxX, f(t2));
              }
            }
          }

          cx = p3x;
          cy = p3y;
          break;
      }
    }

    return (this._bbox = Object.freeze(bbox));
  }

  mapPoints(fn) {
    let path = new Path();

    for (let c of this.commands) {
      let args = [];
      for (let i = 0; i < c.args.length; i += 2) {
        let [x, y] = fn(c.args[i], c.args[i + 1]);
        args.push(x, y);
      }

      path[c.command](...args);
    }

    return path;
  }

  transform(m0, m1, m2, m3, m4, m5) {
    return this.mapPoints((x, y) => {
      x = m0 * x + m2 * y + m4;
      y = m1 * x + m3 * y + m5;
      return [x, y];
    });
  }

  translate(x, y) {
    return this.transform(1, 0, 0, 1, x, y);
  }

  rotate(angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return this.transform(cos, sin, -sin, cos, 0, 0);
  }

  scale(scaleX, scaleY = scaleX) {
    return this.transform(scaleX, 0, 0, scaleY, 0, 0);
  }

  quadraticToBezier() {
    if (!this._quadratic) {
      return this;
    }

    let path = new Path();
    let x = 0,
      y = 0;
    for (let c of this.commands) {
      if (c.command === 'quadraticCurveTo') {
        let quads = quadraticToBezier(x, y, ...c.args);

        for (let i = 2; i < quads.length; i += 6) {
          path.bezierCurveTo(
            quads[i],
            quads[i + 1],
            quads[i + 2],
            quads[i + 3],
            quads[i + 4],
            quads[i + 5]
          );
        }
      } else {
        path[c.command](...c.args);
        x = c.args[c.args.length - 2] || 0;
        y = c.args[c.args.length - 1] || 0;
      }
    }

    return path;
  }

  bezierToQuadratic() {
    if (!this._bezier) {
      return this;
    }

    let path = new Path();
    let x = 0,
      y = 0;
    for (let c of this.commands) {
      if (c.command === 'bezierCurveTo') {
        let quads = cubic2quad(x, y, ...c.args, 0.1);

        for (let i = 2; i < quads.length; i += 4) {
          path.quadraticCurveTo(
            quads[i],
            quads[i + 1],
            quads[i + 2],
            quads[i + 3]
          );
        }
      } else {
        path[c.command](...c.args);
        x = c.args[c.args.length - 2] || 0;
        y = c.args[c.args.length - 1] || 0;
      }
    }

    return path;
  }

  get isFlat() {
    return !this._bezier && !this._quadratic;
  }

  flatten() {
    if (this.isFlat) {
      return this;
    }

    let res = new Path();
    let cx = 0,
      cy = 0,
      sx = 0,
      sy = 0;

    for (let { command, args } of this.commands) {
      switch (command) {
        case 'moveTo':
          res.moveTo(...args);
          cx = sx = args[0];
          cy = sy = args[1];
          break;

        case 'lineTo':
          res.lineTo(...args);
          cx = args[0];
          cy = args[1];
          break;

        case 'quadraticCurveTo':
          args = quadraticToBezier(cx, cy, ...args);
        // fall through!

        case 'bezierCurveTo':
          subdivideBezierWithFlatness(res, 0.6, cx, cy, ...args);
          cx = args[4];
          cy = args[5];
          break;

        case 'closePath':
          cx = sx;
          cy = sy;
          res.closePath();
          break;

        default:
          throw new Error(`Unknown path command: ${command}`);
      }
    }

    return res;
  }

  get isClockwise() {
    // For each point, compute the cross-product magnitude of the two adjoining edges.
    // If the sum is positive, the points are in clockwise order.
    // http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
    let cx = 0;
    let cy = 0;
    let sx = 0;
    let sy = 0;
    let sum = 0;

    let path = this.flatten();
    for (let { command, args } of path.commands) {
      let [x, y] = args;
      switch (command) {
        case 'moveTo':
          sx = cx = x;
          sy = cy = y;
          break;

        case 'lineTo':
          if (cx !== x || cy !== y) {
            sum += cx * y - cy * x;
          }

          cx = x;
          cy = y;
          break;

        case 'closePath':
          if (cx !== sx || cy !== sy) {
            sum += cx * sy - cy * sx;
          }
          break;

        default:
          throw new Error(`Unknown path command: ${command}`);
      }
    }

    sum += cx * sy - cy * sx;
    return sum >= 0;
  }

  reverse() {
    let commands = this.commands;
    let start = commands[0];
    let res = new Path();

    for (let i = 1; i < commands.length; i++) {
      let { command, args } = commands[i];
      if (command !== 'moveTo' && i + 1 < commands.length) {
        continue;
      }

      let closed = false;
      let j = i;

      if (command === 'moveTo') {
        j--;
      }

      let move = commands[j].command === 'closePath' ? start : commands[j];
      res.moveTo(move.args[0], move.args[1]);

      for (; commands[j].command !== 'moveTo'; j--) {
        let prev = commands[j - 1];
        let cur = commands[j];
        let px = prev.args[prev.args.length - 2];
        let py = prev.args[prev.args.length - 1];

        switch (cur.command) {
          case 'lineTo':
            if (closed && prev.command === 'moveTo') {
              res.closePath();
            } else {
              res.lineTo(px, py);
            }
            break;

          case 'bezierCurveTo':
            res.bezierCurveTo(
              cur.args[2],
              cur.args[3],
              cur.args[0],
              cur.args[1],
              px,
              py
            );
            if (closed && prev.command === 'moveTo') {
              prev.closePath();
            }
            break;

          case 'quadraticCurveTo':
            res.quadraticCurveTo(cur.args[0], cur.args[1], px, py);
            if (closed && prev.command === 'moveTo') {
              prev.closePath();
            }
            break;

          case 'closePath':
            closed = true;
            res.lineTo(px, py);
            break;

          default:
            throw new Error(`Unknown path command: ${command}`);
        }
      }

      start = commands[i];
    }

    return res;
  }

  toPolygon() {
    // Flatten and canonicalize the path.
    let path = this.flatten();
    if (!path.isClockwise) {
      path = path.reverse();
    }

    let contour = [];
    let polygon = new Polygon();

    for (let { command, args } of path.commands) {
      switch (command) {
        case 'moveTo':
          if (contour.length) {
            polygon.addContour(contour);
            contour = [];
          }

          contour.push(new Point(args[0], args[1]));
          break;

        case 'lineTo':
          contour.push(new Point(args[0], args[1]));
          break;

        case 'closePath':
          if (contour.length) {
            polygon.addContour(contour);
            contour = [];
          }
          break;

        default:
          throw new Error(`Unsupported path command: ${command}`);
      }
    }

    return polygon;
  }
}

for (let command of [
  'moveTo',
  'lineTo',
  'quadraticCurveTo',
  'bezierCurveTo',
  'closePath'
]) {
  Path.prototype[command] = function(...args) {
    this._bbox = this._cbox = null;
    this.commands.push({
      command,
      args
    });

    if (command === 'bezierCurveTo') {
      this._bezier = true;
    } else if (command === 'quadraticCurveTo') {
      this._quadratic = true;
    }

    return this;
  };
}

function quadraticToBezier(cx, cy, qp1x, qp1y, x, y) {
  // http://fontforge.org/bezier.html
  var cp1x = cx + 2 / 3 * (qp1x - cx); // CP1 = QP0 + 2/3 * (QP1-QP0)
  var cp1y = cy + 2 / 3 * (qp1y - cy);
  var cp2x = x + 2 / 3 * (qp1x - x); // CP2 = QP2 + 2/3 * (QP1-QP2)
  var cp2y = y + 2 / 3 * (qp1y - y);
  return [cp1x, cp1y, cp2x, cp2y, x, y];
}

function subdivideBezierWithFlatness(
  path,
  flatness,
  cx,
  cy,
  cp1x,
  cp1y,
  cp2x,
  cp2y,
  x,
  y
) {
  let dx1 = cp1x - cx;
  let dx2 = cp2x - cp1x;
  let dx3 = x - cp2x;
  let dx4 = dx2 - dx1;
  let dx5 = dx3 - dx2;
  let dx6 = dx5 - dx4;

  let dy1 = cp1y - cy;
  let dy2 = cp2y - cp1y;
  let dy3 = y - cp2y;
  let dy4 = dy2 - dy1;
  let dy5 = dy3 - dy2;
  let dy6 = dy5 - dy4;

  let d1 = dx4 * dx4 + dy4 * dy4;
  let d2 = dx5 * dx5 + dy5 * dy5;
  let wat = 9 * Math.max(d1, d2) / 16;
  let flatnessSqr = flatness * flatness;

  let wat2 = 6 * dx6;
  let wat3 = 6 * (dx4 + dx6);
  let wat4 = 3 * (dx1 + dx4) + dx6;

  let wat5 = 6 * dy6;
  let wat6 = 6 * (dy4 + dy6);
  let wat7 = 3 * (dy1 + dy4) + dy6;

  let f = 1;

  while (wat > flatnessSqr && f <= 65535) {
    wat2 /= 8;
    wat3 = wat3 / 4 - wat2;
    wat4 = wat4 / 2 - wat3 / 2;

    wat5 /= 8;
    wat6 = wat6 / 4 - wat5;
    wat7 = wat7 / 2 - wat6 / 2;

    wat /= 16;
    f <<= 1;
  }

  while (--f > 0) {
    cx += wat4;
    wat4 += wat3;
    wat3 += wat2;

    cy += wat7;
    wat7 += wat6;
    wat6 += wat5;

    path.lineTo(cx, cy);
  }

  path.lineTo(x, y);
}
