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
  const [stationRatings, setStationRatings] = useState([]);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

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

  async function fetchRatings(stationId) {
    try {
      const res = await fetch(`${STATIONS_API_URL}/${stationId}/ratings`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd pobierania ocen');
      setStationRatings(data);
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

  async function addRating(e, stationId) {
    e.preventDefault();
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setMessage('Ocena musi być od 1 do 5');
      return;
    }

    try {
      const res = await fetch(`${STATIONS_API_URL}/${stationId}/ratings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating: Number(ratingValue), comment: ratingComment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd dodawania oceny');
      await fetchStations();
      await fetchRatings(stationId);
      setRatingComment('');
      setRatingValue(5);
      setMessage('Ocena dodana');
    } catch (err) {
      setMessage(err.message);
    }
  }

  function openStationDetails(stationId) {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(station);
      fetchRatings(stationId);
    }
  }

  function closeStationDetails() {
    setSelectedStation(null);
    setStationRatings([]);
    setRatingComment('');
    setRatingValue(5);
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

  const updatedSelectedStation = selectedStation
    ? stations.find(s => s.id === selectedStation.id) || selectedStation
    : null;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <h2 style={{ color: '#333', marginTop: 0 }}>Ulubione stacje</h2>

      <button className="btn-premium" onClick={fetchFavorites} style={{ marginBottom: '1rem' }}>
        Odśwież ulubione
      </button>

      <form onSubmit={addFavorite} style={{ marginBottom: '1rem' }}>
        <div>
          <input
            type="text"
            placeholder="Wyszukaj stację..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="glass-input"
            style={{ width: '200px', marginRight: '0.5rem', display: 'inline-block' }}
          />
          <select
            value={selectedStationId}
            onChange={e => setSelectedStationId(e.target.value)}
            required
            className="glass-input"
            style={{ width: '240px', display: 'inline-block' }}
          >
            <option value="">-- Wybierz stację --</option>
            {availableStations.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.brand ? `(${s.brand})` : ''}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-premium" style={{ marginTop: '0.5rem' }}>
          Dodaj do ulubionych
        </button>
      </form>

      {message && <p style={{ color: '#333' }}><em>{message}</em></p>}

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
            <button className="btn-premium" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => toggleNotifications(f.id, f.notifyOnPriceChange)}>
              {f.notifyOnPriceChange ? 'Wyłącz' : 'Włącz'}
            </button>
            {' '}
            <button className="btn-premium" style={{ background: 'var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => removeFavorite(f.id)}>Usuń</button>
          </li>
        ))}
      </ul>

      {updatedSelectedStation && (
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
            className="glass-panel"
            style={{
              padding: '1.5rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ color: '#333', marginTop: 0 }}>{updatedSelectedStation.name}</h3>
            {updatedSelectedStation.brand && <p><strong>Marka:</strong> {updatedSelectedStation.brand}</p>}
            {updatedSelectedStation.address && <p><strong>Adres:</strong> {updatedSelectedStation.address}</p>}
            <p><strong>Współrzędne:</strong> {updatedSelectedStation.lat}, {updatedSelectedStation.lng}</p>
            <p><strong>Średnia ocena:</strong> {updatedSelectedStation.averageRating || 0} / 5 ({updatedSelectedStation.ratingCount || 0} głosów)</p>

            <h4>Aktualne ceny:</h4>
            {updatedSelectedStation.prices && Object.keys(updatedSelectedStation.prices).length > 0 ? (
              <ul>
                {Object.entries(updatedSelectedStation.prices).map(([fuel, info]) => (
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
                  className="btn-premium"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => toggleNotifications(selectedFavorite.id, selectedFavorite.notifyOnPriceChange)}
                >
                  {selectedFavorite.notifyOnPriceChange ? 'Wyłącz' : 'Włącz'}
                </button>
              </p>
            )}

            <hr style={{ margin: '1rem 0' }} />

            <h4>Komentarze użytkowników:</h4>
            {stationRatings.length > 0 ? (
              <ul style={{ maxHeight: '150px', overflow: 'auto' }}>
                {stationRatings.map(r => (
                  <li key={r.id} style={{ marginBottom: '0.5rem' }}>
                    <strong>{r.rating}/5</strong>
                    {r.comment && <span> — „{r.comment}”</span>}
                    {!r.comment && <span> — brak komentarza</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak komentarzy.</p>
            )}

            <hr style={{ margin: '1rem 0' }} />

            <h4>Oceń stację:</h4>
            <form onSubmit={e => addRating(e, updatedSelectedStation.id)}>
              <div>
                <label>Ocena: </label>
                <select
                  value={ratingValue}
                  onChange={e => setRatingValue(Number(e.target.value))}
                  style={{ marginRight: '0.5rem' }}
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Komentarz (opcjonalnie)"
                  value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn-premium" style={{ marginTop: '0.5rem' }}>
                Dodaj ocenę
              </button>
            </form>

            <button className="btn-premium" onClick={closeStationDetails} style={{ marginTop: '1rem', background: 'white', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
