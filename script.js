const TARGET_DATE = new Date(2026, 7, 31, 0, 0, 0);
const DIFFICULTY_CONFIG = {
    beginner: 30,
    easy: 38,
    medium: 46,
    hard: 54,
    expert: 58
};
const STATS_STORAGE_KEY = "kodex13-sudoku-stats";
const GAME_STORAGE_KEY = "kodex13-sudoku-game";
const EINSTEIN_STORAGE_KEY = "kodex13-einstein-riddle";
const EINSTEIN_STATS_STORAGE_KEY = "kodex13-einstein-riddle-stats";
const EINSTEIN_CATEGORY_ORDER = ["color", "drink", "pet", "vehicle"];
const EINSTEIN_CATEGORY_LABELS = {
    color: "Color",
    drink: "Drink",
    pet: "Pet",
    vehicle: "Vehicle"
};
const EINSTEIN_CATEGORY_ITEMS = {
    color: ["Crimson", "Onyx", "Ivory"],
    drink: ["Tea", "Coffee", "Juice"],
    pet: ["Cat", "Fox", "Owl"],
    vehicle: ["Bike", "Coupe", "Scooter"]
};

const boardElement = document.getElementById("sudoku-board");
const statusElement = document.getElementById("puzzle-status");
const completionPanel = document.getElementById("completion-panel");
const completionMessageElement = document.getElementById("completion-message");
const countdownMessageElement = document.getElementById("countdown-message");
const countdownElement = document.getElementById("countdown");
const timerDisplayElement = document.getElementById("timer-display");
const countdownParts = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
};
const difficultyButtons = Array.from(document.querySelectorAll(".difficulty-button"));
const newGameButton = document.getElementById("new-game-button");
const playAgainButton = document.getElementById("play-again-button");
const riddleStatusElement = document.getElementById("riddle-status");
const riddleTimerDisplayElement = document.getElementById("riddle-timer-display");
const riddleCluesElement = document.getElementById("riddle-clues");
const riddleGridBodyElement = document.getElementById("riddle-grid-body");
const newRiddleButton = document.getElementById("new-riddle-button");
const riddleCompletionPanel = document.getElementById("riddle-completion-panel");
const riddleCompletionMessageElement = document.getElementById("riddle-completion-message");
const playAnotherRiddleButton = document.getElementById("play-another-riddle-button");
const statsElements = {
    totalCompleted: document.getElementById("total-completed"),
    bestOverallTime: document.getElementById("best-overall-time"),
    averageTime: document.getElementById("average-time"),
    lastSolve: document.getElementById("last-solve"),
    completed: {
        beginner: document.getElementById("beginner-completed"),
        easy: document.getElementById("easy-completed"),
        medium: document.getElementById("medium-completed"),
        hard: document.getElementById("hard-completed"),
        expert: document.getElementById("expert-completed")
    },
    bestTimes: {
        beginner: document.getElementById("beginner-best-time"),
        easy: document.getElementById("easy-best-time"),
        medium: document.getElementById("medium-best-time"),
        hard: document.getElementById("hard-best-time"),
        expert: document.getElementById("expert-best-time")
    }
};
const riddleStatsElements = {
    totalCompleted: document.getElementById("riddle-total-completed"),
    bestTime: document.getElementById("riddle-best-time"),
    averageTime: document.getElementById("riddle-average-time"),
    lastSolve: document.getElementById("riddle-last-solve")
};

const gameState = {
    difficulty: "easy",
    puzzle: [],
    solution: [],
    currentBoard: [],
    solved: false,
    timerSeconds: 0,
    timerIntervalId: null,
    timerStartedAt: null,
    stats: loadStats()
};

const riddleState = {
    clues: [],
    solution: createEmptyEinsteinAssignment(),
    current: createEmptyEinsteinAssignment(),
    solved: false,
    timerSeconds: 0,
    timerIntervalId: null,
    timerStartedAt: null,
    stats: loadEinsteinStats()
};

function createDefaultStats() {
    return {
        totalCompleted: 0,
        totalTimeSeconds: 0,
        completed: {
            beginner: 0,
            easy: 0,
            medium: 0,
            hard: 0,
            expert: 0
        },
        bestTimes: {
            beginner: null,
            easy: null,
            medium: null,
            hard: null,
            expert: null
        },
        lastSolved: null
    };
}

