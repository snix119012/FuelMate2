import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

const AlertModal = ({ isOpen, onClose, onAlertAdded, location }) => {
  const { token } = useContext(AuthContext);
  const [type, setType] = useState('patrol');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const alertTypes = ['patrol', 'fotoradar', 'wypadek', 'kontrola', 'kamera'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!location) {
      setError('Lokalizacja nie została wybrana. Kliknij na mapę.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/alerts', 
        { type, latitude: location.lat, longitude: location.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onAlertAdded();
      onClose();
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania alertu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={contentStyle}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Zgłoś zagrożenie</h2>
        {error && <p style={{color: 'var(--danger)'}}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label style={{ color: '#333', display: 'block', marginBottom: '0.5rem' }}>Typ alertu:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="glass-input" style={{ marginBottom: '1rem' }}>
            {alertTypes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-premium" disabled={loading}>
              {loading ? 'Zgłaszanie...' : 'Dodaj zgłoszenie tutaj'}
            </button>
            <button type="button" className="btn-premium" onClick={onClose} style={{ background: 'white', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const contentStyle = { background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '300px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };

export default AlertModal;