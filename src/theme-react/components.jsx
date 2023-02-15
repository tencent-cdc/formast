import React, { useState } from 'react';
import { isArray, createRandomString, isFunction, isUndefined, isNumeric, isNumber, isNone } from 'ts-fns';
import NumberInput from './input-number.jsx';
import SelectInput from './input-select.jsx';
import { classnames, createClassNames } from '../_shared/utils.js';
import { connectReactComponent } from '../react/index.js';
import { useUniqueKeys } from '../react/utils.js';
import { TextConfig, LabelConfig, ButtonConfig, HBoxConfig, VBoxConfig, InputConfig, InputNumberConfig, TextAreaConfig, RadioGroupConfig, CheckboxGroupConfig, SelectConfig, FormConfig, FormGroupConfig, FormItemConfig, LoopConfig } from '../_shared/component-configs.js';

/**
 * 文本
 * @param {*} props
 * @returns
 */
export const Text = connectReactComponent((props) => {
  const {
    children,
    className,
    ...attrs
  } = props;
  return <span className={classnames('text', className)} {...attrs}>{children}</span>;
}, TextConfig);

/**
 * 标签
 */
export const Label = connectReactComponent((props) => {
  const {
    children,
    className,
    ...attrs
  } = props;

  return (
    <label className={classnames('label', className)} {...attrs}>{children}</label>
  );
}, LabelConfig);

/**
 * 按钮
 * @param {*} props
 * @returns
 */
export const Button = connectReactComponent((props) => {
  const {
    className,
    type = 'button',
    disabled,
    ...attrs
  } = props;
  return (
    <button
      type={type}
      className={classnames('button', className, disabled ? 'button--disabled' : '')}
      disabled={disabled}
      {...attrs}
    />
  );
}, ButtonConfig);

/**
 * 横向排列盒子
 * @param {*} props
 * @returns
 */
