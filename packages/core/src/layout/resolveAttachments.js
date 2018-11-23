const resolveAttachments = () => paragraph => {
  for (const glyphRun of paragraph.value.glyphRuns) {
    const { font, attachment } = glyphRun.attributes;
    if (!attachment) continue;
    const objectReplacement = font.glyphForCodePoint(0xfffc);
    for (let i = 0; i < glyphRun.length; i++) {
      const glyph = glyphRun.glyphs[i];
      const position = glyphRun.positions[i];
      if (glyph === objectReplacement) {
        position.xAdvance = attachment.width;
      }
    }
  }

  return paragraph;
};

export default resolveAttachments;
