import LayoutEngine from '../../src/layout/LayoutEngine';
import AttributedString from '../../src/models/AttributedString';
import { createRectContainer } from '../utils/container';
import lorem from '../utils/lorem';

class TestEngine {}
const createEngine = () => TestEngine;

const { layoutColumn, layoutParagraph } = LayoutEngine.prototype;
const layoutColumnMock = jest.fn().mockImplementation(() => 300);
const layoutParagraphMock = jest.fn().mockImplementation(string => ({
  bbox: {
    height: 20
  },
  style: {
    paragraphSpacing: 0
  },
  stringLength: string.length
}));

describe('LayoutEngine', () => {
  beforeEach(() => {
    layoutColumnMock.mockClear();
    layoutParagraphMock.mockClear();

    LayoutEngine.prototype.layoutColumn = layoutColumn;
    LayoutEngine.prototype.layoutParagraph = layoutParagraph;
  });

  test('should layout 1 column correctly', () => {
    // Mock layoutColumn class function
    LayoutEngine.prototype.layoutColumn = layoutColumnMock;

    // Create instances
    const layout = new LayoutEngine({});
    const string = AttributedString.fromFragments([{ string: lorem }]);
    const container = createRectContainer(0, 0, 300, 200, { columns: 1, columnGap: 20 });

    // Call layout
    layout.layout(string, [container]);

    expect(layoutColumnMock.mock.calls).toHaveLength(1);
    expect(layoutColumnMock.mock.calls[0][3].width).toBe(300);
  });

  test('should layout 2 column correctly', () => {
    // Mock layoutColumn class function
    LayoutEngine.prototype.layoutColumn = layoutColumnMock;

    // Create instances
    const layout = new LayoutEngine({});
    const string = AttributedString.fromFragments([{ string: lorem }]);
    const container = createRectContainer(0, 0, 300, 200, { columns: 2, columnGap: 20 });

    // Call layout
    layout.layout(string, [container]);

    expect(layoutColumnMock.mock.calls).toHaveLength(2);
    expect(layoutColumnMock.mock.calls[0][3].width).toBe(140);
    expect(layoutColumnMock.mock.calls[1][3].width).toBe(140);
  });

  test('should layout single paragraph string', () => {
    // Mock layoutColumn class function
    LayoutEngine.prototype.layoutParagraph = layoutParagraphMock;

    // Create instances
    const layout = new LayoutEngine({});
    const string = AttributedString.fromFragments([{ string: lorem }]);
    const container = createRectContainer(0, 0, 300, 200, { columns: 1, columnGap: 20 });

    // Call layout
    layout.layout(string, [container]);

    expect(layoutParagraphMock.mock.calls).toHaveLength(1);
    expect(layoutParagraphMock.mock.calls[0][0].string).toBe(lorem);
  });

  test('should layout two paragraph strings', () => {
    // Mock layoutColumn class function
    LayoutEngine.prototype.layoutParagraph = layoutParagraphMock;

    // Create instances
    const layout = new LayoutEngine({});
    const string = AttributedString.fromFragments([{ string: 'Lorem\nipsum' }]);
    const container = createRectContainer(0, 0, 300, 200, { columns: 1, columnGap: 20 });

    // Call layout
    layout.layout(string, [container]);

    expect(layoutParagraphMock.mock.calls).toHaveLength(2);
    expect(layoutParagraphMock.mock.calls[0][0].string).toBe('Lorem');
    expect(layoutParagraphMock.mock.calls[1][0].string).toBe('ipsum');
  });

  test.only('should layout two consecutive break lines', () => {
    // Mock layoutColumn class function
    LayoutEngine.prototype.layoutParagraph = layoutParagraphMock;

    // Create instances
    const layout = new LayoutEngine({});
    const string = AttributedString.fromFragments([{ string: 'Lorem\n\nipsum' }]);
    const container = createRectContainer(0, 0, 300, 200, { columns: 1, columnGap: 20 });

    // Call layout
    layout.layout(string, [container]);

    expect(layoutParagraphMock.mock.calls).toHaveLength(3);
    expect(layoutParagraphMock.mock.calls[0][0].string).toBe('Lorem');
    expect(layoutParagraphMock.mock.calls[0][0].runs).toHaveLength(1);
    expect(layoutParagraphMock.mock.calls[1][0].string).toBe('');
    expect(layoutParagraphMock.mock.calls[1][0].runs).toHaveLength(1);
    expect(layoutParagraphMock.mock.calls[2][0].string).toBe('ipsum');
    expect(layoutParagraphMock.mock.calls[2][0].runs).toHaveLength(1);
  });

  test.only('should layout two consecutive break lines in different runs', () => {
    // Mock layoutColumn class function
    LayoutEngine.prototype.layoutParagraph = layoutParagraphMock;

    // Create instances
    const layout = new LayoutEngine({});
    const string = AttributedString.fromFragments([
      { string: 'Republik:' },
      { string: ' «Wer war Daphne Caruana Galizia?»' },
      { string: '\n' },
      { string: '\n' },
      { string: 'Bedingfield:' },
      {
        string:
          ' «Daphne Caruana Galizia wird als die ultimative Journalistin gegen Korruption dargestellt, aber sie hat Korruption nicht immer bekämpft. Sie hat Korruption nur dann bekämpft, wenn die Labour-Regierung an der Macht war.»'
      },
      { string: '\n' },
      { string: '\n' },
      { string: 'Republik:' },
      { string: ' «Wer könnte hinter dem Mord stecken?»' },
      { string: '\n' },
      { string: '\n' },
      { string: 'Bedingfield:' },
      {
        string:
          ' «Sie hat über viele Leute geschrieben. Und hat über eine Menge Leute gelogen. Wir Politiker bekommen einen Schlag und noch einen Schlag: Wenn man uns beschuldigt, wehren wir uns. Aber sie schrieb auch über Menschen, die keine Politiker sind. Die nicht mit einer öffentlichen Stellungnahme antworten.»'
      }
    ]);

    const container = createRectContainer(0, 0, 300, 200, { columns: 1, columnGap: 20 });

    // Call layout
    layout.layout(string, [container]);

    // expect(layoutParagraphMock.mock.calls).toHaveLength(7);
    // expect(layoutParagraphMock.mock.calls[0][0].string).toBe('Republik: «Wer war Daphne Caruana Galizia?»');
    // expect(layoutParagraphMock.mock.calls[0][0].runs).toHaveLength(2);
    // expect(layoutParagraphMock.mock.calls[1][0].string).toBe('');
    // expect(layoutParagraphMock.mock.calls[1][0].runs).toHaveLength(1);
    // expect(layoutParagraphMock.mock.calls[2][0].string).toBe('Bedingfield: «Daphne Caruana Galizia wird als die ultimative Journalistin gegen Korruption dargestellt, aber sie hat Korruption nicht immer bekämpft. Sie hat Korruption nur dann bekämpft, wenn die Labour-Regierung an der Macht war.»');
    // expect(layoutParagraphMock.mock.calls[2][0].runs).toHaveLength(2);
    // expect(layoutParagraphMock.mock.calls[3][0].string).toBe('');
    // expect(layoutParagraphMock.mock.calls[3][0].runs).toHaveLength(1);
    // expect(layoutParagraphMock.mock.calls[4][0].string).toBe('Republik: «Wer könnte hinter dem Mord stecken?»');
    // expect(layoutParagraphMock.mock.calls[4][0].runs).toHaveLength(2);
    // expect(layoutParagraphMock.mock.calls[5][0].string).toBe('');
    // expect(layoutParagraphMock.mock.calls[5][0].runs).toHaveLength(1);
    // expect(layoutParagraphMock.mock.calls[6][0].string).toBe('Bedingfield: «Sie hat über viele Leute geschrieben. Und hat über eine Menge Leute gelogen. Wir Politiker bekommen einen Schlag und noch einen Schlag: Wenn man uns beschuldigt, wehren wir uns. Aber sie schrieb auch über Menschen, die keine Politiker sind. Die nicht mit einer öffentlichen Stellungnahme antworten.»');
    // expect(layoutParagraphMock.mock.calls[6][0].runs).toHaveLength(2);
  });

  test('should be able to inject custom lineBreaker engine', () => {
    const layout = new LayoutEngine({
      lineBreaker: createEngine
    });

    expect(layout.typesetter.lineBreaker.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom lineFragmentGenerator engine', () => {
    const layout = new LayoutEngine({
      lineFragmentGenerator: createEngine
    });

    expect(layout.typesetter.lineFragmentGenerator.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom justificationEngine engine', () => {
    const layout = new LayoutEngine({
      justificationEngine: createEngine
    });

    expect(layout.typesetter.justificationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom truncationEngine engine', () => {
    const layout = new LayoutEngine({
      truncationEngine: createEngine
    });

    expect(layout.typesetter.truncationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom decorationEngine engine', () => {
    const layout = new LayoutEngine({
      decorationEngine: createEngine
    });

    expect(layout.typesetter.decorationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom tabEngine engine', () => {
    const layout = new LayoutEngine({
      tabEngine: createEngine
    });

    expect(layout.typesetter.tabEngine.constructor.name).toBe(TestEngine.name);
  });
});
