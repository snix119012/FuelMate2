import { useState, useEffect } from 'react';

// UWAGA: ten komponent służy do bezpośredniego testowania Favorite Service.
// W docelowej architekturze powinien komunikować się przez API Gateway pod /api/favorites/*
const API_URL = 'http://localhost:3004/favorites';

export default function FavoritesPanel({ token: propToken }) {
  const [token, setToken] = useState(propToken || localStorage.getItem('fuelmate_token') || '');
  const [favorites, setFavorites] = useState([]);
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (propToken && propToken !== token) {
      setToken(propToken);
    }
    localStorage.setItem('fuelmate_token', token);
  }, [propToken, token]);

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

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
      <h2>Ulubione stacje (Favorite Service)</h2>
      <p>
        Token JWT:{" "}
        <input
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="wklej token JWT"
          style={{ width: '320px' }}
        />
      </p>
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
