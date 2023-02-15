# React 集成包

为开发者提供最简单的内置主题。

## 使用

表单：

```js
import { Formast } from 'formast/react';
import * as Options from 'formast/theme-react';
import 'formast/theme-react/index.css'; // 需要使用内置样式

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
- Select

其他组件如有需求请在 issues 中提。

其中，Input, InputNumber, TextArea, RadioGroup, CheckboxGroup, Select, Text, Label, Button, FormItem 都支持通过 bind 进行模型绑定。

### Form

表单组件。

- events:
  - submit(e): 提交表单时触发

### FormItem

表单项组件。一般包含一个label、一个或多个输入项。

- props:
  - label
  - labelAlign: string, left | right
  - required
  - errors: Array<{ message: string }>
- hidden
- children

*大部分表单方案中认为一个FormItem中只包含一个字段，但是实际上，formast认为一个FormItem包含一组字段，只不过又可能只有一个字段，但是不少情况下，会有两到三个字段放在一起，使用同一个label。例如：*

```js
<FormItem label="CEO" required={true}>
  <Input placeholder="CEO姓名" />
  <Input placeholder="CEO邮箱" type="email" />
</FormItem>
```

*为了集中填写，在很多表单中都会如上设计。*

### FormGroup

表单项组组件。内部可包含平铺的多个FormItem。

- props:
  - title: string, 组名
  - header: Element
  - footer: Element
- hidden
- children: FormItem 列表，尽量不要有其他元素

### Loop

循环体。

- props:
  - items: any[]
  - empty: Element, items为空数组时展示的内容
- children: Function

循环体一般会用在有增减功能的输入块中，例如：

```js
<FormGroup title="学员列表" footer={<Button onClick={() => stds.push({})}>添加</Button>}>
  <Loop items={stds} empty={<Text>学员列表为空</Text>}>
    {(item, i) => <FormItem label={`第${i + 1}个`}>
      <Input value={item.name} onChange={value => item.name = value} />
      <Button onClick={() => stds.splice(i, 1)}>删除</Button>
    </FormItem>}
  </Loop>
</FormGroup>
```

*由于上面设计中，`stds`具有响应式效果，被修改之后可以带来界面刷新，因此写法比较特殊。*

上面这段代码在 schema 中需要注意两处：

1. footer, empty 为 Element 类型，因此，在 schema 中需要使用 !render 宏
2. Loop 的 children 是一个函数，在 schema 中需要使用函数表达，并使用 !render 宏（但由于默认引擎会对 children 使用 !render 宏，因此，此处可以不用指明使用 !render 宏）

```json
{
  "type": "Loop",
  "props": {
    "empty!": {
      "type": "Text",
      "children": "学员列表为空"
    }
  },
  "children(item,i)": {
    "type": "FormItem",
    "props": {
      "label": "{ '第' + (i + 1) + '个' }"
    },
    "children": []
  }
}
```

### Text

文本组件。

- children: 文本内容

### Label

标签组件。

- children: 标签文案

### Button

按钮组件。

- attrs:
  - disabled: 是否禁用
- children: 按钮文本

### HBox, VBox

类似于 div 的容器，只不过增加了默认的 className，实现横向或纵向排版。

### Input

输入框。

- attrs:
  - type: text | password | search | url | date | range
  - placeholder
  - disabled
  - readonly
  - required
  - maxLength
- props:
  - prefix: Element 输入框前面的内容
  - suffix: Element 输入框后面的内容
- hidden
- value
- events:
  - change(value: string)

其中，value 可以为 null，会被作为空字符串进行输入。

### InputNumber

数字输入框，有千分位格式化效果。

- attrs:
  - placeholder
  - disabled
  - readonly
  - required
  - max
  - min
- props:
  - prefix
  - suffix
- hidden
- value
- events:
  - change(num: number)

其中，value 可以为 null。

### TextArea

多行文本输入框。

- attrs:
  - placeholder
  - disabled
  - readonly
  - required
- hidden
- value
- events:
  - change(value: string)

### RadioGroup

多个单选框。

- props:
  - options: Array<{ label: string, value: any, disabled: boolean }>
  - disabled
  - readonly
  - valueKey: value
  - labelKey: label
  - prefix
  - suffix
  - placeholder
- value
- hidden
- events:
  - change(value:string|number, selectedValue:string|number, selectedItem:object)

### CheckboxGroup

多个复选框。

- props:
  - options: Array<{ label: string, value: any, disabled: boolean }>
  - disabled
  - readonly
  - valueKey: value
  - labelKey: label
  - prefix
  - suffix
  - placeholder
- value: (string|number)[] 注意，此处比较特殊，ChecboxGroup 用于选中多个值，因此是一个数组
- hidden
- events:
  - change(value:string|number, selectedValue:string|number, selectedItem:object)

### Select

下拉列表（单选）。

- props:
  - options: Array<{ label: string, value: any, disabled: boolean }>
  - disabled
  - readonly
  - valueKey: value
  - labelKey: label
  - prefix
  - suffix
  - placeholder
- value
- hidden
- events:
  - change(value:string|number, selectedValue:string|number, selectedItem:object)

`Select` 和 `RadioGroup` 可以无缝替换。

## 对齐

开发者们自己开发的集成包应该对齐本文档中的组件接口设计，这样就可以做到将来切换其他 UI 组件库时无缝切换。
