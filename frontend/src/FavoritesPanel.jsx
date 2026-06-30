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
  const [selectedStation, setSelectedStation] = useState(null);

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
      setSelectedStation(null);
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

  function openStationDetails(stationId) {
    const station = stations.find(s => s.id === stationId);
    if (station) setSelectedStation(station);
  }

  function closeStationDetails() {
    setSelectedStation(null);
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

  const selectedFavorite = selectedStation
    ? favorites.find(f => f.stationId === selectedStation.id)
    : null;

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
            <button
              onClick={() => openStationDetails(f.stationId)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#0066cc'
              }}
            >
              {f.stationName || `Stacja #${f.stationId}`}
            </button>
            {' — '}
            powiadomienia: {f.notifyOnPriceChange ? 'WŁ' : 'WYŁ'}
            {' '}
            <button onClick={() => toggleNotifications(f.id, f.notifyOnPriceChange)}>
              {f.notifyOnPriceChange ? 'Wyłącz' : 'Włącz'}
            </button>
            {' '}
            <button onClick={() => removeFavorite(f.id)}>Usuń</button>
          </li>
        ))}
      </ul>

      {selectedStation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeStationDetails}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3>{selectedStation.name}</h3>
            {selectedStation.brand && <p><strong>Marka:</strong> {selectedStation.brand}</p>}
            {selectedStation.address && <p><strong>Adres:</strong> {selectedStation.address}</p>}
            <p><strong>Współrzędne:</strong> {selectedStation.lat}, {selectedStation.lng}</p>
            <p><strong>Średnia ocena:</strong> {selectedStation.averageRating || 0} / 5 ({selectedStation.ratingCount || 0} głosów)</p>

            <h4>Aktualne ceny:</h4>
            {selectedStation.prices && Object.keys(selectedStation.prices).length > 0 ? (
              <ul>
                {Object.entries(selectedStation.prices).map(([fuel, info]) => (
                  <li key={fuel}>
                    {fuel}: <strong>{info.price} zł</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak cen dla tej stacji.</p>
            )}

            {selectedFavorite && (
              <p>
                <strong>Powiadomienia:</strong>{' '}
                {selectedFavorite.notifyOnPriceChange ? 'włączone' : 'wyłączone'}
                {' '}
                <button
                  onClick={() => toggleNotifications(selectedFavorite.id, selectedFavorite.notifyOnPriceChange)}
                >
                  {selectedFavorite.notifyOnPriceChange ? 'Wyłącz' : 'Włącz'}
                </button>
              </p>
            )}

            <button onClick={closeStationDetails} style={{ marginTop: '1rem' }}>
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
