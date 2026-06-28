import { useState } from 'react';

function AuthModal({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div>
      <h2>{isLoginMode ? 'Logowanie' : 'Rejestracja'}</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <div>
          <label>Email: </label>
          <input type="email" placeholder="test@test.pl" required />
        </div>
        
        <br />

        <div>
          <label>Hasło: </label>
          <input type="password" required />
        </div>

        <br />

        {!isLoginMode && (
          <div>
            <label>Powtórz hasło: </label>
            <input type="password" required />
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
