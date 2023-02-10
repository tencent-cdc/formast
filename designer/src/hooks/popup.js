import { useMemo, useEffect } from 'nautil'
import { Popup } from '../libs/popup.js'

export function usePopup() {
  const popup = useMemo(() => new Popup(), [])

  useEffect(() => {
    return () => {
      popup.destroy()
    }
  }, [])

  return popup
}
