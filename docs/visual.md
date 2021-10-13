# 可视化拖拽编辑器

> 注：目前仅腾讯内部可用。

通过拖拽、填写的方式完成表单编辑。

注意：你的构建工具需支持编译 less 作为样式。或者，你可以直接引入dist文件

```js
import { mountVisualEditor } from 'formast/visual'; // 引入commonjs，需要webpack less支持
```

```js
// 引入dist
import 'formast/dist/visual.css'; // 引入样式
import { mountVisualEditor } from 'formast/dist/visual';
```

## mountVisualEditor(el: string|HTMLElement, options): void

```js
const options = {
  layout: {
    // 左侧组件区的组件排列需要进行分组，以方便区分不同组件
    groups: [
      {
        title: '复合组件',
        items: [
          TabsBox, // -> 直接传入含有 formastConfig 静态属性的组件，一个组件理论上可以放在多个分组中
        ]
      }
    ]
  },
}
mountVisualEditor(el, options);
```

其中，Items 里面必须传入 React 组件，这些组件必须包含 formastConfig 静态属性。其具体配置看 [components.md](./components.md)

如果你是在React系统中使用，可以这样：

```js
import { VisualEditor, React } from 'formast/visual'
```

`VisualEditor`是一个react组件，它的props和前面的options一致，这里你需要使用内置的`React`对象，因为我担心你的系统和我们库依赖的react版本不同。
