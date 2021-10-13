import { isString, makeKeyChain, isInstanceOf, parse, keyin } from 'ts-fns';
import { Model } from 'tyshemo';

export function parseKey(str) {
  const matched = str.match(/([a-zA-Z0-9_$[\]<>]+)(\((.*?)\))?(!(.*))?/);
  const [, name, , _params, _m, _macro] = matched;
  const params = isString(_params)
    ? _params
      .split(',')
      .map(item => item.trim())
      .filter(item => !!item)
    : void 0;
  const macro = _m ? _macro || 'render' : void 0;
  return [name, params, macro];
}

export function isFieldInModel(key, model) {
  if (!key || !isString(key)) {
    return false;
  }

  if (!isInstanceOf(model, Model)) {
    return false;
  }

  return keyin(key, model);
}

export function parseViewInModel(model, key) {
  if (!isInstanceOf(model, Model)) {
    return;
  }

  if (!key || !isString(key)) {
    return;
  }

  const chain = makeKeyChain(key, true);
  if (!chain.length) {
    return;
  }

  if (chain.length === 1) {
    return model.$views[key];
  }

  const tail = chain.pop();
  const node = parse(model, chain);

  if (!node || !isInstanceOf(node, Model)) {
    return;
  }

  return node.$views[tail];
}

/**
 * 获得子模型
 * @param {*} model
 * @param {*} key
 * @returns
 */
export function parseSubInModel(model, key) {
  if (!isInstanceOf(model, Model)) {
    return;
  }

  if (!key || !isString(key)) {
    return;
  }

  const chain = makeKeyChain(key, true);
  if (!chain.length) {
    return;
  }

  const node = parse(model, chain);
  if (node && isInstanceOf(node, Model)) {
    return node;
  }
}

export function findByKey(obj, key) {
  const keys = Object.keys(obj);
  for (const k of keys) {
    const [name, params, macro] = parseKey(k);
    if (name === key) {
      return { name, params, macro, value: obj[key] };
    }
  }
}

export function createLocals(args, params) {
  const locals = params.reduce((obj, key, i) => {
    const arg = args[i];
    return {
      ...obj,
      [key]: arg,
    };
  }, {});
  return locals;
}

export function isExp(str) {
  return isString(str) && str[0] === '{' && str[str.length - 1] === '}';
}

export function getExp(str) {
  if (!isExp(str)) {
    return str;
  }

  const inner = str.substring(1, str.length - 1);
  const exp = inner.replace(/\.\./g, '.$views.'); // 特殊语法
  const res = exp.trim();
  return res;
}

export function parseRepeat(repeat) {
  const matched = repeat.match(/^(.+?)(,(.+?))?(,(.+?))? in (.+?)$/);
  if (!matched) {
    return [];
  }
  const [, item, , index, , alias, items] = matched;
  return [items.trim(), item.trim(), index ? index.trim() : index, alias ? alias.trim() : alias];
}
