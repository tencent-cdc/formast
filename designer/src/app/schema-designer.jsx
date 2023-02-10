import {
  React, Component,
  useState, useRef, useCallback, useEffect,
  Section, If, Each, Else,
  Validator, ifexist, nonable,
  produce,
} from 'nautil'
import { isEmpty, each, isUndefined, isString } from 'ts-fns'
import { Button } from '../components/button/button.jsx'
import { Modal } from '../components/modal/modal.jsx'
import { Form, FormItem, Label, Input, FormLoop } from '../components/form/form.jsx'
import { classnames, parseKey } from '../utils'
import { usePopup } from '../hooks/popup.js'
import { Close } from '../components/close/close.jsx'
import { Confirm } from '../components/confirm/confirm.jsx'
import { RichPropEditor } from '../components/rich-prop-editor/rich-prop-editor.jsx'
import { VALUE_TYPES } from '../config/constants.js'
import { Popup } from '../libs/popup.js'
import { SchemaConfigType } from '../types/model.type.js'

const hasPolicy = (policies, field, policy) => {
  let hasPermission = policies.$ && policy in policies.$ ? !!policies.$[policy] : true
  if (policies[field] && policy in policies[field]) {
    hasPermission = !!policies[field][policy]
  }
  return hasPermission
}

export class SchemaDesigner extends Component {
  static props = {
    schemaJSON: nonable(Object),
    config: ifexist(SchemaConfigType),
  }
  static propsCheckAsync = true

  state = {
    isShow: false,
    editData: null,
  }

  handleAddField = () => {
    this.setState({ isShow: true, editData: null })
  }

  handleEditField = (field) => {
    if (/^<.*?>$/.test(field)) {
      const { EditSubmodel } = this.props
      EditSubmodel(field)
      return
    }

    const { schemaJSON = {} } = this.props
    const meta = schemaJSON[field]
    if (meta) {
      this.setState({ editData: [field, meta], isShow: true })
    }
  }

  handleRemoveField = (field) => {
    const { schemaJSON = {}, onSchemaJSONChange } = this.props
    const json = { ...schemaJSON }

    delete json[field]

    onSchemaJSONChange(json)
  }

  Render() {
    const { schemaJSON = {}, CreateSubmodel, config = {} } = this.props
    const fields = Object.keys(schemaJSON).filter(item => !/^\|.*?\|$/.test(item))

    const popup = usePopup()

    const handleSubmitMeta = useCallback(([field, meta]) => {
      if (!field) {
        popup.toast('字段Key必须填写')
        return
      }

      const { type, validators, ...attrs } = meta

      if (!type) {
        popup.toast('字段类型type必须填写')
        return
      }

      if (validators && validators.length) {
        for (let i = 0, len = validators.length; i < len; i ++) {
          const validator = validators[i]
          const keys = Object.keys(validator)
          for (let key of keys) {
            if (!validator[key]) {
              popup.toast(`第${i + 1}个校验器validator必须填写完整`)
              return
            }
          }
        }
      }

      const keys = Object.keys(attrs)
      for (let i = 0, len = keys.length; i < len; i ++) {
        const key = keys[i]
        // default 字段可以为空
        if (key === 'default') {
          continue
        }
        if (attrs[key] === '') {
          popup.toast(`${key}必须填写`)
          return
        }
      }

      const { schemaJSON = {}, onSchemaJSONChange } = this.props

      if (this.state.editData && this.state.editData[0] !== field && schemaJSON[field]) {
        popup.toast(`${field}已经存在，如果要覆盖，请先删除原有${field}后覆盖`)
        return
      }

      const next = {
        ...schemaJSON,
        [field]: meta,
      }

      if (next.validators && !next.validators.length) {
        delete next.validators
      }

      // 删除重命名前的字段
      if (this.state.editData && this.state.editData[0] !== field) {
        delete next[this.state.editData[0]]
      }

      onSchemaJSONChange(next)

      this.setState({ isShow: false, editData: null })

      return true
    }, [])

    const { policies = {} } = config

    return (
      <>
        <Section stylesheet={[classnames('main')]}>
          {fields.map((field) => {
            const isSubModel = /^<.*?>$/.test(field)
            const key = isSubModel ? field.substring(1, field.length - 1) : field
            const meta = isSubModel ? schemaJSON[`|${key}|`] || {} : schemaJSON[field]
            return (
              <Section stylesheet={[classnames('schema-designer__field')]} key={field}>
                <Section stylesheet={[classnames('schema-designer__field-label')]}>{(meta.label ? meta.label + ' ' : '') + field}</Section>
                <If is={hasPolicy(policies, key, 'edit')}>
                  <Button primary onHit={() => this.handleEditField(field)}>编辑</Button>
                </If>
                <If is={hasPolicy(policies, key, 'remove')}>
                  <Confirm
                    content="确定要删除该字段吗？"
                    onSubmit={() => this.handleRemoveField(field)}
                    trigger={show => <Button secondary onHit={show}>删除</Button>}
                  />
                </If>
              </Section>
            )
          })}

          <Section stylesheet={classnames('schema-designer__buttons')}>
            <Button primary onHit={this.handleAddField}>添加新字段</Button>
            {CreateSubmodel(
              show => <Button primary onHit={show}>添加子模型</Button>,
            )}
          </Section>
        </Section>

        <MetaForm
          width="80vw"
          title={this.state.editData ? '编辑字段' : '新建字段'}
          isShow={this.state.isShow}
          onSubmit={handleSubmitMeta}
          onClose={() => this.setState({ isShow: false })}
          onCancel={() => this.setState({ isShow: false })}
          data={this.state.editData}
          config={config}
        />
      </>
    )
  }
}

