import { React, useState, useCallback, Section } from 'nautil'
import { isFunction } from 'ts-fns'
import { Button } from '../button/button.jsx'
import { classnames } from '../../utils'
import { Close } from '../close/close.jsx'

export const Modal = (props) => {
  const { isShow, onClose, title, children, onCancel, onSubmit, disableCancel, disableClose, keepAlive, width, className } = props
  return (
    <Section stylesheet={[classnames('modal', isShow ? 'modal--show' : 'modal--hidden'), className]}>
      <Section stylesheet={[classnames('modal-container'), width ? { width } : null]}>
        {!disableClose ? <Close stylesheet={[classnames('modal-close')]} onHit={onClose} /> : null}
        {title ? <Section stylesheet={[classnames('modal-title')]}>{title}</Section> : null}
        <Section stylesheet={[classnames('modal-content')]}>{isShow || keepAlive ? typeof children === 'function' ? children() : children : null}</Section>
        <Section stylesheet={[classnames('modal-footer')]}>
          {!disableCancel ? <Button secondary large onHit={onCancel}>取消</Button> : null}
          <Button primary large onHit={onSubmit}>确定</Button>
        </Section>
      </Section>
    </Section>
  )
}
export default Modal


export function AutoModal(props) {
  const { content, children, onCancel, onSubmit, onClose, trigger, ...attrs } = props
  const [isShow, toggleShow] = useState(false)

  const handleCancel = useCallback(() => {
    toggleShow(false)
    onCancel && onCancel()
  }, [])

  const handleClose = useCallback(() => {
    toggleShow(false)
    onClose && onClose()
  }, [])

  const handleSubmit = useCallback(() => {
    const res = onSubmit && onSubmit()
    if (res || !onSubmit) {
      toggleShow(false)
    }
  }, [])

  const handleShow = useCallback(() => {
    toggleShow(true)
  }, [])

  return (
    <>
      {trigger(handleShow)}
      <Modal isShow={isShow} onCancel={handleCancel} onSubmit={handleSubmit} onClose={handleClose} {...attrs}>
        {content && isFunction(content) ? content() : content || children}
      </Modal>
    </>
  )
}
