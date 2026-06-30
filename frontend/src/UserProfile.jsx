import { useState, useEffect } from 'react';
import FavoritesPanel from './FavoritesPanel';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function UserProfile({ token }) {
  const [decoded, setDecoded] = useState(null);

  useEffect(() => {
    setDecoded(parseJwt(token));
  }, [token]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h2 style={{ color: '#333', marginTop: 0 }}>Profil użytkownika</h2>
      {decoded ? (
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Email:</strong> {decoded.email}</p>
          <p><strong>ID:</strong> {decoded.id}</p>
          <p><strong>Punkty:</strong> 0</p>
        </div>
      ) : (
        <p>Błąd dekodowania tokena</p>
      )}

      <hr />
      <FavoritesPanel token={token} />
    </div>
  );
}
