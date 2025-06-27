/**
 * This is the main script for the Gate of Olympus educational game.
 * It handles game state, logic, and orchestrates UI updates.
 */
import * as ui from './ui.js';
import { loadComponent, initializeNavbar, playSound, stopSound } from './utility.js';
import { initI18n, getString, translatePage } from './i18n.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // Must initialize i18n first
    await initI18n();

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

    // Load components and then initialize the game
    await loadComponent('components/navbar.html', 'navbar-placeholder');
    initializeNavbar();
    await loadComponent('components/footer.html', 'footer-placeholder');
    translatePage();
    initializeGame();
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
        houseEarnings: 0,
        startTime: new Date(),
    };

    // --- GAME CONSTANTS ---
    const COST_PER_SPIN = 50;
    const SYMBOLS = ['⚡', '🏛️', '⭐', '💎', '🏆', '🔱'];
    const PAYOUTS = {
        '⚡': 250,
        '🏛️': 200,
        '⭐': 150,
        '💎': 100,
        '🏆': 75,
        '🔱': 50,
    };
    const REEL_LENGTH = 30; // Number of symbols on each reel track
    let symbolHeight = 0; // Will be calculated after populating reels
    const REALITY_CHECK_INTERVAL = 60000; // 1 minute

    // --- GAME LOGIC ---

    /**
     * Populates the reel tracks with random symbols.
     */
    function populateReels() {
        reelTracks.forEach(track => {
            track.innerHTML = '';
            for (let i = 0; i < REEL_LENGTH; i++) {
                const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'reel-symbol';
                symbolDiv.textContent = symbol;
                track.appendChild(symbolDiv);
            }
        });
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

    const handleWin = (winSymbol) => {
        state.wins++;
        const prize = PAYOUTS[winSymbol];
        state.credits += prize;
        state.houseEarnings -= prize;

        if (prize <= COST_PER_SPIN) {
            elements.winLoseMessage.innerHTML = `${getString('win_message_loss', { prize })} <br> <span class="ldw-indicator">${getString('loss_disguised_as_win')}</span>`;
            elements.winLoseMessage.classList.add('win-message', 'text-orange-400');
        } else {
            elements.winLoseMessage.textContent = `${getString('win_message_generic')} ${prize}!`;
            elements.winLoseMessage.classList.add('win-message', 'text-green-400');
        }
    };

    const handleLoss = () => {
        state.losses++;
        elements.winLoseMessage.textContent = getString('lose_message');
        elements.winLoseMessage.classList.remove('win-message', 'text-green-400', 'text-orange-400');
        elements.winLoseMessage.classList.add('text-red-500');
    };

    const handleSpin = () => {
        if (state.isSpinning || state.credits < COST_PER_SPIN) return;

        state.isSpinning = true;
        state.spinCount++;
        state.credits -= COST_PER_SPIN;
        state.houseEarnings += COST_PER_SPIN;
        
        // Animate House Earnings
        elements.houseEarningsDisplay.classList.add('animate-ping-once');
        setTimeout(() => {
            elements.houseEarningsDisplay.classList.remove('animate-ping-once');
        }, 1000);

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
        let winSymbol = null;

        if (didWin) {
            winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
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
                    
                    stopSound('sound-spin');
                    
                    if (didWin) {
                        playSound('sound-win');
                        elements.lightningOverlay.classList.add('active');
                        setTimeout(() => {
                            elements.lightningOverlay.classList.remove('active');
                        }, 700);
                    } else {
                        playSound('sound-lose');
                    }
                    
                    const animationDuration = 100;
                    setTimeout(() => {
                        if (didWin) {
                            handleWin(winSymbol);
                        } else {
                            handleLoss();
                        }
                        
                        state.isSpinning = false;
                        state.creditHistory.push(state.credits);
                        ui.updateStatsDisplays(elements, state);
                        ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
                        ui.updateDynamicEducationalMessage(elements, state);
                        
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
        
        const resultKey = netChange >= 0 ? 'cashout_profit' : 'cashout_loss';
        const resultText = getString(resultKey, { change: Math.abs(netChange) });

        elements.cashoutSummary.innerHTML = getString('cashout_summary', {
            start: startingCredits,
            end: finalCredits,
            result: resultText
        });

        elements.spinButton.disabled = true;
        elements.cashoutButton.disabled = true;
        
        ui.renderCreditsChart(elements, state.creditHistory);
    };

    const realityCheck = () => {
        const timeDiff = new Date() - state.startTime;
        const minutes = Math.floor(timeDiff / 60000);
        if (minutes < 1) return;

        const netChange = state.credits - 1000;
        const resultKey = netChange >= 0 ? 'cashout_profit' : 'cashout_loss';
        const resultText = getString(resultKey, { change: Math.abs(netChange) });
        
        const message = getString('reality_check_body', {
            minutes: minutes,
            s: getString('lang') === 'en' ? (minutes === 1 ? '' : 's') : '', // Handle plural 's' for English only
            result: resultText
        });
        ui.showRealityCheckModal(elements, message);
    };

    // --- EVENT LISTENERS ---
    elements.spinButton.addEventListener('click', handleSpin);
    elements.cashoutButton.addEventListener('click', handleCashOut);
    elements.modalCloseButton.addEventListener('click', () => {
        playSound('sound-click');
        ui.hideModal(elements);
    });
    elements.realityCheckCloseButton.addEventListener('click', () => {
        playSound('sound-click');
        ui.hideRealityCheckModal(elements);
    });
    elements.playAgainButton.addEventListener('click', () => {
        playSound('sound-click');
        location.reload();
    });

    // --- INITIAL RENDER ---
    populateReels();
    ui.displayPayouts(elements, PAYOUTS);
    ui.updateStatsDisplays(elements, state);
    ui.updateSpinButtonState(elements, state, COST_PER_SPIN);
    ui.updateEducationalInfo(elements, state.spinCount, getCurrentWinOdds());

    setInterval(realityCheck, REALITY_CHECK_INTERVAL);
}