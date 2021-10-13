import { React, Component, Section, Text, Each } from 'nautil';
import { DragBox } from './drag-drop';
import { LayoutEditorStore } from './store.js';
import { isString, decideby } from 'ts-fns';
import { isReactComponent } from '../../react/utils.js';

export class ToolsSidebar extends Component {
  static props = {
    store: LayoutEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  render() {
    const { store } = this.props;
    const { groups, components } = store;
    return (
      <Section stylesheet={['formast-layout-editor__tools-sidebar']}>
        <Each of={groups} render={group => (
          <Section key={group.title} stylesheet={['formast-layout-editor__tools-sidebar__group']}>
            <Section stylesheet={['formast-layout-editor__tools-sidebar__group-title']}>
              <h4>{group.title}</h4>
            </Section>
            <Section stylesheet={['formast-layout-editor__tools-sidebar__items']}>
              <Each of={group.items} render={(item) => {
                // 可以直接传入组件本身（有 formastConfig 静态属性），也可以传入组件 type 值
                const component = isReactComponent(item) ? item : components[item];
                if (!component) {
                  return null;
                }

                const { formastConfig } = component; // 必须从组件上读取信息
                const { icon, title } = formastConfig;
                const Icon = decideby(() => {
                  if (isReactComponent(icon)) {
                    return icon;
                  }
                  if (isString(icon)) {
                    return () => <i className={icon}></i>;
                  }
                });
                return (
                  <DragBox key={title} data={[formastConfig]}>
                    <Section stylesheet={['formast-layout-editor__tools-sidebar__item']}>
                      {Icon ? <Icon /> : null}
                      <Text stylesheet={['formast-layout-editor__tools-sidebar__item-text']}>{title}</Text>
                    </Section>
                  </DragBox>
                );
              }} />
            </Section>
          </Section>
        )} />
      </Section>
    );
  }
}