class MetaForm extends Component {
  static CustomField(props) {
    const { onSubmit } = props
    const [field, setField] = useState('')
    const el = useRef()
    return (
      <>
        <Label><span ref={el}><Input small value={field} onChange={e => setField(e.target.value)} placeholder="Key" /></span></Label>
        <Button type="button" secondary onHit={() => {
          if (!field) {
            el.current.querySelector('input').focus()
            return
          }
          onSubmit(field)
          setField('')
        }}>添加自定义属性</Button>
      </>
    )
  }

  state = {
    field: '',
    validators: [],
    form: {},
  }

  genEditors() {
    const { config = {}, data } = this.props
    const { attributes = [], rules = [] } = config

    const mergedEditors = []

    attributes.forEach((item) => {
      const existing = mergedEditors.find(one => one.key === item.key)
      if (existing) {
        Object.assign(existing, item)
      }
      else {
        mergedEditors.push(item)
      }
    })

    // 更新数据时
    if (data) {
      const [field] = data
      const relatedRules = rules.filter(item => item.field === field)
      relatedRules.forEach((rule) => {
        const { field, ...editor } = rule
        const existing = mergedEditors.find(one => one.key === rule.key)
        if (existing) {
          Object.assign(existing, editor)
        }
        else {
          mergedEditors.push(editor)
        }
      })
    }

    return mergedEditors
  }

  // 将填写的内容生成最后要保存的JSON
  parseMetaToJSON() {
    const editors = this.genEditors()
    const { field, validators, form } = this.state

    const parse = ({ type, params, value }, key) => {
      if (type === VALUE_TYPES.EXP) {
        try {
          return ['', value ? JSON.parse(value) : value]
        }
        catch (e) {
          throw new Error(`${key} 必须是一个合法的表达式`)
        }
      }
      else if (type === VALUE_TYPES.FN) {
        return [`(${params})`, value]
      }
      else {
        return ['', value]
      }
    }

    const json = {
      validators: validators.map((item, i) => {
        const { message, validate, determine } = item

        // 非函数形式
        // tyshemo.Loader 支持形式如 validators: [ "required('some is required!')" ] 的校验器
        if (validate.type === VALUE_TYPES.EXP) {
          const [key, params] = validate.value ? parseKey(validate.value) : []
          if (Validator[key] && params) {
            const validator = validate.value
            return validator
          }
          else {
            throw new Error(`validators[${i}].validate 填写的表达式不符合内置校验器写法`)
          }
        }

        const [dp, dv] = parse(determine, `validators[${i}].determine`)
        const [vp, vv] = parse(validate, `validators[${i}].validate`)
        const [mp, mv] = parse(message, `validators[${i}].message`)
        const validator = {
          [`determine${dp}`]: dv,
          [`validate${vp}`]: vv,
          [`message${mp}`]: mv,
        }
        return validator
      }),
    }

    editors.forEach((item) => {
      const { key, emptyDrop } = item
      if (key === 'field' || key === 'validators') {
        return
      }

      const pack = form[key]
      if (pack) {
        const [params, exp] = parse(pack, key)
        if (!(emptyDrop && isEmpty(exp))) {
          json[key + params] = exp
        }
      }
    })

    return [field, json]
  }

