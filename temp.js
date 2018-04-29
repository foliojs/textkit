import fs from 'fs';
import PDFDocument from 'pdfkit';
import PDFRenderer from '@textkit/pdf-renderer';
import { Path, Rect, LayoutEngine, AttributedString, Container } from '@textkit/textkit';

const path = new Path();

path.rect(30, 30, 300, 400);

const exclusion = new Path();
exclusion.circle(140, 160, 50);

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('out.pdf'));

path.toFunction()(doc);
exclusion.toFunction()(doc);

doc.stroke('green');
doc.stroke();

const string = AttributedString.fromFragments([
  {
    string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ',
    attributes: {
      font: 'Helvetica',
      fontSize: 10,
      bold: true,
      align: 'justify',
      hyphenationFactor: 0.9,
      hangingPunctuation: true,
      lineSpacing: 5,
      truncate: true
    }
  }
]);

const l = new LayoutEngine();
const container = new Container(path, {
  exclusionPaths: [exclusion]
});

l.layout(string, [container]);

// const Renderer = PDFRenderer({ Rect });
// const rendererInstance = new Renderer(doc, { outlineLines: false });
// rendererInstance.render(container);
// doc.strokeColor('green');
// doc.end();
