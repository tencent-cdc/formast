import { React, Button, Component } from 'nautil'
import { classnames } from '../../utils'

export class Close extends Component {
  render() {
    return <Button {...this.props} type="button" stylesheet={[classnames('close'), this.className, this.style]}>&times;</Button>
  }
}