  // 从JSON还原出用于编辑的form对象
  parseSchemaToEdit(field, meta) {
    const { validators: _validators = [], ...attrs } = meta

    const parse = (attrs) => {
      const info = {}
      each(attrs, (value, attr) => {
        const [key, params] = parseKey(attr)
        if (params) {
          info[key] = {
            type: VALUE_TYPES.FN,
            params: params.join(','),
            value: isUndefined(value) ? '' : value,
          }
        }
        else if (typeof value === 'boolean') {
          info[key] = {
            type: VALUE_TYPES.BOOL,
            params: '',
            value,
          }
        }
        else if (typeof value !== 'string') {
          info[key] = {
            type: VALUE_TYPES.EXP,
            params: '',
            value: value && typeof value === 'object' ? JSON.stringify(value, null, 4) : value + '',
          }
        }
        else {
          info[key] = {
            type: VALUE_TYPES.STR,
            params: '',
            value: isUndefined(value) ? '' : value,
          }
        }
      })
      return info
    }

    const validators = _validators.map((item) => {
      if (isString(item)) {
        return {
          determine: {
            type: VALUE_TYPES.EXP,
            params: '',
            value: '',
          },
          validate: {
            type: VALUE_TYPES.EXP,
            params: '',
            value: item,
          },
          message: {
            type: VALUE_TYPES.STR,
            params: 'value',
            value: '',
          },
        }
      }
      return parse(item)
    })

    const form = parse(attrs)

    return {
      field,
      validators,
      form,
    }
  }

  resetData() {
    const { data } = this.props
    const editors = this.genEditors()
    const form = {}

    editors.forEach((editor) => {
      const { key, types, value, params = '' } = editor
      if (key === 'validators') {
        return
      }
      const type = types ? types[0] : 0
      form[key] = {
        type,
        params,
        value,
      }
    })

    if (data) {
      const [field, meta] = data
      const { validators, form: _form } = this.parseSchemaToEdit(field, meta)
      Object.assign(form, _form)
      this.setState({ field, validators, form })
    }
    else {
      this.setState({ field: '', validators: [], form })
    }
  }

  handleSubmit = () => {
    const { form } = this.state
    try {
      const json = this.parseMetaToJSON(form)
      if (this.props.onSubmit(json)) {
        this.resetData()
      }
    }
    catch (e) {
      Popup.toast(e)
    }
  }

  onMounted() {
    this.resetData()
  }

