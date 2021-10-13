import { Loader, Model } from 'tyshemo';
import {
  each,
  clone,
  map,
  isString,
  isObject,
  isArray,
  createProxy,
  uniqueArray,
  decideby,
  isInstanceOf,
  parse,
  getObjectHash,
  createRandomString,
} from 'ts-fns';
import {
  parseKey,
  isFieldInModel,
  findByKey,
  createLocals,
  parseSubInModel,
  isExp,
  getExp,
  parseRepeat,
} from './utils.js';
import { createScope } from 'scopex';

export class SchemaParser {
  constructor(options = {}) {
    const {
      loaders = {},
      macros = {},
      filters = {},
      extend,
      visit,
      global: globalVars,
      fetch: fetchFn,
      context = {}, // 用于放置其他任意需要的数据
      fns = {},
    } = options;

    this.options = options;

    // 内置函数和宏
    const debug = e => console.debug(e);

    this.macros = {
      debug,
      ...macros,
    };
    this.extend = extend;
    this.visit = visit;
    this.context = context;
    this.root = globalVars;
    this.fns = {
      debug,
      ...fns,
    };
    this.filters = filters;

    const loaderGlobalVars = {};
    if (globalVars) {
      Object.assign(loaderGlobalVars, globalVars);
    }
    if (fns) {
      Object.assign(loaderGlobalVars, fns);
    }

    class SchemaLoader extends Loader {}
    each(loaders, (proto, key) => {
      SchemaLoader.prototype[key] = proto;
    });
    if (fetchFn) {
      SchemaLoader.prototype.fetch = fetchFn;
      this.fns.fetch = fetchFn;
      loaderGlobalVars.fetch = fetchFn;
    }
    const loader = new SchemaLoader({
      global: loaderGlobalVars,
      filters,
    });
    this.loader = loader;

    this.Model = null;
    this.Layout = null;
    this.model = null;
    this.outsideObserver = this.createObserver({});
    this.globalScope = null;
    this.rootElement = null;

    // 对 schema 信息进行记录
    this.schema = null;
    this.constants = null;
    this.declares = null;
  }

  loadSchema(schemaJson, data) {
    const { model, layout, constants, declares } = schemaJson;

    if (!layout) {
      throw new Error('JSON 文件中的 layout 不存在！');
    }

    // 必须在前面进行记录，以方便在下面的方法中读取
    this.schema = schemaJson;

    if (declares) {
      this.loadSignals(declares).checkSignals();
    }

    if (model) {
      this.loadModel(model).initModel(data);
    }

    if (layout) {
      this.loadLayout(layout);
    }

    if (constants) {
      this.loadConstants(constants);
    }

    return this;
  }

  loadModel(modelJson) {
    const createModelJson = (modelJson) => {
      const schema = map(modelJson, (node, key) => {
        if (/^<.+?>$/.test(key)) {
          if (isArray(node)) {
            const sub = createModelJson(node[0]);
            return [sub];
          }
          const sub = createModelJson(node);
          return sub;
        }
        return node;
      });
      return { schema };
    };

    const isStandardModelJson = (json) => {
      if (!json) {
        return false;
      }

      const { schema } = json;
      if (!schema || typeof schema !== 'object') {
        return false;
      }

      // { schema: { default: null } } schema 是定义的一个字段
      if ('default' in schema && (typeof schema.default !== 'object' || schema.default === null)) {
        return false;
      }

      return true;
    };

    const formatted = isStandardModelJson(modelJson) ? modelJson : createModelJson(modelJson);
    const LoadedModel = this.loader.parse(formatted);
    const Model = this.extend ? this.extend(LoadedModel) : LoadedModel;
    this.Model = Model;
    return this;
  }

  initModel(data) {
    const { Model } = this;
    const model = new Model(data);
    this.model = model;
    window.$model = model;
    return model;
  }

  loadLayout(layoutJson) {
    const Layout = this.createRootLayout(layoutJson);
    this.Layout = Layout;
    return this;
  }

  loadConstants(settingsJson) {
    this.constants = settingsJson;
    return this;
  }

  loadSignals(declares) {
    this.declares = declares;
    return this;
  }

