import {
  React,
  If,
  Else,
  ElseIf,
  useMemo,
  Component,
  nonable,
  Enum,
} from 'nautil';
import {
  each,
  isArray,
  isObject,
  filter,
  isEmpty,
  decideby,
  createRandomString,
} from 'ts-fns';
import {
  Table,
  Input,
  Tooltip,
  Popconfirm,
  message,
  Button,
  Empty,
} from 'antd';
import { parseKey } from '../../core/utils.js';
import { ModelEditorStore } from './store.js';
import { CellEditModal } from './cell-editor.jsx';
import { FieldEditModal } from './field-editor.jsx';
import { isSubKey } from '../shared/utils.js';
import { EditIcon, DeleteIcon, SettingIcon, AddIcon } from '../components/icons';
import { FieldAddModal } from './field-inserter.jsx';

const { Search } = Input;

export class ModelEditor extends Component {
  static props = {
    data: Object,
    onChange: Function,
  }

  onInit() {
    const { data } = this.props;
    this.store = new ModelEditorStore({
      modelJson: data,
    });
  }

  onChange = (next, prev) => {
    if (next.modelJson !== prev.modelJson) {
      this.props.onChange(next.modelJson);
    }
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
      <>
        <FieldsTable store={this.store} />
        <CellEditModal store={this.store} />
        <FieldEditModal store={this.store} />
        <FieldAddModal store={this.store} />
      </>
    );
  }
}

const SUB_TYPES = {
  FIELD: 'field',
  META: 'meta',
};

/**
 * 用于编辑字段信息的table
 */
class FieldsTable extends Component {
  static props = {
    title: nonable(String),
    store: ModelEditorStore,
    keyPath: [String, Number],
  }

  static defaultProps = {
    keyPath: [],
  }

  shouldUpdate() {
    return false;
  }

  createRowKeyPath(row) {
    const { keyPath } = this.props;
    const key = row.$field;
    const subKeyPath = [...keyPath, key];
    return subKeyPath;
  }

  createExpand() {
    return {
      expandedRowRender: (row) => { // eslint-disable-line
        const { store } = this.props;
        const subKeyPath = this.createRowKeyPath(row);
        return (
          <div className="formast-model-editor__sub-editor">
            <SubBox keyPath={subKeyPath} store={store} type={SUB_TYPES.FIELD} />
          </div>
        );
      },
      rowExpandable: (row) => {
        const res = filter(row, (value, key) => {
          if (key === '$child') {
            return true;
          }
          if (key.indexOf('$') === 0) {
            return false;
          }
          return value && typeof value === 'object';
        });
        return !isEmpty(res);
      },
      expandRowByClick: true,
    };
  }

  createRender(attr) {
    const { store } = this.props;
    return (_, row) => { // eslint-disable-line
      const subKeyPath = this.createRowKeyPath(row);
      const fn = row[`$$${attr}`];
      const key = fn ? `${attr}(${fn.params})` : attr;
      subKeyPath.push(key);
      return (
        <CellBox
          keyPath={subKeyPath}
          store={store}
        />
      );
    };
  }

  handleAddField = () => {
    const { keyPath, store } = this.props;
    store.handleAddField(keyPath);
  }

  handleRemoveField = (row) => {
    const { store, keyPath } = this.props;
    store.setState({ selectedKeyPath: null });
    store.handleRemoveField(keyPath, row.$field);
  }

  handleEditField = (row) => {
    const { store } = this.props;
    const { $field, $meta, $child } = row;
    const keyPath = this.createRowKeyPath(row);
    store.handleEditField(keyPath, { key: $field, meta: $meta, isModel: !!$child }); // 打开弹窗进行编辑，后续动作都不用再管
  }

