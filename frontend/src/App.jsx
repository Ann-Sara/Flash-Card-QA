import { useState, useEffect } from 'react'
import { getDecks, createDeck, deleteDeck } from './api'
import DeckView from './DeckView'
import { Trash2 } from 'lucide-react'

function App() {
  const [decks, setDecks] = useState([])
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [newDeckName, setNewDeckName] = useState('')

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      const res = await getDecks()
      setDecks(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateDeck = async (e) => {
    e.preventDefault()
    if (!newDeckName.trim()) return
    try {
      await createDeck(newDeckName)
      setNewDeckName('')
      loadDecks()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteDeck = async (e, id) => {
    e.stopPropagation() // Prevent entering the deck
    if (!window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) return

    try {
      await deleteDeck(id)
      loadDecks()
    } catch (e) {
      console.error(e)
      alert('Failed to delete deck')
    }
  }

  if (selectedDeck) {
    return <DeckView deck={selectedDeck} onBack={() => { setSelectedDeck(null); loadDecks(); }} />
  }

  return (
    <div>
      <div className="background-mesh"></div>
      <header>
        <div className="logo">FlashMaster</div>
      </header>
      <main>
        <h1>Your Decks</h1>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {decks.map(deck => (
            <div key={deck.id} className="card-face" style={{ position: 'relative', width: '200px', height: '150px', cursor: 'pointer', padding: '20px', flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => setSelectedDeck(deck)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <h3>{deck.name}</h3>
                <button
                  className="btn icon-btn"
                  style={{ padding: '5px', width: '30px', height: '30px', minHeight: 'unset', background: 'rgba(255, 50, 50, 0.2)' }}
                  onClick={(e) => handleDeleteDeck(e, deck.id)}
                  title="Delete Deck"
                >
                  <Trash2 size={16} color="#ff6b6b" />
                </button>
              </div>
              <p style={{ fontSize: '1rem', marginTop: '10px', color: '#aaa' }}>{deck.cards ? deck.cards.length : '...'} cards</p>
            </div>
          ))}

          <div className="card-face" style={{ position: 'relative', width: '200px', height: '150px', borderStyle: 'dashed', padding: '20px', justifyContent: 'center' }}>
            <form onSubmit={handleCreateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <input
                placeholder="New Deck Name"
                value={newDeckName}
                onChange={e => setNewDeckName(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ padding: '8px', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn primary" onClick={e => e.stopPropagation()} style={{ padding: '8px', justifySelf: 'center' }}>Create</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
