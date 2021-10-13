import {
  Store,
  useStore,
} from 'nautil';
import {
  parse,
  isString,
  isNumber,
  isNumeric,
  assign,
} from 'ts-fns';
import { parseKey } from '../../core/utils.js';
import { isReactComponent } from '../../react/utils.js';

export class LayoutEditorStore extends Store {
  groups = []
  components = {}
  fields = [] // 记录字段列表

  constructor(initState = {}) {
    super({
      selectedKeyPath: null,
      layoutJson: {},
      ...initState,
    });
  }

  initData(data) {
    this.setState({ layoutJson: data });
  }

  initConfig(config) {
    const { groups } = config;

    const allComponents = {};
    groups.forEach(({ items }, i) => {
      items.forEach((item, j) => {
        if (!isReactComponent(item)) {
          throw new Error(`配置中 groups[${i}].items[${j}] 不是组件，无法被加载使用`);
        }
        const { formastConfig } = item;
        if (!formastConfig) {
          throw new Error(`配置中 groups[${i}].items[${j}] 组件没有给 formastConfig，无法被加载使用`);
        }
        const { type } = formastConfig;
        if (!type) {
          throw new Error(`配置中 groups[${i}].items[${j}] 组件 formastConfig 中没有传入 type 值，无法被加载使用`);
        }
        allComponents[type] = item;
      });
    });
    this.components = allComponents;

    this.groups = groups;
  }

  updateNode(keyPath, value) {
    this.dispatch((state) => {
      if (!keyPath.length) {
        state.layoutJson = value;
      } else {
        assign(state.layoutJson, keyPath, value);
      }
    });
  }

  updateComponentJson(parentKeyPath, name, params, value) {
    this.dispatch((state) => {
      const parent = parentKeyPath.length ? this.find(state.layoutJson, parentKeyPath).value : state.layoutJson;

      const foundKey = Object.keys(parent).find(item => item === name || item.indexOf(`${name}(`) === 0);
      if (foundKey) {
        delete parent[foundKey];
      }

      const newKey = params ? `${name}(${params})` : name;
      parent[newKey] = value;
    });
  }

  parse(keyPath) {
    const { layoutJson } = this.state;
    if (!keyPath.length) {
      return { key: '', value: layoutJson };
    }
    return layoutJson ? this.find(layoutJson, keyPath) : {};
  }

  find(layoutJson, keyPath) {
    const key = keyPath[keyPath.length - 1];
    const parent = keyPath.slice(0, keyPath.length - 1);
    const parentNode = parse(layoutJson, parent);

    // 数字索引
    if (!isString(key)) {
      const value = parentNode ? parentNode[key] : undefined;
      return { key, name: key, parent, value };
    }

    const [n, p] = parseKey(key);
    if (!parentNode) {
      return { key, name: n, params: p, parent };
    }

    const siblings = Object.keys(parentNode);
    const found = siblings.find(item => item === n || item.indexOf(`${n}(`) === 0);

    if (!found) {
      const [name, params] = parseKey(key);
      return { key, name, params, parent };
    }

    const [name, params] = parseKey(found);

    if (params) {
      const value = parentNode[found];
      return { key: found, name, params, value, parent };
    }

    const value = parentNode[found];
    return { key: found, name, value, parent };
  }

  useKeyPath(keyPath) {
    useStore(this, (next, prev) => {
      if (!keyPath.length) {
        return next !== prev;
      }

      const { key: nextKey, value: nextValue } = this.find(next.layoutJson, keyPath);
      const { key: prevKey, value: prevValue } = this.find(prev ? prev.layoutJson : {}, keyPath);

      if (prevKey !== nextKey) {
        return true;
      }

      if (nextValue !== prevValue) {
        return true;
      }

      return false;
    });

    const { layoutJson } = this.state;
    if (!keyPath.length) {
      return { key: '', value: layoutJson };
    }
    return layoutJson ? this.find(layoutJson, keyPath) : {};
  }

  removeNode(keyPath) {
    if (!keyPath.length) {
      this.setState({
        layoutJson: {},
        selectedKeyPath: null,
      });
    } else {
      this.dispatch((state) => {
        const { parent, key } = this.find(state.layoutJson, keyPath);
        const parentNode = parse(state.layoutJson, parent);
        if (isNumber(key) || isNumeric(key)) {
          parentNode.splice(key, 1);
        } else {
          delete parentNode[key];
        }
        state.selectedKeyPath = null;
      });
    }
  }
}
