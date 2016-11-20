import DecorationLine from './models/DecorationLine';
import Range from './models/Range';
import Rect from './geom/Rect';

// The base font size used for calculating underline thickness.
const BASE_FONT_SIZE = 16;

export default class TextDecorationEngine {
  createDecorationLines(lineFragment) {
    // Create initial underline and strikethrough lines
    let x = lineFragment.overflowLeft;
    let maxX = lineFragment.advanceWidth - lineFragment.overflowRight;
    let underlines = [];

    for (let run of lineFragment.glyphRuns) {
      let width = Math.min(maxX - x, run.advanceWidth);
      let thickness = Math.max(0.5, Math.floor(run.attributes.fontSize / BASE_FONT_SIZE));

      if (run.attributes.underline) {
        let rect = new Rect(x, lineFragment.ascent, width, thickness);
        let line = new DecorationLine(rect, run.attributes.underlineColor, run.attributes.underlineStyle);
        this.addDecorationLine(line, underlines);
      }

      if (run.attributes.strike) {
        let y = lineFragment.ascent - run.ascent / 3;
        let rect = new Rect(x, y, width, thickness);
        let line = new DecorationLine(rect, run.attributes.strikeColor, run.attributes.strikeStyle);
        this.addDecorationLine(line, lineFragment.decorationLines);
      }

      x += width;
    }

    // Adjust underline y positions, and intersect with glyph descenders.
    for (let line of underlines) {
      line.rect.y += line.rect.height * 2;
      lineFragment.decorationLines.push(...this.intersectWithGlyphs(line, lineFragment));
    }
  }

  addDecorationLine(line, lines) {
    let last = lines[lines.length - 1];
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
    let ranges = [];
    let x = 0;
    let y = lineFragment.ascent;

    for (let run of lineFragment.glyphRuns) {
      if (!run.attributes.underline) {
        x += run.advanceWidth;
        continue;
      }

      for (let i = 0; i < run.run.glyphs.length; i++) {
        let position = run.run.positions[i];

        if (x >= line.rect.x && x <= line.rect.maxX) {
          let gx = x + position.xOffset * run.scale;
          let gy = y + position.yOffset * run.scale;

          let path = run.run.glyphs[i].path
            .scale(run.scale, -run.scale)
            .translate(gx, gy);

          let range = this.findPathIntersections(path, line.rect);
          if (range) {
            ranges.push(range);
          }
        }

        x += position.xAdvance * run.scale;
        y += position.yAdvance * run.scale;
      }
    }

    if (ranges.length === 0) {
      // No intersections. Return the original line.
      return [line];
    }

    ranges.sort((a, b) => a.start - b.start);

    // Merge intersecting ranges
    let merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      let last = merged[merged.length - 1];
      let next = ranges[i];

      if (next.start <= last.end && next.end <= last.end) {
        // Ignore this range completely
      } else if (next.start <= last.end) {
        last.end = secondEnd;
      } else {
        merged.push(next);
      }
    }

    // Generate underline segments omitting the intersections,
    // but only if the space warrents an underline.
    let lines = [];
    x = line.rect.x;
    for (let {start, end} of merged) {
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
    let sx = 0, sy = 0;
    let cx = 0, cy = 0;
    let px = 0, py = 0;
    let range = new Range(Infinity, -Infinity);
    let y1 = rect.y, y2 = rect.maxY;
    let dialation = Math.ceil(rect.height);

    for (let {command, args} of path.commands) {
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
  }

  findIntersectionPoint(y, x1, y1, x2, y2, range) {
    if ((y1 < y && y2 > y) || (y1 > y && y2 < y)) {
      let x = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
      range.extend(x);
    }
  }
}
