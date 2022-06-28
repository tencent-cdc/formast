# SchemaParser

SchemaParser 是 formast 的内核解析器，它用于渲染器解析 schema JSON，得到渲染引擎，其解析结果可以被用来渲染为真实界面。

## 使用

```js
import { SchemaParser } from 'formast'

const parser = new SchemaParser({
  loaders: {},
  filters: {},
  extend: () => {},
  visit: () => {},
  global: {},
  fetch: () => {},
  macros: {},
  fns: {},
  context: {
    components: {},
    types: {},
  },
})
```

### Options

**macros**

宏集合，所谓宏，就是一个处理函数，用于接收 schema JSON 节点，返回一个具体的结果。
必须传入 render 宏来实现渲染。
具体可阅读[宏文档](macro.md)。

**global**

传入一个对象，作为 schema JSON 中的全局变量，它上面的属性可以在 JSON 中直接读取。

**fns**

为 schema JSON 内部提供函数。

**fetch**

为 schema JSON 提供 fetch 语法/函数。

**filters**

为 schema JSON 过滤器语法提供具体的过滤器。比如，你想要在 schema JSON 中使用 `{{ amount.value | fixed:2 }}`，那么，你必须提供 fixed 这个 filter：

```
filters: {
  fixed(value, toFixed) {
    return value.toFixed(toFixed)
  }
}
```

**loaders**

加载器方法集合，一组函数的对象，将扩展默认的加载器，以对原有的加载器进行扩展。具体可阅读[这里](https://tyshemo.js.org/#/loader?id=hooks)了解。

**extend**

对加载器进行扩展。

```
extend(SchemaLoader: Loader): Loader;
```

**visit**

对原始的 JSON 节点进行处理。

```
visit(node: JSON, parentNode: JSON): JSON;
```

**context**

一个寄存对象，你可以在这个对象内提供一些数据，这个对象可在渲染器内被读取，从而可以共享这些数据。例如内置的 react 渲染器，就使用了 context 传递 components 这个参数。

- components: 键值对，规定在 JSON 中的组件名将使用哪一个真实的组件
- types: 键值对，其值和 JSON 中的 model 中的 component 形式一样，用以根据字段的 type 来决定使用什么组件

### API

**loadSchema(schemaJson, data)**

加载并解析 schema JSON，返回实例本身，加载后实例上将得到 Layout, model 等信息。

```js
const { model, Layout } = schemaParser.loadSchema({ ... }, { ... })
```

- schemaJson: 即符合 schema 的 JSON 对象
- data: 用于实例化模型的数据

注意，如果你执行完 loadSchema，那么，就不可以再执行下面的任意方法。

**loadModel(modelJson)**

解析 schema JSON 中的模型部分。传入模型 schema JSON，返回实例本身，此时可以得到模型。

```js
const { Model } = schemaParser.loadModel(schemaJson.model)
```

在某些场景下，你只需要解析模型的话，它可以帮助你。

**initModel(data)**

基于给定数据实例化模型。

```js
const { model } = schemaParser.loadModel(...).initModel(...)
```

必须在 loadModel 之后执行。

**loadLayout(layoutJson)**

解析 schema JSON 中的布局部分。

```js
const { Layout } = schemaParser.loadLayout(shcemaJson.layout)
```

当你只需要解析布局时可以使用它来完成。
