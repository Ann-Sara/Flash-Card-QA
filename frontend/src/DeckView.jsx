import { useState, useEffect } from 'react'
import { getCards, createCard, saveDeckToFile, deleteCard } from './api'
import { ChevronLeft, ChevronRight, Plus, FolderDown, ArrowLeft, Trash2 } from 'lucide-react'

export default function DeckView({ deck, onBack }) {
    const [cards, setCards] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [tab, setTab] = useState('single') // single | bulk

    // Form states
    const [q, setQ] = useState('')
    const [a, setA] = useState('')
    const [bulk, setBulk] = useState('')

    useEffect(() => {
        loadCards()
    }, [deck])

    const loadCards = async () => {
        try {
            const res = await getCards(deck.id)
            setCards(res.data)
            setCurrentIndex(0)
            setIsFlipped(false)
        } catch (e) {
            console.error(e)
        }
    }

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setIsFlipped(false)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setIsFlipped(false)
        }
    }

    const handleAddCard = async () => {
        if (tab === 'single') {
            if (q && a) {
                await createCard({ deck: deck.id, question: q, answer: a })
                setQ(''); setA('')
            }
        } else {
            const lines = bulk.split('\n')
            for (let line of lines) {
                if (line.includes('?')) {
                    const parts = line.split('?')
                    const quest = parts[0].trim()
                    const ans = parts.slice(1).join('?').trim()
                    if (quest && ans) {
                        await createCard({ deck: deck.id, question: quest, answer: ans })
                    }
                }
            }
            setBulk('')
        }
        setShowModal(false)
        loadCards()
    }

    const handleSaveToFile = async () => {
        try {
            const res = await saveDeckToFile(deck.id)
            alert(`Saved to: ${res.data.path}`)
        } catch (e) {
            console.error(e)
            alert('Failed to save.')
        }
    }

    const handleDeleteCard = async (e) => {
        e.stopPropagation()
        if (!currentCard) return
        if (!window.confirm('Delete this card?')) return

        try {
            await deleteCard(currentCard.id)
            // Refresh logic: remove locally to avoid full reload flicker, or just reload. Reload is safer for sync.
            loadCards()
        } catch (e) {
            console.error(e)
            alert("Failed to delete card.")
        }
    }

    const currentCard = cards[currentIndex]

    return (
        <>
            <div className="background-mesh"></div>
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn icon-btn" onClick={onBack} title="Back to Decks"><ArrowLeft size={20} /></button>
                    <div className="logo">{deck.name}</div>
                </div>
                <div className="file-controls">
                    <span id="folder-status">{cards.length} Cards</span>
                    <button className="btn primary" onClick={handleSaveToFile}>
                        <FolderDown size={18} /> Save to File
                    </button>
                </div>
            </header>

            <main>
                <div className="card-container">
                    {cards.length > 0 ? (
                        <div
                            className={`card ${isFlipped ? 'flipped' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="card-face card-front" style={{ position: 'relative' }}>
                                <button
                                    className="btn icon-btn"
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        zIndex: 10,
                                        width: '36px',
                                        height: '36px',
                                        background: 'rgba(50,50,50,0.5)'
                                    }}
                                    onClick={handleDeleteCard}
                                    title="Delete Card"
                                >
                                    <Trash2 size={18} color="#ff6b6b" />
                                </button>
                                <div className="card-content">
                                    <h2>Question</h2>
                                    <p>{currentCard.question}</p>
                                </div>
                                <span className="card-hint">Click to flip</span>
                            </div>
                            <div className="card-face card-back" style={{ position: 'relative' }}>
                                <button
                                    className="btn icon-btn"
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        zIndex: 10,
                                        width: '36px',
                                        height: '36px',
                                        background: 'rgba(50,50,50,0.5)'
                                    }}
                                    onClick={handleDeleteCard}
                                    title="Delete Card"
                                >
                                    <Trash2 size={18} color="#ff6b6b" />
                                </button>
                                <div className="card-content">
                                    <h2>Answer</h2>
                                    <p>{currentCard.answer}</p>
                                </div>
                                <span className="card-hint">Click to flip</span>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-face">
                                <div className="card-content">
                                    <p>No cards yet. Add some!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="controls">
                    <button className="btn icon-btn" onClick={handlePrev} disabled={currentIndex === 0}>
                        <ChevronLeft />
                    </button>
                    <span id="card-counter">
                        {cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : '0 / 0'}
                    </span>
                    <button className="btn icon-btn" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
                        <ChevronRight />
                    </button>
                </div>

                <div className="action-buttons">
                    <button className="btn huge" onClick={() => setShowModal(true)}>
                        <Plus size={24} /> Add Cards
                    </button>
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setShowModal(false) }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Cards</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <div className="tabs">
                            <button className={`tab-btn ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>Single</button>
                            <button className={`tab-btn ${tab === 'bulk' ? 'active' : ''}`} onClick={() => setTab('bulk')}>Bulk</button>
                        </div>

                        {tab === 'single' ? (
                            <>
                                <div className="input-group">
                                    <label>Question</label>
                                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Enter question..." />
                                </div>
                                <div className="input-group">
                                    <label>Answer</label>
                                    <textarea value={a} onChange={e => setA(e.target.value)} placeholder="Enter answer..." />
                                </div>
                            </>
                        ) : (
                            <div className="input-group">
                                <label>Paste Questions ? Answers</label>
                                <textarea rows="10" value={bulk} onChange={e => setBulk(e.target.value)} placeholder="Q ? A" />
                            </div>
                        )}

                        <div className="modal-footer">
                            <button className="btn primary" onClick={handleAddCard}>Add Cards</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
