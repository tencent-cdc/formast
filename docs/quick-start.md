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
<script src="https://unpkg.com/formast/latest/dist/index.js"></script>
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
<script src="https://unpkg.com/formast/latest/dist/react.js"></script>
```

在使用CDN时需要注意，它依赖于react或vue，所以要提前加载对应的库。

可视化编辑器也有dist，它依赖于react，所以，你在使用时，和上述的方案差不多，要么模块化引入，要么UMD引入，但是，还需要多一个步骤，就是引入css文件。具体可参考[visual详情](visual.md)。

## 接入 React 中使用

```js
import { Formast } from 'formast/react';
import * as components from './components.jsx';

function App() {
  const fetchJson: Promise<JSON> = () => fetch('/api/form/123');
  const onSubmit = () => {
    const data = $('#form_id').seriallize();
    console.log(data)
  };
  const options = {
    components,
  }; // 和 createReactFormast 第二个参数一致
  return (
    <Formast json={fetchJson} options={options} props={{
      id: 'form_id',
      onSubmit,
    }}>
      <span>正在加载...</span>
    </Formast>
  )
}
```

以上只是一个内容不足的例子，让你可以看到接入 formast 是非常方便的一件事。想要体验完整的例子，请克隆源码仓库后查看.examples/react下的文件。通过 npm run dev:react 来启动本地服务预览效果。