function loadStats() {
    const fallback = createDefaultStats();

    try {
        const storedValue = window.localStorage.getItem(STATS_STORAGE_KEY);
        if (!storedValue) {
            return fallback;
        }

        const parsedValue = JSON.parse(storedValue);
        return {
            totalCompleted: Number(parsedValue.totalCompleted) || 0,
            totalTimeSeconds: Number(parsedValue.totalTimeSeconds) || 0,
            completed: {
                beginner: Number(parsedValue.completed?.beginner) || 0,
                easy: Number(parsedValue.completed?.easy) || 0,
                medium: Number(parsedValue.completed?.medium) || 0,
                hard: Number(parsedValue.completed?.hard) || 0,
                expert: Number(parsedValue.completed?.expert) || 0
            },
            bestTimes: {
                beginner: Number.isFinite(parsedValue.bestTimes?.beginner) ? parsedValue.bestTimes.beginner : null,
                easy: Number.isFinite(parsedValue.bestTimes?.easy) ? parsedValue.bestTimes.easy : null,
                medium: Number.isFinite(parsedValue.bestTimes?.medium) ? parsedValue.bestTimes.medium : null,
                hard: Number.isFinite(parsedValue.bestTimes?.hard) ? parsedValue.bestTimes.hard : null,
                expert: Number.isFinite(parsedValue.bestTimes?.expert) ? parsedValue.bestTimes.expert : null
            },
            lastSolved: parsedValue.lastSolved && typeof parsedValue.lastSolved === "object"
                ? {
                    difficulty: parsedValue.lastSolved.difficulty,
                    timeSeconds: Number(parsedValue.lastSolved.timeSeconds) || 0,
                    completedAt: parsedValue.lastSolved.completedAt || ""
                }
                : null
        };
    } catch {
        return fallback;
    }
}

function saveStats() {
    window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(gameState.stats));
}

function createEmptyEinsteinAssignment() {
    return {
        color: ["", "", ""],
        drink: ["", "", ""],
        pet: ["", "", ""],
        vehicle: ["", "", ""]
    };
}

function cloneEinsteinAssignment(assignment) {
    return {
        color: [...assignment.color],
        drink: [...assignment.drink],
        pet: [...assignment.pet],
        vehicle: [...assignment.vehicle]
    };
}

function createDefaultEinsteinStats() {
    return {
        totalCompleted: 0,
        totalTimeSeconds: 0,
        bestTime: null,
        lastSolved: null
    };
}

function loadEinsteinStats() {
    const fallback = createDefaultEinsteinStats();

    try {
        const storedValue = window.localStorage.getItem(EINSTEIN_STATS_STORAGE_KEY);
        if (!storedValue) {
            return fallback;
        }

        const parsedValue = JSON.parse(storedValue);
        return {
            totalCompleted: Number(parsedValue.totalCompleted) || 0,
            totalTimeSeconds: Number(parsedValue.totalTimeSeconds) || 0,
            bestTime: Number.isFinite(parsedValue.bestTime) ? parsedValue.bestTime : null,
            lastSolved: parsedValue.lastSolved && typeof parsedValue.lastSolved === "object"
                ? {
                    timeSeconds: Number(parsedValue.lastSolved.timeSeconds) || 0,
                    completedAt: parsedValue.lastSolved.completedAt || ""
                }
                : null
        };
    } catch {
        return fallback;
    }
}

function saveEinsteinStats() {
    window.localStorage.setItem(EINSTEIN_STATS_STORAGE_KEY, JSON.stringify(riddleState.stats));
}

function isValidBoardShape(board) {
    return Array.isArray(board)
        && board.length === 9
        && board.every((row) => Array.isArray(row)
            && row.length === 9
            && row.every((cell) => Number.isInteger(cell) && cell >= 0 && cell <= 9));
}

function loadSavedGame() {
    try {
        const storedValue = window.localStorage.getItem(GAME_STORAGE_KEY);
        if (!storedValue) {
            return null;
        }

        const parsedValue = JSON.parse(storedValue);
        if (!Object.hasOwn(DIFFICULTY_CONFIG, parsedValue.difficulty)) {
            return null;
        }

        if (!isValidBoardShape(parsedValue.puzzle) || !isValidBoardShape(parsedValue.solution) || !isValidBoardShape(parsedValue.currentBoard)) {
            return null;
        }

        return {
            difficulty: parsedValue.difficulty,
            puzzle: parsedValue.puzzle,
            solution: parsedValue.solution,
            currentBoard: parsedValue.currentBoard,
            solved: Boolean(parsedValue.solved),
            timerSeconds: Number(parsedValue.timerSeconds) || 0,
            timerStartedAt: typeof parsedValue.timerStartedAt === "number" ? parsedValue.timerStartedAt : null
        };
    } catch {
        return null;
    }
}

function saveCurrentGame() {
    const payload = {
        difficulty: gameState.difficulty,
        puzzle: gameState.puzzle,
        solution: gameState.solution,
        currentBoard: gameState.currentBoard,
        solved: gameState.solved,
        timerSeconds: gameState.timerSeconds,
        timerStartedAt: gameState.timerStartedAt
    };

    window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(payload));
}

function isValidEinsteinAssignment(assignment, allowBlank = false) {
    return EINSTEIN_CATEGORY_ORDER.every((category) => Array.isArray(assignment?.[category])
        && assignment[category].length === 3
        && assignment[category].every((item) => {
            if (allowBlank && item === "") {
                return true;
            }

            return EINSTEIN_CATEGORY_ITEMS[category].includes(item);
        }));
}

function isValidEinsteinClueDescriptor(clue) {
    if (!clue || typeof clue !== "object" || typeof clue.type !== "string") {
        return false;
    }

    return ["sameHouse", "position", "leftOf", "nextTo"].includes(clue.type);
}

