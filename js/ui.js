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
    phaseModal: document.getElementById('phase-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalCloseButton: document.getElementById('modal-close-button'),
});

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
};

/**
 * Updates the spin button's state (enabled/disabled) and text.
 * @param {object} elements - The DOM elements object.
 * @param {object} state - The current game state object.
 * @param {number} costPerSpin - The cost of a single spin.
 */
export const updateSpinButtonState = (elements, state, costPerSpin) => {
    if (state.credits < costPerSpin) {
        elements.spinButton.disabled = true;
        elements.spinButton.textContent = 'INSUFFICIENT CREDITS';
    } else {
        elements.spinButton.disabled = state.isSpinning;
        elements.spinButton.textContent = `SPIN (COST: ${costPerSpin})`;
    }
};

/**
 * Updates the educational info panel based on the current game phase.
 * @param {object} elements - The DOM elements object.
 * @param {number} spinCount - The current number of spins.
 * @param {number} odds - The current win odds (0 to 1).
 */
export const updateEducationalInfo = (elements, spinCount, odds) => {
    elements.winOddsPercent.textContent = `${Math.round(odds * 100)}%`;
    
    elements.oddsDisplay.classList.remove('odds-display-hook', 'odds-display-transition', 'odds-display-house');

    if (spinCount < 5) {
        elements.oddsDisplay.classList.add('odds-display-hook');
        elements.oddsExplanation.innerHTML = "<strong>Phase 1: The Hook.</strong> Odds are high to make you feel like winning is easy.";
    } else if (spinCount < 10) {
        elements.oddsDisplay.classList.add('odds-display-transition');
        elements.oddsExplanation.innerHTML = "<strong>Phase 2: Transition.</strong> The odds have dropped significantly.";
        if(spinCount === 5) {
            elements.educationalMessage.innerHTML = "<strong>The odds just dropped!</strong> This subtle shift is designed to keep you playing.";
            showModal(elements, "Phase 2: Odds are Changing", "Win probability dropped from <strong>90% to 50%</strong>. Real games do this to make you chase your 'luck'.");
        }
    } else {
        elements.oddsDisplay.classList.add('odds-display-house');
        elements.oddsExplanation.innerHTML = "<strong>Phase 3: House Advantage.</strong> Odds are low, reflecting how real slots work.";
        if(spinCount === 10) {
            elements.educationalMessage.innerHTML = "<strong>The House Always Wins.</strong> With 20% odds, you are statistically expected to lose over time.";
            showModal(elements, "Phase 3: The House Advantage", "Win odds have plummeted to <strong>20%</strong>. This is the realistic phase where the house has a massive mathematical edge.");
        }
    }
};
