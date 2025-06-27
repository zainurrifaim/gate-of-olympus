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
        
        // --- REVISED PRIZE FORMULA ---
        // Prizes now range from 50 to 100
        const prize = 50 + Math.floor(Math.random() * 6) * 10; 
        
        state.credits += prize;
        
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
        elements.winLoseMessage.textContent = 'TRY AGAIN';
        elements.winLoseMessage.classList.remove('win-message', 'text-green-400', 'text-orange-400'); // Clear all colors
        elements.winLoseMessage.classList.add('text-red-500');
    };

    const handleSpin = () => {
        if (state.isSpinning || state.credits < COST_PER_SPIN) return;

        // 1. Setup for spin
        state.isSpinning = true;
        state.spinCount++;
        state.credits -= COST_PER_SPIN;
        playSound('sound-spin');
        
        elements.winLoseMessage.textContent = '';
        elements.winLoseMessage.classList.remove('text-green-400', 'text-red-500', 'text-orange-400');
        ui.updateStatsDisplays(elements, state);
        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());

        // 2. Start all slots spinning visually
        elements.slots.forEach(slot => {
            slot.classList.add('spinning');
        });
        const spinInterval = setInterval(() => {
            elements.slots.forEach(slot => {
                if (slot.classList.contains('spinning')) {
                    slot.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                }
            });
        }, 100);

        // 3. After a delay, begin the sequential reveal process
        setTimeout(() => {
            const didWin = Math.random() < getCurrentWinOdds();
            let finalSymbols = [];

            if (didWin) {
                const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                finalSymbols = [winningSymbol, winningSymbol, winningSymbol];
            } else {
                // Generate three unique symbols for a clear loss
                let symbolsCopy = [...SYMBOLS];
                let s1 = symbolsCopy.splice(Math.floor(Math.random() * symbolsCopy.length), 1)[0];
                let s2 = symbolsCopy.splice(Math.floor(Math.random() * symbolsCopy.length), 1)[0];
                let s3 = symbolsCopy.splice(Math.floor(Math.random() * symbolsCopy.length), 1)[0];
                finalSymbols = [s1, s2, s3];
            }

            // 4. Reveal slots one by one
            const revealDelay = 500; // Time in ms between each slot stop
            elements.slots.forEach((slot, index) => {
                setTimeout(() => {
                    slot.classList.remove('spinning');
                    slot.textContent = finalSymbols[index];
                    playSound('sound-click');

                    // If this is the last slot
                    if (index === elements.slots.length - 1) {
                        clearInterval(spinInterval);
                        stopSound('sound-spin');
                        
                        // Trigger win or loss logic
                        if (didWin) {
                            handleWin();
                        } else {
                            handleLoss();
                        }
                        
                        // Final state updates
                        state.isSpinning = false;
                        state.creditHistory.push(state.credits);
                        ui.updateStatsDisplays(elements, state);
                        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
                        
                        setTimeout(() => {
                            elements.winLoseMessage.classList.remove('win-message');
                        }, 1000);
                    }
                }, index * revealDelay);
            });

        }, 2000); // Wait 2 seconds before starting the reveal. Total spin time is now ~3 seconds.
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

    elements.playAgainButton.addEventListener('click', () => {
        playSound('sound-click');
        location.reload();
    });

    // --- INITIAL RENDER ---
    ui.updateStatsDisplays(elements, state);
    ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
    // CORRECTED THIS LINE
    ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());
}