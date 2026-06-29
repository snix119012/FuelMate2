import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

const AlertModal = ({ isOpen, onClose, onAlertAdded }) => {
  const { token } = useContext(AuthContext);
  const [type, setType] = useState('patrol');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const alertTypes = ['patrol', 'fotoradar', 'wypadek', 'kontrola', 'kamera'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          await axios.post('http://localhost:3003/api/alerts', 
            { type, latitude, longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          onAlertAdded();
          onClose();
        } catch (err) {
          setError('Wystąpił błąd podczas dodawania alertu.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Brak uprawnień do lokalizacji GPS.');
        setLoading(false);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={contentStyle}>
        <h2>Zgłoś zagrożenie</h2>
        {error && <p style={{color: 'red'}}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <label>Typ alertu:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', marginBottom: '1rem' }}>
            {alertTypes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Zgłaszanie...' : 'Zgłoś (Pobierze GPS)'}
            </button>
            <button type="button" onClick={onClose}>Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const contentStyle = { background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px' };

export default AlertModal;