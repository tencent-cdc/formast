import Vue from 'vue';
import { SchemaParser } from '../core/schema-parser.js';
import { each, map, isEmpty, getObjectHash, isArray, isUndefined, decideby, isObject, isString, isInheritedOf, isFunction } from 'ts-fns';
import { parseViewInModel } from '../core/utils.js';

const Dynamic = Vue.extend({
  props: ['context', 'compute', 'subscribe'],
  beforeCreate() {
    this.ref = {};
    this.latest = null;
    this.subs = null;
  },
  render(h) {
    const { context, compute, subscribe, ref } = this;
    const {
      id,
      key,
      type,
      bind,
      deps,
      model,
      props = {},
      attrs = {},
      events = {},
      class: className,
      style,
      children,
      visible = true,
      collection,
    } = compute(ref);
    const { components } = context;

    const hash = getObjectHash(collection);
    if ((this.latest && this.latest.hash !== hash) || !this.latest) {
      if (this.latest) {
        this.latest.unsubscribe();
      }
      const dispatch = () => {
        this.$forceUpdate();
      };
      this.latest = {
        hash,
        unsubscribe: subscribe(dispatch, collection),
      };
    }

    if (!visible) {
      return null;
    }

    const properties = { ...props };
    const attributes = { ...attrs };
    const handlers = {};

    // 通过 input 来避免某些事件不需要，例如在 props 中传入了 onChange，可在 events 中使得 change: null 来取消该事件
    each(events, (value, key) => {
      if (typeof value !== 'function') {
        return;
      }
      const event = key.toLowerCase();
      handlers[event] = value;
    });

    if (id) {
      attributes.id = id;
    }

    const component = components[type];
    if (isInheritedOf(component, Vue)) {
      properties.$$formast = {
        id,
        key,
        type,
        bind,
        deps,
        model,
      };
    }

    const subs = decideby(() => {
      if (isUndefined(children)) {
        return;
      }
      const items = isArray(children) ? children : [children];
      const subs = items.map((item) => {
        if (!isObject(item)) {
          return item;
        }
        const { key, context, compute, subscribe } = item;
        return h(Dynamic, { key, props: { context, compute, subscribe } });
      });
      return subs;
    });
    return h(component || type, {
      attrs: attributes,
      props: properties,
      on: handlers,
      key,
      class: className,
      style,
    }, subs);
  },
});

function render(data, compute, context, subscribe) {
  return { ...data, context, compute, subscribe };
}

export const SHARED_COMPONENTS = {
  Fragment: Vue.extend({
    functional: true,
    render: (h, ctx) => ctx.children,
  }),
};

export function createVueFormast(schemaJson, options = {}) {
  if (isEmpty(schemaJson)) {
    return {};
  }

  const { macros = {}, components: passedComponents = {}, ...others } = options;
  const mappedComponents = map(passedComponents, (component) => {
    if (component.formast && typeof component.formast === 'object' && !component.$$connectedByFormast) {
      return connectVueComponent(component, component.formast);
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

  const Formast = Vue.extend({
    functional: true,
    render(h, ctx) {
      const { key, context, compute, subscribe } = Layout(ctx.props);
      return h(Dynamic, { key, props: { context, compute, subscribe } });
    },
    components,
  });

  return { model, Formast, schema, declares, constants };
}

export const Formast = Vue.extend({
  name: 'formast',
  props: ['options', 'schema', 'json', 'props', 'onLoad'],
  data() {
    return {
      FormastComponent: null,
    };
  },
  beforeMount() {
    const { options, json, schema, onLoad } = this;
    const getSchema = schema || json;
    const create = (schemaJson) => {
      const { Formast, ...others } = createVueFormast(schemaJson, options);
      this.FormastComponent = Formast;
      if (onLoad) {
        onLoad(others);
      }
    };
    if (typeof getSchema === 'function') {
      Promise.resolve().then(getSchema)
        .then(create);
    } else {
      create(getSchema);
    }
  },
  render(h) {
    const { FormastComponent, $slots } = this;

    if (!FormastComponent) {
      return $slots.default;
    }

    const { props } = this;
    return h(FormastComponent, { props });
  },
});

export function connectVueComponent(C, options) {
  const Comp = isObject(C) ? Vue.extend(C) : C;

  if (!isInheritedOf(Comp, Vue)) {
    throw new Error('connectVueComponent 接收了非法的组件');
  }

  const CBox = Vue.extend({
    functional: true,
    render(h, ctx) {
      const { props } = ctx;
      const {
        $$formast,
        children,
        ...originProps
      } = props;

      let finalProps = originProps;
      const data = { props: originProps };

      if ($$formast) {
        const compiledProps = {};
        const { bind, deps, model, key } = $$formast;
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

        data.props = finalProps;

        if (key) {
          data.key = key;
        }
      }

      const subs = decideby(() => {
        if (isUndefined(children)) {
          return;
        }
        const items = isArray(children) ? children : [children];
        return items;
      });
      return h(Comp, data, subs);
    },
  });
  CBox.formast = options; // eslint-disable-line
  CBox.$$connectedByFormast = true;
  return CBox;
}
