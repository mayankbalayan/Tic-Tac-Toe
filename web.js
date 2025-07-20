let xScore = 0;
let oScore = 0;
let isSmartAI = false; // default = medium
let turn0 = true;
const setNamesBtn = document.getElementById("setNamesBtn");
const player1NameInput = document.getElementById("player1Name");
const player2NameInput = document.getElementById("player2Name");
const player1Label = document.getElementById("player1Label");
const player2Label = document.getElementById("player2Label");

let player1Name = "Player 0";
let player2Name = "Player X";

const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const modeBtn = document.getElementById("modeToggle");

let boxs = document.querySelectorAll(".cell");
let resetbtn = document.querySelector("#restartButton");
let newBtn = document.querySelector("#new_btn");
let msgContainer = document.querySelector(".msg_container");
let msg = document.querySelector("#msg");
let resetScoreBtn = document.querySelector("#resetScoreBtn");
let isTwoPlayer = false;


const winningPattrens = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
];

const resetGame = () => {
    turn0 = true;
    enabledBox();
    msgContainer.classList.add("hide");
    updatePlayerNames();
};


const resetScoreboard = () => {
    xScore = 0;
    oScore = 0;
    xScoreEl.textContent = xScore;
    oScoreEl.textContent = oScore;
};
const updatePlayerNames = () => {
  player1Name = player1NameInput.value || "Player 0";
  player2Name = player2NameInput.value || (isTwoPlayer ? "Player X" : "Computer 🤖");

  player1Label.textContent = player1Name;
  player2Label.textContent = player2Name;
};

const switchMode = () => {
    isSmartAI = !isSmartAI;
    if (!isTwoPlayer) {
        modeBtn.textContent = isSmartAI ? "Switch to Medium Computer" : "Switch to Smart Computer";
        resetGame();
    }
};

const playerModeBtn = document.getElementById("playerModeBtn");

const togglePlayerMode = () => {
    isTwoPlayer = !isTwoPlayer;

    if (isTwoPlayer) {
        playerModeBtn.textContent = "Switch to AI Mode";
        modeBtn.style.display = "none";
        player2NameInput.placeholder = "Player 2 Name (X)";
    } else {
        playerModeBtn.textContent = "Switch to 2 Player Mode";
        modeBtn.style.display = "inline-block";
        player2NameInput.placeholder = "Computer (X)";
    }

    updatePlayerNames();
    resetGame();
};

// Human move
boxs.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (box.innerHTML !== "") return;

        if (isTwoPlayer) {
            box.innerHTML = turn0 ? "0" : "x";
            box.disabled = true;
            turn0 = !turn0;
            checkWinner();
        } else {
            if (turn0) {
                box.innerHTML = "0";
                box.disabled = true;
                turn0 = false;
                checkWinner();

                if (!turn0) {
                    setTimeout(() => {
                        isSmartAI ? smartAIMove() : mediumAIMove();
                    }, 400);
                }
            }
        }
    });
});

const enabledBox = () => {
    boxs.forEach((box) => {
        box.disabled = false;
        box.innerText = "";
    });
};

const disabledBox = () => {
    boxs.forEach((box) => (box.disabled = true));
};

const showWinner = (winner) => {
    let name = winner === "0" ? player1Name : winner === "x" ? player2Name : "Nobody";
    msg.innerText = winner === "draw" ? "It's a Draw!" : `🎉 Congratulations, ${name} wins!`;

    msgContainer.classList.remove("hide");
    disabledBox();

  if (winner === "0") {
    xScore++; // Player 0's score
    xScoreEl.textContent = xScore;
} else if (winner === "x") {
    oScore++; // Player X's score
    oScoreEl.textContent = oScore;
}

};


// Check if someone won
const checkWinner = () => {
    let winnerFound = false;

    for (let pattern of winningPattrens) {
        const [a, b, c] = pattern;
        const val1 = boxs[a].innerHTML;
        const val2 = boxs[b].innerHTML;
        const val3 = boxs[c].innerHTML;

        if (val1 && val1 === val2 && val2 === val3) {
            showWinner(val1);
            winnerFound = true;
            return true;
        }
    }

    if (![...boxs].some((box) => box.innerHTML === "") && !winnerFound) {
        showWinner("draw");
        return true;
    }

    return false;
};

// Medium AI (Random move)
const mediumAIMove = () => {
    const emptyBoxes = [...boxs].filter((box) => box.innerHTML === "");
    if (emptyBoxes.length === 0) return;
    const randomBox = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
    randomBox.innerHTML = "x";
    randomBox.disabled = true;
    turn0 = true;
    checkWinner();
};

// Smart AI using Minimax
const smartAIMove = () => {
    let bestScore = -Infinity;
    let bestMove = null;

    boxs.forEach((box, index) => {
        if (box.innerHTML === "") {
            box.innerHTML = "x";
            let score = minimax(boxs, 0, false);
            box.innerHTML = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
    });

    if (bestMove !== null) {
        boxs[bestMove].innerHTML = "x";
        boxs[bestMove].disabled = true;
        turn0 = true;
        checkWinner();
    }
};

const minimax = (board, depth, isMaximizing) => {
    let result = evaluateBoard();
    if (result !== null) {
        return result;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        board.forEach((box, i) => {
            if (box.innerHTML === "") {
                box.innerHTML = "x";
                let score = minimax(board, depth + 1, false);
                box.innerHTML = "";
                bestScore = Math.max(score, bestScore);
            }
        });
        return bestScore;
    } else {
        let bestScore = Infinity;
        board.forEach((box, i) => {
            if (box.innerHTML === "") {
                box.innerHTML = "0";
                let score = minimax(board, depth + 1, true);
                box.innerHTML = "";
                bestScore = Math.min(score, bestScore);
            }
        });
        return bestScore;
    }
};

// Returns +10 for X win, -10 for 0 win, 0 for draw, null otherwise
const evaluateBoard = () => {
    for (let pattern of winningPattrens) {
        const [a, b, c] = pattern;
        const val1 = boxs[a].innerHTML;
        const val2 = boxs[b].innerHTML;
        const val3 = boxs[c].innerHTML;

        if (val1 && val1 === val2 && val2 === val3) {
            return val1 === "x" ? 10 : -10;
        }
    }

    if ([...boxs].every((box) => box.innerHTML !== "")) {
        return 0;
    }

    return null;
};

resetbtn.addEventListener("click", resetGame);
newBtn.addEventListener("click", resetGame);
resetScoreBtn.addEventListener("click", resetScoreboard);
modeBtn.addEventListener("click", switchMode);
playerModeBtn.addEventListener("click", togglePlayerMode);
setNamesBtn.addEventListener("click", updatePlayerNames);

