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
    if (!(!ctx.data.props.hidden || ctx.data.props.keepAlive)) {
      return null;
    }
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
      type: ctx.data.props.type || 'button',
    },
    classes: [ctx.data.props.disabled ? classnames('button--disabled') : ''],
  })),
}, ButtonConfig);

export const HBox = connectVueComponent({
  functional: true,
  render: genRender('div', 'horizontal-box', ctx => ({
    classes: [ctx.data.props.hidden ? classnames('horizontal-box--hidden') : ''],
  })),
}, HBoxConfig);

export const VBox = connectVueComponent({
  functional: true,
  render: genRender('div', 'vertical-box', ctx => ({
    classes: [ctx.data.props.hidden ? classnames('vertical-box--hidden') : ''],
  })),
}, VBoxConfig);

function genInputRender(type, getAttrs, onInput) {
  return function (h, ctx) {
    if (!(!ctx.data.props.hidden || ctx.data.props.keepAlive)) {
      return null;
    }
    return h('label', genData(ctx, [createClassNames(type, ctx.data.props)]), [
      ctx.data.props.prefix ? h('span', {  class: classnames(`element__prefix ${type}__prefix`) }, ctx.data.props.prefix) : null,
      h('input', {
        class: classnames(`element__content ${type}__content`),
        attrs: {
          type: ctx.data.attrs.type || ctx.data.props.type,
          value: ctx.data.attrs.value || ctx.data.props.value,
          ...(getAttrs ? getAttrs(ctx) : {}),
        },
        props: {
          disabled: ctx.data.attrs.disabled || ctx.data.props.disabled,
          readonly: ctx.data.attrs.readonly || ctx.data.props.readonly,
          required: ctx.data.attrs.required || ctx.data.props.required,
        },
        on: {
          input(e) {
            const value = onInput ? onInput(e.target.value) : e.target.value;
            ctx.data.props.onChange?.(value);
            ctx.data.on.change?.(e);
          },
        },
      }),
      ctx.data.props.suffix ? h('span', { class: classnames(`element__suffix ${type}__suffix`) }, ctx.data.props.suffix) : null,
    ]);
  };
}

export const Input = connectVueComponent({
  props: ['type', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value', 'onChange'],
  functional: true,
  render: genInputRender(
    'input',
    ctx => ({
      type: ctx.data.attrs.type || ctx.data.props.type,
      'max-length': ctx.data.attrs.maxLength || ctx.data.props.maxLength,
    }),
  ),
}, InputConfig);

export const InputNumber = connectVueComponent({
  props: ['prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'max', 'min', 'highlight', 'keepAlive', 'value', 'onChange'],
  functional: true,
  render: genInputRender(
    'input-number',
    ctx => ({
      type: 'number',
      max: ctx.data.attrs.max || ctx.data.props.max,
      min: ctx.data.attrs.min || ctx.data.props.min,
    }),
    value => +value,
  ),
}, InputNumberConfig);

export const Textarea = connectVueComponent({
  props: ['prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value', 'onChange'],
  functional: true,
  render: genInputRender(
    'textarea',
    ctx => ({
      'max-length': ctx.data.attrs.maxLength || ctx.data.props.maxLength,
    }),
  ),
}, TextAreaConfig);

function genOptionsRender(type, renderOptions) {
  return function (h, ctx) {
    if (!(!ctx.data.props.hidden || ctx.data.props.keepAlive)) {
      return null;
    }
    let items = null;
    return h('span', { class: createClassNames(type, ctx.data.props) }, [
      ctx.data.props.prefix ? h('span', {  class: classnames(`element__prefix ${type}__prefix`) }, ctx.data.props.prefix) : null,
      ...(items = renderOptions(ctx.data.props.options, h, ctx), isArray(items) ? items : [items]),
      ctx.data.props.suffix ? h('span', { class: classnames(`element__suffix ${type}__suffix`) }, ctx.data.props.suffix) : null,
    ]);
  };
}

function getValueKey(ctx) {
  return ctx.data.attrs.valueKey || ctx.data.props.valueKey || 'value';
}

function isChecked(option, ctx) {
  const value = ctx.data.props.value || ctx.data.attrs.value; // 当前被选中项
  const key = getValueKey(ctx);

  const isEqual = (option, value) => {
    if (option === value) {
      return true;
    }

    const ov = option[key];
    if (ov === value) {
      return true;
    }
    if (isNumber(ov) && ov === +value) {
      return true;
    }

    if (value && typeof vlaue === 'object') {
      const iv = value[key];
      if (ov === iv) {
        return true;
      }
      if (isNumber(ov) && ov === +iv) {
        return true;
      }
    }

    return false;
  };

  if (isArray(value)) {
    return value.some(item => isEqual(option, item));
  }

  return isEqual(option, value);
}

export const RadioGroup = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive', 'onChange'],
  functional: true,
  render: genOptionsRender('radios', (options, h, ctx) => options.map((option) => {
    const vKey = getValueKey(ctx);
    const value = option[vKey];
    return h(
      'label',
      {
        key: option[getValueKey(ctx)],
        class: classnames('element__content radios__content'),
      },
      [
        h('input', {
          attrs: {
            type: 'radio',
            name: ctx.data.attrs.name || ctx.data.props.name,
          },
          props: {
            disabled: option.disabled || ctx.data.attrs.disabled || ctx.data.props.disabled,
            checked: isChecked(option, ctx),
          },
          on: {
            change(e) {
              ctx.data.props.onChange?.(value, option);
              ctx.data.on.change?.(e);
            },
          },
        }),
        h('span', null, option[ctx.data.attrs.labelKey || ctx.data.props.labelKey || 'label'] || value),
      ],
    );
  })),
}, RadioGroupConfig);

