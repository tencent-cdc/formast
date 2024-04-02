import { FormItem, Input, InputNumber, Select, RadioGroup as Radios, CheckboxGroup as Checkboxes } from '../components';
import { connectReactComponent, useFormastModelContext, Formast } from '../../react/index.js';
import { message, Form as AForm, Button } from 'antd';
import React, { useState } from 'react';

const Form = connectReactComponent((props) => {
  const { action, children } = props;
  const model = useFormastModelContext();
  const [submitting, setSubmmiting] = useState(false);

  const handleSubmit = async () => {
    setSubmmiting(true);
    try {
      const errors = await model.validateAsync();
      if (errors.length) {
        message.warn(errors.message);
        return;
      }

      const data = model.toData();
      const res = await fetch(action, { method: 'post', body: JSON.stringify(data) });
      if (res.status === 200) {
        message.success('提交成功');
      } else {
        message.error(`提交失败(${res.status})`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmmiting(false);
    }
  };

  return (
    <AForm>
      {children}
      <div><Button type="primary" htmlType="submit" disabled={submitting} onClick={handleSubmit}>提交</Button></div>
    </AForm>
  );
});

const options = {
  components: {
    Form,
    FormItem,
    Input,
    InputNumber,
    Select,
    Radios,
    Checkboxes,
  },
};

export default function SchemaForm(props) {
  const { schema } = props;
  return <Formast schema={schema} options={options}></Formast>;
}
