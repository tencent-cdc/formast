import React from 'react';
import {
  Form as AForm,
  Input as AInput,
  InputNumber as AInputNumber,
  Radio as ARadio,
  Select as ASelect,
  Checkbox as ACheckbox,
  Button as AButton,
} from 'antd';
import { connectReactComponent } from '../react/index.js';
import { ButtonConfig, InputConfig, InputNumberConfig, TextAreaConfig, RadioGroupConfig, CheckboxGroupConfig, SelectConfig, FormConfig, FormItemConfig } from '../_shared/component-configs.js';

export { Text, Label, HBox, VBox, FormGroup, Loop } from '../react-d/components.jsx';

const { Item: AFormItem, ErrorList } = AForm;
const { TextArea: ATextarea } = AInput;
const { Group: ACheckboxGroup } = ACheckbox;
const { Group: ARadioGroup } = ARadio;

export const Button = connectReactComponent((props) => {
  const {
    type,
    htmlType = type,
    theme = 'primary',
    ...attrs
  } = props;
  return <AButton {...attrs} type={theme} htmlType={htmlType} />;
}, ButtonConfig);
export const Form = connectReactComponent(AForm, FormConfig);
export const FormItem = connectReactComponent((props) => {
  const {
    errors,
    hidden,
    label,
    children,
    ...attrs
  } = props;

  return (
    <AFormItem label={label} hidden={hidden} {...attrs}>
      {children}
      <ErrorList errors={errors} />
    </AFormItem>
  );
}, FormItemConfig);
export const Input = connectReactComponent((props) => {
  const {
    onChange,
    ...attrs
  } = props;
  const hanleChange = (e) => {
    onChange?.(e.target.value);
  };
  return <AInput {...attrs} onChange={hanleChange} />;
}, InputConfig);
export const InputNumber = connectReactComponent((props) => {
  const {
    onChange,
    ...attrs
  } = props;
  const hanleChange = (value) => {
    onChange?.(value);
  };
  return <AInputNumber {...attrs} onChange={hanleChange} />;
}, InputNumberConfig);
export const TextArea = connectReactComponent(ATextarea, TextAreaConfig);
export const RadioGroup = connectReactComponent(ARadioGroup, RadioGroupConfig);
export const CheckboxGroup = connectReactComponent(ACheckboxGroup, CheckboxGroupConfig);
export const Select = connectReactComponent(ASelect, SelectConfig);
