# 宏

本文将教会你如何使用宏和开发自己的宏。

## 什么是宏？

宏是一种“批处理”，即把原本你要通过多个步骤才能做完事的多条命令，组合成一条命令，以完成想要实现的效果。在 formast 中，你可以在 schema JSON 中发现宏的使用，简单讲，宏通过编程的方式让你在 JSON 中用一个命令符表达一系列原本需要复杂编程的过程。其中最典型的就是内置宏 render，它用于将 JSON 中的某个节点渲染为对应框架的节点对象。

## 如何使用宏？

在 schema JSON 中，你只需要在属性后面加上`!`，并在后面跟上宏名称即可。例如：

```json
{
  "type": "SomeGroup",
  "props": {
    "header!": { // 此处调用了 render 宏，将 header 节点的值作为组件信息进行渲染
      "type": "h2",
      "children": "标题"
    },
    "sing()!debug": "{ some.value }" // 此处调用了 debug 宏，在 SomeGroup 组件内部调用 sing() 方法时会同时调用 debug 宏来打印 sing() 的执行结果
  }
}
```

## 内置宏

**render内置宏**

所有渲染由 render 宏完成。

```
render(data: Object, compute: Function, context: object, subscribe: Function)
```

- data: 从 schema JSON 中获取的节点信息
- compute(ref): { id, key, props ... } 实时计算组件的动态结果，用以得到将用来进行渲染的效果
- context: { components } 由最顶级的创建信息中传递下来
- subscribe(dispatch, collection): viod 订阅函数，传入一个 dispatch 函数，该函数用以触发更新，collection 则是从 compute执行结果中获得

render 的返回结果即对应 JSON 节点的渲染结果，比如在 react 中，它返回一个 ReactNode。

**debug内置宏/函数**

基于 console.debug 实现的控制台打印宏。例如

```
{
  "onClick()!debug": "{ some_field }", // -> 通过宏的形式调用
  "onChange(e)": "{ debug(e) }" // -> 通过函数的形式调用
}
```

## 自定义宏

你可以开发自己的宏，甚至覆盖内置的 render, debug 宏。

首先，你需要写一个函数，它的签名如下：

```
macro(node: any, result: any, context: object): any
```

其中：

- node: 在原始 schema JSON 中的节点的值
- result: 该节点经过内部解析后的结果，注意，这个结果包含了其他宏的结果
- context: 全局共享的 context

render 宏比较特殊，它有第 4 个参数，即 subscribe。但其他所有宏的签名只有 3 个参数。每一个宏得到的 result 并不确定，不同的宏接收到的结果可能不同，你可以在实际开发中去查看 result 的具体内容。

在 schema JSON 中，你只能一次调用一个宏，不过，你可以通过组合宏来创建一个新的宏。这也是宏本身的定义，比如你需要在某个位置使用一个宏同时包含 a, b 两个宏的效果，那么你需要定义一个 c 宏，在 c 中调用 a, b 得到想要的结果并返回。*另外，有一个小技巧，你可以在单个宏函数中通过 this 读取到其他所有传入的宏。*

完成宏的开发之后，你只需要把它们作为 options.macros 传入到实例化的配置信息中去。具体可以看 react 或 vue 的创建函数。

## 注意点

- 宏仅在 layout 中生效，你不能在 model 或 constants 等其他区域内使用宏。
- 在可视化编辑器中，无法直观的看到宏的效果，也无法配置出宏，因此，如果你的应用中使用了自定义宏，可能就无法使用可视化编辑器来进行编辑。
