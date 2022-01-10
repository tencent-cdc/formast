import { useState, useEffect, memo, Fragment, createElement, useRef, forwardRef } from 'react';
import { each, isEmpty, getObjectHash, isArray, isString, map, isFunction } from 'ts-fns';
import { SchemaParser } from '../core/schema-parser.js';
import { parseViewInModel } from '../core/utils.js';
import { isReactComponent } from './utils.js';

export const SHARED_COMPONENTS = {
  Fragment,
};

export const ALIAS_MAPPING = {
  for: 'htmlFor',
  readonly: 'readOnly',
  class: 'className',
};

export function createReactFormast(schemaJson, options = {}) {
  if (isEmpty(schemaJson)) {
    return {};
  }

  const { macros = {}, components: passedComponents = {}, types, ...others } = options;

  const mappedComponents = map(passedComponents, (component) => {
    if (component.formast && typeof component.formast === 'object' && !component.$$connectedByFormast) {
      return connectReactComponent(component, component.formast);
    }
    return component;
  });
  const components = {
    ...SHARED_COMPONENTS,
    ...mappedComponents,
  };

  const schemaParser = new SchemaParser({
    ...others,
    macros: {
      ...macros,
      render,
    },
    context: {
      components,
      types,
    },
  });

  schemaParser.loadSchema(schemaJson);

  const { model, Layout, declares, schema, constants } = schemaParser;

  if (declares && declares.components) {
    const missing = declares.components.filter(item => !components[item]);
    if (missing.length) {
      throw new Error(`JSON 文件要求传入 "${missing.join(',')}" 这些组件，但它们缺失了`);
    }
  }

  const Formast = memo(Layout);
  return { model, Formast, schema, declares, constants };
}

function FormastComponent(props, ref) {
  const { options, json, schema = json, props: passedProps = {}, onLoad, children = null } = props;

  const [FormastComponent, setFormastComponent] = useState(null);

  useEffect(() => {
    const create = (schemaJson) => {
      const { Formast, ...others } = createReactFormast(schemaJson, options);
      setFormastComponent(Formast);
      if (onLoad) {
        onLoad(others);
      }
      if (ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = others;
      }
    };
    if (typeof schema === 'function') {
      Promise.resolve().then(schema)
        .then(create);
    } else {
      create(schema);
    }
  }, []);

  if (!FormastComponent) {
    return children;
  }

  return createElement(FormastComponent, passedProps);
}

export const Formast = forwardRef(FormastComponent);

function Box(assets) {
  const {
    compute,
    context,
    subscribe,
  } = assets;

  const ref = useRef({});

  const {
    id,
    type,
    bind,
    deps,
    model,
    props,
    attrs,
    events,
    class: className,
    style,
    children,
    visible = true,
    collection,
  } = compute(ref.current);

  const { components } = context;
  const component = components[type] || type;

  const hash = getObjectHash(collection);
  const [, setState] = useState();
  useEffect(() => {
    const dispatch = () => setState({});
    return subscribe(dispatch, collection);
  }, [hash]);

  if (!visible) {
    return null;
  }

  const info = {};
  if (props) {
    each(props, (value, key) => {
      const attr = ALIAS_MAPPING[key] || key;
      info[attr] = value;
    });
  }
  if (attrs) {
    each(attrs, (value, key) => {
      const attr = ALIAS_MAPPING[key] || key;
      info[attr] = value;
    });
  }
  if (events) {
    each(events, (value, key) => {
      const event = ALIAS_MAPPING[key] || key;
      const attr = `on${key.replace(event[0], event[0].toUpperCase())}`;
      info[attr] = value;
    });
  }
  if (className) {
    info.className = className;
  }
  if (style) {
    info.style = style;
  }

  if (isReactComponent(component)) {
    info.$$formast = {
      id,
      type,
      bind,
      deps,
      model,
      context,
    };
  }

  return createElement(component, info, ...(isArray(children) ? children : [children]));
}

const Controller = memo(Box, () => true);

function render(data, compute, context, subscribe) {
  return createElement(Controller, {
    ...data,
    compute,
    context,
    subscribe,
  });
}

export function connectReactComponent(C, options) {
  function CBox(props) {
    const {
      $$formast,
      children,
      ...originProps
    } = props;

    let finalProps = originProps;

    if ($$formast) {
      const compiledProps = {};
      const { bind, deps, model } = $$formast;
      finalProps = {};

      if (options) {
        const { requireBind, requireDeps = [], requireProps } = options;
        if (requireBind) {
          if (isString(requireBind) && requireBind !== bind) {
            throw new Error(`${C.name} 要求使用 bind: "${requireBind}"，但在 JSON 文件中 bind 值为 "${bind || 'N/A'}"！`);
          } else if (!bind) {
            throw new Error(`${C.name} 要求传入 bind，但在 JSON 文件中 bind 不存在！`);
          }
        }
        if (requireDeps && (!deps || requireDeps.some(item => !deps.includes(item)))) {
          throw new Error(`${C.name} 要求 deps: "${requireDeps.join(',')}"，但在 JSON 文件中 deps 值为 "${deps ? `[${deps.join(',')}]` : 'N/A'}"！`);
        }
        if (requireProps && requireProps.some(item => !(item in props))) {
          const missing = requireProps.find(item => !(item in props));
          throw new Error(`${C.name} 要求 props: "${requireProps.join(',')}"，但实际没有传入 "${missing}"！`);
        }
      }

      if (bind) {
        const view = parseViewInModel(model, bind);
        if (view) {
          compiledProps.bind = view;
        }
      }
      if (deps && deps.length) {
        const obj = {};
        deps.forEach((key) => {
          const view = parseViewInModel(model, bind);
          if (view) {
            obj[key] = view;
          }
        });
        compiledProps.deps = obj;
      }

      if (options && options.mapToProps && isFunction(options.mapToProps)) {
        finalProps = options.mapToProps(compiledProps, originProps, $$formast);
        finalProps = { ...originProps, ...finalProps };
      } else {
        finalProps = { ...originProps, ...compiledProps };
      }
    }

    return createElement(C, finalProps, ...(isArray(children) ? children : [children]));
  };
  CBox.formast = options; // eslint-disable-line
  CBox.$$connectedByFormast = true;
  return CBox;
}
