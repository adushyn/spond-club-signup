import PhoneInput from './PhoneInput.jsx'

function Field({ label, name, type = 'text', value, error, hint, onChange, onBlur, autoComplete, placeholder }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={error ? 'error' : ''}
        aria-describedby={error ? `${name}-err` : hint ? `${name}-hint` : undefined}
        aria-invalid={!!error}
      />
      {hint && !error && <div id={`${name}-hint`} className="field-hint">{hint}</div>}
      {error && <div id={`${name}-err`} className="field-error" role="alert">⚠ {error}</div>}
    </div>
  )
}

const maxBirthDate = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

export default function Step2PersonalInfo({ values, errors, onChange, onBlur, onNext, onBack, t }) {
  return (
    <div>
      <h2 className="form-title">{t.personalInfo}</h2>
      <p className="form-description">{t.personalInfoDesc}</p>

      <div className="field-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <Field
          label={t.firstName}
          name="firstName"
          value={values.firstName}
          error={errors.firstName}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="given-name"
          placeholder="Jane"
        />
        <Field
          label={t.lastName}
          name="lastName"
          value={values.lastName}
          error={errors.lastName}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="family-name"
          placeholder="Doe"
        />
      </div>

      <Field
        label={t.email}
        name="email"
        type="email"
        value={values.email}
        error={errors.email}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete="email"
        placeholder="jane@example.com"
      />

      <PhoneInput
        label={t.phone}
        value={values.phone}
        error={errors.phone}
        onChange={onChange}
        onBlur={onBlur}
        t={t}
      />

      <Field
        label={t.dateOfBirth}
        name="birthDate"
        type="date"
        value={values.birthDate}
        error={errors.birthDate}
        hint={t.dateOfBirthHint}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete="bday"
        max={maxBirthDate}
      />

      {/* Honeypot – hidden from real users, visible to bots */}
      <div className="hp-field" aria-hidden="true">
        <input
          tabIndex={-1}
          name="website"
          value={values.website}
          onChange={onChange}
          autoComplete="off"
        />
      </div>

      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>{t.back}</button>
        <button className="btn btn-primary"   onClick={onNext}>{t.next}</button>
      </div>
    </div>
  )
}
