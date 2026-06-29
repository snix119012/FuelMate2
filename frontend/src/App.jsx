import { useState, useEffect, createContext } from 'react'
import AuthModal from './AuthModal'
import UserProfile from './UserProfile'
import MapView from './components/MapView'
import AlertModal from './components/AlertModal'
import { TEST_TOKEN } from './test-token'
import './App.css'

export const AuthContext = createContext(null);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [refreshMap, setRefreshMap] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('fuelmate_token')
    if (token) setIsLoggedIn(true)
  }, [])

  const handleLogin = () => {
    localStorage.setItem('fuelmate_token', TEST_TOKEN)
    setIsLoggedIn(true)
    setActiveTab('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('fuelmate_token')
    setIsLoggedIn(false)
    setActiveTab('home')
  }

  return (
    <AuthContext.Provider value={{ token: localStorage.getItem('fuelmate_token') }}>
      <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
        <h1>FuelMate</h1>

        {!isLoggedIn ? (
          <AuthModal onLogin={handleLogin} />
        ) : (
          <div>
            <nav style={{ marginBottom: '1rem' }}>
              <button onClick={() => setActiveTab('home')} style={{ marginRight: '0.5rem' }}>
                Strona główna
              </button>
              <button onClick={() => setActiveTab('profile')} style={{ marginRight: '0.5rem' }}>
                Profil
              </button>
              <button onClick={handleLogout}>Wyloguj</button>
            </nav>

            {activeTab === 'home' ? (
              <div>
                <h2>Witaj w systemie!</h2>
                <p>To jest widok główny FuelMate.</p>
                
                <button 
                  onClick={() => setIsAlertModalOpen(true)} 
                  style={{ 
                    backgroundColor: '#ff4b4b', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}
                >
                  Zgłoś zagrożenie drogowe
                </button>

                <AlertModal 
                  isOpen={isAlertModalOpen} 
                  onClose={() => setIsAlertModalOpen(false)} 
                  onAlertAdded={() => setRefreshMap(prev => prev + 1)} 
                />

                <MapView refreshTrigger={refreshMap} />
              </div>
            ) : (
              <UserProfile token={TEST_TOKEN} />
            )}
          </div>
        )}
      </div>
    </AuthContext.Provider>
  )
}

export default App