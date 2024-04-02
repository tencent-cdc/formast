export const TextConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { text } = bind;
    return { children: text };
  },
};

export const LabelConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { label } = bind;
    return { children: label };
  },
};

export const ButtonConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { disabled } = bind;
    return { disabled };
  },
};

export const HBoxConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { hidden } = bind;
    return { hidden };
  },
};

export const VBoxConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { hidden } = bind;
    return { hidden };
  },
};

export const InputConfig = {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { prefix, suffix, disabled, readonly, hidden, required, maxLength, value } = bind;
    const onChange = (value) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = value;
      props.onChange?.(value);
    };
    const placeholder = props.placeholder || bind.placeholder;
    return { prefix, suffix, disabled, readonly, hidden, required, maxLength, value, onChange, placeholder };
  },
};

export const InputNumberConfig = {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { prefix, suffix, disabled, readonly, hidden, required, max, min, value } = bind;
    const onChange = (value) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = +value;
      props.onChange?.(+value);
    };
    const placeholder = props.placeholder || bind.placeholder;
    return { prefix, suffix, disabled, readonly, hidden, required, max, min, value, onChange, placeholder };
  },
};

export const TextAreaConfig = {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { prefix, suffix, disabled, readonly, hidden, required, maxLength, value } = bind;
    const onChange = (value) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = value;
      props.onChange?.(value);
    };
    const placeholder = props.placeholder || bind.placeholder;
    return { prefix, suffix, disabled, readonly, hidden, required, maxLength, value, onChange, placeholder };
  },
};

export const RadioGroupConfig = {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { options, prefix, suffix, disabled, readonly, hidden, value, key } = bind;
    const onChange = (value, option) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = value;
      props.onChange?.(value, option);
    };
    return { name: props.name || key, options, prefix, suffix, disabled, readonly, hidden, value, onChange };
  },
};

export const CheckboxGroupConfig = {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { options, prefix, suffix, disabled, readonly, hidden, value } = bind;
    const onChange = (values, options) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = values; // value必须是数组
      props.onChange?.(values, options);
    };
    return { options, prefix, suffix, disabled, readonly, hidden, value, onChange };
  },
};

export const SelectConfig = {
  mapToProps({ bind }, props) {
    if (!bind) {
      return;
    }
    const { options, prefix, suffix, disabled, readonly, hidden, value } = bind;
    const onChange = (value, option) => {
      // eslint-disable-next-line no-param-reassign
      bind.value = value;
      props.onChange?.(value, option);
    };
    return { options, prefix, suffix, disabled, readonly, hidden, value, onChange };
  },
};

export const FormConfig = {
  requireProps: ['onSubmit'],
};

export const FormGroupConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { hidden } = bind;
    return { hidden };
  },
};

export const FormItemConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { errors, hidden, highlight, label, required } = bind;
    return { errors, hidden, highlight, label, required };
  },
};

export const LoopConfig = {
  mapToProps({ bind }) {
    if (!bind) {
      return;
    }
    const { value } = bind;
    return { items: value };
  },
};
