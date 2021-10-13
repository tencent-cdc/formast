# 组件定义

在系统中，使用什么组件渲染布局节点，由前端代码对应的组件和节点描述中的type决定。 但我们需要在编辑中，对组件的信息进行配置，从而在编辑器输出时，包含组件需要的信息。

例如schema中有这样一段描述：

```
{
  type: 'SomeComponent',
  props: {
    icon: 'search',
    message: '内容已完成',
  },
}
```

在编辑器中，我们需要生成这段描述，怎么生成？需要通过从编辑器中拖拽 SomeComponent 组件到画布中进行布局。而编辑器之所以能够拖拽该组件，是因为我们要对编辑器进行配置，现在就阐述如何对组件进行配置。

## 配置

结构大致如下：

```ts
interface FormastConfig {
  title: string, // 组件在编辑器中的名称
  icon?: string | ReactComponent, // 组件在编辑器中展示的icon
  description?: string, // 组件在编辑器中的描述

  // 组件在 schema json 中的 `type` 值
  // 需要注意，在整个系统中， type 值必须是唯一的，否则会发生覆盖，造成错误
  type: string,
  // 该组件哪些可以配置，编辑器右侧配置区
  settings?: Array<
    {
      // key: 指定要配置 componentJson 中哪一个节点，例如 'props.value', 'bind', 'model', 'props.onChange'
      // 其中，'visible', 'id', 'bind', 'model', 'deps', 'vars', 'repeat' 这几个字段格式固定，key 配置为它们时，不需要传入其他全部信息，只有 props 相关的属性，需要传入其他配置项来支持
      // 'type' 'children' 是固定的，即使使用，也无效
      key: string,
      title?: string, // 在编辑器中展示的名字
      description?: string, // 进行说明
      types?: Array<'string' | 'number' | 'boolean' | 'json' | 'expression' | 'null'>, // 支持哪些数据类型
      // 传入 options 后 types 失效，该 key 的值只能从 options 中选取，option.value 将作为最终的值
      options?: Array<
        {
          label: String,
          // value 必须为遵循 schema 的值格式，例如 value: "{ some }"，直接用表达式
          value: Any,
        },
      >,
      default?: any, // 默认值，也是守护值，当出错时使用该类型和值
      disabled?: boolean, // 是否禁止编辑
      required?: boolean, // 是否必须填写
      nondrop?: boolean, // 当值为空时，是否删除
      fn?: boolean, // 是否支持函数，默认不传时可在支持与不支持之间切换，传入 false 后不支持，传入 true 表示支持，传入 boolean 后强制无法切换
      params?: '', // 如果可以为函数时的默认参数
    },
  >,

  // 是否支持子组件，如果支持，可传入一个字符串数组
  // 传入 true 表示普通的 children，传入数组（包括空数组）表示函数 children
  // 例如你希望生成的 children 为 children(item,index): 那么传入的字符串数组为 ['item', 'index']，它们会在作用域内使用
  children: boolean | string[],
  max?: number, // 最多可以放多少个子组件
  direction?: 'h' | 'v', // 子组件的排列方向
  // 该组件属于哪一个tag，多个组件可以使用同一个tag
  tag?: string,
  // 组件只能放在needs的组件中，可以传入tag，例如 atom，其中 atom 为 tag 值
  needs?: string[],
  // 组件只允许allows中的组件作为子组件拖入，可以传 tag
  allows?: string[],

  // 用于在预览渲染时，给默认的 props 避免报错
  // 和 settings 里面的 default 值作用不同，settings 里面的 default 用于生成默认的 JSON，而此处的 defaults 仅用于编辑器预览，对 JSON 没有任何影响
  defaults: {},
  // 用以在预览时替换掉原始组件进行预览，原始组件可能在预览时有些问题，可通过 template 来避免问题
  template: ReactComponent,
}
```

通过该配置，编辑器就可以知道自己需要展示哪些组件，每个组件拥有哪些props可以配置和生成，以及根据这些逻辑，生成最终的schema布局描述。

## 组件配置

在实例化编辑器时，传入 components 配置项，在每个组件中增加 `formastConfig` 属性。

```js
function TabsBox() {}

TabsBox.formastConfig = {
  title: 'Tabs',
  icon: 'iconfont-tabs', // 传入对应的 className 来实现 icon，className 的样式由外部 css 来控制
  description: '在编辑器中提示这个组件的信息',

  type: 'TabsBox',
  settings: [
    {
      key: 'data',
      types: ['expression'],
      title: '数据源',
      description: '读取值必须是符合格式要求的数据列表',
      default: {
        type: 'expression',
        value: '',
      },
      required: true,
    },
    {
      key: 'disabled',
      types: ['boolean', 'expression'],
      default: {
        type: 'boolean',
        value: false,
      },
    },
  ],

  children: true,
  max: 1,
  direction: 'h',
  tag: 'tabs',
  allows: ['layout'],
}
```

例如，我们想要使用 antd 的 Input 组件，我们可以如下操作：

```js
import { Input } from 'antd'

Input.formastConfig = {
  title: '单行文本',
  icon: 'antd-input',
  type: 'Input',
  settings: [
    {
      key: 'bind',
    }
  ]
}
```

这样我们就可以把这个 Input 放到编辑器实例化时的配置中，让它在编辑器中生效。

> 当然，我们可以同时给它添加 `formast` 属性，并放到 createReactFormast 的配置中作为运行时的组件。
> 我们可以把所有需要用到的 antd 组件都做这样的处理之后，放到我们的项目中，这样就可以使用 formast 和 antd 完成表单构建。
