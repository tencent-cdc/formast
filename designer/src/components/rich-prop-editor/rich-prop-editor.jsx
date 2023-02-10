import { React, produce, Text } from 'nautil'
import { Label, Select, Input, Textarea, Switcher } from '../form/form.jsx'
import { VALUE_TYPES } from '../../config/constants.js'
import { BsFillQuestionCircleFill } from 'react-icons/bs'
import { Popover } from '../../libs/popover.js'

const attrTypes = [
  { value: VALUE_TYPES.STR, text: '纯文本' },
  { value: VALUE_TYPES.ENUM, text: '枚举' },
  { value: VALUE_TYPES.BOOL, text: '开关' },
  { value: VALUE_TYPES.EXP, text: '表达式' },
  { value: VALUE_TYPES.FN, text: '函数' },
]

export function RichPropEditor(props) {
  const { label, data, onChange, types, options, description, placeholder = '' } = props
  const items = attrTypes.filter(item => types ? types.includes(item.value) : true)

  const handleChangeType = (e) => {
    onChange(produce(data, data => {
      const type = data.type = +e.target.value

      if ([VALUE_TYPES.STR, VALUE_TYPES.EXP, VALUE_TYPES.FN].includes(type)) {
        data.value = data.value + ''
      }
      else if (type === VALUE_TYPES.ENUM) {
        if (!(options && options.some(item => item.value === data.value))) {
          data.value = options ? options[0].value : data.defender ? data.defender(data.value) : 0
        }
      }
      else if (type === VALUE_TYPES.BOOL) {
        try {
          const value = !!JSON.parse(data.value + '')
          data.value = value
        }
        catch (e) {
          data.value = false
        }
      }
    }))
  }

  return (
    <>
      <Label>
        <Text>{label}</Text>
        {description ? <span onMouseEnter={e => Popover.show(e, description)} onMouseLeave={() => Popover.hide()}><BsFillQuestionCircleFill /></span> : null}
      </Label>
      <Select width="90px" options={items} value={data.type} onChange={handleChangeType} disabled={data.disabled} />
      {data.type === VALUE_TYPES.STR ? <Input value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} disabled={data.disabled} placeholder={placeholder} /> : null}
      {data.type === VALUE_TYPES.ENUM ? <Select options={options} value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} disabled={data.disabled} /> : null}
      {data.type === VALUE_TYPES.BOOL ? <Switcher value={data.value} onChange={(e, next) => onChange(produce(data, data => { data.value = next }))} disabled={data.disabled} /> : null}
      {data.type === VALUE_TYPES.FN ? <Input width="90px" placeholder="参数" value={data.params} onChange={(e) => onChange(produce(data, data => { data.params = e.target.value }))} disabled={data.disabled} placeholder={placeholder} /> : null}
      {data.type === VALUE_TYPES.EXP || data.type === VALUE_TYPES.FN ? <Textarea value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} disabled={data.disabled} placeholder={placeholder} /> : null}
    </>
  )
}
export default RichPropEditor
