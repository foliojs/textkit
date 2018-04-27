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
export default () => ({ TabStop }) =>
  class TabEngine {
    processLineFragment(glyphString, container) {
      for (const { position, x, index } of glyphString) {
        if (glyphString.codePointAtGlyphIndex(index) === TAB) {
          // Find the next tab stop and adjust x-advance
          const tabStop = this.getTabStopAfter(container, x);
          position.xAdvance = tabStop.x - x;

          // Adjust based on tab stop alignment
          const terminator = ALIGN_TERMINATORS[tabStop.align];
          if (terminator) {
            const next = glyphString.indexOf(terminator, index + 1);
            let nextX = glyphString.offsetAtGlyphIndex(next);

            // Center the decimal point at the tab stop
            if (tabStop.align === 'decimal' && next < glyphString.length) {
              nextX += glyphString.getGlyphWidth(next) / 2;
            }

            position.xAdvance -= (nextX - tabStop.x) * ALIGN_FACTORS[tabStop.align];
          }
        }
      }
    }

    getTabStopAfter(container, x) {
      let low = 0;
      let high = container.tabStops.length - 1;
      const maxX = container.tabStops.length === 0 ? 0 : container.tabStops[high].x;

      // If the x position is greater than the last defined tab stop,
      // find the next tab stop using the tabStopInterval.
      if (Math.round(x) >= maxX) {
        const xOffset =
          (Math.ceil((x - maxX) / container.tabStopInterval) + 1) * container.tabStopInterval;
        return new TabStop(Math.min(maxX + xOffset, container.bbox.width), 'left');
      }

      // Binary search for the closest tab stop
      while (low <= high) {
        const mid = (low + high) >> 1;
        const tabStop = container.tabStops[mid];

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
  };
