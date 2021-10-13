import 'antd/dist/antd.css';
import './index.less';
import './editor.less';
import {
  Form,
  Item,
  Button,
  Input,
  TextArea,
  InputNumber,
  Radios,
  Checkboxes,
  Select,
  Password,
  Search,
  Switch,
  Rate,
  DatePicker,
  Slider,
} from './components.jsx';

import { DATA_TYPES } from '../visual/index.js';

const noop = () => {};

Form.formastConfig = {
  type: 'Form',
  title: '表单',
  settings: [
    {
      key: 'onSubmit',
      types: [DATA_TYPES.EXP],
      fn: true,
      params: 'e',
    },
  ],
  defaults: {
    onSubmit: noop,
  },
  children: true,
};

Button.formastConfig = {
  title: '按钮',
  type: 'Button',
  settings: [
    {
      key: 'bind',
    },
    {
      key: 'props.htmlType',
      title: '类型',
      description: '按钮的行为类型，影响按钮点击时表单的行为',
      options: [
        {
          label: '提交',
          value: 'submit',
        },
        {
          label: '重置',
          value: 'reset',
        },
        {
          label: '按钮',
          value: 'button',
        },
      ],
      fn: false,
      default: 'button',
    },
    {
      key: 'props.type',
      title: '样式',
      description: '按钮颜色等',
      options: [
        {
          value: 'primary',
        },
        {
          value: 'default',
        },
        {
          value: 'link',
        },
        {
          value: 'ghost',
        },
        {
          value: 'dashed',
        },
        {
          value: 'text',
        },
      ],
      fn: false,
      default: 'primary',
    },
    {
      key: 'children',
      title: '文案',
      types: [DATA_TYPES.STR],
      default: '提交',
      required: true,
    },
    {
      key: 'props.disabled',
      title: '是否禁用',
      types: [DATA_TYPES.BOOL, DATA_TYPES.EXP],
      default: null,
      nondrop: true,
    },
  ],
};

Input.formastConfig = {
  title: '单行文本',
  type: 'Input',
  settings: [
    {
      key: 'bind',
    },
  ],
};

Password.formastConfig = {
  ...Input.formastConfig,
  type: 'Password',
  title: '密码',
};
Search.formastConfig = {
  ...Input.formastConfig,
  type: 'Search',
  title: '搜索',
};

InputNumber.formastConfig = {
  title: '数字',
  type: 'InputNumber',
  settings: [
    {
      key: 'bind',
    },
  ],
  defaults: {
    onChange: noop,
  },
};

TextArea.formastConfig = {
  title: '多行文本',
  type: 'TextArea',
  settings: [
    {
      key: 'bind',
    },
  ],
  defaults: {
    onChange: noop,
  },
};

Radios.formastConfig = {
  title: '单选组',
  type: 'Radios',
  settings: [
    {
      key: 'bind',
    },
  ],
  defaults: {
    options: [
      {
        label: '选项一',
        value: '1',
      },
      {
        label: '选项二',
        value: '2',
      },
      {
        label: '选项三',
        value: '3',
      },
    ],
    onChange: noop,
  },
};

Checkboxes.formastConfig = {
  title: '多选组',
  type: 'Checkboxes',
  settings: [
    {
      key: 'bind',
    },
  ],
  defaults: {
    options: [
      {
        label: '选项一',
        value: '1',
      },
      {
        label: '选项二',
        value: '2',
      },
      {
        label: '选项三',
        value: '3',
      },
    ],
    onChange: noop,
  },
};

Select.formastConfig = {
  title: '下拉列表',
  type: 'Select',
  settings: [
    {
      key: 'bind',
    },
  ],
  defaults: {
    placeholder: '请选择',
    options: [
      {
        label: '选项一',
        value: '1',
      },
      {
        label: '选项二',
        value: '2',
      },
      {
        label: '选项三',
        value: '3',
      },
    ],
    onChange: noop,
  },
};

Item.formastConfig = {
  title: '项',
  type: 'Item',
  settings: [
    {
      key: 'bind',
    },
    {
      key: 'props.label',
      title: '标签',
      types: [DATA_TYPES.STR, DATA_TYPES.EXP],
      default: '字段名',
      nondrop: true,
    },
  ],
  direction: 'h',
  children: [],
};

Switch.formastConfig = {
  type: 'Switch',
  title: '开关',
  settings: [
    {
      key: 'bind',
    },
  ],
};

Rate.formastConfig = {
  type: 'Rate',
  title: '评分',
  settings: [
    {
      key: 'bind',
    },
  ],
};

DatePicker.formastConfig = {
  type: 'DatePicker',
  title: '日期选择器',
  settings: [
    {
      key: 'bind',
    },
  ],
};

Slider.formastConfig = {
  type: 'Slider',
  title: '滑动条',
  settings: [
    {
      key: 'bind',
    },
  ],
};

export const layout = {
  groups: [
    {
      title: '布局组件',
      items: [
        Form,
        Item,
      ],
    },
    {
      title: '原子组件',
      items: [
        Input,
        TextArea,
        InputNumber,
        Radios,
        Checkboxes,
        Select,
        Password,
        Search,
        Switch,
        Rate,
        DatePicker,
        Slider,
        Button,
      ],
    },
  ],
};
