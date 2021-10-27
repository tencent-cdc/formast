# 自定义集成包

Formast 内置了 React 默认集成包和 Antd 集成包，你也可以封装自己的集成包。

## 什么是集成包？

简单说，就是一套交给 formast 使用的组件配置信息。
比如我们想在 formast 更快的使用 antd，我们可以对 antd 进行封装，比如把一些复杂的组件，封装为简单的组件，比如实现组件的 `bind` 的能力等等。
总而言之，集成包就是让我们可以在 formast 中更方便的使用一套组件的方式。

## 前置知识

你需要了解到如下的知识。

1. 只有经过 connect 的组件可以在 formast 中得到 bind 等信息
2. 组件定义便捷模式是在组件类/函数上增加 formast 属性进行定义
3. bind 等信息是由 formast 引擎交给组件的，如果不在 formast 中使用，不应该在组件设计时使用 bind 属性

## 以 antd 为例实现集成包

**第一步：创建组件**

我们想要在 formast 中使用某些交互，但是，antd 可能并没有直接提供这些交互组件，我们可以基于 antd 封装出对应的交互组件。

**第二步：封装包裹**

想要在 formast 中使用 bind 等能力，需要通过 connect 对上面的组件进行包裹。

```js
export const Input = connectReactComponent(AntdInput, {
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

其中对关键在于 mapToProps 中，把由 formast 运行时得到的结果，map 给原始组件。

基于 connect 包裹，你不需要改动原始组件任何东西，得到的新组件将作为 formast 中使用的组件。但有时候，你希望使用更便捷的方案，你可以直接在原始组件上增加 `.formast` 属性，例如将上面的代码改为：

```js
Input.formast = {
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
}
```

配置的部分一模一样，只是使用了 `.formast` 属性直接扩展。这种方法会直接在原始组件上进行修改，有可能另外一位开发者会对你的扩展再次修改。

**第三步：提供配置**

完成以上的组件封装之后，你需要拿到这些组件，在一个独立文件中，导出配置。具体配置如下：

```js
// index.js
import * as components from './components.jsx'

export default {
  components,
  macros: { ... },
  fns: { ... },
}
```

具体的配置可以阅读 [react 文档](react.md)的 `createReactFormast` 的 options 部分。

**第四步：提供使用说明**

一般而言，如果导出了 options 部分之后，你就可以把这个集成包提供给其他人使用。其他开发者一般使用方法如下：

```js
import Options from './your-package-name';

function App() {
  // ... 省略

  return (
    <Formast json={...} options={Options} onLoad={...} props={...}>
      <span>正在加载...</span>
    </Formast>
  )
}
```

他们只需要在使用的时候引入你的集成包即可，使用你的集成包之后，他们的 schema JSON 中就需要按照你集成包中提供的能力进行使用。

同时，你需要提供一份完整的说明文档，里面应该包含：

- 组件名，以及每个组件具体支持哪些属性
- 其他，如 macros, fns, global 等都有哪些

这样，其他开发者就可以更流畅的使用你的集成包了。

## 建议

一般而言，一个项目中，我们只需要一个集成包就行了。比如在你的物流项目中，你们公司已经使用了一套公司内的组件库，那么，你只需要按照上述方法，封装出自己的集成包。但由于一个项目一般只使用一套集成包，所以，你没有必要在任意地方都让开发者按照上面的方式去使用，你可以自己再往上封装一层：

```js
import { Formast } from 'formast/react';
import Options from './my-package-name';

export function JsonForm(props) {
  const { children, ...attrs } = props;
  return (
    <Formast {...attrs} options={Options}>
      {children}
    </Formast>
  )
}
```

这样，你们项目中，全部地方只需要使用 JsonForm 这个组件。

甚至，你可以把 `json` 属性也封装好，每一个表单封装出一个组件，这样，在需要的地方只需要调用对应的组件即可，不需要再写 JSON 请求的部分。当然，具体怎么封装，需要根据你们自己的使用场景。
