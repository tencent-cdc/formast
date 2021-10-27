# 基于字段值的联动展示

举个例子，当金额大于等于 5000 万时，需要填写备注。

首先，我们需要在模型中规定备注字段的 hidden 属性：

```json
{
  "amount": {
    "label": "金额",
    "type": "number",
    "default": null
  },
  "remark": {
    "label": "备注",
    "type": "string",
    "default": "",
    "hidden": "{ amount < 50000000 }",
    "drop": "{ amount < 50000000 }"
  }
}
```

注意上面的 `hidden` 属性，该属性使用 schema 中的动态语法，当 amount 字段的值小于 5000 万时，hidden 的值为 true。
另外，我们还加上了 `drop` 属性，当 amount 小于 5000 万时，remark 这个字段将不会提交到后台去。

接下来，在布局信息中使用 remark 字段的视图：

```json
{
  "layout": {
    "type": "Fragment",
    "children": [
      {
        "type": "InputNumber",
        "bind": "amount"
      },
      {
        "type": "Input",
        "bind": "remark"
      }
    ]
  }
}
```

其中 `Input` 组件使用了 react-default 中的组件，它支持 bind 传入一个字段名，该组件会根据 remark 字段的视图上的 `hidden` 属性来决定自己是否要隐藏起来。也就是说，当 amount 字段的值在输入过程中已经大于 5000 万的时候，remark 的 hidden 就变成了 false，此时，`Input` 组件会把自己展示出来。

当然，你可以自己实现 `Input` 组件，甚至使用原生组件，例如下面这样处理：

```json
{
  "layout": {
    "type": "Fragment",
    "children": [
      {
        "type": "div",
        "children": [
          {
            "type": "label",
            "children": "{ amount.label }"
          },
          {
            "type": "input",
            "attrs": {
              "type": "number",
              "value": "{ amount.value }"
            },
            "events": {
              "change(e)": "{ amount.value = +e.target.value }"
            }
          }
        ]
      },
      {
        "type": "div",
        "visible": "{ !remark.hidden }",
        "children": [
          {
            "type": "label",
            "children": "{ remark.label }"
          },
          {
            "type": "input",
            "attrs": {
              "value": "{ remark.value }"
            },
            "events": {
              "change(e)": "{ remark.value = e.target.value }"
            }
          }
        ]
      }
    ]
  }
}
```

你看，我们用原生组件也可以做到类似的效果，只是需要输出非常复杂的 JSON。

总而言之，我们要掌握这种思路，即在模型定义中定义 `hidden` 属性，并在布局中使用 hidden 属性来控制组件的显示隐藏。我们不用自己去动态修改 hidden 的值，因为模型在你修改 amount 的值的同时，会重新计算 remark 的 hidden 属性，在重新渲染的时候，视图层就会用新的 hidden 值进行渲染。
