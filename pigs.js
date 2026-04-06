// Odds

const gameScoring = { 'Razorback': 5, 'Trotter': 5, 'Snouter': 10, 'Leaning Jowler': 15, 'Double Dots': 1, 'Double No Dots': 1, 'Dot & No Dot': -1 }
const gameOdds = { 'Dot': 0.349, 'No Dot': 0.302, 'Razorback': 0.224, 'Trotter': 0.088, 'Snouter': 0.03, 'Leaning Jowler': 0.007 }

// IDs

const rollID = ['player0RollButton', 'player1RollButton', 'player2RollButton', 'player3RollButton']
const passID = ['player0PassButton', 'player1PassButton', 'player2PassButton', 'player3PassButton']
const playerID = ['player0', 'player1', 'player2', 'player3']
const handScore = ['player0HandScore', 'player1HandScore', 'player2HandScore', 'player3HandScore']
const replayButton = 'replay'
const innerReplayButton = 'replayButton'

// Classes

const backgroundDark = 'w3-dark-gray'
const backgroundLight = 'w3-light-gray'
const backgroundWin = 'w3-yellow'
const hide = 'w3-hide'
const show = 'w3-show'

// Other

let playerNumber = 0
let initialRoll = true
const winningNumber = 20

document.addEventListener('DOMContentLoaded', function() {
    for (let i = 0; i < 4; i++) {
        if (i == 0) {
            updateButton(i, rollID, true)
            updateButton(i, passID, false)
        }
        else {
            updateButton(i, rollID, false)
            updateButton(i, passID, false)
        }
    }
    initialRoll = false
}) 

function handleActiveButtons(playerNum) {
    if (initialRoll) {
        console.log('initial roll')
        for (let i of playerID) {
            console.log('for loop')
            if (i == `player${playerNum}`) {
                console.log('first instance')
                console.log(i)
                updateButton(playerID.indexOf(i), rollID, true)
                updateButton(playerID.indexOf(i), passID, false)
            }
            else {
                console.log('else')
                updateButton(playerID.indexOf(i), rollID, false)
                updateButton(playerID.indexOf(i), passID, false)
            }
        }
    }
    else {
        updateButton(playerNum, passID, true)
    }
}

function updateButton(player, element, enabled) {
    let buttonElement = document.getElementById(element[playerID.indexOf(`player${player}`)])
    console.log(player)
    console.log(element)
    console.log(playerID.indexOf(`player${player}`))
    console.log(element[playerID.indexOf(`player${player}`)])
    console.log(buttonElement)

    if (enabled) {
        console.log('enabled')
        buttonElement.disabled = false
    }
    else {
        console.log('disabled')
        buttonElement.disabled = true
    }
}


function updateCSS(initial, updated, id, removeOnly) { 
    if (removeOnly) {
        document.getElementById(id).classList.remove(initial)
    }
    else {
        document.getElementById(id).classList.remove(initial)
        document.getElementById(id).classList.add(updated)
    }
}

function reset() { 
    updateCSS(show, hide, replayButton)
    for (let i = 0; i < playerID.length; i++) {
        let score = document.getElementById(`player${i}HandScore`)
        let total = document.getElementById(`player${i}TotalScore`)

        score.textContent = 'Score:'
        total.textContent = 'Total Score:'

        if (i == 0) {
            updateCSS(backgroundLight, backgroundDark, playerID[i])
        }
        else {
            updateCSS(backgroundDark, backgroundLight, playerID[i])
        }
        updateCSS(backgroundWin, null, playerID[i], true)
        document.getElementById(`player${i}Pig1`).innerHTML = `/`
        document.getElementById(`player${i}Pig2`).innerHTML = `/`
    }
    console.log('reset')
    initialRoll = true
    handleActiveButtons(0)
}

function gameOver(playerNum) {
    updateCSS(backgroundDark, backgroundWin, playerID[playerNum])
    updateCSS(hide, show, replayButton)
    updateButton(playerNum, rollID, false)
    updateButton(playerNum, passID, false)
}

function getScore(roll1, roll2, scoring = gameScoring) {
    let rollValue = 0

    //Check if both rolls are the same (not either a dot or no dot) ie both rolls are 'Razorback'
    if ((roll1 in scoring) && (roll2 in scoring)) {
        rollValue = (scoring[roll1] + scoring[roll2]) * 2
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

function roll(odds) {
    let random = Math.random()
    for (let [value, probability] of Object.entries(odds)) {
        if (random < probability) {
            return value
        }
        random -= probability
    }
}

function rollPigs(playerNum) {
    let firstRoll = roll(gameOdds)
    let secondRoll = roll(gameOdds)
    let score = getScore(firstRoll, secondRoll)
    let scoreElement = document.getElementById(`player${playerNum}HandScore`)
    let previousScore = parseInt(scoreElement.textContent.replace("Score: ", ""))
    let totalScoreElement = document.getElementById(`player${playerNum}TotalScore`)
    let totalScore = parseInt(totalScoreElement.textContent.replace('Total Score: ', ''))

    handleActiveButtons(playerNum)

    if (isNaN(totalScore)) {
        totalScore = 0
    }

    if (!previousScore) {
        previousScore = 0
    }
    
    let newScore = previousScore + score

    if (score > 0) {
        scoreElement.textContent = `Score: ${newScore}`
    }
    else {
        scoreElement.textContent = 'PIG OUT!'
        changeActivePlayer(playerNum)
    }
    document.getElementById(`player${playerNum}Pig1`).innerHTML = firstRoll
    document.getElementById(`player${playerNum}Pig2`).innerHTML = secondRoll

    if ((totalScore + newScore) >= winningNumber) {
        gameOver(playerNum)
    }
    initialRoll = false
}

function changeActivePlayer(playerNum) {
    let handScoreElement = document.getElementById(`player${playerNum}HandScore`)
    let handScore = parseInt(handScoreElement.textContent.replace('Score: ', ''))
    let totalScoreElement = document.getElementById(`player${playerNum}TotalScore`)
    let totalScore = parseInt(totalScoreElement.textContent.replace('Total Score: ', ''))

    if (isNaN(totalScore)) {
        totalScore = ''
    }

    if (isNaN(handScore)) {
        totalScoreElement.textContent = `Total Score: ${totalScore}`
    }
    else {
        if (totalScore == '' && !isNaN(handScore)) {
            totalScoreElement.textContent = `Total Score: ${handScore}`
            handScoreElement.textContent = `Score:`
        }
        else {
            totalScoreElement.textContent = `Total Score: ${totalScore + handScore}`
            handScoreElement.textContent = `Score:`
        }
    }

    updateCSS(backgroundDark, backgroundLight, playerID[playerNum])
    if (playerNum == 3) {
        playerNum = -1
    }
    playerNum++
    updateCSS(backgroundLight, backgroundDark, playerID[playerNum])
    initialRoll = true
    handleActiveButtons(playerNum)
}

function handleClick(id) {
    if (rollID.includes(id)) {
        playerNumber = rollID.indexOf(id)
        rollPigs(playerNumber)
    }
    else if (passID.includes(id)) {
        playerNumber = passID.indexOf(id)
        changeActivePlayer(playerNumber)
    }
    else if (id == innerReplayButton) {
        reset()    
    }
}