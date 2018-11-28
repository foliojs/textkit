const resolveYOffset = () => paragraph => {
  for (const glyphRun of paragraph.value.glyphRuns) {
    const { font, yOffset } = glyphRun.attributes;
    if (!yOffset) continue;
    for (let i = 0; i < glyphRun.length; i++) {
      glyphRun.positions[i].yOffset += yOffset * font.unitsPerEm;
    }
  }

  return paragraph;
};

export default resolveYOffset;
