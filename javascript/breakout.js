const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

/**
 * Ball properties
 */
let ballRadius = 5;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2; // Initial horizontal speed
let dy = -2; // Initial vertical speed

/**
 * Paddle properties
 */
const paddleHeight = 5;
const paddleWidth = 55;
let paddleX = (canvas.width - paddleWidth) / 2;

/**
 * Bricks properties
 */
let brickRowCount = 3; // Starting number of rows
const brickColumnCount = 5;
const brickWidth = canvas.width * 0.15;
const brickHeight = canvas.height * 0.05;
const brickPadding = canvas.width * 0.02;
const brickOffsetTop = canvas.height * 0.05;
const brickOffsetLeft = canvas.width * 0.05;

let bricks = [];

/**
 * Game state variables
 */
let rightPressed = false;
let leftPressed = false;
let score = 0;
let lives = 3;
let level = 1;
let maxLevel = 5;
let paused = false; // Game paused state
let animationFrameId; // To store the requestAnimationFrame id
let countdown = 3; // Initial countdown value

/**
 * Game state management: 'leaderboard', 'countdown', 'playing', 'game_over'
 */
let gameState = 'leaderboard'; // Initial state is showing leaderboard

/** 
 * Variables for the "Play Again" button on the canvas
 */
let playAgainButton = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};

/**
 * Function to create the preset bricks.
 */
function createBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c += 1) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r += 1) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };

            /**
             * Determine hit count based on row index and randomize within the range
             */
            if (r < brickRowCount / 3) {
                bricks[c][r].hits = Math.floor(Math.random() * 2) + 2; // 2 or 3 hits
            } else if (r < 2 * brickRowCount / 3) {
                bricks[c][r].hits = Math.floor(Math.random() * 2) + 1; // 1 or 2 hits
            } else {
                bricks[c][r].hits = 1; // Bottom row always has 1 hit
            }
        }
    }
}

/**
 * Retrieve leaderboard data from localStorage
 */
function getLeaderboardData() {
    const leaderboard = localStorage.getItem("leaderboard");
    return leaderboard ? JSON.parse(leaderboard) : [];
}

/**
 * Function to draw the leaderboard directly onto the canvas.
 * This replaces the HTML leaderboard section.
 */
function showLeaderboard() {
    cancelAnimationFrame(animationFrameId); // Stop any ongoing game/countdown animation
    gameState = 'leaderboard'; // Explicitly set state

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    document.getElementById("gameStats").classList.add("hidden"); // Hide HTML stats

    ctx.font = "bold 32px 'Inter', Arial";
    ctx.fillStyle = "3363ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Leaderboard", canvas.width / 2, canvas.height * 0.15); // Title position

    const leaderboardData = getLeaderboardData();
    const startY = canvas.height * 0.25;
    const lineHeight = 30;
    const padding = 10;
    const column1X = canvas.width * 0.2;
    const column2X = canvas.width * 0.5;
    const column3X = canvas.width * 0.8;

    /**
     * Draw table headers
     */
    ctx.font = "bold 18px 'Inter', Arial";
    ctx.fillStyle = "lightblue";
    ctx.fillText("Rank", column1X, startY);
    ctx.fillText("Name", column2X, startY);
    ctx.fillText("Score", column3X, startY);

    /**
     * Draw leaderboard entries
     */
    ctx.font = "16px 'Inter', Arial";
    ctx.fillStyle = "white";
    leaderboardData.forEach(function (entry, index) {
        const yPos = startY + (index + 1) * lineHeight;
        ctx.fillText(`${index + 1}.`, column1X, yPos);
        ctx.fillText(entry.name, column2X, yPos);
        ctx.fillText(entry.score, column3X, yPos);
    });

    /**
     * Draw "Play Again" button
     */
    const buttonWidth = 150;
    const buttonHeight = 50;
    playAgainButton.x = canvas.width / 2 - buttonWidth / 2;
    playAgainButton.y = canvas.height - 80;
    playAgainButton.width = buttonWidth;
    playAgainButton.height = buttonHeight;

    ctx.fillStyle = "#007BFF"; // Blue button background
    ctx.roundRect(playAgainButton.x, playAgainButton.y, playAgainButton.width, playAgainButton.height, 10);
    ctx.fill();

    ctx.font = "bold 20px 'Inter', Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Play Again", canvas.width / 2, playAgainButton.y + buttonHeight / 2);
}

