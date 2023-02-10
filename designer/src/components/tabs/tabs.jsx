import { React, Section, Text, Each } from 'nautil'
import { classnames } from '../../utils'

export function Tabs(props) {
  const { items, active, onSelect } = props

  return (
    <Section stylesheet={[classnames('tabs')]}>
      <Each of={items} render={(item) =>
        <Section key={item.value} stylesheet={[classnames('tabs__tab', active === item.value ? 'tabs__tab--active' : '')]} onHit={() => onSelect(item)}><Text>{item.text}</Text></Section>
      } />
    </Section>
  )
}
export default Tabs
