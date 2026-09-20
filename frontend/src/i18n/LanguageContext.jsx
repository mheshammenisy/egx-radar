import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const COPY = {
  en: {
    common: {
      openRadar: 'Open Radar',
      openMarketRadar: 'Open Market Radar',
      launchMarketRadar: 'Launch Market Radar',
      backToRadar: '← Back to Radar',
      loadingStock: 'Loading stock…',
      stockNotFound: 'Stock not found',
      loadingStocks: 'Loading stocks…',
      noStocks: 'No stocks in this index yet.',
      development: 'DEVELOPMENT',
      egp: 'EGP',
    },
    landing: {
      howItWorksNav: 'How it works',
      signalsNav: 'Signals',
      eyebrow: 'EGX MARKET INTELLIGENCE',
      heroLine1: 'Catch the market',
      heroLine2: 'before the crowd.',
      heroDescription: 'CaptoX scans Egyptian equities, ranks developing setups, and explains why a stock deserves attention — so you can focus on the few names that matter instead of checking the whole market manually.',
      seeHow: 'See how it works',
      trust1: 'Rule-based analysis',
      trust2: 'Explainable signals',
      trust3: 'Built for EGX',
      radarPreview: 'MARKET RADAR',
      opportunitySignals: 'Opportunity signals',
      symbol: 'SYMBOL',
      state: 'STATE',
      score: 'SCORE',
      strip1Title: 'Scan the market.',
      strip1Text: 'Filter the noise.',
      strip2Title: 'Understand the setup.',
      strip2Text: 'Know why it matters now.',
      strip3Title: 'See the risk.',
      strip3Text: 'Triggers, invalidation and chase risk.',
      howEyebrow: 'HOW CAPTOX WORKS',
      howTitle: 'From market noise to a focused watchlist.',
      howText: 'CaptoX uses daily price and volume behavior to classify each stock into an understandable market state and rank the setups that deserve a closer look.',
      scanTitle: 'Scan',
      scanText: 'Review the market automatically using trend, relative volume, support, resistance, closing strength and breakout behavior.',
      rankTitle: 'Rank',
      rankText: 'Surface the strongest setups first with a transparent Opportunity Score instead of an alphabetic list of stocks.',
      explainTitle: 'Explain',
      explainText: 'See why the state was assigned, the relevant technical levels, volume context, trigger conditions and invalidation.',
      statesEyebrow: 'OPPORTUNITY STATES',
      statesTitle: 'Know what stage a stock is in.',
      statesText: 'CaptoX is designed to distinguish developing opportunities from moves that may already be extended.',
      early: 'EARLY',
      earlyTitle: 'Accumulation & preparation',
      earlyText: 'Look for improving structure, rising participation and proximity to important levels before a move becomes obvious.',
      confirmation: 'CONFIRMATION',
      confirmationTitle: 'Breakout & pullback',
      confirmationText: 'Track confirmed breakouts and constructive pullbacks while keeping large one-day moves in context through chase-risk logic.',
      risk: 'RISK',
      riskTitle: 'Distribution warning',
      riskText: 'Flag elevated selling pressure so a high-volume move is not automatically mistaken for a bullish opportunity.',
      beta: 'CAPTOX BETA',
      ctaTitle: 'Stop checking dozens of stocks one by one.',
      ctaText: 'Open the radar and start with the setups that deserve attention first.',
      footerTitle: 'Market intelligence for Egyptian equities.',
      footerText: 'CaptoX is an analytical research tool. Signals and scores are rule-based observations, not investment recommendations, guarantees or price forecasts.',
      footerStatus: 'BETA · DEVELOPMENT DATA',
    },
    radar: {
      eyebrow: 'MARKET INTELLIGENCE',
      subtitle: 'Catch the EGX setups that deserve attention.',
      opportunitySignals: 'Opportunity signals',
      prototypeUniverse: 'prototype universe · ranked by opportunity score',
      yahooStatus: 'YAHOO DATA · DEVELOPMENT',
      demoStatus: 'DEMO DATA · NOT LIVE',
      symbol: 'SYMBOL',
      state: 'STATE',
      opportunityScore: 'OPPORTUNITY SCORE',
      volumeRatio: 'VOLUME RATIO',
      price: 'PRICE',
      change: 'CHANGE',
    },
    detail: {
      opportunityDetail: 'OPPORTUNITY DETAIL',
      state: 'STATE',
      opportunityScore: 'OPPORTUNITY SCORE',
      relativeVolume: 'RELATIVE VOLUME',
      trend: 'TREND',
      whyState: 'Why this state?',
      sourceDemo: 'Calculated by deterministic prototype rules from demo daily OHLCV.',
      sourceYahoo: 'Calculated by deterministic prototype rules from stored Yahoo Finance daily OHLCV.',
      demoEngine: 'DEMO ENGINE · NOT LIVE',
      yahooData: 'YAHOO DATA · DEVELOPMENT',
      recentSupport: 'RECENT SUPPORT',
      recentResistance: 'RECENT RESISTANCE',
      distanceResistance: 'DISTANCE TO RESISTANCE',
      closingStrength: 'CLOSING STRENGTH',
      triggerInvalidation: 'Trigger & invalidation',
      ruleDisclaimer: 'Rule-based conditions, not a recommendation or price forecast.',
      trigger: 'Trigger:',
      invalidation: 'Invalidation:',
      pricePerformance: 'Price performance',
      chartDemoText: 'Historical charting will be connected when real market data is added.',
      chartRealText: 'Latest 60 stored daily sessions. Line = closing price; bars = daily volume.',
      noRealHistory: 'NO REAL HISTORY YET',
      realHistory: 'REAL DAILY HISTORY',
      chartPlaceholder: 'Real price and volume history will appear here once a reliable market-data source is connected.',
    },
    banner: {
      prototype: 'Prototype mode',
      development: 'Development data',
      demoText: 'Current prices, scores, volume ratios, and index membership are demo data — not live market data.',
      yahooText: 'Market data is currently sourced from Yahoo Finance for development/testing and may be delayed or incomplete.',
    },
    chart: {
      sessions: 'sessions',
      latestClose: 'Latest close',
      volume: 'VOLUME',
      insufficient: 'Not enough historical data to draw the chart.',
    },
  },
  ar: {
    common: {
      openRadar: 'فتح الرادار',
      openMarketRadar: 'فتح رادار السوق',
      launchMarketRadar: 'تشغيل رادار السوق',
      backToRadar: 'العودة إلى الرادار ←',
      loadingStock: 'جارٍ تحميل السهم…',
      stockNotFound: 'السهم غير موجود',
      loadingStocks: 'جارٍ تحميل الأسهم…',
      noStocks: 'لا توجد أسهم متاحة في هذا المؤشر حالياً.',
      development: 'نسخة تطويرية',
      egp: 'ج.م',
    },
    landing: {
      howItWorksNav: 'كيف يعمل',
      signalsNav: 'الإشارات',
      eyebrow: 'ذكاء السوق المصري',
      heroLine1: 'التقط حركة السوق',
      heroLine2: 'قبل أن يلتفت إليها الجميع.',
      heroDescription: 'يمسح CaptoX أسهم البورصة المصرية، ويرتب الفرص الناشئة، ويشرح لماذا يستحق سهمٌ ما المتابعة الآن — حتى تركز على الأسهم المهمة بدلاً من فحص السوق بالكامل يدوياً.',
      seeHow: 'اعرف كيف يعمل',
      trust1: 'تحليل قائم على قواعد واضحة',
      trust2: 'إشارات قابلة للتفسير',
      trust3: 'مصمم للبورصة المصرية',
      radarPreview: 'رادار السوق',
      opportunitySignals: 'إشارات الفرص',
      symbol: 'السهم',
      state: 'الحالة',
      score: 'الدرجة',
      strip1Title: 'امسح السوق.',
      strip1Text: 'تجاهل الضوضاء.',
      strip2Title: 'افهم الإعداد.',
      strip2Text: 'اعرف لماذا السهم مهم الآن.',
      strip3Title: 'شاهد المخاطر.',
      strip3Text: 'نقاط التفعيل والإلغاء ومخاطر ملاحقة الحركة.',
      howEyebrow: 'كيف يعمل CAPTOX',
      howTitle: 'من ضوضاء السوق إلى قائمة متابعة مركزة.',
      howText: 'يستخدم CaptoX سلوك السعر وحجم التداول اليومي لتصنيف كل سهم في مرحلة سوق واضحة وترتيب الإعدادات التي تستحق نظرة أقرب.',
      scanTitle: 'المسح',
      scanText: 'فحص السوق تلقائياً باستخدام الاتجاه، وحجم التداول النسبي، والدعم والمقاومة، وقوة الإغلاق، وسلوك الاختراق.',
      rankTitle: 'الترتيب',
      rankText: 'إظهار أقوى الإعدادات أولاً من خلال Opportunity Score واضح بدلاً من قائمة أبجدية للأسهم.',
      explainTitle: 'التفسير',
      explainText: 'معرفة سبب الحالة، والمستويات الفنية المهمة، وسياق حجم التداول، وشروط التفعيل والإلغاء.',
      statesEyebrow: 'مراحل الفرصة',
      statesTitle: 'اعرف المرحلة التي يمر بها السهم.',
      statesText: 'صُمم CaptoX للتمييز بين الفرص التي ما زالت تتطور والحركات التي ربما أصبحت ممتدة بالفعل.',
      early: 'مبكر',
      earlyTitle: 'التجميع والاستعداد',
      earlyText: 'ابحث عن تحسن الهيكل وزيادة المشاركة والاقتراب من مستويات مهمة قبل أن تصبح الحركة واضحة للجميع.',
      confirmation: 'تأكيد',
      confirmationTitle: 'الاختراق والتصحيح',
      confirmationText: 'تابع الاختراقات المؤكدة والتصحيحات الصحية مع وضع القفزات اليومية الكبيرة في سياقها من خلال منطق مخاطر الملاحقة.',
      risk: 'مخاطر',
      riskTitle: 'تحذير من التصريف',
      riskText: 'تنبيه عند ارتفاع ضغط البيع حتى لا يُفهم أي ارتفاع في حجم التداول تلقائياً كفرصة صعود.',
      beta: 'نسخة CAPTOX التجريبية',
      ctaTitle: 'لا تراجع عشرات الأسهم واحداً تلو الآخر.',
      ctaText: 'افتح الرادار وابدأ بالإعدادات التي تستحق انتباهك أولاً.',
      footerTitle: 'ذكاء سوقي للأسهم المصرية.',
      footerText: 'CaptoX أداة تحليل وبحث. الإشارات والدرجات ملاحظات مبنية على قواعد وليست توصيات استثمارية أو ضمانات أو توقعات للأسعار.',
      footerStatus: 'تجريبي · بيانات تطويرية',
    },
    radar: {
      eyebrow: 'ذكاء السوق',
      subtitle: 'التقط إعدادات البورصة المصرية التي تستحق المتابعة.',
      opportunitySignals: 'إشارات الفرص',
      prototypeUniverse: 'نطاق تجريبي · مرتب حسب Opportunity Score',
      yahooStatus: 'بيانات YAHOO · تطويرية',
      demoStatus: 'بيانات تجريبية · ليست مباشرة',
      symbol: 'السهم',
      state: 'الحالة',
      opportunityScore: 'درجة الفرصة',
      volumeRatio: 'حجم التداول النسبي',
      price: 'السعر',
      change: 'التغير',
    },
    detail: {
      opportunityDetail: 'تفاصيل الفرصة',
      state: 'الحالة',
      opportunityScore: 'درجة الفرصة',
      relativeVolume: 'حجم التداول النسبي',
      trend: 'الاتجاه',
      whyState: 'لماذا هذه الحالة؟',
      sourceDemo: 'محسوبة بقواعد النموذج التجريبي من بيانات OHLCV يومية تجريبية.',
      sourceYahoo: 'محسوبة بقواعد ثابتة من بيانات Yahoo Finance اليومية المخزنة.',
      demoEngine: 'محرك تجريبي · ليس مباشراً',
      yahooData: 'بيانات YAHOO · تطويرية',
      recentSupport: 'الدعم الأخير',
      recentResistance: 'المقاومة الأخيرة',
      distanceResistance: 'المسافة إلى المقاومة',
      closingStrength: 'قوة الإغلاق',
      triggerInvalidation: 'التفعيل والإلغاء',
      ruleDisclaimer: 'شروط مبنية على قواعد وليست توصية أو توقعاً للسعر.',
      trigger: 'التفعيل:',
      invalidation: 'الإلغاء:',
      pricePerformance: 'أداء السعر',
      chartDemoText: 'سيتم توصيل الرسم التاريخي عند إضافة بيانات سوق حقيقية.',
      chartRealText: 'آخر 60 جلسة يومية مخزنة. الخط = سعر الإغلاق؛ الأعمدة = حجم التداول اليومي.',
      noRealHistory: 'لا يوجد تاريخ حقيقي بعد',
      realHistory: 'تاريخ يومي حقيقي',
      chartPlaceholder: 'سيظهر تاريخ السعر وحجم التداول هنا عند توصيل مصدر بيانات سوق موثوق.',
    },
    banner: {
      prototype: 'وضع تجريبي',
      development: 'بيانات تطويرية',
      demoText: 'الأسعار والدرجات وأحجام التداول النسبية وعضوية المؤشرات حالياً بيانات تجريبية وليست بيانات سوق مباشرة.',
      yahooText: 'بيانات السوق حالياً من Yahoo Finance لأغراض التطوير والاختبار وقد تكون متأخرة أو غير مكتملة.',
    },
    chart: {
      sessions: 'جلسة',
      latestClose: 'آخر إغلاق',
      volume: 'حجم التداول',
      insufficient: 'لا توجد بيانات تاريخية كافية لرسم المخطط.',
    },
  },
}

