import { Button as NButton } from 'nautil'
import { classnames } from '../../utils'

export const Button = NButton.extend(props => {
  return {
    stylesheet: classnames(
      'button',
      props.primary ? 'button-primary' : props.secondary ? 'button-secondary' : null,
      props.large ? 'button--large' : null,
    ),
    deprecated: ['primary', 'secondary', 'large'],
  }
})
