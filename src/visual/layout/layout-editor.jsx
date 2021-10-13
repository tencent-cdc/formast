import { React, Component, createRef } from 'nautil';
import { LayoutEditorStore } from './store.js';
import { ComponentView } from './view-tree.jsx';
import { SettingsSidebar } from './settings-sidebar.jsx';
import { ToolsSidebar } from './tools-sidebar.jsx';
import { DragDropProvider } from './drag-drop/drag-drop.jsx';

export class LayoutEditor extends Component {
  static props = {
    data: Object, // layout json
    config: {
      groups: Array,
    },
    onChange: true,
  }

  area = createRef()

  onInit() {
    const { data, config } = this.props;
    this.store = new LayoutEditorStore({
      layoutJson: data,
    });
    this.store.initConfig(config);
  }

  onChange = (next, prev) => {
    if (next.layoutJson !== prev.layoutJson) {
      this.props.onChange(next.layoutJson);
    }
  }

  handleUnselect = () => {
    this.store.setState({ selectedKeyPath: null });
  }

  onMounted() {
    this.store.subscribe(this.onChange);
  }

  onUnmount() {
    this.store.unsubscribe(this.onChange);
  }

  shouldUpdate() {
    return false;
  }

  render() {
    return (
      <DragDropProvider>
        <div className="formast-layout-editor">
          <ToolsSidebar store={this.store} />
          <div className="formast-layout-editor__main-area" onClick={this.handleUnselect}>
            <ComponentView store={this.store} />
          </div>
          <SettingsSidebar store={this.store} />
        </div>
      </DragDropProvider>
    );
  }
}