function loadEinsteinGame() {
    try {
        const storedValue = window.localStorage.getItem(EINSTEIN_STORAGE_KEY);
        if (!storedValue) {
            return null;
        }

        const parsedValue = JSON.parse(storedValue);
        if (!Array.isArray(parsedValue.clues) || !parsedValue.clues.every(isValidEinsteinClueDescriptor)) {
            return null;
        }

        if (!isValidEinsteinAssignment(parsedValue.solution) || !isValidEinsteinAssignment(parsedValue.current, true)) {
            return null;
        }

        return {
            clues: parsedValue.clues,
            solution: parsedValue.solution,
            current: parsedValue.current,
            solved: Boolean(parsedValue.solved),
            timerSeconds: Number(parsedValue.timerSeconds) || 0,
            timerStartedAt: typeof parsedValue.timerStartedAt === "number" ? parsedValue.timerStartedAt : null
        };
    } catch {
        return null;
    }
}

function saveEinsteinGame() {
    const payload = {
        clues: riddleState.clues,
        solution: riddleState.solution,
        current: riddleState.current,
        solved: riddleState.solved,
        timerSeconds: riddleState.timerSeconds,
        timerStartedAt: riddleState.timerStartedAt
    };

    window.localStorage.setItem(EINSTEIN_STORAGE_KEY, JSON.stringify(payload));
}

function formatDuration(totalSeconds) {
    if (!Number.isFinite(totalSeconds)) {
        return "--:--";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
    timerDisplayElement.textContent = `Time: ${formatDuration(gameState.timerSeconds)}`;
}

function syncTimerSeconds() {
    if (gameState.solved || gameState.timerStartedAt === null) {
        return;
    }

    gameState.timerSeconds = Math.max(0, Math.floor((Date.now() - gameState.timerStartedAt) / 1000));
}

function stopPuzzleTimer() {
    if (gameState.timerIntervalId !== null) {
        window.clearInterval(gameState.timerIntervalId);
        gameState.timerIntervalId = null;
    }

    syncTimerSeconds();
}

function startPuzzleTimer(reset = true) {
    stopPuzzleTimer();

    if (reset || gameState.timerStartedAt === null) {
        gameState.timerSeconds = 0;
        gameState.timerStartedAt = Date.now();
    } else {
        syncTimerSeconds();
    }

    updateTimerDisplay();
    saveCurrentGame();

    gameState.timerIntervalId = window.setInterval(() => {
        syncTimerSeconds();
        updateTimerDisplay();
    }, 1000);
}

function updateEinsteinTimerDisplay() {
    riddleTimerDisplayElement.textContent = `Time: ${formatDuration(riddleState.timerSeconds)}`;
}

function syncEinsteinTimerSeconds() {
    if (riddleState.solved || riddleState.timerStartedAt === null) {
        return;
    }

    riddleState.timerSeconds = Math.max(0, Math.floor((Date.now() - riddleState.timerStartedAt) / 1000));
}

function stopEinsteinTimer() {
    if (riddleState.timerIntervalId !== null) {
        window.clearInterval(riddleState.timerIntervalId);
        riddleState.timerIntervalId = null;
    }

    syncEinsteinTimerSeconds();
}

function startEinsteinTimer(reset = true) {
    stopEinsteinTimer();

    if (reset || riddleState.timerStartedAt === null) {
        riddleState.timerSeconds = 0;
        riddleState.timerStartedAt = Date.now();
    } else {
        syncEinsteinTimerSeconds();
    }

    updateEinsteinTimerDisplay();
    saveEinsteinGame();

    riddleState.timerIntervalId = window.setInterval(() => {
        syncEinsteinTimerSeconds();
        updateEinsteinTimerDisplay();
    }, 1000);
}

function renderStats() {
    const { stats } = gameState;
    statsElements.totalCompleted.textContent = String(stats.totalCompleted);

    const bestTimes = Object.values(stats.bestTimes).filter((value) => Number.isFinite(value));
    const bestOverallTime = bestTimes.length > 0 ? Math.min(...bestTimes) : null;
    statsElements.bestOverallTime.textContent = formatDuration(bestOverallTime);
    statsElements.averageTime.textContent = stats.totalCompleted > 0
        ? formatDuration(Math.round(stats.totalTimeSeconds / stats.totalCompleted))
        : "--:--";

    if (stats.lastSolved) {
        statsElements.lastSolve.textContent = `${capitalize(stats.lastSolved.difficulty)} in ${formatDuration(stats.lastSolved.timeSeconds)}`;
    } else {
        statsElements.lastSolve.textContent = "No puzzles solved yet";
    }

    for (const difficulty of Object.keys(statsElements.completed)) {
        statsElements.completed[difficulty].textContent = String(stats.completed[difficulty]);
        statsElements.bestTimes[difficulty].textContent = formatDuration(stats.bestTimes[difficulty]);
    }
}

function renderEinsteinStats() {
    const { stats } = riddleState;
    riddleStatsElements.totalCompleted.textContent = String(stats.totalCompleted);
    riddleStatsElements.bestTime.textContent = formatDuration(stats.bestTime);
    riddleStatsElements.averageTime.textContent = stats.totalCompleted > 0
        ? formatDuration(Math.round(stats.totalTimeSeconds / stats.totalCompleted))
        : "--:--";
    riddleStatsElements.lastSolve.textContent = stats.lastSolved
        ? `Solved in ${formatDuration(stats.lastSolved.timeSeconds)}`
        : "No riddles solved yet";
}

function recordSolvedPuzzle() {
    const { difficulty, timerSeconds, stats } = gameState;
    stats.totalCompleted += 1;
    stats.totalTimeSeconds += timerSeconds;
    stats.completed[difficulty] += 1;

    if (!Number.isFinite(stats.bestTimes[difficulty]) || timerSeconds < stats.bestTimes[difficulty]) {
        stats.bestTimes[difficulty] = timerSeconds;
    }

    stats.lastSolved = {
        difficulty,
        timeSeconds: timerSeconds,
        completedAt: new Date().toISOString()
    };

    saveStats();
    renderStats();
}

function recordSolvedEinsteinRiddle() {
    const { stats, timerSeconds } = riddleState;
    stats.totalCompleted += 1;
    stats.totalTimeSeconds += timerSeconds;

    if (!Number.isFinite(stats.bestTime) || timerSeconds < stats.bestTime) {
        stats.bestTime = timerSeconds;
    }

    stats.lastSolved = {
        timeSeconds: timerSeconds,
        completedAt: new Date().toISOString()
    };

    saveEinsteinStats();
    renderEinsteinStats();
}

class ConfettiController {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.pieces = [];
        this.rafId = null;
        this.isActive = false;
        this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        this.handleResize = this.handleResize.bind(this);
        this.animate = this.animate.bind(this);
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.isActive || this.reduceMotion) {
            return;
        }

        this.isActive = true;
        this.pieces = Array.from({ length: 180 }, () => this.createPiece(true));
        this.rafId = window.requestAnimationFrame(this.animate);
    }

    createPiece(initial = false) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        return {
            x: Math.random() * width,
            y: initial ? Math.random() * height - height : -20,
            width: 6 + Math.random() * 8,
            height: 10 + Math.random() * 12,
            velocityX: -1.4 + Math.random() * 2.8,
            velocityY: 2.4 + Math.random() * 4,
            rotation: Math.random() * Math.PI,
            rotationSpeed: -0.09 + Math.random() * 0.18,
            color: ["#ff5a5f", "#a50018", "#fff4f5", "#ff8b8f"][Math.floor(Math.random() * 4)]
        };
    }

    animate() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.context.clearRect(0, 0, width, height);

        for (const piece of this.pieces) {
            piece.x += piece.velocityX;
            piece.y += piece.velocityY;
            piece.rotation += piece.rotationSpeed;

            if (piece.y > height + 24) {
                Object.assign(piece, this.createPiece());
            }

            this.context.save();
            this.context.translate(piece.x, piece.y);
            this.context.rotate(piece.rotation);
            this.context.fillStyle = piece.color;
            this.context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
            this.context.restore();
        }

        this.rafId = window.requestAnimationFrame(this.animate);
    }
}

