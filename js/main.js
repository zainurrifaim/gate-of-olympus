/**
 * This is the main script for the Gate of Olympus educational game.
 * It handles game state, logic, and orchestrates UI updates.
 */
import * as ui from './ui.js';
import { loadComponent, initializeNavbar, playSound, stopSound } from './utility.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENT GRABBING ---
    const entryOverlay = document.getElementById('entry-overlay');
    const entryButton = document.getElementById('entry-button');
    const introOverlay = document.getElementById('intro-overlay');
    const gameRoot = document.getElementById('game-root');

    // --- ENTRY SEQUENCE ---
    entryButton.addEventListener('click', () => {
        // 1. Fade out the entry button overlay
        entryOverlay.classList.add('hidden');

        // 2. Start the lightning animation and sound
        introOverlay.classList.remove('hidden');
        playSound('sound-lightning');

        // 3. After the intro animation finishes (e.g., 2.5 seconds)
        setTimeout(() => {
            // Fade out the intro overlay
            introOverlay.classList.add('hidden');
            
            // Fade in the main game content
            gameRoot.classList.remove('initially-hidden');
            gameRoot.classList.add('fade-in');

        }, 2500);
    }, { once: true }); // Ensure the click event only fires once


    // --- COMPONENT AND GAME LOADING ---
    // Load components first, then initialize the game
    loadComponent('components/navbar.html', 'navbar-placeholder').then(() => {
        initializeNavbar();
    });
    
    // Make sure the game initializes after the footer is loaded
    // to ensure all elements are available for the game logic.
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
        creditHistory: [1000], // Start with the initial credits
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
        // Trigger the lightning image animation
        elements.lightningOverlay.classList.add('active');
        
        playSound('sound-win');
        state.wins++;
        const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        
        // --- REVISED PRIZE FORMULA ---
        // Prizes now range from 50 to 100
        const prize = 50 + Math.floor(Math.random() * 6) * 10; 
        
        state.credits += prize;
        elements.slots.forEach(slot => slot.textContent = winningSymbol);
        
        // Check for a "loss disguised as a win"
        if (prize <= COST_PER_SPIN) {
            elements.winLoseMessage.textContent = `WIN: ${prize} (BUT YOU LOST CREDITS)`;
            elements.winLoseMessage.classList.add('win-message', 'text-orange-400');
        } else {
            elements.winLoseMessage.textContent = `YOU WON ${prize}!`;
            elements.winLoseMessage.classList.add('win-message', 'text-green-400');
        }


        // Remove the lightning class after the animation finishes (duration is 700ms in CSS)
        setTimeout(() => {
            elements.lightningOverlay.classList.remove('active');
        }, 700);
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
        elements.winLoseMessage.classList.remove('win-message', 'text-green-400', 'text-orange-400'); // Clear all colors
        elements.winLoseMessage.classList.add('text-red-500');
    };

    const handleSpin = () => {
        if (state.isSpinning || state.credits < COST_PER_SPIN) return;

        // 1. Setup the spin
        playSound('sound-click');
        playSound('sound-spin');
        state.isSpinning = true;
        state.spinCount++;
        state.credits -= COST_PER_SPIN;
        
        // 2. Update UI for spinning state
        elements.winLoseMessage.textContent = '';
        elements.winLoseMessage.classList.remove('text-green-400', 'text-red-500', 'text-orange-400');
        ui.updateStatsDisplays(elements, state);
        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());

        // 3. Start the visual spinning
        let spinInterval = setInterval(() => {
            elements.slots.forEach(slot => {
                slot.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                slot.classList.add('spinning');
            });
        }, 100);

        // 4. Determine and display the outcome
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
            
            // 5. Cleanup and reset for next spin
            setTimeout(() => {
                elements.winLoseMessage.classList.remove('win-message');
            }, 1000);

            state.isSpinning = false;
            state.creditHistory.push(state.credits); // Record credits after spin resolves
            ui.updateStatsDisplays(elements, state);
            ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        }, 1500);
    };

    const handleCashOut = () => {
        playSound('sound-click');
        elements.cashoutModal.classList.remove('hidden');

        const startingCredits = state.creditHistory[0];
        const finalCredits = state.credits;
        const netChange = finalCredits - startingCredits;
        const resultText = netChange >= 0 ? `profited <span class="text-green-400">${netChange}</span>` : `lost <span class="text-red-400">${Math.abs(netChange)}</span>`;

        elements.cashoutSummary.innerHTML = `You started with <strong>${startingCredits}</strong> credits and ended with <strong>${finalCredits}</strong>. Overall, you ${resultText} credits.`;

        // Disable game buttons
        elements.spinButton.disabled = true;
        elements.cashoutButton.disabled = true;
        
        // Render the chart
        ui.renderCreditsChart(elements, state.creditHistory);
    };

    // --- EVENT LISTENERS ---
    elements.spinButton.addEventListener('click', handleSpin);
    elements.cashoutButton.addEventListener('click', handleCashOut);
    elements.modalCloseButton.addEventListener('click', () => {
        playSound('sound-click');
        ui.hideModal(elements);
    });

    // REVISED: Event listener for the new "Play Again" button
    elements.playAgainButton.addEventListener('click', () => {
        playSound('sound-click');
        // The simplest and most effective way to reset the game to its initial state
        location.reload();
    });

    // --- INITIAL RENDER ---
    ui.updateStatsDisplays(elements, state);
    ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
    ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());
}