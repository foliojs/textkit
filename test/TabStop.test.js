import TabStop from '../src/models/TabStop';

describe('TabStop', () => {
  test('should handle have left alignment by default', () => {
    const tab = new TabStop();

    expect(tab).toHaveProperty('align', 'left');
  });

  test('should handle passed x', () => {
    const tab = new TabStop(5);

    expect(tab).toHaveProperty('x', 5);
  });

  test('should handle passed align', () => {
    const tab = new TabStop(5, 'center');

    expect(tab).toHaveProperty('align', 'center');
  });
});