export const HBox = connectReactComponent((props) => {
  const {
    className,
    hidden,
    keepAlive,
    children,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  return (
    <div
      className={classnames(
        'horizontal-box',
        className,
        hidden ? 'horizontal-box--hidden' : '',
      )}
      {...attrs}
    >
      {isFunction(children) ? children() : children}
    </div>
  );
}, HBoxConfig);

/**
 * 纵向排列盒子
 * @param {*} props
 * @returns
 */
export const VBox = connectReactComponent((props) => {
  const {
    className,
    hidden,
    keepAlive,
    children,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  return (
    <div
      className={classnames(
        'vertical-box',
        className,
        hidden ? 'vertical-box--hidden' : '',
      )}
      {...attrs}
    >
      {isFunction(children) ? children() : children}
    </div>
  );
}, VBoxConfig);

/**
 * 单行文本
 */
export const Input = connectReactComponent((props) => {
  const {
    type: _type,
    prefix,
    suffix,
    readonly,
    hidden,
    highlight,
    keepAlive,
    value,
    onChange,
    children,
    ...attrs
  } = props;

  const origin = isNone(value) ? '' : value;
  const [state, setState] = useState(origin);

  if (hidden && !keepAlive) {
    return null;
  }

  const handleChange = (e) => {
    const next = e?.target?.value;

    if (isUndefined(value)) { // 非受控
      setState(next);
    }

    if (onChange) {
      onChange(next);
    }
  };

  const val = isUndefined(value) ? state : origin;

  // 仅支持输入类型
  const type = ['radio', 'checkbox', 'image', 'button', 'reset', 'submit'].includes(_type) ? 'text' : _type;
  return (
    <label className={createClassNames('input', props)}>
      {prefix ? <span className={classnames('element__prefix input__prefix')}>{prefix}</span> : null}
      <input
        type={type}
        className={classnames('element__content input__content')}
        {...attrs}
        readOnly={readonly}
        value={val}
        onChange={handleChange}
      />
      {suffix ? <span className={classnames('element__suffix input__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, InputConfig);

/**
 * 数字
 * @param {*} props
 * @returns
 */
export const InputNumber = connectReactComponent((props) => {
  const {
    type,
    className,
    prefix,
    suffix,
    readonly,
    hidden,
    highlight,
    keepAlive,
    children,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  if (!isNumber(attrs.value) && !isNumeric(attrs.value)) {
    attrs.value = null;
  }

  // 仅支持输入类型
  return (
    <label className={createClassNames('input-number', props)}>
      {prefix ? <span className={classnames('element__prefix input-number__prefix')}>{prefix}</span> : null}
      <NumberInput
        className={classnames('element__content input-number__content')}
        {...attrs}
        readOnly={readonly}
      />
      {suffix ? <span className={classnames('element__suffix input-number__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, InputNumberConfig);

export const TextArea = connectReactComponent((props) => {
  const {
    className,
    prefix,
    suffix,
    readonly,
    hidden,
    highlight,
    keepAlive,
    children,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  // 传入null作为value
  if (attrs.value === null) {
    attrs.value = '';
  }

  return (
    <label className={createClassNames('textarea', props)}>
      {prefix ? <span className={classnames('element__prefix textarea__prefix')}>{prefix}</span> : null}
      <textarea
        className={classnames('element__content textarea__content')}
        {...attrs}
        readOnly={readonly}
      />
      {suffix ? <span className={classnames('element__suffix textarea__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, TextAreaConfig);

export const RadioGroup = connectReactComponent((props) => {
  const {
    className,
    options,
    valueKey = 'value',
    labelKey = 'label',
    value,
    prefix,
    suffix,
    disabled,
    readonly,
    hidden,
    required,
    highlight,
    keepAlive,
    children,
    onChange,
    ...attrs
  } = props;

  const [state, setState] = useState(value);

  if (hidden && !keepAlive) {
    return null;
  }

  const name = createRandomString(8);
  const handleChange = (item) => {
    const origin = item[valueKey];

    if (isUndefined(value)) { // 非受控
      setState(origin);
    }

    if (onChange) {
      onChange(origin, item);
    }
  };

  const val = isUndefined(value) ? state : value;

  return (
    <span className={createClassNames('radios', props)}>
      {prefix ? <span className={classnames('element__prefix radios__prefix')}>{prefix}</span> : null}
      {options.map(item => (
        <label
          key={item[valueKey]}
          className={classnames('element__content radios__content')}
        >
          <input
            name={name}
            {...attrs}
            type="radio"
            value={item[valueKey]}
            checked={`${item[valueKey]}` === `${val}`}
            readOnly={readonly}
            disabled={disabled || item.disabled}
            onChange={() => handleChange(item)}
          />
          <span>{isUndefined(item[labelKey]) ? item[valueKey] : item[labelKey]}</span>
        </label>
      ))}
      {suffix ? <span className={classnames('element__suffix radios__suffix')}>{suffix}</span> : null}
      {children}
    </span>
  );
}, RadioGroupConfig);

export const CheckboxGroup = connectReactComponent((props) => {
  const {
    className,
    options,
    valueKey = 'value',
    labelKey = 'label',
    value,
    prefix,
    suffix,
    disabled,
    readonly,
    hidden,
    required,
    highlight,
    keepAlive,
    children,
    onChange,
    ...attrs
  } = props;

  const [state, setState] = useState(value || []);

  if (hidden && !keepAlive) {
    return null;
  }

  const handleChange = (item) => {
    const origin = item[valueKey];

    const createNext = selected => (selected.some(one => `${one}` === `${origin}`) ? selected.filter(one => `${one}` !== `${origin}`) : selected.concat([origin]));

    let values = [];

    if (!isArray(value)) { // 非受控
      const next = createNext(state);
      setState(next);
      values = next;
    } else { // 受控
      values = createNext(value);
    }

    if (onChange) {
      const mapping = options.reduce((mapping, item) => {
        const value = item[valueKey];
        // eslint-disable-next-line no-param-reassign
        mapping[value] = item;
        return mapping;
      }, {});
      const items = values.map(value => mapping[value]);
      onChange(values, items);
    }
  };

  const selected = isArray(value) ? value : state;

  return (
    <span className={createClassNames('checkboxes', props)}>
      {prefix ? <span className={classnames('element__prefix checkboxes__prefix')}>{prefix}</span> : null}
      {options.map(item => (
        <label
          key={item[valueKey]}
          className={classnames('element__content checkboxes__content')}
        >
          <input
            {...attrs}
            type="checkbox"
            value={item[valueKey]}
            checked={selected.map(item => `${item}`).includes(`${item[valueKey]}`)}
            readOnly={readonly}
            disabled={disabled || item.disabled}
            onChange={() => handleChange(item)}
            {...attrs}
          />
          <span>{item[labelKey]}</span>
        </label>
      ))}
      {suffix ? <span className={classnames('element__suffix checkboxes__suffix')}>{suffix}</span> : null}
      {children}
    </span>
  );
}, CheckboxGroupConfig);

export const Select = connectReactComponent((props) => {
  const {
    valueKey = 'value',
    labelKey = 'label',
    value,
    prefix,
    suffix,
    readonly,
    hidden,
    children,
    className,
    highlight,
    keepAlive,
    onChange,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  if (!isUndefined(value)) {
    attrs.value = `${value}`;
  }

  return (
    <label className={createClassNames('select', props)}>
      {prefix ? <span className={classnames('element__prefix select__prefix')}>{prefix}</span> : null}
      <SelectInput
        className={classnames('element__content select__content')}
        {...attrs}
        valueKey={valueKey}
        labelKey={labelKey}
        readOnly={readonly}
        onChange={onChange}
      />
      {suffix ? <span className={classnames('element__suffix select__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, SelectConfig);

export const Form = connectReactComponent((props) => {
  const { className, onSubmit, ...attrs } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };
  return <form className={classnames('form', className)} onSubmit={handleSubmit} {...attrs} />;
}, FormConfig);

export const FormGroup = connectReactComponent((props) => {
  const {
    className,
    title,
    hidden,
    header,
    footer,
    children,
    keepAlive,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  return (
    <div className={classnames('group', className, hidden ? 'group--hidden' : '')} {...attrs}>
      {title ? <div className={classnames('group__title')}>{title}</div> : null}
      {header ? <div className={classnames('group__header')}>{header}</div> : null}
      {isFunction(children) ? children() : children}
      {footer ? <div className={classnames('group__footer')}>{footer}</div> : null}
    </div>
  );
}, FormGroupConfig);

export const FormItem = connectReactComponent((props) => {
  const {
    children,
    errors,
    hidden,
    highlight,
    label,
    suffix,
    className,
    keepAlive,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  return (
    <div
      className={classnames(
        'item',
        className,
        hidden ? 'item--hidden' : '',
        highlight ? 'item--highlight' : '',
        isArray(errors) && errors.length ? 'item--error' : '',
        label ? '' : 'item--no-label',
      )}
      {...attrs}
    >
      <div className={classnames('item__label')}>{label}</div>
      <div className={classnames('item__content')}>{isFunction(children) ? children() : children}</div>
      {suffix ? <div className={classnames('item__suffix')}>{suffix}</div> : null}
    </div>
  );
}, FormItemConfig);

export const Loop = connectReactComponent((props) => {
  const {
    items,
    children,
    empty,
    ...attrs
  } = props;

  const keys = useUniqueKeys(items);
  return (
    <div className={classnames('loop')} {...attrs}>
      {items.length ? (
        <div className={classnames('loop__list')}>
          {items.map((item, i) => (
            <div key={keys[i]} className={classnames('loop__item')}>
              {children(item, i)}
            </div>
          ))}
        </div>
      ) : null}
      {!items.length && empty ? <div className={classnames('loop__empty')}>{empty}</div> : null}
    </div>
  );
}, LoopConfig);
