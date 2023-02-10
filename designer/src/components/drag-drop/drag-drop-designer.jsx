import { React, Component, Section, Text, createRef, Each, nonable, ifexist, Store } from 'nautil'
import { DropBox, DragBox } from './drag-drop.jsx'
import { classnames, parseKey, genFieldsOptions } from '../../utils'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Confirm } from '../confirm/confirm.jsx'
import { VALUE_TYPES } from '../../config/constants.js'
import { isFunction, find, isArray, createRandomString, each, createSafeExp, isEmpty } from 'ts-fns'
import * as icons from '../icon'
import { BsTrash, BsArrowsMove } from '../icon'
import { LayoutConfigType } from '../../types/layout.type.js'

export class DragDesigner extends Component {
  static props = {
    config: LayoutConfigType,
  }
  static propsCheckAsync = true

  render() {
    const { groups } = this.props.config
    return (
      <Section stylesheet={[classnames('drag-designer')]}>
        <Each of={groups} render={(group) => {
          return (
            <Section key={group.id} stylesheet={[classnames('drag-designer__source-group')]}>
              <Section stylesheet={[classnames('drag-designer__source-group__title')]}><Text>{group.title}</Text></Section>
              <Each of={group.items} render={(item) => {
                const { icon, title, id } = item
                const Icon = icons[icon]
                return (
                  <DragBox key={title} source={item}>
                    <Section stylesheet={[classnames('drag-designer__source-item')]}>
                      {Icon ? <Icon /> : null}
                      <Text stylesheet={[classnames('drag-designer__source-item__text')]}>{title}</Text>
                    </Section>
                  </DragBox>
                )
              }} />
            </Section>
          )
        }} />
      </Section>
    )
  }
}

const isExp = (str) => {
  return str[0] === '{' && str[str.length - 1] === '}'
}
const getExp = (str) => {
  return str.substring(1, str.length - 1).trim()
}

const genJSONByRender = (renderFn, props, ...children) => {
  if (renderFn) {
    return [{
      ...props,
      [`${renderFn}!`]: children.length > 1 ? ['Fragment', null, ...children] : children[0],
    }]
  }
  else {
    return [props, ...children]
  }
}

const genSchemaByRender = (renderFn, props, ...children) => {
  const content = props[`${renderFn}!`]
    if (content) {
      const attrs = { ...props }
      delete attrs[`${renderFn}!`]
      if (isArray(content) && content[0] === 'Fragment') {
        const [_1, _2, ...children] = content
        return [attrs, ...children]
      }
      else {
        return [attrs, content]
      }
    }

    return [props, ...children]
}

export class Monitor {
  constructor({ el, store, source, getPassedProps, ...options }) {
    this.id = createRandomString(8)
    this.el = el
    this.source = source
    this.props = {}
    this.getPassedProps = getPassedProps
    this.options = options

    this.children = []
    this.elements = []

    this.store = store

    this.bindField = ''
    this.importFields = []
    this.importProps = []

    if (source.props && source.props.length) {
      this.setInitProps(source.props)
    }
  }

