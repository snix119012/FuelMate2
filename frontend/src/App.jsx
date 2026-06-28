import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'
import UserProfile from './UserProfile'
import { TEST_TOKEN } from './test-token'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

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
            </div>
          ) : (
            <UserProfile token={TEST_TOKEN} />
          )}
        </div>
      )}
    </div>
  )
}

export default App
