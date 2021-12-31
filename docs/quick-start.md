# 快速上手

## 安装

```
npm i formast
```

## 使用

如果你在模块化体系下使用，你可以直接引入该包，它默认expose commonjs，你可以在大部分模块话系统中使用：

```js
import { SchemaParser } from 'formast'
```

但是，这样有一个不好的地方，commonjs无法做tree shaking，最后包体积比较大，你可以通过webpack的alias配置来减小打包体积：

```js
{
  resolve: {
    alias: {
      'formast': 'formast/src',
      tyshemo: 'tyshemo/src',
      'ts-fns': 'ts-fns/es',
    },
  }
}
```

如果你不希望自己处理这些问题，并且，你也不会与它共享依赖，那么，你可以直接使用我们已经构建好的文件：

```js
import { SchemaParser } from 'formast/dist'
```

如果你需要在浏览器中直接使用，可以使用CDN，因为dist文件是基于UMD的，你可以在浏览器中直接使用。

```html
<script src="https://unpkg.com/formast/dist/index.js"></script>
<script>
  const { SchemaParser } = window.formast
</script>
```

在CDN时建议固定版本，直接使用latest容易导致加载有BREAKING CHANGE的版本。

以上都是core的部分，如果你需要在具体的场景下使用，例如你在react中使用，那么可以读取对应目录下的react包文件。例如：

```js
import { createReactFormast } from 'formast/react' // commonjs
import { createReactFormast } from 'formast/dist/react' // 构建好的包

import { createVueFormast } from 'formast/vue'
import { createVueFormast } from 'formast/dist/vue'
```

```html
<script src="https://unpkg.com/react/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/formast/dist/react.js"></script>
```

在使用CDN时需要注意，它依赖于react或vue，所以要提前加载对应的库。

## 接入 React 中使用

```js
import { useRef } from 'react';
import { Formast } from 'formast/react'; // 引入 Formast 组件
import Options from 'formast/react-d'; // 实用内置的配置，在了解具体使用方法之后，可以替换为自己的配置对象

function App() {
  const ref = useRef();
  const fetchJson = () => fetch('/api/form/123').then(res => res.json()); // 从接口读取 JSON
  const onSubmit = () => {
    const { model } = ref.current;

    // 校验
    const errors = model.validate();
    if (errors.length) {
      console.error(errors.message);
      return;
    }

    // 提交
    const data = model.toData();
    console.log(data);
  };

  return (
    <Formast schema={fetchJson} options={Options} onLoad={info => (ref.current = info)} props={{ onSubmit }}>
      <span>正在加载...</span>
    </Formast>
  )
}
```

在上面这段代码中，我们通过 `fetchJson` 这个函数从后端抓取一个 JSON 回来，该 JSON 必须符合 formast schema 要求。
我们通过 `onLoad` 这个属性，把 JSON 解析完成之后得到的信息暂存起来，在 `onSubmit` 中调出暂存的 model 进行数据校验和提交动作。有关使用的方法，你可以在 [react 引擎](react.md)中阅读详细使用方法。
其中 `props` 属性传入的是 JSON 中需要用到的内容，你在阅读完 [schema 部分](schema.md)后可以对此比较了解。
此外，我们直接使用了 formast/react-d 这个集成包，你也可以在学习集成包的封装方法后，自己封装自己的集成包，一般而言，一个项目都需要封装自己的集成包，大部分情况下，一个项目只需要一个集成包即可。集成包是使用 formast 的关键，前后端约定的组件及其功能，都需要在集成包中实现。Formast 之所以是一个框架，而非一个开箱即用的库，原因也在于此，它让你的项目自己去定义在实际工作中的实际需求，而非从一开始就把这些组件定死。

以上是一个内容不足的例子，只是让你可以看到接入 formast 是非常方便的一件事。想要体验完整的例子，请克隆源码仓库后查看.examples/react下的文件。通过 npm run dev:react 来启动本地服务预览效果。
