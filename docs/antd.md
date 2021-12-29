# Ant Design集成包

为开发者提供最简单的内置主题。

> 注意：你的构建工具需支持编译 less 作为样式。

## 使用

表单：

```js
import { Formast } from 'formast/react';
import * as Options from 'formast/antd';

function MyFormast(props) {
  return <Formast options={Options} {...props} />
}
```

## 支持的组件

- Form
- Item
- Input
- TextArea
- InputNumber
- Radios
- Checkboxes
- Select
- Password
- Search
- Switch
- Rate
- DatePicker
- Slider
- Button

其他组件如有需求请在 issues 中提。
