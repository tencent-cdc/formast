import { React } from 'nautil'
import { unmount, render } from 'nautil/dom'
import { VALUE_TYPES, COMPONENT_TYPES } from './constants.js'
import { Input, Textarea, FormItem, FormGroup, Radio, Select, Checkbox, InputNumber, FormLoop, Button } from 'formast/react-components'
import { Popup } from '../libs/popup.js'

export const InputConfig = {
  id: 'Input',
  type: COMPONENT_TYPES.ATOM,

  title: '输入框',
  icon: 'BsPhoneLandscape',

  tag: 'atom',
  needs: ['FormItem'],

  props: [
    {
      key: 'type',
      types: [VALUE_TYPES.ENUM],
      value: 'text',
      options: [
        { text: '文本', value: 'text' },
        { text: '数字', value: 'number' },
        { text: 'URL', value: 'url' },
        { text: 'EMail', value: 'email' },
        { text: 'Range', value: 'range' },
        { text: '日期', value: 'date' },
        { text: '时间', value: 'time' },
        { text: '周', value: 'week' },
        { text: '月份', value: 'month' },
        { text: '电话', value: 'tel' },
        { text: '文件', value: 'file' },
        { text: '密码', value: 'password' },
        { text: '搜索', value: 'search' },
      ],
    },
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
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
      key: 'readonly',
      title: '是否只读',
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
      key: 'highlight',
      title: '是否高亮',
      description: '多出一些样式，例如当出现错误时，边框处理成红色，可通过该功能实现',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
    {
      key: 'after',
      title: '单位',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
      emptyDrop: true,
    },
  ],

  fromMetaToProps(field, meta, monitor) {
    return {
      value: `{ ${field}.value }`,
      'onChange(e)': `{ ${field}.value = e.target.value }`,
      placeholder: `{ ${field}.placeholder }`,
      required: `{ ${field}.required }`,
      disabled: `{ ${field}.disabled }`,
      readonly: `{ ${field}.readonly }`,
      hidden: `{ ${field}.hidden }`,
    }
  },

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, type, after, required, disabled, readonly, hidden, highlight } = props
    render(el, <Input type={type} placeholder={placeholder} after={after} required={required} disabled={disabled} readonly={readonly} hidden={hidden} highlight={highlight} keepAlive />)
  },
  unmount(el) {
    unmount(el)
  },
}

export const InputNumberConfig = {
  id: 'InputNumber',
  type: COMPONENT_TYPES.ATOM,

  title: '数字',
  icon: 'BsAspectRatio',

  tag: 'atom',
  needs: ['FormItem'],

  props: [
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
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
      key: 'readonly',
      title: '是否只读',
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
      key: 'after',
      title: '单位',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
      emptyDrop: true,
    },
    {
      key: 'highlight',
      title: '是否高亮',
      description: '多出一些样式，例如当出现错误时，边框处理成红色，可通过该功能实现',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  fromMetaToProps(field, meta, monitor) {
    return {
      value: `{ ${field}.value }`,
      'onChange(e)': `{ ${field}.value = e.target.value }`,
      placeholder: `{ ${field}.placeholder }`,
      after: `{ ${field}.unit }`,
      required: `{ ${field}.required }`,
      disabled: `{ ${field}.disabled }`,
      readonly: `{ ${field}.readonly }`,
      hidden: `{ ${field}.hidden }`,
    }
  },

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, after, required, disabled, readonly, hidden, highlight } = props
    render(el, <InputNumber placeholder={placeholder} after={after} required={required} disabled={disabled} readonly={readonly} hidden={hidden} highlight={highlight} keepAlive />)
  },
  unmount(el) {
    unmount(el)
  },
}

