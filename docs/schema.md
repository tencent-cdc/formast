# Schema

用于动态渲染表单的 JSON，遵循如下的 Schema 协议。

Schema 包含三个方面的内容：结构、动态语法、编辑器。

- 结构：固定的数据结构，以及固定的字段名，不符合该结构，无法正确解释渲染表单
- 动态语法：用于表达一些可变的动态逻辑，例如表单项的是否展示逻辑
- 编辑器：用于在可视化编辑时交给编辑器使用的附属信息

## 结构

用于描述可视化界面，通过特定的结构，框定界面的展示效果。

Schema 将会在编辑状态下和渲染成用户界面状态下使用。
编辑状态下，编辑器解析Schema JSON生成编辑器界面，运维人员通过编辑器编辑，并生成新的Schema JSON。
用户界面通过加载Schema JSON（通过解析器）渲染为可以使用的界面。

Schema数据结构中，包含如下信息：

- 模型描述
- 布局描述
- 编辑器元数据
- 全局配置描述

各个部分的内容将被分开记录，不同场景下，后端返回不同的信息。例如当处于编辑状态下时，需要返回用于记录编辑器特征的元数据，而在渲染用户界面时，无需返回这部分数据。

具体数据结构描述如下：

```js
{
  // 模型描述
  model: {
  },

  // 布局描述
  layout: {
  },

  // 编辑器元数据
  _layout: {},

  // 其他附加配置信息
  constants: {},

  // 信令，用于告诉解释器当前 JSON 中需要外部传入哪些信息，如果这些信息没有给，可能导致运行时报错，在这里给出提示之后，开发者可以根据提示加入需要的对象
  declares: {
    props: [
      'onSubmit', // -> 声明外部可以传入哪些 props，并且这些 props 将被作为全局变量被使用
    ],
    components: [
      'Input', // -> 要求外部必须传入这些组件，如果不传入，那么内部渲染可能会报错
      'Select',
    ],
    macros: [],
    global: [],
    filters: [],
    fns: [],
    fetch: true,
  },
}
```

## 编辑器

我们提供了可视化编辑器，帮助用户可以通过拖拽和填写的方式来实现整个表单的自定义。

在 Schema 中，所有以 _ 开头的属性名都是为编辑器服务的，不能作为动态语法的变量被读取。在前端运行时，这些属性并不需要。这些以 _ 开头的属性，不一定在固定的一个地方，可能被分散的使用在布局、模型、组件等中。

后端输出 JSON 时可以去除用于编辑器的字段。另外，加入编辑器需要的字段在 JSON 中不是以 _ 开头，编辑器也可以正常读取。

## 布局描述

Schema 中的主体部分（必须存在的部分）是布局描述。布局遵循组件的组合布局，也就是说，布局描述是对组件的层叠描述。

### 组件

整个布局，都是由一个一个的组件组合而成的。对于一个组件的信息包含如下部分：

- id 节点标识: 静态字符串，在当前 schema 的独立系统中组件 id 必须是唯一的，不支持动态语法
- type 组件类型: 字符串，不支持动态语法，对应配置中的 components 的键名
- props 给组件传properties: 对象，组件接收的 props，值支持动态语法
- attrs 给组件传attributes: 对象，组件（对应的DOM元素）接收的attributes，支持动态语法
- events 给组件绑定的事件: 对象，支持函数语法，属性名必须是驼峰形式命名
- class 针对原生组件（如div等）传入class，字符串，支持动态语法
- style 针对原生组件传入style，对象，支持动态语法
- children 组件内容（子组件）: 数组，子组件列表，如果是字符串直接写字符串，字符串内支持动态语法，且作用域为当前作用域
- visible 组件展示逻辑: 是否展示/不渲染当前组件，支持动态语法
- bind 绑定模型字段，特定语法，下文详细阐述
- deps 其他依赖的模型字段，不支持动态语法
- vars 为当前组件提供变量别名，涉及动态语法的内容，具体会在下文详细阐述
- model 局部作用域内绑定模型: 字符串，支持动态语法，内部的 bind, deps 将改变引用至给定的模型上
- repeat 当前这个组件会被重复渲染，特定语法，具体阅读下方详细阐述

