// script.js

let currentUnit = null;
let currentWords = [];
let currentWordData = null;
let remainingAttempts = 3;
let guessedWords = [];
let totalWords = 0;
let mistakesMade = false; // Flag to track if any mistakes were made
let testAnswers = []; // Array to store test answers
let currentTestIndex = 0; // Index to track current question in the test
let ranOutOfAttempts = false; // New flag to track if user ran out of attempts
let sbpressed = false; // Flag to check if Stuck Button is pressed

// Function to shuffle an array using the Fisher-Yates algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start the game for the selected unit with a random order of words
function startGame(unit) {
    hideAnswer();
    const completionMessageElement = document.getElementById('completion-message');
    if (completionMessageElement) {
        completionMessageElement.remove();  // Remove the completion message if it exists
    }
    document.getElementById('multi-unit-button').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    currentUnit = unit;
    generateWordBank([unit]);
    guessedWords = [];
    currentWords = shuffle([...units[unit]]); // Create a shuffled copy of the words
    totalWords = currentWords.length;
    mistakesMade = false; // Reset mistakes flag for new game
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    resetProgressBar(); // Reset progress bar at the start of the game
    loadNextWord();
}

// Start the game for multiple selected units
function startMultiUnitGame() {
    hideAnswer();
    const completionMessageElement = document.getElementById('completion-message');
    if (completionMessageElement) {
        completionMessageElement.remove();  // Remove the completion message if it exists
    }
    document.getElementById('multi-unit-button').style.display = 'none'; // Hide the multi-unit button
    document.getElementById('game-container').style.display = 'flex';
    const selectedUnits = Array.from(document.querySelectorAll('input[name="unit"]:checked')).map(cb => cb.value);
    if (selectedUnits.length === 0) {
        alert("Please select at least one unit.");
        return;
    }

    generateWordBank(selectedUnits);
    
    guessedWords = [];
    currentWords = [];
    
    // Combine words from selected units
    selectedUnits.forEach(unit => {
        currentWords = currentWords.concat(units[unit].map(word => ({...word, unit}))); // Track unit source
    });
    
    currentWords = shuffle(currentWords); // Shuffle the combined words
    totalWords = currentWords.length;
    mistakesMade = false; // Reset mistakes flag for new game
    document.getElementById('multi-unit-selection').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    resetProgressBar(); // Reset progress bar at the start of the game
    loadNextWord();
}

// Function to reset the checkboxes after submission or navigating to multi-unit selection
function resetCheckboxes() {
    const checkboxes = document.querySelectorAll('input[name="unit"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;  // Uncheck all checkboxes
    });
}

// Function to show the answer if the user is stuck
function showAnswer() {
    const answerElement = document.getElementById('answer');
    if (currentWordData) {
        answerElement.innerText = `Answer : ${currentWordData.word}`;
        answerElement.style.display = 'block';  // Show the answer
        document.getElementById('stuck-button').style.display = 'none';
        sbpressed = true;
    }
}

// Function to hide the answer
function hideAnswer() {
    const stuckbutton = document.getElementById('stuck-button');
    const answerElement = document.getElementById('answer');
    answerElement.style.display = 'none';  // Hide the answer
    stuckbutton.style.display = 'block';
}

function hideWordBank() {
    const wordBankContainer = document.getElementById('word-bank-container');
    wordBankContainer.style.display = 'none';  // Hide the Word Bank
}

function generateWordBank(selectedUnits) {
    const wordBankContainer = document.getElementById('word-bank-container');
    wordBankContainer.innerHTML = '';  // Clear any existing content
    
    selectedUnits.forEach(unit => {
        if (!units[unit]) {
            console.error(`Unit ${unit} not found in data.js`);
            return;  // Skip if the unit is not found in the data
        }

        // Create a title for each unit section
        const title = document.createElement('p');
        title.innerText = `Unit ${unit.replace('unit', '')}:`;  // Convert "unit1" to "Unit 1:"
        title.className = 'word-bank-title';
        wordBankContainer.appendChild(title);

        // Create a list to hold the words from the unit
        const wordList = document.createElement('ul');
        wordList.className = 'word-bank-list';

        units[unit].forEach(wordData => {
            const listItem = document.createElement('li');
            listItem.innerText = wordData.word;  // Add the word to the list item
            wordList.appendChild(listItem);
        });

        wordBankContainer.appendChild(wordList);  // Add the word list to the Word Bank container
    });

    wordBankContainer.style.display = 'block';  // Show the Word Bank
}

// Load the next word from the shuffled list
function loadNextWord() {
    if (guessedWords.length === totalWords) {
        if (currentUnit) {
            endSingleUnitGame();  // End single unit game
        } else {
            endMultiUnitGame();  // End multi-unit game
        }
        return;
    }
    
    currentWordData = currentWords.find(w => !guessedWords.includes(w.word));
    
    if (!currentWordData) {
        if (currentUnit) {
            endSingleUnitGame();  // End single unit game
        } else {
            endMultiUnitGame();  // End multi-unit game
        }
        return;
    }
    
    hideAnswer();

    currentWordData.incorrectGuesses = [];
    remainingAttempts = 3; // Reset attempts for new word
    document.getElementById('hint').innerText = currentWordData.hint;
    document.getElementById('guess').value = '';
    document.getElementById('guess').focus();
    document.getElementById('attempts').innerText = remainingAttempts;
    document.getElementById('message').innerText = ''; // Clear message
}

