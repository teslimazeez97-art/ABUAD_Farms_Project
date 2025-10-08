import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: { name, email, password }
      });

      // Auto-login after successful registration
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/'); // Redirect to homepage
      }
    } catch (err) {
      setError(err.message);
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
        Create Account
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

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>
            Full Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div style={{ 
        marginTop: 20, 
        textAlign: 'center', 
        fontSize: 14,
        color: '#666'
      }}>
        Already have an account?{' '}
        <Link 
          to="/login" 
          style={{ color: '#2f855a', textDecoration: 'none', fontWeight: 600 }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}