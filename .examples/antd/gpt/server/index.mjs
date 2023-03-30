import axios from 'axios'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

app.post('/api/gpt', async (req, res) => {
  const { prompt } = req.body
  const content = `
  JSON结构规则：
  {
    // 模型描述
    model: {
      // 字段属性
      [key: string]: {
        // 默认值
        // string = ""
        // number = null
        // 如果存在options，使用options中第一个option的value
        default: any

        // 字段文本
        label: string

        // 字段类型
        type: string

        // 隐藏逻辑，支持表达式
        hidden?: boolean | string

        // 必填逻辑，支持表达式
        required?: boolean | string

        // 最小值（包含）
        min?: number

        // 最大值（包含）
        max?: number

        // 只读，字段值不允许修改，支持表达式
        readonly?: boolean | string

        // 字段由计算获得，其值必须是表达式
        compute?: string

        // 备选项
        options?: {
          // 选项文本
          label: string
          // 选项值
          value: string
        }

        // 其他属性
        [key: string]: string
      }
    }

    // 布局描述
    // 布局有3层
    layout: {
      // 顶层组件，页面
      type: 'Form'

      attrs: {
        // 表单提交的目标地址
        action: string
      }

      // 页面内有多少行
      children: {
        // 一行组件
        type: 'FormItem'

        // 这一行绑定的模型上的字段，用于展示label等信息
        // 如果这一行只有一个字段需要被输入，那么直接绑定这个字段
        bind: string

        // 行内输入组件
        children: {
          // 使用的组件名
          // 组件名支持:
          // Input 单行文本输入框
          // InputNumber 数字输入框
          // Select 下拉选择框
          // InputText 多行文本输入框
          // Radios 单选按钮组
          // Checkboxes 多选按钮组
          type: string

          // 绑定模型字段，绑定后，字段的元数据信息会被绑定到组件上，组件不需要传入其他任何配置信息
          bind: string
        }[]
      }[]
    }
  }

  动态语法规则：
  使用"{ ... }"来表达该值是一个表达式，例如"{ name }"，其中name是字段名。

  ${prompt.trim()}

  期望格式: JSON，只返回JSON代码。
  `

  const promptMessage = content.replace(/\s+/g, ' ').trim()

  const now = new Date()
  const month = now.getMonth() + 1
  const today = now.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + now.getDate()

  try {
    const result = await axios.post(process.env.API, {
      prompt: promptMessage,
      systemMessage: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${today}`,
      options: {},
    })
    const { data } = result

    if (data.status === 'Success') {
      const { id, text } = data.data
      try {
        const schema = JSON.parse(text)
        res.json({ code: 0, data: { id, schema } })
      }
      catch (e) {
        console.log(prompt)
        console.error('返回结果：', text)
        res.status(415)
        res.json({ code: 415, error: '结果不是JSON，请重新输入表单描述试试' })
      }
      return
    }

    console.error('返回错误：', data.message)
    res.status(415)
    res.json({ code: 415, error: data.message })
  }
  catch (e) {
    console.error(e)
    res.status(500)
    res.json({ error: e.message })
  }
})

app.listen(process.env.PORT, process.env.HOST, () => console.log(`服务启动 http://${process.env.HOST}:${process.env.PORT}`))
