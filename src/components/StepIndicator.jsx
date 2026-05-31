export default function StepIndicator({ current, t }) {
  const steps = [t.stepMemberType, t.stepYourInfo, t.stepReview]

  return (
    <div>
      <div className="step-indicator">
        {steps.map((label, i) => {
          const num    = i + 1
          const done   = num < current
          const active = num === current
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div className={`step-indicator__dot${active ? ' active' : done ? ' done' : ''}`}>
                {done ? '✓' : num}
              </div>
              {i < steps.length - 1 && (
                <div className={`step-indicator__line${done ? ' done' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        {steps.map((label, i) => (
          <div
            key={i}
            className="step-indicator__label"
            style={{
              flex: 1,
              color: i + 1 === current ? 'var(--color-primary)' : 'var(--color-muted)',
              fontWeight: i + 1 === current ? 600 : 400,
              textAlign: i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
