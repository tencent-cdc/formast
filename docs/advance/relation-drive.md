# Formast 联动原理

Formast 通过 JSON 中的动态语法来实现联动，联动的思路是“基于依赖的实时计算”。

和其他联动方案不同，formast 是基于“我是否需要xxx，是因为我依赖的xxx发生了变化”的思想，而非“我发生了xxx的变化，需要触发xxx进行xxx变化”。举个例子，以 formily 为例，它的联动设计如下：

```js
<SchemaField>
  <SchemaField.String
    name="select"
    title="控制者"
    default="visible"
    enum={[
      { label: '显示', value: 'visible' },
      { label: '隐藏', value: 'none' },
      { label: '隐藏-保留值', value: 'hidden' },
    ]}
    x-component="Select"
    x-decorator="FormItem"
    x-reactions={{
      target: 'input',
      fulfill: {
        state: {
          display: '{{$self.value}}',
        },
      },
    }}
  />
  <SchemaField.String
    name="input"
    title="受控者"
    x-component="Input"
    x-decorator="FormItem"
  />
</SchemaField>
```

上面的代码中，核心联动描述在于 `x-reactions`，它的意思是当发生 input 事件的时候，触发第二个输入框根据第一个输入框的值是否展示的逻辑。如果在没有经过高强度训练的情况下，你根本不理解 `target` `fulfill` `state` `display` `{{$self.value}}` 这些需要记忆的一大堆东西。

而在 formast 中，理解的思路是反过来的，比如针对上面这个例子，我们的思路是，第二个输入框是否要展示在界面上，是由与第二个输入框绑定在一起的字段的 hidden 属性决定的，而该字段的 hidden 属性是否依赖其他字段，在模型描述中进行描述。所以，上面的这个例子，我们用 formast 来表达：

模型部分：

```json
{
  "select": {
    "default": "visible",
    "options": [
      { "label": "显示", "value": "visible" },
      { "label": "隐藏", "value": "none" },
      { "label": "隐藏-保留值", "value": "hidden" }
    ]
  },
  "input": {
    "hidden": "{ select !== 'visible' }",
    "drop": "{ select === 'none' }"
  }
}
```

布局部分：

```json
[
  {
    "type": "Select",
    "bind": "select"
  },
  {
    "type": "Input",
    "bind": "input"
  }
]
```

当 input.hidden 为 true 时，第二个输入框会自动隐藏起来。

我们回去看整个过程，你会发现，思路上和 formily 完全不同，我们的思路是 `input` 的描述集中在模型上描述，它是否展示出来，由自己的描述决定，而不是由另外一个地方触发。
思维的变化不一定先进，但从实际场景出发，我们往往需要后端从不同的地方拉取不同字段的配置信息，而这些配置信息往往是自描述的，例如上面的例子里面，input 的描述意味着它依赖于 select，两者需要一起工作，而如果使用 `target` 的形式，你怎么判断当前的表单中，一定存在另外一个字段呢？之所以敢用，无非是因为你作为前端开发，已经看到了另外一个字段。但当你真正去思考的时候，就会发现这里的问题。

那么，formast 是怎么做到这种自描述的联动的呢？

首先，formast 基于分层理念研发，它首先强调“模型层”，即当你在填写一个表单的时候，首先需要明确，你填写的这个表达，是在创建一个什么业务数据。而正是基于模型，整个表单本身就有一层数据管理，而不需要另外去构造一个状态管理器。

其次，formast 中的模型是一个可观察的响应式对象，在内部，我们监听了模型上每一个字段的变化，通过这个监听来触发下一次渲染流程。

最后，就像 vue 中的 computed 属性一样，模型上的每一次变化，都会带来对应的依赖逻辑的执行，从而一个字段的变化，也带来其他字段的信息的变化。

这样就形成了一个完整的闭环：使用模型->监听模型变化->依赖计算->重新渲染。

正是有了这样一套机制，formast 可以不需要用那种“触发”思想，而是使用“依赖”思想，让我们可以在 JSON 中以简洁的更容易理解的方式进行数据于数据之间的描述，同时，由于分层理念的实施，布局部分是使用模型实例进行渲染，响应其变化，所以，只要布局部分得到固定，那么我们只需要在模型部分关注各种逻辑，做到了真正的把数据管理进行收拢。
