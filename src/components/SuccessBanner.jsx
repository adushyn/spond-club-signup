export default function SuccessBanner({ firstName, t, onRestart, onManage }) {
  return (
    <div>
      <div className="banner banner--success" role="alert">
        <span className="banner__icon">🎉</span>
        <div>
          <div className="banner__title">{t.successTitle(firstName)}</div>
          <div className="banner__body">{t.successBody}</div>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn btn-secondary" onClick={onRestart}>
          {t.registerAnother}
        </button>
        {onManage && (
          <button className="btn btn-primary" onClick={onManage}>
            {t.manageRegistration}
          </button>
        )}
      </div>
    </div>
  )
}
