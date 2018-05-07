import fs from 'fs';
import PDFDocument from 'pdfkit';
import PDFRenderer from '@textkit/pdf-renderer';
import {
  Path,
  Rect,
  LayoutEngine,
  AttributedString,
  Container,
  Attachment
} from '@textkit/textkit';

const path = new Path();

path.rect(30, 30, 300, 400);

// const exclusion = new Path();
// exclusion.circle(140, 160, 50);

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('out.pdf'));

path.toFunction()(doc);
// exclusion.toFunction()(doc);

doc.stroke('green');
doc.stroke();

const string = AttributedString.fromFragments([
  {
    string: '“Lorem ipsum dolor sit \ufffc amet, ',
    attributes: {
      font: 'Arial',
      fontSize: 14,
      bold: true,
      align: 'justify',
      attachment: new Attachment(14, 14, {
        yOffset: 3,
        image: './grinning.png'
      })
    }
  }
]);

const l = new LayoutEngine();
const container = new Container(path);

l.layout(string, [container]);

const Renderer = PDFRenderer({ Rect });
const rendererInstance = new Renderer(doc, { outlineLines: false });
rendererInstance.render(container);
doc.end();
