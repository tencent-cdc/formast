import { isEmpty, map, isString, isFunction } from 'ts-fns';
import { SchemaParser } from '../core/schema-parser.js';
import { parseViewInModel } from '../core/utils.js';

export function createFormastContext(schemaJson, options, data, {
  connectComponent,
  sharedComponents,
  render,
}) {
  if (isEmpty(schemaJson)) {
    return null;
  }

  const { macros = {}, components: passedComponents = {}, types, ...others } = options || {};

  const mappedComponents = map(passedComponents, (component) => {
    if (component.formast && typeof component.formast === 'object' && !component.$$connectedByFormast) {
      return connectComponent(component, component.formast);
    }
    return component;
  });
  const components = {
    ...sharedComponents,
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

  schemaParser.loadSchema(schemaJson, data);

  const { model, Layout, declares, schema, constants } = schemaParser;

  if (declares && declares.components) {
    const missing = declares.components.filter(item => !components[item]);
    if (missing.length) {
      throw new Error(`JSON 文件要求传入 "${missing.join(',')}" 这些组件，但它们缺失了`);
    }
  }

  return { model, Layout, declares, schema, constants };
}

export function createConnectProps(C, props, options) {
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
          throw new Error(`组件 ${C.name} 要求使用 bind: "${requireBind}"，但在 JSON 文件中 bind 值为 "${bind || 'N/A'}"！`);
        } else if (!bind) {
          throw new Error(`组件 ${C.name} 要求传入 bind，但在 JSON 文件中 bind 不存在！`);
        }
      }
      if (requireDeps && (!deps || requireDeps.some(item => !deps.includes(item)))) {
        throw new Error(`组件 ${C.name} 要求 deps: "${requireDeps.join(',')}"，但在 JSON 文件中 deps 值为 "${deps ? `[${deps.join(',')}]` : 'N/A'}"！`);
      }
      if (requireProps && requireProps.some(item => !(item in props))) {
        const missing = requireProps.find(item => !(item in props));
        throw new Error(`组件 ${C.name} 要求 props: "${requireProps.join(',')}"，但实际没有传入 "${missing}"！`);
      }
    }

    if (bind) {
      const view = parseViewInModel(model, bind);
      if (view) {
        compiledProps.bind = view;
        const requireBind = options?.requireBind;
        if (isString(requireBind)) {
          compiledProps[requireBind] = view;
        }
      }
      if (deps && deps.length) {
        deps.forEach((key) => {
          const view = parseViewInModel(model, bind);
          if (view) {
            compiledProps[key] = view;
          }
        });
      }
    }

    if (options && options.mapToProps && isFunction(options.mapToProps)) {
      finalProps = options.mapToProps(compiledProps, originProps, $$formast) || {};
      finalProps = { ...originProps, ...finalProps };
    } else {
      finalProps = { ...originProps };
    }
  }

  return finalProps;
}
