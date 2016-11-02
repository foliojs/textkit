import FontDescriptor from './FontDescriptor';

export default class RunStyle {
  constructor(attributes = {}) {
    this.color = attributes.color || 'black';
    this.fontDescriptor = FontDescriptor.fromAttributes(attributes);
    this.font = attributes.font || null;
    this.fontSize = attributes.fontSize || 12;
    this.underline = attributes.underline || false;
    this.strike = attributes.strike || false;
    this.link = attributes.link || null;
    this.fill = attributes.fill !== false;
    this.stroke = attributes.stroke || false;
    this.features = attributes.features || [];
    this.wordSpacing = attributes.wordSpacing || 0;
    this.characterSpacing = attributes.characterSpacing || 0;

    this.script = attributes.script || null;
    this.bidiLevel = attributes.bidiLevel || null;
  }
}
