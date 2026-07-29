import { useState } from 'react'
import Home from './Home'
import Game from './Game'

function App() {
  const [page, setPage] = useState('home')
  const [chosen, setChosen] = useState<any>(null)
  const [difficulty, setDifficulty] = useState('easy')

  function startGame(cat: any, diff: string) {
    setChosen(cat)
    setDifficulty(diff)
    setPage('game')
  }

  function backHome() {
    setChosen(null)
    setPage('home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c2c66] via-[#0b1230] to-[#05082a] text-white">
      {page === 'home' && <Home onSelect={startGame} />}
      {page === 'game' && chosen && (
        <Game category={chosen} difficulty={difficulty} onExit={backHome} />
      )}
    </div>
  )
}

export default App
