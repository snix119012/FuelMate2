import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapAlertMarkers from './MapAlertMarkers';

const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

const MapView = ({ refreshTrigger }) => {
  const [mapCenter, setMapCenter] = useState([52.2297, 21.0122]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.warn("Nie udało się pobrać lokalizacji użytkownika, zostajemy przy domyślnej:", error.message);
        }
      );
    }
  }, []);

  return (
    <div style={{ height: '500px', width: '100%', marginTop: '20px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <ChangeMapView center={mapCenter} />
        
        <MapAlertMarkers refreshTrigger={refreshTrigger} />
      </MapContainer>
    </div>
  );
};

export default MapView;