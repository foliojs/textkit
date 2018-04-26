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
    string: 'Lorem ipsum dolor sit amet, ',
    attributes: {
      font: 'Helvetica',
      fontSize: 10,
      bold: true,
      align: 'justify',
      hyphenationFactor: 0.9,
      hangingPunctuation: true,
      lineSpacing: 5,
      // lineHeight: 24,
      truncate: true
    }
  },
  {
    string: 'consectetur adipiscing elit, ',
    attributes: {
      font: 'Courier',
      fontSize: 12,
      color: 'red',
      align: 'justify'
    }
  },
  {
    string:
      'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea volupt\u0301ate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?”',
    attributes: {
      font: 'Helvetica',
      fontSize: 10,
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

const Renderer = PDFRenderer({ Rect });
const rendererInstance = new Renderer(doc, { outlineLines: false });
rendererInstance.render(container);
doc.strokeColor('green');
doc.end();
