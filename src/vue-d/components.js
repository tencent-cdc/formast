import { connectVueComponent } from '../vue/index.js';
import { TextConfig, LabelConfig, ButtonConfig, HBoxConfig, VBoxConfig, InputConfig, InputNumberConfig, TextAreaConfig, RadioGroupConfig, CheckboxGroupConfig, SelectConfig, FormConfig, FormGroupConfig, FormItemConfig, LoopConfig } from '../_shared/component-configs.js';
import { classnames, createClassNames } from '../_shared/utils.js';
import { isNumber, isUndefined, isArray, isFunction } from 'ts-fns';

function genChildren(ctx) {
  const { children, props } = ctx;
  const { children: propChildren } = props;

  if (!isUndefined(propChildren)) {
    return propChildren;
  }

  return children;
}

function genData(
  ctx,
  classes,
  fn,
) {
  const {
    attrs = {},
    props = {},
    events = {},
    classes: penddingClasses = [],
    directives = [],
  } = isFunction(fn) ? fn(ctx) : fn || {};
  const res = {
    ...ctx.data,
    class: [
      ctx.data.class,
      ...classes,
      ...penddingClasses,
    ],
    props: {
      ...(ctx.data.props || {}),
      ...props,
    },
    attrs: {
      ...(ctx.data.attrs || {}),
      ...attrs,
    },
    on: {
      ...(ctx.data.on || {}),
      ...events,
    },
    directives: [
      ...(ctx.data.directives || []),
      ...directives,
    ],
  };
  return res;
}

function genRender(tag, classes, fn) {
  return function (h, ctx) {
    return h(
      tag,
      genData(ctx, isArray(classes) ? classes.map(item => classnames(item)) : [classnames(classes)], fn),
      genChildren(ctx),
    );
  };
}

export const Text = connectVueComponent({
  functional: true,
  render: genRender('span', 'text'),
}, TextConfig);

export const Label = connectVueComponent({
  functional: true,
  render: genRender('label', 'label'),
}, LabelConfig);

export const Button = connectVueComponent({
  functional: true,
  render: genRender('button', 'button', ctx => ({
    attrs: {
      type: ctx.props.type || 'button',
    },
    classes: [ctx.props.disabled ? classnames('button--disabled') : ''],
  })),
}, ButtonConfig);

export const HBox = connectVueComponent({
  functional: true,
  render: genRender('div', 'horizontal-box', ctx => ({
    classes: [ctx.props.hidden ? classnames('horizontal-box--hidden') : ''],
    directives: [
      {
        name: 'v-if',
        expression: '!hidden || keepAlive',
        value: !ctx.props.hidden || ctx.props.keepAlive,
      },
    ],
  })),
}, HBoxConfig);

export const VBox = connectVueComponent({
  functional: true,
  render: genRender('div', 'vertical-box', ctx => ({
    classes: [ctx.props.hidden ? classnames('vertical-box--hidden') : ''],
    directives: [
      {
        name: 'v-if',
        expression: '!hidden || keepAlive',
        value: !ctx.props.hidden || ctx.props.keepAlive,
      },
    ],
  })),
}, VBoxConfig);

export const Input = connectVueComponent({
  functional: true,
  render(h, ctx) {
    return h('label', genData(ctx, [createClassNames('input', ctx.data.props)], {
      directives: [
        {
          name: 'v-if',
          expression: '!hidden || keepAlive',
          value: !ctx.props.hidden || ctx.props.keepAlive,
        },
      ],
    }), [
      h('span', {
        class: classnames('element__prefix input__prefix'),
        directives: [
          {
            name: 'v-if',
            expression: 'prefix',
            value: ctx.props.prefix,
          },
        ],
      }, ctx.props.prefix),
      h('input', {
        class: classnames('element__content input__content'),
        attrs: {
          type: ctx.props.type,
          'max-length': ctx.props.maxLength,
          value: ctx.props.value,
        },
        props: {
          disabled: ctx.props.disabled,
          readonly: ctx.props.readonly,
          required: ctx.props.required,
        },
        on: {
          input(e) {
            ctx.data.on.change?.(e.target.value);
          },
        },
      }),
      h('span', {
        class: classnames('element__suffix input__suffix'),
        directives: [
          {
            name: 'v-if',
            expression: 'suffix',
            value: ctx.props.suffix,
          },
        ],
      }, ctx.props.suffix),
      ...(ctx.children || []),
    ]);
  },
  // eslint-disable-next-line max-len
  // props: ['type', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value', 'onChange'],
}, InputConfig);

export const InputNumber = connectVueComponent({
  props: ['prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value', 'onChange'],
  template: `
    <label v-if="!hidden || keepAlive" :class="createClassNames('input', $props)">
      <span v-if="prefix" :class="classnames('element__prefix input__prefix')">{{prefix}}</span>
      <input type="number" :class="classnames('element__content input__content')" :disabled="disabled" :readonly="readonly" :required="required" :maxLength="maxLength" :value="value" @input="handleInput" />
      <span v-if="suffix" :class="classnames('element__suffix input__suffix')">{{suffix}}</span>
      <slot />
    </label>
  `,
  methods: {
    classnames,
    createClassNames,
    handleInput(e) {
      this.$emit('change', e);
      this.onChange?.(+e.target.value);
    },
  },
}, InputNumberConfig);

