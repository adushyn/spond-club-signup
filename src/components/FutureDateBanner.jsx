export default function FutureDateBanner({ registrationOpens, title, t }) {
  const date = new Date(registrationOpens)
  const formatted = date.toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })

  return (
    <div className="banner banner--info">
      <span className="banner__icon">🕐</span>
      <div>
        <div className="banner__title">{t.registrationOpens}</div>
        <div className="banner__body">
          <strong>{title}</strong> — {t.registrationOpensDesc(formatted)}
        </div>
      </div>
    </div>
  )
}
