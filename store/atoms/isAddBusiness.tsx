// store/useErrorStore.js
import { create } from 'zustand'

type MenuStore = {
  isAddBusiness: boolean
  addBusiness: () => void
  closeBusiness: () => void
}

const useIsAddBusinessStore = create<MenuStore>((set) => ({
  isAddBusiness: false,
  addBusiness: () => set({ isAddBusiness: true }),
  closeBusiness: () => set({ isAddBusiness: false }),
}))

export default useIsAddBusinessStore
