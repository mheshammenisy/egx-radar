import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function ThemeToggle() {
  const { isArabic } = useLanguage()
  const [theme, setTheme] = useState(() => localStorage.getItem('captox-theme') || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('captox-theme', theme)
  }, [theme])

  return (
    <div className="theme-toggle" aria-label={isArabic ? 'اختيار المظهر' : 'Theme selector'}>
      <button
        type="button"
        className={theme === 'light' ? 'active' : ''}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        title={isArabic ? 'الوضع الفاتح' : 'Light mode'}
      >
        <span aria-hidden="true">☀</span>
        <span>{isArabic ? 'فاتح' : 'Light'}</span>
      </button>
      <button
        type="button"
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        title={isArabic ? 'الوضع الداكن' : 'Dark mode'}
      >
        <span aria-hidden="true">☾</span>
        <span>{isArabic ? 'داكن' : 'Dark'}</span>
      </button>
    </div>
  )
}

export default ThemeToggle
