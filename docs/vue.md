# VueFormast

基于 Vue (2.x版本) 做渲染。

## createVueFormast(schemaJson, options): { model, Formast, schema }

基于已有的 JSON 生成需要的 vue 组件等信息。

- schemaJson: 基于 Schema 协议的 JSON 对象
- options: (基于 Schema 中的 signals 协议，这些信息会在 JSON 加载时进行检查)
  - options.macros: 自定义宏（可覆盖 render 宏）
  - options.components: 自定义组件，用于顶替 JSON 中的 type
  - options.global: 自定义一些全局变量，在模型和布局中都有效
  - options.filters: 定义动态语法中的过滤器
  - options.fns: 定义动态语法中的函数
  - options.fetch: 自定义动态语法中的 fetch 函数
- model: 根据 Schema 协议生成好的 Model 实例
- Formast: 基于 Schema 协议生成好的 vue 组件


```js
import { createVueFormast } from 'formast/vue';
import schemaJson from './form.json'; // 你自己的 JSON 文件，或通过 API 接口从服务端拉取 JSON

const { model, Formast } = createVueFormast(schemaJson);

export default {
  methods: {
    handleSubmit(e) {
      e.preventDefault();

      const errors = model.validate();
      if (errors.length) {
        console.error(errors);
        return;
      }

      const data = model.toData();
      console.log(data); // TODO 提交数据到后端
    },
  },
  render(h) {
    return (
      <div>
        <Formast onSubmit={this.handleSubmit} /> // 这里传入 onSubmit 是由 JSON 内部决定的
      </div>
    );
  },
}
```

上面这段代码中，我们通过 `createVueFormast` 创建了 `Formast` 组件和 `model` 实例。`Formast` 是一个 vue 组件，该组件基于给定的 JSON 完成界面的渲染、输入事件响应、提交等。

## Formast: VueComponent

基于 createVueFormast 的便捷组件。

```js
import { Formast } from 'formast/vue';

export default {
  template: `
    <formast :options="options" :json="getJson" :props="props" :onLoad="onLoad">
      <span>正在加载...</span>
    </formast>
  `,
  components: {
    Formast,
  },
  data() {
    return {
      model: null,
      options: { ... }, // createVueFormast 的 options 参数
      props: { .. }, // 传递给内部JSON实例化出来的 props
    }
  },
  methods: {
    getJson() {
      return { ... } // 获取JSON
    },
    onLoad({ model }) {
      this.model = model;
    },
  },
}
```

## connectVueComponent(Component, options): CBoxComponent

高阶组件生成器，用于在你自己的组件外面包一层，以方便和普通的组件进行区分。

- Component: 被包装的组件
- options
  - options.requireBind?: boolean | string, 要求 JSON 中使用本组件时必须绑定了字段，如果是字符串时，强制绑定对应字段
  - options.requireDeps?: string[], 要求使用本组件时传入了 deps 依赖
  - options.mapToProps?(): object, 整理合并 props 信息
- CBoxComponent: 包装后的组件

之所以需要通过 connectVueComponent 进行包装，是因为我们需要对组件进行一些约束。组件将会接收到绑定的字段信息，例如：

```js
const TheComponent = Vue.extend({
  functional: true,
  render(h, ctx) {
    const {
      required,
      hidden,
      readOnly,
      disabled,
      errors,
    } = ctx.props;
    // ....
  }
})

export const SomeComponent = connectVueComponent(TheComponent, {
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

经过 connectVueComponent 之后的组件可以在内部读取模型上的信息。`mapToProps` 的返回结果将和原始的 props 合并后作为被 connect 组件的 props 传入。如果没有给 mapToProps，那么会在原始 props 上加上 bind, deps 两个属性后传入给组件。

**便捷模式**

如果你在组件上增加一个静态属性 `TheComponent.formast = { requiredBind, requiredDeps }`，那么， createVueFormast 会自动帮你完成 connect ，而不需要主动用 connectVueComponent 去再 connect 一次。
