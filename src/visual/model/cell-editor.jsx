import {
  React,
  If,
  useStore,
  Switch,
  Case,
  Component,
} from 'nautil';
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Switch as Toggler,
} from 'antd';
import { ModelEditorStore } from './store.js';
import { DATA_TYPES, DATA_TYPES_OPTIONS, createDefaultValue, createFormattedValue } from '../shared/utils.js';
import { JsonCode } from '../components/json-code/json-code.jsx';

const { Item: FormItem } = Form;

export class CellEditModal extends Component {
  static props = {
    store: ModelEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  Render() {
    const { store } = this.props;
    const { state } = useStore(store, ['isCellEditModalShow']);
    const { isCellEditModalShow } = state;

    return (
      <Modal
        title="编辑属性"
        centered
        destroyOnClose
        visible={isCellEditModalShow}
        onCancel={() => {
          store.submitEditCell(false);
        }}
        onOk={() => {
          store.submitEditCell(true);
        }}
      >
        <CellEditor store={store} />
      </Modal>
    );
  }
}

export class CellEditor extends Component {
  static props = {
    store: ModelEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  handleUpdateFn = (isFn) => {
    const { store } = this.props;
    store.dispatch((state) => {
      state.cellEditData.isFn = isFn;
    });
  }

  handleUpdateParams = (params) => {
    const { store } = this.props;
    store.dispatch((state) => {
      state.cellEditData.params = params;
    });
  }

  handleUpdateType = (type) => {
    const { store } = this.props;
    const value = createDefaultValue(type);
    store.dispatch((state) => {
      state.cellEditData.type = type;
      state.cellEditData.value = value;
      state.cellEditData.result = createFormattedValue(value, type);
    });
  }

  handleUpdateValue = (value) => {
    const { store } = this.props;
    store.dispatch((state) => {
      const { type } = state.cellEditData;
      state.cellEditData.value = value;
      state.cellEditData.result = createFormattedValue(value, type);
    });
  }

  Render() {
    const { store } = this.props;
    const { state } = useStore(store, ['cellEditData']);
    const { cellEditData } = state;

    if (!cellEditData) {
      return null;
    }

    const { key, isFn, params, type, value } = cellEditData;
    const options = Object.values(DATA_TYPES_OPTIONS);

    return (
      <Form labelCol={{ span: 6 }}>
        <FormItem label="属性">
          {key}
        </FormItem>
        <FormItem label="是否函数？">
          <Toggler checked={isFn} onChange={checked => this.handleUpdateFn(checked)} />
        </FormItem>
        <If is={isFn}>
          <FormItem label="参数列表">
            <Input value={params} onChange={e => this.handleUpdateParams(e.target.value)} prefix='(' suffix=')' />
          </FormItem>
        </If>
        <FormItem label="数据类型">
          <Select value={type} options={options} onChange={(value) => {
            this.handleUpdateType(value);
          }}></Select>
        </FormItem>
        <FormItem label="值">
          <Switch of={type}>
            <Case is={DATA_TYPES.STR}
              render={() => <Input value={value} onChange={e => this.handleUpdateValue(e.target.value)} prefix='"' suffix='"'  />} />
            <Case is={DATA_TYPES.NUM}
              render={() => <InputNumber value={value} onChange={value => this.handleUpdateValue(+value)} />} />
            <Case is={DATA_TYPES.BOOL}
              render={() => <Toggler checked={value} onChange={checked => this.handleUpdateValue(checked)} />} />
            <Case is={DATA_TYPES.EXP}
              render={() => <Input value={value} onChange={e => this.handleUpdateValue(e.target.value)} prefix='"{' suffix='}"' />} />
            <Case is={DATA_TYPES.JSON}
              render={() => <JsonCode value={value} onChange={json => this.handleUpdateValue(json)} />} />
            <Case is={DATA_TYPES.NIL}>NULL</Case>
          </Switch>
        </FormItem>
      </Form>
    );
  }
}
