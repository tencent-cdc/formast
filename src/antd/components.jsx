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
    readonly,
    ...attrs
  } = props;
  const hanleChange = (e) => {
    onChange?.(e.target.value);
  };
  return <AInput {...attrs} readOnly={readonly} onChange={hanleChange} />;
}, InputConfig);
export const InputNumber = connectReactComponent((props) => {
  const {
    onChange,
    readonly,
    ...attrs
  } = props;
  const hanleChange = (value) => {
    onChange?.(+value);
  };
  return <AInputNumber {...attrs} readOnly={readonly} onChange={hanleChange} />;
}, InputNumberConfig);
export const TextArea = connectReactComponent((props) => {
  const { readonly, onChange, ...attrs } = props;
  const hanleChange = (e) => {
    onChange?.(e.target.value);
  };
  return <ATextarea {...attrs} readOnly={readonly} onChange={hanleChange} />;
}, TextAreaConfig);
export const RadioGroup = connectReactComponent((props) => {
  const { options, onChange, readonly, valueKey = 'value', labelKey = 'label', ...attrs } = props;
  const mappedOptions = options.map((option) => {
    const label = option[labelKey] || option[valueKey];
    const value = option[valueKey];
    return { label, value };
  });
  const handleChange = (e) => {
    const selectedValue = e.target.value;
    const selectedOption = options.find(option => option[valueKey] === selectedValue
        || `${option[valueKey]}` === selectedValue);
    onChange?.(selectedValue, selectedOption);
  };
  return <ARadioGroup {...attrs} readOnly={readonly} onChange={handleChange} options={mappedOptions} />;
}, RadioGroupConfig);
export const CheckboxGroup = connectReactComponent((props) => {
  const { readonly, value, onChange, options, valueKey = 'value', labelKey = 'label', ...attrs } = props;
  const mappedOptions = options.map((option) => {
    const label = option[labelKey] || option[valueKey];
    const value = option[valueKey];
    return { label, value };
  });
  const handleChange = (next) => {
    const mapping = {};
    options.forEach((option) => {
      mapping[option[valueKey]] = option;
    });
    const items = next.map(value => mapping[value]);
    onChange?.(next, items);
  };
  return (
    <ACheckboxGroup
      {...attrs}
      readOnly={readonly}
      options={mappedOptions}
      onChange={handleChange}
      value={value}
    />
  );
}, CheckboxGroupConfig);
export const Select = connectReactComponent(ASelect, SelectConfig);
