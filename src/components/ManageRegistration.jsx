import { useState, useEffect, useCallback } from 'react'
import { validateStep2, normalizePhone } from '../validation.js'
import PhoneInput from './PhoneInput.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

// ── Small reusable field ──────────────────────────────────────────────────────

function Field({ label, name, type = 'text', value, error, onChange, autoComplete, placeholder, maxDate }) {
  return (
    <div className="field">
      <label htmlFor={`manage-${name}`}>{label}</label>
      <input
        id={`manage-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        max={maxDate}
        className={error ? 'error' : ''}
        aria-describedby={error ? `manage-${name}-err` : undefined}
        aria-invalid={!!error}
      />
      {error && <div id={`manage-${name}-err`} className="field-error" role="alert">⚠ {error}</div>}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ height: 28, width: '55%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 28 }} />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton" style={{ height: 20, width: `${60 + i * 7}%`, marginBottom: 10 }} />
      ))}
    </div>
  )
}

// ── Max birth-date = yesterday ────────────────────────────────────────────────

const maxBirthDate = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

// ── Main component ───────────────────────────────────────────────────────────

export default function ManageRegistration({ registrationId, form, t, mode = 'view', onEdit, onBackToView, onDeleted, onBack, showSnackbar }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [reg, setReg]             = useState(null)
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [editValues, setEditValues] = useState(null)
  const [editErrors, setEditErrors] = useState({})
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState(null)

  const [deleting, setDeleting]       = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  // ── Fetch registration ────────────────────────────────────────────────────

  const fetchReg = useCallback(() => {
    setLoading(true)
    setLoadError(null)

    fetch(`${API_BASE}/api/registrations/${registrationId}`)
      .then(r => {
        if (r.status === 404 || r.status === 400) throw new Error('not_found')
        if (!r.ok) throw new Error(`http_${r.status}`)
        return r.json()
      })
      .then(data => {
        setReg(data)
        setEditValues({
          memberTypeId: data.memberTypeId,
          firstName:    data.firstName,
          lastName:     data.lastName,
          email:        data.email,
          phone:        data.phone,
          birthDate:    data.birthDate,
          website:      '',
        })
      })
      .catch(err => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [registrationId])

  useEffect(() => { fetchReg() }, [fetchReg])

  // ── Edit handlers ────────────────────────────────────────────────────────

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target
    setEditValues(v => ({ ...v, [name]: value }))
    setEditErrors(errs => ({ ...errs, [name]: undefined }))
  }, [])

  const handleMemberTypeChange = useCallback((id) => {
    setEditValues(v => ({ ...v, memberTypeId: id }))
    setEditErrors(errs => ({ ...errs, memberTypeId: undefined }))
  }, [])

  const handleSave = useCallback(async () => {
    const errs = validateStep2(editValues, t)
    if (!editValues.memberTypeId) errs.memberTypeId = 'Member type is required'
    if (Object.keys(errs).length) { setEditErrors(errs); return }

    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`${API_BASE}/api/registrations/${registrationId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          memberTypeId: editValues.memberTypeId,
          firstName:    editValues.firstName.trim(),
          lastName:     editValues.lastName.trim(),
          email:        editValues.email.trim().toLowerCase(),
          phone:        normalizePhone(editValues.phone),
          birthDate:    editValues.birthDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errMsg = data?.error || t.errorOccurred
        setSaveError(errMsg)
        if (data?.fields) setEditErrors(data.fields)
        showSnackbar?.(errMsg, 'error')
        return
      }
      setReg(data)
      showSnackbar?.(t.changesSaved, 'success')
      onBackToView?.()
    } catch {
      setSaveError(t.networkError)
      showSnackbar?.(t.networkError, 'error')
    } finally {
      setSaving(false)
    }
  }, [registrationId, editValues, t, showSnackbar, onBackToView])

  const handleDelete = useCallback(async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`${API_BASE}/api/registrations/${registrationId}`, {
        method: 'DELETE',
      })
      if (!res.ok && res.status !== 404) {
        const data = await res.json().catch(() => ({}))
        setDeleteError(data?.error || t.errorOccurred)
        return
      }
      onDeleted(t.registrationDeleted)
    } catch {
      setDeleteError(t.networkError)
    } finally {
      setDeleting(false)
    }
  }, [registrationId, t, onDeleted])

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />

  // ── Error ────────────────────────────────────────────────────────────────

  if (loadError) {
    const isNotFound = loadError === 'not_found'
    const isNetwork  = loadError === 'network_error' || loadError.startsWith('http_')

    return (
      <div>
        <div className="banner banner--error" role="alert">
          <span className="banner__icon">{isNotFound ? '🔍' : '⚠️'}</span>
          <div>
            <div className="banner__title">
              {isNotFound ? t.notFound : t.failedToLoad}
            </div>
            <div className="banner__body">
              {isNotFound
                ? 'This registration link may be invalid or the registration may have been deleted.'
                : `Could not reach the server (${loadError}). Check your connection and try again.`}
            </div>
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onBack}>
            {t.goHome ?? '← Back'}
          </button>
          {!isNotFound && (
            <button className="btn btn-primary" onClick={fetchReg}>
              {t.retry ?? 'Try again'}
            </button>
          )}
        </div>
      </div>
    )
  }

  const memberTypeName = form?.memberTypes?.find(m => m.id === reg?.memberTypeId)?.name
                      || reg?.memberTypeName

  // ── View mode ────────────────────────────────────────────────────────────

  // ── Delete confirmation modal ────────────────────────────────────────────

  const deleteModal = showDeleteDialog && (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="modal">
        <div className="modal__icon">🗑️</div>
        <h3 id="delete-dialog-title" className="modal__title">{t.confirmDeleteTitle}</h3>
        <p className="modal__body">{t.confirmDeleteBody}</p>

        {deleteError && (
          <div className="banner banner--error" role="alert" style={{ marginBottom: 12 }}>
            <span className="banner__icon">⚠️</span>
            <div><div className="banner__body">{deleteError}</div></div>
          </div>
        )}

        <div className="btn-row" style={{ marginTop: 20 }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => { setDeleteError(null); setShowDeleteDialog(false) }}
            disabled={deleting}
          >
            {t.cancelBtn}
          </button>
          <button
            className="btn btn-primary btn--danger"
            style={{ flex: 1 }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <><span className="spinner" /> {t.deleting}</> : t.confirmDeleteBtn}
          </button>
        </div>
      </div>
    </div>
  )

  if (mode === 'view') {
    return (
      <div>
        <h2 className="form-title">{t.manageTitle}</h2>
        <p className="form-description">{t.manageDesc}</p>

        <div className="preview-section">
          <div className="preview-section__title">{t.membership}</div>
          <div className="preview-row">
            <span className="preview-row__label">{t.memberType}</span>
            <span className="preview-row__value">{memberTypeName}</span>
          </div>
        </div>

        <div className="preview-section">
          <div className="preview-section__title">{t.personalInfoLabel}</div>
          <div className="preview-row">
            <span className="preview-row__label">{t.firstName}</span>
            <span className="preview-row__value">{reg.firstName}</span>
          </div>
          <div className="preview-row">
            <span className="preview-row__label">{t.lastName}</span>
            <span className="preview-row__value">{reg.lastName}</span>
          </div>
          <div className="preview-row">
            <span className="preview-row__label">{t.email}</span>
            <span className="preview-row__value">{reg.email}</span>
          </div>
          <div className="preview-row">
            <span className="preview-row__label">{t.phone}</span>
            <span className="preview-row__value">{reg.phone}</span>
          </div>
          <div className="preview-row">
            <span className="preview-row__label">{t.dateOfBirth}</span>
            <span className="preview-row__value">{reg.birthDate}</span>
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ flex: 1 }}>
            {t.goHome ?? t.registerAnother}
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onEdit}>
            {t.editRegistration}
          </button>
        </div>
      </div>
    )
  }

  // ── Edit mode ────────────────────────────────────────────────────────────

  if (mode === 'edit') {
    return (
      <div>
        <h2 className="form-title">{t.editTitle ?? t.editRegistration}</h2>

        <div style={{ marginBottom: 20 }}>
          <p className="form-description" style={{ marginBottom: 8 }}>{t.editMemberTypeDesc ?? t.chooseMembershipDesc}</p>
          <div className="member-types" role="radiogroup" aria-label={t.memberType}>
            {(form?.memberTypes?.length
              ? form.memberTypes
              : [{ id: reg.memberTypeId, name: reg.memberTypeName ?? memberTypeName }]
            ).map(mt => (
              <label
                key={mt.id}
                className={`member-type-card${editValues.memberTypeId === mt.id ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="memberTypeId"
                  value={mt.id}
                  checked={editValues.memberTypeId === mt.id}
                  onChange={() => handleMemberTypeChange(mt.id)}
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
          {editErrors.memberTypeId && (
            <div className="field-error" role="alert">⚠ {editErrors.memberTypeId}</div>
          )}
        </div>

        <div className="field-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <Field
            label={t.firstName} name="firstName" value={editValues.firstName}
            error={editErrors.firstName} onChange={handleEditChange}
            autoComplete="given-name" placeholder="Jane"
          />
          <Field
            label={t.lastName} name="lastName" value={editValues.lastName}
            error={editErrors.lastName} onChange={handleEditChange}
            autoComplete="family-name" placeholder="Doe"
          />
        </div>

        <Field
          label={t.email} name="email" type="email" value={editValues.email}
          error={editErrors.email} onChange={handleEditChange}
          autoComplete="email" placeholder="jane@example.com"
        />
        <PhoneInput
          label={t.phone}
          value={editValues.phone}
          error={editErrors.phone}
          onChange={handleEditChange}
          t={t}
        />
        <Field
          label={t.dateOfBirth} name="birthDate" type="date" value={editValues.birthDate}
          error={editErrors.birthDate} onChange={handleEditChange}
          autoComplete="bday" maxDate={maxBirthDate}
        />

        {saveError && (
          <div className="banner banner--error" role="alert" style={{ marginBottom: 0 }}>
            <span className="banner__icon">⚠️</span>
            <div>
              <div className="banner__title">{t.submissionFailed}</div>
              <div className="banner__body">{saveError}</div>
            </div>
          </div>
        )}

        <div className="btn-row" style={{ marginTop: 16 }}>
          <button
            className="btn btn-secondary btn--danger"
            onClick={() => { setDeleteError(null); setShowDeleteDialog(true) }}
            disabled={saving}
          >
            {t.deleteRegistration}
          </button>
        </div>

        <div className="btn-row" style={{ marginTop: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => { setSaveError(null); onBackToView?.() }}
            disabled={saving}
          >
            {t.back}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> {t.saving}</> : t.saveChanges}
          </button>
        </div>

        {deleteModal}
      </div>
    )
  }

  return null
}
