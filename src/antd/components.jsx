import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Checkbox,
  AutoComplete,
  Cascader,
  DatePicker,
  Mentions,
  Rate,
  Slider,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  Button,
  Switch,
} from 'antd';
import { connectReactComponent } from '../react/index.js';

const { Item, ErrorList } = Form;
const { TextArea, Search, Password, Group: InputGroup } = Input;
const { Group: CheckboxGroup } = Checkbox;
const { Group: RadioGroup } = Radio;

export {
  Form,
  Button,
  Input,
  TextArea,
  InputNumber,
  RadioGroup,
  CheckboxGroup,
  Select,
  Password,
  Search,
  Switch,
  Rate,
  DatePicker,
  Slider,

  Checkbox,
  Radio,
  AutoComplete,
  Cascader,
  Mentions,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  InputGroup,
};

export const FormItem = connectReactComponent((props) => {
  const {
    bind,
    errors = bind?.errors,
    hidden = bind?.hidden,
    label = bind?.label,
    children,
    ...attrs
  } = props;

  return (
    <Item label={label} hidden={hidden} {...attrs}>
      {children}
      <ErrorList errors={errors} />
    </Item>
  );
});

export const Label = connectReactComponent((props) => {
  const {
    bind,
    children = bind?.label,
    ...attrs
  } = props;

  return (
    <label {...attrs}>{children}</label>
  );
});

Button.formast = {
  mapToProps({ bind }, props) {
    const {
      disabled = bind?.disabled,
    } = props;
    return { disabled };
  },
};

Input.formast = {
  mapToProps({ bind }, props) {
    const {
      prefix = bind?.prefix,
      suffix = bind?.suffix,
      disabled = bind?.disabled,
      readOnly = bind?.readonly,
      hidden = bind?.hidden,
      required = bind?.required,
      maxLength = bind?.maxlength,
      placeholder = bind?.placeholder,
    } = props;
    const attrs = { prefix, suffix, disabled, readOnly, hidden, required, maxLength, placeholder };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = e => bind.value = e.target.value; // eslint-disable-line
    }
    // 传入null作为value
    if (attrs.value === null) {
      attrs.value = '';
    }
    return attrs;
  },
};

Password.formast = Input.formast;
Search.formast = Input.formast;

TextArea.formast = {
  mapToProps({ bind }, props) {
    const {
      disabled = bind?.disabled,
      readOnly = bind?.readonly,
      hidden = bind?.hidden,
      required = bind?.required,
      maxLength = bind?.maxLength,
      placeholder = bind?.placeholder,
    } = props;
    const attrs = { disabled, readOnly, hidden, required, maxLength, placeholder };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = e => bind.value = e.target.value; // eslint-disable-line
    }
    // 传入null作为value
    if (attrs.value === null) {
      attrs.value = '';
    }
    return attrs;
  },
};

InputNumber.formast = {
  mapToProps({ bind }, props) {
    const {
      max = bind?.max,
      min = bind?.min,
      step = bind?.step,
      disabled = bind?.disabled,
      readOnly = bind?.readonly,
      hidden = bind?.hidden,
      required = bind?.required,
      placeholder = bind?.placeholder,
    } = props;
    const attrs = { disabled, readOnly, hidden, required, max, min, step, placeholder };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = value => bind.value = value; // eslint-disable-line
    }
    // 传入null作为value
    if (attrs.value === null) {
      attrs.value = '';
    }
    return attrs;
  },
};

Slider.formast = {
  mapToProps({ bind }, props) {
    const {
      max = bind?.max,
      min = bind?.min,
      step = bind?.step,
      disabled = bind?.disabled,
      readOnly = bind?.readonly,
      hidden = bind?.hidden,
      required = bind?.required,
    } = props;
    const attrs = { disabled, readOnly, hidden, required, max, min, step };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = value => bind.value = value; // eslint-disable-line
    }
    // 传入null作为value
    if (attrs.value === null) {
      attrs.value = '';
    }
    return attrs;
  },
};

RadioGroup.formast = {
  mapToProps({ bind }, props) {
    const {
      options = bind?.options,
      disabled = bind?.disabled,
    } = props;
    const attrs = { options, disabled };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = value => bind.value = value; // eslint-disable-line
    }
    return attrs;
  },
};

CheckboxGroup.formast = {
  mapToProps({ bind }, props) {
    const {
      options = bind?.options,
      disabled = bind?.disabled,
    } = props;
    const attrs = { options, disabled };
    if (bind) {
      attrs.value = bind.value; // 必须是 string[]
      attrs.onChange = (value) => {
        const next = bind.value.includes(value) ? bind.value.filter(item => item !== value) : [...bind.value, value];
        bind.value = next; // eslint-disable-line
      };
    }
    return attrs;
  },
};

Select.formast = {
  mapToProps({ bind }, props) {
    const {
      options = bind?.options,
      disabled = bind?.disabled,
      placeholder = bind?.placeholder,
    } = props;
    const attrs = { options, disabled, placeholder };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = value => bind.value = value; // eslint-disable-line
    }
    return attrs;
  },
};

Switch.formast = {
  mapToProps({ bind }, props) {
    const {
      disabled = bind?.disabled,
    } = props;
    const attrs = { disabled };
    if (bind) {
      attrs.checked = !!bind.value;
      attrs.onChange = checked => bind.value = checked; // eslint-disable-line
    }
    return attrs;
  },
};

Rate.formast = {
  mapToProps({ bind }, props) {
    const {
      count = bind?.totalCount,
      disabled = bind?.disabled,
      tooltips = bind?.tooltips,
    } = props;
    const attrs = { count, disabled, tooltips };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = value => bind.value = value; // eslint-disable-line
    }
    return attrs;
  },
};

DatePicker.formast = {
  mapToProps({ bind }, props) {
    const {
      format = bind?.format,
      locale = bind?.locale,
      placeholder = bind?.placeholder,
    } = props;
    const attrs = { format, locale, placeholder };
    if (bind) {
      attrs.value = bind.value;
      attrs.onChange = value => bind.value = value; // eslint-disable-line
    }
    return attrs;
  },
};
