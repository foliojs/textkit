import DecorationLine from '../models/DecorationLine';
import Range from '../models/Range';
import Rect from '../geom/Rect';

// The base font size used for calculating underline thickness.
const BASE_FONT_SIZE = 16;

/**
 * A TextDecorationEngine is used by a Typesetter to generate
 * DecorationLines for a line fragment, including underlines
 * and strikes.
 */
export default class TextDecorationEngine {
  createDecorationLines(lineFragment) {
    // Create initial underline and strikethrough lines
    let x = lineFragment.overflowLeft;
    const maxX = lineFragment.advanceWidth - lineFragment.overflowRight;
    const underlines = [];

    for (const run of lineFragment.glyphRuns) {
      const width = Math.min(maxX - x, run.advanceWidth);
      const thickness = Math.max(0.5, Math.floor(run.attributes.fontSize / BASE_FONT_SIZE));

      if (run.attributes.underline) {
        const rect = new Rect(x, lineFragment.ascent, width, thickness);
        const line = new DecorationLine(
          rect,
          run.attributes.underlineColor,
          run.attributes.underlineStyle
        );
        this.addDecorationLine(line, underlines);
      }

      if (run.attributes.strike) {
        const y = lineFragment.ascent - run.ascent / 3;
        const rect = new Rect(x, y, width, thickness);
        const line = new DecorationLine(
          rect,
          run.attributes.strikeColor,
          run.attributes.strikeStyle
        );
        this.addDecorationLine(line, lineFragment.decorationLines);
      }

      x += width;
    }

    // Adjust underline y positions, and intersect with glyph descenders.
    for (const line of underlines) {
      line.rect.y += line.rect.height * 2;
      lineFragment.decorationLines.push(...this.intersectWithGlyphs(line, lineFragment));
    }
  }

  addDecorationLine(line, lines) {
    const last = lines[lines.length - 1];
    if (!last || !last.merge(line)) {
      lines.push(line);
    }
  }

  /**
   * Computes the intersections between an underline and the glyphs in
   * a line fragment. Returns an array of DecorationLines omitting the
   * intersections.
   */
  intersectWithGlyphs(line, lineFragment) {
    // Find intersection ranges between underline and glyphs
    let x = 0;
    let y = lineFragment.ascent;
    const ranges = [];

    for (const run of lineFragment.glyphRuns) {
      if (!run.attributes.underline) {
        x += run.advanceWidth;
        continue;
      }

      for (let i = 0; i < run.glyphs.length; i++) {
        const position = run.positions[i];

        if (x >= line.rect.x && x <= line.rect.maxX) {
          const gx = x + position.xOffset;
          const gy = y + position.yOffset;

          const path = run.glyphs[i].path.scale(run.scale, -run.scale).translate(gx, gy);
          const range = this.findPathIntersections(path, line.rect);

          if (range) {
            ranges.push(range);
          }
        }

        x += position.xAdvance;
        y += position.yAdvance;
      }
    }

    if (ranges.length === 0) {
      // No intersections. Return the original line.
      return [line];
    }

    const merged = Range.merge(ranges);

    // Generate underline segments omitting the intersections,
    // but only if the space warrents an underline.
    const lines = [];
    x = line.rect.x;
    for (const { start, end } of merged) {
      if (start - x > line.rect.height) {
        lines.push(line.slice(x, start));
      }

      x = end;
    }

    if (line.rect.maxX - x > line.rect.height) {
      lines.push(line.slice(x, line.rect.maxX));
    }

    return lines;
  }

  /**
   * Finds the intersections between a glyph path and an underline rectangle.
   * It models each contour of the path a straight line, and returns a range
   * containing the leftmost and rightmost intersection points, if any.
   */
  findPathIntersections(path, rect) {
    let sx = 0;
    let sy = 0;
    let cx = 0;
    let cy = 0;
    let px = 0;
    let py = 0;
    const range = new Range(Infinity, -Infinity);
    const y1 = rect.y;
    const y2 = rect.maxY;
    const dialation = Math.ceil(rect.height);

    for (const { command, args } of path.commands) {
      switch (command) {
        case 'moveTo':
          sx = cx = args[0];
          sy = cy = args[1];
          continue;

        case 'lineTo':
          px = args[0];
          py = args[1];
          break;

        case 'quadraticCurveTo':
          px = args[2];
          py = args[3];
          break;

        case 'bezierCurveTo':
          px = args[4];
          py = args[5];
          break;

        case 'closePath':
          px = sx;
          py = sy;
          break;

        default:
          break;
      }

      this.findIntersectionPoint(y1, cx, cy, px, py, range);
      this.findIntersectionPoint(y2, cx, cy, px, py, range);

      if ((cy >= y1 && cy <= y2) || (cy <= y1 && cy >= y2)) {
        range.extend(cx);
      }

      cx = px;
      cy = py;
    }

    if (range.start < range.end) {
      range.start -= dialation;
      range.end += dialation;
      return range;
    }

    return null;
  }

  findIntersectionPoint(y, x1, y1, x2, y2, range) {
    if ((y1 < y && y2 > y) || (y1 > y && y2 < y)) {
      const x = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
      range.extend(x);
    }
  }
}
