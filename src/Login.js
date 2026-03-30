import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import './Login.css'; // We'll create this CSS file

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      setError('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetMessage('');

    if (!resetEmail) {
      setResetMessage('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
      setResetEmail('');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setResetMessage('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        setResetMessage('Invalid email address');
      } else {
        setResetMessage('Failed to send reset email. Please try again.');
      }
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={() => setShowResetForm(true)} className="link-button">
            Forgot Password?
          </button>
          <span className="divider">|</span>
          <button onClick={onSwitchToRegister} className="link-button">
            Register
          </button>
        </div>
      </div>

      {showResetForm && (
        <div className="reset-modal-overlay" onClick={() => setShowResetForm(false)}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>
            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label htmlFor="resetEmail">Enter your email address:</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              {resetMessage && (
                <div className={`message ${resetMessage.includes('sent') ? 'success' : 'error'}`}>
                  {resetMessage}
                </div>
              )}
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowResetForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="reset-btn">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;