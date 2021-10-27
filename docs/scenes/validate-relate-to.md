# 根据条件进行校验

当我们定义一个字段的校验逻辑时，有的时候，需要根据一些情况才能决定是否要启用当前这条校验规则。
我们需要在模型描述中，使用 validators 属性来进行处理：

```json
{
  "fee": {
    "label": "手续费",
    "type": "number",
    "default": null,
    "validators": [
      {
        "determine": "{ amount > 50000000 }",
        "validate": "{ fee > 10 && fee < 350 }",
        "message": "手续费必须大于10且小于350"
      }
    ]
  }
}
```

注意上面描述中的 `determine`，它用来表达在什么情况下当前这条校验逻辑要被纳入校验。当表达式成立时，在调用 `model.validate()` 时，这条校验规则就会被使用，否则不会被使用。
