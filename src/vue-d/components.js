import { connectVueComponent } from '../vue/index.js';
import { TextConfig, LabelConfig, ButtonConfig, HBoxConfig, VBoxConfig, InputConfig, InputNumberConfig, TextAreaConfig, RadioGroupConfig, CheckboxGroupConfig, SelectConfig, FormConfig, FormGroupConfig, FormItemConfig, LoopConfig } from '../_shared/component-configs.js';
import { classnames, createClassNames } from '../_shared/utils.js';
import { isNumber } from 'ts-fns';

export const Text = connectVueComponent({
  template: `<span class="${classnames('text')}"><slot /></span>`,
}, TextConfig);

export const Label = connectVueComponent({
  template: `<label class="${classnames('label')}"><slot /></label>`,
}, LabelConfig);

export const Button = connectVueComponent({
  props: ['type', 'disabled'],
  template: '<button :type="type || \'button\'" :class="classnames(\'button\', disabled ? \'button--disabled\' : \'\')"><slot /></button>',
  methods: { classnames },
}, ButtonConfig);

export const HBox = connectVueComponent({
  props: ['hidden', 'keepAlive'],
  template: '<div v-if="!hidden || keepAlive" :class="classnames(\'horizontal-box\', hidden ? \'horizontal-box--hidden\' : \'\')"><slot /></div>',
  methods: { classnames },
}, HBoxConfig);

export const VBox = connectVueComponent({
  props: ['hidden', 'keepAlive'],
  template: '<div v-if="!hidden || keepAlive" :class="classnames(\'vertical-box\', hidden ? \'vertical-box--hidden\' : \'\')"><slot /></div>',
  methods: { classnames },
}, VBoxConfig);

export const Input = connectVueComponent({
  props: ['type', 'bind', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value'],
  template: `
    <label v-if="!hidden || keepAlive" :class="createClassNames('input', $props)">
      <span v-if="prefix" :class="classnames('element__prefix input__prefix')">{{prefix}}</span>
      <input :class="classnames('element__content input__content')" :type="type" :disabled="disabled" :readonly="readonly" :required="required" :maxLength="maxLength" :value="value" @input="$emit('change', $event)" />
      <span v-if="suffix" :class="classnames('element__suffix input__suffix')">{{suffix}}</span>
      <slot />
    </label>
  `,
  methods: { classnames, createClassNames },
}, InputConfig);

export const InputNumber = connectVueComponent({
  props: ['bind', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value'],
  template: `
    <label v-if="!hidden || keepAlive" :class="createClassNames('input', $props)">
      <span v-if="prefix" :class="classnames('element__prefix input__prefix')">{{prefix}}</span>
      <input type="number" :class="classnames('element__content input__content')" :disabled="disabled" :readonly="readonly" :required="required" :maxLength="maxLength" :value="value" @input="$emit('change', $event)" />
      <span v-if="suffix" :class="classnames('element__suffix input__suffix')">{{suffix}}</span>
      <slot />
    </label>
  `,
}, InputNumberConfig);

export const Textarea = connectVueComponent({
  props: ['type', 'bind', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'maxLength', 'highlight', 'keepAlive', 'value'],
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
  props: ['options', 'valueKey', 'labelKey', 'bind', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive'],
  template: `
    <span v-if="!hidden || keepAlive" :class="createClassNames('radios', $props)">
      <span v-if="prefix" :class="classnames('element__prefix radios__prefix')">{{prefix}}</span>
      <label :class="classnames('element__content radios__content')" v-repeat="option in options" :key="option[valueKey]">
        <input type="radio" :name="name" :disabled="disabled || item.disabled" :checked="isChecked(option)" :readonly="readonly" :required="required" :value="value" @change="$emit('change', $event, option)" />
        <span>{{option[labelKey || valueKey]}}</span>
      </label>
      <span v-if="suffix" :class="classnames('element__suffix radios__suffix')">{{suffix}}</span>
    </span>
  `,
  methods: {
    classnames,
    createClassNames,
    isChecked(option) {
      if (option === this.value) {
        return true;
      }

      const value = option[this.valueKey];
      if (isNumber(value)) {
        return value === +this.value;
      }

      return value === this.value;
    },
  },
}, RadioGroupConfig);

export const CheckboxGroup = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'bind', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive'],
  template: `
    <span v-if="!hidden || keepAlive" :class="createClassNames('radios', $props)">
      <span v-if="prefix" :class="classnames('element__prefix radios__prefix')">{{prefix}}</span>
      <label :class="classnames('element__content radios__content')" v-repeat="option in options" :key="option[valueKey]">
        <input type="checkbox" :name="name" :disabled="disabled || item.disabled" :checked="isChecked(option)" :readonly="readonly" :required="required" :value="value" @change="$emit('change', $event, option)" />
        <span>{{option[labelKey || valueKey]}}</span>
      </label>
      <span v-if="suffix" :class="classnames('element__suffix radios__suffix')">{{suffix}}</span>
    </span>
  `,
  methods: {
    classnames,
    createClassNames,
    isChecked(option) {
      return this.value.some((item) => {
        if (item === option) {
          return true;
        }

        const value = option[this.valueKey];
        if (isNumber(value)) {
          return value === +item;
        }

        return value === item;
      });
    },
  },
}, CheckboxGroupConfig);

export const Select = connectVueComponent({
  props: ['options', 'valueKey', 'labelKey', 'bind', 'name', 'value', 'prefix', 'suffix', 'disabled', 'readonly', 'hidden', 'required', 'highlight', 'keepAlive'],
  template: `
    <span v-if="!hidden || keepAlive" :class="createClassNames('radios', $props)">
      <span v-if="prefix" :class="classnames('element__prefix radios__prefix')">{{prefix}}</span>
      <select :class="classnames('element__content radios__content')">
        <option v-repeat="option in options" :key="option[valueKey]" :disabled="disabled || item.disabled" :checked="isChecked(option)" :readonly="readonly" :required="required" :value="value" @change="$emit('change', $event, option)">{{option[labelKey || valueKey]}}</option>
      </select>
      <span v-if="suffix" :class="classnames('element__suffix radios__suffix')">{{suffix}}</span>
    </span>
  `,
  methods: {
    classnames,
    createClassNames,
    isSelected(option) {
      return this.value.some((item) => {
        if (item === option) {
          return true;
        }

        const value = option[this.valueKey];
        if (isNumber(value)) {
          return value === +item;
        }

        return value === item;
      });
    },
  },
}, SelectConfig);

export const Form = connectVueComponent({
  template: `<form class="${classnames('form')}" @submit="$emit('submit', $event)"><slot /></form>`,
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
