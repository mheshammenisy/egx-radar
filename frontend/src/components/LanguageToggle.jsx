import { useLanguage } from '../i18n/LanguageContext.jsx'

function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="language-toggle" aria-label="Language selector">
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={language === 'ar' ? 'active' : ''}
        onClick={() => setLanguage('ar')}
      >
        عربي
      </button>
    </div>
  )
}

export default LanguageToggle
