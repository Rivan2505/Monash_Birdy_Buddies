import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/home')}
      style={{
        top: '1rem',
        left: '1.5rem',
        background: '#fff',
        border: '1.5px solid #4CAF50',
        borderRadius: '6px',
        color: '#219653',
        fontWeight: 600,
        fontSize: '1rem',
        padding: '0.35rem 1rem',
        cursor: 'pointer',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: 'fit-content'
      }}
    >
      ← Back
    </button>
  );
};

export default BackButton;