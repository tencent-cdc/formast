import { React, Component, Section, produce, Each } from 'nautil'
import { Button } from '../components/button/button.jsx'
import { Popup } from '../libs/popup.js'
import { Modal } from '../components/modal/modal.jsx'
import { Form, FormItem, Label, Input, Textarea } from '../components/form/form.jsx'
import { classnames, parseKey } from '../utils'
import { Confirm } from '../components/confirm/confirm.jsx'

export class MethodsDesigner extends Component {
  static state = {
    isShow: false,
    form: {
      name: '',
      params: '',
      fn: '',
    },
    edit: '',
  }

  state = MethodsDesigner.state

  handleAddMethod = () => {
    this.setState({ isShow: true })
  }

  handleSubmitMehod = () => {
    const { form, edit } = this.state
    const { methodsJSON } = this.attrs
    const { onMethodsJSONChange } = this.props

    const { name, params, fn } = form

    if (!name) {
      return Popup.toast('请填写方法名')
    }

    if (!fn) {
      return Popup.toast('请填写函数体')
    }

    const method = `${name}(${params})`
    const next = produce(methodsJSON, json => {
      if (edit && method !== edit) {
        delete json[edit]
      }
      json[method] = fn
    })

    onMethodsJSONChange(next)

    this.setState(MethodsDesigner.state)
  }

  handleCancelMehod = () => {
    this.setState(MethodsDesigner.state)
  }

  handleEditMethod = (method) => {
    const { methodsJSON } = this.attrs
    const fn = methodsJSON[method]
    const [name, params] = parseKey(method)
    this.setState({
      form: {
        name,
        params: params.join(','),
        fn,
      },
      edit: method,
      isShow: true,
    })
  }

  handleRemoveMethod = (method) => {
    const { methodsJSON } = this.attrs
    const { onMethodsJSONChange } = this.props

    const next = produce(methodsJSON, json => {
      delete json[method]
    })

    onMethodsJSONChange(next)
  }

  render() {
    const { isShow, form } = this.state
    const { methodsJSON } = this.attrs
    return (
      <Section stylesheet={[classnames('main methods-designer')]}>
        <Each of={methodsJSON} render={(fn, method) =>
          <Section stylesheet={[classnames('methods-designer__item')]}>
            <Section stylesheet={[classnames('methods-designer__item-content')]}>{method}: {fn}</Section>
            <Button primary onHit={() => this.handleEditMethod(method)}>编辑</Button>
            <Confirm
              content="确定要删除该方法吗？"
              onSubmit={() => this.handleRemoveMethod(method)}
              trigger={show => <Button secondary onHit={show}>删除</Button>}
            />
          </Section>
        } />

        <Section stylesheet={classnames('methods-designer__buttons')}>
          <Button primary onHit={this.handleAddMethod}>添加新方法</Button>
        </Section>

        <Modal isShow={isShow} onSubmit={this.handleSubmitMehod} onCancel={this.handleCancelMehod} onClose={this.handleCancelMehod} title="添加新方法">
          <Form>
            <FormItem>
              <Label>方法名</Label>
              <Input value={form.name} onChange={e => this.update(state => { state.form.name = e.target.value })} />
            </FormItem>
            <FormItem>
              <Label>参数</Label>
              <Input value={form.params} onChange={e => this.update(state => { state.form.params = e.target.value })} />
            </FormItem>
            <FormItem>
              <Label>函数体</Label>
              <Textarea value={form.fn} onChange={e => this.update(state => { state.form.fn = e.target.value })} />
            </FormItem>
          </Form>
        </Modal>
      </Section>
    )
  }
}