  onUpdated(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.resetData()
    }
  }

  Render() {
    const { aside, width, title, isShow, onClose, onCancel, config, data } = this.props
    const { field, validators, form } = this.state

    if (isEmpty(form)) {
      return null
    }

    const { CustomField } = MetaForm

    const handleChangeState = (fn) => {
      const next = produce(this.state, state => {
        fn(state)
      })
      this.setState(next)
    }

    const handleAddValidator = (index) => {
      handleChangeState(state => {
        state.validators.splice(isEmpty(index) ? 0 : index + 1, 0, {
          determine: {
            type: VALUE_TYPES.EXP,
            params: '',
            value: '',
          },
          validate: {
            type: VALUE_TYPES.FN,
            params: 'value',
            value: '',
          },
          message: {
            type: VALUE_TYPES.STR,
            params: 'value',
            value: '',
          },
        })
      })
    }

    const handleDelValidator = (index) => {
      handleChangeState(state => {
        state.validators.splice(index, 1)
      })
    }

    const handleAddCustomField = (field) => {
      if (this.state.form[field]) {
        return Popup.toast('不允许添加已经存在的属性')
      }
      handleChangeState(state => {
        state.form[field] = {
          type: VALUE_TYPES.STR,
          params: '',
          value: '',
        }
      })
    }

    const handleRemoveCustomField = (field) => {
      const { [field]: _, ...form } = this.state.form
      this.setState({ form })
    }

    const handleChangeForm = (kv) => {
      handleChangeState(state => Object.assign(state.form, kv))
    }

    const editors = this.genEditors()
    const keys = editors.map(item => item.key)
    const formKeys = Object.keys(form)
    const customKeys = formKeys.filter(key => !keys.includes(key))
    const { policies = {} } = config

    return (
      <Modal isShow={isShow} width={width} title={title} onSubmit={this.handleSubmit} onCancel={onCancel} onClose={onClose} className={classnames('schema-designer__modal')}>
        <Form aside={aside}>
          <FormItem>
            <Label>字段名</Label>
            <Input value={field} onChange={(e) => handleChangeState(state => state.field = e.target.value)} disabled={data && !hasPolicy(policies, data[0], 'rename')} />
          </FormItem>
          <Each of={editors} render={(editor) =>
            <If key={editor.key} is={editor.key === 'validators'} render={() => {
              return (
                <FormItem>
                  <Label>{editor.title}({editor.key})</Label>
                  <FormLoop
                    items={validators}
                    onAdd={handleAddValidator}
                    onDel={handleDelValidator}
                    onChange={validators => this.setState({ validators })}
                    canAdd={() => hasPolicy(policies, field, 'validator_add')}
                    canRemove={() => hasPolicy(policies, field, 'validator_remove')}
                    render={(i, validator, onChange) => {
                      return (
                        <>
                          <FormItem stylesheet={[classnames('form-item--rich')]}>
                            <RichPropEditor label="校验函数(validate)" types={[VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={validator.validate} onChange={validate => onChange({ validate })} disabled={!hasPolicy(policies, field, 'validator_edit')} />
                          </FormItem>
                          <If is={validator.validate.type === VALUE_TYPES.FN}>
                            <FormItem stylesheet={[classnames('form-item--rich')]}>
                              <RichPropEditor label="是否校验(determine)" types={[VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={validator.determine} onChange={determine => onChange({ determine })} disabled={!hasPolicy(policies, field, 'validator_edit')} />
                            </FormItem>
                            <FormItem stylesheet={[classnames('form-item--rich')]}>
                              <RichPropEditor label="消息(message)" types={[VALUE_TYPES.STR ,VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={validator.message} onChange={message => onChange({ message })} disabled={!hasPolicy(policies, field, 'validator_edit')} />
                            </FormItem>
                          </If>
                          {i !== validators.length - 1 ? <Section stylesheet={[classnames('line')]} /> : null}
                        </>
                      )
                    }}
                  />
                </FormItem>
              )
            }}>
              <Else render={() => {
                return (
                  <FormItem stylesheet={[classnames('form-item--rich')]}>
                    <RichPropEditor
                      label={(editor.title || '') + '(' + editor.key + ')'}
                      types={editor.types}
                      data={this.state.form[editor.key]}
                      onChange={data => handleChangeForm({ [editor.key]: data })}
                      options={editor.options}
                      disabled={editor.disabled || !hasPolicy(policies, field, editor.key + '_edit')}
                      description={editor.description}
                      placeholder={editor.placeholder}
                    />
                  </FormItem>
                )
              }} />
            </If>
          } />
          {
            customKeys.map((key) => {
              const custom = form[key]
              const { key: _, ...data } = custom
              return (
                <FormItem key={key} stylesheet={[classnames('form-item--rich', 'schema-designer-custom-field')]}>
                  <RichPropEditor label={key} data={data} types={[VALUE_TYPES.STR, VALUE_TYPES.BOOL, VALUE_TYPES.EXP, VALUE_TYPES.FN]} onChange={data => handleChangeForm({ [key]: data })} />
                  <Close onHit={() => handleRemoveCustomField(key)} />
                </FormItem>
              )
            })
          }
          <FormItem>
            <CustomField onSubmit={handleAddCustomField} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default SchemaDesigner
