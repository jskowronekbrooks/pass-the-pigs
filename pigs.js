// Odds

const gameScoring = { 'Razorback': 5, 'Trotter': 5, 'Snouter': 10, 'Leaning Jowler': 15, 'Double Dots': 1, 'Double No Dots': 1, 'Dot & No Dot': -1 }
const gameOdds = { 'Dot': 0.349, 'No Dot': 0.302, 'Razorback': 0.224, 'Trotter': 0.088, 'Snouter': 0.03, 'Leaning Jowler': 0.007 }

// IDs

const rollID = ['player0RollButton', 'player1RollButton', 'player2RollButton', 'player3RollButton']
const passID = ['player0PassButton', 'player1PassButton', 'player2PassButton', 'player3PassButton']
const playerID = ['player0', 'player1', 'player2', 'player3']
const handScore = ['player0HandScore', 'player1HandScore', 'player2HandScore', 'player3HandScore']
const totalScore = ['player0TotalScore', 'player1TotalScore', 'player2TotalScore', 'player3TotalScore']
const replayButton = 'replay'

// Classes

const backgroundDark = 'w3-dark-gray'
const backgroundLight = 'w3-light-gray'
const backgroundWin = 'w3-yellow'
const hide = 'w3-hide'
const show = 'w3-show'

// Other

let playerNumber = 0
const winningNumber = 50
const aiPlayerNum = 3

// Sets all buttons except for active player's roll button to inactive on page load
document.addEventListener('DOMContentLoaded', function () {
    for (let i = 1; i < 4; i++) {
        updateButton(i, rollID, false)
        updateButton(i, passID, false)
    }
    updateButton(0, rollID, true)
    updateButton(0, passID, false)

})

/////////////
// Backend //
/////////////

// Finds what the score is given a roll
function getScore(roll1, roll2, scoring = gameScoring) {
    let rollValue = 0

    //Check if both rolls are the same and high values: ie both rolls are 'Razorback'
    if ((roll1 in scoring) && (roll2 in scoring) && (roll1 == roll2)) {
        rollValue = (scoring[roll1] + scoring[roll2]) * 2
    }

    // Check if both rolls are high values but not the same
    else if ((roll1 in scoring) && (roll2 in scoring) && (roll1 !== roll2)) {
        rollValue = scoring[roll1] + scoring[roll2]
    }

    //Check if either roll isn't dot or no dot
    else if ((roll1 in scoring) && !(roll2 in scoring)) {
        rollValue = scoring[roll1]
    }
    else if ((roll2 in scoring) && !(roll1 in scoring)) {
        rollValue = scoring[roll2]
    }

    //Check if both roles are a dot or no dot and assigns rollValue accordingly 
    else if ((roll1 == roll2)) {
        rollValue = roll1 == 'Dot' ? scoring['Double Dots'] : scoring['Double No Dots']
    }

    //Only other combination possible is a dot and no dot
    else {
        rollValue = scoring['Dot & No Dot']
    }

    return rollValue
}

// Math to get random roll according to probabilities
function roll(odds) {
    let random = Math.random()
    for (let [value, probability] of Object.entries(odds)) {
        if (random < probability) {
            return value
        }
        random -= probability
    }
}

// Handles whether buttons are active or not
function handleActiveButtons(playerNum) {
    // Loops through each of the players
    for (let i of playerID) {
        // If the loop is on the active player, enable their roll but not their pass buttons
        if (i == `player${playerNum}`) {
            updateButton(playerID.indexOf(i), rollID, true)
            updateButton(playerID.indexOf(i), passID, false)
        }
        // Disable all other player's buttons
        else {
            updateButton(playerID.indexOf(i), rollID, false)
            updateButton(playerID.indexOf(i), passID, false)
        }
    }
}

// Handles game over logic
function gameOver(playerNum) {
    updateCSS(backgroundDark, backgroundWin, playerID[playerNum])
    updateCSS(hide, show, replayButton)
    disableAllButtons()
}


// Individual controll for enabling or disabling buttons given a player, the roll or pass button, and a state (enabled or disabled)
function updateButton(player, element, enabled) {
    let buttonElement = document.getElementById(element[playerID.indexOf(`player${player}`)])

    if (enabled) {
        buttonElement.disabled = false
    }
    else {
        buttonElement.disabled = true
    }
}

function disableAllButtons() {
    for (let i = 0; i < playerID.length; i++) {
        updateButton(i, rollID, false)
        updateButton(i, passID, false)
    }
}

// Makes changes to an element's css
function updateCSS(initial, updated, id, removeOnly) {
    if (removeOnly) {
        document.getElementById(id).classList.remove(initial)
    }
    else {
        document.getElementById(id).classList.remove(initial)
        document.getElementById(id).classList.add(updated)
    }
}

//////////////
// Frontend //
//////////////

