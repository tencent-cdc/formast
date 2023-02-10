import styles from '../styles/index.less'
import { isArray, getObjectHash, isString, compute_, isUndefined } from 'ts-fns'
import { generateModel } from 'formast'
import ScopeX from 'scopex'

export function createClassNames(config = {}) {
  const { namespace, module: cssModule } = config
  const get = (item) => {
    const classname = namespace ? `${namespace}__${item}` : item
    if (cssModule && classname in cssModule) {
      return cssModule[classname]
    }
    return classname
  }
  return (...classnames) => {
    return classnames.filter(item => !!item).map((item) => {
      if (isArray(item)) {
        return item.filter(item => !!item).map(get).join(' ')
      }
      else {
        return item.split(' ').filter(item => !!item).map(get).join(' ')
      }
    }).join(' ')
  }
}

export function createGlobalModelScope() {
  const scope = {}

  function set(modelJSON) {
    if (!modelJSON.schema) {
      return
    }

    const hash = getObjectHash(modelJSON)
    if (hash === scope.hash) {
      return
    }
    scope.hash = hash

    const Model = generateModel(modelJSON)
    const model = new Model()
    scope.model = model
  }
  function get() {
    return scope.model
  }

  return { set, get }
}

export const classnames = createClassNames({ namespace: 'formast-designer', module: styles })
export const globalModelScope = createGlobalModelScope()

export function parseKey(str) {
  const matched = str.match(/([a-zA-Z0-9_$]+)(\((.*?)\))?(!(.*))?/)
  const [_, name, _p, _params, _m, _macro] = matched
  const params = isString(_params) ? _params.split(',').map(item => item.trim()).filter(item => !!item) : void 0
  const macro = _m ? _macro || 'jsx' : void 0
  return [name, params, macro]
}

export const getConfig = compute_(function(config = {}, defaultConfig = {}) {
  const groupSet = {}

  const sorter = (a, b) => {
    if (isUndefined(a.sort) && isUndefined(b.sort)) {
      return 0
    }
    if (isUndefined(b.sort)) {
      return -1
    }
    else if (isUndefined(a.sort)) {
      return 1
    }
    else if (a.sort < b.sort) {
      return -1
    }
    else if (a.sort > b.sort) {
      return 1
    }
    else {
      return 0
    }
  }

  if (defaultConfig.groups) {
    defaultConfig.groups.forEach((group) => {
      const { id } = group
      groupSet[id] = group
    })
  }

  if (config.groups) {
    config.groups.forEach((group) => {
      const { id } = group

      if (groupSet[id]) {
        const itemSet = {}

        groupSet[id].items.forEach((item) => {
          itemSet[item.id] = item
        })

        if (group.items) {
          group.items.forEach((item) => {
            itemSet[item.id] = item
          })
        }

        const items = Object.values(itemSet)
        items.sort(sorter)

        groupSet[id] = {
          ...groupSet[id],
          ...group,
          items,
        }
      }
      else {
        groupSet[id] = group
      }
    })
  }

  const groups = Object.values(groupSet)
  groups.sort(sorter)

  return {
    ...defaultConfig,
    ...config,
    groups,
  }
})

// 判断是否为表达式
export function isExp(str, scopex = new ScopeX({})) {
  try {
    try {
      JSON.parse(str)
      return true
    }
    catch (e) {
      try {
        scopex.parse(str)
        return true
      }
      catch (e) {}
    }
  }
  catch (e) {}
  return false
}
export function getExp(str, scopex = new ScopeX({})) {
  try {
    try {
      return JSON.parse(str)
    }
    catch (e) {
      try {
        return scopex.parse(str)
      }
      catch (e) {}
    }
  }
  catch (e) {}
}

export function genFieldsOptions(modelJSON, collapsed) {
  const gen = (modelJSON, parentText, parentPath) => {
    const { schema = {}, state = {} } = modelJSON
    const schemaKeys = Object.keys(schema)
    const stateKeys = Object.keys(state)

    const options = []

    schemaKeys.forEach((key) => {
      if (/^\|.*?\|$/.test(key)) {
        return
      }

      const isSubModel = /^<.*?>$/.test(key)
      if (isSubModel) {
        const name = key.substring(1, key.length - 1)
        const fac = schema[`|${name}|`]
        const label = fac ? fac.label : name

        const submodel = schema[key]

        const _text = parentText ? `${parentText}.${label}` : label
        const text = isArray(submodel) ? `${_text}[]` : _text
        const value = parentPath ? `${parentPath}.${name}` : name

        const children = isArray(submodel) ? gen(submodel[0], text, `${value}[*]`) : gen(submodel, text, value)

        const option = { text, value, children, type: isArray(submodel) ? 1 : 0 }
        options.push(option)

        // 摊平
        if (!collapsed) {
          options.push(...children)
        }
      }
      else {
        const meta = schema[key]
        const label = meta.label || key
        const text = parentText ? `${parentText}.${label}` : label
        const value = parentPath ? `${parentPath}.${key}` : key
        const option = { text, value }
        options.push(option)
      }
    })

    stateKeys.forEach((key) => {
      const value = parentPath ? `${parentPath}.${key}` : key
      const option = { text: value, value }
      options.push(option)
    })

    return options
  }
  return gen(modelJSON)
}
