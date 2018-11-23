import fs from 'fs';
import PDFDocument from '@react-pdf/pdfkit';
import PDFRenderer from './packages/pdf-renderer';
import fontkit from '@react-pdf/fontkit';
import { Path, Rect, LayoutEngine, AttributedString, Container } from './packages/textkit';

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

const font = fontkit.openSync('./Roboto-Regular.ttf');

const string = AttributedString.fromFragments([
  {
    string: 'Lorem ipsum dolor sit amet, ',
    attributes: {
      font,
      fontSize: 14,
      bold: true,
      align: 'justify',
      hyphenationFactor: 0.9,
      hangingPunctuation: true,
      lineSpacing: 5,
      truncate: true
    }
  },
  {
    string: 'consectetur adipiscing elit, ',
    attributes: {
      font,
      fontSize: 18,
      color: 'red',
      align: 'justify'
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
