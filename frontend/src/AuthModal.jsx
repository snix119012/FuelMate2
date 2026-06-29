import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/api/auth';

function AuthModal({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Niepoprawny format adresu email.');
      return false;
    }
    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków.');
      return false;
    }
    if (!isLoginMode && password !== confirmPassword) {
      setError('Podane hasła nie są identyczne.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isLoginMode) {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        onLogin(response.data.token);
      } else {
        await axios.post(`${API_URL}/register`, { email, password });
        alert('Utworzono konto. Możesz się zalogować.');
        setIsLoginMode(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLoginMode ? 'Logowanie' : 'Rejestracja'}</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <input type="password" placeholder="Hasło" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {!isLoginMode && (
          <div>
            <input type="password" placeholder="Powtórz hasło" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        )}

        <button type="submit">
          {isLoginMode ? 'Zaloguj się' : 'Utwórz konto'}
        </button>
      </form>

      <hr />

      <p style={{ fontSize: '14px', margin: 0 }}>
        {isLoginMode ? 'Nie masz konta? ' : 'Masz już konto? '}
        <button type="button" className="switch-btn" onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}>
          {isLoginMode ? 'Zarejestruj się' : 'Zaloguj się'}
        </button>
      </p>
    </div>
  );
}

export default AuthModal;
