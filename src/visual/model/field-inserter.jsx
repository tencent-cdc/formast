/**
 * 字段编辑器
 */

import {
  React,
  useStore,
  Component,
} from 'nautil';
import {
  Modal,
  Form,
  Switch as Toggler,
  Input,
} from 'antd';
import { InputTags } from '../components/input-tags';
import { ModelEditorStore } from './store.js';

const { Item: FormItem } = Form;

export class FieldAddModal extends Component {
  static props = {
    store: ModelEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  Render() {
    const { store } = this.props;
    const { state } = useStore(store, ['isFieldAddModalShow', 'fieldAddData']);
    const { isFieldAddModalShow, fieldAddData } = state;

    if (!fieldAddData) {
      return null;
    }

    const { field, attrs, isModel, isList } = fieldAddData;

    const handleName = (e) => {
      store.dispatch((state) => {
        state.fieldAddData.field = e.target.value;
      });
    };

    const handleChange = (attrs) => {
      store.dispatch((state) => {
        state.fieldAddData.attrs = attrs;
      });
    };

    const handleCheckModel = (checked) => {
      store.dispatch((state) => {
        state.fieldAddData.isModel = checked;
        if (!checked) {
          state.fieldAddData.isList = false;
        }
      });
    };

    const handleCheckList = (checked) => {
      if (!isModel) {
        return;
      }
      store.dispatch((state) => {
        state.fieldAddData.isList = checked;
      });
    };

    return (
      <Modal
        title="添加字段"
        centered
        destroyOnClose
        visible={isFieldAddModalShow}
        onCancel={() => {
          store.submitAddField(false);
        }}
        onOk={() => {
          store.submitAddField(true);
        }}
      >
        <Form labelCol={{ span: 6 }}>
          <FormItem label="字段名（英文）">
            <Input value={field} onChange={handleName} />
          </FormItem>
          <FormItem label="是否子模型">
            <Toggler checked={isModel} onChange={checked => handleCheckModel(checked)} />
          </FormItem>
          <FormItem label="子模型是否列表">
            <Toggler checked={isList} onChange={checked => handleCheckList(checked)} />
          </FormItem>
          <FormItem label="属性列表">
            <InputTags tags={attrs} unremovableTags={['default', 'label']} onChange={handleChange} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