export const Textarea = connectVueComponent({
  props: ['type', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value'],
  template: `
    <label v-if="!hidden || keepAlive" :class="createClassNames('textarea', $props)">
      <span v-if="prefix" :class="classnames('element__prefix input__prefix')">{{prefix}}</span>
      <textarea :class="classnames('element__content textarea__content')" :disabled="disabled" :readonly="readonly" :required="required" :maxLength="maxLength" :value="value" @input="$emit('change', $event)" />
      <span v-if="suffix" :class="classnames('element__suffix input__suffix')">{{suffix}}</span>
      <slot />
    </label>
  `,
  methods: { classnames, createClassNames },
}, TextAreaConfig);

export const RadioGroup = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive'],
  template: `
    <span v-if="!hidden || keepAlive" :class="createClassNames('radios', $props)">
      <span v-if="prefix" :class="classnames('element__prefix radios__prefix')">{{prefix}}</span>
      <label :class="classnames('element__content radios__content')" v-for="option in options" :key="option[vKey]">
        <input type="radio" :name="name" :disabled="disabled || option.disabled" :checked="isChecked(option)" :readonly="readonly" :required="required" :value="value" @change="$emit('change', $event, option)" />
        <span>{{option[labelKey || vKey]}}</span>
      </label>
      <span v-if="suffix" :class="classnames('element__suffix radios__suffix')">{{suffix}}</span>
    </span>
  `,
  computed: {
    vKey() {
      return this.valueKey || 'value';
    },
  },
  methods: {
    classnames,
    createClassNames,
    isChecked(option) {
      if (option === this.value) {
        return true;
      }

      const value = option[this.vKey];
      if (isNumber(value)) {
        return value === +this.value;
      }

      return value === this.value;
    },
  },
}, RadioGroupConfig);

export const CheckboxGroup = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive'],
  template: `
    <span v-if="!hidden || keepAlive" :class="createClassNames('radios', $props)">
      <span v-if="prefix" :class="classnames('element__prefix radios__prefix')">{{prefix}}</span>
      <label :class="classnames('element__content radios__content')" v-for="option in options" :key="option[vKey]">
        <input type="checkbox" :name="name" :disabled="disabled || option.disabled" :checked="isChecked(option)" :readonly="readonly" :required="required" :value="value" @change="$emit('change', $event, option)" />
        <span>{{option[labelKey || vKey]}}</span>
      </label>
      <span v-if="suffix" :class="classnames('element__suffix radios__suffix')">{{suffix}}</span>
    </span>
  `,
  computed: {
    vKey() {
      return this.valueKey || 'value';
    },
  },
  methods: {
    classnames,
    createClassNames,
    isChecked(option) {
      return this.value.some((item) => {
        if (item === option) {
          return true;
        }

        const value = option[this.vKey];
        if (isNumber(value)) {
          return value === +item;
        }

        return value === item;
      });
    },
  },
}, CheckboxGroupConfig);

export const Select = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive'],
  template: `
    <span v-if="!hidden || keepAlive" :class="createClassNames('radios', $props)">
      <span v-if="prefix" :class="classnames('element__prefix radios__prefix')">{{prefix}}</span>
      <select :class="classnames('element__content radios__content')">
        <option v-for="option in options" :key="option[vKey]" :disabled="disabled || option.disabled" :checked="isSelected(option)" :readonly="readonly" :required="required" :value="value" @change="$emit('change', $event, option)">{{option[labelKey || vKey]}}</option>
      </select>
      <span v-if="suffix" :class="classnames('element__suffix radios__suffix')">{{suffix}}</span>
    </span>
  `,
  computed: {
    vKey() {
      return this.valueKey || 'value';
    },
  },
  methods: {
    classnames,
    createClassNames,
    isSelected(option) {
      if (this.value === option) {
        return true;
      }


      const value = option[this.vKey];
      if (isNumber(value)) {
        return value === +this.value;
      }

      return value === this.value;
    },
  },
}, SelectConfig);

export const Form = connectVueComponent({
  functional: true,
  render(h, ctx) {
    return h('form', {
      ...ctx.data,
      class: {
        ...ctx.data.class,
        [classnames('form')]: true,
      },
    }, ctx.children);
  },
}, FormConfig);

export const FormGroup = connectVueComponent({
  props: ['title', 'hidden', 'keepAlive'],
  template: `
    <div v-if="!hidden || keepAlive" :class="classnames('group', className, hidden ? 'group--hidden' : ''">
      <div v-if="title" :class="classnames('group__title')">{{title}}</div>
      <slot />
    </div>
  `,
  methods: { classnames },
}, FormGroupConfig);

export const FormItem = connectVueComponent({
  props: ['hidden', 'highlight', 'errors', 'label', 'suffix'],
  template: `
    <div :class="classnames('item', hidden ? 'item--hidden' : '', highlight ? 'item--highlight' : '', errors.length ? 'item--error' : '', !label ? 'item--no-label' : '')">
      <div :class="classnames('item__label')">{label}</div>
      <div :class="classnames('item__content')"><slot /></div>
      <div :class="classnames('item__suffix')" v-if="suffix"></div>
    </div>
  `,
  methods: { classnames },
}, FormItemConfig);

export const Loop = connectVueComponent({
  props: ['items'],
  template: `
    <div class="${classnames('loop')}">
      // TODO
    </div>
  `,
}, LoopConfig);
