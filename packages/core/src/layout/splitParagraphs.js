const splitParagraphs = () => attributedString => {
  const res = [];

  let start = 0;
  let breakPoint = attributedString.string.indexOf('\n') + 1;

  while (breakPoint > 0) {
    res.push(attributedString.slice(start, breakPoint));
    start = breakPoint;
    breakPoint = attributedString.string.indexOf('\n', breakPoint) + 1;
  }

  if (start < attributedString.length) {
    res.push(attributedString.slice(start, attributedString.length));
  }

  return res;
};

export default splitParagraphs;
