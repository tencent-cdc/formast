import {
  Store,
  useStore,
} from 'nautil';
import {
  each,
  assign,
  parse,
  remove,
  isArray,
  isString,
  decideby,
} from 'ts-fns';
import { parseKey } from '../../core/utils.js';
import { getDataType, convertValueByType, isSubKey } from '../shared/utils.js';
import {
  message,
} from 'antd';

export class ModelEditorStore extends Store {
  constructor(initState = {}) {
    const state = {
      modelJson: null,

      isCellEditModalShow: false,
      cellEditData: null,
      editCellKeyPath: null,

      isFieldEditModalShow: false,
      editFieldKeyPath: null,
      fieldEditData: null,

      addFieldKeyPath: null,
      fieldAddData: null,
      isFieldAddModalShow: false,

      ...initState,
    };
    super(state);
  }

  useKeyPath(keyPath) {
    const find = (modelJson) => {
      const key = keyPath[keyPath.length - 1];
      const parent = keyPath.slice(0, keyPath.length - 1);
      const parentNode = parse(modelJson, parent);

      // 数字索引
      if (!isString(key)) {
        const value = parentNode ? parentNode[key] : undefined;
        return { key, name: key, parent, value };
      }

      const [n, p] = parseKey(key);
      if (!parentNode) {
        return { key, name: n, params: p, parent };
      }

      const isModel = !!(isSubKey(key) || parentNode[`<${key}>`]);
      const model = decideby(() => {
        if (!isModel) {
          return;
        }
        return isSubKey(key) ? parentNode[key] : parentNode[`<${key}>`];
      });

      const siblings = Object.keys(parentNode);
      const found = siblings.find(item => item === n || item.indexOf(`${n}(`) === 0);

      if (!found) {
        const [name, params] = parseKey(key);
        return { key, name, params, parent, isModel, model };
      }

      const [name, params] = parseKey(found);

      if (params) {
        const value = parentNode[found];
        return { key: found, name, params, value, parent, isModel, model };
      }

      const value = parentNode[found];
      return { key: found, name, value, parent, isModel, model };
    };

    useStore(this, (next, prev) => {
      if (!keyPath.length) {
        return next !== prev;
      }

      const { key: nextKey, value: nextValue } = find(next.modelJson);
      const { key: prevKey, value: prevValue } = find(prev ? prev.modelJson : {});

      if (prevKey !== nextKey) {
        return true;
      }

      if (nextValue !== prevValue) {
        return true;
      }

      return false;
    });

    const { modelJson } = this.state;
    if (!keyPath.length) {
      return { key: '', value: modelJson };
    }
    return modelJson ? find(modelJson) : {};
  }

  updateModelJson(keyPath, value) {
    this.dispatch((state) => {
      assign(state.modelJson, keyPath, value);
    });
  }

  handleRemoveNode(keyPath) {
    this.dispatch((state) => {
      remove(state.modelJson, keyPath);
    });
  }

  handleRemoveItem(keyPath) {
    const targetPath = keyPath.slice(0, keyPath.length - 1);
    const index = keyPath[keyPath.length - 1];

    this.dispatch((state) => {
      const target = parse(state.modelJson, targetPath);
      if (isArray(target)) {
        target.splice(index, 1);
      }
    });
  }

  // 增减属性
  handleSubmitField(keyPath, attrs) {
    const oldMeta = parse(this.state.modelJson, keyPath);

    const nextMeta = {};
    const mapping = {};
    attrs.forEach((key) => {
      mapping[key] = 1;
    });
    if (oldMeta) {
      each(oldMeta, (value, key) => {
        const [name] = parseKey(key);
        if (mapping[name]) {
          nextMeta[key] = value;
          mapping[name] = 0;
        }
      });
    }
    attrs.forEach((key) => {
      if (mapping[key]) {
        nextMeta[key] = undefined;
      }
    });

    this.updateModelJson(keyPath, nextMeta);
  }

  handleAddField(keyPath) {
    this.dispatch((state) => {
      state.addFieldKeyPath = keyPath;
      state.fieldAddData = { field: '', attrs: ['label', 'default'], isModel: false, isList: false };
      state.isFieldAddModalShow = true;
    });
  }

