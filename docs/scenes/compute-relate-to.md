# 基于其他字段的值进行自动计算

在某些场景下，我们的某一个字段是固定的，且由另外一个字段计算得到它的值。

首先，我们需要在模型中如此描述：

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
    "default": 0,
    "compute": "{ amount / 350 * 0.002 + 50 }",
    "readonly": true
  }
}
```

上面的描述中，fee 字段使用了 compute 属性，意味着它是一个自动计算的字段，而且我们将它的 readonly 属性配置为 true，则它是不能被手动修改的，只能计算得到。此时，当 amount 的值发生变化时，fee 的值也会随之发生变化。

在布局中，我们直接按照正常的使用方法使用 fee 字段即可。

```json
{
  "type": "InputNumber",
  "bind": "fee"
}
```

在布局中，`InputNumber` 这个组件会去读取 fee.readonly，并将输入框的 readonly 与之绑定，所以该输入框是无法修改的。

> 需要注意的是，假如你在实际使用时，如果 readonly 没有规定，或者可以修改，那么，当 computed 字段被修改的那一刻之后，它将自动失去 computed 的能力，它的值将只能通过输入进行修改，而无法再由其他字段的变化联动来变化。
