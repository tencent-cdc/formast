import {
  React,
  Input as NInput,
  Textarea as NTextarea,
  Select as NSelect,
  Text,
  Section,
  Form as NForm,
  useUniqueKeys,
  produce,
} from 'nautil'
import { Button } from '../button/button.jsx'
import { classnames } from '../../utils'

export const Input = NInput.extend(props => {
  return {
    stylesheet: [
      classnames('input', props.small ? 'input--small' : null),
      props.width ? { width: props.width, flexGrow: 'unset' } : null,
    ],
    deprecated: ['width', 'small'],
  }
})

export const Textarea = NTextarea.extend(props => {
  return {
    stylesheet: [
      classnames('textarea'),
      props.width ? { width: props.width, flexGrow: 'unset' } : null,
      props.minHeight ? { minHeight: props.minHeight } : null,
    ],
    deprecated: ['width', 'minHeight'],
  }
})

export const Select = NSelect.extend(props => {
  return {
    stylesheet: [
      classnames('select'),
      props.width ? { width: props.width, flexGrow: 'unset' } : null,
    ],
    deprecated: ['width'],
  }
})

export const Label = Text.extend({
  stylesheet: [classnames('label')],
})

export const Form = NForm.extend(props => ({
  stylesheet: [classnames('form', props.aside ? 'form--aside' : null)],
  deprecated: ['aside'],
  props: {
    ...props,
    onSubmit: props.onSubmit || (e => e.preventDefault()),
  },
}))

export const FormItem = Section.extend(props => ({
  stylesheet: [
    classnames(
      'form-item',
      props.small ? 'form-item--small' : null,
    ),
  ],
  deprecated: ['small'],
}))

export const FormLoop = (props) => {
  const { items, render, onAdd, onDel, onChange, canAdd, canRemove } = props
  const handleAdd = (index) => {
    onAdd(index)
  }
  const handleDel = (index) => {
    onDel(index)
  }
  const keys = useUniqueKeys(items)

  return (
    <Section stylesheet={[classnames('form-loop')]}>
      {items.map((item, i) => {
        const handleChange = (item) => {
          const next = produce(items, items => {
            Object.assign(items[i], item)
          })
          onChange(next)
        }
        return (
          <Section stylesheet={[classnames('form-loop-item')]} key={keys[i]}>
            <Section stylesheet={[classnames('form-loop-item__content')]}>
              {render(i, item, handleChange)}
            </Section>
            <Section stylesheet={[classnames('form-loop-item__buttons')]}>
              {!canAdd || canAdd() ? <Button primary onHit={() => handleAdd(i)}>+</Button> : null}
              {!canRemove || canRemove() ? <Button secondary onHit={() => handleDel(i)}>-</Button> : null}
            </Section>
          </Section>
        )
      })}
      {!items.length && (!canAdd || canAdd()) ? <Button primary onHit={() => handleAdd()}>+</Button> : null}
    </Section>
  )
}

export function Switcher(props) {
  const { className, value, onChange } = props
  const handleChange = (e) => {
    onChange(e, !value)
  }
  return (
    <span className={classnames('switcher', className)}>
      <label className={classnames('switcher-content')}>
        <input type="checkbox" checked={!!value} onChange={handleChange} />
        <span></span>
      </label>
    </span>
  )
}