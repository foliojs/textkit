import PDFDocument from 'pdfkit';
import Path from './src/geom/Path';
import fs from 'fs';
import LineFragmentGenerator from './src/LineFragmentGenerator';
import Rect from './src/geom/Rect';
import LayoutEngine from './src/LayoutEngine';
import AttributedString from './src/models/AttributedString';

let path = new Path;
path.circle(150, 150, 120);

let exclusion = new Path;
exclusion.moveTo(0, 20);
exclusion.lineTo(100, 160);
exclusion.quadraticCurveTo(130, 200, 150, 120);
exclusion.bezierCurveTo(190, -40, 200, 200, 300, 150);
exclusion.lineTo(400, 90);
exclusion.closePath();
exclusion = exclusion.translate(50, 50);
// exclusion = exclusion.scale(0.5).translate(100, 100);

// path.moveTo(250, 75);
// path.lineTo(323, 301);
// path.lineTo(131, 161);
// path.lineTo(369, 161);
// path.lineTo(177, 301);
// path.closePath();

// path = path.scale(2, 2);

function isClockwise(path) {
var e, t, n, r = !1,
    i = 0;
  t = n = {
      x: 0,
      y: 0
  };
  for (let {command, args} of path.commands) {
      n = {
          x: args[0],
          y: args[1]
      };
      switch (command) {
          case "moveTo":
              e = t = n;
              break;
          case "lineTo":
              if (t.x !== n.x || t.y !== n.y) i += t.x * n.y - t.y * n.x;
              t = n, r = !0;
              break;
          case "closePath":
              if (t.x !== e.x || t.y !== e.y) i += t.x * e.y - t.y * e.x;
              r = !1;
              break;
      }
  }
  return r && (i += t.x * e.y - t.y * e.x), i >= 0
}

function getBezierPathByReversingPath(path) {
  var e = 0,
      t = path.commands,
      n = new Path();
  var r = t[0];
  while (++e < t.length) {
      var i = t[e],
          s = "moveTo" === i.command;
      if (!s && e + 1 < t.length) continue;
      var o = !1,
          u = e;
      s && --u;
      var a = "closePath" === t[u].command ? r : t[u];
      n.moveTo(a.args[0], a.args[1]);
      while ("moveTo" !== t[u].command) {
          var f = t[u - 1],
              l = t[u];
          switch (l.command) {
              case "lineTo":
                  o && "moveTo" === f.command ? n.closePath() : n.lineTo(f.args[0], f.args[1]);
                  break;
              // case "bezierCurveTo":
              //     n.bezierCurveTo(l.cx2, l.cy2, l.cx1, l.cy1, f.x, f.y), o && "M" === f.command && n.closePath();
              //     break;
              case "closePath":
                  o = !0, n.lineTo(f.args[0], f.args[1]);
                  break;
          }--u
      }
      r = i
  }
  return n
}

let doc = new PDFDocument;
doc.pipe(fs.createWriteStream('out.pdf'));

path = path.scale(1.5)
path.toFunction()(doc);
doc.stroke('green');

exclusion.toFunction()(doc);
doc.stroke('red');

exclusion.scale(0.5).translate(100, 220).toFunction()(doc);
doc.stroke('red');

let flattened = path.flatten();
if (!isClockwise(flattened)) {
  flattened = getBezierPathByReversingPath(flattened);
}
// console.log(isClockwise(flattened), getBezierPathByReversingPath(flattened))
// flattened = getBezierPathByReversingPath(flattened);
// console.log(flattened.commands)

let polygon = flattened.toPolygon();
// for (let contour of polygon.contours) {
//   doc.polygon(...contour.map(p => [p.x, p.y]));
// }
// doc.stroke('red');

let gen = new LineFragmentGenerator;
let rect = new Rect(0, 85, 500, 20);
let fragments = gen.splitLineRect(rect, polygon, 'INTERIOR');
// console.log(fragments)

exclusion = exclusion.flatten();
if (!isClockwise(exclusion)) {
  exclusion = getBezierPathByReversingPath(exclusion);
}

// doc.rect(rect.x, rect.y, rect.width, rect.height).stroke('yellow');
//
//
// for (let frag of fragments) {
//   doc.rect(frag.x, frag.y, frag.width, frag.height).stroke('blue');
// }

let l = new LayoutEngine;
let block = l.layoutParagraph(AttributedString.fromFragments([{string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?', attributes: {font: 'Helvetica', fontSize: 10}}]), flattened, [exclusion, exclusion.scale(0.5).translate(100, 220)]);

for (let line of block.lines) {
  // doc.rect(line.rect.x, line.rect.y, line.rect.width, line.rect.height).stroke('purple');

  doc.save();
  doc.translate(line.rect.x, line.rect.maxY);
  doc.scale(1, -1, {});

  let x = line.rect.x;
  for (let run of line.runs) {
    for (let i = 0; i < run.run.glyphs.length; i++) {
      run.run.glyphs[i].render(doc, run.attributes.fontSize);
      doc.translate(run.run.positions[i].xAdvance * run.scale, 0)
    }
  }

  doc.restore();
}

doc.end();