  fieldColumn = {
    fixed: true,
    dataIndex: '$field',
    key: '$field',
    title: (
      <div className="formast-model-editor__field-title">
        <span>字段名</span>
        <span className="formast-model-editor__field-add-icon" onClick={this.handleAddField}><AddIcon /></span>
      </div>
    ),
    width: 120,
    render: (value, row) => ( // eslint-disable-line
      <div className="formast-model-editor__field-column">
        <span className="formast-model-editor__field-name">{value}</span>
        <If is={!!row.$child && !row.$isList}><Tooltip className="formast-model-editor__field-message" title="该字段是一个子模型">(M)</Tooltip></If>
        <If is={!!row.$isList}><Tooltip className="formast-model-editor__field-message" title="该字段是子模型列表">(M[])</Tooltip></If>
        <span className="formast-model-editor__field-name-operators" onClick={e => e.stopPropagation()}>
          <span
            className="formast-model-editor__field-edit-icon"
            onClick={() => this.handleEditField(row)}
          >
            <SettingIcon />
          </span>
          <Popconfirm
            title="确定删除该字段吗？"
            onConfirm={() => this.handleRemoveField(row)}
            okText="确定"
            cancelText="取消"
          >
            <span className="formast-model-editor__field-edit-icon">
              <DeleteIcon />
            </span>
          </Popconfirm>
        </span>
      </div>
    ),
    shouldUpdate: () => true,
  }

  buildTableData = (data) => {
    const columns = [
      this.fieldColumn,
    ];

    const mapping = {};
    const subs = [];
    const allAttrs = {};
    const rows = [];

    let hasSub = false;

    each(data, (meta, field) => {
      if (isSubKey(field)) {
        subs.push([field.substring(1, field.length - 1), meta]);
        hasSub = true;
      } else {
        const row = {
          $meta: meta || {},
          $field: field,
        };

        if (meta) {
          const attrs = Object.keys(meta);
          attrs.forEach((key) => {
            const value = meta[key];
            const [attr, params] = parseKey(key);
            row[attr] = value;
            if (params) {
              row[`$$${attr}`] = { key, attr, params, value };
            }
            allAttrs[attr] = 1;
            if (value && (isObject(value) || isArray(value))) {
              hasSub = true;
            }
          });
        }

        mapping[field] = row;
        rows.push(row);
      }
    });

    subs.forEach(([field, sub]) => {
      const isList = isArray(sub);
      if (mapping[field]) {
        mapping[field].$child = isList ? sub[0] : sub;
        mapping[field].$isList = isList;
      } else {
        const row = {
          $field: field,
          $child: isList ? sub[0] : sub,
          $isList: isList,
          $meta: {},
        };
        mapping[field] = row;
        rows.push(row);
      }
    });

    const attrs = Object.keys(allAttrs);
    attrs.forEach((attr) => {
      columns.push({
        align: 'left',
        key: attr,
        dataIndex: attr,
        title: attr,
        width: 140,
        render: this.createRender(attr),
        shouldUpdate: () => false,
      });
    });

    // $field 总是第一个
    // label 总是第二个
    columns.sort((a, b) => {
      if (a.key === 'label' && b.key === '$field') {
        return 0;
      }
      if (a.key === 'label') {
        return -1;
      }
      return 0;
    });

    const expandable = hasSub ? this.createExpand() : false;

    return { columns, rows, expandable };
  }

  addButton = (
    <Button type="link" className="formast-model-editor__add-field-button" onClick={this.handleAddField}>
      添加字段
    </Button>
  )

  emptyContent = (
    <Empty description="没有字段" imageStyle={{ height: 40 }} style={{ padding: 20 }}>
      {this.addButton}
    </Empty>
  )