const confetti = new ConfettiController(document.getElementById("confetti-canvas"));

function createEmptyBoard() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function cloneBoard(board) {
    return board.map((row) => [...row]);
}

function shuffle(values) {
    const next = [...values];

    for (let index = next.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
    }

    return next;
}

function getEinsteinPermutations(values) {
    if (values.length <= 1) {
        return [values];
    }

    const permutations = [];

    for (let index = 0; index < values.length; index += 1) {
        const current = values[index];
        const rest = values.slice(0, index).concat(values.slice(index + 1));

        for (const permutation of getEinsteinPermutations(rest)) {
            permutations.push([current, ...permutation]);
        }
    }

    return permutations;
}

let cachedEinsteinAssignments = null;

function getAllEinsteinAssignments() {
    if (cachedEinsteinAssignments) {
        return cachedEinsteinAssignments;
    }

    const assignments = [];
    const colorPermutations = getEinsteinPermutations(EINSTEIN_CATEGORY_ITEMS.color);
    const drinkPermutations = getEinsteinPermutations(EINSTEIN_CATEGORY_ITEMS.drink);
    const petPermutations = getEinsteinPermutations(EINSTEIN_CATEGORY_ITEMS.pet);
    const vehiclePermutations = getEinsteinPermutations(EINSTEIN_CATEGORY_ITEMS.vehicle);

    for (const color of colorPermutations) {
        for (const drink of drinkPermutations) {
            for (const pet of petPermutations) {
                for (const vehicle of vehiclePermutations) {
                    assignments.push({ color, drink, pet, vehicle });
                }
            }
        }
    }

    cachedEinsteinAssignments = assignments;
    return assignments;
}

function getEinsteinItemHouse(assignment, category, item) {
    return assignment[category].indexOf(item);
}

function formatEinsteinClueItem(category, item) {
    return `${EINSTEIN_CATEGORY_LABELS[category].toLowerCase()} ${item}`;
}

