import clone from 'lodash.clone';
import merge from 'lodash.merge';

const KASHIDA_PRIORITY = 0;
const WHITESPACE_PRIORITY = 1;
const LETTER_PRIORITY = 2;
const NULL_PRIORITY = 3;

const EXPAND_WHITESPACE_FACTOR = {
  before: 0.5,
  after: 0.5,
  priority: WHITESPACE_PRIORITY,
  unconstrained: false
};

const EXPAND_CHAR_FACTOR = {
  before: 0.14453125, // 37/256
  after: 0.14453125,
  priority: LETTER_PRIORITY,
  unconstrained: false
};

const SHRINK_WHITESPACE_FACTOR = {
  before: -0.04296875, // -11/256
  after: -0.04296875,
  priority: WHITESPACE_PRIORITY,
  unconstrained: false
};

const SHRINK_CHAR_FACTOR = {
  before: -0.04296875,
  after: -0.04296875,
  priority: LETTER_PRIORITY,
  unconstrained: false
};

/**
 * A JustificationEngine is used by a Typesetter to perform line fragment
 * justification. This implementation is based on a description of Apple's
 * justification algorithm from a PDF in the Apple Font Tools package.
 */
export default class JustificationEngine {
  constructor({
    expandCharFactor = {},
    expandWhitespaceFactor = {},
    shrinkCharFactor = {},
    shrinkWhitespaceFactor = {}
  } = {}) {
    this.expandCharFactor = merge(EXPAND_CHAR_FACTOR, expandCharFactor);
    this.expandWhitespaceFactor = merge(EXPAND_WHITESPACE_FACTOR, expandWhitespaceFactor);
    this.shrinkCharFactor = merge(SHRINK_CHAR_FACTOR, shrinkCharFactor);
    this.shrinkWhitespaceFactor = merge(SHRINK_WHITESPACE_FACTOR, shrinkWhitespaceFactor);
  }

  justify(line, options = {}) {
    const factor = options.factor || 1;
    if (factor < 0 || factor > 1) {
      throw new Error(`Invalid justification factor: ${factor}`);
    }

    const gap = line.rect.width - line.advanceWidth;
    if (gap === 0) {
      return;
    }

    const factors = [];
    let start = 0;
    for (const run of line.glyphRuns) {
      factors.push(...this.factor(line, start, run.glyphs, gap > 0 ? 'GROW' : 'SHRINK'));
      start += run.glyphs.length;
    }

    factors[0].before = 0;
    factors[factors.length - 1].after = 0;

    const distances = this.assign(gap, factors);

    let index = 0;
    for (const run of line.glyphRuns) {
      for (const position of run.positions) {
        position.xAdvance += distances[index++];
      }
    }
  }

  factor(line, start, glyphs, direction) {
    let charFactor;
    let whitespaceFactor;

    if (direction === 'GROW') {
      charFactor = clone(this.expandCharFactor);
      whitespaceFactor = clone(this.expandWhitespaceFactor);
    } else {
      charFactor = clone(this.shrinkCharFactor);
      whitespaceFactor = clone(this.shrinkWhitespaceFactor);
    }

    const factors = [];
    for (let index = 0; index < glyphs.length; index++) {
      let factor;
      const glyph = glyphs[index];
      if (line.isWhiteSpace(start + index)) {
        factor = clone(whitespaceFactor);

        if (index === glyphs.length - 1) {
          factor.before = 0;

          if (index > 0) {
            factors[index - 1].after = 0;
          }
        }
      } else if (glyph.isMark && index > 0) {
        factor = clone(factors[index - 1]);
        factor.before = 0;
        factors[index - 1].after = 0;
      } else {
        factor = clone(charFactor);
      }

      factors.push(factor);
    }

    return factors;
  }

  assign(gap, factors) {
    let total = 0;
    const priorities = [];
    const unconstrained = [];

    for (let priority = KASHIDA_PRIORITY; priority <= NULL_PRIORITY; priority++) {
      priorities[priority] = unconstrained[priority] = 0;
    }

    // sum the factors at each priority
    for (let j = 0; j < factors.length; j++) {
      const factor = factors[j];
      const sum = factor.before + factor.after;
      total += sum;
      priorities[factor.priority] += sum;
      if (factor.unconstrained) {
        unconstrained[factor.priority] += sum;
      }
    }

    // choose the priorities that need to be applied
    let highestPriority = -1;
    let highestPrioritySum = 0;
    let remainingGap = gap;
    let priority;
    for (priority = KASHIDA_PRIORITY; priority <= NULL_PRIORITY; priority++) {
      const prioritySum = priorities[priority];
      if (prioritySum !== 0) {
        if (highestPriority === -1) {
          highestPriority = priority;
          highestPrioritySum = prioritySum;
        }

        // if this priority covers the remaining gap, we're done
        if (Math.abs(remainingGap) <= Math.abs(prioritySum)) {
          priorities[priority] = remainingGap / prioritySum;
          unconstrained[priority] = 0;
          remainingGap = 0;
          break;
        }

        // mark that we need to use 100% of the adjustment from
        // this priority, and subtract the space that it consumes
        priorities[priority] = 1;
        remainingGap -= prioritySum;

        // if this priority has unconstrained glyphs, let them consume the remaining space
        if (unconstrained[priority] !== 0) {
          unconstrained[priority] = remainingGap / unconstrained[priority];
          remainingGap = 0;
          break;
        }
      }
    }

    // zero out remaining priorities (if any)
    for (let p = priority + 1; p <= NULL_PRIORITY; p++) {
      priorities[p] = 0;
      unconstrained[p] = 0;
    }

    // if there is still space left over, assign it to the highest priority that we saw.
    // this violates their factors, but it only happens in extreme cases
    if (remainingGap > 0 && highestPriority > -1) {
      priorities[highestPriority] = (highestPrioritySum + (gap - total)) / highestPrioritySum;
    }

    // create and return an array of distances to add to each glyph's advance
    const distances = [];
    for (let index = 0; index < factors.length; index++) {
      // the distance to add to this glyph is the sum of the space to add
      // after this glyph, and the space to add before the next glyph
      const factor = factors[index];
      const next = factors[index + 1];
      let dist = factor.after * priorities[factor.priority];

      if (next) {
        dist += next.before * priorities[next.priority];
      }

      // if this glyph is unconstrained, add the unconstrained distance as well
      if (factor.unconstrained) {
        dist += factor.after * unconstrained[factor.priority];
        if (next) {
          dist += next.before * unconstrained[next.priority];
        }
      }

      distances.push(dist);
    }

    return distances;
  }

  postprocess(glyphs, advances, distances) {
    // do nothing by default
    return false;
  }
}
