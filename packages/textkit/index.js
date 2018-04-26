import FontSubstitutionEngine from '@textkit/font-substitution-engine';
import JustificationEngine from '@textkit/justification-engine';
import LineFragmentGenerator from '@textkit/line-fragment-generator';
import LineBreaker from '@textkit/linebreaker';
import ScriptItemizer from '@textkit/script-itemizer';
import TabEngine from '@textkit/tab-engine';
import TextDecorationEngine from '@textkit/text-decoration-engine';
import TruncationEngine from '@textkit/truncation-engine';
import { LayoutEngine as BaseLayoutEngine } from '@textkit/core';

const defaultEngines = {
  lineBreaker: LineBreaker,
  lineFragmentGenerator: LineFragmentGenerator,
  justificationEngine: JustificationEngine,
  truncationEngine: TruncationEngine,
  decorationEngine: TextDecorationEngine,
  tabEngine: TabEngine,
  fontSubstitutionEngine: FontSubstitutionEngine,
  scriptItemizer: ScriptItemizer
};

export class LayoutEngine extends BaseLayoutEngine {
  constructor(engines = {}) {
    super(Object.assign({}, engines, defaultEngines));
  }
}

export { Path, TabStop, Container, Attachment, AttributedString } from '@textkit/core';
