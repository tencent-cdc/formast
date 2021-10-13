import 'antd/dist/antd.css';
import './index.less';
import { VisualEditor } from './editor.jsx';
import { mount, unmount, update, render  } from 'nautil/dom';
export { ModelEditor } from './model';
export { DATA_TYPES } from './shared/utils.js';
export { LayoutEditor } from './layout';
export { VisualEditor };
export default VisualEditor;
export { React } from 'nautil';
export { mount, unmount, update, render };

export function mountVisualEditor(el, options) {
  mount(el, VisualEditor, options);
}
