import fs from 'fs';
import PDFDocument from 'pdfkit';
import Path from './src/geom/Path';
import LayoutEngine from './src/layout/LayoutEngine';
import AttributedString from './src/models/AttributedString';
import Container from './src/models/Container';
import TextRenderer from './src/renderers/TextRenderer';

const path = new Path();

path.rect(0, 0, 300, 400);

const exclusion = new Path();
exclusion.circle(200, 200, 50);

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
      font: 'Arial',
      fontSize: 14,
      bold: true,
      // align: 'justify',
      // hyphenationFactor: 0.9,
      // hangingPunctuation: true,
      lineSpacing: 5,
      underline: true,
      underlineStyle: 'wavy',
      underlineColor: 'red',
      truncate: true
    }
  },
  {
    string: 'consectetur adipiscing elit, ',
    attributes: { font: 'Arial', fontSize: 14, color: 'red' }
  },
  {
    string: 'sed do eiusmod tempor incididunt ut labore',
    attributes: {
      font: 'Arial',
      fontSize: 14,
      // align: 'justify',
      // hyphenationFactor: 0.9,
      // hangingPunctuation: true,
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

const renderer = new TextRenderer(doc, { outlineLines: false });
renderer.render(container);
doc.strokeColor('green');
doc.end();