  submitAddField(isOk) {
    if (!isOk) {
      this.dispatch((state) => {
        state.addFieldKeyPath = null;
        state.fieldAddData = null;
        state.isFieldAddModalShow = false;
      });
      return;
    }

    const { addFieldKeyPath, fieldAddData, modelJson } = this.state;
    const { field, attrs, isModel, isList } = fieldAddData;

    if (!field.trim()) {
      message.warn('请填写字段名');
      return;
    }

    const node = parse(modelJson, addFieldKeyPath);

    if (!node) {
      message.warn('请求路径非法，请刷新后重试');
      return;
    }

    if (field in node || `<${field}>` in node) {
      message.warn('字段已存在');
      return;
    }

    const nextMeta = {};
    attrs.forEach((key) => {
      nextMeta[key] = null;
    });

    this.dispatch((state) => {
      assign(state.modelJson, [...addFieldKeyPath, field], nextMeta);

      if (isModel) {
        assign(state.modelJson, [...addFieldKeyPath, `<${field}>`], isList ? [{}] : {});
      }

      Object.assign(state, {
        addFieldKeyPath: null,
        fieldAddData: null,
        isFieldAddModalShow: false,
      });
    });
  }

  /**
   * @param {*} keyPath 被编辑节点的 keyPath，它的末尾是 key
   * @param {string} data.key
   * @param {object} data.meta 被编辑的字段的meta
   */
  handleEditField(keyPath, { key, meta, isModel }) {
    const attrs = meta ? Object.keys(meta).map((key) => {
      const [name] = parseKey(key);
      return name;
    }) : [];

    this.dispatch((state) => {
      state.editFieldKeyPath = keyPath;
      state.fieldEditData = { key, attrs, isModel };
      state.isFieldEditModalShow = true;
    });
  }

  handleRemoveField(keyPath, key) {
    this.dispatch((state) => {
      remove(state.modelJson, [...keyPath, key]);
      remove(state.modelJson, [...keyPath, `<${key}>`]);
    });
  }

  submitEditField(isOk) {
    if (!isOk) {
      this.setState({
        editFieldKeyPath: null,
        fieldEditData: null,
        isFieldEditModalShow: false,
      });
      return;
    }

    const { editFieldKeyPath, fieldEditData, modelJson } = this.state;
    const { attrs, isModel } = fieldEditData;
    const meta = parse(modelJson, editFieldKeyPath);

    const key = editFieldKeyPath[editFieldKeyPath.length - 1];
    const parent = editFieldKeyPath.slice(0, editFieldKeyPath.length - 1);
    const modelPath = [...parent, `<${key}>`];
    const model = parse(modelJson, modelPath);

    const nextMeta = {};
    const mapping = {};
    attrs.forEach((key) => {
      mapping[key] = 1;
    });
    if (meta) {
      each(meta, (value, key) => {
        const [name] = parseKey(key);
        if (mapping[name]) {
          nextMeta[key] = value;
          mapping[name] = 0;
        }
      });
    }
    attrs.forEach((key) => {
      if (mapping[key]) {
        nextMeta[key] = null;
      }
    });

    this.dispatch((state) => {
      assign(state.modelJson, editFieldKeyPath, nextMeta);

      if (!isModel && model) {
        remove(state.modelJson, modelPath);
      } else if (isModel && !model) {
        assign(state.modelJson, modelPath, {});
      }

      Object.assign(state, {
        editFieldKeyPath: null,
        fieldEditData: null,
        isFieldEditModalShow: false,
      });
    });
  }

  /**
   * @param {*} keyPath 被编辑节点的 keyPath，它的末尾是 key
   * @param {*} data
   */
  handleEditCell(keyPath, { key, name, params, value }) {
    const isFn = !!params;
    const type = getDataType(value);
    const editingValue = convertValueByType(value, type);
    const result = value;

    this.dispatch((state) => {
      state.cellEditData = { key, name, isFn, params, type, value: editingValue, result };
      state.isCellEditModalShow = true;
      state.editCellKeyPath = keyPath;
    });
  }

  submitEditCell(isOk) {
    if (!isOk) {
      this.setState({
        isCellEditModalShow: false,
        cellEditData: null,
        editCellKeyPath: null,
      });
      return;
    }

    const { editCellKeyPath, cellEditData } = this.state;
    const parentPath = editCellKeyPath.slice(0, editCellKeyPath.length - 1);
    const { key, name, isFn, params = [], result } = cellEditData;
    this.dispatch((state) => {
      const { modelJson } = state;

      if (isFn) {
        const parent = parse(modelJson, parentPath);
        delete parent[key];
        parent[`${name}(${params})`] = result;
      } else {
        assign(modelJson, editCellKeyPath, result);
      }

      Object.assign(state, {
        isCellEditModalShow: false,
        cellEditData: null,
        editCellKeyPath: null,
      });
    });
  }
}
