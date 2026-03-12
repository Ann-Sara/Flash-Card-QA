let cards = [];
let currentCardIndex = 0;
let fileHandle = null;
let currentDirHandle = null;
const FILE_NAME = 'flashcards.json';

// DOM Elements
const cardElement = document.getElementById('flashcard');
const questionEl = document.getElementById('card-question');
const answerEl = document.getElementById('card-answer');
const counterEl = document.getElementById('card-counter');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const btnAddModal = document.getElementById('btn-add-modal');
const modal = document.getElementById('add-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnAddCards = document.getElementById('btn-add-cards');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const btnSelectFolder = document.getElementById('btn-select-folder');
const btnSave = document.getElementById('btn-save');
const folderStatus = document.getElementById('folder-status');

// Initialize
updateCardDisplay();

// --- Event Listeners ---

// Flip Card
cardElement.addEventListener('click', () => {
    cardElement.classList.toggle('flipped');
});

// Navigation
btnNext.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent flip
    if (currentCardIndex < cards.length - 1) {
        currentCardIndex++;
        updateCardDisplay();
        resetFlip();
    }
});

btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentCardIndex > 0) {
        currentCardIndex--;
        updateCardDisplay();
        resetFlip();
    }
});

// Modal Controls
btnAddModal.addEventListener('click', () => {
    modal.classList.add('visible');
    // Reset inputs
    document.getElementById('input-question').value = '';
    document.getElementById('input-answer').value = '';
    document.getElementById('bulk-input').value = '';
});

btnCloseModal.addEventListener('click', () => {
    modal.classList.remove('visible');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('visible');
});

// Tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

// Add Cards Logic
btnAddCards.addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    let newCardsCount = 0;

    if (activeTab === 'single') {
        const q = document.getElementById('input-question').value.trim();
        const a = document.getElementById('input-answer').value.trim();
        if (q && a) {
            cards.push({ question: q, answer: a });
            newCardsCount = 1;
        }
    } else {
        const bulkText = document.getElementById('bulk-input').value.trim();
        if (bulkText) {
            const lines = bulkText.split('\n');
            lines.forEach(line => {
                if (line.includes('?')) {
                    const parts = line.split('?');
                    const q = parts[0].trim();
                    const a = parts.slice(1).join('?').trim(); // Join rest in case answer has ?
                    if (q && a) {
                        cards.push({ question: q, answer: a });
                        newCardsCount++;
                    }
                }
            });
        }
    }

    if (newCardsCount > 0) {
        modal.classList.remove('visible');
        // If we were at 0 cards, show the first one
        if (cards.length === newCardsCount) {
            currentCardIndex = 0;
        }
        updateCardDisplay();
        // Auto-save if folder is selected
        if (currentDirHandle) {
            saveCardsToDisk();
        } else {
            alert(`Added ${newCardsCount} cards! Select a folder to save them permanently.`);
        }
    }
});

// --- File System Access API ---

btnSelectFolder.addEventListener('click', async () => {
    try {
        currentDirHandle = await window.showDirectoryPicker();
        folderStatus.textContent = `Folder: ${currentDirHandle.name}`;
        btnSave.disabled = false;

        // Try to load existing file
        await loadCardsFromDisk();
    } catch (err) {
        console.error('Error selecting folder:', err);
        if (err.name === 'AbortError') return; // User cancelled

        alert('Could not open folder. \n\nNote: This feature requires a modern browser (Chrome/Edge/Opera). If you are opening the file directly (file://), some browsers may block this for security. \n\nTry installing a local server extension (e.g., "Web Server for Chrome") or checking your browser settings.');
    }
});

btnSave.addEventListener('click', async () => {
    if (!currentDirHandle) return;
    await saveCardsToDisk();
    alert('Saved successfully!');
});

async function saveCardsToDisk() {
    try {
        const fileHandle = await currentDirHandle.getFileHandle(FILE_NAME, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(cards, null, 2));
        await writable.close();
        console.log('Saved to disk');
    } catch (err) {
        console.error('Error saving file:', err);
        alert('Failed to save file. See console for details.');
    }
}

async function loadCardsFromDisk() {
    try {
        const fileHandle = await currentDirHandle.getFileHandle(FILE_NAME, { create: false });
        const file = await fileHandle.getFile();
        const text = await file.text();
        const loadedCards = JSON.parse(text);

        if (Array.isArray(loadedCards) && loadedCards.length > 0) {
            cards = loadedCards;
            currentCardIndex = 0;
            updateCardDisplay();
            console.log('Loaded cards from disk');
        } else {
            console.log('File found but empty or invalid format');
        }
    } catch (err) {
        // File likely doesn't exist yet, which is fine
        console.log('No existing flashcards.json found in this folder. Created new session.');
    }
}

// --- Helpers ---

function updateCardDisplay() {
    if (cards.length === 0) {
        questionEl.textContent = "No cards available.";
        answerEl.textContent = "Add some cards to begin!";
        counterEl.textContent = "0 / 0";
        return;
    }

    const card = cards[currentCardIndex];
    questionEl.textContent = card.question;
    answerEl.textContent = card.answer;
    counterEl.textContent = `${currentCardIndex + 1} / ${cards.length}`;
}

function resetFlip() {
    cardElement.classList.remove('flipped');
}
