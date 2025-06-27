/**
 * This module handles all direct interactions with the DOM,
 * such as updating text content, changing styles, and showing/hiding elements.
 */

// --- DOM ELEMENT GETTERS ---
/**
 * Gathers and returns all necessary DOM elements for the game.
 * @returns {object} An object containing all required DOM elements.
 */
export const getDOMElements = () => ({
    spinButton: document.getElementById('spin-button'),
    cashoutButton: document.getElementById('cashout-button'),
    slots: [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')],
    creditsDisplay: document.getElementById('credits'),
    spinCountDisplay: document.getElementById('spin-count'),
    winsDisplay: document.getElementById('wins'),
    lossesDisplay: document.getElementById('losses'),
    winLoseMessage: document.getElementById('win-lose-message'),
    oddsDisplay: document.getElementById('odds-display'),
    winOddsPercent: document.getElementById('win-odds-percent'),
    oddsExplanation: document.getElementById('odds-explanation'),
    educationalMessage: document.getElementById('educational-message'),
    payoutsInfo: document.getElementById('payouts-info'),
    houseEarningsDisplay: document.getElementById('house-earnings'),
    phaseModal: document.getElementById('phase-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalCloseButton: document.getElementById('modal-close-button'),
    lightningOverlay: document.getElementById('lightning-overlay'),
    // Cashout Modal Elements
    cashoutModal: document.getElementById('cashout-modal'),
    cashoutSummary: document.getElementById('cashout-summary'),
    playAgainButton: document.getElementById('play-again-button'), // REVISED
    creditsChartCanvas: document.getElementById('credits-chart'),
    // Reality Check Modal Elements
    realityCheckModal: document.getElementById('reality-check-modal'),
    realityCheckBody: document.getElementById('reality-check-body'),
    realityCheckCloseButton: document.getElementById('reality-check-close-button'),
});

let creditsChart = null; // To hold the chart instance

/**
 * Renders or updates the credits history chart.
 * @param {object} elements - The DOM elements object.
 * @param {Array<number>} creditHistory - An array of credit values over time.
 */
export const renderCreditsChart = (elements, creditHistory) => {
    const ctx = elements.creditsChartCanvas.getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (creditsChart) {
        creditsChart.destroy();
    }

    const labels = creditHistory.map((_, index) => `Spin ${index}`);

    creditsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Credits',
                data: creditHistory,
                borderColor: '#ffd700', // Gold color
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                fill: true,
                tension: 0.1,
                pointBackgroundColor: '#ffd700',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#f0e6ff' // Light text color
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#f0e6ff' // Light text color
                    },
                     grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
};


// --- MODAL UI FUNCTIONS ---
/**
 * Shows the phase change modal with specific content.
 * @param {object} elements - The DOM elements object.
 * @param {string} title - The title for the modal.
 * @param {string} body - The main text content for the modal.
 */
export const showModal = (elements, title, body) => {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = body; // Use innerHTML to allow for <strong> tags
    elements.phaseModal.classList.remove('hidden');
};

/**
 * Hides the phase change modal.
 * @param {object} elements - The DOM elements object.
 */
export const hideModal = (elements) => {
    elements.phaseModal.classList.add('hidden');
};

/**
 * Shows the reality check modal.
 * @param {object} elements - The DOM elements object.
 * @param {string} body - The main text content for the modal.
 */
export const showRealityCheckModal = (elements, body) => {
    elements.realityCheckBody.innerHTML = body;
    elements.realityCheckModal.classList.remove('hidden');
};

/**
 * Hides the reality check modal.
 * @param {object} elements - The DOM elements object.
 */
export const hideRealityCheckModal = (elements) => {
    elements.realityCheckModal.classList.add('hidden');
};


// --- DISPLAY UPDATE FUNCTIONS ---
/**
 * Updates all the statistics displays (credits, spins, etc.).
 * @param {object} elements - The DOM elements object.
 * @param {object} state - The current game state object.
 */
export const updateStatsDisplays = (elements, state) => {
    elements.creditsDisplay.textContent = state.credits;
    elements.spinCountDisplay.textContent = state.spinCount;
    elements.winsDisplay.textContent = state.wins;
    elements.lossesDisplay.textContent = state.losses;
    elements.houseEarningsDisplay.textContent = state.houseEarnings;
};

/**
 * Updates the spin button's state (enabled/disabled) and text.
 * @param {object} elements - The DOM elements object.
 * @param {object} state - The current game state object.
 * @param {number} costPerSpin - The cost of a single spin.
 */
export const updateSpinButtonState = (elements, state, costPerSpin) => {
    const outOfCredits = state.credits < costPerSpin;
    elements.spinButton.disabled = state.isSpinning || outOfCredits;
    elements.cashoutButton.disabled = state.isSpinning;
    
    if (outOfCredits && !state.isSpinning) {
        elements.spinButton.textContent = 'INSUFFICIENT CREDITS';
    } else {
        elements.spinButton.textContent = `SPIN (COST: ${costPerSpin})`;
    }
};

/**
 * Displays the payout information.
 * @param {object} elements - The DOM elements object.
 * @param {object} payouts - The payout values for each symbol.
 */
export const displayPayouts = (elements, payouts) => {
    elements.payoutsInfo.innerHTML = '';
    for (const symbol in payouts) {
        const payoutDiv = document.createElement('div');
        payoutDiv.innerHTML = `<span>${symbol}</span> <span>${payouts[symbol]}</span>`;
        elements.payoutsInfo.appendChild(payoutDiv);
    }
};

// --- EDUCATIONAL INFO LOGIC ---
const phases = [
    {
        limit: 5,
        className: 'odds-display-hook',
        explanation: "<strong>Phase 1: The Hook.</strong> Odds are high to make you feel like winning is easy.",
        odds: 0.9,
    },
    {
        limit: 10,
        className: 'odds-display-transition',
        explanation: "<strong>Phase 2: Transition.</strong> The odds have dropped significantly.",
        educationalMessage: "<strong>The odds just dropped!</strong> This subtle shift is designed to keep you playing.",
        modalTitle: "Phase 2: Odds are Changing",
        modalBody: "Win probability dropped from <strong>90% to 50%</strong>. Real games do this to make you chase your 'luck'.",
        odds: 0.5,
    },
    {
        limit: Infinity,
        className: 'odds-display-house',
        explanation: "<strong>Phase 3: House Advantage.</strong> Odds are low, reflecting how real slots work.",
        educationalMessage: "<strong>The House Always Wins.</strong> With 20% odds, you are statistically expected to lose over time.",
        modalTitle: "Phase 3: The House Advantage",
        modalBody: "Win odds have plummeted to <strong>20%</strong>. This is the realistic phase where the house has a massive mathematical edge.",
        odds: 0.2,
    }
];

/**
 * Updates the educational info panel based on the current game phase.
 * @param {object} elements - The DOM elements object.
 * @param {number} spinCount - The current number of spins.
 * @param {number} odds - The current win odds (0 to 1).
 */
export const updateEducationalInfo = (elements, spinCount, odds) => {
    elements.winOddsPercent.textContent = `${Math.round(odds * 100)}%`;
    
    const currentPhase = phases.find(p => spinCount < p.limit);

    elements.oddsDisplay.classList.remove('odds-display-hook', 'odds-display-transition', 'odds-display-house');
    elements.oddsDisplay.classList.add(currentPhase.className);
    elements.oddsExplanation.innerHTML = currentPhase.explanation;

    // Trigger the educational modal only at the start of a new phase
    const previousPhase = phases[phases.indexOf(currentPhase) - 1];
    const newPhaseTriggerSpin = previousPhase ? previousPhase.limit : 0;

    if (currentPhase.modalTitle && spinCount === newPhaseTriggerSpin) {
        elements.educationalMessage.innerHTML = currentPhase.educationalMessage;
        showModal(elements, currentPhase.modalTitle, currentPhase.modalBody);
    }
};

/**
 * Updates the educational message with dynamic content based on game state.
 * @param {object} elements - The DOM elements object.
 * @param {object} state - The current game state object.
 */
export const updateDynamicEducationalMessage = (elements, state) => {
    if (state.losses > 3 && state.credits < 500) {
        elements.educationalMessage.innerHTML = "Feeling the urge to win back what you've lost? This is called 'chasing losses' and it's a common trap.";
    } else if (state.wins > 5) {
        elements.educationalMessage.innerHTML = "You're on a winning streak! It's easy to feel invincible, but remember each spin is random.";
    }
};