import { Link, useNavigate } from 'react-router';

const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

export function Invalid() {
  const navigate = useNavigate()
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  
  const containerStyle = {
    textAlign: 'center',
    padding: '2rem',
    maxWidth: 600,
    animation: 'fadeIn 0.6s ease-out',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const codeStyle = {
    fontSize: isMobile ? '5rem' : '8rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: 1,
    marginBottom: '1rem',
    animation: 'float 3s ease-in-out infinite'
  };

  const h1Style = {
    fontSize: isMobile ? '1.5rem' : '2rem',
    marginBottom: '0.75rem',
    fontWeight: 700,
    color: '#e4e6eb'
  };

  const pStyle = {
    fontSize: isMobile ? '1rem' : '1.1rem',
    color: '#9ca3af',
    marginBottom: '2rem',
    lineHeight: 1.6
  };

  const buttonsStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  };

  const buttonBase = {
    padding: '0.875rem 1.75rem',
    borderRadius: 12,
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    display: 'inline-block'
  };

  const primaryStyle = {
    ...buttonBase,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white'
  };

  const secondaryStyle = {
    ...buttonBase,
    background: '#1f2937',
    color: '#e4e6eb',
    border: '1px solid #374151'
  };

  return (
    <>
      <style>{`*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f1117;color:#e4e6eb;display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden}${keyframes}`}</style>
      
      <div style={containerStyle}>
        <div style={codeStyle}>404</div>
        <h1 style={h1Style}>Page not found</h1>
        <p style={pStyle}>Looks like you took a wrong turn. The page you’re looking for doesn’t exist or may have been moved.</p>
        
        <div style={buttonsStyle}>
          <Link
            to="/" 
            style={primaryStyle}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Go Home
          </Link>
          
          <Link
            onClick={() => navigate(-1)}
            style={secondaryStyle}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#374151';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1f2937';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Go Back
          </Link>
        </div>
      </div>
    </>
  );
}