const STATE_AR = {
  Accumulating: 'تجميع',
  'Breakout Preparation': 'استعداد للاختراق',
  'Fresh Breakout': 'اختراق جديد',
  'Healthy Pullback': 'تصحيح صحي',
  'Distribution Warning': 'تحذير من التصريف',
  Neutral: 'محايد',
}

const TREND_AR = {
  Uptrend: 'اتجاه صاعد',
  Downtrend: 'اتجاه هابط',
  Sideways: 'اتجاه عرضي',
}

function getByPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object)
}

function translateReasonArabic(reason) {
  if (reason === 'Price is above both the 5-day and 20-day average') return 'السعر أعلى من متوسطَي 5 أيام و20 يوماً'
  if (reason === 'Price is below both the 5-day and 20-day average') return 'السعر أقل من متوسطَي 5 أيام و20 يوماً'
  if (reason === 'Trend is currently mixed or sideways') return 'الاتجاه الحالي مختلط أو عرضي'
  if (reason === 'Recent lows are rising') return 'القيعان الأخيرة تتحسن تدريجياً'
  if (reason === 'Close confirmed above recent resistance on elevated volume') return 'الإغلاق أكد الاختراق أعلى المقاومة الأخيرة مع ارتفاع حجم التداول'
  if (reason === 'Price is testing the recent resistance area') return 'السعر يختبر منطقة المقاومة الأخيرة'
  if (reason === 'Price pulled back while remaining above the 20-day average') return 'السعر صحح مع بقائه أعلى متوسط 20 يوماً'
  if (reason === 'Selling pressure is elevated relative to recent volume') return 'ضغط البيع مرتفع مقارنة بحجم التداول الأخير'

  let match = reason.match(/^Volume is ([\d.]+)× its 20-session average$/)
  if (match) return `حجم التداول يساوي ${match[1]}× متوسط آخر 20 جلسة`

  match = reason.match(/^Strong breakout, but the stock is already up ([\d.]+)% today — elevated chase risk$/)
  if (match) return `اختراق قوي، لكن السهم مرتفع بالفعل ${match[1]}% اليوم — مخاطر ملاحقة الحركة مرتفعة`

  return reason
}