function formatEinsteinClue(clue) {
    if (clue.type === "sameHouse") {
        return `The ${formatEinsteinClueItem(clue.leftCategory, clue.leftItem)} is in the same house as the ${formatEinsteinClueItem(clue.rightCategory, clue.rightItem)}.`;
    }

    if (clue.type === "position") {
        return `The ${formatEinsteinClueItem(clue.category, clue.item)} is in house ${clue.house + 1}.`;
    }

    if (clue.type === "leftOf") {
        return `The ${formatEinsteinClueItem(clue.leftCategory, clue.leftItem)} is immediately left of the ${formatEinsteinClueItem(clue.rightCategory, clue.rightItem)}.`;
    }

    return `The ${formatEinsteinClueItem(clue.leftCategory, clue.leftItem)} is next to the ${formatEinsteinClueItem(clue.rightCategory, clue.rightItem)}.`;
}

function isEinsteinClueSatisfied(assignment, clue) {
    if (clue.type === "sameHouse") {
        return getEinsteinItemHouse(assignment, clue.leftCategory, clue.leftItem)
            === getEinsteinItemHouse(assignment, clue.rightCategory, clue.rightItem);
    }

    if (clue.type === "position") {
        return assignment[clue.category][clue.house] === clue.item;
    }

    if (clue.type === "leftOf") {
        return getEinsteinItemHouse(assignment, clue.leftCategory, clue.leftItem) + 1
            === getEinsteinItemHouse(assignment, clue.rightCategory, clue.rightItem);
    }

    return Math.abs(
        getEinsteinItemHouse(assignment, clue.leftCategory, clue.leftItem)
        - getEinsteinItemHouse(assignment, clue.rightCategory, clue.rightItem)
    ) === 1;
}

function countEinsteinSolutions(clues) {
    let count = 0;

    for (const assignment of getAllEinsteinAssignments()) {
        if (clues.every((clue) => isEinsteinClueSatisfied(assignment, clue))) {
            count += 1;
        }
    }

    return count;
}

function buildEinsteinCluePool(solution) {
    const clueMap = new Map();

    function addClue(clue) {
        const key = JSON.stringify(clue);
        if (!clueMap.has(key)) {
            clueMap.set(key, clue);
        }
    }

    for (let house = 0; house < 3; house += 1) {
        for (let leftIndex = 0; leftIndex < EINSTEIN_CATEGORY_ORDER.length; leftIndex += 1) {
            for (let rightIndex = leftIndex + 1; rightIndex < EINSTEIN_CATEGORY_ORDER.length; rightIndex += 1) {
                const leftCategory = EINSTEIN_CATEGORY_ORDER[leftIndex];
                const rightCategory = EINSTEIN_CATEGORY_ORDER[rightIndex];
                addClue({
                    type: "sameHouse",
                    leftCategory,
                    leftItem: solution[leftCategory][house],
                    rightCategory,
                    rightItem: solution[rightCategory][house]
                });
            }
        }
    }

    for (const category of EINSTEIN_CATEGORY_ORDER) {
        for (let house = 0; house < 3; house += 1) {
            addClue({
                type: "position",
                category,
                item: solution[category][house],
                house
            });
        }
    }

    for (let house = 0; house < 2; house += 1) {
        for (const leftCategory of EINSTEIN_CATEGORY_ORDER) {
            for (const rightCategory of EINSTEIN_CATEGORY_ORDER) {
                addClue({
                    type: "leftOf",
                    leftCategory,
                    leftItem: solution[leftCategory][house],
                    rightCategory,
                    rightItem: solution[rightCategory][house + 1]
                });
                addClue({
                    type: "nextTo",
                    leftCategory,
                    leftItem: solution[leftCategory][house],
                    rightCategory,
                    rightItem: solution[rightCategory][house + 1]
                });
            }
        }
    }

    return Array.from(clueMap.values());
}

function generateEinsteinSolution() {
    return {
        color: shuffle(EINSTEIN_CATEGORY_ITEMS.color),
        drink: shuffle(EINSTEIN_CATEGORY_ITEMS.drink),
        pet: shuffle(EINSTEIN_CATEGORY_ITEMS.pet),
        vehicle: shuffle(EINSTEIN_CATEGORY_ITEMS.vehicle)
    };
}

function generateEinsteinRiddle() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
        const solution = generateEinsteinSolution();
        const cluePool = buildEinsteinCluePool(solution);
        const availableClues = [
            ...shuffle(cluePool.filter((clue) => clue.type === "sameHouse")),
            ...shuffle(cluePool.filter((clue) => clue.type === "leftOf" || clue.type === "nextTo")),
            ...shuffle(cluePool.filter((clue) => clue.type === "position"))
        ];
        const selectedClues = [];
        let remainingSolutions = countEinsteinSolutions(selectedClues);

        while (remainingSolutions > 1 && availableClues.length > 0 && selectedClues.length < 10) {
            let bestIndex = -1;
            let bestCount = remainingSolutions;

            for (let index = 0; index < availableClues.length; index += 1) {
                const nextCount = countEinsteinSolutions([...selectedClues, availableClues[index]]);

                if (nextCount < bestCount) {
                    bestCount = nextCount;
                    bestIndex = index;

                    if (nextCount === 1) {
                        break;
                    }
                }
            }

            if (bestIndex === -1) {
                break;
            }

            selectedClues.push(availableClues.splice(bestIndex, 1)[0]);
            remainingSolutions = bestCount;
        }

        if (remainingSolutions === 1 && selectedClues.length >= 6) {
            return {
                solution,
                clues: shuffle(selectedClues)
            };
        }
    }

    const fallbackSolution = generateEinsteinSolution();
    return {
        solution: fallbackSolution,
        clues: buildEinsteinCluePool(fallbackSolution).slice(0, 8)
    };
}

