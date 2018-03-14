import Attachment from '../../src/models/Attachment';

describe('Attachment', () => {
  test('should handle passed width', () => {
    const attachment = new Attachment(5);

    expect(attachment).toHaveProperty('width', 5);
  });

  test('should handle passed height', () => {
    const attachment = new Attachment(5, 10);

    expect(attachment).toHaveProperty('height', 10);
  });

  test('should handle passed image', () => {
    const opts = { image: 'blah' };
    const attachment = new Attachment(5, 10, opts);

    expect(attachment).toHaveProperty('image', opts.image);
  });

  test('should handle passed render', () => {
    const opts = { render: 'blah' };
    const attachment = new Attachment(5, 10, opts);

    expect(attachment).toHaveProperty('render', opts.render);
  });
});
