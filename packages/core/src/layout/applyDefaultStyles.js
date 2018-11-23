import AttributedString from '../models/AttributedString';

const applyDefaultStyles = () => attributedString => {
  const runs = attributedString.runs.map(({ start, end, attributes }) => ({
    start,
    end,
    attributes: {
      align: attributes.align || 'left',
      alignLastLine:
        attributes.alignLastLine || (attributes.align === 'justify' ? 'left' : attributes.align),
      attachment: attributes.attachment || null,
      backgroundColor: attributes.backgroundColor || null,
      bidiLevel: attributes.bidiLevel || null,
      bullet: attributes.bullet || null,
      characterSpacing: attributes.characterSpacing || 0,
      color: attributes.color || 'black',
      features: attributes.features || [],
      fill: attributes.fill !== false,
      font: attributes.font || null,
      fontSize: attributes.fontSize || 12,
      hangingPunctuation: attributes.hangingPunctuation || false,
      hyphenationFactor: attributes.hyphenationFactor || 0,
      indent: attributes.indent || 0,
      justificationFactor: attributes.justificationFactor || 1,
      lineHeight: attributes.lineHeight || null,
      lineSpacing: attributes.lineSpacing || 0,
      link: attributes.link || null,
      marginLeft: attributes.marginLeft || attributes.margin || 0,
      marginRight: attributes.marginRight || attributes.margin || 0,
      maxLines: attributes.maxLines || Infinity,
      paddingTop: attributes.paddingTop || attributes.padding || 0,
      paragraphSpacing: attributes.paragraphSpacing || 0,
      truncationMode: attributes.truncationMode || (attributes.truncate ? 'right' : null),
      underline: attributes.underline || false,
      underlineColor: attributes.underlineColor || attributes.color || 'black',
      underlineStyle: attributes.underlineStyle || 'solid',
      script: attributes.script || null,
      shrinkFactor: attributes.shrinkFactor || 0,
      strike: attributes.strike || false,
      strikeColor: attributes.strikeColor || attributes.color || 'black',
      strikeStyle: attributes.strikeStyle || 'solid',
      stroke: attributes.stroke || false,
      wordSpacing: attributes.wordSpacing || 0,
      yOffset: attributes.yOffset || 0
    }
  }));

  return new AttributedString(attributedString.string, runs);
};

export default applyDefaultStyles;