  Render() {
    const { title, store, keyPath } = this.props;
    const { value: data } = store.useKeyPath(keyPath);

    const { columns, rows, expandable } = useMemo(() => this.buildTableData(data), [data]);
    const x = columns.length > 6 ? columns.length * 200 : undefined;

    return (
      <div className="formast-model-editor">
        <Table
          bordered
          title={title && (() => <div className="formast-model-editor__title">{title}</div>)}
          size="small"
          tableLayout="auto"
          columns={columns}
          expandable={expandable}
          dataSource={rows}
          rowKey={row => row.$field}
          pagination={false}
          scroll={{ x }}
          locale={{
            emptyText: this.emptyContent,
          }}
        />
      </div>
    );
  }
}

class CellBox extends Component {
  static props = {
    keyPath: [String, Number],
    store: ModelEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  Render() {
    const { keyPath, store } = this.props;
    const { key, name, params, value } = store.useKeyPath(keyPath);

    const createTypings = content => <Tooltip className="formast-model-editor__typings" title="展开本行后编辑">{content}</Tooltip>;

    return (
      <div className="formast-model-editor__cell-render">
        <If is={!!isObject(value)} render={() => createTypings(typeof value)}>
          <ElseIf is={!!isArray(value)} render={() => createTypings(`[${value.map(item => typeof item)}]`)} />
          <Else render={() => {
            const str = params ? `(${params}) => ${JSON.stringify(value)}`
              : JSON.stringify(value);
            return (
              <div className="formast-model-editor__editable-cell" onClick={e => e.stopPropagation()}>
                <span title="编辑" className="formast-model-editor__edit-icon" onClick={() => {
                  store.handleEditCell(keyPath, {
                    key,
                    name,
                    params,
                    value,
                  }); // 只是打开弹窗编辑，后续操作都不用管
                }}>
                  <EditIcon />
                </span>
                <span>{str}</span>
              </div>
            );
          }} />
        </If>
      </div>
    );
  }
}

class SubBox extends Component {
  static props = {
    store: ModelEditorStore,
    keyPath: [String, Number],
    type: new Enum(Object.values(SUB_TYPES)),
  }

  shouldUpdate() {
    return false;
  }

  Render() {
    const { keyPath, store, type } = this.props;
    const { key, name, value, parent, isModel, model } = store.useKeyPath(keyPath);

    const subs = [];

    if (type === SUB_TYPES.FIELD) {
      if (isModel && isArray(model)) {
        const subKeyPath = [...parent, `<${name}>`, 0];
        const title = `子模型列表：${key}`;
        subs.push(<FieldsTable key={key} keyPath={subKeyPath} store={store} title={title} />);
      } else if (isModel && isObject(model)) {
        const subKeyPath = [...parent, `<${name}>`];
        const title = `子模型：${key}`;
        subs.push(<FieldsTable key={key} keyPath={subKeyPath} store={store} title={title} />);
      }
      subs.push(<SubBox key="$meta" store={store} type={SUB_TYPES.META} keyPath={[...parent, name]} />);
    } else if (value) {
      each(value, (value, attr) => {
        const subKeyPath = [...parent, key, attr];
        const title = `${key}:${attr}:`;
        if (isArray(value)) {
          subs.push(<IndexesTable key={attr} keyPath={subKeyPath} store={store} title={title} />);
        } else if (isObject(value)) {
          subs.push(<AttrsTable key={attr} keyPath={subKeyPath} store={store} title={title} />);
        }
      });
    }

    return subs;
  }
}

class IndexesTable extends Component {
  static props = {
    title: nonable(String),
    store: ModelEditorStore,
    keyPath: [String, Number],
  }

  uniqueKeys = []

  initUniqueKeys(items) {
    items.forEach(() => {
      this.uniqueKeys.push(createRandomString(8));
    });
  }

  addUniqueKey() {
    this.uniqueKeys.push(createRandomString(8));
  }

  removeUniqueKey(index) {
    this.uniqueKeys.splice(index, 1);
  }

  shouldUpdate() {
    return false;
  }

