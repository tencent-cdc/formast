import { React, Component, Section, If, createRef } from 'nautil'
import { Button } from '../components/button/button.jsx'
import { classnames, globalModelScope } from '../utils'
import { ModelDesigner } from './model-designer.jsx'
import { ComponentsDesigner } from './components-designer.jsx'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { LayoutDesigner } from './layout-designer.jsx'
import { decideby } from 'ts-fns'

class App extends Component {
  state = {
    activeTopTab: 'layout',
  }

  topBar = createRef()

  onInit() {
    // 进来以后实例化，在render中好用
    const { json } = this.props
    const { model = {} } = json || {}
    globalModelScope.set(model)
  }

  handleModelJSONChange = (model) => {
    const { json = {}, onJSONChange } = this.props
    const { components, layout } = json
    const next = { model, components, layout }
    onJSONChange(next)
  }

  handleComponentsChange = (components) => {
    const { json = {}, onJSONChange } = this.props
    const { model, layout } = json
    const next = { model, components, layout }
    onJSONChange(next)
  }

  handleLayoutChange = (layout) => {
    const { json = {}, onJSONChange } = this.props
    const { components, model } = json
    const next = { model, components, layout }
    onJSONChange(next)
  }

  onMounted() {
    const { config, attachTopBar } = this.props
    const activeTopTab = decideby(() => {
      if (!config.disableLayout) {
        return 'layout'
      }
      else if (!config.disableComponents) {
        return 'components'
      }
      else {
        return 'model'
      }
    })
    this.setState({ activeTopTab })

    if (attachTopBar) {
      attachTopBar(this.topBar.current)
    }
  }

  render() {
    const { config = {}, onSave, onReset, onExport, json = {}, onImport, attachTopBar } = this.props
    const { activeTopTab } = this.state
    const setActiveTopTab = (activeTopTab) => this.setState({ activeTopTab })
    const { model } = json
    const disabled = [config.disableModel, config.disableComponents, config.disableLayout].filter(item => !!item).length > 1
    const hasNoBtns = [config.disableSave, config.disableReset, config.disableImport, config.disableExport].filter(item => !!item).length === 4

    return (
      <DndProvider backend={HTML5Backend}>
        <Section stylesheet={[classnames('app')]}>
          <If is={!disabled || !hasNoBtns || !attachTopBar}>
            <Section stylesheet={[classnames('app__top-bar')]}>
              <If is={!!attachTopBar}>
                <div className={classnames('app_top-bar-attch')} ref={this.topBar}></div>
              </If>
              <If is={!disabled}>
                {!config.disableModel ? <Section stylesheet={[classnames('app__top-tab', activeTopTab === 'model' ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab('model')}>模型设计</Section> : null}
                {!config.disableComponents ? <Section stylesheet={[classnames('app__top-tab', activeTopTab === 'components' ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab('components')}>组件设计</Section> : null}
                {!config.disableLayout ? <Section stylesheet={[classnames('app__top-tab', activeTopTab === 'layout' ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab('layout')}>表单设计</Section> : null}
              </If>
              <If is={!hasNoBtns}>
                <Section stylesheet={classnames('app__top-buttons')}>
                  {!config.disableSave ? <Button primary onHit={() => onSave()}>保存</Button> : null}
                  {!config.disableReset ? <Button secondary onHit={() => onReset()}>重置</Button> : null}
                  {!config.disableImport ? <Button secondary onHit={() => onImport()}>导入</Button> : null}
                  {!config.disableExport ? <Button secondary onHit={() => onExport()}>导出</Button> : null}
                </Section>
              </If>
            </Section>
          </If>
          {!config.disableModel && activeTopTab === 'model' ? <ModelDesigner modelConfig={config.model} modelJSON={model} onModelJSONChange={this.handleModelJSONChange} /> : null}
          {!config.disableComponents && activeTopTab === 'components' ? <ComponentsDesigner layoutConfig={config.layout} json={json} onComponentsJSONChange={this.handleComponentsChange} /> : null}
          {!config.disableLayout && activeTopTab === 'layout' ? <LayoutDesigner layoutConfig={config.layout} json={json} onLayoutJSONChange={this.handleLayoutChange} useComponents={true} /> : null}
        </Section>
      </DndProvider>
    )
  }
}

export default App