// Handles running the AI
function ai() {
    // Random value for times it will try to roll
    let timesToRoll = Math.floor(Math.random() * 5) + 1
    let shouldChangePlayer = true

    // Tries to roll timesToRoll times
    for (let i = 0; i < timesToRoll; i++) {
        // Overrides the buttons being enabled by the rollPigs function
        updateButton(aiPlayerNum, rollID, false)
        updateButton(aiPlayerNum, passID, false)

        let score = rollPigs(aiPlayerNum)
        // Checks whether the AI Pigs Out or won the game
        if (score == 'po' || score == 'over') {
            shouldChangePlayer = false
            break
        }
    }

    // If they complete a turn without pigging out or winning, change player
    if (shouldChangePlayer) {
        changeActivePlayer(aiPlayerNum)
    }
}

// Resets the game after replay button is pressed
function reset() {
    updateCSS(show, hide, replayButton)
    // Loops through each of the players
    for (let i = 0; i < playerID.length; i++) {
        let score = document.getElementById(handScore[i])
        let total = document.getElementById(totalScore[i])

        // Resets each of the player's score and total scores
        score.textContent = 'Score:'
        total.textContent = 'Total score:'

        // Makes each of the player's backgrounds light except for player 0 (the new active player)
        if (i == 0) {
            updateCSS(backgroundLight, backgroundDark, playerID[i])
        }
        else {
            updateCSS(backgroundDark, backgroundLight, playerID[i])
        }
        updateCSS(backgroundWin, null, playerID[i], true)
        // Changes the pig state of each of the player's to '/'
        document.getElementById(`player${i}Pig1`).innerHTML = `/`
        document.getElementById(`player${i}Pig2`).innerHTML = `/`
    }

    // Activates the buttons for player 0
    handleActiveButtons(0)
}

function rollPigs(playerNum) {
    let firstRoll = roll(gameOdds)
    let secondRoll = roll(gameOdds)
    let score = getScore(firstRoll, secondRoll)

    // Gets both the score and total score elements for the active player and sees if they have outstanding score values
    let scoreElement = document.getElementById(handScore[playerNum])
    let previousScore = parseInt(scoreElement.textContent.replace("Score: ", ""))
    let totalScoreElement = document.getElementById(totalScore[playerNum])
    let totalScoreValue = parseInt(totalScoreElement.textContent.replace('Total score: ', ''))

    updateButton(playerNum, passID, true)

    // Assigns the roll to the correct player
    document.getElementById(`player${playerNum}Pig1`).innerHTML = firstRoll
    document.getElementById(`player${playerNum}Pig2`).innerHTML = secondRoll

    // Updates scoring logic
    // Avoids NaN errors
    if (isNaN(totalScoreValue)) {
        totalScoreValue = 0
    }

    if (!previousScore) {
        previousScore = 0
    }

    let newScore = previousScore + score

    // Updates score if there is a score
    if (score > 0) {
        scoreElement.textContent = `Score: ${newScore}`
    }
    // Else pig out
    else {
        scoreElement.textContent = 'PIG OUT!'
        changeActivePlayer(playerNum)
        return 'po'
    }

    // Check to see if a player won
    if ((totalScoreValue + newScore) >= winningNumber) {
        gameOver(playerNum)
        return 'over'
    }
}

// Increments player
function changeActivePlayer(playerNum) {
    let handScoreElement = document.getElementById(handScore[playerNum])
    let handScoreValue = parseInt(handScoreElement.textContent.replace('Score: ', ''))
    let totalScoreElement = document.getElementById(totalScore[playerNum])
    let totalScoreValue = parseInt(totalScoreElement.textContent.replace('Total score: ', ''))

    // Handles NaN values
    if (isNaN(totalScoreValue)) {
        totalScoreValue = ''
    }

    // Pushes new score if there is a score in the hand
    if (isNaN(handScoreValue)) {
        totalScoreElement.textContent = `Total score: ${totalScoreValue}`
    }
    else {
        if (totalScoreValue == '' && !isNaN(handScoreValue)) {
            totalScoreElement.textContent = `Total score: ${handScoreValue}`
            handScoreElement.textContent = `Score:`
        }
        else {
            totalScoreElement.textContent = `Total score: ${totalScoreValue + handScoreValue}`
            handScoreElement.textContent = `Score:`
        }
    }

    // Changes the active player's background to light
    updateCSS(backgroundDark, backgroundLight, playerID[playerNum])

    // Catches if the last player is active, and assigns it so that player 0 is active when incremented
    if (playerNum == 3) {
        playerNum = -1
    }
    playerNum++

    // Runs the AI player on player 3
    if (playerNum == 3) {
        updateCSS(backgroundLight, backgroundDark, playerID[playerNum])
        ai()
    }

    // Handles buttons and makes active player background dark
    else {
        updateCSS(backgroundLight, backgroundDark, playerID[playerNum])
        handleActiveButtons(playerNum)
    }
}

function handleClick(id) {
    // Checks if the input is from a roll button
    if (rollID.includes(id)) {
        playerNumber = rollID.indexOf(id)
        rollPigs(playerNumber)
    }

    // Or if it is from a pass button
    else if (passID.includes(id)) {
        playerNumber = passID.indexOf(id)
        changeActivePlayer(playerNumber)
    }

    // Only other possible option is the reset button
    else {
        reset()
    }
}