import { useLanguageStore } from '@/stores/language-store'
import { t, type TranslationKey } from '@/i18n/translations'

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore()

  const translate = (key: TranslationKey, params?: Record<string, string>) => {
    return t(language, key, params)
  }

  return {
    t: translate,
    language,
    setLanguage,
  }
}
