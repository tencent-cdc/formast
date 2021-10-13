import { React, Component, Section, useStore, If, Each, useMemo, produce } from 'nautil';
import { LayoutEditorStore } from './store.js';
import { makeKeyPath, isEqual, isArray, isString, decideby, isNone, isEmpty, each } from 'ts-fns';
import { DropBox, DragBox } from './drag-drop';
import { createUniqueKeys } from '../../react/utils.js';
import { ALIAS_PROPS_MAPPING } from '../../react/index.js';
import { buildDefaultComponentJson } from './utils.js';
import { isExp, findByKey } from '../../core/utils.js';
import { MoveIcon, DeleteIcon } from '../components/icons';
import { Popconfirm } from 'antd';

export class ComponentView extends Component {
  static props = {
    store: LayoutEditorStore,
    keyPath: [String, Number],
  }

  static defaultProps = {
    keyPath: [],
  }

  handleDropOne = ([sourceConfig]) => {
    const { store } = this.props;
    const layoutJson = buildDefaultComponentJson(sourceConfig);
    store.setState({ layoutJson });
  }

  shouldUpdate() {
    return false;
  }

  handleHit = (e) => {
    e.stopPropagation();
    const { store, keyPath } = this.props;
    store.setState({ selectedKeyPath: keyPath });
  }

  handleDelete = () => {
    const { store, keyPath } = this.props;
    store.removeNode(keyPath);
  }

  Render() {
    const { store, keyPath } = this.props;
    const { value: componentJson } = store.useKeyPath(keyPath);
    const { components } = store;
    const { state } = useStore(store, ['selectedKeyPath']);
    const { selectedKeyPath } = state;

    // 顶层为空时，直接返回一个大大空区域
    if (isEmpty(componentJson) && !keyPath.length) {
      return (
        <div className="formast-layout-editor__component-view formast-layout-editor__component-view--empty">
          <DropBox onDrop={this.handleDropOne} />
        </div>
      );
    }

    const path = makeKeyPath(keyPath);

    if (!componentJson) {
      throw new Error(`原始 JSON 中 "${path}" 不是一个对象`);
    }

    const { type, props: filledProps = {} } = componentJson;
    const Comp = components[type];

    if (!Comp) {
      throw new Error(`${path} 中的 type "${type}" 没有提供组件支持`);
    }

    const { formastConfig } = Comp;
    const { children: childrenVars, tag, allows, max, direction, defaults = {}, template } = formastConfig;

    const isSelected = isEqual(selectedKeyPath, keyPath);
    const Container = template || Comp;

    const attrs = { ...defaults };
    each(filledProps, (value, key) => {
      const k = ALIAS_PROPS_MAPPING[key] || key;
      if (typeof value === 'number' || typeof value === 'boolean') {
        attrs[k] = value;
      } else if (typeof value === 'string' && !isExp(value)) {
        attrs[k] = value;
      }
    });
    if (attrs.children) {
      delete attrs.children;
    }

    const willUseChildren = !!(childrenVars || findByKey(componentJson, 'children'));

    return (
      <DragBox
        data={[formastConfig, keyPath]}
        render={drag => (
          <Section
            stylesheet={['formast-layout-editor__component-view', isSelected ? 'formast-layout-editor__component-view--selected' : null]}
            onHit={this.handleHit}
          >
              <If is={willUseChildren} render={() => (
                <Container {...attrs}>
                  <ChildrenView
                    keyPath={[...keyPath, 'children']}
                    vars={childrenVars}
                    tag={tag}
                    allows={allows}
                    max={max}
                    direction={direction}
                    store={store}
                  />
                </Container>
              )} />
            <If is={!willUseChildren} render={() => (
              <Container {...attrs} />
            )} />
            <If is={!!isSelected} render={() => (
              <Section stylesheet={['formast-layout-editor__component-view__actions']}>
                <span ref={drag} className="formast-layout-editor__component-view__actions__move"><MoveIcon /></span>
                <Popconfirm
                  title="确定删除吗？"
                  onConfirm={this.handleDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <span><DeleteIcon /></span>
                </Popconfirm>
              </Section>
            )} />
          </Section>
        )}
      />
    );
  }
}

class ChildrenView extends Component {
  onInit() {
    this.uniqueKeys = createUniqueKeys([]);
  }

