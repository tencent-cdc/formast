import { React, Component, Section, Text, Each } from 'nautil'
import { classnames } from '../utils/index.js'
import { LayoutDesigner } from './layout-designer.jsx'
import { Close } from '../components/close/close.jsx'
import { Button } from '../components/button/button.jsx'

import { Form, FormItem, Label, Input } from '../components/form/form.jsx'
import { AutoModal } from '../components/modal/modal.jsx'
import { Popup } from '../libs/popup.js'
import { Confirm } from '../components/confirm/confirm.jsx'

export class ComponentsDesigner extends Component {
  state = {
    selectedComponentName: '',
    newComponentName: '',
  }

  onMounted() {
    // 进入的时候，如果有组件，那么默认选中第一个组件
    const { json = {} } = this.attrs
    const keys = Object.keys(json)
    if (!keys.length) {
      return
    }
    const selectedComponentName = keys[0]
    this.setState({ selectedComponentName })
  }

  handleInputComponent = (name) => {
    const newComponentName = name ? name[0].toUpperCase() + name.substr(1) : name
    this.setState({ newComponentName })
  }

  handleSubmitComponent = () => {
    const { newComponentName: name } = this.state
    const { json = {}, onComponentsJSONChange } = this.props
    const { components = {} } = json

    if (name in components) {
      Popup.toast('组件已经存在，请使用其他组件名')
      return false
    }

    const componentsJSON = {
      ...components,
      [name]: {
        'render!': [],
      },
    }

    onComponentsJSONChange(componentsJSON)
    this.setState({ selectedComponentName: name, newComponentName: '' })
    return true
  }

  handleRemoveComponent = (e, name) => {
    e.stopPropagation()

    const { json = {}, onComponentsJSONChange } = this.props
    const { components = {} } = json

    const next = { ...components }
    delete next[name]

    onComponentsJSONChange(next)
    return true
  }

  handleChangeComponent = (componentJSON) => {
    const { selectedComponentName } = this.state
    const { json = {}, onComponentsJSONChange } = this.props
    const { components = {} } = json

    const next = { ...components }
    next[selectedComponentName] = componentJSON

    onComponentsJSONChange(next)
  }

  Render(props) {
    const { layoutConfig, json = {} } = props
    const componentsJSON = json.components || {}
    const componentNames = Object.keys(componentsJSON)

    const { selectedComponentName } = this.state
    const selectedComponentJSON = selectedComponentName && componentsJSON[selectedComponentName]

    return (
      <Section stylesheet={classnames('components-designer')}>
        <Section stylesheet={classnames('components-designer__names')}>
          <Each of={componentNames} render={(componentName) =>
            <Section
              stylesheet={classnames('components-designer__name', componentName === selectedComponentName ? 'components-designer__name--active' : '')}
              onHit={() => this.setState({ selectedComponentName: componentName })}
            >
              <Text>{componentName}</Text>
              <Confirm
                trigger={show => <Close onHit={show} />}
                title="提示"
                content={`确认删除组件${componentName}吗？`}
                onSubmit={(e) => this.handleRemoveComponent(e, componentName)}
              />
            </Section>
          } />
           <AutoModal
            title="添加组件"
            trigger={show => <Button primary onHit={show} stylesheet={[classnames('components-designer__component-add-btn')]}>+ 添加组件</Button>}
            onCancel={() => this.setState({ newComponentName: '' })}
            onClose={() => this.setState({ newComponentName: '' })}
            onSubmit={this.handleSubmitComponent}
          >
            <Form>
              <FormItem>
                <Label>组件名</Label>
                <Input value={this.state.newComponentName} onChange={e => this.handleInputComponent(e.target.value)} placeholder="全英文，首字母大写" />
              </FormItem>
            </Form>
          </AutoModal>
        </Section>
        <Section stylesheet={classnames('components-designer__main')}>
          <Each of={componentNames} render={(componentName) =>
            <Section stylesheet={[{ flex: 1, display: selectedComponentName === componentName ? 'flex' : 'none' }]}>
              <LayoutDesigner layoutConfig={layoutConfig} json={selectedComponentJSON} onLayoutJSONChange={this.handleChangeComponent} />
            </Section>
          } />
        </Section>
      </Section>
    )
  }
}
export default ComponentsDesigner