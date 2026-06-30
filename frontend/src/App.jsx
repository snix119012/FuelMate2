import { useState, useEffect, createContext } from 'react'
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
      <div style={{ fontFamily: 'sans-serif', padding: '1rem', background: 'transparent' }}>
        <h1 className="brand-title">FuelMate</h1>

        {!isLoggedIn ? (
          <AuthModal onLogin={handleLogin} />
        ) : (
          <div>
            <nav style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn-premium" onClick={() => setActiveTab('home')}>
                Mapa i Stacje
              </button>
              <button className="btn-premium" onClick={() => setActiveTab('profile')} style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: '#000000' }}>
                Twój Profil
              </button>
              
              {activeTab === 'home' && (
                <button 
                  className="btn-premium"
                  onClick={() => setIsAlertModalOpen(true)} 
                  style={{ backgroundColor: '#ff4b4b', border: 'none', color: '#ffffff' }}
                >
                  Zgłoś zagrożenie drogowe
                </button>
              )}

              <button className="btn-premium" onClick={handleLogout} style={{ background: 'var(--danger)', marginLeft: 'auto' }}>Wyloguj</button>
            </nav>

            {activeTab === 'home' ? (
              <div>
                <AlertModal 
                  isOpen={isAlertModalOpen} 
                  onClose={() => setIsAlertModalOpen(false)} 
                  onAlertAdded={() => setRefreshMap(prev => prev + 1)} 
                />

                <div style={{ position: 'relative' }}>
                  <MapView 
                    refreshTrigger={refreshMap} 
                    onStationSelect={(station) => setSelectedStation(station)} 
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