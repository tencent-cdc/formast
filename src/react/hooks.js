import { useState, useEffect, useMemo, useRef } from 'react';
import { getObjectHash, isArray, isObject, isShallowEqual } from 'ts-fns';
/**
 * @param {*} obj
 * @returns the latest shallow equal object
 */
function useShallowLatest(obj) {
  const used = useRef(false);
  const latest = useRef(obj);

  if (used.current && !isShallowEqual(latest.current, obj)) {
    // eslint-disable-next-line no-nested-ternary
    latest.current = isArray(obj) ? [...obj] : isObject(obj) ? { ...obj } : obj;
  }

  if (!used.current) {
    used.current = true;
  }

  return latest.current;
}

/**
 * compute with models and recompute when the models change
 * @param {*} model
 * @param {*} compute
 * @param  {...any} args args passed into compute
 * @returns
 */
export function useModelReactor(model, compute, ...args) {
  const latestArgs = useShallowLatest(args);
  const [state, setState] = useState();

  const { res, deps, hash } = useMemo(() => {
    model?.collect();

    const res = compute(...args);

    const deps = model?.collect(true);
    const hash = getObjectHash(deps);

    return { res, deps, hash };
  }, [state, model, latestArgs]);

  useEffect(() => {
    if (!model) {
      return;
    }

    const forceUpdate = () => setState({});
    deps.forEach((key) => {
      model.watch(key, forceUpdate, true);
    });

    return () => {
      deps.forEach((key) => {
        model.unwatch(key, forceUpdate);
      });
    };
  }, [hash, model]);

  return res;
}
