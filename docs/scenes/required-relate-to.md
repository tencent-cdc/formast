# 基于字段值的联动必填逻辑

“必填”一方面是交互上的，一方面也是校验逻辑。
假设我们希望当金额大于等于 5000 万时，必须填写手续费。

首先，我们需要在模型中定义手续费的 `required` 和 `validators` 属性：

```json
{
  "amount": {
    "label": "金额",
    "type": "number",
    "default": null
  },
  "fee": {
    "label": "手续费",
    "type": "number",
    "default": null,
    "required": "{ amount >= 50000000 }",
    "validators": [
      "required('手续费必须填写')"
    ]
  }
}
```

上面这段 model schema 规定了 amount 和 fee 两个字段，需要注意 fee 字段的 `reuqired` 和 `validators` 属性。在 `validators` 中使用了一个特殊语法 `required('xxx')`，这个特殊语法和 `required` 属性的结果是相关联的，当 amount 字段的值大于等于 5000 万时，fee 字段视图上的 required 就为 true，此时在校验 fee 字段时，required() 这一条校验规则才会被纳入校验。

接下来，我们在布局中使用 fee.required 来做一些标记，例如：

```json
{
  "type": "label",
  "children": [
    "{ fee.label }",
    {
      "type": "i",
      "visible": "{ fee.required }",
      "style": {
        "color": "red"
      },
      "children": "*"
    }
  ]
}
```

当 amount 字段的值变化时，会带着 fee.required 变化。当 fee.required 为 true 时，红色的星号 `*` 才动态显示出来。

再下来，我们在提交表单的时候，先进行一次校验，如果发现错误，则弹出提示语。

```js
const errors = model.validate();
if (errors.length) {
  toast.error(error.message);
  return exit();
}
```

上面这段代码可以在用户点击提交的时候执行，如果 fee.required 为 true，那么上面这段代码过程中，就会去校验 fee 是否已经填写过了。
