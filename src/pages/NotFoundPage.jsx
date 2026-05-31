import { Link } from 'react-router-dom'

export default function NotFoundPage({ t }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <h2 className="form-title" style={{ marginBottom: 12 }}>
        {t?.pageNotFound ?? 'Page not found'}
      </h2>
      <p className="form-description" style={{ marginBottom: 28 }}>
        {t?.pageNotFoundDesc ?? "The page you're looking for doesn't exist."}
      </p>
      <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
        {t?.goHome ?? '← Register new member'}
      </Link>
    </div>
  )
}