  // 自动绑定序号，不用自己传slot
  useDropBoxes(count) {
    const DropBoxes = []
    const { DropBox } = this
    for (let i = 0; i < count; i ++) {
      DropBoxes.push(function () {
        return <DropBox slot={i} />
      })
    }
    return DropBoxes
  }
  DropBox = (props) => {
    const { store } = this
    const { config, onSelect, onRemove, onChange, expParser } = this.getPassedProps()
    const { id, fromSlotsToSchema, fromSchemaToSlots, renderFn } = this.source

    if ('slot' in props && typeof slot !== 'number') {
      throw new Error(`${id} 传入的slot必须是自然数`)
    }

    const { slot } = props
    const useSlots = typeof slot === 'number'

    // 检查是否传入了必要的处理方法
    if (useSlots) {
      if (!fromSchemaToSlots && !renderFn) {
        throw new Error(`${id} 必须传入 fromSchemaToSlots 或 renderFn`)
      }
      if (!fromSlotsToSchema && !renderFn) {
        throw new Error(`${id} 必须传入 fromSlotsToSchema 或 renderFn`)
      }
    }

    return (
      <DndProvider backend={HTML5Backend}>
        <DropDesigner
          config={config}
          source={this.source}
          type={this.id}
          expParser={expParser}
          elements={useSlots ? this.elements[slot] : this.elements}
          onSelect={onSelect}
          onRemove={onRemove}
          onChange={(children) => {
            if (useSlots) {
              this.children[slot] = children
            }
            else {
              this.children = children
            }
            onChange()
          }}
          store={store}
        />
      </DndProvider>
    )
  }
  getComputedProps() {
    const res = {}
    const { expParser } = this.getPassedProps()

    const parse = expParser(this)

    const props = this.props
    const keys = Object.keys(props)
    // 当表达式输入没有输入完时，可能会保持，这时通过一个try..catch保证正常渲染不报错
    const tryGet = (value, ...fns) => {
      let res = value

      fns.forEach((fn) => {
        try {
          res = isFunction(fn) ? fn(res) : res
        }
        catch (e) {
          // console.error(e)
        }
      })

      return res
    }
    keys.forEach((key) => {
      const { type, value, params, defender } = props[key]
      if (type === VALUE_TYPES.EXP) {
        res[key] = tryGet(value, parse, defender)
      }
      else if (type === VALUE_TYPES.FN) {
        const items = params.split(',').filter(item => !!item)
        res[key] = (...args) => {
          const locals = {}
          args.forEach((arg, i) => {
            if (items[i])
            locals[items[i]] = arg
          })
          return tryGet(value, (value) => parse(value, locals), defender)
        }
      }
      else {
        res[key] = value
      }
    })
    return res
  }
  setInitProps(props) {
    props.forEach((item) => {
      const { key, value = '', types, disabled, defender } = item
      const prop = {
        type: types ? types[0] : VALUE_TYPES.STR,
        value,
        params: '',
        disabled,
        defender,
      }
      this.props[key] = prop
    })
  }
  setExpProps(props) {
    const source = this.source

    each(props, (value, key) => {
      const [name, params] = parseKey(key)
      const sourceProp = source.props.find(item => item.key === name)
      if (!sourceProp) {
        return
      }

      if (params) {
        this.props[name] = {
          type: VALUE_TYPES.FN,
          value: isExp(value) ? getExp(value) : value,
          params: params.join(','),
          disabled: sourceProp.disabled,
          defender: sourceProp.defender,
        }
      }
      else if (isExp(value)) {
        this.props[name] = {
          type: VALUE_TYPES.EXP,
          value: getExp(value),
          params: '',
          disabled: sourceProp.disabled,
          defender: sourceProp.defender,
        }
      }
      else {
        this.props[name] = {
          type: VALUE_TYPES.STR,
          value,
          params: '',
          disabled: sourceProp.disabled,
          defender: sourceProp.defender,
        }
      }
    })
  }
  getHyperJSON(model) {
    const fields = []
    const props = []

    const extract = (monitor, replacement = []) => {
      const { source, props: _props, children, bindField, importFields, importProps } = monitor
      const { id, fromSlotsToSchema, fromSchemaToJSON, loopItemsKey, renderFn, emptyDrop } = source

      const [bindRootField] = bindField.split(/\.|\[/) // 只需要路径的最顶部
      if (bindField && !fields.includes(bindRootField)) {
        fields.push(bindRootField)
      }
      if (importFields) {
        importFields.forEach((field) => {
          const [root] = field.split(/\.\[/) // 只需要路径的最顶部
          if (!fields.includes(root)) {
            fields.push(root)
          }
        })
      }
      if (importProps) {
        importProps.forEach((prop) => {
          if (!props.includes(prop)) {
            props.push(prop)
          }
        })
      }

      // 如果绑定或引入数据，那么需要进行检查
      // 注意，如果恢复数据时，不需要关心这个逻辑，恢复时，已经是经过处理后的数据了
      const fieldsOptions = genFieldsOptions(model)
      const relateFields = [].concat(bindField || []).concat(importFields || [])
      const isListSelected = !!fieldsOptions.filter(item => relateFields.includes(item.value) && item.type).length
      if (isListSelected && !loopItemsKey) {
        throw new Error(`${id} 必须配置 loopItemsKey 才能绑定子模型列表`)
      }
      if (isListSelected && !renderFn) {
        throw new Error(`${id} 必须配置 renderFn 才能绑定子模型列表`)
      }

      const attrs = {}

      const loopProp = find(_props, (_, key) => key === loopItemsKey) || null
      const loopPropValue = loopProp ? loopProp.value : null // a[*].b[*]
      const render = renderFn ? isFunction(renderFn) ? renderFn(loopPropValue ? loopPropValue.split('.').pop() : null) : renderFn : null

      const replacement2 = [...replacement]
      if (loopPropValue) {
        const [_, alias, _1, index] = render.match(/\((.*?)(,(.*?))?\)/) // render(item,i)
        replacement2.push([loopPropValue, alias, index]) // a[*].b[*].name -> item.name
      }

      const genLoopValue = (value) => {
        let res = value
        if (replacement.length) {
          const items = [...replacement].reverse() // 反转，因为长的在后面，所以要调整为长的在前面
          items.forEach(([match, alias, index]) => {
            res = res.replace(new RegExp(createSafeExp(`${match}[*]`), 'g'), alias)
          })
        }
        return res
      }

      each(_props, (data, key) => {
        const { type, params, value } = data
        if (isEmpty(value) && emptyDrop) {
          return
        }
        if (type === VALUE_TYPES.EXP) {
          attrs[key] = `{ ${genLoopValue(value)} }`
        }
        else if (type === VALUE_TYPES.FN) {
          attrs[`${key}(${params})`] = `{ ${genLoopValue(value)} }`
        }
        else {
          attrs[key] = value
        }
      })

      const output = ([id, attrs, ...children]) => {
        return render ? [id, ...genJSONByRender(render, attrs, ...children)]
          : fromSchemaToJSON ? [id, ...fromSchemaToJSON(attrs, ...children)]
          : [id, attrs, ...children]
      }

      if (children.length && isArray(children[0]) && isArray(children[0][0])) {
        if (!fromSlotsToSchema) {
          throw new Error(`${id} 必须传入 fromSlotsToSchema`)
        }
        const slots = children.map(items => items.map(item => extract(item, replacement2)))
        const [_attrs, _children] = fromSlotsToSchema.call(monitor, attrs, slots)
        return output([id, _attrs, ..._children])
      }

      return output([id, attrs, ...children.map(child => extract(child, replacement2))])
    }
    const jsx = extract(this)

    return {
      fields,
      props,
      'render!': jsx,
    }
  }
}

export class DropDesigner extends Component {
  static props = {
    config: LayoutConfigType,
    elements: nonable(Array),
    source: ifexist(Object),
    type: ifexist(String),
    expParser: nonable(Function),
    max: nonable(Number),
    onSelect: true,
    onRemove: true,
    onChange: true,
    onUpdate: false,
    store: Store,
  }
  static propsCheckAsync = true
  static defaultProps = {
    store: new Store(null),
  }

  state = {
    move: null,
  }
  items = [null]

  onMounted() {
    const { elements, config, store } = this.props
    if (!elements || !elements.length) {
      return
    }

    const { groups } = config

    const sources = []
    groups.forEach(({ items }) => {
      items.forEach((item) => sources.push(item))
    })

    elements.forEach((element) => {
      const [id, _props, ..._children] = element
      const source = sources.find(item => item.id === id)

      // 清除不存在的素材
      // TODO 版本升级时，是否需要做兼容性考虑
      if (!source) {
        return
      }

      const item = this.createAndPutItem(this.items.length - 1, source)

      const { fromSchemaToSlots, fromJSONToSchema, renderFn } = source
      const [_attrs, ..._slots] = renderFn ? genSchemaByRender(renderFn, _props, ..._children)
        : fromJSONToSchema ? fromJSONToSchema(_props, ..._children)
        : [_props, ..._children]
      const [props, children] = fromSchemaToSlots ? fromSchemaToSlots.call(item, _attrs, _slots) : [_attrs, _slots]

      item.setExpProps(props)
      item.elements = children

      let bindField = ''
      let value = find(props, (_, key) => key === 'value')
      if (value && isExp(value)) {
        value = getExp(value)
      }
      if (/^[a-z0-9A-Z]+\.value$/.test(value)) {
        bindField = value.replace('.value', '')
      }
      item.bindField = bindField
    })
    this.forceUpdate()

    setTimeout(() => {
      this.handleChange()
      this.items.forEach((item) => {
        if (!item) {
          return
        }
        this.mountItem(item)
      })
    }, 16)

    store.subscribe(this.forceUpdate)
  }

  createAndPutItem(i, source) {
    const el = createRef()
    const { store } = this.props
    const item = new Monitor({
      el,
      source,
      store,
      getPassedProps: () => {
        return {
          ...this.props,
          onChange: () => {
            this.handleChange()
          },
        }
      },
    })

    this.items.splice(i + 1, 0, item, null)
    return item
  }

  handleDragDrop = (i, source) => {
    const { move } = this.state
    if (move !== null) {
      const reset = () => this.setState({ move: null })

      // 上下移动一格没有意义
      if (move - 1 === i || move + 1 === i) {
        reset()
        return
      }

      const item = this.items[move]
      this.items.splice(move, 2)
      this.items.splice(i + 1, 0, item, null)
      reset()
      return
    }

    const item = this.createAndPutItem(i, source)
    this.forceUpdate()

    setTimeout(() => {
      this.handleChange()
      this.mountItem(item)
      this.handleSelect({}, item)
    }, 16)
  }
  canDrop = (current) => {
    const { source, max, type } = this.props
    let res = true

    if (source && source.allows) {
      res = source.allows.includes(current.id) || (current.tag && source.allows.includes('tag:' + current.tag))
    }
    if (res && current.needs && !type) {
      res = current.needs.includes('!')
    }
    if (res && current.needs) {
      res = source ? current.needs.includes(source.id) || (source.tag && current.needs.includes('tag:' + source.tag)) : false
    }
    if (res && source && source.max && !this.state.move) {
      res = this.items.filter(item => !!item).length < source.max
    }
    if (res && max && !this.state.move) {
      res = this.items.filter(item => !!item).length < max
    }

    return res
  }

  mountItem(item) {
    item.source.mount(item.el.current, item)
  }

  handleChange = () => {
    const { onChange } = this.props
    if (onChange) {
      onChange(this.items.filter(item => !!item))
    }
  }
  handleRemove = (e, item) => {
    e.stopPropagation && e.stopPropagation()

    // 卸载DOM
    item.source.unmount(item.el.current)

    const i = this.items.findIndex(one => one === item)
    this.items.splice(i, 2)
    this.forceUpdate()

    const { onRemove } = this.props
    onRemove && onRemove(item)
    this.handleChange()
  }
  handleSelect = (e, item) => {
    const { store } = this.props
    e.stopPropagation && e.stopPropagation()

    if (store.getState() === item) {
      return
    }

    const { onSelect } = this.props
    store.dispatch(item) // 触发更新
    onSelect && onSelect(item)
  }

  onUpdated() {
    this.items.forEach((item) => {
      if (!item) {
        return
      }
      item.source.update ? item.source.update(item.el.current, item) : item.source.mount(item.el.current, item)
    })
  }

  render() {
    const selected = this.props.store.getState()
    const { className, type, source } = this.props
    const items = this.items
    const notNeedDropBox = source && source.max === 1 && items.filter(item => !!item).length >= 1
    return (
      <Section className={classnames('drop-designer', source && source.direction === 'h' ? 'drop-designer--horizontal' : 'drop-designer--vertical') + (className ? ' ' + className : '')}>
        {items.map((item, i) => {
          // 占位符
          if (!item) {
            if (notNeedDropBox) {
              return null
            }
            return (
              <DropBox
                key={i}
                type={type}
                className={classnames('drop-designer__row drop-designer__dropbox', items.length === 1 ? 'drop-designer__dropbox--only' : '')}
                onDrop={(next) => this.handleDragDrop(i, next)}
                canDrop={this.canDrop}
              >
              </DropBox>
            )
          }
          // 已经渲染好的
          return (
            <DragBox
              key={item.id}
              type={type}
              source={item.source}
              beginDrag={() => this.setState({ move: i })}
              endDrag={() => this.setState({ move: null })}
              className={classnames('drop-designer__row drop-designer__content', 'drop-designer__content--' + item.source.id)}
              render={(drag) => {
                return (
                  <Section
                    stylesheet={[
                      classnames(
                        'drop-designer__item',
                        selected && selected.id === item.id ? 'drop-designer__item--selected' : '',
                        // 自定义纵横模式
                        item.source.direction === 'h' ? 'drop-designer__item--horizontal' : 'drop-designer__item--vertical',
                      ),
                      // 支持自定义背景色
                      item.source.color ? { backgroundColor: item.source.color } : null,
                    ]}
                    onHit={(e) => this.handleSelect(e, item)}
                  >
                    <div className={classnames('drop-designer__item__content')} ref={item.el}></div>
                    <Section stylesheet={[classnames('drop-designer__item__actions')]}>
                      <span className={classnames('drop-designer__item__move')} ref={drag}><BsArrowsMove /></span>
                      <Confirm trigger={(show) => <Text stylesheet={[classnames('drop-designer__item__operator')]}><BsTrash onClick={show} /></Text>} onSubmit={(e) => this.handleRemove(e, item)} content="确定删除吗？" />
                    </Section>
                  </Section>
                )
              }}
            />
          )
        })}
      </Section>
    )
  }
}
