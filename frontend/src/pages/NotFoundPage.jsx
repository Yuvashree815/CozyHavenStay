import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      textAlign: 'center', padding: '5rem 2rem',
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', marginTop: '2rem'
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏨</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button className="btn btn-primary px-4" onClick={() => navigate('/')}>
        ← Back to Home
      </button>
    </div>
  );
};

export default NotFoundPage;