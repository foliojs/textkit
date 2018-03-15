class Polygon {
  constructor() {
    this.contours = [];
  }

  addContour(contour) {
    this.contours.push(contour);
  }
}

export default Polygon;
