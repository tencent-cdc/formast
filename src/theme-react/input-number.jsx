import React, { useState, useRef, useEffect, useLayoutEffect, forwardRef } from 'react';
import { decideby, isNumber } from 'ts-fns';

function format(str) {
  // 整数部分从右边开始，小数部分从左边开始
  const sp = num => num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const rv = str => str.split('').reverse()
    .join('');
  const [i, f] = str.split('.');
  const is = sp(i);
  const fs = f ? rv(sp(rv(f))) : f;
  const text = is + (f ? `.${fs}` : '');
  return text;
}

function useNum(num, precise) {
  if (precise) {
    let n = num;
    // 清空数字开头的00
    if (/^-?0+?\./.test(n)) {
      n = n.replace(/^(-?)(0+?)\.(.*?)$/g, '$10.$3');
    }
    if (/^-?0+?[1-9]/.test(n)) {
      n = n.replace(/^(-?)(0+)(.*?)$/g, '$1$3');
    }
    return n;
  }

  return +num;
}

function formatNumber(num, precise) {
  if (isNaN(num)) {
    return '';
  }
  if (typeof num !== 'number' && !isNumeric(num)) {
    return '';
  }

  // 整数部分从右边开始，小数部分从左边开始
  const n = useNum(num, precise);
  const ns = `${n}`;
  const text = format(ns);
  return text;
}

function isNumeric(text) {
  return typeof text === 'string' && /^-?[0-9]+\.?([0-9]+)?$/.test(text);
}

function toNum(text) {
  return text.replace(/,/g, '');
}

