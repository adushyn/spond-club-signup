export default function Step1MemberType({ form, values, error, onChange, onNext, t }) {
  return (
    <div>
      <h1 className="form-title">{form.title}</h1>
      <p className="form-description">{t.chooseMembershipDesc}</p>

      <div className="member-types" role="radiogroup" aria-label={t.stepMemberType}>
        {form.memberTypes.map(mt => (
          <label
            key={mt.id}
            className={`member-type-card${values.memberTypeId === mt.id ? ' selected' : ''}`}
          >
            <input
              type="radio"
              name="memberTypeId"
              value={mt.id}
              checked={values.memberTypeId === mt.id}
              onChange={() => onChange('memberTypeId', mt.id)}
            />
            <span className="member-type-card__body">
              <span className="member-type-card__name">{mt.name}</span>
              {mt.description && (
                <span className="member-type-card__desc">{mt.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>

      {error && <div className="field-error" role="alert">⚠ {error}</div>}

      <div className="btn-row">
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!values.memberTypeId}
        >
          {t.next}
        </button>
      </div>
    </div>
  )
}
