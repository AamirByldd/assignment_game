import { useState } from 'react'

type Props = {
  onSelect: (c: any, difficulty: string) => void
}

const cats = [
  { id: 9, name: 'General Knowledge' },
  { id: 11, name: 'Film' },
  { id: 12, name: 'Music' },
  { id: 15, name: 'Video Games' },
  { id: 17, name: 'Science & Nature' },
  { id: 21, name: 'Sports' },
  { id: 22, name: 'Geography' },
  { id: 23, name: 'History' },
]

const difficulties = ['easy', 'medium', 'hard']

function Home(props: Props) {
  const [difficulty, setDifficulty] = useState('easy')

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-5xl text-yellow-300 mb-2 font-semibold tracking-wide">Trivia Millionaire</h1>
        <p className="text-blue-100 mb-6 text-lg">Pick a difficulty and category to start</p>

        <div className="flex justify-center gap-3 mb-8">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={
                'px-5 py-2 rounded-full font-semibold border-2 transition ' +
                (difficulty === d
                  ? 'bg-yellow-300 text-slate-900 border-yellow-300'
                  : 'bg-transparent text-blue-100 border-blue-400 hover:bg-blue-400/15')
              }
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => props.onSelect(c, difficulty)}
              className="bg-white/5 border border-yellow-300/40 text-white px-4 py-4 rounded-lg text-left hover:bg-yellow-300/15 hover:border-yellow-300 hover:-translate-y-0.5 transition"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
