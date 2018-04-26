import Path from '../geom/Path';
import Run from '../models/Run';
import TabStop from '../models/TabStop';
import Container from '../models/Container';
import Attachment from '../models/Attachment';
import AttributedString from '../models/AttributedString';

const generateEngine = callback => {
  if (!callback) {
    return null;
  }

  const Engine = callback({
    Run,
    Path,
    TabStop,
    Container,
    Attachment,
    AttributedString
  });

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
