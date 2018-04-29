import LayoutEngine from '../../src/layout/LayoutEngine';

class TestEngine {}
const createEngine = () => TestEngine;

describe('LayoutEngine', () => {
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
