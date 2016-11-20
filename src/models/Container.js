import Path from '../geom/Path';

export default class Container {
  constructor(path, exclusionPaths = []) {
    this.path = path;
    this.exclusionPaths = exclusionPaths;
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

    let excluded = new Path;
    for (let p of this.exclusionPaths) {
      excluded.append(p);
    }

    return excluded.toPolygon();
  }
}
