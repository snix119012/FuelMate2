import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

function AuthModal({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        onLogin(response.data.token);
      } else {
        if (password !== confirmPassword) {
          alert('Hasła nie są identyczne');
          return;
        }
        await axios.post(`${API_URL}/register`, { email, password });
        alert('Utworzono konto. Możesz się zalogować.');
        setIsLoginMode(true);
      }
    } catch (error) {
      alert('Wystąpił błąd: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <h2>{isLoginMode ? 'Logowanie' : 'Rejestracja'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input type="email" placeholder="test@test.pl" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        
        <br />

        <div>
          <label>Hasło: </label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <br />

        {!isLoginMode && (
          <div>
            <label>Powtórz hasło: </label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <br />
          </div>
        )}

        <br />

        <button type="submit">
          {isLoginMode ? 'Zaloguj się' : 'Utwórz konto'}
        </button>
      </form>

      <br />
      <hr />

      <p>
        {isLoginMode ? 'Nie masz konta? ' : 'Masz już konto? '}
        <button type="button" onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? 'Zarejestruj się' : 'Zaloguj się'}
        </button>
      </p>
    </div>
  );
}

export default AuthModal;
