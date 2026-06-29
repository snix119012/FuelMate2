import { useState } from 'react';

// Komunikuje się z Favorite Service przez API Gateway
const API_URL = 'http://localhost:3000/api/favorites';

export default function FavoritesPanel({ token }) {
  const [favorites, setFavorites] = useState([]);
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [message, setMessage] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  async function fetchFavorites() {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd pobierania ulubionych');
      setFavorites(data);
      setMessage('Pobrano ulubione');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function addFavorite(e) {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ stationId: Number(stationId), stationName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd dodawania do ulubionych');
      setFavorites([data, ...favorites]);
      setStationId('');
      setStationName('');
      setMessage('Dodano do ulubionych');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function removeFavorite(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Błąd usuwania z ulubionych');
      setFavorites(favorites.filter(f => f.id !== id));
      setMessage('Usunięto z ulubionych');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function toggleNotifications(id, current) {
    try {
      const res = await fetch(`${API_URL}/${id}/notifications`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ enabled: !current })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd aktualizacji powiadomień');
      setFavorites(favorites.map(f => (f.id === id ? data : f)));
      setMessage('Zaktualizowano powiadomienia');
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!token) {
    return <p>Musisz być zalogowany, aby zarządzać ulubionymi stacjami.</p>;
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
      <h2>Ulubione stacje</h2>

      <button onClick={fetchFavorites}>Pobierz ulubione</button>

      <form onSubmit={addFavorite} style={{ marginTop: '1rem' }}>
        <input
          type="number"
          placeholder="stationId"
          value={stationId}
          onChange={e => setStationId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="stationName (opcjonalnie)"
          value={stationName}
          onChange={e => setStationName(e.target.value)}
        />
        <button type="submit">Dodaj do ulubionych</button>
      </form>

      {message && <p><em>{message}</em></p>}

      <ul>
        {favorites.map(f => (
          <li key={f.id}>
            <strong>#{f.stationId}</strong> {f.stationName || '(brak nazwy)'} —{" "}
            powiadomienia: {f.notifyOnPriceChange ? 'WŁ' : 'WYŁ'}{" "}
            <button onClick={() => toggleNotifications(f.id, f.notifyOnPriceChange)}>
              {f.notifyOnPriceChange ? 'Wyłącz' : 'Włącz'}
            </button>{" "}
            <button onClick={() => removeFavorite(f.id)}>Usuń</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
