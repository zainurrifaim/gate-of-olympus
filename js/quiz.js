document.addEventListener('DOMContentLoaded', () => {

    // --- QUIZ DATA ---
    const quizData = [
        {
            question: "If a slot machine hasn't paid out in a while, it is 'due' for a win.",
            options: ["True", "False"],
            correctAnswer: "False",
            explanation: "Every spin is determined by a Random Number Generator (RNG), making it independent of past results. A machine is never 'due' for a win."
        },
        {
            question: "What is 'Chasing Losses' in the context of gambling?",
            options: ["Winning back the money you've lost", "Betting more to recover previous losses", "Cashing out your winnings", "Playing with house money"],
            correctAnswer: "Betting more to recover previous losses",
            explanation: "Chasing losses is a dangerous behavior where a player increases their bets to try and win back money they've lost, often leading to bigger losses."
        },
        {
            question: "What does RTP (Return to Player) of 96% guarantee?",
            options: ["You will win 96% of the time", "For every $100 bet, you get exactly $96 back", "The machine pays back 96% of wagers over millions of spins", "The casino only makes a 4% profit from you"],
            correctAnswer: "The machine pays back 96% of wagers over millions of spins",
            explanation: "RTP is a long-term statistical calculation. In any given session, your results can vary wildly and are not guaranteed."
        },
        {
            question: "Which of these is a potential sign of gambling addiction?",
            options: ["Feeling the need to hide your gambling from others", "Setting a budget and sticking to it", "Gambling for entertainment, not to make money", "Stopping when it's no longer fun"],
            correctAnswer: "Feeling the need to hide your gambling from others",
            explanation: "Secrecy, guilt, and an inability to control the impulse to gamble are classic signs of a gambling problem."
        },
        {
            question: "What are 'losses disguised as wins'?",
            options: ["Winning a jackpot", "Winning back exactly your bet amount", "A payout that is less than your original bet", "A near-miss on the reels"],
            correctAnswer: "A payout that is less than your original bet",
            explanation: "Slot machines use celebratory sounds and visuals even for wins smaller than your bet. This can trick your brain into feeling like you're winning, even when you're losing money overall."
        }
    ];

    // --- DOM ELEMENTS ---
    const quizContainer = document.getElementById('quiz-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // --- STATE ---
    let currentQuestionIndex = 0;
    let score = 0;

    // --- FUNCTIONS ---
    function renderQuestion() {
        // Clear previous question
        quizContainer.innerHTML = '';

        // Update progress
        const progressPercent = ((currentQuestionIndex) / quizData.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;


        if (currentQuestionIndex >= quizData.length) {
            renderResults();
            return;
        }

        const questionData = quizData[currentQuestionIndex];
        
        // Create question elements
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

    function handleOptionSelect(selectedButton, selectedAnswer, questionData) {
        const allOptions = quizContainer.querySelectorAll('.quiz-option');
        let isCorrect = selectedAnswer === questionData.correctAnswer;

        if(isCorrect) {
            score++;
        }

        // Disable all buttons after one is clicked
        allOptions.forEach(button => {
            button.disabled = true;
            // Reveal the correct answer
            if (button.textContent === questionData.correctAnswer) {
                button.classList.add('correct');
            }
        });

        // Mark the user's choice
        selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');

        // Show explanation
        const explanationBox = document.createElement('div');
        explanationBox.className = 'explanation-box mt-4 p-4 rounded-lg';
        explanationBox.innerHTML = `
            <p class="font-bold">${isCorrect ? "Correct!" : "Not Quite."}</p>
            <p>${questionData.explanation}</p>
        `;
        quizContainer.querySelector('.question-block').appendChild(explanationBox);

        // Add a "Next" button
        const nextButton = document.createElement('button');
        nextButton.id = 'next-button';
        nextButton.className = 'spin-button mt-6 w-full py-3 text-xl font-bold rounded-lg';
        nextButton.textContent = 'Next Question →';
        nextButton.onclick = () => {
            currentQuestionIndex++;
            renderQuestion();
        };
        quizContainer.appendChild(nextButton);
    }
    
    function renderResults() {
        progressBar.style.width = `100%`;
        progressText.textContent = 'Quiz Complete!';
        
        const finalScore = (score / quizData.length) * 100;

        quizContainer.innerHTML = `
            <div class="text-center">
                <h3 class="font-cinzel text-2xl md:text-3xl text-yellow-300">Quiz Results</h3>
                <p class="text-4xl md:text-5xl font-bold my-4">${Math.round(finalScore)}%</p>
                <p class="text-lg">You scored ${score} out of ${quizData.length}.</p>
                <p class="mt-4 opacity-90">Knowledge is your best defense against the risks of gambling. The more you understand the psychological tricks and mathematical realities, the safer you'll be.</p>
                <a href="index.html" class="spin-button inline-block px-8 py-3 text-xl font-bold rounded-lg mt-8">Back to Game</a>
            </div>
        `;
    }

    // --- INITIAL RENDER ---
    renderQuestion();
});


async function loadComponent(url, placeholderId) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        document.getElementById(placeholderId).innerHTML = text;
    } catch (error) {
        console.error(`Error loading component: ${error}`);
    }
}