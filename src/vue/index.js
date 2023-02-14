/* eslint-disable no-underscore-dangle */
import Vue from 'vue';
import { each, getObjectHash, isArray, isUndefined, decideby, isObject, isInheritedOf } from 'ts-fns';
import { createFormastContext, createConnectProps } from '../_shared/index.js';

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

export function createVueFormast(schemaJson, options, data) {
  const context = createFormastContext(schemaJson, options, data, {
    connectComponent: connectVueComponent,
    sharedComponents: SHARED_COMPONENTS,
    render,
  });

  if (context === null) {
    return {};
  }

  const { model, Layout, declares, schema, constants } = context;
  const Formast = Vue.extend({
    functional: true,
    render(h, ctx) {
      const { key, context, compute, subscribe } = Layout(ctx.props);
      return h(Dynamic, { key, props: { context, compute, subscribe } });
    },
  });
  return { model, Formast, schema, declares, constants };
}

export const Formast = Vue.extend({
  name: 'formast',
  props: ['options', 'schema', 'json', 'props', 'onLoad', 'data'],
  data() {
    return {
      FormastComponent: null,
    };
  },
  beforeMount() {
    const { options, json, schema = json, onLoad, data } = this;
    const create = (schemaJson, data) => {
      const { Formast, ...others } = createVueFormast(schemaJson, options, data);
      this.FormastComponent = Formast;
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
    console.error(C, options);
    throw new Error('connectVueComponent 接收了非法的组件');
  }

  const CBox = Vue.extend({
    functional: true,
    render(h, ctx) {
      const { props, children } = ctx;
      const {
        $$formast,
        children: propChildren,
        ...originProps
      } = props;

      const data = { ...ctx.data, props: originProps };
      const events = ctx.data.on || {};

      if ($$formast) {
        const { model, key } = $$formast;

        model?.collect({ views: true, fields: true });

        const modifiedProps = { ...props };
        const eventNames = [];
        each(events, (value, key) => {
          const eventName = `on${key.replace(key[0], key[0].toUpperCase())}`;
          modifiedProps[eventName] = value;
          eventNames.push(eventName);
        });
        const finalProps = createConnectProps(C, modifiedProps, options);
        eventNames.forEach((event) => {
          delete finalProps[event];
        });
        data.props = finalProps;

        if (key) {
          data.key = key;
        }
      }

      const subs = decideby(() => {
        if (propChildren) {
          return propChildren;
        }
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
