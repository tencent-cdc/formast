import { assign, isUndefined } from 'ts-fns';

export function buildDefaultComponentJson(sourceConfig) {
  const { type, settings } = sourceConfig;
  const componentJson = { type };
  if (settings) {
    settings.forEach((item) => {
      const { key, default: defaultValue, params, fn } = item;
      if (isUndefined(defaultValue)) {
        return;
      }

      const attr = fn ? `${key}(${params || ''})` : key;
      assign(componentJson, attr, defaultValue);
    });
  }
  return componentJson;
}
