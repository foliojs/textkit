import Run from './models/Run';

export default function flattenRuns(runs) {
  let res = [];

  let points = [];
  for (let i = 0; i < runs.length; i++) {
    let run = runs[i];
    points.push(['start', run.start, run.attributes, i]);
    points.push(['end', run.end, run.attributes, i]);
  }

  points.sort((a, b) => (a[1] - b[1]) || (a[3] - b[3]));

  let start = -1;
  let stack = [];
  let attrs = {};

  for (let [type, offset, attributes] of points) {
    if (start !== -1 && start < offset) {
      res.push(new Run(start, offset, attrs));
    }

    if (type === 'start') {
      stack.push(attributes);
      attrs = Object.assign({}, attrs, attributes);
    } else {
      attrs = {};
      for (let i = 0; i < stack.length; i++) {
        if (stack[i] === attributes) {
          stack.splice(i--, 1);
        } else {
          Object.assign(attrs, stack[i])
        }
      }
    }

    start = offset;
  }

  return res;
}

// flattenRuns([
//   new Run(0, 10, {strike: true}),
//   new Run(0, 10, {color: 'red'})
// ]);

// flattenRuns([
//   new Run(12, 13, {red: true}),
//   new Run(0, 5, {blue: true}),
//   new Run(2, 12, {green: true}),
//   new Run(3, 6, {yellow: true}),
//   new Run(6, 10, {orange: true})
// ]);

// flattenRuns([
//   new Run(12, 13, {color: 'red'}),
//   new Run(0, 5,   {color: 'blue'}),
//   new Run(2, 12,  {color: 'green'}),
//   new Run(3, 6,   {color: 'yellow'}),
//   new Run(6, 10,  {color: 'orange'})
// ]);