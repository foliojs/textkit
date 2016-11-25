import TabStop from './models/TabStop';

const TAB = 9; // Unicode/ASCII tab character code point
const ALIGN_FACTORS = {
  left: 0,
  center: 0.5,
  right: 1,
  decimal: 1
};

const ALIGN_TERMINATORS = {
  center: '\t',
  right: '\t',
  decimal: '.'
};

/**
 * A TabEngine handles aligning lines containing tab characters
 * with tab stops defined on a container. Text can be left, center,
 * right, or decimal point aligned with tab stops.
 */
export default class TabEngine {
  processLineFragment(glyphString, container) {
    for (let {glyph, position, run, x, index} of glyphString) {
      if (glyph.codePoints[0] === TAB) {
        // Find the next tab stop and adjust x-advance
        let tabStop = this.getTabStopAfter(container, x);
        position.xAdvance = (tabStop.x - x) / run.scale;

        // Adjust based on tab stop alignment
        let terminator = ALIGN_TERMINATORS[tabStop.align];
        if (terminator) {
          let next = glyphString.indexOf(terminator, index + 1);
          let nextX = glyphString.offsetAtGlyphIndex(next);

          // Center the decimal point at the tab stop
          if (tabStop.align === 'decimal' && next < glyphString.length) {
            nextX += glyphString.getGlyphWidth(next) / 2;
          }

          position.xAdvance -= (nextX - tabStop.x) / run.scale * ALIGN_FACTORS[tabStop.align];
        }
      }
    }
  }

  getTabStopAfter(container, x) {
    let low = 0;
    let high = container.tabStops.length - 1;
    let maxX = container.tabStops.length === 0 ? 0 : container.tabStops[high].x;

    // If the x position is greater than the last defined tab stop,
    // find the next tab stop using the tabStopInterval.
    if (Math.round(x) >= maxX) {
      let xOffset = (Math.ceil((x - maxX) / container.tabStopInterval) + 1) * container.tabStopInterval;
      return new TabStop(Math.min(maxX + xOffset, container.bbox.width), 'left');
    }

    // Binary search for the closest tab stop
    while (low <= high) {
      let mid = (low + high) >> 1;
      let tabStop = container.tabStops[mid];

      if (x < tabStop.x) {
        high = mid - 1;
      } else if (x > tabStop.x) {
        low = mid + 1;
      } else {
        return tabStop;
      }
    }

    return container.tabStops[low];
  }
}
