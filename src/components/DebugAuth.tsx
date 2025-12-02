import React from 'react';
import { useAuth } from '../context/SupabaseAuthContext';

const DebugAuth: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Hide in production
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #913e27',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 9999,
      maxWidth: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#913e27', fontWeight: 'bold' }}>
        🔍 Auth Debug
      </h3>
      <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        {user ? (
          <>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> <span style={{ 
              color: user.role === 'ADMIN' ? 'green' : 'blue',
              fontWeight: 'bold'
            }}>{user.role}</span></p>
            <p><strong>ID:</strong> {user.id.slice(0, 8)}...</p>
          </>
        ) : (
          <p style={{ color: 'red' }}>No user data</p>
        )}
      </div>
    </div>
  );
};

export default DebugAuth;
