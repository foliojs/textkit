import Path from '../geom/Path';

export default class Container {
  constructor(path, options = {}) {
    this.path = path;
    this.blocks = [];
    this.columns = options.columns || 1;
    this.tabStops = options.tabStops || [];
    this.columnGap = options.columnGap || 18; // 1/4 inch
    this.exclusionPaths = options.exclusionPaths || [];
    this.tabStopInterval = options.tabStopInterval || 80;
  }

  get bbox() {
    return this.path.bbox;
  }

  get polygon() {
    return this.path.toPolygon();
  }

  get exclusionPolygon() {
    if (!this.exclusionPaths.length) {
      return null;
    }

    const excluded = new Path();
    for (const p of this.exclusionPaths) {
      excluded.append(p);
    }

    return excluded.toPolygon();
  }
}