  checkSignals() {
    const { declares } = this;
    const { macros, global: globalVars, filters, fns, fetch } = declares;

    if (macros) {
      const missing = macros.filter(key => !this.macros[key]);
      if (missing.length) {
        console.warn(`JSON 文件要求传入宏 (options.macros) "${missing.join(',')}"，但实际运行时没有接收到这些宏`);
      }
    }

    if (globalVars) {
      const missing = globalVars.filter(key => !this.root || !(key in this.root));
      if (missing.length) {
        console.warn(`JSON 文件要求定义全局变量 (options.global) "${missing.join(',')}"，但实际运行时没有接收到这些定义`);
      }
    }

    if (filters) {
      const missing = filters.filter(key => !this.filters[key]);
      if (missing.length) {
        console.warn(`JSON 文件要求传入过滤器 (options.filters) "${missing.join(',')}"，但实际运行时没有接收到它们`);
      }
    }

    if (fns) {
      const missing = fns.filter(key => !this.fns[key]);
      if (missing.length) {
        console.warn(`JSON 文件要求传入函数 (options.fns) "${missing.join(',')}"，但实际运行时没有接收到它们`);
      }
    }

    if (fetch && !this.fns.fetch) {
      console.warn('JSON 文件要求传入 options.fetch，但实际运行时没有接收到它');
    }
  }

  createRootLayout(componentJson) {
    const { model, constants, outsideObserver, declares, root, fns } = this;
    const globalVars = {
      model,
      constants,
      fns,
      root,
    };
    const globalScope = createScope(globalVars, {
      chain: [
        'params',
        'vars',
        'repeat',
        {
          key: 'model',
          getter: model => model.$views,
          setter: () => void 0, // 禁止修改 views
        },
        'constants',
        'props',
        'fns',
        'root',
      ],
    });
    this.globalScope = globalScope;

    return (outsideGivenProps) => {
      // 检查给定的 props 是否正确
      if (declares && declares.props) {
        const keys = Object.keys(outsideGivenProps);
        const notGiven = declares.props.filter(item => !keys.includes(item));
        if (notGiven.length) {
          console.warn(`JSON 文件要求给定 "${declares.props.join(',')}" 这些属性，但是实际只传入了 "${keys.join(',')}"`);
        }
      }

      // 每次组件更新时，都要检查是否需要触发对应的深级组件
      outsideObserver.$set(outsideGivenProps);
      globalVars.props = outsideObserver.proxy;

      // 不需要再次计算，render 内部实现的机制
      if (this.rootElement) {
        return this.rootElement;
      }

      const rootElement = this.createElement(componentJson, null, globalScope, globalScope);
      this.rootElement = rootElement;
      return rootElement;
    };
  }

