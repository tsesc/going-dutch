import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'zh-TW' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
}

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  if (browserLang.startsWith('zh')) {
    return 'zh-TW'
  }
  return 'en'
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: detectBrowserLanguage(),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'going-dutch-language',
    }
  )
)
