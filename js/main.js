/**
 * This is the main script for the Gate of Olympus educational game.
 * It handles game state, logic, and orchestrates UI updates.
 */
import * as ui from './ui.js';
import { loadComponent, initializeNavbar } from './utility.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Load components first, then initialize the game
    loadComponent('components/navbar.html', 'navbar-placeholder').then(() => {
        initializeNavbar();
    });
    
    loadComponent('components/footer.html', 'footer-placeholder').then(() => {
        initializeGame();
    });
});

/**
 * Sets up the initial game state, gathers DOM elements, and attaches event listeners.
 */
function initializeGame() {
    const elements = ui.getDOMElements();
    const state = {
        credits: 1000,
        spinCount: 0,
        wins: 0,
        losses: 0,
        isSpinning: false,
    };
    const COST_PER_SPIN = 50;
    const SYMBOLS = ['⚡', '🏛️', '⭐', '💎', '🏆', '🔱'];

    const getCurrentWinOdds = () => {
        if (state.spinCount < 5) return 0.90;
        if (state.spinCount < 10) return 0.50;
        return 0.20;
    };

    const handleWin = () => {
        state.wins++;
        const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const prize = 150 + Math.floor(Math.random() * 10) * 10;
        state.credits += prize;
        elements.slots.forEach(slot => slot.textContent = winningSymbol);
        elements.winLoseMessage.textContent = `YOU WON ${prize}!`;
        elements.winLoseMessage.classList.add('win-message', 'text-green-400');
    };

    const handleLoss = () => {
        state.losses++;
        elements.slots[0].textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        elements.slots[1].textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        do {
            elements.slots[2].textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        } while (elements.slots[0].textContent === elements.slots[1].textContent && elements.slots[1].textContent === elements.slots[2].textContent);
        
        elements.winLoseMessage.textContent = 'TRY AGAIN';
        elements.winLoseMessage.classList.remove('win-message');
        elements.winLoseMessage.classList.add('text-red-500');
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
                handleWin();
            } else {
                handleLoss();
            }
            
            setTimeout(() => {
                elements.winLoseMessage.classList.remove('win-message');
            }, 1000);

            state.isSpinning = false;
            ui.updateStatsDisplays(elements, state);
            ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        }, 1500);
    };

    elements.spinButton.addEventListener('click', handleSpin);
    elements.modalCloseButton.addEventListener('click', () => ui.hideModal(elements));

    ui.updateStatsDisplays(elements, state);
    ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
    ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());
}