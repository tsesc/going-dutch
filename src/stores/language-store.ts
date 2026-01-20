import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'zh-TW' | 'en' | 'ja' | 'ko' | 'es'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
}

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'
  if (browserLang.startsWith('zh')) {
    return 'zh-TW'
  }
  if (browserLang.startsWith('ja')) {
    return 'ja'
  }
  if (browserLang.startsWith('ko')) {
    return 'ko'
  }
  if (browserLang.startsWith('es')) {
    return 'es'
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
