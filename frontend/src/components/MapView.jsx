import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import MapAlertMarkers from './MapAlertMarkers';

// Naprawa domyślnych ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Funkcja tworząca customową ikonę z ceną
const createPriceIcon = (price, brand) => {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div class="price-marker">${price ? price.toFixed(2) + ' zł' : brand}</div>`,
    iconSize: [60, 30],
    iconAnchor: [30, 15]
  });
};

const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

const MapView = ({ refreshTrigger, onStationSelect }) => {
  const [mapCenter, setMapCenter] = useState([52.2297, 21.0122]); // Domyślnie Warszawa
  const [stations, setStations] = useState([]);
  const [radius, setRadius] = useState(50); // Zwiększyłem początkowy do 50km

  // Pobieranie lokalizacji GPS użytkownika
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn("Nie udało się pobrać lokalizacji, zostajemy przy Warszawie.");
        }
      );
    }
  }, []);

  // Pobieranie stacji z serwera (z uwzględnieniem filtra promienia)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/stations?lat=${mapCenter[0]}&lng=${mapCenter[1]}&radius=${radius}`);
        setStations(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania stacji:', error);
      }
    };
    fetchStations();
  }, [mapCenter, radius, refreshTrigger]);

  return (
    <div style={{ position: 'relative', width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: '20px' }}>
      
      {/* Szklany panel sterowania */}
      <div className="glass-panel" style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, padding: '15px', width: '250px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '1rem', color: 'white' }}>Zasięg wyszukiwania</h3>
        <input 
          type="range" 
          min="1" 
          max="500" 
          value={radius} 
          onChange={(e) => setRadius(e.target.value)}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
        <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold', color: 'white' }}>
          {radius} km
        </div>
      </div>

      <div style={{ height: '85vh', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
        <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%', backgroundColor: '#0f172a' }}>
          {/* Ciemny motyw mapy (CartoDB Dark Matter) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <ChangeMapView center={mapCenter} />
          
          {/* Rysowanie stacji */}
          {stations.map(station => {
            // Pobieramy cenę najpopularniejszego paliwa do wyświetlenia na dymku (np. PB95)
            const displayPrice = station.prices && station.prices['PB95'] ? station.prices['PB95'].price : null;
            
            return (
              <Marker 
                key={station.id} 
                position={[station.lat, station.lng]}
                icon={createPriceIcon(displayPrice, station.brand)}
                eventHandlers={{
                  click: () => onStationSelect && onStationSelect(station)
                }}
              >
                <Popup className="glass-popup">
                  <strong>{station.name}</strong><br/>
                  {station.address}<br/>
                  {displayPrice ? `PB95: ${displayPrice} zł` : 'Brak danych o cenie'}
                  <br/><br/>
                  <small>Kliknij marker, by otworzyć panel</small>
                </Popup>
              </Marker>
            );
          })}

          <MapAlertMarkers refreshTrigger={refreshTrigger} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;