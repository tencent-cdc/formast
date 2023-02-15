# TDesign Vue 集成包

为开发者提供最简单的内置主题。

## 使用

表单：

```html
<template>
  <div>
    <formast :schema="schema" :props="props" :options="options"></formast>
  </div>
</template>

<script>
import { Formast } from 'formast/vue';
import * as Options from 'formast/tdesign-vue';

export default {
  data() {
    return {
      data: null,
      errors: [],
      model: null,
      props: {
        random: Math.random(),
        onSubmit: this.handleSubmit,
      },
      options: Options,
      // 具体的Schema
      schema: {},
    }
  },
  methods: {
    handleSubmit(e) {
      // 。。。
    },
  },
  components: {
    Formast,
  },
}
</script>
```

*当然，你要在你的应用中全局引入 tdesign 以及它的样式。*

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
由于时间匆忙，没有对组件进行UI配置一致性检查，可能无法直接替换theme-vue的使用，如有需求，可以fork项目后提pr。