export const CheckboxGroup = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive', 'onChange'],
  functional: true,
  render: genOptionsRender('checkboxes', (options, h, ctx) => {
    const mapping = {};
    const vKey = getValueKey(ctx);
    options.forEach((option) => {
      const value = option[vKey];
      mapping[value] = option;
    });

    return options.map((option) => {
      const value = option[vKey];
      return h(
        'label',
        {
          key: value,
          class: classnames('element__content checkboxes__content'),
        },
        [
          h('input', {
            attrs: {
              type: 'checkbox',
            },
            props: {
              disabled: option.disabled || ctx.data.attrs.disabled || ctx.data.props.disabled,
              checked: isChecked(option, ctx),
            },
            on: {
              change(e) {
                // 当前被选中的所有options
                const selectedValues = ctx.data.props.value;
                const selectedItems = selectedValues.map(value => mapping[value]);

                let nextItems = [];
                if (isChecked(option, ctx)) {
                  nextItems = selectedItems.filter(item => item !== option);
                } else {
                  nextItems = [...selectedItems, option];
                }

                const nextValues = nextItems.map(item => item[vKey]);

                ctx.data.props.onChange?.(nextValues, nextItems);
                ctx.data.on.change?.(e);
              },
            },
          }),
          h('span', null, option[ctx.data.attrs.labelKey || ctx.data.props.labelKey || 'label'] || value),
        ],
      );
    });
  }),
}, CheckboxGroupConfig);

export const Select = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive', 'onChange'],
  functional: true,
  render: genOptionsRender('select', (options, h, ctx) => {
    const vKey = getValueKey(ctx);
    return h(
      'select',
      {
        class: classnames('element__content select__content'),
      },
      options.map((option) => {
        const value = option[vKey];
        return h(
          'option',
          {
            key: value,
            props: {
              disabled: option.disabled || ctx.data.attrs.disabled || ctx.data.props.disabled,
              selected: isChecked(option, ctx),
            },
            on: {
              change(e) {
                ctx.data.props.onChange?.(value, option);
                ctx.data.on.change?.(e);
              },
            },
          },
          option[ctx.data.attrs.labelKey || ctx.data.props.labelKey || 'label'] || value,
        );
      }),
    );
  }),
}, SelectConfig);

export const Form = connectVueComponent({
  functional: true,
  render: genRender('form', 'form'),
}, FormConfig);

export const FormGroup = connectVueComponent({
  props: ['title', 'hidden', 'keepAlive'],
  functional: true,
  render(h, ctx) {
    if (!(!ctx.data.props.hidden || ctx.data.props.keepAlive)) {
      return null;
    }
    return h('div', {
      class: classnames('group', ctx.data.props.hidden ? 'group--hidden' : ''),
    }, [
      ctx.data.props.title ? h('div', { class: classnames('group__title') }, ctx.data.props.title) : null,
      ...(ctx.children || []),
    ]);
  },
}, FormGroupConfig);

export const FormItem = connectVueComponent({
  props: ['hidden', 'highlight', 'errors', 'label', 'suffix'],
  functional: true,
  render(h, ctx) {
    if (!(!ctx.data.props.hidden || ctx.data.props.keepAlive)) {
      return null;
    }
    return h('div', {
      class: classnames('item', ctx.data.props.hidden ? 'item--hidden' : '', ctx.data.props.highlight ? 'item--highlight' : '', ctx.data.props.errors.length ? 'item--error' : '', !ctx.data.props.label ? 'item--no-label' : ''),
    }, [
      h('div', { class: classnames('item__label') }, ctx.data.props.label),
      h('div', { class: classnames('item__content') }, ctx.children),
      ctx.data.props.suffix ? h('div', { class: classnames('item__suffix') }, ctx.data.props.suffix) : null,
    ]);
  },
}, FormItemConfig);

export const Loop = connectVueComponent({
  props: ['items'],
  functional: true,
  render(h) {
    // TODO
    return h('div', { class: classnames('loop') });
  },
}, LoopConfig);
