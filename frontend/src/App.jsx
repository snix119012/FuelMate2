import { useState } from 'react'
import AuthModal from './AuthModal'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div>
      <h1>FuelMate</h1>
      
      {!isLoggedIn ? (
        <AuthModal onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <div>
          <h2>Witaj w systemie!</h2>
          <button onClick={() => setIsLoggedIn(false)}>Wyloguj</button>
        </div>
      )}
    </div>
  )
}

export default App
