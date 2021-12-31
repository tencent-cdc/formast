# React 集成包

为开发者提供最简单的内置主题。

## 使用

表单：

```js
import { Formast } from 'formast/react';
import * as Options from 'formast/react-d';
import 'formast/react-d/index.css'; // 需要使用内置样式

function MyFormast(props) {
  return <Formast options={Options} {...props} />
}
```

## 表单内支持的组件

- Form
- FormGroup
- FormItem
- Loop
- Text
- Label
- Button
- HBox 横向盒子
- VBox 纵向盒子
- Input
- InputNumber
- TextArea
- RadioGroup
- CheckboxGroup


其他组件如有需求请在 issues 中提。
