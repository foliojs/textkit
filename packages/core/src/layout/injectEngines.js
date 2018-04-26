import * as Geom from '../geom';
import * as Models from '../models';

const Textkit = Object.assign({}, Geom, Models);

const generateEngine = callback => {
  if (!callback) {
    return null;
  }

  const Engine = callback(Textkit);

  return new Engine();
};

const injectEngines = engines => {
  const engineNames = Object.keys(engines);

  return engineNames.reduce(
    (acc, name) => Object.assign({}, acc, { [name]: generateEngine(engines[name]) }),
    {}
  );
};

export default injectEngines;