document.getElementById('guess').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const guess = event.target.value.trim().toLowerCase();
        if (guess) {
            makeGuess(guess);
        }
        event.target.value = '';
    }
});

document.getElementById('guess').addEventListener('input', function() {
    document.getElementById('message').innerText = ''; // Clear message when typing
});

// Handle the guess made by the user
function makeGuess(guess) {
    if (currentWordData.incorrectGuesses.includes(guess)) {
        document.getElementById('message').innerText = "You already guessed that word incorrectly!";
        return;
    }

    if (guess === currentWordData.word.toLowerCase()) {
        guessedWords.push(currentWordData.word);
        updateProgressBar();
        loadNextWord();
    } else {
        currentWordData.incorrectGuesses.push(guess);
        remainingAttempts--;
        document.getElementById('attempts').innerText = remainingAttempts;

        if (remainingAttempts === 0) {
            ranOutOfAttempts = true; // Set flag if user runs out of 
            mistakesMade = true;

            // Move the current word to the end of the currentWords array
            currentWords.push(currentWords.splice(currentWords.indexOf(currentWordData), 1)[0]);

            loadNextWord();
        }
    }
}

function updateProgressBar() {
    const progress = (guessedWords.length / totalWords) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
}

function resetProgressBar() {
    document.getElementById('progress-bar').style.width = '0%';
}

// End the game for a single unit
function endSingleUnitGame() {
    hideWordBank();
    const unitButton = document.getElementById(`${currentUnit}-button`);
    if (ranOutOfAttempts || sbpressed) {
        unitButton.style.backgroundColor = '#FFC000';
    } else {
        unitButton.style.backgroundColor = 'green';
    }
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('multi-unit-button').style.display = 'block';
    ranOutOfAttempts = false; // Reset flag for next game
    currentUnit = null;  // Clear the current unit
    sbpressed = false;
}

// End the game for multiple units
function endMultiUnitGame() {
    hideWordBank();
    // Extract unique units from the current words list and sort them in numerical order
    let completedUnits = [...new Set(currentWords.map(word => word.unit))]
                            .map(unit => parseInt(unit.replace('unit', '')))  // Convert unit strings to numbers
                            .sort((a, b) => a - b);  // Sort numerically
    
    // Construct the summary message with the correct format
    let message = `You completed Units ${completedUnits.join(" and ").replace(/ and ([^ and]+)$/, ", $1")}`;

    if (mistakesMade && sbpressed) {
        message += " with at least one mistake and hint.";
    } else if (mistakesMade) {
        message += " with at least one mistake.";
    } else if (sbpressed) {
        message += " using a hint.";
    } else {
        message += ".";
    }

    // Create and style the completion message element
    const completionMessageElement = document.createElement('p');
    completionMessageElement.id = "completion-message";  // Assign an ID for easy reference
    completionMessageElement.innerText = message;
    completionMessageElement.style.border = `3px solid ${mistakesMade || sbpressed ? 'yellow' : 'green'}`;
    completionMessageElement.style.padding = "5px";
    completionMessageElement.style.marginTop = "10px";
    completionMessageElement.style.display = "inline-block"; // Ensure the border only stretches to the text length
    
    // Insert the message below the "Review Multiple Units" button
    const multiUnitButton = document.getElementById('multi-unit-button');
    multiUnitButton.insertAdjacentElement('afterend', completionMessageElement);
    
    // Transition back to the main menu
    document.getElementById('multi-unit-button').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    
    // Reset for the next game
    ranOutOfAttempts = false;
    mistakesMade = false; // Reset mistakes flag
    currentUnit = null;  // Clear the current unit
    sbpressed = false;
}

function showMultiUnitSelection() {
    hideAnswer();
    const completionMessageElement = document.getElementById('completion-message');
    if (completionMessageElement) {
        completionMessageElement.remove();  // Remove the completion message if it exists
    }

    resetCheckboxes();
    document.getElementById('multi-unit-button').style.display = 'none';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('multi-unit-selection').style.display = 'block';
}

function showMainMenu() {
    hideAnswer();
    hideWordBank();
    const completionMessageElement = document.getElementById('completion-message');
    if (completionMessageElement) {
        completionMessageElement.remove();  // Remove the completion message if it exists
    }
    document.getElementById('multi-unit-button').style.display = 'flex';
    document.getElementById('multi-unit-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';

    document.getElementById('main-menu').style.display = 'flex';
    
    // Force a reflow by temporarily removing and re-adding the layout class
    const units = document.getElementById('units');
    units.style.display = 'none';
    units.offsetHeight; // Trigger reflow
    units.style.display = 'grid';
    
    // Recalculate layout
    document.getElementById('main-menu').style.display = 'flex';
}