  buildTableData(data) {
    const { store, keyPath } = this.props;
    const columns = [
      {
        align: 'left',
        key: 'index',
        dataIndex: 'index',
        title: '索引号',
        width: 120,
        render: (index, row) => ( // eslint-disable-line
          <div className="formast-model-editor__field-column">
            <span className="formast-model-editor__field-name">{index}</span>
            <span className="formast-model-editor__field-name-operators" onClick={e => e.stopPropagation()}>
              <Popconfirm
                title="确定删除该项吗？"
                onConfirm={() => this.handleRemoveIndex(index, row)}
                okText="确定"
                cancelText="取消"
              >
                <span className="formast-model-editor__field-edit-icon">
                  <DeleteIcon />
                </span>
              </Popconfirm>
            </span>
          </div>
        ),
        shouldUpdate: () => true,
      },
      {
        align: 'left',
        key: 'value',
        dataIndex: 'value',
        title: '值',
        render: (_, row) => { // eslint-disable-line
          const subKeyPath = [...keyPath, row.index];
          return (
            <CellBox
              keyPath={subKeyPath}
              store={store}
            />
          );
        },
        shouldUpdate: () => false,
      },
    ];

    let hasSub = false;
    const rows = data.map((value, index) => {
      if (value && (isObject(value) || isArray(value))) {
        hasSub = true;
      }
      return { index, value };
    });

    const expandable = hasSub ? this.createExpand() : false;

    return { columns, rows, expandable };
  }

  createExpand() {
    return {
      expandedRowRender: (row) => { // eslint-disable-line
        const { store, keyPath } = this.props;
        const { index, value } = row;
        const subKeyPath = [...keyPath, index];

        const sub = decideby(() => {
          if (isArray(value)) {
            return <IndexesTable keyPath={subKeyPath} store={store} />;
          } if (isObject(value)) {
            return <AttrsTable keyPath={subKeyPath} store={store} />;
          }
        });

        return (
          <div className="formast-model-editor__sub-editor">
            {sub}
          </div>
        );
      },
      rowExpandable: (row) => {
        const { value } = row;
        return value && (isObject(value) || isArray(value));
      },
      expandRowByClick: true,
    };
  }

  handleRemoveIndex = (index) => {
    const { keyPath, store } = this.props;
    this.removeUniqueKey(index);
    store.handleRemoveItem([...keyPath, index]);
  }

  Render() {
    const { title, store, keyPath } = this.props;
    const { value: data = [] } = store.useKeyPath(keyPath);

    useMemo(() => {
      this.initUniqueKeys(data);
    }, []);

    const { uniqueKeys } = this;

    const { columns, rows, expandable } = useMemo(() => this.buildTableData(data), [data]);

    const handleAddIndex = () => {
      const nextIndex = data.length;
      this.addUniqueKey();
      store.updateModelJson([...keyPath, nextIndex], null);
    };

    const addButton = <Button
      type="link"
      className="formast-model-editor__add-field-button"
      onClick={handleAddIndex}
    >添加</Button>;

    const emptyContent = (
      <Empty description="没有数据" imageStyle={{ height: 40 }} style={{ padding: 20 }}>
        {addButton}
      </Empty>
    );

    return (
      <div className="formast-model-editor">
        <Table
          bordered
          title={title && (() => <div className="formast-model-editor__title">{title}</div>)}
          size="small"
          tableLayout="auto"
          columns={columns}
          expandable={expandable}
          dataSource={rows}
          rowKey={row => uniqueKeys[row.index]}
          pagination={false}
          locale={{
            emptyText: emptyContent,
          }}
        />
        <div className="formast-model-editor__buttons">
          {rows.length ? addButton : null}
        </div>
      </div>
    );
  }
}

class AttrsTable extends Component {
  static props = {
    title: nonable(String),
    store: ModelEditorStore,
    keyPath: [String, Number],
  }

  shouldUpdate() {
    return false;
  }

