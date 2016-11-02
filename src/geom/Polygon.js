export default class Polygon {
  constructor() {
    this.contours = [];
  }

  addContour(contour) {
    this.contours.push(contour);
  }
}
