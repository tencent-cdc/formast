import { React, Component, Section, ifexist, Any, nonable, Int } from 'nautil'
import { classnames } from '../../utils'
import { DragDesigner, DropDesigner } from '../drag-drop/drag-drop-designer.jsx'
import { LayoutConfigType } from '../../types/layout.type.js'

export class Designer extends Component {
  static props = {
    elements: nonable(Array),
    config: LayoutConfigType,
    buttons: ifexist(Any),
    settings: ifexist(Any),
    onRemove: true,
    onSelect: true,
    onChange: true,
    expParser: ifexist(Function),
    max: nonable(Int),
  }
  static propsCheckAsync = true

  handleRemove = (monitor) => {
    const { onRemove } = this.props
    onRemove(monitor)
  }
  handleSelect = (selected) => {
    const { onSelect } = this.props
    onSelect(selected)
  }
  handleChange = (monitors) => {
    const { onChange } = this.props
    // 只需要顶层第一个
    const top = monitors.length ? monitors[0] : null
    onChange(top)
  }

  render() {
    const { elements, config, expParser, max, settings } = this.props

    return (
      <>
        <Section stylesheet={[classnames('sidebar sidebar--left designer__sidebar dragable')]}>
          <DragDesigner config={config} />
        </Section>
        <Section stylesheet={[classnames('main designer__main')]}>
          <Section stylesheet={classnames('designer__canvas')}>
            <DropDesigner
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              onRemove={this.handleRemove}
              expParser={expParser}
              max={max}
              config={config}
              elements={elements}
            />
          </Section>
        </Section>
        {settings ? (
          <Section stylesheet={[classnames('sidebar sidebar--right designer__sidebar designer__settings')]}>
            {settings}
          </Section>
        ) : null}
      </>
    )
  }
}
export default Designer
