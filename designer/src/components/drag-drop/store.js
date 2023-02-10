import { applyStore, Store } from 'nautil'

export const store = new Store(null)

const { useStore, connect } = applyStore(store)
export { useStore, connect }
