import { useState, useEffect } from 'react';

// Komunikuje się z Favorite Service i Station Service przez API Gateway
const API_URL = 'http://localhost:3000/api/favorites';
const STATIONS_API_URL = 'http://localhost:3000/api/stations';

export default function FavoritesPanel({ token }) {
  const [favorites, setFavorites] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    fetchStations();
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchStations() {
    try {
      const res = await fetch(STATIONS_API_URL);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd pobierania stacji');
      setStations(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

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
    if (!selectedStationId) {
      setMessage('Wybierz stację z listy');
      return;
    }

    const stationIdNum = Number(selectedStationId);

    if (favorites.some(f => f.stationId === stationIdNum)) {
      setMessage('Ta stacja jest już w ulubionych');
      return;
    }

    const station = stations.find(s => s.id === stationIdNum);
    const stationName = station ? station.name : '';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ stationId: stationIdNum, stationName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd dodawania do ulubionych');
      setFavorites([data, ...favorites]);
      setSelectedStationId('');
      setSearchTerm('');
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

  const filteredStations = stations.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteStationIds = new Set(favorites.map(f => f.stationId));
  const availableStations = filteredStations.filter(s => !favoriteStationIds.has(s.id));

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
      <h2>Ulubione stacje</h2>

      <button onClick={fetchFavorites} style={{ marginBottom: '1rem' }}>
        Odśwież ulubione
      </button>

      <form onSubmit={addFavorite} style={{ marginBottom: '1rem' }}>
        <div>
          <input
            type="text"
            placeholder="Wyszukaj stację..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '200px', marginRight: '0.5rem' }}
          />
          <select
            value={selectedStationId}
            onChange={e => setSelectedStationId(e.target.value)}
            required
            style={{ width: '240px' }}
          >
            <option value="">-- Wybierz stację --</option>
            {availableStations.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.brand ? `(${s.brand})` : ''}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ marginTop: '0.5rem' }}>
          Dodaj do ulubionych
        </button>
      </form>

      {message && <p><em>{message}</em></p>}

      <ul>
        {favorites.map(f => (
          <li key={f.id}>
            <strong>{f.stationName || `Stacja #${f.stationId}`}</strong> —{' '}
            powiadomienia: {f.notifyOnPriceChange ? 'WŁ' : 'WYŁ'}{' '}
            <button onClick={() => toggleNotifications(f.id, f.notifyOnPriceChange)}>
              {f.notifyOnPriceChange ? 'Wyłącz' : 'Włącz'}
            </button>{' '}
            <button onClick={() => removeFavorite(f.id)}>Usuń</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
