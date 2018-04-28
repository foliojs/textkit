import LayoutEngine from '../../src/layout/LayoutEngine';

class TestEngine {}

describe('LayoutEngine', () => {
  test('should be able to inject custom lineBreaker engine', () => {
    const layout = new LayoutEngine({
      lineBreaker: new TestEngine()
    });

    expect(layout.typesetter.lineBreaker.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom lineFragmentGenerator engine', () => {
    const layout = new LayoutEngine({
      lineFragmentGenerator: new TestEngine()
    });

    expect(layout.typesetter.lineFragmentGenerator.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom justificationEngine engine', () => {
    const layout = new LayoutEngine({
      justificationEngine: new TestEngine()
    });

    expect(layout.typesetter.justificationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom truncationEngine engine', () => {
    const layout = new LayoutEngine({
      truncationEngine: new TestEngine()
    });

    expect(layout.typesetter.truncationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom decorationEngine engine', () => {
    const layout = new LayoutEngine({
      decorationEngine: new TestEngine()
    });

    expect(layout.typesetter.decorationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom tabEngine engine', () => {
    const layout = new LayoutEngine({
      tabEngine: new TestEngine()
    });

    expect(layout.typesetter.tabEngine.constructor.name).toBe(TestEngine.name);
  });
});