  shouldUpdate() {
    return false;
  }

  canDrop = (sourceConfig) => {
    const { tag: targetTag, allows } = this.props;
    const { tag: sourceTag, needs } = sourceConfig;

    let res = !allows;

    if (needs && needs.includes('*')) {
      res = true;
    }
    if (allows && allows.includes(`!${sourceTag}`)) {
      res = false;
    }

    // 最大优先级结束
    if (res) {
      return true;
    }

    // 由当前组件决定是否可以放在父级容器中
    if (needs && needs.includes(targetTag)) {
      return true;
    }

    // 由父级决定当前组件是否可以被放在父级容器中
    if (allows && allows.includes(sourceTag)) {
      return true;
    }

    return res;
  }

  createDropHandler = index => ([sourceConfig, movedKeyPath]) => {
    const { keyPath, store, vars } = this.props;

    const { name, value, parent } = store.parse(keyPath);
    const current = isArray(value) ? value : [value].filter(item => !isNone(item));

    // 如果是移动某一个组件，那么需要特殊处理
    if (movedKeyPath) {
      const { value: movedJson } = store.parse(movedKeyPath);
      const currentIndex = current.findIndex(item => item === movedJson);

      const next = produce(current, (current) => {
        current.splice(index, 0, movedJson);

        if (currentIndex > -1 && index > currentIndex) { // 从前面移动到后面
          current.splice(currentIndex, 1);
        } else if (currentIndex > -1 && index < currentIndex) { // 从后面往前移动
          current.splice(currentIndex + 1, 1);
        }
      });

      if (currentIndex === -1) {
        store.removeNode(movedKeyPath);
      }

      store.updateComponentJson(parent, name, isArray(vars) ? vars : null, next);
    } else {
      const newJson = buildDefaultComponentJson(sourceConfig);
      const next = produce(current, (current) => {
        current.splice(index, 0, newJson);
      });
      store.updateComponentJson(parent, name, isArray(vars) ? vars : null, next);
    }

    store.setState({ selectedKeyPath: null });
  }

  Render() {
    const { keyPath, vars: childrenVars, max, direction, store } = this.props;
    const { key, parent, value: data } = store.useKeyPath(keyPath);

    const isExist = !!data;
    const isMult = !!isArray(data);
    const items = decideby(() => {
      if (isMult) {
        return data;
      }
      if (isExist) {
        return [data];
      }
      return [];
    });

    const uniqueKeys = useMemo(() => this.uniqueKeys.setItems(items), [data]);
    const needDropBox = !!childrenVars && (!max || items.length < max);

    if (!childrenVars && !data) {
      return null;
    }

    return (
      <Section stylesheet={['formast-layout-editor__children-view', direction ? `formast-layout-editor__children-view--${direction}` : null]}>
        <If is={isExist} render={() => {
          if (!isMult) {
            return (
              <>
                <If is={needDropBox} render={() => <DropBox key="0" canDrop={this.canDrop} onDrop={this.createDropHandler(0)} />} />
                {isString(data) ? data : <ComponentView store={store} keyPath={[...parent, key]} />}
                <If is={needDropBox} render={() => <DropBox key="1" canDrop={this.canDrop} onDrop={this.createDropHandler(1)} />} />
              </>
            );
          }
          return (
            <>
              <Each of={items} render={(item, index) => {
                const subKeyPath = [...parent, key, index];
                const uniqueKey = uniqueKeys[index];
                return (
                  <>
                    <If is={needDropBox} render={() => <DropBox key="-1" canDrop={this.canDrop} onDrop={this.createDropHandler(index)} />} />
                    {isString(item) ? item : <ComponentView key={uniqueKey} store={store} keyPath={subKeyPath} />}
                  </>
                );
              }} />
              <If is={needDropBox} render={() => <DropBox key="1" canDrop={this.canDrop} onDrop={this.createDropHandler(items.length)} />} />
            </>
          );
        }} />
        <If is={!isExist && needDropBox} render={() => <DropBox key="0" canDrop={this.canDrop} onDrop={this.createDropHandler(0)} />} />
      </Section>
    );
  }
}
