import * as Geom from '../geom';
import * as Models from '../models';

const Textkit = Object.assign({}, Geom, Models);

const generateEngine = (name, callback) => {
  if (!callback) {
    console.warn(`Warning: You must provide a ${name} engine`);
    return null;
  }

  const Engine = callback(Textkit);

  return new Engine();
};

const injectEngines = engines => {
  const engineNames = Object.keys(engines);

  return engineNames.reduce(
    (acc, name) => Object.assign({}, acc, { [name]: generateEngine(name, engines[name]) }),
    {}
  );
};

export default injectEngines;
