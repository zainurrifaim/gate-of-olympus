/**
 * This is the main script for the Gate of Olympus educational game.
 * It handles game state, logic, and orchestrates UI updates.
 */
import * as ui from './ui.js';
import { loadComponent, initializeNavbar, playSound, stopSound } from './utility.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Load components first, then initialize the game
    loadComponent('components/navbar.html', 'navbar-placeholder').then(() => {
        initializeNavbar();
    });
    
    // Make sure the game initializes after the footer is loaded
    // to ensure all elements are available.
    loadComponent('components/footer.html', 'footer-placeholder').then(() => {
        initializeGame();
    });
});

/**
 * Sets up the initial game state, gathers DOM elements, and attaches event listeners.
 */
function initializeGame() {
    // --- DOM ELEMENTS ---
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

    const handleWin = () => {
        playSound('sound-win');
        state.wins++;
        const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const prize = 150 + Math.floor(Math.random() * 10) * 10;
        state.credits += prize;
        elements.slots.forEach(slot => slot.textContent = winningSymbol);
        elements.winLoseMessage.textContent = `YOU WON ${prize}!`;
        elements.winLoseMessage.classList.add('win-message', 'text-green-400');
    };

    const handleLoss = () => {
        playSound('sound-lose');
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

        // --- 1. SETUP THE SPIN ---
        playSound('sound-click');
        playSound('sound-spin');
        state.isSpinning = true;
        state.spinCount++;
        state.credits -= COST_PER_SPIN;
        
        // --- 2. UPDATE UI FOR SPINNING STATE ---
        elements.winLoseMessage.textContent = '';
        ui.updateStatsDisplays(elements, state);
        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());

        // --- 3. START THE VISUAL SPINNING ---
        let spinInterval = setInterval(() => {
            elements.slots.forEach(slot => {
                slot.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                slot.classList.add('spinning');
            });
        }, 100);

        // --- 4. DETERMINE AND DISPLAY THE OUTCOME ---
        setTimeout(() => {
            clearInterval(spinInterval);
            stopSound('sound-spin');
            elements.slots.forEach(slot => slot.classList.remove('spinning'));

            const didWin = Math.random() < getCurrentWinOdds();

            if (didWin) {
                handleWin();
            } else {
                handleLoss();
            }
            
            // --- 5. CLEANUP AND RESET FOR NEXT SPIN ---
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
    elements.modalCloseButton.addEventListener('click', () => {
        playSound('sound-click');
        ui.hideModal(elements);
    });

    // --- INITIAL RENDER ---
    ui.updateStatsDisplays(elements, state);
    ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
    ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());
}