```js
{
  id: 'xxxxx',
  type: 'div',
  bind: 'url',
  deps: ['name', 'age'],
  vars: {
    height: '{ age.value * 5 }',
  },
  class: "{ age.value > 10 ? 'age-10-plus' : '' }",
  style: {
    marginTop: '10px',
  },
  props: {
    value: '{ age.value }',
  },
  events: {
    'touchStart(e)': '{ onTouchStart(e) }'
  },
  attrs: {
    placeholder: '{ age.placeholder }',
  },
  children: [
    ... // 子组件列表
    'text', // 直接使用文本
  ]
}
```

**跨框架差异**

Formast 支持 react 和 vue，但是两者在组件的数据处理上略有不同。为了保证我们的 schema 具有通用性，为了保证同一份 JSON 可同时在 react 和 vue 中运行，formast 引擎要求组件节点数据结构做最大兼容处理，因此，你看到节点数据中有`props`和`attrs`这两个看上去功能相同的属性，同时，也用`events`把事件绑定部分独立了出来。

`props` 和 `attrs` 的区别在于：1. attrs 只传递字符串，组件只能从 attrs 接收字符串，而 props 可以传对象、函数等复合数据；2. 在 react 中作 attrs 为 props 一部分传入（字符串）给组件，在 vue 中独立传入（字符串）给组件（具体[参考vue官方文档](https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth)）；3. attrs 的值（字符串）会同步给 props，而 props 不会同步给 attrs（这个逻辑和DOM的property和attributes一致），在最终生成的DOM节点上，你可以读取attrs的值，而可能看不到props中传递的值。

同时，为了保证两个框架中事件绑定的通用性，`events`也会有兼容处理。

- 事件回调：在 vue 中，`events`中的属性名全部被转化为小写，组合成`v-on:touchstart`这种形式，而在 react 中则变成`onTouchStart`，所以我们才要求命名形式必须是驼峰命名
- 样式类：统一使用 class 属性，必须是字符串，在 react 中会自动转化为 className 作为 props 的属性给组件，在 vue 中直接传入组件
- 样式对象：统一使用 style 属性，且必须是对象，且属性符合标准的 CSSStyleDeclaration，在 react 中作为 props 的属性给组件，在 vue 中直接传入组件

举个例子，例如下面这段JSON：

```
{
  type: 'input',

  props: {
    'data-max': '{ name.max }',
  },

  class: 'my-form custom-form',
  style: {
    marginTop: '10px',
  },

  events: {
    'change(e)': '{ onChange(e) }',
  },

  attrs: {
    value: '{ name.value }',
    placeholder: '{ name.placeholder }',
  },
}
```

在 react 中就是：

```
<input
  data-max={name.max}
  className="my-form custom-form"
  style={{ marginTop: 10 }}
  onChange={e => onChange(e)}
  value={name.value}
  placeholder={name.placeholder}
/>
```

在 vue 中就是：

```
<input
  :data-max="name.max"
  class="my-form custom-form"
  :style="{ marginTop: '10px' }"
  @change="onChange($event)"
  :value="name.value"
  :placeholder="name.placeholder"
/>
```

上面的`value`和`placeholder`对与vue来说，一定要放在attrs中，因为他们是对应DOM的attributes，如果在props中传入，则无法作为默认值被展示出来。这是vue和react的差别导致的。这也是为什么我们要区分props和attrs的原因。一般而言，attrs只在该组件是原生组件（如div、input等）时才使用，如果你的整个表单都是使用封装好的组件，则可以不用考虑attrs的问题。

**model**

`model` 属性具有魔法性质，你必须在了解它的机理的情况下使用。`model` 有3种值，分别是：

- "{ some }": 将表达式的结果绑定为*当前作用域及其子作用域*的 model，注意，表达式的结果必须是 Model 实例，不能为普通值
- "some": 绑定*当前作用域及其子作用域*的 model 为上一级 model 的 some 子模型。这里可通过子模型的路径进行读取，读取结果必须是 Model 实例，不能为普通值
- false: 重置*当前作用域及其子作用域*的模型为最顶级模型

通过 `model` 绑定之后，当前作用域在读取字段时，不再读取全局 model 上的字段，而是绑定的字段。`model` 比 `vars` 生效更早，因此，vars 上读取字段时，将从绑定的 model 上读取，而不再从全局 model 读取。因此，在该作用域内使用 bind, deps 等时，是从绑定的 model 上读取。这一设计，有利于在某些场景下更好更便捷的使用模型。

如果没有传入 `model`，表示默认当前作用域继承（等于）父级作用域的模型。如果你不确定当前作用域的模型为那个模型，可以通过 model: false 快速重置。