  /**
   *
   * @param {*} componentJson
   * @param {*} parentJson
   * @param {*} parentScope
   * @param {*} globalScope
   * @param {*} ref 渲染器给的一个外部对象，用于存储 repeat 的 key
   * @returns
   */
  createElement(componentJson, parentJson, parentScope, globalScope, ref) {
    const { visit, macros, context, outsideObserver } = this;
    const json = visit ? visit(componentJson, parentJson) || componentJson : componentJson;

    const {
      // no used
      key: _key,
      children: _children,

      id,
      type,
      bind,
      deps = [],
      vars = {},
      props = {},
      attrs = {},
      events = {},
      visible,
      class: className,
      style,
      model: modelExp,
      repeat,

      ...others
    } = json;
    const { render } = macros;

    // 循环体 -------------------------------

    if (repeat) {
      const [repeatItemsExp, repeatItemExp, repeatIndexExp, repeatAliasExp] = parseRepeat(repeat);
      if (!repeatItemExp || !repeatItemsExp) {
        throw new Error(`在 JSON 文件中 ${type}${id ? `:${id}` : ''} 提供的 repeat 为 "${repeat}" 不符合语法结构，请使用 "item,index,items in list" 这样的语法结构，注意空格必须严格遵守`);
      }

      const parentModel = parentScope.vars.model || this.model;
      const repeatItems = isExp(repeatItemsExp)
        ? this.parse(repeatItemsExp, parentScope)
        : parse(parentModel, repeatItemsExp);

      if (!isArray(repeatItems)) {
        console.error(repeatItemsExp, repeatItems);
        throw new Error(`在 JSON 文件中 ${type}${id ? `:${id}` : ''} 规定了 repeat 为 "${repeat}", 但 ${repeatItemsExp} 解析结果不为数组，无法完成遍历`);
      }

      const repeats = ref.repeats || [];
      ref.repeats = repeats; // eslint-disable-line

      // 将不在本次得到结果中的记录删掉
      repeats.forEach(({ data }, i) => {
        if (!repeatItems.includes(data)) {
          repeats.splice(i, 1);
        }
      });

      const res = repeatItems.map((item, index) => {
        const repeatVars = {
          [repeatItemExp]: item,
        };
        if (repeatIndexExp) {
          repeatVars[repeatIndexExp] = index;
        }
        if (repeatAliasExp) {
          repeatVars[repeatAliasExp] = repeatItems;
        }
        const repeatScope = parentScope.$new({ repeat: repeatVars });
        const repeatGlobalScope = globalScope.$new({ repeat: repeatVars });
        const latest = repeats.find(record => record.data === item);
        const key = latest ? latest.key : `${type}-repeat-${createRandomString(8)}`;
        if (!latest) {
          repeats.push({ data: item, key });
        }
        const repeatJson = {
          ...componentJson,
          repeat: null,
          key,
        };
        const one = this.createElement(repeatJson, parentJson, repeatScope, repeatGlobalScope);
        return one;
      });

      res.repeat = true; // 标记这是一个 repeat 的列表

      return res;
    }

    // --------------------------------------

    const key = decideby(() => {
      if (id) {
        return id;
      }
      return `${type}-${getObjectHash(componentJson)}-${getObjectHash(parentJson || {})}`;
    });

    const model = decideby(() => {
      if (modelExp === false) {
        return this.model;
      }

      // 从 scope 上取 model，确保该 model 可能是替换过的
      const parentModel = parentScope.vars.model || this.model;
      if (!isString(modelExp)) {
        return parentModel;
      }

      if (isExp(modelExp)) {
        const res = this.parse(modelExp, parentScope);
        if (!isInstanceOf(res, Model)) {
          throw new Error(`在 JSON 文件中 ${type}${id ? `:${id}` : ''} 规定了 model 为 "${modelExp}"，但无法从该表达式解析出正确的模型实例`);
        }
        return res;
      }

      const res = parseSubInModel(parentModel, modelExp);
      if (!isInstanceOf(res, Model)) {
        throw new Error(`在 JSON 文件中 ${type}${id ? `:${id}` : ''} 规定了 model 为 "${modelExp}"，但无法从该路径解析出正确的模型实例`);
      }
      return res;
    });


    if (bind && !isFieldInModel(bind, model)) {
      console.warn(`在 JSON 文件中 ${type}${id ? `:${id}` : ''} 规定了 bind 为 ${bind}，但当前模型上没有该字段`);
    }

    if (deps && deps.length) {
      const missing = [];
      deps.forEach((key) => {
        if (!isFieldInModel(key, model)) {
          missing.push(key);
        }
      });
      if (missing.length) {
        console.warn(`在 JSON 文件中 ${type}${id ? `:${id}` : ''} 规定了 deps 为 "${deps.join(',')}"，但当前模型上没有找到 "${missing.join(',')}" 这些字段`);
      }
    }

    // 当前作用域在实例化vars时的model需要根据配置实时调整
    const preloadScope = globalScope.$new({ model });
    // 一次性从父级作用域读取值之后，生成本级作用域的 vars
    // 一次性成值后，vars 动态语法失效，成立自己的值
    const state = this.parseObject(vars, preloadScope);
    const varsObserver = this.createObserver(state);

    const subscribe = this.createSubscriber(model, varsObserver);

    const compute = (ref) => {
      if (model) {
        model.collect({ views: true, fields: true });
      }

      // 清空当前依赖
      outsideObserver.clear();
      varsObserver.clear();

      // 将模型传递下去，下面的作用域可以继承该模型
      const scope = globalScope.$new({ vars: varsObserver.proxy, model });
      const show = visible ? this.parse(visible, scope) : true;
      const classList = className ? this.parse(className, scope) : '';
      const styleMap = style ? this.parseObject(style, scope) : null;
      const properties = this.parseObject(props, scope);
      const attributes = this.parseObject(attrs, scope);
      const handlers = this.parseObject(events, scope);
      const extra = this.parseObject(others, scope);

      const inner = findByKey(json, 'children');

      // 在执行 children 内部之前进行收集，这样不会收集到 children 内部与自己无关的依赖
      if (inner) {
        const { params, macro, value } = inner;
        const collect = (obj) => { // 收集 repeat 相关依赖
          const { repeat } = obj;
          if (!repeat) {
            return;
          }

          const [items] = parseRepeat(repeat);
          if (isExp(items)) {
            this.parse(items, scope);
          } else {
            parse(model, items);
          }
        };
        if (!params && !macro) {
          if (isArray(value)) {
            value.forEach(child => isObject(child) && collect(child));
          } else if (isObject(value)) {
            collect(value);
          } else if (isString(value)) {
            this.parse(value, scope);
          }
        }
      }

      // 在执行 children 内部之前结束收集，这样不会收集到 children 内部与自己无关的依赖
      const fields = model ? model.collect(true) : [];

      // 确保 children 是一个数组，外部好用
      const children = decideby(() => {
        if (!inner) {
          return;
        }

        const keys = {}; // 记录可能出现的重复key

        const { params, macro, value } = inner;
        const createJsx = (item, scope) => {
          if (isObject(item)) {
            const { type, id } = item;
            const key = decideby(() => {
              if (id) {
                return id;
              }
              const hash = getObjectHash(item);
              const index = hash in keys ? keys[hash] : 0;
              const current = index + 1;
              keys[hash] = current;
              const key = `${type}-${hash}-${current}`;
              return key;
            });
            return this.createElement({ ...item, key }, componentJson, scope, globalScope, ref);
          }
          return this.parse(item, scope);
        };
        const createSub = (value, scope) => {
          if (isArray(value)) {
            const items = [];
            value.forEach((item) => {
              const subItem = createJsx(item, scope);
              if (isArray(subItem) && subItem.repeat === true) {
                items.push(...subItem);
              } else {
                items.push(subItem);
              }
            });
            return items;
          }

          const item = createJsx(value, scope);
          return item;
        };

        if (!params) {
          const items = createSub(value, scope);
          const res = macro && macro !== 'render' ? macros[macro].call(macros, value, items, context) : items;
          return res;
        }

        const fn = (...args) => {
          const locals = createLocals(args, params);
          const subScope = scope.$new({ params: locals });
          const sub = createSub(subScope);
          const res = macro && macro !== 'render' ? macros[macro].call(macros, value, sub, context) : sub;
          return res;
        };
        return fn;
      });

      if (bind && !fields.includes(bind)) {
        fields.push(bind);
      }
      if (deps && deps.length) {
        deps.forEach((dep) => {
          if (!fields.includes(dep)) {
            fields.push(dep);
          }
        });
      }

      const varsDeps = varsObserver.commit();
      const outsideDeps = outsideObserver.commit();

      return {
        id,
        key,
        type,
        bind,
        deps,
        model,
        repeat,
        visible: show,
        props: properties,
        attrs: attributes,
        events: handlers,
        class: classList,
        style: styleMap,
        extra,
        children,
        collection: {
          fields,
          vars: varsDeps,
          outside: outsideDeps,
        },
      };
    };

    const output = render.call(macros, { ...json, key }, context, compute, subscribe);
    return output;
  }

