import React, { useState } from 'react';
import { isArray, createRandomString, isFunction, isUndefined, isNumeric, isNumber, isNone } from 'ts-fns';
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
    children,
    className,
    ...attrs
  } = props;
  return <span className={classnames('text', className)} {...attrs}>{children}</span>;
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { text } = bind;
    return { children: text };
  },
});

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
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { label } = bind;
    return { children: label };
  },
});

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
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { disabled } = bind;
    return { disabled };
  },
});

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
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { hidden } = bind;
    return { hidden };
  },
});

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
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { hidden } = bind;
    return { hidden };
  },
});

/**
 * 单行文本
 */
export const Input = connectReactComponent((props) => {
  const {
    type: _type,
    prefix,
    suffix,
    disabled,
    readonly,
    hidden,
    required,
    maxLength,
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
    const next = e.target.value;

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
        disabled={disabled}
        readOnly={readonly}
        required={required}
        maxLength={maxLength}
        value={val}
        onChange={handleChange}
      />
      {suffix ? <span className={classnames('element__suffix input__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { prefix, suffix, disabled, readonly, hidden, required, maxLength, value } = bind;
    // eslint-disable-next-line no-param-reassign
    const onChange = value => bind.value = value;
    const placeholder = props.placeholder || bind.placeholder;
    return { prefix, suffix, disabled, readonly, hidden, required, maxLength, value, onChange, placeholder };
  },
});

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
    disabled,
    readonly,
    hidden,
    required,
    max,
    min,
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
        disabled={disabled}
        readOnly={readonly}
        required={required}
        max={max}
        min={min}
      />
      {suffix ? <span className={classnames('element__suffix input-number__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { prefix, suffix, disabled, readonly, hidden, required, max, min, value } = bind;
    // eslint-disable-next-line no-param-reassign
    const onChange = value => bind.value = value;
    const placeholder = props.placeholder || bind.placeholder;
    return { prefix, suffix, disabled, readonly, hidden, required, max, min, value, onChange, placeholder };
  },
});

export const TextArea = connectReactComponent((props) => {
  const {
    className,
    prefix,
    suffix,
    disabled,
    readonly,
    hidden,
    required,
    maxLength,
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
        disabled={disabled}
        readOnly={readonly}
        required={required}
        maxLength={maxLength}
        onChange={e => attrs.onChange && attrs.onChange(e.target.value)}
      />
      {suffix ? <span className={classnames('element__suffix textarea__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { prefix, suffix, disabled, readonly, hidden, required, maxLength, value } = bind;
    // eslint-disable-next-line no-param-reassign
    const onChange = value => bind.value = value;
    const placeholder = props.placeholder || bind.placeholder;
    return { prefix, suffix, disabled, readonly, hidden, required, maxLength, value, onChange, placeholder };
  },
});

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
}, {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { options, prefix, suffix, disabled, readonly, hidden, value } = bind;
    const onChange = (value, selectedValue, selectedItem) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = value;
      props.onChange?.(value, selectedValue, selectedItem);
    };
    return { options, prefix, suffix, disabled, readonly, hidden, value, onChange };
  },
});

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
            {...attrs}
            type="checkbox"
            value={item[valueKey]}
            checked={selected.map(item => `${item}`).includes(`${item[valueKey]}`)}
            readOnly={readonly}
            disabled={disabled || item.disabled}
            onChange={() => handleChange(item)}
          />
          <span>{item[labelKey]}</span>
        </label>
      ))}
      {suffix ? <span className={classnames('element__suffix checkboxes__suffix')}>{suffix}</span> : null}
      {children}
    </span>
  );
}, {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { options, prefix, suffix, disabled, readonly, hidden, value } = bind;
    const onChange = (value, selectedValue, selectedItem) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = value;
      props.onChange?.(value, selectedValue, selectedItem);
    };
    return { options, prefix, suffix, disabled, readonly, hidden, value, onChange };
  },
});

export const Select = connectReactComponent((props) => {
  const {
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
    placeholder,
    children,
    className,
    highlight,
    keepAlive,
    onChange,
    ...attrs
  } = props;

  const [state, setState] = useState(value);

  if (hidden && !keepAlive) {
    return null;
  }

  const handleChange = (origin, item) => {
    if (isUndefined(value)) { // 非受控
      setState(origin);
    }

    if (onChange) {
      onChange(origin, origin, item);
    }
  };

  const val = isUndefined(value) ? state : value;

  return (
    <label className={createClassNames('select', props)}>
      {prefix ? <span className={classnames('element__prefix select__prefix')}>{prefix}</span> : null}
      <SelectInput
        className={classnames('element__content select__content')}
        {...attrs}
        options={options}
        valueKey={valueKey}
        labelKey={labelKey}
        disabled={disabled}
        readOnly={readonly}
        required={required}
        placeholder={placeholder}
        value={val}
        onChange={handleChange}
      />
      {suffix ? <span className={classnames('element__suffix select__suffix')}>{suffix}</span> : null}
      {children}
    </label>
  );
}, {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { options, prefix, suffix, disabled, readonly, hidden, value } = bind;
    const onChange = (value, selectedValue, selectedItem) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = value;
      props.onChange?.(value, selectedValue, selectedItem);
    };
    return { options, prefix, suffix, disabled, readonly, hidden, value, onChange };
  },
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
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { hidden } = bind;
    return { hidden };
  },
});

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
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { errors, hidden, highlight, label } = bind;
    return { errors, hidden, highlight, label };
  },
});

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
}, {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { value } = bind;
    return { items: value };
  },
});
