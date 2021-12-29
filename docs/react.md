# ReactFormast

基于 React 做渲染。

## createReactFormast(schemaJson, options): { model, Formast, schema }

基于已有的 JSON 生成需要的 react 组件等信息。

- schemaJson: 基于 Schema 协议的 JSON 对象
- options: (基于 Schema 中的 signals 协议，这些信息会在 JSON 加载时进行检查)
  - options.macros: 自定义宏（可覆盖 render 宏）
  - options.components: 自定义组件，用于顶替 JSON 中的 type
  - options.global: 自定义一些全局变量，在模型和布局中都有效
  - options.filters: 定义动态语法中的过滤器
  - options.fns: 定义动态语法中的函数
  - options.fetch: 自定义动态语法中的 fetch 函数
- model: 根据 Schema 协议生成好的 Model 实例
- Formast: 基于 Schema 协议生成好的 react 组件


```js
import React from 'react';
import { createReactFormast } from 'formast/react';
import schemaJson from './form.json'; // 你自己的 JSON 文件，或通过 API 接口从服务端拉取 JSON

const { model, Formast } = createReactFormast(schemaJson);

export default function App() {
  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = model.validate();
    if (errors.length) {
      console.error(errors);
      return;
    }

    const data = model.toData();
    console.log(data); // TODO 提交数据到后端
  };
  return (
    <div>
      <Formast onSubmit={handleSubmit} /> // 这里传入 onSubmit 是由 JSON 内部决定的
    </div>
  );
}
```

上面这段代码中，我们通过 `createReactFormast` 创建了 `Formast` 组件和 `model` 实例。`Formast` 是一个 react 组件，该组件基于给定的 JSON 完成界面的渲染、输入事件响应、提交等。

## Formast: ReactComponent

基于 createReactFormast 的便捷组件。

```js
import { Formast } from 'formast/react';

function App() {
  const fetchJson: Promise<JSON> = () => {};
  const options = ...; // 和 createReactFormast 第二个参数一致
  return (
    <Formast schema={fetchJson} options={options} props={/* 其他属性传入到内部 */}>
      <span>正在加载...</span>
    </Formast>
  )
}
```

这段代码让我们的可以不需要调用 createReactFormast 以极快的速度使用 formast。但是，它有一个弊端，即我们没法在组件外部读取 model，对 model 进行一些操作。因此，我们提供了一种特殊的处理方式让你可以读取 model：

```js
function App() {
  const fetchJson: Promise<JSON> = () => {};
  const options = ...; // 和 createReactFormast 第二个参数一致
  return (
    <Formast schema={fetchJson} options={options} props={/* 其他属性传入到内部 */} onLoad={({ model, schema }) => {
      // 这里将 model, schema 保存下来使用
    }}>
      <span>正在加载...</span>
    </Formast>
  )
}
```

## connectReactComponent(Component, options): CBoxComponent

高阶组件生成器，用于在你自己的组件外面包一层，以方便和普通的组件进行区分。

- Component: 被包装的组件
- options
  - options.requireBind?: boolean | string, 要求 JSON 中使用本组件时必须绑定了字段，如果是字符串时，强制绑定对应字段
  - options.requireDeps?: string[], 要求使用本组件时传入了 deps 依赖
  - options.mapToProps?(): object, 整理合并 props 信息
- CBoxComponent: 包装后的组件

之所以需要通过 connectReactComponent 进行包装，是因为我们需要对组件进行一些约束。组件将会接收到绑定的字段信息，例如：

```js
function TheComponent(props) {
  const {
    required,
    hidden,
    readOnly,
    disabled,
    errors,
  } = props;
  // ....
}

export const SomeComponent = connectReactComponent(TheComponent, {
  requireBind: 'name',
  requireDeps: ['age', 'sex'],
  mapToProps(compiledProps, originProps, otherInfo) {
    const { bind, deps } = compiledProps; // bind 指向 name 的视图，之所以叫 `bind` 而不是使用 `name`，是为了方便统一读取
    const { required, hidden, readonly, disabled, errors } = bind;
    const { age, sex } = deps; // age, sex 指向对应的视图

    // ...

    return {
      required,
      hidden,
      readOnly: readonly,
      disabled,
      errors,
    }
  },
});
```

经过 connectReactComponent 之后的组件可以在内部读取模型上的信息。`mapToProps` 的返回结果将和原始的 props 合并后作为被 connect 组件的 props 传入。如果没有给 mapToProps，那么会在原始 props 上加上 bind, deps 两个属性后传入给组件。

**便捷模式**

如果你在组件上增加一个静态属性 `TheComponent.formast = { requiredBind, requiredDeps }`，那么， createReactFormast 会自动帮你完成 connect ，而不需要主动用 connectReactComponent 去再 connect 一次。

这在对一些原有的组件进行改造时非常有用，例如我们想在 formast 中使用 antd 的组件，可以这样：

```js
import { Input } from 'antd'

Input.formast = {
  requireBind: true,
  mapToProps({ bind }) {
    const { required, hidden } = bind;
    return { required, hidden };
  },
}
```

通过这一改造，我们就可以让 antd 的组件在 formast 中使用时，自动拥有绑定字段的能力。