/**
 * Name validator function
 * @returns {boolean} True if the name is valid (letters and numbers only), false otherwise.
 */
function validate() {
    const name = document.getElementById("name").value;
    const warning = document.getElementById("warning");
    const regex = /^[A-Za-z0-9]*$/;
    if (!regex.test(name)) {
        warning.style.display = "block"; // Show the warning
        return false;
    } else {
        warning.style.display = "none"; // Hide the warning
        return true;
    }
}

/**
 * Function to update the HTML elements displaying game stats.
 */
function updateGameStatsDisplay() {
    document.getElementById("scoreDisplay").textContent = "Score: " + score;
    document.getElementById("livesDisplay").textContent = "Lives: " + lives;
    document.getElementById("levelDisplay").textContent = "Level: " + level;
}

/**
 * Resets game variables to their initial state and starts a new game.
 */
function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    dx = 2; // Reset initial ball speed
    dy = -2;
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
    createBricks(); // Recreate bricks for a new game

    /**
     * Hide player details if they were shown again (e.g., after game over for new name)
     */
    document.getElementById("playerDetails").style.display = "none";
    document.getElementById("gameStats").classList.remove("hidden"); // Show HTML stats
    document.getElementById("game").style.display = "flex"; // Ensure game container is visible

    updateGameStatsDisplay(); // Update display for new game
    startCountdown(); // Start the countdown for the new game
}

/**
 * Start the game when the player name is valid
 */
function startGame() {
    const nameValid = validate();
    const playerName = document.getElementById("name").value;
    if (nameValid && playerName.length > 0) {
        showDialog("Welcome, " + playerName + "! Let's start the game.");
        // Hide name input
        document.getElementById("playerDetails").style.display = "none";
        // Show the game container (now flex for centering canvas and stats)
        document.getElementById("game").style.display = "flex";

        resetGame(); // Call resetGame to initialize and start countdown
    } else {
        showDialog("Please enter a valid name to start the game.");
    }
}

/**
 * Updating the leaderboard data in localStorage.
 */
function updateLeaderboard(playerName, playerScore) {
    let leaderboardData = getLeaderboardData();
    leaderboardData.push({ name: playerName, score: playerScore });
    leaderboardData.sort((a, b) => b.score - a.score); // Sort by score descending
    leaderboardData = leaderboardData.slice(0, 10); // Keep only top 10
    localStorage.setItem("leaderboard", JSON.stringify(leaderboardData));
}

/**
 * Handles game over state: updates leaderboard, displays it on canvas.
 */
function gameOver() {
    cancelAnimationFrame(animationFrameId); // Stop game loop immediately
    paused = true; // Ensure game is paused
    gameState = 'game_over'; // Set state to game over before transitioning

    const playerName = document.getElementById("name").value;
    const playerScore = score;

    updateLeaderboard(playerName, playerScore); // Update leaderboard first
    updateGameStatsDisplay(); // Ensure HTML stats are updated

    /**
     * Show a dialog, then transition to leaderboard
     */
    showDialog("Game Over! Your score: " + playerScore, function() {
        showLeaderboard(); // Show the updated leaderboard on the canvas
    });
}

/**
 * Initial setup when the window loads.
 */
window.onload = function() {
    // Hide game elements initially, show player details
    document.getElementById("game").style.display = "none";
    document.getElementById("playerDetails").style.display = "block"; // Ensure player details are visible

    // Show the leaderboard on canvas as the initial view
    showLeaderboard();

    // Attach event listeners for game controls
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    canvas.addEventListener("click", handleCanvasClick, false); // New: for "Play Again" button
};


/**
 * Handles key down events for paddle movement and pause.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === "p" || e.key === "P") {
        togglePause(); // Toggle pause when 'P' is pressed
    }
}

/**
 * Handles key up events for paddle movement.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

/**
 * Toggles the game pause state.
 */
