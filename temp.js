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

let doc = new PDFDocument;
doc.pipe(fs.createWriteStream('out.pdf'));

path = path.scale(1.5)
path.toFunction()(doc);
doc.stroke('green');

exclusion.toFunction()(doc);
doc.stroke('red');

exclusion.scale(0.5).translate(100, 220).toFunction()(doc);
doc.stroke('red');

let string = AttributedString.fromFragments([
  {
    string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ',
    attributes: {font: 'Helvetica', bold: true, fontSize: 14}
  },
  {
    string: 'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
    attributes: {font: 'Helvetica', fontSize: 10}
  }
]);

console.log(string)

let l = new LayoutEngine;
let block = l.layoutParagraph(string, path, [exclusion, exclusion.scale(0.5).translate(100, 220)]);

console.log(block)

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