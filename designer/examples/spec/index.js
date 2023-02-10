import { createFormastDesigner } from '../../src/index.js'
import { InputConfig, TextareaConfig, SelectConfig, FormGroupConfig, FormItemConfig, RadioConfig, CheckboxConfig, InputNumberConfig, FormLoopConfig } from '../../src/config/components.jsx' // 内置的例子
import { Popup } from '../../src/libs/popup.js'
import { SchemaAttributes } from '../../src/config/model.js'

const layout = {
  groups: [
    {
      id: 'layout',
      title: '布局素材',
      items: [
        FormGroupConfig,
        FormItemConfig,
        FormLoopConfig,
      ],
    },
    {
      id: 'atom',
      title: '原子素材',
      items: [
        InputConfig,
        InputNumberConfig,
        TextareaConfig,
        SelectConfig,
        RadioConfig,
        CheckboxConfig,
      ],
    },
  ],
}
const model = {
  schema: {
    attributes: SchemaAttributes,
  },
}

const cacheJson = sessionStorage.getItem('__JSON__')
const json = cacheJson ? JSON.parse(cacheJson) : {}
const editor = createFormastDesigner('#form-editor', {
  attachTopBar(el) {
    el.innerHTML = `
      <div class="nav">
        Formast Designer
      </div>
    `
  },
  json,
  layout,
  model,
})

editor.on('save', (json) => {
  console.log(json)
  const formJSON = JSON.stringify(json)
  sessionStorage.setItem('__JSON__', formJSON)
  Popup.toast('保存成功')
})

editor.on('reset', () => {
  editor.setJSON({})
})

// editor.mount('#form-editor')
// editor.unmount()

// 使用已经存在的备份，可以从服务端拉取后异步set，整个编辑区会重新刷新
// editor.setJSON(json)
// 之后必须自己调用refresh刷新界面
// editor.refresh()

// // 获取当前的json
// editor.getJSON()

// editor.on('download', (json) => {
//   // ...
// })
