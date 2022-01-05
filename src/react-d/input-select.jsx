import React, { useRef, useEffect, useCallback, useState, forwardRef } from 'react';

// eslint-disable-next-line react/display-name
export const InputSelect = forwardRef((props, inputRef) => {
  const { onChange, options, className, valueKey, labelKey, children, ...attrs } = props;
  const el = useRef();
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (el.current && inputRef) {
      // eslint-disable-next-line no-param-reassign
      inputRef.current = el.current;
    }
  }, [el.current]);

  const handleChange = useCallback(
    (e) => {
      if (onChange) {
        const { value } = e.target;
        const item = options.find(item => `${valueKey ? item[valueKey] : item.value}` === value);
        const origin = valueKey ? item[valueKey] : item.value;
        onChange(origin, item);
      }
      setChanged(true);
    },
    [options],
  );

  const { placeholder } = attrs;
  const hasPlaceholder = typeof placeholder !== 'undefined';
  let isPlaceholderSelected = false;
  // 在没有传入 value 的情况下，它是一个非受控组件，需要用一个 state 来记录它被改变的情况，这种情况下，一旦重新选择，就不应该再展示 placeholder
  const isForceChanged = changed && typeof attrs.value === 'undefined';
  // 迫使placeholder生效
  if (hasPlaceholder) {
    if ('value' in attrs) {
      const { value } = attrs;
      const selected = options.some(item => item.value === value);
      if (!selected) {
        attrs.value = '';
        isPlaceholderSelected = true;
      }
    } else if ('defaultValue' in attrs) {
      const { defaultValue } = attrs;
      const selected = options.some(item => item.value === defaultValue);
      if (!selected) {
        attrs.defaultValue = '';
        isPlaceholderSelected = true;
      }
    } else {
      attrs.defaultValue = '';
      isPlaceholderSelected = true;
    }
    delete attrs.placeholder;
  }

  if (isForceChanged) {
    isPlaceholderSelected = false;
  }

  const classnames = [className, isPlaceholderSelected ? 'select--pending' : ''].filter(item => !!item).join(' ');

  return (
    <select {...attrs} className={classnames} onChange={handleChange} ref={el}>
      {hasPlaceholder ? (
        <option disabled hidden value="">
          {placeholder || ''}
        </option>
      ) : null}
      {options
        ? options.map(option => (
            <option
              key={valueKey ? option[valueKey] : option.value}
              value={valueKey ? option[valueKey] : option.value}
              hidden={option.hidden}
              disabled={option.disabled}
            >
              {labelKey ? option[labelKey] : option.label}
            </option>
        ))
        : children}
    </select>
  );
});
export default InputSelect;