function translateTriggerArabic(text) {
  if (text === 'Breakout already confirmed; watch whether price holds above prior resistance') {
    return 'تم تأكيد الاختراق؛ راقب قدرة السعر على الثبات أعلى المقاومة السابقة'
  }

  let match = text.match(/^Daily close above EGP ([\d.]+) with relative volume of at least 1\.30×$/)
  if (match) return `إغلاق يومي أعلى من ${match[1]} ج.م مع حجم تداول نسبي لا يقل عن 1.30×`

  match = text.match(/^Distribution warning is active: volume is ([\d.]+)× its 20-session average with weak price action$/)
  if (match) return `تحذير التصريف نشط: حجم التداول ${match[1]}× متوسط 20 جلسة مع ضعف حركة السعر`

  match = text.match(/^Breakout confirmed, but chase risk is elevated after a ([\d.]+)% daily move; watch for consolidation or a hold above prior resistance$/)
  if (match) return `تم تأكيد الاختراق، لكن مخاطر ملاحقة الحركة مرتفعة بعد صعود يومي ${match[1]}%؛ راقب التماسك أو الثبات أعلى المقاومة السابقة`

  return text
}

function translateInvalidationArabic(text) {
  if (text === 'Warning eases if selling pressure subsides and price recovers its short-term trend') {
    return 'يضعف التحذير إذا انخفض ضغط البيع واستعاد السعر اتجاهه قصير الأجل'
  }

  const match = text.match(/^Daily close below recent support near EGP ([\d.]+)$/)
  if (match) return `إغلاق يومي أسفل الدعم الأخير قرب ${match[1]} ج.م`
  return text
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('captox-language') || 'en')

  useEffect(() => {
    localStorage.setItem('captox-language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const value = useMemo(() => {
    const t = (path) => getByPath(COPY[language], path) ?? getByPath(COPY.en, path) ?? path
    const translateState = (state) => language === 'ar' ? (STATE_AR[state] || state) : state
    const translateTrend = (trend) => language === 'ar' ? (TREND_AR[trend] || trend) : trend
    const translateReason = (reason) => language === 'ar' ? translateReasonArabic(reason) : reason
    const translateTrigger = (text) => language === 'ar' ? translateTriggerArabic(text) : text
    const translateInvalidation = (text) => language === 'ar' ? translateInvalidationArabic(text) : text

    return {
      language,
      isArabic: language === 'ar',
      setLanguage,
      t,
      translateState,
      translateTrend,
      translateReason,
      translateTrigger,
      translateInvalidation,
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
