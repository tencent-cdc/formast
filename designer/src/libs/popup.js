import { classnames } from '../utils'

export class Popup {
  constructor() {
    const el = document.createElement('div')
    el.classList.add(classnames('popup'))
    document.body.appendChild(el)

    this.el = el
    this.timer = null
  }

  show(text) {
    const el = this.el
    el.innerHTML = `<div class="${classnames('popup-text')}">${text}</div>`
    el.classList.add(classnames('popup--show'))
  }

  hide() {
    const el = this.el
    clearTimeout(this.timer)
    el.classList.remove(classnames('popup--show'))
    el.innerHTML = ''
  }

  destroy() {
    if (this.el) {
      this.hide()
      document.body.removeChild(this.el)
      this.el = null
    }
  }

  toast(text, interval = 3000) {
    this.show(text)

    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.hide()
    }, interval)
  }

  static toast(text, interval) {
    const popup = Popup.__instance = Popup.__instance || new Popup()
    popup.toast(text, interval)
    return () => {
      popup.destroy()
      delete Popup.__instance
    }
  }

  static hide() {
    const popup = Popup.__instance = Popup.__instance || new Popup()
    if (!popup) {
      return
    }
    popup.destroy()
    delete Popup.__instance
  }
}
