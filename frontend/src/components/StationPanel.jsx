import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StationPanel = ({ station, onClose, onUpdate, token }) => {
  const [activeTab, setActiveTab] = useState('prices'); // 'prices' or 'rating'
  
  // Price form state
  const [fuelTypeId, setFuelTypeId] = useState(1);
  const [price, setPrice] = useState('');
  
  // Rating form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!station || !token) {
        setIsFavorite(false);
        setFavoriteId(null);
        return;
      }
      try {
        const res = await axios.get('http://localhost:3000/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fav = res.data.find(f => f.stationId === station.id);
        if (fav) {
          setIsFavorite(true);
          setFavoriteId(fav.id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch (err) {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    };
    checkFavorite();
  }, [station, token]);

  if (!station) return null;

  const handleAddPrice = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.post(`http://localhost:3000/api/stations/${station.id}/prices`, {
        fuelTypeId: parseInt(fuelTypeId),
        price: parseFloat(price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Cena została dodana pomyślnie!');
      setPrice('');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd podczas dodawania ceny');
    }
  };

  const handleAddRating = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.post(`http://localhost:3000/api/stations/${station.id}/ratings`, {
        rating: parseInt(rating),
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Ocena została dodana pomyślnie!');
      setComment('');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd podczas dodawania oceny');
    }
  };

  const handleAddToFavorites = async () => {
    setFavoriteMessage('');
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/favorites', {
        stationId: station.id,
        stationName: station.name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(true);
      setFavoriteId(res.data.id);
      setFavoriteMessage('Dodano do ulubionych!');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd podczas dodawania do ulubionych');
    }
  };

  const handleRemoveFromFavorites = async () => {
    setFavoriteMessage('');
    setError('');
    if (!favoriteId) return;
    try {
      await axios.delete(`http://localhost:3000/api/favorites/${favoriteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(false);
      setFavoriteId(null);
      setFavoriteMessage('Usunięto z ulubionych!');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd podczas usuwania z ulubionych');
    }
  };

  return (
    <div className="glass-panel" style={{
      position: 'absolute',
      top: '0',
      right: '0',
      width: '350px',
      height: '100%',
      zIndex: 2000,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.3s ease-out forwards',
      borderLeft: '1px solid var(--border)',
      borderTopLeftRadius: '0',
      borderBottomLeftRadius: '0'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .panel-tab {
            flex: 1;
            padding: 10px;
            background: #f4f4f4;
            border: none;
            color: #333;
            cursor: pointer;
            font-weight: bold;
          }
          .panel-tab.active {
            background: var(--accent-primary);
            color: white;
          }
        `}
      </style>

      <button onClick={onClose} style={{
        position: 'absolute', top: '10px', right: '15px',
        background: 'transparent', border: 'none', color: '#333',
        fontSize: '1.5rem', cursor: 'pointer'
      }}>×</button>

      <h2 style={{ color: 'var(--accent-primary)', marginBottom: '5px' }}>{station.name}</h2>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>{station.address}</p>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '1.2rem', color: '#fbbf24', marginRight: '5px' }}>★</span>
        <span style={{ fontWeight: 'bold', color: '#333' }}>{station.averageRating ? station.averageRating.toFixed(2) : 'Brak ocen'}</span>
        <span style={{ fontSize: '0.8rem', marginLeft: '5px', color: '#666' }}>({station.ratingCount} opinii)</span>
      </div>

      {isFavorite ? (
        <button type="button" className="btn-premium" style={{ width: '100%', marginBottom: '15px', background: 'var(--danger)' }} onClick={handleRemoveFromFavorites}>
          Usuń z ulubionych
        </button>
      ) : (
        <button type="button" className="btn-premium" style={{ width: '100%', marginBottom: '15px' }} onClick={handleAddToFavorites}>
          Dodaj do ulubionych
        </button>
      )}
      {favoriteMessage && <p style={{ color: 'var(--accent-primary)', marginBottom: '15px', textAlign: 'center' }}>{favoriteMessage}</p>}

      <div style={{ display: 'flex', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <button className={`panel-tab ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>Ceny</button>
        <button className={`panel-tab ${activeTab === 'rating' ? 'active' : ''}`} onClick={() => setActiveTab('rating')}>Oceń</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'prices' && (
          <div>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#333' }}>Aktualne Ceny</h3>
            {station.prices && Object.keys(station.prices).length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                {Object.entries(station.prices).map(([fuel, data]) => (
                  <li key={fuel} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f4f4f4', marginBottom: '5px', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{fuel}</span>
                    <span style={{ color: '#333' }}>{data.price.toFixed(2)} zł</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666', marginBottom: '20px' }}>Brak danych o cenach.</p>
            )}

            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', marginTop: '30px', color: '#333' }}>Aktualizuj Cenę</h3>
            <form onSubmit={handleAddPrice}>
              <select className="glass-input" value={fuelTypeId} onChange={(e) => setFuelTypeId(e.target.value)}>
                <option value={1} style={{color: 'black'}}>PB95</option>
                <option value={2} style={{color: 'black'}}>PB98</option>
                <option value={3} style={{color: 'black'}}>ON</option>
                <option value={4} style={{color: 'black'}}>LPG</option>
                <option value={5} style={{color: 'black'}}>EV</option>
              </select>
              <input 
                type="number" 
                step="0.01" 
                placeholder="Cena (np. 6.54)" 
                className="glass-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <button type="submit" className="btn-premium" style={{ width: '100%' }}>Zapisz cenę (+1 pkt)</button>
            </form>
          </div>
        )}

        {activeTab === 'rating' && (
          <div>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#333' }}>Zostaw Opinię</h3>
            <form onSubmit={handleAddRating}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#333' }}>Ocena (1-5):</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={rating} 
                onChange={(e) => setRating(e.target.value)}
                style={{ width: '100%', marginBottom: '15px', accentColor: '#fbbf24' }}
              />
              <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#fbbf24', marginBottom: '15px' }}>
                {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
              </div>
              
              <textarea 
                placeholder="Dodaj komentarz (opcjonalnie)..." 
                className="glass-input"
                style={{ height: '100px', resize: 'none' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" className="btn-premium" style={{ width: '100%' }}>Wyślij Opinię</button>
            </form>
          </div>
        )}

        {message && <p style={{ color: 'var(--accent-primary)', marginTop: '15px', textAlign: 'center' }}>{message}</p>}
        {error && <p style={{ color: 'var(--danger)', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
};

export default StationPanel;