function togglePause() {
    // Only allow toggling pause if in 'playing' state
    if (gameState === 'playing') {
        paused = !paused;
        if (!paused) {
            draw(); // Resume the game loop
        } else {
            cancelAnimationFrame(animationFrameId); // Pause the game loop
        }
    }
}

/**
 * Function to show a message dialog using jQuery UI.
 * @param {string} message - The message to display.
 * @param {Function} [callback] - An optional callback function to execute when the dialog is closed.
 */
function showDialog(message, callback) {
    // Pause game visuals (but not necessarily logic, depending on context)
    // If dialog is shown during game, game is logically paused
    if (gameState === 'playing' || gameState === 'countdown') {
        paused = true;
        cancelAnimationFrame(animationFrameId);
    }

    $("#dialogMessage").text(message);
    $("#dialog").dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
                // Only resume game or run countdown if state demands it
                if (gameState === 'countdown' || gameState === 'playing') {
                     paused = false; // Unpause only if game is supposed to resume
                     if (gameState === 'countdown') {
                        requestAnimationFrame(drawCountdown); // Ensure countdown resumes
                     } else { // gameState === 'playing'
                        draw(); // Ensure game loop resumes
                     }
                }
                // Call the callback if provided, regardless of game state
                if (callback) { callback(); }
            }
        },
        // Prevent dialog from closing on escape key or outside click
        closeOnEscape: false,
        open: function(event, ui) {
            $(".ui-dialog-titlebar-close", ui.dialog || ui).hide(); // Hide the close button
        }
    });
}

/**
 * Countdown logic
 * Function to start the timer
 */
function startCountdown() {
    countdown = 3; // Reset countdown for each game start
    gameState = 'countdown'; // Set game state to countdown
    document.getElementById("gameStats").classList.remove("hidden"); // Ensure stats are visible
    requestAnimationFrame(drawCountdown); // Start the countdown animation loop
}

/**
 * Function to show the timer (countdown) on the canvas.
 */
function drawCountdown() {
    if (gameState !== 'countdown') return; // Only draw if in countdown state

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    drawBricks(); // Still draw the bricks
    drawBall();   // Still draw the ball at its starting position
    drawPaddle(); // Still draw the paddle
    updateGameStatsDisplay(); // Update HTML stats display during countdown

    // Draw countdown text on canvas
    ctx.font = "bold 48px 'Inter', Arial"; // Use Inter font for countdown
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(countdown > 0 ? countdown : "GO!", canvas.width / 2, canvas.height / 2);

    if (countdown > 0) {
        setTimeout(() => {
            countdown--;
            // Only request next frame if still in countdown state
            if (gameState === 'countdown') {
                requestAnimationFrame(drawCountdown);
            }
        }, 1000); // Decrement every second
    } else {
        // Countdown finished
        gameState = 'playing'; // Transition to playing state
        paused = false; // Unpause the game logic
        draw(); // Start the main game loop
    }
}

/**
 * Function to handle brick collision detection and score updates.
 */
function collisionDetection() {
    let brokenBricks = 0; // Initialize broken bricks count for current level
    let totalBricks = 0; // To keep track of total bricks in current layout

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) { // Check only active bricks
                totalBricks++; // Count total active bricks
                // Collision check
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy; // Reverse ball direction
                    b.hits--; // Decrease brick's hit points
                    if (b.hits === 0) {
                        b.status = 0; // Mark the brick as broken
                        score++; // Increment player score
                        brokenBricks++; // Increment the broken bricks count for this level
                    }
                }
            }
        }
    }

    // Check if all active bricks in the current level are broken
    if (totalBricks > 0 && brokenBricks === totalBricks) { // Make sure totalBricks is not 0 for empty levels
        if (level === maxLevel) {
            // Player wins the game
            gameOver(); // Call gameOver to update leaderboard and display it
        } else {
            // Advance to the next level
            level++;
            brickRowCount++; // Increase the number of rows for the next level
            dx = Math.abs(dx) + 0.5; // Slightly increase ball speed horizontally
            dy = -(Math.abs(dy) + 0.5); // Slightly increase ball speed vertically

            // Reset ball and paddle position
            x = canvas.width / 2;
            y = canvas.height - 30;
            paddleX = (canvas.width - paddleWidth) / 2;

            createBricks(); // Create new bricks for the new level
            updateGameStatsDisplay(); // Update HTML stats with new level
            showDialog("Level " + level, startCountdown); // Show level message, then start countdown
        }
    }
}

