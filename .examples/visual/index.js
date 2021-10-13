import { mountVisualEditor } from '../../src/visual/index.js';
import formJson from './form.json';
import * as Config from '../../src/react-default/editor.js';

mountVisualEditor('#root', {
  data: formJson,
  config: Config,
  onChange: (next) => {
    console.debug(next);
  },
});
