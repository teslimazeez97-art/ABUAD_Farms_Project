import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '50px auto', 
      padding: 20,
      border: '1px solid #ddd',
      borderRadius: 8,
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30, color: '#2f855a' }}>
        Sign In
      </h2>
      
      {error && (
        <div style={{
          color: 'red',
          backgroundColor: '#ffebee',
          padding: 10,
          borderRadius: 4,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: loading ? '#ccc' : '#2f855a',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div style={{ 
        marginTop: 20, 
        textAlign: 'center', 
        fontSize: 14,
        color: '#666'
      }}>
        Don't have an account?{' '}
        <Link 
          to="/register" 
          style={{ color: '#2f855a', textDecoration: 'none', fontWeight: 600 }}
        >
          Create Account
        </Link>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#999' }}>
        <p><strong>Test Accounts:</strong></p>
        <p>Admin: admin@example.com / password</p>
        <p>Customer: test@example.com / secret123</p>
      </div>
    </div>
  );
};

export default Login;