/**
 * Draws the ball on the canvas.
 */
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "gray";
    ctx.fill();
    ctx.closePath();
}

/**
 * Draws the paddle on the canvas with rounded corners.
 */
function drawPaddle() {
    ctx.beginPath();
    ctx.fillStyle = "lightgrey";
    // Draw the main rectangle part
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fill();
    ctx.closePath();
}

/**
 * Draws the bricks on the canvas, with colors based on hit points.
 */
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { // Only draw active bricks
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                // Determine the fill color based on the hit count
                if (bricks[c][r].hits === 1) {
                    ctx.fillStyle = "#FFC107"; // Orange (1 hit left)
                } else if (bricks[c][r].hits === 2) {
                    ctx.fillStyle = "#00BCD4"; // Cyan (2 hits left)
                } else {
                    ctx.fillStyle = "#E91E63"; // Pink/Red (3+ hits left)
                }
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

/**
 * The main game drawing and logic loop.
 */
function draw() {
    // Only run the game loop if in 'playing' state and not paused
    if (gameState === 'playing' && !paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for next frame

        drawBricks();
        drawBall();
        drawPaddle();
        updateGameStatsDisplay(); // Update HTML elements for score, lives, level

        collisionDetection(); // Check for ball-brick collisions

        // Ball boundary collision logic (left/right walls)
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }

        // Ball boundary collision logic (top wall or paddle)
        if (y + dy < ballRadius) {
            dy = -dy; // Hit top wall, reverse direction
        } else if (y + dy > canvas.height - ballRadius) {
            // Ball reached bottom - check for paddle collision
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy; // Hit paddle, reverse direction
            } else {
                // Ball missed paddle - lose a life
                lives--;
                if (!lives) {
                    gameOver(); // No lives left, game over
                } else {
                    // Reset ball and paddle for next life
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    dx = 2 + (level - 1) * 0.5; // Adjust ball speed based on level
                    dy = -2 - (level - 1) * 0.5;
                    paddleX = (canvas.width - paddleWidth) / 2;
                    updateGameStatsDisplay(); // Update lives display
                    startCountdown(); // Start countdown before next life begins
                    return; // Exit current draw loop to prevent immediate ball movement
                }
            }
        }

        // Paddle movement logic
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        // Update ball position
        x += dx;
        y += dy;

        // Continue the animation loop
        animationFrameId = requestAnimationFrame(draw);
    }
}

/**
 * Canvas click handler for "Play Again" button.
 * @param {MouseEvent} event - The mouse click event.
 */
function handleCanvasClick(event) {
    if (gameState === 'leaderboard' || gameState === 'game_over') {
        const rect = canvas.getBoundingClientRect(); // Get canvas position and size
        const scaleX = canvas.width / rect.width;    // Relationship bitmap vs. element for X
        const scaleY = canvas.height / rect.height;  // Relationship bitmap vs. element for Y

        const mouseX = (event.clientX - rect.left) * scaleX; // Scale mouse coordinates
        const mouseY = (event.clientY - rect.top) * scaleY;

        /**
         * Check if click is within the "Play Again" button bounds
         */
        if (mouseX >= playAgainButton.x &&
            mouseX <= playAgainButton.x + playAgainButton.width &&
            mouseY >= playAgainButton.y &&
            mouseY <= playAgainButton.y + playAgainButton.height) {
            // If it's a game over state, also show player details to allow new name
            if (gameState === 'game_over') {
                document.getElementById("playerDetails").style.display = "block";
                document.getElementById("name").value = ""; // Clear name input
            } else { // If just viewing leaderboard from load, jump straight to game
                document.getElementById("playerDetails").style.display = "none";
            }
            resetGame(); // Start a new game
        }
    }
}


/**
 * Add roundRect to CanvasRenderingContext2D prototype if it doesn't exist
*/
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}