// eslint-disable-next-line react/display-name
export const InputNumber = forwardRef((props, inputRef) => {
  // - precise: 高精度数，用字符串代表数字，不丢失精度
  const { value, defaultValue, onChange, max, min, precise, ...attrs } = props;
  const isControlled = 'value' in props; // 受控组件

  const el = useRef();
  const focused = useRef();
  const [text, setText] = useState(() => (!isControlled ? formatNumber(defaultValue, precise) : ''));
  const fix = useRef(false); // setText会触发input onChange，导致两次执行handleChange，而且内容被重复，通过fix来修复这个问题

  useEffect(() => {
    if (el.current && inputRef) {
      // eslint-disable-next-line no-param-reassign
      inputRef.current = el.current;
    }
  }, [el.current]);

  const update = (next) => {
    fix.current = true;
    setText(next);
    requestAnimationFrame(() => {
      fix.current = false;
    });
  };

  const changeBy = (value) => {
    if (fix.current) {
      return;
    }

    const next = formatNumber(value, precise);
    const prev = text;
    const [changed] = focused.current || [''];

    const prevNum = useNum(toNum(prev), precise);

    // 小数点后面有连续的0，删除一位后，末尾全是0
    if (
      prev.indexOf('.') > 0
      && prev.indexOf(changed) === 0
      && prev.length === changed.length + 1
      && /^0+$/.test(changed.replace(next, '').replace(/,/g, ''))
    ) {
      if (changed[changed.length - 1] === ',') {
        update(changed.substring(0, changed.length - 1));
      } else {
        update(changed);
      }
    } else if (
      // 删除之后，末尾是小数点，这种情况不处理，避免小数点被干掉
      prev[prev.length - 1] === '.' && prev.indexOf(next) === 0 && next.length + 1 === prev.length
    ) {
      // nothing
    } else if (
      // 值未变，形不变
      prevNum === value && next !== prev
    ) {
      update(prev);
    } else if (next !== prev) {
      update(next);
    }
  };

  const handleChange = (e) => {
    if (fix.current) {
      return;
    }

    const next = e.target.value;

    const { selectionStart: cursor } = e.target;
    focused.current = [next, cursor];

    const num = toNum(next);

    const resetCurr = (pos) => {
      // 输入英文字符等，react会主动把光标移动到最后，因此，这里要做一个主动回调
      requestAnimationFrame(() => {
        const cur = typeof pos === 'undefined' ? cursor - 1 : pos;
        el.current.setSelectionRange(cur, cur);
      });
    };

    const response = (num) => {
      const n = useNum(num, precise);
      const res = decideby(() => {
        if (isNumber(max) && n > max) {
          return max;
        }
        if (isNumber(min) && n < min) {
          return min;
        }
        return n;
      });
      onChange(res);
    };

    // 先处理一些特殊情况
    if (next === '-') {
      update(next);
    } else if (next === '.') {
      focused.current = ['0.', 2];
      update('0.');
      response(0);
    } else if (next === '-.') {
      focused.current = ['-0.', 3];
      update('-0.');
      response(0);
    } else if (next === '-0') {
      update(next);
      response(0);
    } else if (
      // 输入了第2个小数点，注意，必须放在下面两条规则前面
      text.length + 1 === next.length
      && text.split('.').length <= 2
      && next.split('.').length > 2
      && text.replace(/\./g, '') === next.replace(/\./g, '')
    ) {
      let index = 0;
      const len = next.length;

      // 如果在已经有一个小数点的情况下，又在末尾插入一个小数点，那么插入无效
      if (next[len - 1] !== '.') {
        for (let i = 0; i < len; i++) {
          const n = next[i];
          const t = text[i];
          if (n !== t) {
            index = i;
            break;
          }
        }

        const before = next.substring(0, index).replace(/\./g, '');
        const after = next.substring(index).replace(/\./g, '');

        const str = `${before}.${after}`;
        const num = toNum(str);
        response(num);

        // 把光标放在小数点后面
        const formated = formatNumber(num, precise);
        const at = formated.indexOf('.');
        resetCurr(at + 1);
      }
    } else if (next === `${text}.`) {
      // 增加了一个小数点
      update(next);
    } else if (text === `${next}.`) {
      // 删除了一个小数点
      update(next);
    } else if (next.indexOf('.') > 0 && next[next.length - 1] === '0' && (next === `${text}0` || `${next}0` === text)) {
      // 操作小数点后面末尾的0，值没有任何变化，只是末尾的0在变化
      // 末尾为0由于不触发外部回调，所以必须进行内部格式化
      const str = toNum(next);
      const formated = format(str);
      update(formated);
    } else if (next[next.length - 1] === '.' && cursor === next.length && next.length + 1 === text.length) {
      // 在末尾删除一位后留下小数点，需配合updateBy完成更新
      update(next);
      const num = toNum(next);
      response(num);
    } else if (
      // 添加了一个逗号，直接不处理
      isNumeric(num)
      && next.indexOf(text) === 0
      && next.length === text.length + 1
      && next.split(',').length === text.split(',').length + 1
    ) {
      resetCurr();
    } else if (isNumeric(num)) {
      // 仅仅删掉了一个逗号
      if (
        num === toNum(text)
        && text.indexOf(next) === 0
        && next.length + 1 === text.length
        && next.split(',').length + 1 === text.split(',').length
      ) {
        const before = next.substring(0, cursor - 1);
        const after = next.substr(cursor);
        const n = before + after;

        // 调整光标位置
        focused.current = [n, cursor - 2];

        const num = toNum(n);
        response(num);
      } else if (
        // 删除小数点后面末尾的0，此时数值没有变化，不需要对外响应
        next.indexOf('.') > 0 && `${next}0` === text
      ) {
        if (next[next.length - 1] === ',') {
          update(next.substring(0, next.length - 1));
        } else {
          update(next);
        }
      } else {
        response(num);
      }
    } else if (next) {
      resetCurr();
    } else {
      // 空
      onChange(null);
    }
  };

  // 受控组件，跟着value的变化而变化
  useEffect(() => {
    if (isControlled) {
      changeBy(value);
    }
  }, [value]);

  // 定位光标位置
  useLayoutEffect(() => {
    if (!focused.current) {
      return;
    }

    const [prevText, cursor] = focused.current;

    const prevCommaCount = prevText.split(',').length - 1;
    const currentCommaCount = text.split(',').length - 1;
    const offset = currentCommaCount - prevCommaCount;
    const curr = cursor + offset;
    const pos = curr < 0 ? 0 : curr;

    el.current.setSelectionRange(pos, pos);
  }, [text]);

  return <input {...attrs} value={text} onChange={handleChange} ref={el} />;
});
export default InputNumber;
