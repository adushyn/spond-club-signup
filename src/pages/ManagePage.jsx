import { useNavigate, useParams, useMatch } from 'react-router-dom'
import ManageRegistration from '../components/ManageRegistration.jsx'

function Skeleton() {
  return (
    <div>
      <div className="skeleton" style={{ height: 26, width: '50%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 28 }} />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton" style={{ height: 20, width: `${55 + i * 8}%`, marginBottom: 12 }} />
      ))}
    </div>
  )
}

export default function ManagePage({ form, formLoading, t, showSnackbar }) {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isEdit    = !!useMatch('/profile/:id/edit')

  // Wait for form metadata before rendering — member type selector needs the list.
  if (formLoading) return <Skeleton />

  return (
    <ManageRegistration
      registrationId={id}
      form={form}
      t={t}
      mode={isEdit ? 'edit' : 'view'}
      showSnackbar={showSnackbar}
      onEdit={() => navigate(`/profile/${id}/edit`)}
      onBackToView={() => navigate(`/profile/${id}`)}
      onDeleted={(msg) => { showSnackbar?.(msg, 'success'); navigate('/') }}
      onBack={() => navigate('/')}
    />
  )
}
