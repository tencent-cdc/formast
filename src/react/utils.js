import { useMemo, Component } from 'react';
import { createRandomString, isEqual, isShallowEqual, isInheritedOf, isFunction } from 'ts-fns';

export function isReactComponent(obj) {
  if (isFunction(obj) && obj.length <= 1) {
    return true;
  }

  if (typeof obj === 'function' && isInheritedOf(obj, Component)) {
    return true;
  }

  if (obj?.$$typeof?.toString().indexOf('Symbol(react.') === 0) {
    return true;
  }

  return false;
}

export function createUniqueKeys(items, useDeepEqual) {
  let prevItems = items;
  let ref = items.map(item => ({
    item,
    key: createRandomString(8),
  }));
  let keys = ref.map(item => item.key);

  const getKeys = () => keys;

  const setItems = (items) => {
    if (isShallowEqual(items, prevItems)) {
      return keys;
    }

    const next = items.map((item) => {
      const one = ref.find(one => (useDeepEqual ? isEqual(item, one) : item === one));
      if (one) {
        return one;
      }

      return {
        item,
        key: createRandomString(8),
      };
    });
    ref = next;
    prevItems = items;
    keys = ref.map(item => item.key);
    return keys;
  };

  return {
    getKeys,
    setItems,
  };
}

export function useUniqueKeys(items, useDeepEqual) {
  const { getKeys, setItems } = useMemo(() => createUniqueKeys(items, useDeepEqual), []);
  setItems(items);
  return getKeys();
}
