import FontDescriptor from './FontDescriptor';

export default class RunStyle {
  constructor(attributes = {}) {
    this.color = attributes.color || 'black';
    this.backgroundColor = attributes.backgroundColor || null;
    this.fontDescriptor = FontDescriptor.fromAttributes(attributes);
    this.font = attributes.font || null;
    this.fontSize = attributes.fontSize || 12;
    this.lineHeight = attributes.lineHeight || null;
    this.underline = attributes.underline || false;
    this.underlineColor = attributes.underlineColor || this.color;
    this.underlineStyle = attributes.underlineStyle || 'solid';
    this.strike = attributes.strike || false;
    this.strikeColor = attributes.strikeColor || this.color;
    this.strikeStyle = attributes.strikeStyle || 'solid';
    this.link = attributes.link || null;
    this.fill = attributes.fill !== false;
    this.stroke = attributes.stroke || false;
    this.features = attributes.features || [];
    this.wordSpacing = attributes.wordSpacing || 0;
    this.yOffset = attributes.yOffset || 0;
    this.characterSpacing = attributes.characterSpacing || 0;
    this.attachment = attributes.attachment || null;
    this.script = attributes.script || null;
    this.bidiLevel = attributes.bidiLevel || null;
  }
}
