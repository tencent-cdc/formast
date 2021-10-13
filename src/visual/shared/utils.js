import { isExp, getExp } from '../../core/utils.js';
import { isString } from 'ts-fns';

export function isSubKey(key) {
  return /^<.*?>$/.test(key);
}

export const DATA_TYPES = {
  STR: 'string',
  NUM: 'number',
  BOOL: 'boolean',
  EXP: 'expression',
  JSON: 'json',
  NIL: 'null',
};

export const DATA_TYPES_OPTIONS = {
  [DATA_TYPES.STR]: {
    label: '文本',
    value: DATA_TYPES.STR,
  },
  [DATA_TYPES.NUM]: {
    label: '数字',
    value: DATA_TYPES.NUM,
  },
  [DATA_TYPES.BOOL]: {
    label: '开关',
    value: DATA_TYPES.BOOL,
  },
  [DATA_TYPES.EXP]: {
    label: '表达式',
    value: DATA_TYPES.EXP,
  },
  [DATA_TYPES.JSON]: {
    label: 'JSON',
    value: DATA_TYPES.JSON,
  },
  [DATA_TYPES.NIL]: {
    label: '空值',
    value: DATA_TYPES.NIL,
  },
};

export function getDataType(value) {
  if (isExp(value)) {
    return DATA_TYPES.EXP;
  }
  if (typeof value === 'string') {
    return DATA_TYPES.STR;
  }
  if (typeof value === 'boolean') {
    return DATA_TYPES.BOOL;
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return DATA_TYPES.NUM;
  }
  if (value === null || value === undefined || isNaN(value)) {
    return DATA_TYPES.NIL;
  }
  return DATA_TYPES.JSON;
}

export function createDefaultValue(type) {
  switch (type) {
    case DATA_TYPES.STR: return '';
    case DATA_TYPES.BOOL: return false;
    case DATA_TYPES.NUM: return 0;
    case DATA_TYPES.EXP: return '';
    case DATA_TYPES.NIL: return null;
    case DATA_TYPES.JSON: return {};
  }
}

export function convertValueByType(value, type) {
  if (type === DATA_TYPES.EXP) {
    return getExp(value);
  }
  return value;
}

export function createFormattedValue(value, type) {
  const clear = str => (isString(str) ? str : '');
  switch (type) {
    case DATA_TYPES.STR: return `${clear(value)}`;
    case DATA_TYPES.BOOL: return !!value;
    case DATA_TYPES.NUM: return +value;
    case DATA_TYPES.EXP: return `{${clear(value)}}`;
    case DATA_TYPES.NIL: return null;
    case DATA_TYPES.JSON: return value && typeof value === 'object' ? value : {};
  }
}