  createExpand() {
    return {
      expandedRowRender: (row) => { // eslint-disable-line
        const { store, keyPath } = this.props;
        const { key, value } = row;
        const subKeyPath = [...keyPath, key];

        const sub = decideby(() => {
          if (isArray(value)) {
            return <IndexesTable keyPath={subKeyPath} store={store} />;
          } if (isObject(value)) {
            return <AttrsTable keyPath={subKeyPath} store={store} />;
          }
        });

        return (
          <div className="formast-model-editor__sub-editor">
            {sub}
          </div>
        );
      },
      rowExpandable: (row) => {
        const { value } = row;
        return value && (isObject(value) || isArray(value));
      },
      expandRowByClick: true,
    };
  }

  handleAddAttr = (field) => {
    if (!field) {
      return;
    }

    const { keyPath, store } = this.props;
    const { modelJson } = store.state;

    if (field in modelJson || `<${field}>` in modelJson) {
      message.warn('字段已存在');
      return;
    }

    store.updateModelJson([...keyPath, field], null);
  }

  handleRemoveAttr = (key) => {
    const { store, keyPath } = this.props;
    store.handleRemoveNode(keyPath, key);
  }

  buildTableData = (data) => {
    const { keyPath, store } = this.props;
    const columns = [
      {
        align: 'left',
        key: 'key',
        dataIndex: 'key',
        title: '属性名',
        width: 120,
        render: (key, row) => ( // eslint-disable-line
          <div className="formast-model-editor__field-column">
            <span className="formast-model-editor__field-name">{key}</span>
            <span className="formast-model-editor__field-name-operators" onClick={e => e.stopPropagation()}>
              <Popconfirm
                title="确定删除该属性吗？"
                onConfirm={() => this.handleRemoveAttr(key, row)}
                okText="确定"
                cancelText="取消"
              >
                <span className="formast-model-editor__field-edit-icon">
                  <DeleteIcon />
                </span>
              </Popconfirm>
            </span>
          </div>
        ),
        shouldUpdate: () => true,
      },
      {
        align: 'left',
        key: 'value',
        dataIndex: 'value',
        title: '值',
        render: (_, row) => { // eslint-disable-line
          const subKeyPath = [...keyPath, row.key];
          return (
            <CellBox
              keyPath={subKeyPath}
              store={store}
            />
          );
        },
        shouldUpdate: () => false,
      },
    ];

    const rows = [];

    let hasSub = false;

    each(data, (value, key) => {
      const [name, params] = parseKey(key);
      const row = {
        key,
        name,
        params,
        value,
      };

      if (value && (isObject(value) || isArray(value))) {
        hasSub = true;
      }

      rows.push(row);
    });

    const expandable = hasSub ? this.createExpand() : false;

    return { columns, rows, expandable };
  }

  addButton = <Search
    className="formast-model-editor__add-attr-input"
    placeholder="请输入属性名（英文）"
    allowClear
    enterButton="添加属性"
    onSearch={this.handleAddAttr}
  />

  emptyContent = (
    <Empty description="没有属性" imageStyle={{ height: 40 }} style={{ padding: 20 }}>
      {this.addButton}
    </Empty>
  )

  Render() {
    const { title, store, keyPath } = this.props;
    const { value: data } = store.useKeyPath(keyPath);

    const { columns, rows, expandable } = useMemo(() => this.buildTableData(data), [data]);
    const x = columns.length > 6 ? columns.length * 200 : undefined;

    return (
      <div className="formast-model-editor">
        <Table
          bordered
          title={title && (() => <div className="formast-model-editor__title">{title}</div>)}
          size="small"
          tableLayout="auto"
          columns={columns}
          expandable={expandable}
          dataSource={rows}
          rowKey={row => row.key}
          pagination={false}
          scroll={{ x }}
          locale={{
            emptyText: this.emptyContent,
          }}
        />
        <div className="formast-model-editor__buttons">
          {rows.length ? this.addButton : null}
        </div>
      </div>
    );
  }
}
