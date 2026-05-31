import { useEffect } from 'react'

const AUTO_DISMISS_MS = 4000

/**
 * Bottom-centre toast notification.
 *
 * Props:
 *   message  {string|null}          – text to display; null = hidden
 *   type     {'success'|'error'}    – controls colour (default 'success')
 *   onClose  {() => void}           – called when dismissed (auto or by user)
 */
export default function Snackbar({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const id = setTimeout(onClose, AUTO_DISMISS_MS)
    return () => clearTimeout(id)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`snackbar snackbar--${type}`} role="status" aria-live="polite">
      <span className="snackbar__icon">{type === 'success' ? '✓' : '⚠'}</span>
      <span className="snackbar__text">{message}</span>
      <button
        className="snackbar__close"
        onClick={onClose}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
