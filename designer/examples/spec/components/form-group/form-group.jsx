import { React, Section, Text } from 'nautil'

export function FormGroup(props) {
  const { title, children } = props

  return (
    <Section stylesheet={['app-form-group']}>
      <Section><Text>{title}</Text></Section>
      {children}
    </Section>
  )
}