function isPlacementValid(board, row, col, value) {
    for (let index = 0; index < 9; index += 1) {
        if (board[row][index] === value || board[index][col] === value) {
            return false;
        }
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
        for (let colOffset = 0; colOffset < 3; colOffset += 1) {
            if (board[boxRow + rowOffset][boxCol + colOffset] === value) {
                return false;
            }
        }
    }

    return true;
}

function solveBoard(board) {
    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            if (board[row][col] !== 0) {
                continue;
            }

            for (const candidate of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
                if (!isPlacementValid(board, row, col, candidate)) {
                    continue;
                }

                board[row][col] = candidate;

                if (solveBoard(board)) {
                    return true;
                }

                board[row][col] = 0;
            }

            return false;
        }
    }

    return true;
}

function countSolutions(board, limit = 2) {
    let solutions = 0;

    function search() {
        for (let row = 0; row < 9; row += 1) {
            for (let col = 0; col < 9; col += 1) {
                if (board[row][col] !== 0) {
                    continue;
                }

                for (let value = 1; value <= 9; value += 1) {
                    if (!isPlacementValid(board, row, col, value)) {
                        continue;
                    }

                    board[row][col] = value;
                    search();
                    board[row][col] = 0;

                    if (solutions >= limit) {
                        return;
                    }
                }

                return;
            }
        }

        solutions += 1;
    }

    search();
    return solutions;
}

function generateSolvedBoard() {
    const board = createEmptyBoard();
    solveBoard(board);
    return board;
}

function generatePuzzle(difficulty) {
    const solution = generateSolvedBoard();
    const puzzle = cloneBoard(solution);
    const cellsToRemove = DIFFICULTY_CONFIG[difficulty];
    const positions = shuffle(Array.from({ length: 81 }, (_, index) => index));
    let removed = 0;

    for (const position of positions) {
        if (removed >= cellsToRemove) {
            break;
        }

        const row = Math.floor(position / 9);
        const col = position % 9;
        const cachedValue = puzzle[row][col];
        puzzle[row][col] = 0;

        const attemptBoard = cloneBoard(puzzle);
        if (countSolutions(attemptBoard) !== 1) {
            puzzle[row][col] = cachedValue;
            continue;
        }

        removed += 1;
    }

    return { puzzle, solution };
}

function updateStatus(message) {
    statusElement.textContent = message;
}

function updateEinsteinStatus(message) {
    riddleStatusElement.textContent = message;
}

function checkCompletion() {
    if (gameState.solved) {
        return;
    }

    const inputs = Array.from(boardElement.querySelectorAll(".sudoku-cell"));
    let hasEmptyCell = false;
    let hasError = false;

    for (const input of inputs) {
        if (input.disabled) {
            continue;
        }

        const row = Number(input.dataset.row);
        const col = Number(input.dataset.col);
        const expected = gameState.solution[row][col];
        const entered = Number(input.value);

        if (!input.value) {
            hasEmptyCell = true;
            input.classList.remove("is-error");
            continue;
        }

        if (entered !== expected) {
            hasError = true;
            input.classList.add("is-error");
        } else {
            input.classList.remove("is-error");
        }
    }

    if (hasError) {
        updateStatus("There are a few incorrect entries. Keep going.");
        return;
    }

    if (hasEmptyCell) {
        updateStatus(`Difficulty: ${capitalize(gameState.difficulty)}. Fill every empty square with digits 1 to 9.`);
        return;
    }

    gameState.solved = true;
    stopPuzzleTimer();
    recordSolvedPuzzle();
    completionPanel.hidden = false;
    completionMessageElement.textContent = `You solved the ${capitalize(gameState.difficulty)} puzzle in ${formatDuration(gameState.timerSeconds)}. Pick another random board whenever you want.`;
    updateStatus("Congratulations! Puzzle solved.");
    saveCurrentGame();
}

function handleCellInput(event) {
    const input = event.currentTarget;
    const sanitizedValue = input.value.replace(/[^1-9]/g, "").slice(0, 1);
    input.value = sanitizedValue;
    gameState.currentBoard[Number(input.dataset.row)][Number(input.dataset.col)] = sanitizedValue ? Number(sanitizedValue) : 0;
    saveCurrentGame();
    checkCompletion();
}

function renderBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
            const fixedValue = gameState.puzzle[row][col];
            const currentValue = gameState.currentBoard[row][col];
            const cell = document.createElement("input");
            cell.type = "text";
            cell.inputMode = "numeric";
            cell.maxLength = 1;
            cell.className = "sudoku-cell";
            cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);
            cell.dataset.row = String(row);
            cell.dataset.col = String(col);

            if (fixedValue !== 0) {
                cell.value = String(fixedValue);
                cell.disabled = true;
                cell.classList.add("is-fixed");
            } else {
                cell.value = currentValue ? String(currentValue) : "";
                cell.addEventListener("input", handleCellInput);
            }

            boardElement.appendChild(cell);
        }
    }
}

