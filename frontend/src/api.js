import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

export const getDecks = () => api.get('decks/');
export const createDeck = (name) => api.post('decks/', { name });
export const deleteDeck = (id) => api.delete(`decks/${id}/`);
export const saveDeckToFile = (id) => api.post(`decks/${id}/save_to_file/`);

export const getCards = (deckId) => api.get(`cards/?deck=${deckId}`);
export const createCard = (card) => api.post('cards/', card);
export const deleteCard = (id) => api.delete(`cards/${id}/`);

export default api;
