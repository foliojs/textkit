import wrapWords from './wrapWords';
import typesetter from './typesetter';
import injectEngines from './injectEngines';
import generateGlyphs from './generateGlyphs';
import resolveYOffset from './resolveYOffset';
import preprocessRuns from './preprocessRuns';
import splitParagraphs from './splitParagraphs';
import resolveAttachments from './resolveAttachments';
import applyDefaultStyles from './applyDefaultStyles';

/**
 * A LayoutEngine is the main object that performs text layout.
 * It accepts an AttributedString and a list of Container objects
 * to layout text into, and uses several helper objects to perform
 * various layout tasks. These objects can be overridden to customize
 * layout behavior.
 */

const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

const map = fn => (array, ...other) => array.map((e, index) => fn(e, ...other, index));

export default class LayoutEngine {
  constructor(engines) {
    this.engines = injectEngines(engines);
  }

  layout(attributedString, containers) {
    compose(
      typesetter(this.engines)(containers),
      map(resolveYOffset(this.engines)),
      map(resolveAttachments(this.engines)),
      map(generateGlyphs(this.engines)),
      map(wrapWords(this.engines)),
      splitParagraphs(this.engines),
      preprocessRuns(this.engines),
      applyDefaultStyles(this.engines)
    )(attributedString);
  }
}
