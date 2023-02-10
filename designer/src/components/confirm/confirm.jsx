import { React, Section, useState, useCallback } from 'nautil'
import { Modal } from '../modal/modal.jsx'
import { classnames } from '../../utils'

export function Confirm(props) {
  const { title, content, onCancel, onSubmit, width, trigger } = props
  const [isShow, toggleShow] = useState(false)

  const handleCancel = useCallback((e) => {
    toggleShow(false)
    onCancel && onCancel(e)
  }, [])

  const handleSubmit = useCallback((e) => {
    toggleShow(false)
    onSubmit && onSubmit(e)
  }, [])

  const handleShow = useCallback(() => {
    toggleShow(true)
  }, [])

  return (
    <>
      {trigger(handleShow)}
      <Modal isShow={isShow} disableClose onCancel={handleCancel} onSubmit={handleSubmit} title={title} width={width}>
        <Section stylesheet={[classnames('confirm')]}>{content}</Section>
      </Modal>
    </>
  )
}
export default Confirm
