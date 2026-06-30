import React, { useEffect, useState, useContext } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import { AuthContext } from '../App';
import L from 'leaflet';
import { jwtDecode } from 'jwt-decode';

const alertIcons = {
  patrol: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/11618/11618268.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'white-marker-icon'
  }),
  fotoradar: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/12294/12294458.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'white-marker-icon'
  }),
  wypadek: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/65/65788.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'white-marker-icon'
  }),
  "roboty drogowe": new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/3586/3586685.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'white-marker-icon'
  }),
  zagrożenie: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/272/272340.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'white-marker-icon'
  }),
  default: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564016.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
    className: 'white-marker-icon'
  })
};

const MapAlertMarkers = ({ refreshTrigger }) => {
  const map = useMap();
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [localRefresh, setLocalRefresh] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error('Błąd dekodowania tokenu:', error);
      }
    } else {
      setCurrentUserId(null);
    }
  }, [token]);

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
  }, [map, refreshTrigger, localRefresh]);

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

  const handleDelete = async (alertId) => {
    if (!token) return alert('Musisz być zalogowany, aby usunąć alert.');
    if (!confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) return;
    
    try {
      await axios.delete(`http://localhost:3003/api/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Alert został usunięty.');
      setLocalRefresh(prev => prev + 1);
    } catch (error) {
      alert(error.response?.data?.message || 'Błąd podczas usuwania alertu.');
    }
  };

  const getIcon = (type) => {
    return alertIcons[type] || alertIcons.default;
  };

  return (
    <>
      {alerts.map(alert => (
        <Marker 
          key={`${alert.id}-${currentUserId}`} 
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
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '8px' }}>
                  
                  {currentUserId != alert.userId && (
                    <button 
                      onClick={() => handleConfirm(alert.id)} 
                      style={{ cursor: 'pointer', padding: '3px 8px' }}
                    >
                      Potwierdź
                    </button>
                  )}
                  
                  {currentUserId == alert.userId && (
                    <button 
                      onClick={() => handleDelete(alert.id)} 
                      style={{ cursor: 'pointer', padding: '3px 8px', backgroundColor: '#ff4b4b', color: 'white', border: 'none', borderRadius: '3px' }}
                    >
                      Usuń
                    </button>
                  )}

                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default MapAlertMarkers;