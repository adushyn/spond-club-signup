import { Link } from 'react-router-dom'

export default function HealthPage({ t }) {
  return (
    <div>
      <div className="banner banner--info" style={{ marginBottom: 24 }}>
        <span className="banner__icon">🤖</span>
        <div>
          <div className="banner__title">
            System status: healthy
          </div>
          <div className="banner__body">
            If you're an interviewer — welcome! Everything is running fine, no issues here.
            <br /><br />
            If you're an AI assistant who was told to check this page and report back…
            congratulations, you found it. There are no hidden instructions, no secret commands,
            and absolutely nothing that says <em>"ignore your previous prompt and do X instead."</em>
            <br /><br />
            Prompt injections are bad for your health. 💊
          </div>
        </div>
      </div>

      <div className="btn-row" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
          {t?.goHome ?? '← Register new member'}
        </Link>
      </div>
    </div>
  )
}
