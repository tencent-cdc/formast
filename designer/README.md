FORMAST DESIGNER
================

Formast（帆桅）表单可视化设计器，用以通过填写拖拽等界面形式，生成用于 formast 的 JSON。

## 安装

```
npm i formast-designer
```

你也可以通过 CDN 进行引用。

```html
<script src="/formast-designer/dist/browser.js"></script>
```

CDN 引用时，接口通过 `window['formast-designer']` 导出。

```js
const { createFormastDesigner } = window['formast-designer']
```

## 使用

```js
<div id="#designer"></div>

const designer = createFormastDesigner('#designer', config)
```

通过 `createFormastDesigner` 你可以创建一个 FormastDesigner 实例，并且挂载在一个 DOM 节点上，你需要设置这个 DOM 节点的宽高，从而限制设计器内部的宽高。另外，你还需要自己撰写部分 css 来控制 formast 的表单元素的样式。

所有的交互效果内部都已经写好了，可自定义的东西，需要通过 `config` 进行配置，但是 `config` 是可选的。

设计器对外暴露的接口如下：

### on(event, callback)

监听设计器内部暴露的事件。

```js
designer.on('save', (json) => {
  console.log(json)
})
```

内置事件包含：

- save: 点击保存按钮，点击按钮没有任何效果，你需要自己在回调函数中写具体效果
- reset: 点击重置按钮，点击该按钮不会真的马上重置设计器内容，需要你在回调函数中通过调用 setJSON 和 refresh 方法刷新设计器内容。
- import: 点击导入按钮后触发，点击会弹窗对话框让你选择 JSON 文件。
- export: 点击导出按钮后触发，下载按钮会帮你下载一份 JSON。

### getJSON()

获取当前设计器中的内容能生成的 JSON 对象。

### setJSON(json)

设置设计器中的新 JSON，它不会触发设计器内界面更新，一般需要配合 refresh 一起使用。

### refresh()

更新设计器内的界面。

### mount(el)/unmount()

将设计器挂载/卸载。
使用 `createFormastDesigner` 时，会自动挂载。

## 配置

在使用 `createFormastDesigner` 时，你可以传入一个 `config` 来进行自定义配置。

```
{
  disableSave: 禁用保存按钮,
  disableReset: 禁用重置按钮,
  disableImport: 禁用导入按钮,
  disableExport: 禁用导出按钮,
  itemsSetting: { // 对组件设计进行配置
    groups: [ // 分组，在设计器右侧素材区，不同素材将被分组
      {
        id: String, // 给分组分配一个唯一标识，可以是已经存在的分组，配置覆盖的时候，同 id 的分组信息将被合并
        title: String, // 分组显示名
        items: [
          {
            id: String, // 组件的名字，将作为组件在 formast 中使用
            title: String, // 组件显示名
            icon: ifexist(String), // 组件显示时前面可以有一个 icon，icon 从 react-icons 所有 MIT 的图标中挑选
            direction: ifexist('h'), // 组件内部元素是否横向排布（默认是纵向的）

            // 组件的 props 配置，通过该配置，在设计时，点击组件的 geer icon，会展开配置界面
            props: ifexist([
              {
                key: String, // prop 的名字，例如 type, value, onChange 等
                types: new List(Object.values(VALUE_TYPES)), // 该 prop 可以支持哪种类型的值，0-纯文本, 1-表达式, 2-函数式，具体你可以在配置的时候传入不同值看效果
                title: ifexist(String), // prop 在配置界面的显示名
                defender: ifexist(Function), // prop 的值会被直接反应到设计器界面上让你可以即使预览效果，但是有的时候，你填写的内容会有问题，通过 defender 来兜底这种问题
              }
            ]),

            allows: ifexist([String]), // 组件内部如果可以挂载子组件，那么可以挂载那些子组件，可以填写其他 item 的 id/tag
            needs: ifexist([String]), // 组件如果要被以子组件形式挂载，那么只允许这些组件挂载自己
            tag: ifexist(String), // allows/needs 根据 id/tag 来进行判断，但是每个 item 的 id 是唯一的，而不同 item tag 可以相同，这样可以批量处理一些是否允许挂载问题

            recoverGroupsFromJSON(children), // 将来自上层传递的JSON格式化为符合mount中DropBox需要的内容
            convertGroupsToJSON(groups), // 将来自下层DropBox提交格式化为最终保存的JSON

            // 当前这个 item 在渲染到设计器中时，如何进行渲染？
            // 你需要自己写挂载程序来决定渲染效果
            mount(el, monitor) {
              // monitor 在下面详细解释
              ReactDOM.render(<MyComponent />, el)
            },
            // 当组件更新时，该方法被调用，如果是 react 系统，mount 和 update 一般是一样的，但是，其他系统中，mount 和 update 可能不同，因此，设计时，我将这两个东西分开
            update(el, monitor) {},
            // 点击 delete 图标删除组件时如何卸载组件
            unmount(el) {
              ReactDOM.unmountComponentAtNode(el)
            },
          }
        ]
      }
    ]
  },
  layoutSetting: {}, // 和 items 内容结构一样，只是作用在表单设计上
}
```

这个配置对象比较复杂，但是你慢慢阅读，可以理解其中的设计逻辑。

**Monitor**

在 `mount` `update` 配置中，提供了 `monitor` 这个参数，它用于提供一些设计器内部的运行时结果。
你可以通过 console.log 打印出来看它有些什么东西。
比较常用的是 `DropBox` 和 `getComputedProps`。

`DropBox` 是用于提供内部可以放置子组件的 React 组件，目前仅支持 react 系统实现内部子组件效果。具体使用如下：

```js
mount(el, monitor) {
  const { DropBox } = monitor
  ReactDOM.render(<MyComponent>
    <h3>子组件：</h3>
    <DropBox />
  </MyComponent>, el)
}
```

将 DropBox 放在你需要拖放的位置，这样，你就可以为某一个组件放置子组件。

`getComputedProps` 则用于根据 props 配置项以及你在配置面板中填写的内容动态计算一个 props 对象给你，你可以用这些 props 完成更详细的预览效果，例如：

```js
mount(el, monitor) {
  const { getComputedProps } = monitor
  const props = getComputedProps()
  ReactDOM.render(<Input {...props} />, el)
}
```
