# 实现提交时数据校验

数据校验并非 formast 内部主动完成的，虽然你可以使用 formast 动态校验的结果。
一般而言，我们需要在提交表单的时候进行数据校验。我们可以这样处理：

```js
import { useRef } from 'react';
import { Formast } from 'formast/react'; // 引入 Formast 组件
import Options from 'formast/theme-react'; // 实用内置的配置，在了解具体使用方法之后，可以替换为自己的配置对象

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

上面这段代码是我们创建一个表单时要使用的代码，这段代码提供了 formast 需要的运行环境。
另外，这个表单具有前后端耦合的性质，前端必须传入 onSubmit 才能正常工作。当然，你可以可以让 formast 只提供填写部分，提交按钮在代码层面实现，这样就可以做到前后端解耦。

上面代码中，通过读取 formast 解析得到的模型实例，调用模型的 validate 方法进行校验。
