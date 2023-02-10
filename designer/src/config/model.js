import { VALUE_TYPES } from './constants.js'
import { TySheMo } from 'nautil'

export const SchemaAttributes = [
  {
    key: 'label',
    title: '显示名',
    types: [VALUE_TYPES.STR],
    value: '',
  },
  {
    key: 'type',
    title: '数据类型',
    types: [VALUE_TYPES.ENUM, VALUE_TYPES.STR, VALUE_TYPES.EXP],
    options: Object.keys(TySheMo.Parser.defaultTypes).map(value => ({ text: value, value })),
    value: 'string',
  },
  {
    key: 'default',
    title: '默认值',
    types: [VALUE_TYPES.STR, VALUE_TYPES.EXP, VALUE_TYPES.FN],
    value: '',
  },
  {
    key: 'required',
    title: '是否必填',
    types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
    value: false,
  },
  {
    key: 'readonly',
    title: '是否只读',
    types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
    value: false,
  },
  {
    key: 'disabled',
    title: '是否禁用',
    types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
    value: false,
  },
  {
    key: 'hidden',
    title: '是否隐藏',
    types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
    value: false,
  },
  {
    key: 'validators',
    title: '校验器',
    value: [],
  },
  {
    key: 'placeholder',
    title: '提示',
    types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    value: '',
  },
  {
    key: 'to',
    title: '提交为',
    placeholder: '提交时的字段名，选填',
    types: [VALUE_TYPES.STR],
    value: '',
    emptyDrop: true,
  },
]