function renderEinsteinClues() {
    riddleCluesElement.innerHTML = "";

    for (const clue of riddleState.clues) {
        const listItem = document.createElement("li");
        listItem.textContent = formatEinsteinClue(clue);
        riddleCluesElement.appendChild(listItem);
    }
}

function updateEinsteinSelectionErrors() {
    const duplicateKeys = new Set();

    for (const category of EINSTEIN_CATEGORY_ORDER) {
        const seenValues = new Map();

        for (let house = 0; house < 3; house += 1) {
            const value = riddleState.current[category][house];
            if (!value) {
                continue;
            }

            if (!seenValues.has(value)) {
                seenValues.set(value, [house]);
            } else {
                seenValues.get(value).push(house);
            }
        }

        for (const houses of seenValues.values()) {
            if (houses.length < 2) {
                continue;
            }

            for (const house of houses) {
                duplicateKeys.add(`${category}-${house}`);
            }
        }
    }

    for (const selectElement of riddleGridBodyElement.querySelectorAll(".riddle-select")) {
        const key = `${selectElement.dataset.category}-${selectElement.dataset.house}`;
        selectElement.classList.toggle("is-error", duplicateKeys.has(key));
    }

    return duplicateKeys.size > 0;
}

function renderEinsteinGrid() {
    riddleGridBodyElement.innerHTML = "";

    for (let house = 0; house < 3; house += 1) {
        const row = document.createElement("tr");
        const houseCell = document.createElement("th");
        houseCell.scope = "row";
        houseCell.className = "riddle-house-label";
        houseCell.textContent = `House ${house + 1}`;
        row.appendChild(houseCell);

        for (const category of EINSTEIN_CATEGORY_ORDER) {
            const cell = document.createElement("td");
            const selectElement = document.createElement("select");
            selectElement.className = "riddle-select";
            selectElement.dataset.category = category;
            selectElement.dataset.house = String(house);
            selectElement.disabled = riddleState.solved;
            selectElement.setAttribute("aria-label", `House ${house + 1} ${EINSTEIN_CATEGORY_LABELS[category]}`);

            const blankOption = document.createElement("option");
            blankOption.value = "";
            blankOption.textContent = `Choose ${EINSTEIN_CATEGORY_LABELS[category]}`;
            selectElement.appendChild(blankOption);

            for (const item of EINSTEIN_CATEGORY_ITEMS[category]) {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                selectElement.appendChild(option);
            }

            selectElement.value = riddleState.current[category][house];
            selectElement.addEventListener("change", handleEinsteinInputChange);
            cell.appendChild(selectElement);
            row.appendChild(cell);
        }

        riddleGridBodyElement.appendChild(row);
    }

    updateEinsteinSelectionErrors();
}

function checkEinsteinCompletion() {
    if (riddleState.solved) {
        return;
    }

    const hasDuplicates = updateEinsteinSelectionErrors();
    const hasEmpty = EINSTEIN_CATEGORY_ORDER.some((category) => riddleState.current[category].some((value) => !value));

    if (hasDuplicates) {
        updateEinsteinStatus("Each color, drink, and pet can only appear once.");
        return;
    }

    if (hasEmpty) {
        updateEinsteinStatus("Use the clues to complete all three houses correctly across all four categories.");
        return;
    }

    const solved = EINSTEIN_CATEGORY_ORDER.every((category) => riddleState.current[category].every((item, house) => item === riddleState.solution[category][house]));

    if (!solved) {
        updateEinsteinStatus("A few assignments still do not satisfy the riddle.");
        return;
    }

    riddleState.solved = true;
    stopEinsteinTimer();
    recordSolvedEinsteinRiddle();
    riddleCompletionPanel.hidden = false;
    riddleCompletionMessageElement.textContent = `You solved the Einstein Riddle in ${formatDuration(riddleState.timerSeconds)}. Generate another one whenever you want.`;
    updateEinsteinStatus("Congratulations! Einstein Riddle solved.");
    renderEinsteinGrid();
    saveEinsteinGame();
}

