// store/useLanguageStore.ts (or .js if not using TypeScript)
import { create } from 'zustand'

type LanguageStore = {
  language: string
  setLanguage: (language: string) => void
  clearLanguage: () => void
}

const useLanguageStore = create<LanguageStore>((set) => ({
  language: "Swahili",
  setLanguage: (language) => set({ language }),
  clearLanguage: () => set({ language: "" }),
}))

export default useLanguageStore
