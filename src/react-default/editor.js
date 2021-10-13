import './index.less';
import './editor.less';

import {
  Text,
  Button,
  Label,
  HBox,
  VBox,
  Input,
  InputNumber,
  Textarea,
  Checkboxes,
  Radios,
  Select,
  Form,
  Group,
  Item,
  Loop,
} from './components.jsx';
import { DATA_TYPES } from '../visual/index.js';
import { classnames, noop } from './utils.js';
import { React } from 'nautil';

const COMMON_CONFIGS = {
  maxLength: {
    key: 'props.maxLength',
    title: '最大长度',
    description: '允许输入的字符数量最多有多少个',
    types: [DATA_TYPES.NUM],
    default: null,
    nondrop: true,
  },
  prefix: {
    key: 'props.prefix',
    title: '前缀',
    types: [DATA_TYPES.STR, DATA_TYPES.EXP],
    default: '',
    nondrop: true,
  },
  suffix: {
    key: 'props.suffix',
    title: '后缀',
    types: [DATA_TYPES.STR, DATA_TYPES.EXP],
    default: '',
    nondrop: true,
  },
  placeholder: {
    key: 'props.placeholder',
    title: '提示语',
    types: [DATA_TYPES.STR, DATA_TYPES.EXP],
    default: '',
    nondrop: true,
  },
  keepAlive: {
    key: 'props.keepAlive',
    description: '是否仅仅是通过class隐藏本区块',
    types: [DATA_TYPES.BOOL],
    default: false,
    nondrop: true,
  },
};

Text.formastConfig = {
  title: '文字',
  type: 'Text',
  settings: [
    {
      key: 'children',
      title: '内容',
      description: '具体内容，换行请用\\n替代',
      types: [DATA_TYPES.STR],
      default: '内容',
      required: true,
    },
    {
      key: 'id',
    },
  ],
};