```
{
  "type": "xxx",
  "model": "pet", // 将上一级模型的 pet 子模型作为当前作用域及其子作用域的模型
  "bind": "name", // 实际上是使用 pet 这个子模型的 name 字段
  "children": [
    {
      "type": "xxx",
      "bind": "age" // 实际上是使用 pet 这个子模型的 age 字段，子作用域继承了父级作用域的模型绑定
    }
  ]
}
```

**绑定字段**

在表单中，bind 作用非常大，因为我们在模型中已经定义了一个字段的可见性、必填逻辑等，同时字段视图也可以实时读取错误提示语，所以，当我们在创建一个表单组件当时候，可以通过bind把这个组件绑定到某个字段上，那么这个组件就自动拥有了这个字段所定义的各种逻辑，同时，当用户在这个组件内编辑字段的值，也可以方便的更新到模型中，而无需手动管理这一逻辑。

另外，deps 也很重要，formast 会通过依赖收集收集需要监听的字段，当这些字段发生变化时，组件就会更新。但是，在某些场景下面，没有被收集到的字段，也需要触发当前这个组件更新。所以，deps 这个信息就是帮助我们增加这些字段的监听的。

### layout

`layout` 的整体结构如下：

```
{
  model: ...
  layout: {
    // 顶级组件
  },
}
```

layout 本身的值就是一个组件。

在 Schema 中，组件是一个代号，携带了描述信息，在前端具体展示成什么样子，由开发者自己决定（通过 render 宏实现）。

## 动态语法

用于表达在真正运行时，可视化界面上各个节点的展示/交互逻辑。例如表单的联动、区块根据条件显示等。

在 Schema 中，使用特殊的标记表达动态语法。 包含如下部分：

- 变量
- 作用域
- 表达式
- 函数

### 变量（可选）

*大部分情况下，你都可能用不到 vars!!!*

变量包含变量的声明、使用（涉及使用使该变量除了声明之外的来源问题）、操作（赋值）。

**声明变量**

在“布局描述”的一个节点，可以通过 `vars` 声明一组变量，该组变量只能在当前节点（不包含子节点）使用。

```js
{
  // 声明变量
  vars: {
    a: 1,
    b: 2,
  },

  // 节点其他属性描述
  type: 'some-component',
  props: {
    dataA: '{ a }', // 在当前节点才能使用 a，节点外无法使用 a
  },

  children: [
    {
      type: 'sub-component',
      props: '{ b }', // Error： 子节点不可以直接使用父节点（祖先）声明的变量
    },
  ]
}
```

