import React, { useState } from 'react';
import { isArray, createRandomString, isFunction, isUndefined, isNumeric, isNumber } from 'ts-fns';
import NumberInput from './input-number.jsx';
import SelectInput from './input-select.jsx';
import { classnames, createClassNames } from './utils.js';
import { connectReactComponent } from '../react/index.js';
import { useUniqueKeys } from '../react/utils.js';

/**
 * 文本
 * @param {*} props
 * @returns
 */
export const Text = connectReactComponent((props) => {
  const {
    bind,
    children = bind?.text,
    className,
    ...attrs
  } = props;
  return <span className={classnames('text', className)} {...attrs}>{children}</span>;
});

/**
 * 标签
 */
export const Label = connectReactComponent((props) => {
  const {
    bind,
    children = bind?.label,
    className,
    ...attrs
  } = props;
  return (
    <label className={classnames('label', className)} {...attrs}>{children}</label>
  );
});

/**
 * 按钮
 * @param {*} props
 * @returns
 */
export const Button = connectReactComponent((props) => {
  const {
    bind,
    className,
    type = 'button',
    disabled = bind?.disabled,
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
});

/**
 * 横向排列盒子
 * @param {*} props
 * @returns
 */
export const HBox = connectReactComponent((props) => {
  const {
    bind,
    className,
    hidden = bind?.hidden,
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
});

/**
 * 纵向排列盒子
 * @param {*} props
 * @returns
 */
export const VBox = connectReactComponent((props) => {
  const {
    bind,
    className,
    hidden = bind?.hidden,
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
});

/**
 * 单行文本
 */
export const Input = connectReactComponent((props) => {
  const {
    bind,
    type: _type,
    prefix = bind?.prefix,
    suffix = bind?.suffix,
    disabled = bind?.disabled,
    readonly = bind?.readonly,
    hidden = bind?.hidden,
    required = bind?.required,
    maxLength = bind?.maxLength,
    highlight,
    keepAlive,
    children,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  if (bind) {
    attrs.value = bind.value;
    attrs.onChange = value => bind.value = value;
    attrs.placeholder = attrs.placeholder || bind.placeholder;
  }

  // 传入null作为value
  if (attrs.value === null) {
    attrs.value = '';
  }

  // 仅支持输入类型
  const type = ['radio', 'checkbox', 'image', 'button', 'reset', 'submit'].includes(_type) ? 'text' : _type;
  return (
    <label className={createClassNames('input', props)}>
      {prefix ? <span className={classnames('element__prefix input__prefix')}>{prefix}</span> : null}
      <input
        type={type}
        className={classnames('element__content input__content')}
        disabled={disabled}
        readOnly={readonly}
        required={required}
        maxLength={maxLength}
        {...attrs}
        onChange={e => attrs.onChange && attrs.onChange(e.target.value)}
      />
      {suffix ? <span className={classnames('element__suffix input__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
});

/**
 * 数字
 * @param {*} props
 * @returns
 */
export const InputNumber = connectReactComponent((props) => {
  const {
    bind,
    type,
    className,
    prefix = bind?.prefix,
    suffix = bind?.suffix,
    disabled = bind?.disabled,
    readonly = bind?.readonly,
    hidden = bind?.hidden,
    required = bind?.required,
    max = bind?.max,
    min = bind?.min,
    highlight,
    keepAlive,
    children,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  if (bind) {
    attrs.value = bind.value;
    attrs.onChange = value => bind.value = value;
    attrs.placeholder = attrs.placeholder || bind.placeholder;
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
        disabled={disabled}
        readOnly={readonly}
        required={required}
        max={max}
        min={min}
        {...attrs}
      />
      {suffix ? <span className={classnames('element__suffix input-number__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
});

export const TextArea = connectReactComponent((props) => {
  const {
    bind,
    className,
    prefix = bind?.prefix,
    suffix = bind?.suffix,
    disabled = bind?.disabled,
    readonly = bind?.readonly,
    hidden = bind?.hidden,
    required = bind?.required,
    maxLength = bind?.maxLength,
    highlight,
    keepAlive,
    children,
    ...attrs
  } = props;

  if (hidden && !keepAlive) {
    return null;
  }

  if (bind) {
    attrs.value = bind.value;
    attrs.onChange = value => bind.value = value;
    attrs.placeholder = attrs.placeholder || bind.placeholder;
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
        disabled={disabled}
        readOnly={readonly}
        required={required}
        maxLength={maxLength}
        {...attrs}
        onChange={e => attrs.onChange && attrs.onChange(e.target.value)}
      />
      {suffix ? <span className={classnames('element__suffix textarea__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
});

export const RadioGroup = connectReactComponent((props) => {
  const {
    bind,
    className,
    options = bind?.options,
    valueKey = 'value',
    labelKey = 'label',
    value = bind?.value,
    prefix = bind?.prefix,
    suffix = bind?.suffix,
    disabled = bind?.disabled,
    readonly = bind?.readonly,
    hidden = bind?.hidden,
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

    if (bind) { // 绑定字段
      bind.value = origin;
    } else if (isUndefined(value)) { // 非受控
      setState(origin);
    }
    // 受控，无需处理

    if (onChange) {
      onChange(origin, origin, item);
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
            type="radio"
            value={item[valueKey]}
            checked={`${item[valueKey]}` === `${val}`}
            readOnly={readonly}
            disabled={disabled || item.disabled}
            onChange={() => handleChange(item)}
            {...attrs}
          />
          <span>{isUndefined(item[labelKey]) ? item[valueKey] : item[labelKey]}</span>
        </label>
      ))}
      {suffix ? <span className={classnames('element__suffix radios__suffix')}>{suffix}</span> : null}
      {children}
    </span>
  );
});

export const CheckboxGroup = connectReactComponent((props) => {
  const {
    bind,
    className,
    options = bind?.options,
    valueKey = 'value',
    labelKey = 'label',
    value = bind?.value,
    prefix = bind?.prefix,
    suffix = bind?.suffix,
    disabled = bind?.disabled,
    readonly = bind?.readonly,
    hidden = bind?.hidden,
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
    if (bind) { // 绑定字段
      const value = isArray(bind.value) ? bind.value : [];
      const next = createNext(value);
      bind.value = next;
      values = next;
    } else if (!isArray(value)) { // 非受控
      const next = createNext(state);
      setState(next);
      values = next;
    } else { // 受控
      values = createNext(value);
    }

    if (onChange) {
      onChange(values, origin, item);
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
});

export const Select = connectReactComponent((props) => {
  const {
    bind,
    options = bind?.options,
    valueKey = 'value',
    labelKey = 'label',
    value = bind?.value,
    prefix = bind?.prefix,
    suffix = bind?.suffix,
    disabled = bind?.disabled,
    readonly = bind?.readonly,
    hidden = bind?.hidden,
    required = bind?.required,
    placeholder = bind?.placeholder,
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

  const handleChange = (origin, item) => {
    if (bind) {
      bind.value = origin;
    }
    if (onChange) {
      onChange(origin, origin, item);
    }
  };

  return (
    <label className={createClassNames('select', props)}>
      {prefix ? <span className={classnames('element__prefix select__prefix')}>{prefix}</span> : null}
      <SelectInput
        className={classnames('element__content select__content')}
        options={options}
        valueKey={valueKey}
        labelKey={labelKey}
        disabled={disabled}
        readOnly={readonly}
        required={required}
        placeholder={placeholder}
        {...attrs}
        onChange={handleChange}
      />
      {suffix ? <span className={classnames('element__suffix select__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
});

export const Form = connectReactComponent((props) => {
  const { className, onSubmit, ...attrs } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };
  return <form className={classnames('form', className)} onSubmit={handleSubmit} {...attrs} />;
}, {
  requireProps: ['onSubmit'],
});

export const FormGroup = connectReactComponent((props) => {
  const {
    bind,
    className,
    title,
    hidden = bind?.hidden,
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
});

export const FormItem = connectReactComponent((props) => {
  const {
    bind,
    children,
    errors = bind?.errors,
    hidden = bind?.hidden,
    highlight = bind?.highlight,
    label = bind?.label,
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
});

export const Loop = connectReactComponent((props) => {
  const {
    bind,
    items = bind?.value,
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
});
