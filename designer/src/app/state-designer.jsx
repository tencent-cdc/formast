import { React, Component, Section, Textarea } from 'nautil'
import { Popup } from '../libs/popup.js'
import { classnames } from '../utils'

export class StateDesigner extends Component {
  state = {
    json: '',
  }

  onMounted() {
    const { stateJSON = {}, config = {} } = this.props
    const state = { ...config, ...stateJSON }
    const json = JSON.stringify(state, null, 4)
    this.setState({ json })
  }

  handleStateJSONChange = (e) => {
    const { onStateJSONChange } = this.props
    const value = e.target.value
    this.setState({ json: value })

    try {
      const state = JSON.parse(value)
      Popup.hide()
      onStateJSONChange(state)
    }
    catch (e) {
      Popup.toast('JSON格式不对：' + e)
    }
  }

  render() {
    const { json } = this.state

    return (
      <Section stylesheet={[classnames('state-designer')]}>
        <Textarea stylesheet={[classnames('state-designer__editor')]} value={json} onChange={this.handleStateJSONChange} />
      </Section>
    )
  }
}
