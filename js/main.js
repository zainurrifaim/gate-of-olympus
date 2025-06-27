/**
 * This is the main script for the Gate of Olympus educational game.
 * It handles game state, logic, and orchestrates UI updates.
 */
import * as ui from './ui.js';
import { loadComponent, initializeNavbar, playSound, stopSound } from './utility.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    
    const entryOverlay = document.getElementById('entry-overlay');
    const entryButton = document.getElementById('entry-button');
    const introOverlay = document.getElementById('intro-overlay');
    const gameRoot = document.getElementById('game-root');

    entryButton.addEventListener('click', () => {
        entryOverlay.classList.add('hidden');
        introOverlay.classList.remove('hidden');
        playSound('sound-lightning');

        setTimeout(() => {
            introOverlay.classList.add('hidden');
            gameRoot.classList.remove('initially-hidden');
            gameRoot.classList.add('fade-in');
        }, 2500);
    }, { once: true });


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
    // --- DOM ELEMENTS ---
    const elements = ui.getDOMElements();
    const reelTracks = [
        document.getElementById('reel1-track'),
        document.getElementById('reel2-track'),
        document.getElementById('reel3-track'),
    ];

    // --- GAME STATE ---
    const state = {
        credits: 1000,
        spinCount: 0,
        wins: 0,
        losses: 0,
        isSpinning: false,
        creditHistory: [1000],
    };

    // --- GAME CONSTANTS ---
    const COST_PER_SPIN = 50;
    const SYMBOLS = ['⚡', '🏛️', '⭐', '💎', '🏆', '🔱'];
    const REEL_LENGTH = 30; // Number of symbols on each reel track
    let symbolHeight = 0; // Will be calculated after populating reels

    // --- GAME LOGIC ---

    /**
     * Populates the reel tracks with random symbols.
     */
    function populateReels() {
        reelTracks.forEach(track => {
            track.innerHTML = ''; // Clear existing symbols
            for (let i = 0; i < REEL_LENGTH; i++) {
                const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'reel-symbol';
                symbolDiv.textContent = symbol;
                track.appendChild(symbolDiv);
            }
        });
        // Calculate symbol height for positioning
        const firstSymbol = reelTracks[0].querySelector('.reel-symbol');
        if (firstSymbol) {
            symbolHeight = firstSymbol.offsetHeight;
        }
    }
    
    const getCurrentWinOdds = () => {
        if (state.spinCount < 5) return 0.90;
        if (state.spinCount < 10) return 0.50;
        return 0.20;
    };

    const handleWin = () => {
        // Sound and lightning are now handled immediately when reel stops
        state.wins++;
        
        const prize = 50 + Math.floor(Math.random() * 6) * 10; 
        state.credits += prize;
        
        if (prize <= COST_PER_SPIN) {
            elements.winLoseMessage.textContent = `WIN: ${prize} (BUT YOU LOST CREDITS)`;
            elements.winLoseMessage.classList.add('win-message', 'text-orange-400');
        } else {
            elements.winLoseMessage.textContent = `YOU WON ${prize}!`;
            elements.winLoseMessage.classList.add('win-message', 'text-green-400');
        }
    };

    const handleLoss = () => {
        // Sound is now handled immediately when reel stops
        state.losses++;
        elements.winLoseMessage.textContent = 'SO CLOSE!';
        elements.winLoseMessage.classList.remove('win-message', 'text-green-400', 'text-orange-400');
        elements.winLoseMessage.classList.add('text-red-500');
    };

    const handleSpin = () => {
        if (state.isSpinning || state.credits < COST_PER_SPIN) return;

        state.isSpinning = true;
        state.spinCount++;
        state.credits -= COST_PER_SPIN;
        
        // --- FIXED SOUND HANDLING - Only play spin sound once ---
        playSound('sound-spin');
        
        elements.winLoseMessage.textContent = '';
        elements.winLoseMessage.classList.remove('text-green-400', 'text-red-500', 'text-orange-400');
        ui.updateStatsDisplays(elements, state);
        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
        ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());

        reelTracks.forEach(track => {
            track.style.transition = 'none';
            track.style.transform = `translateY(-${Math.random() * 1000}px)`;
            track.classList.add('spinning');
        });
        
        setTimeout(() => {
            reelTracks.forEach(track => {
                track.style.transition = 'transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)';
            });
        }, 100);

        const didWin = Math.random() < getCurrentWinOdds();
        const stopPositions = [];
        let targetSymbols = [];

        if (didWin) {
            const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            targetSymbols = [winSymbol, winSymbol, winSymbol];
        } else {
            const nearMissSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            let finalSymbol;
            do {
                finalSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            } while (finalSymbol === nearMissSymbol);
            targetSymbols = [nearMissSymbol, nearMissSymbol, finalSymbol];
        }

        reelTracks.forEach((track, i) => {
            const symbolsOnTrack = Array.from(track.children).map(s => s.textContent);
            let targetIndex = symbolsOnTrack.indexOf(targetSymbols[i], 10);
            if (targetIndex < 2) targetIndex = symbolsOnTrack.lastIndexOf(targetSymbols[i], REEL_LENGTH - 3);
            const position = -1 * (targetIndex - 1) * symbolHeight;
            stopPositions.push(position);
        });

        const stopDelays = [1500, 2500, 3500];
        
        reelTracks.forEach((track, index) => {
            setTimeout(() => {
                track.classList.remove('spinning');
                track.style.transform = `translateY(${stopPositions[index]}px)`;
                playSound('sound-click');

                if (index === reelTracks.length - 1) {
                    
                    // --- FIXED SOUND HANDLING - Stop spin sound when all reels stop ---
                    stopSound('sound-spin');
                    
                    // --- PLAY WIN/LOSE SOUND IMMEDIATELY ---
                    if (didWin) {
                        playSound('sound-win');
                        elements.lightningOverlay.classList.add('active');
                        setTimeout(() => {
                            elements.lightningOverlay.classList.remove('active');
                        }, 700);
                    } else {
                        playSound('sound-lose');
                    }
                    
                    const animationDuration = 1000;
                    setTimeout(() => {
                        if (didWin) {
                            handleWin();
                        } else {
                            handleLoss();
                        }
                        
                        state.isSpinning = false;
                        state.creditHistory.push(state.credits);
                        ui.updateStatsDisplays(elements, state);
                        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
                        
                        setTimeout(() => {
                            elements.winLoseMessage.classList.remove('win-message');
                        }, 1500);
                    }, animationDuration);
                }
            }, stopDelays[index]);
        });
    };

    const handleCashOut = () => {
        playSound('sound-click');
        elements.cashoutModal.classList.remove('hidden');

        const startingCredits = state.creditHistory[0];
        const finalCredits = state.credits;
        const netChange = finalCredits - startingCredits;
        const resultText = netChange >= 0 ? `profited <span class="text-green-400">${netChange}</span>` : `lost <span class="text-red-400">${Math.abs(netChange)}</span>`;

        elements.cashoutSummary.innerHTML = `You started with <strong>${startingCredits}</strong> credits and ended with <strong>${finalCredits}</strong>. Overall, you ${resultText} credits.`;

        elements.spinButton.disabled = true;
        elements.cashoutButton.disabled = true;
        
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
    populateReels();
    ui.updateStatsDisplays(elements, state);
    ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
    ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());
}