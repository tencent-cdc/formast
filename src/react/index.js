import { useState, useEffect, memo, Fragment, createElement, useRef, forwardRef, createContext, useContext } from 'react';
import { each, getObjectHash, isArray, decideby } from 'ts-fns';
import { isReactComponent } from './utils.js';
import { useModelReactor } from './hooks.js';
import { createFormastContext, createConnectProps } from '../_shared/index.js';

const FormastModelContext = createContext();

export const SHARED_COMPONENTS = {
  Fragment,
};

export const ALIAS_ATTRIBUTES = {
  for: 'htmlFor',
  readonly: 'readOnly',
  class: 'className',
};

export function useFormastModelContext() {
  return useContext(FormastModelContext);
}

export function createReactFormast(schemaJson, options, data) {
  const context = createFormastContext(schemaJson, options, data, {
    connectComponent: connectReactComponent,
    sharedComponents: SHARED_COMPONENTS,
    render,
  });

  if (context === null) {
    return {};
  }

  const { model, Layout, schema, declares, constants } = context;
  const TopComponent = (props) => {
    const { Provider } = FormastModelContext;
    return createElement(Provider, { value: model }, createElement(Layout, props));
  };
  const Formast = memo(TopComponent);
  return { model, Formast, schema, declares, constants };
}

function FormastComponent(props, ref) {
  const { options, json, schema = json, props: passedProps = {}, onLoad, children = null, data } = props;

  const [FormastComponent, setFormastComponent] = useState(null);

  useEffect(() => {
    const create = (schemaJson, data) => {
      const { Formast, ...others } = createReactFormast(schemaJson, options, data);
      setFormastComponent(Formast);

      if (ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = others;
      }

      if (onLoad) {
        onLoad(others);
      }
    };

    const promises = [
      Promise.resolve(typeof schema === 'function' ? schema() : schema),
    ];

    if (data) {
      promises.push(Promise.resolve(typeof data === 'function' ? data() : data));
    }

    Promise.all(promises).then(([schema, data]) => create(schema, data));
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
      const attr = ALIAS_ATTRIBUTES[key] || key;
      info[attr] = value;
    });
  }
  if (attrs) {
    each(attrs, (value, key) => {
      const attr = ALIAS_ATTRIBUTES[key] || key;
      info[attr] = value;
    });
  }
  if (events) {
    each(events, (value, key) => {
      const event = ALIAS_ATTRIBUTES[key] || key;
      const attr = /^on[A-Z]/.test(event) ? event : `on${key.replace(event[0], event[0].toUpperCase())}`;
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

    const finalProps = useModelReactor($$formast?.model, (originProps) => {
      let finalProps = originProps;
      if ($$formast) {
        finalProps = createConnectProps(C, props, options);
      }
      return finalProps;
    }, originProps);

    const subs = decideby(() => {
      if (finalProps.children) {
        const { children } = finalProps;
        return [].concat(children);
      }
      return [].concat(children);
    });
    const { children: _children2, ...attrs } = finalProps;
    return createElement(C, attrs, ...subs);
  };
  CBox.formast = options; // eslint-disable-line
  CBox.$$connectedByFormast = true;
  return CBox;
}
