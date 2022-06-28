# Ant Design 集成包

为开发者提供最简单的内置主题。

## 使用

表单：

```js
import { Formast } from 'formast/react';
import * as Options from 'formast/antd';

function MyFormast(props) {
  return <Formast options={Options} {...props} />
}
```

*当然，你要在你的应用中全局引入 antd 以及它的样式。*

## 表单内支持的组件

- Form
- FormItem
- Input
- TextArea
- InputNumber
- RadioGroup
- CheckboxGroup
- Select
- Password
- Search
- Switch
- Rate
- DatePicker
- Slider
- Button
- Label

其他组件如有需求请在 issues 中提。
