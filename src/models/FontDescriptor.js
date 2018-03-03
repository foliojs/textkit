const FONT_WEIGHTS = {
  thin: 100,
  ultralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  ultrabold: 800,
  heavy: 900
};

const FONT_WIDTHS = {
  ultracondensed: 1,
  extracondensed: 2,
  condensed: 3,
  semicondensed: 4,
  normal: 5,
  semiexpanded: 6,
  expanded: 7,
  extraexpanded: 8,
  ultraexpanded: 9
};

function parseFont(font) {
  if (typeof font !== 'string') {
    return {};
  }

  const parts = font.match(/(.+\.(?:ttf|otf|ttc|dfont|woff|woff2))(?:#(.+))$/);
  if (parts) {
    return {
      path: parts[1],
      postscriptName: parts[2]
    };
  }

  return { family: font };
}

function getFontWeight(weight) {
  if (typeof weight === 'number') {
    return Math.max(100, Math.min(900, Math.floor(weight / 100) * 100));
  }

  if (typeof weight === 'string') {
    return FONT_WEIGHTS[weight.toLowerCase().replace(/-/g, '')];
  }

  return null;
}

function getFontWidth(width) {
  if (typeof width === 'number') {
    return Math.max(1, Math.min(9, width));
  }

  if (typeof width === 'string') {
    return FONT_WIDTHS[width.toLowerCase().replace(/-/g, '')];
  }

  return null;
}

export default class FontDescriptor {
  constructor(attributes = {}) {
    this.path = attributes.path;
    this.postscriptName = attributes.postscriptName;
    this.family = attributes.family;
    this.style = attributes.style;
    this.weight = attributes.weight;
    this.width = attributes.width;
    this.italic = attributes.italic;
    this.monospace = attributes.monospace;
  }

  static fromAttributes(attributes = {}) {
    if (attributes.fontDescriptor) {
      return new FontDescriptor(attributes.fontDescriptor);
    }

    const font = parseFont(attributes.font || 'Helvetica');
    return new FontDescriptor({
      path: font.path,
      postscriptName: attributes.fontPostscriptName || font.postscriptName,
      family: attributes.fontFamily || font.family,
      style: attributes.fontStyle,
      weight: getFontWeight(attributes.fontWeight) || (attributes.bold ? FONT_WEIGHTS.bold : null),
      width: getFontWidth(attributes.fontWidth),
      italic: attributes.italic,
      monospace: attributes.monospace
    });
  }
}