> 这里可能理解起来比较麻烦，对于formast而言，一个组件JSON节点实际上是一个静态描述，它描述的是该组件所处环境相关的信息，其中包含了作用域、组件本身的描述、子组件体系的描述等。组件本身的描述是主体，但是，作用域的描述也不可忽视，包括vars/model/bind/deps都是作用域相关的描述，它们解决的是当前这个节点与formast所表达的表单整体在数据层面的联动。另一方面，子组件体系和当前这个组件没有本质上的关联性，这和react组件中的children完全是两码事，react中的children是当前组件实例的一部分，而formast中children所表达的是子组件体系（JSON层面的子节点），仅仅是一段描述，而非实例化后的结构关系，因此，当前节点的描述和子节点的描述没有数据层面的依赖关系，而两者仅仅是嵌套关系，用以决定在最终界面上的嵌套逻辑。理解这一点，对理解vars生效的范围非常必要。
> 如果你希望在多层级节点之间同时使用一个状态，你应该使用model来实现状态共享的效果。你可以阅读关于[model的完整定义](https://tyshemo.js.org/#/loader?id=schema-json)模式，借助state定义来获得状态辅助对象。

在 Schema 中，我们定义 model, constants，在布局描述中，我们可以在 vars 声明内部变量时读取 model, constants 上的值。与此同时，作为一个组件，你还能接收到来自使用该组件时传入的 props。这三种值都是外部环境给组件的，属于全局变量。你可以直接在 vars 中使用它们：

例如：

```js
{
  vars: {
    a: '{ field }', // field 可能来自 model
    handleChange: '{ onChange }', // onChange 可能来自 props
    d: '{ CONSTANT_DEFINE }', // CONSTANT_DEFINE 可能来自 constants
  },
}
```

之所以是“可能”，是因为这些属性并不能确定一定来自哪里。这里有一个作用域的概念，会在下一节详细阐述。

**使用变量**

区别于普通字符串，使用一对花括号`{}`将值括起来的字符串，以表示这是一个表达式，在表达式中可以引用作用域内的变量。

```js
{
  vars: {
    a: 1,
  },
  type: 'some-component',
  props: {
    count: '{ a + 1 }', // 使用变量以表达式的形式使用，支持简单的js表达式，不支持语句
  },
}
```

全局作用域的的属性/字段可在组件中直接使用，而无需再在 vars 中定义。

**操作变量**

在作用域内，可以重新对变量进行赋值，使用 js 语法中的 = 进行赋值。

```
"{ a = a + 1 }"
```

`=` 后面可以是任意表达式，通过赋值后，变量发生变化，而由于发生变量的变化，使用了变量的组件局部会被触发重新渲染。

*注意：操作全局变量效果是不一样的，修改 model, props, constants 等全局变量不会产生任何效果。修改 model 某个字段视图上的 value 会带来界面的重新渲染。*

### 表达式

在`{}`内支持简单的 JS 语法表达式，在前面已经有演示。

```
{
  props: {
    isShow: '{ !!a }',
    doNet: '{ b === 2 ? 'seed' : 'keep' }',
    obj: '{ { a: 1, b: 2 } }', // 对象
  }
}
```

虽然`{}`内支持简单的 JS 语法表达式，但是它的能力有限，仅支持表达式，不支持语句，不能作为执行 JS 脚本的地方。

> 表达式变量本质上是一个计算属性。因此，当程序第二次读取该变量时，它会再次进行一次计算，得到新值。（但在 vars 处使用表达式是一次性计算的，vars 不会继续保持计算特性。）

### 函数

在 Schema 中，某些场景下需要函数，例如响应用户的操作。

一般而言，我们很少用到函数，但是我们需要支持这一能力，在需要的时候可以使用。

**声明函数**

当我们把一个对象的属性名写成 `xxx()` 的形式（带括号）的时候。表示这个属性是一个函数方法。

```
{
  vars: {
    a: '',
    'handleChange(e)': '{ a = e.target.value }',
  },
}
```

声明函数需要使用特殊的属性名，例如此处的 handleChange(e)，其中函数名为 handleChange, 参数为 e. 在函数体中，参数将作为变量被引用，且会覆盖 vars 中声明的变量。

**使用函数**

```
{
  type: 'input',
  props: {
    onChange: '{ handleChange }',
  }
}
```

或者，我们并不在vars中声明函数，而是实时地在描述中声明函数：

```
{
  type: 'input',
  props: {
    'onChange(e)': '{ a = e.target.value }',
  }
}
```

### 作用域

作用域分两类：局部作用域（vars）、全局作用域（model, props, constants, global）。

在组件中使用表达式时，会去读取表达式里面变量名对应的值，它的读取链如下：

```
函数参数 > vars > repeat污染 > model视图 > constants > props > fns > global
```

- 函数参数：在JSON中使用函数语法，例如 `"fn(e)": "{ ... }"`
- vars: 在JSON中使用vars定义，例如 `"vars": { ... }`
- repeat污染：在JSON中使用repeat定义，例如 `"repeat": "item,index in items"`
- model视图：在JSON中定义的model字段视图，例如 `"some_field": { ... }` 使用时读取 `some_field.value`
- constants: 在JSON中使用constants定义
- props: 在使用组件的代码中传入的组件props
- fns: 在创建formast实例时传入fns
- global: 在创建formast实例时传入fns

注意，这里的 props 是指外部开发者传入给生成的组件的 props，而非组件 JSON 内的 props 描述信息。你不可能通过 props 覆盖 model 或 constants 上面描述的内容。

global 是你调用引擎方法创建表单时传入的 global 参数。

另外，由于作用域读取顺序限制，为避免读取冲突，你应该控制 props, model, constants 上的属性名称，避免命名重复后读取不到。

即，当遇到 `{ a }` 时，首先去读取 vars.a；如果没有，则读取 model 的 a 字段视图；如果没有，读取 constants.a；如果没有则读取 props.a；如此下去，如果没有，则返回 undefined.

当对变量赋新值时，例如 `{ a = a + 1 }` 会改变 vars.a，即使 vars 上不存在 a 属性，在 constants 上有 a 属性，其结果也是在 vars 上新增了一个 a 属性。因此，这种赋值是无法修改 props 和 constants 的。但是，由于我们读取的是 model 视图，我们可以修改视图上的值，例如 `{ field.value = field.value + 1}`，这样可以使 model 发生变化而触发界面更新。

和 JS 的作用域不同，一个组件所在作用域只包含自己 vars 上声明的变量和全局变量，不包含父级作用域（父组件所在的作用域）的变量。但是，在其使用 vars 声明变量时，父级作用域会一次性将当前作用域 vars 上的变量传递给子作用域使用，当 vars 声明完毕时，该传递失效。修改子作用域中的变量，不会对父作用域产生任何影响。父级作用域中变量变化后，也不会再次传递新值给子作用域。

*这和 JS 中的作用域差别非常大，一开始可能不习惯，但是随着深入使用，你会发现这一设计对表单的数据管理和性能都有非常大的好处。*

## 模型描述

*首先需要明确一点，模型在 formast 中是可选的，但是我们推荐使用，以更好的管理表单数据。*

在复杂业务场景中，我们需要声明一个模型，用于绑定到布局中，通过模型操作数据，再驱动视图变化。模型是对业务实体的抽象。一个 Schema 中只有一个根模型，如果一个业务场景下存在多个业务实体，则这些业务实体由根模型中的子模型表达。

模型定义由字段及字段描述完成。描述中也存在动态语法的使用，这部分可阅读下文。

一个模型的描述如下：

```
model: {
  field: Meta, // 普通字段描述
  <sub>: Model|[Model], // 子模型
  sub: Meta, // 对子模型展开描述，可选
}
```

**字段**

声明模型上存在的字段。它有3种形式：

- `field`: 普通字段
- `<sub>`: 子模型，子模型的结构和根模型的结构一摸一样
- `|sub|`: 对应子模型的描述，可以直接写成 `sub`，`<sub>`指定子模型本身，|sub|指定子模型其他描述信息

**Meta**

Meta 是对字段元数据的描述。它包含：

```ts
interface Meta {
  // required, any,
  // if you need to return an object/array, you should give a function to return,
  // i.e. default() { return { name: 'some' } }
  default: '',

  // optional, computed property, will compute at each time digest end
  // when it is a compute property, it is not able to use `set` to update value
  compute?() {
    const a = this.a
    const b = this.b
    return a + '' + b
  },

  // optional, when passed, `set` action will return prev value if not pass type checking
  // notice: `default` and result of `compute` should match type,
  // can be rule, i.e. equal(String)
  type?: String,
  // optional, string, message to return when type checking fail
  message?: '',
  // optional, if true, when the given value does not pass type checking, the value will be replace with default value or previous value
  force?: Boolean,

  // optional
  validators?: [
    // read more about [Validator](validator.md)
    validator,
    ...
  ],

  // optional, function, used by `fromJSON`.
  // `json` is the first parameter of `fromJSON`
  create?: (value, key, json) => !!json.on_market ? json.listing : json.pending,
  // optional, function, used by `toJSON`.
  // use this to create an object which can be used by fromJSON to recover the model
  save?: (value, key, data) => {
    // notice: the return value should MUST be an object, and will be patched to output object (like `flat` do), so that you can export a complext object
    return { [key]: newValue }
  },
  // optional, used by `fromJSON` and `toJSON` to read or save to property
  // ie. asset='some', tyshemo will read property from data.some, and patch save result as json.some
  // {
  //   asset: 'some',
  //   create: value => value, // value = data.some
  //   save: value => value, // json.some = value
  // }
  // notice, if you want to return custom object in create or save, dont pass asset
  asset?: String,

  // optional, function, whether to not use this property when `toData`
  drop?: (value, key, data) => Boolean,
  // optional, function, to override the property value when `toData`, not work when `drop` is false
  map?: (value, key, data) => newValue,
  // optional, function, to assign this result to output data, don't forget to set `drop` to be true if you want to drop original property
  flat?: (value, key, data) => ({ [key]: newValue }),
  // optional, submit the key to be another name, for example: { to: 'table_1.field_1' } -> { 'table_1.field_1': value }
  to?: String,

  // optional, function, format this property value when set
  setter?: (value) => value,
  // optional, function, format this property value when get
  getter?: (value) => newValue,
  // optional, function, format this field to a text, you can read the text on `model.$views.field.text`
  formatter?: (value) => text,

  // optional, function or boolean or string,
  // if `readonly` is true, you will not be able to change value by using `set` (however `assign` works)
  readonly?: Boolean|Function,
  // optional, function or boolean or string,
  // if `disabled` is true, you will not be able to change value by using `set` (however `assign` works),
  // when you invoke `validate`, the validators will be ignored,
  // when you invoke `export`, the `drop` will be set to be `true` automaticly, `flat` will not work too
  disabled?: Boolean|Function,
  // optional, function or boolean or string,
  // if `hidden` is true, it means you want to hide the field related ui component
  hidden?: Boolean|Function,

  // optional, function or boolean or string.
  // `required` will affect validation. If `required` is false, validation will be dropped when the given value is empty. For example, schema.validate('some', null, context) -> true. Only when `required` is true, the validation will thrown out the errors when the given value is empty.
  // `Empty` rule: null|undefined|''|NaN|[]|{}
  required?: Boolean|Function,
  // optional, function to determine the value is empty
  empty?: Function,

  // when this field's value changed, the `watch` function will be invoke
  watch?({ value }) {},

  // optional, return an object to be attached to model
  state?() {
    return {
      some: 'default value',
    }
  },
  // optional, return an object which has the same structure of a schema defs object whose node should must be Meta
  // if depend on a existing field, the field in deps() will not work
  deps?() {
    return {
      field_a: A_Meta, // A_Meta is a Meta which defined before
      field_b: B_Meta, // if there is another field called `field_b` on Model, this will not work
    }
  },

  // optional, when an error occurs caused by this property, what to do with the error
  catch?: (error) => {},

  // any other attr name, which can be used in Model by Model.attrs method
  // notice, if it is a function, it will be used as a getter whose parameter is the key name and return value will be treated as the real value when called on view
  // i.e. some(key) { return 'real_value' } -> model.$views.field.some -> 'real_value'
  [attr]?: any,
}
```

每一个描述被称为“属性（Attribute）”，即一个字段有多个属性。这些属性大部分是可选的。

在模型定义中，当前模型的字段可以在当前模型中直接引用，例如：

```js
{
  "a": {
    "default": 0,
    "type": "int",
    "options": "{ SOME_OPTIONS }" // 在模型中引用 constants 中的某个常量。
  },
  "b": {
    "default": 0,
    "type": "int",
    "required": "{ a === 1 }" // 在 b 字段的属性描述中直接引用 a 字段的值
  }
}
```

*注：在模型定义时，使用`a`读取a字段的值，在视图定义（layout）中使用`a`读取a字段的视图，两处定义时用法不同。*

*注：虽然schema中如此规定，但在 formast 中，支持完整的 model json 解析，以辅助完成某些更复杂的需求。完整 model json 请[阅读这里](https://tyshemo.js.org/#/loader?id=schema-json)。*

**使用**

定义好模型后，我们可以在其他地方通过动态语法引用模型。我们从模型上读取字段的结果，是一个被称为“视图”的对象，该对象拥有字段描述的各种特性，例如该字段是否必填，是否隐藏，是否需要在提交时丢弃等等。

```
"{ field.required }" // 得到当前field字段是否必填的结果
```

基于模型的设计，我们在布局中，设计出可以直接绑定模型“视图”的组件，因此，我们只需要告诉组件需要绑定的模型视图即可：

```js
{
  type: 'some-type',
  bind: 'field', // some-type 组件会根据 field 的视图信息决定组件是否展示、必填、错误等。
}
```

**视图**

和字段的值不同，字段视图是包含了该字段所有当前状态信息的聚合。例如当前这个字段是否必填，是否有校验错误，是否只读，是否为空等等，这些信息都可以在字段视图上读取。

Formast 中有如下规则：

- 组件默认绑定（bind, deps）的是视图
- 组件动态语法中默认调用视图
- 模型定义中默认调用字段值
- 模型定义中要调用字段视图需使用..选取

最后一点，举个例子：

```js
model: {
  a: {
    default: 1,
    hidden(v): "{ v > 10 }"
  },
  b: {
    default: 0,
    hidden: "{ ..a.value <= 10 }" // -> ..a 表示读取当前模型上的 a 字段的视图
  },
}
```

**视图读取语法糖**

在 schema 动态语法中，你可以使用 `..` 语法读取模型的字段视图。例如 `..a` 表示读取 `a` 的字段视图，`$parent..b` 表示读取父级模型的 `b` 字段视图。

`..` 语法不是表示读取路径，而是 `$views.` 的缩写，例如上面 `..a` 是 `$views.a` 的缩写。`$views` 是模型上的特殊字段，不是语法。
我们可以通过读取另外的子模型来快速读取视图，例如，`some..name.value` 实际上读取的是 `some.$views.name.value`，其中 `some` 是一个子模型，它上面有一个 `name` 字段。

**子模型**

在模型定义中，如果需要读取父级模型的某个字段的值，可以使用 $parent 来读取父级模型，例如：

```js
{
  '<sub>': {
    field: {
      default: '',
      type: 'string',
      required: '{ $parent.some }',
    }
  },
}
```

$parent 是模型的特殊字段，不是语法。通过 $parent.some 读取了父级模型的 some 字段的值。

除 $parent 外，模型上还有一个 $root 字段，用于读取最顶层的模型。例如：

```
required: "{ $root.parent.child..a.required }" // -> 根据距离比较远的字段的 required 信息确定当前字段的 required
```

## 循环遍历

对数组或对象进行遍历输出是常见操作，但在 Schema 中需要如何描述呢？

```js
{
  "model": {
    "<animals>": [
      {
        "name": {
          "default": "",
          "placeholder": "填写名称"
        },
        "kind": {
          "default": "",
          "placeholder": "选择类型",
          "options": [
            {
              "text": "A",
              "value": "a"
            },
            {
              "text": "B",
              "value": "b"
            }
          ]
        }
      }
    ]
  },
  "layout": {
    "type": "div",
    "repeat": "item,index in animals", // -> repeat 特殊语法
    "children": [
      {
        "type": "Input",
        "model": "{ item }", // -> repeat 会污染整个作用域，因此，其子作用域能直接读取到 repeat 的内容
        "bind": "name"
      },
      {
        "type": "Select",
        "bind": "kind"
      }
    ]
  }
}
```

`repeat` 是一个非常特殊的语法。它会产生一个循环重复效果，例如上面的例子中，`div` 将会被重复渲染。

它会直接污染当前作用域及其子作用域，而且它的生效比 model 更早，也就是说，我们可以在同级作用域使用 model: "{ item }" 将 item 绑定到 model 上。

它的语法结构如下：

```
repeat: "item,index,items in listField"
repeat: "item,index,items in { listVar }"
```

语法结构中 in 是个关键字，in 前面规定了每个迭代中，当前元素和索引在作用域里面的变量名。
其中 item 为迭代值，index 为迭代索引，items 为原始列表数据的引用。
item, index, items 可以在当前作用域及其子作用域中使用。

第一个语法中，in 后面的 listField 表示从当前作用域的 model 上读取 listField 字段的值作为列表。
第二个语法中，通过 { listVar } 表达式，从当前作用域读取 listVar 变量值作为列表，此时 listVar 可以来自外部传入的 props.items，或者其他内容，这种设计方便开发者灵活使用变量。

### 宏

在某些场景下，我们可能需要对某些内容进行特殊处理，而这些处理无法直接在 JSON 中撰写，此时，我们可以使用宏来定义。

在 Schema 中，我们只会使用宏，使用时在具体的节点属性名末尾跟上 `!宏` 即可，例如在 react 中，我们有时需要通过 props 来接收组件，例如：

```js
<SomeComponet
  header={<Header />}
  footer={<Footer />}
/>
```

一般我们很少会在系统中用到这种设计，但是我们可以通过宏语法在 schema 中支持这种设计。

```js
{
  type: 'SomeComponent',
  props: {
    'header!': {
      type: 'Header',
    },
    'footer!': {
      type: 'Footer',
    },
  },
}
```

Formast 会在解析时，遇到没有传入宏名称的，会自动使用 `render` 这个宏来处理。所以，实际上，上面的 `header!` 是 `header!render` 的缩写。

每一个宏具体要做什么事情，由开发者自己定义。
我们只能一次性使用一个宏，无法同时使用多个宏。你可以通过在外部传入宏时，创建一个组合宏来实现多个函数（宏本身也是个函数）一起执行。

## 常量描述

通过 constants 字段，附加整个系统的常量，可以在内部被读取，但是是不可变数据，无法在任何一个地方被修改。例如：

```
{
  constants: {
    MAX_COST_VALUE: 1000,
  }
}
```

使用时：

```
{
  vars: {
    a: '{ MAX_COST_VALUE }',
  }
}
```
