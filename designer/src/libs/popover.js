import { classnames } from '../utils'

export class Popover {
  constructor() {
    const el = document.createElement('div')
    el.classList.add(classnames('popover'))
    document.body.appendChild(el)

    this.el = el
  }

  show(text) {
    const el = this.el
    el.innerHTML = `<div class="${classnames('popover-text')}">${text}</div>`
    el.classList.add(classnames('popover--show'))
  }

  hide() {
    const el = this.el
    el.classList.remove(classnames('popover--show'))
    el.innerHTML = ''
  }

  destroy() {
    if (this.el) {
      this.hide()
      document.body.removeChild(this.el)
      this.el = null
    }
  }

  setPos(x, y, type = 'fixed') {
    this.el.classList.add(classnames('popover--' + type))
    this.el.style.left = x + 'px'
    this.el.style.top = y + 'px'
  }

  static show(e, text) {
    const popover = Popover.__instance = Popover.__instance || new Popover()

    const target = e.target
    const { top, left, width } = target.getBoundingClientRect()
    popover.setPos(left + width / 2, top)

    popover.show(text)
    return () => {
      popover.destroy()
      delete Popover.__instance
    }
  }

  static hide() {
    const popover = Popover.__instance = Popover.__instance || new Popover()
    if (!popover) {
      return
    }
    popover.destroy()
    delete Popover.__instance
  }
}
