import React, { useEffect, useState, useContext } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import { AuthContext } from '../App';
import L from 'leaflet';

const alertIcons = {
  patrol: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2561/2561741.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  fotoradar: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/6840/6840333.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  wypadek: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3133/3133604.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  kontrola: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9355/9355701.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  kamera: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3680/3680364.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
  }),
  default: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564016.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  })
};

const MapAlertMarkers = ({ refreshTrigger }) => {
  const map = useMap();
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const center = map.getCenter();
      try {
        const response = await axios.get('http://localhost:3003/api/alerts', {
          params: { lat: center.lat, lng: center.lng, radius: 50 }
        });
        setAlerts(response.data);
      } catch (error) {
        console.error('Błąd pobierania alertów:', error);
      }
    };

    fetchAlerts();
    
    map.on('moveend', fetchAlerts);
    return () => {
      map.off('moveend', fetchAlerts);
    };
  }, [map, refreshTrigger]);

  const handleConfirm = async (alertId) => {
    if (!token) return alert('Musisz być zalogowany, aby potwierdzić.');
    try {
      await axios.post(`http://localhost:3003/api/alerts/${alertId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Dziękujemy za potwierdzenie!');
    } catch (error) {
      alert(error.response?.data?.message || 'Błąd podczas potwierdzania.');
    }
  };

  const getIcon = (type) => {
    return alertIcons[type] || alertIcons.default;
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
              </strong> <br/>
              <span style={{ color: '#555' }}>
                Potwierdzenia: <strong>{alert.confirmations?.length || 0}</strong>
              </span> <br/>
              {token && (
                 <button 
                   onClick={() => handleConfirm(alert.id)} 
                   style={{ marginTop: '8px', cursor: 'pointer', padding: '3px 8px' }}
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