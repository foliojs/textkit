import Typesetter from '../../src/layout/Typesetter';

class TestEngine {}

describe('Typesetter', () => {
  test('should be able to inject custom lineBreaker engine', () => {
    const typesetter = new Typesetter({
      lineBreaker: new TestEngine()
    });

    expect(typesetter.lineBreaker.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom lineFragmentGenerator engine', () => {
    const typesetter = new Typesetter({
      lineFragmentGenerator: new TestEngine()
    });

    expect(typesetter.lineFragmentGenerator.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom justificationEngine engine', () => {
    const typesetter = new Typesetter({
      justificationEngine: new TestEngine()
    });

    expect(typesetter.justificationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom truncationEngine engine', () => {
    const typesetter = new Typesetter({
      truncationEngine: new TestEngine()
    });

    expect(typesetter.truncationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom decorationEngine engine', () => {
    const typesetter = new Typesetter({
      decorationEngine: new TestEngine()
    });

    expect(typesetter.decorationEngine.constructor.name).toBe(TestEngine.name);
  });

  test('should be able to inject custom tabEngine engine', () => {
    const typesetter = new Typesetter({
      tabEngine: new TestEngine()
    });

    expect(typesetter.tabEngine.constructor.name).toBe(TestEngine.name);
  });
});
