import { useLanguage } from '../i18n/LanguageContext.jsx'

function DemoBanner({ isDemo = true }) {
  const { t } = useLanguage()

  return (
    <div className="demo-banner" role="status">
      <strong>{isDemo ? t('banner.prototype') : t('banner.development')}</strong>
      <span>{isDemo ? t('banner.demoText') : t('banner.yahooText')}</span>
    </div>
  )
}

export default DemoBanner