Button.formastConfig = {
  title: '按钮',
  type: 'Button',
  settings: [
    {
      key: 'bind',
    },
    {
      key: 'props.type',
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
      default: 'button',
    },
    {
      key: 'children',
      title: '文案',
      types: [DATA_TYPES.STR, DATA_TYPES.EXP],
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
    {
      key: 'id',
    },
  ],
};

Label.formastConfig = {
  title: '标签',
  type: 'Label',
  settings: [
    {
      key: 'bind',
    },
    {
      key: 'children',
      title: '文案',
      types: [DATA_TYPES.STR, DATA_TYPES.EXP],
      default: '字段名',
    },
    {
      key: 'props.class',
      description: 'Css样式表',
      types: [DATA_TYPES.STR, DATA_TYPES.EXP],
      default: '',
      nondrop: true,
    },
    {
      key: 'id',
    },
  ],
};

HBox.formastConfig = {
  title: '横向排版',
  type: 'HBox',
  settings: [
    {
      key: 'bind',
    },
    COMMON_CONFIGS.keepAlive,
    {
      key: 'props.class',
      description: 'Css样式表',
      types: [DATA_TYPES.STR],
      default: '',
      nondrop: true,
    },
    {
      key: 'id',
    },
  ],
  children: [],
};

VBox.formastConfig = {
  title: '竖向排版',
  type: 'VBox',
  settings: [
    {
      key: 'bind',
    },
    COMMON_CONFIGS.keepAlive,
    {
      key: 'props.class',
      description: 'Css样式表',
      types: [DATA_TYPES.STR],
      default: '',
      nondrop: true,
    },
    {
      key: 'id',
    },
  ],
  defaults: {
    onChange: noop,
  },
  children: [],
};

Input.formastConfig = {
  title: '单行文本',
  type: 'Input',
  settings: [
    {
      key: 'bind',
    },
    COMMON_CONFIGS.maxLength,
    COMMON_CONFIGS.prefix,
    COMMON_CONFIGS.suffix,
    COMMON_CONFIGS.placeholder,
    COMMON_CONFIGS.keepAlive,
    {
      key: 'props.type',
      title: '输入值类型',
      description: '对输入的值进行限定，界面上还是一模一样的输入框',
      options: [
        {
          label: '字符串',
          value: 'text',
        },
        {
          label: 'URL',
          value: 'url',
        },
        {
          label: 'Email',
          value: 'email',
        },
        {
          label: 'Search',
          value: 'search',
        },
        {
          label: '密码',
          value: 'password',
        },
      ],
      default: 'text',
      nondrop: true,
    },
    {
      key: 'id',
    },
  ],
  defaults: {
    onChange: noop,
  },
};

InputNumber.formastConfig = {
  title: '数字',
  type: 'InputNumber',
  settings: [
    {
      key: 'bind',
    },
    {
      key: 'props.max',
      title: '最大值',
      types: [DATA_TYPES.NUM],
      default: null,
      nondrop: true,
    },
    {
      key: 'props.min',
      title: '最小值',
      types: [DATA_TYPES.NUM],
      default: null,
      nondrop: true,
    },
    COMMON_CONFIGS.suffix,
    COMMON_CONFIGS.placeholder,
    COMMON_CONFIGS.keepAlive,
    {
      key: 'id',
    },
  ],
  defaults: {
    onChange: noop,
  },
};

Textarea.formastConfig = {
  title: '多行文本',
  type: 'Textarea',
  settings: [
    {
      key: 'bind',
    },
    COMMON_CONFIGS.maxLength,
    COMMON_CONFIGS.prefix,
    COMMON_CONFIGS.suffix,
    COMMON_CONFIGS.placeholder,
    COMMON_CONFIGS.keepAlive,
    {
      key: 'id',
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
    COMMON_CONFIGS.prefix,
    COMMON_CONFIGS.suffix,
    COMMON_CONFIGS.keepAlive,
    {
      key: 'id',
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
    COMMON_CONFIGS.prefix,
    COMMON_CONFIGS.suffix,
    COMMON_CONFIGS.keepAlive,
    {
      key: 'id',
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
    COMMON_CONFIGS.prefix,
    COMMON_CONFIGS.suffix,
    COMMON_CONFIGS.placeholder,
    COMMON_CONFIGS.keepAlive,
    {
      key: 'id',
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

Form.formastConfig = {
  title: '表单',
  type: 'Form',
  settings: [
    {
      key: 'props.action',
      title: '提交地址',
      types: [DATA_TYPES.STR, DATA_TYPES.EXP],
      default: '',
      nondrop: true,
    },
    {
      key: 'props.method',
      title: '提交方式',
      options: [
        {
          value: 'post',
        },
        {
          value: 'get',
        },
      ],
    },
    {
      key: 'props.onSubmit',
      title: '提交函数',
      types: [DATA_TYPES.EXP],
      fn: true,
      params: 'e',
      default: '{ onSubmit(e) }',
    },
  ],
  defaults: {
    onSubmit: noop,
  },
  children: true,
};

Group.formastConfig = {
  title: '组',
  type: 'Group',
  settings: [
    {
      key: 'bind',
    },
    {
      key: 'props.title',
      title: '组名',
      types: [DATA_TYPES.STR, DATA_TYPES.EXP],
      default: '组名',
      nondrop: true,
    },
    COMMON_CONFIGS.keepAlive,
    {
      key: 'id',
    },
  ],
  children: [],
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
    COMMON_CONFIGS.suffix,
    COMMON_CONFIGS.keepAlive,
    {
      key: 'id',
    },
  ],
  direction: 'h',
  children: [],
};

Loop.formastConfig = {
  title: '循环',
  type: 'Loop',
  settings: [
    {
      key: 'bind',
    },
  ],
  children: ['item', 'index'],
  template: (props) => { // eslint-disable-line
    return (
      <div className={classnames('loop')} {...props} />
    );
  },
};

const groups = [
  {
    title: '布局组件',
    items: [
      Form,
      Group,
      Item,
      HBox,
      VBox,
      Loop,
    ],
  },
  {
    title: '原子组件',
    items: [
      Label,
      Input,
      InputNumber,
      Textarea,
      Checkboxes,
      Radios,
      Select,
      Button,
      Text,
    ],
  },
];

export const layout = {
  groups,
};
