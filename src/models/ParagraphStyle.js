export default class ParagraphStyle {
  constructor(attributes = {}) {
    this.indent = attributes.indent || 0;
    this.bullet = attributes.bullet || null;
    this.paddingTop = attributes.paddingTop || attributes.padding || 0;
    this.paddingBottom = attributes.paddingBottom || attributes.padding || 0;
    this.marginLeft = attributes.marginLeft || attributes.margin || 0;
    this.marginRight = attributes.marginRight || attributes.margin || 0;
    this.align = attributes.align || 'left';
    this.justificationFactor = attributes.justificationFactor || 1;
    this.lineSpacing = attributes.lineSpacing || 0;
    this.hangingPunctuation = attributes.hangingPunctuation || false;
  }
}