function handleEinsteinInputChange(event) {
    const selectElement = event.currentTarget;
    const category = selectElement.dataset.category;
    const house = Number(selectElement.dataset.house);
    riddleState.current[category][house] = selectElement.value;
    updateEinsteinSelectionErrors();
    saveEinsteinGame();
    checkEinsteinCompletion();
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function updateDifficultyButtons() {
    for (const button of difficultyButtons) {
        button.classList.toggle("is-active", button.dataset.difficulty === gameState.difficulty);
    }
}

function restoreSavedGame() {
    const savedGame = loadSavedGame();
    if (!savedGame) {
        return false;
    }

    gameState.difficulty = savedGame.difficulty;
    gameState.puzzle = cloneBoard(savedGame.puzzle);
    gameState.solution = cloneBoard(savedGame.solution);
    gameState.currentBoard = cloneBoard(savedGame.currentBoard);
    gameState.solved = savedGame.solved;
    gameState.timerSeconds = savedGame.timerSeconds;
    gameState.timerStartedAt = savedGame.timerStartedAt;

    updateDifficultyButtons();
    renderBoard();

    if (gameState.solved) {
        completionPanel.hidden = false;
        completionMessageElement.textContent = `You solved the ${capitalize(gameState.difficulty)} puzzle in ${formatDuration(gameState.timerSeconds)}. Pick another random board whenever you want.`;
        updateStatus("Congratulations! Puzzle solved.");
        updateTimerDisplay();
        return true;
    }

    completionPanel.hidden = true;
    startPuzzleTimer(false);
    updateStatus(`Difficulty: ${capitalize(gameState.difficulty)}. Fill every empty square with digits 1 to 9.`);
    return true;
}

function restoreEinsteinRiddle() {
    const savedGame = loadEinsteinGame();
    if (!savedGame) {
        return false;
    }

    riddleState.clues = savedGame.clues;
    riddleState.solution = cloneEinsteinAssignment(savedGame.solution);
    riddleState.current = cloneEinsteinAssignment(savedGame.current);
    riddleState.solved = savedGame.solved;
    riddleState.timerSeconds = savedGame.timerSeconds;
    riddleState.timerStartedAt = savedGame.timerStartedAt;
    renderEinsteinClues();
    renderEinsteinGrid();

    if (riddleState.solved) {
        updateEinsteinTimerDisplay();
        riddleCompletionPanel.hidden = false;
        riddleCompletionMessageElement.textContent = `You solved the Einstein Riddle in ${formatDuration(riddleState.timerSeconds)}. Generate another one whenever you want.`;
        updateEinsteinStatus("Congratulations! Einstein Riddle solved.");
        return true;
    }

    riddleCompletionPanel.hidden = true;
    startEinsteinTimer(false);
    updateEinsteinStatus("Use the clues to complete all three houses correctly across all four categories.");
    return true;
}

function startNewGame() {
    const { puzzle, solution } = generatePuzzle(gameState.difficulty);
    gameState.puzzle = puzzle;
    gameState.solution = solution;
    gameState.currentBoard = cloneBoard(puzzle);
    gameState.solved = false;
    completionPanel.hidden = true;
    gameState.timerStartedAt = Date.now();
    startPuzzleTimer();
    updateStatus(`Difficulty: ${capitalize(gameState.difficulty)}. Fill every empty square with digits 1 to 9.`);
    renderBoard();
    saveCurrentGame();
}

function startNewEinsteinRiddle() {
    const { solution, clues } = generateEinsteinRiddle();
    riddleState.solution = cloneEinsteinAssignment(solution);
    riddleState.clues = clues;
    riddleState.current = createEmptyEinsteinAssignment();
    riddleState.solved = false;
    riddleState.timerStartedAt = Date.now();
    riddleCompletionPanel.hidden = true;
    renderEinsteinClues();
    renderEinsteinGrid();
    startEinsteinTimer();
    updateEinsteinStatus("Use the clues to complete all three houses correctly across all four categories.");
    saveEinsteinGame();
}

function setDifficulty(nextDifficulty) {
    gameState.difficulty = nextDifficulty;
    updateDifficultyButtons();
    startNewGame();
}

function updateCountdown() {
    const now = new Date();
    const difference = TARGET_DATE.getTime() - now.getTime();

    if (difference <= 0) {
        countdownParts.days.textContent = "00";
        countdownParts.hours.textContent = "00";
        countdownParts.minutes.textContent = "00";
        countdownParts.seconds.textContent = "00";
        countdownMessageElement.textContent = "It is August 31, 2026. Happy birthday, Kodex13!";
        countdownElement.setAttribute("aria-label", "Countdown complete");
        confetti.start();
        return true;
    }

    const seconds = Math.floor(difference / 1000) % 60;
    const minutes = Math.floor(difference / (1000 * 60)) % 60;
    const hours = Math.floor(difference / (1000 * 60 * 60)) % 24;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    countdownParts.days.textContent = String(days).padStart(2, "0");
    countdownParts.hours.textContent = String(hours).padStart(2, "0");
    countdownParts.minutes.textContent = String(minutes).padStart(2, "0");
    countdownParts.seconds.textContent = String(seconds).padStart(2, "0");
    countdownMessageElement.textContent = "Countdown active";
    return false;
}

function initializeCountdown() {
    const isFinished = updateCountdown();

    if (isFinished) {
        return;
    }

    window.setInterval(() => {
        updateCountdown();
    }, 1000);
}

for (const button of difficultyButtons) {
    button.addEventListener("click", () => {
        setDifficulty(button.dataset.difficulty);
    });
}

newGameButton.addEventListener("click", startNewGame);
playAgainButton.addEventListener("click", startNewGame);
newRiddleButton.addEventListener("click", startNewEinsteinRiddle);
playAnotherRiddleButton.addEventListener("click", startNewEinsteinRiddle);
window.addEventListener("pagehide", () => {
    saveCurrentGame();
    saveEinsteinGame();
});

initializeCountdown();
renderStats();
renderEinsteinStats();
updateTimerDisplay();
updateEinsteinTimerDisplay();

if (!restoreSavedGame()) {
    updateDifficultyButtons();
    startNewGame();
}

if (!restoreEinsteinRiddle()) {
    startNewEinsteinRiddle();
}