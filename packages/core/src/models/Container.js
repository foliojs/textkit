import Path from '../geom/Path';

export default class Container {
  constructor(path, options = {}) {
    this.path = path;
    this.exclusionPaths = options.exclusionPaths || [];
    this.tabStops = options.tabStops || [];
    this.tabStopInterval = options.tabStopInterval || 80;
    this.columns = options.columns || 1;
    this.columnGap = options.columnGap || 18; // 1/4 inch
    this.blocks = [];
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
