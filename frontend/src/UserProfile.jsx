import { useState, useEffect } from 'react';
import axios from 'axios';
import FavoritesPanel from './FavoritesPanel';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function UserProfile({ token }) {
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const decodedToken = parseJwt(token);
    if (!decodedToken || !decodedToken.id) {
      setError(true);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/users/${decodedToken.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(response.data);
      } catch (err) {
        console.error('Błąd pobierania profilu:', err);
        setError(true);
      }
    };

    fetchProfile();
  }, [token]);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h2>Profil użytkownika</h2>
      
      {error && <p>Błąd ładowania danych profilu</p>}
      
      {!error && !userProfile && <p>Ładowanie danych...</p>}

      {userProfile && (
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>ID:</strong> {userProfile.id}</p>
          <p><strong>Punkty:</strong> {userProfile.points}</p>
        </div>
      )}

      <hr />
      <FavoritesPanel token={token} />
    </div>
  );
}