export const TextareaConfig = {
  id: 'Textarea',
  type: COMPONENT_TYPES.ATOM,

  title: '多行文本',
  icon: 'BsCardText',

  tag: 'atom',
  needs: ['FormItem'],

  props: [
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
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
      key: 'readonly',
      title: '是否只读',
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
      key: 'highlight',
      title: '是否高亮',
      description: '多出一些样式，例如当出现错误时，边框处理成红色，可通过该功能实现',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  fromMetaToProps(field, meta, monitor) {
    return {
      value: `{ ${field}.value }`,
      'onChange(e)': `{ ${field}.value = e.target.value }`,
      placeholder: `{ ${field}.placeholder }`,
      required: `{ ${field}.required }`,
      disabled: `{ ${field}.disabled }`,
      readonly: `{ ${field}.readonly }`,
      hidden: `{ ${field}.hidden }`,
    }
  },

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, required, disabled, readonly, hidden, highlight } = props
    render(el, <Textarea placeholder={placeholder} required={required} disabled={disabled} readonly={readonly} hidden={hidden} highlight={highlight} keepAlive />)
  },
  unmount(el) {
    unmount(el)
  },
}

export const SelectConfig = {
  id: 'Select',
  type: COMPONENT_TYPES.ATOM,

  title: '下拉',
  icon: 'BsListCheck',

  tag: 'atom',
  needs: ['FormItem'],

  props: [
    {
      key: 'options',
      title: '选项列表',
      types: [VALUE_TYPES.EXP],
      defender: value => Array.isArray(value) && !value.some(item => !('text' in item && 'value' in item)) ? value : [],
    },
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
      value: '请选择',
    },
    {
      key: 'required',
      title: '是否必填',
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
      key: 'readonly',
      title: '是否只读',
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
      key: 'highlight',
      title: '是否高亮',
      description: '多出一些样式，例如当出现错误时，边框处理成红色，可通过该功能实现',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  fromMetaToProps(field, meta, monitor) {
    return {
      value: `{ ${field}.value }`,
      'onChange(e)': `{ ${field}.value = e.target.value }`,
      placeholder: `{ ${field}.placeholder }`,
      required: `{ ${field}.required }`,
      disabled: `{ ${field}.disabled }`,
      readonly: `{ ${field}.readonly }`,
      hidden: `{ ${field}.hidden }`,
    }
  },

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const defaultOptions = [
      { text: '选项一', value: 1 },
      { text: '选项二', value: 2 },
      { text: '选项三', value: 3 },
    ]
    const { placeholder, required, disabled, readonly, hidden, highlight } = props
    const options = props.options && props.options.length ? props.options : defaultOptions
    render(el, <Select options={options} placeholder={placeholder} required={required} disabled={disabled} readonly={readonly} hidden={hidden} highlight={highlight} keepAlive />)
  },
  unmount(el) {
    unmount(el)
  },
}

export const RadioConfig = {
  id: 'Radio',
  type: COMPONENT_TYPES.ATOM,

  title: '单选组',
  icon: 'BsCheckCircle',

  tag: 'atom',
  needs: ['FormItem'],

  props: [
    {
      key: 'options',
      title: '选项列表',
      types: [VALUE_TYPES.EXP],
      defender: value => Array.isArray(value) && !value.some(item => !('text' in item && 'value' in item)) ? value : [],
    },
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
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
      key: 'readonly',
      title: '是否只读',
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
      key: 'highlight',
      title: '是否高亮',
      description: '多出一些样式，例如当出现错误时，边框处理成红色，可通过该功能实现',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  fromMetaToProps(field, meta, monitor) {
    return {
      value: `{ ${field}.value }`,
      'onChange(e)': `{ ${field}.value = e.target.value }`,
      placeholder: `{ ${field}.placeholder }`,
      disabled: `{ ${field}.disabled }`,
      readonly: `{ ${field}.readonly }`,
      hidden: `{ ${field}.hidden }`,
    }
  },

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const defaultOptions = [
      { text: '选项一', value: 1 },
      { text: '选项二', value: 2 },
      { text: '选项三', value: 3 },
    ]
    const { placeholder, required, disabled, readonly, hidden, highlight } = props
    const options = props.options && props.options.length ? props.options : defaultOptions
    render(el, <Radio options={options} placeholder={placeholder} required={required} disabled={disabled} readonly={readonly} hidden={hidden} highlight={highlight} keepAlive />)
  },
  unmount(el) {
    unmount(el)
  },
}

