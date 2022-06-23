import { isArray } from 'ts-fns';

// /**
//  * 创建一个代理事件对象，确保在读取e.target.value时，得到的时给定的原始值（而非字符串）
//  * @param {*} e
//  * @param {*} origin
//  * @returns
//  */
// export function createProxyEvent(e, origin) {
//   const event = new Proxy(e, {
//     get(_, key) {
//       const value = _[key];
//       if (key === 'target') {
//         return new Proxy(value, {
//           get(_, key) {
//             const value = _[key];
//             if (key === 'value') {
//               return origin;
//             }

//             return typeof value === 'function' ? value.bind(_) : value;
//           },
//         });
//       }

//       return typeof value === 'function' ? value.bind(_) : value;
//     },
//   });
//   return event;
// }

export function classnames(...items) {
  const { namespace = 'formast', module: cssModule } = classnames;
  const get = (item) => {
    const classname = namespace ? `${namespace}__${item}` : item;
    if (cssModule && classname in cssModule) {
      return cssModule[classname];
    }
    return classname;
  };
  return items
    .filter(item => !!item)
    .map((item) => {
      if (isArray(item)) {
        return item
          .filter(item => !!item)
          .map(get)
          .join(' ');
      }

      return item
        .split(' ')
        .filter(item => !!item)
        .map(get)
        .join(' ');
    })
    .join(' ');
}

export function createClassNames(name, props) {
  const {
    bind,
    className,
    disabled = bind?.disabled,
    readonly = bind?.readonly,
    hidden = bind?.hidden,
    required = bind?.required,
    highlight = bind?.highlight || bind?.errors.length,
  } = props;
  const classList = classnames(
    'element',
    name,
    className,
    disabled ? [`${name}--disabled`, 'element--disabled'] : '',
    readonly ? [`${name}--readonly`, 'element--readonly'] : '',
    required ? [`${name}--required`, 'element--required'] : '',
    hidden ? [`${name}--hidden`, 'element--hidden'] : '',
    highlight ? [`${name}--highlight`, 'element--highlight'] : '',
  );
  return classList;
}

export function noop() {}
