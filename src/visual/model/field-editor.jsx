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
} from 'antd';
import { InputTags } from '../components/input-tags';
import { ModelEditorStore } from './store.js';

const { Item: FormItem } = Form;

export class FieldEditModal extends Component {
  static props = {
    store: ModelEditorStore,
  }

  shouldUpdate() {
    return false;
  }

  Render() {
    const { store } = this.props;
    const { state } = useStore(store, ['isFieldEditModalShow', 'fieldEditData']);
    const { isFieldEditModalShow, fieldEditData } = state;

    if (!fieldEditData) {
      return null;
    }

    const { key, attrs, isModel } = fieldEditData;

    const handleChange = (attrs) => {
      store.dispatch((state) => {
        state.fieldEditData.attrs = attrs;
      });
    };

    const handleCheck = (checked) => {
      store.dispatch((state) => {
        state.fieldEditData.isModel = checked;
      });
    };

    return (
      <Modal
        title="编辑字段"
        centered
        destroyOnClose
        visible={isFieldEditModalShow}
        onCancel={() => {
          store.submitEditField(false);
        }}
        onOk={() => {
          store.submitEditField(true);
        }}
      >
        <Form labelCol={{ span: 6 }}>
          <FormItem label="字段">
            {key}
          </FormItem>
          <FormItem label="是否模型">
            <Toggler checked={isModel} onChange={checked => handleCheck(checked)} />
          </FormItem>
          <FormItem label="属性列表">
            <InputTags tags={attrs} unremovableTags={['default', 'label']} onChange={handleChange} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