  createSubscriber(model, varsObserver) {
    const { outsideObserver } = this;

    return (dispatch, collection) => {
      const { fields, vars, outside } = collection;

      if (model && fields && fields.length) {
        fields.forEach((key) => {
          model.watch(key, dispatch, true);
        });
      }

      if (vars && vars.length) {
        varsObserver.watch(vars, dispatch);
      }

      if (outside && outside.length) {
        outsideObserver.watch(outside, dispatch);
      }

      return () => {
        if (model && fields && fields.length) {
          fields.forEach((key) => {
            model.unwatch(key, dispatch);
          });
        }

        if (vars && vars.length) {
          varsObserver.unwatch(vars, dispatch);
        }

        if (outside && outside.length) {
          outsideObserver.unwatch(outside, dispatch);
        }
      };
    };
  }

  createObserver(data) {
    const deps = [];
    const watchers = [];

    // // 触发更新逻辑
    // const update = () => {
    //   const actions = watchers.reduce((items, { dispatch }) => {
    //     if (items.includes(dispatch)) {
    //       return items;
    //     }
    //     items.push(dispatch);
    //     return items;
    //   }, []);
    //   actions.forEach(fn => fn());
    // };

    const create = (data) => {
      const proxy = createProxy(data, {
        get(keyPath, value) {
          const [key] = keyPath;
          if (!deps.includes(key)) {
            deps.push(key);
          }
          return value;
        },
        dispatch({ keyPath }) {
          const [key] = keyPath;
          watchers.forEach((item) => {
            if (item.key === key) {
              item.dispatch();
            }
          });
        },
      });
      return proxy;
    };

    const commit = () => {
      const items = [...deps];
      deps.length = 0;
      return items;
    };

    const clear = () => {
      deps.length = 0;
    };

    const watch = (keys, dispatch) => {
      keys.forEach((key) => {
        watchers.push({
          key,
          dispatch,
        });
      });
    };

    const unwatch = (deps, dispatch) => {
      deps.forEach((key) => {
        watchers.forEach((item, i) => {
          if (item.key === key && item.dispatch === dispatch) {
            watchers.splice(i, 1);
          }
        });
      });
    };

    const proxy = create(data);

    const observer = {
      proxy,
      data,
      deps,
      clear,
      commit,
      watch,
      unwatch,
      $set,
    };

    let timer = null;
    // 只为 attrs 服务，不对其他服务
    function $set(data) {
      const originData = observer.data;
      const originKeys = Object.keys(originData);
      const keys = Object.keys(data);

      const allKeys = uniqueArray([...originKeys, ...keys]);
      const queue = [];
      allKeys.forEach((key) => {
        const origin = originData[key];
        const next = data[key];

        if (origin !== next) {
          watchers.forEach((item) => {
            if (item.key === key) {
              const fn = () => item.dispatch();
              queue.push(fn);
            }
          });
        }
      });

      clearTimeout(timer);
      if (queue.length) {
        timer = setTimeout(() => {
          queue.forEach(fn => fn());
        }, 16);
      }

      const proxy = create(data);
      observer.proxy = proxy;
      observer.data = data;
      clear();
    }

    return observer;
  }

