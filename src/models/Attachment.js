export default class Attachment {
  static CODEPOINT = 0xfffc;
  static CHARACTER = '\ufffc';

  constructor(width, height, options = {}) {
    this.width = width;
    this.height = height;
    this.image = options.image || null;
    this.render = options.render || null;
  }
}
