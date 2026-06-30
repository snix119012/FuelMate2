import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'
import UserProfile from './UserProfile'
import MapView from './components/MapView'
import AlertModal from './components/AlertModal'
import StationPanel from './components/StationPanel'
import { AuthContext } from './AuthContext'
import './App.css'

export { AuthContext }

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [refreshMap, setRefreshMap] = useState(0)
  const [token, setToken] = useState(localStorage.getItem('fuelmate_token') || '')
  
  const [selectedStation, setSelectedStation] = useState(null)
  const [alertLocation, setAlertLocation] = useState(null)

  useEffect(() => {
    if (token) setIsLoggedIn(true)
  }, [token])

  const handleLogin = (newToken) => {
    localStorage.setItem('fuelmate_token', newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    setActiveTab('home');
  }

  const handleLogout = () => {
    localStorage.removeItem('fuelmate_token')
    setToken('')
    setIsLoggedIn(false)
    setActiveTab('home')
  }

  return (
    <AuthContext.Provider value={{ token }}>
      <div className="app-container" style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
        <h1 className="brand-title" style={{ color: '#333', textAlign: 'center' }}>FuelMate</h1>

        {!isLoggedIn ? (
          <AuthModal onLogin={handleLogin} />
        ) : (
          <div>
            <nav className="main-nav">
              <button className="btn-premium" onClick={() => setActiveTab('home')}>
                Mapa i Stacje
              </button>
              <button className="btn-premium" onClick={() => setActiveTab('profile')} style={{ marginLeft: '0.5rem', background: 'white', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>
                Twój Profil
              </button>
              <button className="btn-premium" onClick={handleLogout} style={{ background: 'var(--danger)', float: 'right' }}>Wyloguj</button>
            </nav>

            {activeTab === 'home' ? (
              <div>
                <AlertModal
                  isOpen={isAlertModalOpen}
                  onClose={() => setIsAlertModalOpen(false)}
                  onAlertAdded={() => setRefreshMap(prev => prev + 1)}
                  location={alertLocation}
                />

                <div className="info-bar">
                  Kliknij w dowolne miejsce na mapie, aby zgłosić nowe zagrożenie drogowe.
                </div>

                <div style={{ position: 'relative' }}>
                  <MapView 
                    refreshTrigger={refreshMap} 
                    onStationSelect={(station) => setSelectedStation(station)} 
                    onMapClick={(latlng) => {
                      setAlertLocation(latlng);
                      setIsAlertModalOpen(true);
                    }}
                  />
                  
                  {selectedStation && (
                    <StationPanel 
                      station={selectedStation} 
                      token={token}
                      onClose={() => setSelectedStation(null)} 
                      onUpdate={() => setRefreshMap(prev => prev + 1)}
                    />
                  )}
                </div>
              </div>
            ) : (
              <UserProfile token={token} />
            )}
          </div>
        )}
      </div>
    </AuthContext.Provider>
  )
}

export default App