  createParser(scope) {
    return (value, key) => {
      if (key) {
        const { macros, context } = this;
        const [name, params, macro] = parseKey(key);

        if (params) {
          const fn = this.parseFn(value, params, macro, scope);
          return [fn, name];
        }

        const next = this.parse(value, scope);
        const res = macro ? macros[macro].call(macros, value, next, context) : next;
        return [res, name];
      }

      if (isObject(value)) {
        return this.parseObject(value);
      }

      return this.parse(value, scope);
    };
  }

  parseObject(obj, scope) {
    const cloned = clone(obj);
    const keys = Object.keys(cloned);
    const parse = this.createParser(scope);
    const final = keys.reduce((out, key) => {
      const value = cloned[key];
      const [v, k] = parse(value, key);
      return {
        ...out,
        [k]: v,
      };
    }, {});
    return final;
  }

  parseFn(value, params, macro, scope) {
    const { macros, context } = this;
    return (...args) => {
      const locals = createLocals(args, params);
      const subScope = scope.$new({ params: locals });
      const next = this.parse(value, subScope);
      const res = macro ? macros[macro].call(macros, value, next, context) : next;
      return res;
    };
  }

  parse(value, scope) {
    if (isObject(value)) {
      return this.parseObject(value, scope);
    }

    if (isArray(value)) {
      return value.map(item => this.parse(item, scope));
    }

    if (!isString(value)) {
      return value;
    }

    if (!isExp(value)) {
      return value;
    }

    const exp = getExp(value);
    const res = scope.parse(exp);
    return res;
  }
}
export default SchemaParser;
