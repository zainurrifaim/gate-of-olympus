document.addEventListener('DOMContentLoaded', () => {

    // --- EXPANDED QUIZ DATA WITH CATEGORIES ---
    const quizData = {
        "Gambling Myths & Signs": [
            {
                question: "If a slot machine hasn't paid out in a while, it is 'due' for a win.",
                options: ["True", "False"],
                correctAnswer: "False",
                explanation: "Every spin is random and independent, determined by an RNG. Past results have no impact on future outcomes."
            },
            {
                question: "What is 'Chasing Losses' in the context of gambling?",
                options: ["Winning back the money you've lost", "Betting more to recover previous losses", "Cashing out your winnings", "Playing with house money"],
                correctAnswer: "Betting more to recover previous losses",
                explanation: "Chasing losses is a dangerous behavior where a player increases their bets to try and win back money they've lost, often leading to bigger losses."
            },
            {
                question: "Which of these is a potential sign of gambling addiction?",
                options: ["Feeling the need to hide your gambling from others", "Setting a budget and sticking to it", "Gambling for entertainment", "Stopping when it's no longer fun"],
                correctAnswer: "Feeling the need to hide your gambling from others",
                explanation: "Secrecy, guilt, and an inability to control the impulse to gamble are classic signs of a gambling problem."
            },
            {
                question: "What is the 'Gambler's Fallacy'?",
                options: ["The belief that a winning streak will last forever", "The belief that if something happens frequently now, it will happen less frequently later", "The belief that you can control a game of chance", "The belief that the casino is cheating"],
                correctAnswer: "The belief that if something happens frequently now, it will happen less frequently later",
                explanation: "The Gambler's Fallacy is the mistaken belief that past events can influence the outcome of future random events. For example, believing a coin is 'due' for heads after many tails."
            }
        ],
        "The Math of Slots": [
            {
                question: "What does RTP (Return to Player) of 96% guarantee?",
                options: ["You will win 96% of the time", "For every $100 bet, you get exactly $96 back", "The machine pays back 96% of all money wagered over millions of spins", "The casino only makes a 4% profit from you"],
                correctAnswer: "The machine pays back 96% of all money wagered over millions of spins",
                explanation: "RTP is a long-term statistical average, not a guarantee for any single session. Your short-term results can vary wildly."
            },
            {
                question: "What does 'volatility' or 'variance' in a slot game refer to?",
                options: ["How popular the game is", "The risk level: how often and how much a game pays out", "The speed of the spinning reels", "The number of symbols on the reels"],
                correctAnswer: "The risk level: how often and how much a game pays out",
                explanation: "High volatility means bigger but less frequent wins. Low volatility means smaller but more frequent wins."
            },
             {
                question: "Who does the 'House Edge' always favor in the long run?",
                options: ["The Player", "The Casino / Operator", "It's evenly split", "The last person to win a jackpot"],
                correctAnswer: "The Casino / Operator",
                explanation: "The House Edge is the built-in mathematical advantage that ensures the casino is profitable over the long term."
            },
            {
                question: "If a game has a 95% RTP, and you bet $100 in a single session, what are you guaranteed to get back?",
                options: ["$95", "At least $90", "$105 if you are lucky", "Nothing is guaranteed"],
                correctAnswer: "Nothing is guaranteed",
                explanation: "RTP is a long-term average. In any given session, you could win a large amount or lose your entire bet. There are no guarantees."
            }
        ],
        "Psychological Tricks": [
            {
                question: "What are 'losses disguised as wins'?",
                options: ["Winning a jackpot", "Winning back exactly your bet amount", "A payout that is less than your original bet", "A near-miss on the reels"],
                correctAnswer: "A payout that is less than your original bet",
                explanation: "Slots use celebratory effects even for wins smaller than your bet, tricking your brain into feeling like you're winning when you're actually losing money."
            },
            {
                question: "Why are 'near-misses' (e.g., two jackpot symbols and one just off) so powerful?",
                options: ["They signal the machine is about to pay out", "They are completely meaningless", "They frustrate players into quitting", "They trigger a similar brain response to a real win, encouraging more play"],
                correctAnswer: "They trigger a similar brain response to a real win, encouraging more play",
                explanation: "The brain's reward system can activate during a near-miss, releasing dopamine and creating a powerful urge to spin again."
            },
            {
                question: "The use of flashing lights and exciting sounds after a win is designed to:",
                options: ["Annoy other players", "Signal that the machine needs maintenance", "Create a memorable, rewarding experience that reinforces the desire to play", "Help you count your money"],
                correctAnswer: "Create a memorable, rewarding experience that reinforces the desire to play",
                explanation: "This sensory feedback is a form of positive reinforcement, making the act of gambling more appealing and memorable, regardless of the amount won."
            }
        ]
    };

    // --- DOM ELEMENTS ---
    const quizTitle = document.getElementById('quiz-title');
    const quizContainer = document.getElementById('quiz-container');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // --- STATE ---
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // --- FUNCTIONS ---

    /**
     * Renders the initial category selection screen.
     */
    function renderCategorySelector() {
        quizTitle.textContent = 'Choose a Category';
        quizContainer.innerHTML = '';
        progressContainer.classList.add('hidden');

        const categoriesGrid = document.createElement('div');
        categoriesGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

        for (const category in quizData) {
            const categoryButton = document.createElement('button');
            categoryButton.className = 'quiz-option p-6 rounded-lg text-center h-32 flex items-center justify-center font-cinzel font-bold text-xl';
            categoryButton.textContent = category;
            categoryButton.onclick = () => startQuiz(category);
            categoriesGrid.appendChild(categoryButton);
        }
        quizContainer.appendChild(categoriesGrid);
    }
    
    /**
     * Starts the quiz for a given category.
     * @param {string} category - The key for the chosen category in quizData.
     */
    function startQuiz(category) {
        currentQuestions = quizData[category];
        currentQuestionIndex = 0;
        score = 0;
        quizTitle.textContent = category;
        progressContainer.classList.remove('hidden');
        renderQuestion();
    }

    /**
     * Renders the current question or the final results screen.
     */
    function renderQuestion() {
        quizContainer.innerHTML = '';

        const totalQuestions = currentQuestions.length;
        const progressPercent = ((currentQuestionIndex) / totalQuestions) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;

        if (currentQuestionIndex >= totalQuestions) {
            renderResults();
            return;
        }

        const questionData = currentQuestions[currentQuestionIndex];
        
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block mb-8';

        const questionText = document.createElement('p');
        questionText.className = 'text-lg md:text-xl font-bold mb-4 text-center';
        questionText.textContent = questionData.question;

        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

        questionData.options.forEach(optionText => {
            const optionButton = document.createElement('button');
            optionButton.className = 'quiz-option p-4 rounded-lg text-left';
            optionButton.textContent = optionText;
            optionButton.onclick = () => handleOptionSelect(optionButton, optionText, questionData);
            optionsGrid.appendChild(optionButton);
        });

        questionBlock.appendChild(questionText);
        questionBlock.appendChild(optionsGrid);
        quizContainer.appendChild(questionBlock);
    }

    /**
     * Handles the user's selection of an answer.
     */
    function handleOptionSelect(selectedButton, selectedAnswer, questionData) {
        const allOptions = quizContainer.querySelectorAll('.quiz-option');
        let isCorrect = selectedAnswer === questionData.correctAnswer;

        if(isCorrect) {
            score++;
        }

        allOptions.forEach(button => {
            button.disabled = true;
            if (button.textContent === questionData.correctAnswer) {
                button.classList.add('correct');
            }
        });

        selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');

        const explanationBox = document.createElement('div');
        explanationBox.className = 'explanation-box mt-4 p-4 rounded-lg';
        explanationBox.innerHTML = `
            <p class="font-bold">${isCorrect ? "Correct!" : "Not Quite."}</p>
            <p>${questionData.explanation}</p>
        `;
        quizContainer.querySelector('.question-block').appendChild(explanationBox);

        const nextButton = document.createElement('button');
        nextButton.id = 'next-button';
        nextButton.className = 'spin-button mt-6 w-full py-3 text-xl font-bold rounded-lg';
        nextButton.textContent = currentQuestionIndex === currentQuestions.length - 1 ? 'Show Results' : 'Next Question →';
        nextButton.onclick = () => {
            currentQuestionIndex++;
            renderQuestion();
        };
        quizContainer.appendChild(nextButton);
    }
    
    /**
     * Renders the final results screen after the quiz is complete.
     */
    function renderResults() {
        progressBar.style.width = `100%`;
        progressText.textContent = 'Quiz Complete!';
        
        const finalScore = (score / currentQuestions.length) * 100;

        quizContainer.innerHTML = `
            <div class="text-center">
                <h3 class="font-cinzel text-2xl md:text-3xl text-yellow-300">Quiz Results</h3>
                <p class="text-4xl md:text-5xl font-bold my-4">${Math.round(finalScore)}%</p>
                <p class="text-lg">You scored ${score} out of ${currentQuestions.length}.</p>
                <p class="mt-4 opacity-90">Knowledge is your best defense. The more you understand the math and psychology behind these games, the safer you'll be.</p>
                <div class="mt-8 space-y-4 md:space-y-0 md:space-x-4">
                    <button id="retry-quiz-button" class="spin-button inline-block px-8 py-3 text-xl font-bold rounded-lg">Try Another Quiz</button>
                </div>
            </div>
        `;

        document.getElementById('retry-quiz-button').onclick = renderCategorySelector;
    }

    // --- INITIAL RENDER ---
    renderCategorySelector();
});