// store/useErrorStore.js
import { create } from 'zustand'

type ErrorStore = {
  error: any
  setError: (message: any) => void
  clearError: () => void
}

const useErrorStore = create<ErrorStore>((set) => ({
  error: {type: "",message:""},
  setError: (message) => set({ error: message }),
  clearError: () => set({ error: {type:"",message:""}}),
}))

export default useErrorStore
