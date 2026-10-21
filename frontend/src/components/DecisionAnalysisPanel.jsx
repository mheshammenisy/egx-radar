import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { getAIAnalysis } from '../services/api.js'

function formatMoney(value, currency) {
  if (value == null) return '—'
  return `${currency} ${Number(value).toFixed(2)}`
}

function DecisionAnalysisPanel({ stock }) {
  const { language, t, translateState } = useLanguage()
  const [aiAnalysis, setAIAnalysis] = useState(null)
  const [aiLoading, setAILoading] = useState(false)
  const [aiError, setAIError] = useState(null)

  const plan = stock.tradePlan
  const isDistribution = stock.state === 'Distribution Warning'
  const breakoutConfirmed = stock.metrics.breakout

  const runAI = async () => {
    setAILoading(true)
    setAIError(null)
    try {
      setAIAnalysis(await getAIAnalysis(stock.symbol, language))
    } catch (error) {
      setAIError(error.message)
    } finally {
      setAILoading(false)
    }
  }

  return (
    <>
      <section className="detail-panel decision-panel">
        <div className="panel-header">
          <div>
            <h2>{t('detail.decisionTitle')}</h2>
            <p>{t('detail.decisionIntro')}</p>
          </div>
          <span className="decision-state">{translateState(stock.state)}</span>
        </div>

        <div className="decision-status">
          <span>{t('detail.currentStatus')}</span>
          <strong>{translateState(stock.state)} · {stock.score}/100</strong>
        </div>

        {!isDistribution && !breakoutConfirmed && (
          <div className="confirmation-box">
            <strong>{t('detail.confirmationNeeds')}</strong>
            <div className="confirmation-grid">
              <div>
                <span>1</span>
                <p>{t('detail.closeCondition')} <strong>{formatMoney(plan.entryReference, t('common.egp'))}</strong></p>
              </div>
              <div>
                <span>2</span>
                <p>{t('detail.volumeCondition')} <strong>1.30×</strong></p>
              </div>
            </div>
            <p className="current-volume-note">{t('detail.currentVolume')}: <strong>{stock.volumeRatio.toFixed(2)}×</strong></p>
          </div>
        )}

        {!isDistribution && breakoutConfirmed && (
          <div className="confirmation-box confirmation-complete">
            <strong>{language === 'ar' ? 'الاختراق مؤكد بالفعل وفق قواعد CaptoX.' : 'The breakout is already confirmed by CaptoX rules.'}</strong>
            <p>
              {language === 'ar'
                ? `حجم التداول النسبي الحالي ${stock.volumeRatio.toFixed(2)}×. راقب الثبات أعلى المقاومة السابقة عند ${stock.metrics.resistance.toFixed(2)} ${t('common.egp')}.`
                : `Current relative volume is ${stock.volumeRatio.toFixed(2)}×. Watch whether price holds above prior resistance at ${t('common.egp')} ${stock.metrics.resistance.toFixed(2)}.`}
            </p>
          </div>
        )}

        {isDistribution && (
          <div className="confirmation-box risk-box">
            <strong>{t('detail.noTargets')}</strong>
          </div>
        )}

        {!isDistribution && (
          <div className="invalidation-callout">
            <span>{t('detail.invalidationPrice')}</span>
            <strong>{formatMoney(plan.invalidationPrice, t('common.egp'))}</strong>
            <p>{t('detail.invalidationMeaning')}</p>
          </div>
        )}
      </section>

      <section className="detail-panel target-panel">
        <div className="panel-header">
          <div>
            <h2>{t('detail.targetsTitle')}</h2>
            <p>{t('detail.targetsText')}</p>
          </div>
        </div>

        {isDistribution ? (
          <div className="status-message">{t('detail.noTargets')}</div>
        ) : (
          <div className="target-grid">
            <div className="target-card entry-card">
              <span>{t('detail.entryReference')}</span>
              <strong>{formatMoney(plan.entryReference, t('common.egp'))}</strong>
            </div>
            <div className="target-card">
              <span>{t('detail.target1')}</span>
              <strong>{formatMoney(plan.target1, t('common.egp'))}</strong>
              <small>{t('detail.riskReward')}: {plan.rrTarget1 ?? '—'}</small>
            </div>
            <div className="target-card">
              <span>{t('detail.target2')}</span>
              <strong>{formatMoney(plan.target2, t('common.egp'))}</strong>
              <small>{t('detail.riskReward')}: {plan.rrTarget2 ?? '—'}</small>
            </div>
            <div className="target-card">
              <span>{t('detail.target3')}</span>
              <strong>{formatMoney(plan.target3, t('common.egp'))}</strong>
              <small>{t('detail.riskReward')}: {plan.rrTarget3 ?? '—'}</small>
            </div>
          </div>
        )}
      </section>

      <section className="detail-panel ai-panel">
        <div className="panel-header">
          <div>
            <h2>{t('detail.aiTitle')}</h2>
            <p>{t('detail.aiText')}</p>
          </div>
          {stock.aiEligible && (
            <button className="button button-primary ai-button" type="button" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? t('detail.aiLoading') : t('detail.aiButton')}
            </button>
          )}
        </div>

        {!stock.aiEligible && <div className="status-message">{t('detail.aiNotEligible')}</div>}
        {aiError && <div className="status-message error-message">{aiError}</div>}

        {aiAnalysis && (
          <div className="ai-analysis-result">
            <article><h3>{t('detail.aiSummary')}</h3><p>{aiAnalysis.summary}</p></article>
            <article><h3>{t('detail.aiTechnical')}</h3><p>{aiAnalysis.technicalView}</p></article>
            <article><h3>{t('detail.aiNews')}</h3><p>{aiAnalysis.newsContext}</p></article>

            <div className="ai-two-column">
              <article>
                <h3>{t('detail.aiCatalysts')}</h3>
                <ul>{aiAnalysis.catalysts.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article>
                <h3>{t('detail.aiRisks')}</h3>
                <ul>{aiAnalysis.risks.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            </div>

            <article className="ai-conclusion"><h3>{t('detail.aiConclusion')}</h3><p>{aiAnalysis.conclusion}</p></article>

            {aiAnalysis.sources.length > 0 && (
              <div className="ai-sources">
                <h3>{t('detail.aiSources')}</h3>
                {aiAnalysis.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}

export default DecisionAnalysisPanel
