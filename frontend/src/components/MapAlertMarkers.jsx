import React, { useEffect, useState, useContext } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import { AuthContext } from '../App';
import L from 'leaflet';


const MapAlertMarkers = ({ refreshTrigger }) => {
  const map = useMap();
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [mapCenter, setMapCenter] = useState(map.getCenter());

  useEffect(() => {
    const handleMove = () => setMapCenter(map.getCenter());
    map.on('moveend', handleMove);
    return () => map.off('moveend', handleMove);
  }, [map]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/alerts', {
          params: { lat: mapCenter.lat, lng: mapCenter.lng, radius: 50 },
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(response.data);
      } catch (error) {
        console.error('Błąd pobierania alertów:', error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [mapCenter, token, refreshTrigger]);

  const handleConfirmAlert = async (alertId) => {
    if (!token) return alert('Musisz być zalogowany, aby potwierdzić.');
    try {
      await axios.post(`http://localhost:3000/api/alerts/${alertId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Dziękujemy za potwierdzenie!');
    } catch (error) {
      alert(error.response?.data?.message || 'Błąd podczas potwierdzania.');
    }
  };

  const getIcon = (type) => {
    let emoji = '⚠️';
    let color = '#ff4b4b';

    switch (type) {
      case 'patrol': emoji = '🚓'; color = '#3b82f6'; break;
      case 'fotoradar': emoji = '📸'; color = '#eab308'; break;
      case 'wypadek': emoji = '💥'; color = '#ef4444'; break;
      case 'kontrola': emoji = '👮'; color = '#8b5cf6'; break;
      case 'kamera': emoji = '📹'; color = '#f97316'; break;
    }

    return L.divIcon({
      className: 'custom-alert-marker',
      html: `<div style="font-size: 20px; background: ${color}; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.6);">${emoji}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17]
    });
  };

  return (
    <>
      {alerts.map(alert => (
        <Marker
          key={alert.id}
          position={[alert.latitude, alert.longitude]}
          icon={getIcon(alert.type)}
        >
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ fontSize: '1.1rem', color: '#ff4b4b' }}>
                {alert.type.toUpperCase()}
              </strong> <br />
              <span style={{ color: '#555' }}>
                Potwierdzenia: <strong>{alert.confirmations?.length || 0}</strong>
              </span> <br />
              {token && (
                <button
                  className="btn-premium"
                  onClick={() => handleConfirmAlert(alert.id)}
                  style={{ marginTop: '8px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Potwierdź
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default MapAlertMarkers;