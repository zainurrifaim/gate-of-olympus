/**
 * This is the main script for the Gate of Olympus educational game.
 * It handles game state, logic, and orchestrates UI updates.
 */
import * as ui from './ui.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Load components first, then initialize the game
    loadComponent('components/navbar.html', 'navbar-placeholder');
    loadComponent('components/footer.html', 'footer-placeholder').then(() => {
        // Now that the footer is loaded, we can be sure all elements exist
        initializeGame();
    });
});

/**
 * Fetches HTML content from a file and injects it into a placeholder element.
 * @param {string} url - The URL of the HTML component to fetch.
 * @param {string} placeholderId - The ID of the element to inject the HTML into.
 * @returns {Promise} A promise that resolves when the component is loaded.
 */
async function loadComponent(url, placeholderId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Could not load ${url}: ${response.statusText}`);
        }
        const text = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = text;
        } else {
            console.error(`Placeholder with ID #${placeholderId} not found.`);
        }
    } catch (error) {
        console.error(`Error loading component: ${error}`);
    }
}


/**
 * Sets up the initial game state, gathers DOM elements, and attaches event listeners.
 */
function initializeGame() {
    // --- DOM ELEMENTS ---
    // We get the elements after the footer has been loaded to ensure they exist
    const elements = ui.getDOMElements();

    // --- GAME STATE ---
    const state = {
        credits: 1000,
        spinCount: 0,
        wins: 0,
        losses: 0,
        isSpinning: false,
    };

    // --- GAME CONSTANTS ---
    const COST_PER_SPIN = 50;
    const SYMBOLS = ['⚡', '🏛️', '⭐', '💎', '🏆', '🔱'];

    // --- GAME LOGIC ---
    const getCurrentWinOdds = () => {
        if (state.spinCount < 5) return 0.90;
        if (state.spinCount < 10) return 0.50;
        return 0.20;
    };

    const handleSpin = () => {
        if (state.isSpinning || state.credits < COST_PER_SPIN) return;

        state.isSpinning = true;
        state.spinCount++;
        state.credits -= COST_PER_SPIN;
        elements.winLoseMessage.textContent = '';
        ui.updateStatsDisplays(elements, state);
        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());

        let spinInterval = setInterval(() => {
            elements.slots.forEach(slot => {
                slot.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                slot.classList.add('spinning');
            });
        }, 100);

        setTimeout(() => {
            clearInterval(spinInterval);
            elements.slots.forEach(slot => slot.classList.remove('spinning'));

            const didWin = Math.random() < getCurrentWinOdds();

            if (didWin) {
                state.wins++;
                const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                const prize = 150 + Math.floor(Math.random() * 10) * 10;
                state.credits += prize;
                elements.slots.forEach(slot => slot.textContent = winningSymbol);
                elements.winLoseMessage.textContent = `YOU WON ${prize}!`;
                elements.winLoseMessage.classList.add('win-message', 'text-green-400');
            } else {
                state.losses++;
                elements.slots[0].textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                elements.slots[1].textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                do {
                    elements.slots[2].textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                } while (elements.slots[0].textContent === elements.slots[1].textContent && elements.slots[1].textContent === elements.slots[2].textContent);
                
                elements.winLoseMessage.textContent = 'TRY AGAIN';
                elements.winLoseMessage.classList.remove('win-message');
                elements.winLoseMessage.classList.add('text-red-500');
            }
            
            setTimeout(() => {
                elements.winLoseMessage.classList.remove('win-message');
            }, 1000);

            state.isSpinning = false;
            ui.updateStatsDisplays(elements, state);
            ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        }, 1500);
    };

    // --- EVENT LISTENERS ---
    elements.spinButton.addEventListener('click', handleSpin);
    elements.modalCloseButton.addEventListener('click', () => ui.hideModal(elements));

    // --- INITIAL RENDER ---
    ui.updateStatsDisplays(elements, state);
    ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
    ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());
}