export const CheckboxConfig = {
  id: 'Checkbox',
  type: COMPONENT_TYPES.ATOM,

  title: '多选组',
  icon: 'BsCheckBox',

  tag: 'atom',
  needs: ['FormItem'],

  props: [
    {
      key: 'options',
      title: '选项列表',
      types: [VALUE_TYPES.EXP],
      defender: value => Array.isArray(value) && !value.some(item => !('text' in item && 'value' in item)) ? value : [],
    },
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
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
      key: 'readonly',
      title: '是否只读',
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
      key: 'highlight',
      title: '是否高亮',
      description: '多出一些样式，例如当出现错误时，边框处理成红色，可通过该功能实现',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  fromMetaToProps(field, meta, monitor) {
    return {
      value: `{ ${field}.value }`,
      'onChange(e)': `{ ${field}.value = e.target.value }`,
      placeholder: `{ ${field}.placeholder }`,
      disabled: `{ ${field}.disabled }`,
      readonly: `{ ${field}.readonly }`,
      hidden: `{ ${field}.hidden }`,
    }
  },

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const defaultOptions = [
      { text: '选项一', value: 1 },
      { text: '选项二', value: 2 },
      { text: '选项三', value: 3 },
    ]
    const { placeholder, required, disabled, readonly, hidden, highlight } = props
    const options = props.options && props.options.length ? props.options : defaultOptions
    render(el, <Checkbox options={options} placeholder={placeholder} required={required} disabled={disabled} readonly={readonly} hidden={hidden} highlight={highlight} keepAlive />)
  },
  unmount(el) {
    unmount(el)
  },
}

export const FormGroupConfig = {
  id: 'FormGroup',
  type: COMPONENT_TYPES.VIEW,

  title: '组',
  icon: 'BsLayers',

  allows: ['FormItem', 'FormGroup', 'FormLoop'], // 组可以再嵌套组

  props: [
    {
      key: 'title',
      title: '标题',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
      value: '组名',
    },
    {
      key: 'hidden',
      title: '是否隐藏',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  mount(el, monitor) {
    const { DropBox } = monitor
    const props = monitor.getComputedProps()
    const { title, hidden } = props
    render(el, <FormGroup title={title} hidden={hidden} keepAlive><DropBox /></FormGroup>)
  },
  unmount(el) {
    unmount(el)
  },
}

export const FormItemConfig = {
  id: 'FormItem',
  type: COMPONENT_TYPES.VIEW,

  title: '项',
  icon: 'BsTable',
  direction: 'h',

  allows: ['tag:atom'],

  props: [
    {
      key: 'label',
      title: '名称',
      types: [VALUE_TYPES.STR],
      value: '字段名',
    },
    {
      key: 'hidden',
      title: '是否隐藏',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
    {
      key: 'errors',
      title: '错误',
      types: [VALUE_TYPES.EXP],
      value: '',
    }
  ],

  renderFn: 'render()',

  mount(el, monitor) {
    const { DropBox } = monitor
    const props = monitor.getComputedProps()
    const { label, hidden, errors } = props
    render(el, <FormItem label={label} hidden={hidden} errors={errors} keepAlive><DropBox /></FormItem>)
  },
  unmount(el) {
    unmount(el)
  },
}

export const FormLoopConfig = {
  id: 'FormLoop',
  type: COMPONENT_TYPES.ATOM,

  title: '循环',
  icon: 'BsShuffle',
  max: 1,

  allows: ['FormGroup', 'FormItem'],

  props: [
    {
      key: 'items',
      title: '循环对象',
      types: [VALUE_TYPES.EXP],
      value: '',
    },
  ],

  fromMetaToProps(field) {
    return {
      items: `{ ${field} }`,
    }
  },

  loopItemsKey: 'items',
  renderFn(itemsKey) {
    if (!itemsKey) {
      return 'render(item,i)'
    }

    return `render(${itemsKey}Item,i)`
  },

  mount(el, monitor) {
    const { DropBox } = monitor
    const props = monitor.getComputedProps()
    render(el, <FormLoop
      items={[]}
      footer={<Button onClick={() => Popup.toast('仅做效果预览，无实际功能')}>新增</Button>}
      empty={(
        <div className="formast__form-loop__preview">
          <DropBox />
          <Button>删除</Button>
        </div>
      )}
    />)
  },
  unmount(el) {
    unmount(el)
  },
}
