const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

/**
 * Ball properties
 */
let ballRadius = 5;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

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
let gameStarted = false; // Flag to track if the game has truly started

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
 * Function to display the leaderboard
 */
function showLeaderboard() {
    const leaderboardTable = document.getElementById("leaderboard");
    const leaderboardData = getLeaderboardData();

    // Clear existing entries but keep header row if exists
    leaderboardTable.innerHTML = `
        <thead>
            <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = leaderboardTable.querySelector('tbody');

    leaderboardData.forEach(function (entry, index) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
        `;
        tbody.appendChild(row);
    });

    /**
     * Adapt to show leaderboard only if there are scores
     */
    if (leaderboardData.length > 0) {
        document.getElementById("leaderboardSection").classList.remove("hidden");
    } else {
        document.getElementById("leaderboardSection").classList.add("hidden");
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
 * Name validator function
 * @returns {boolean} True if the name is valid (letters and numbers only), false otherwise.
 */
function validate() {
    const name = document.getElementById("name").value;
    const warning = document.getElementById("warning");
    /**
     * Regular expression to match only letters and numbers
     */
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
 * This replaces drawing stats directly on the canvas.
 */
function updateGameStatsDisplay() {
    document.getElementById("scoreDisplay").textContent = "Score: " + score;
    document.getElementById("livesDisplay").textContent = "Lives: " + lives;
    document.getElementById("levelDisplay").textContent = "Level: " + level;
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
        // Initialize game and create bricks
        createBricks();
        // Update the display for score, lives, level
        updateGameStatsDisplay();
        // Start the countdown before the game truly begins
        startCountdown();
    } else {
        showDialog("Please enter a valid name to start the game.");
    }
}

/**
 * Updating the leaderboard
 */
function updateLeaderboard(playerName, playerScore) {
    let leaderboardData = getLeaderboardData();
    // Add the new player's score
    leaderboardData.push({ name: playerName, score: playerScore });
    // Sort and keep only top 10 scores
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData = leaderboardData.slice(0, 10);
    // Save the updated leaderboard back to localStorage
    localStorage.setItem("leaderboard", JSON.stringify(leaderboardData));
    // Show the leaderboard
    showLeaderboard();
}

/**
 * Handles game over state: shows message, updates leaderboard, reloads page.
 */
function gameOver() {
    // Ensure the ball and paddle stop moving immediately
    cancelAnimationFrame(animationFrameId);
    paused = true; // Explicitly pause the game
    gameStarted = false; // Mark game as not started

    const playerName = document.getElementById("name").value;
    const playerScore = score;
    updateGameStatsDisplay(); // Final update of stats
    showDialog("Game Over! Your score: " + playerScore, function() {
        // Callback after dialog closes
        updateLeaderboard(playerName, playerScore);
        showLeaderboard();
        // Reload the page to restart the game
        document.location.reload();
    });
}

/**
 * Show the leaderboard when the page loads
 */
window.onload = function() {
    showLeaderboard(); // Show leaderboard on page load
};

// Event listeners for paddle movement and pause
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

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
    paused = !paused;
    if (!paused) {
        // Only resume if the countdown is finished and the game has started
        if (gameStarted) {
            draw(); // Resume the game loop
        }
    } else {
        cancelAnimationFrame(animationFrameId); // Pause the game loop
    }
}

/**
 * Displays a message dialog using jQuery UI.
 * @param {string} message - The message to display.
 * @param {Function} [callback] - An optional callback function to execute when the dialog is closed.
 */
function showDialog(message, callback) {
    // Set paused to true to stop the game loop
    paused = true;
    cancelAnimationFrame(animationFrameId); // Ensure game loop stops

    $("#dialogMessage").text(message);
    $("#dialog").dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
                // Resume the game after the dialog is closed, but only if the countdown is done and the game has started
                if (gameStarted) {
                    paused = false;
                    draw(); // Resume the game loop
                }
                // Call the callback if provided
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
 * Initiates the pre-game countdown.
 */
function startCountdown() {
    countdown = 3; // Reset countdown for each game start or level transition
    gameStarted = false; // Ensure game is not yet started during countdown
    paused = true; // Ensure the game logic is paused during countdown display
    requestAnimationFrame(drawCountdown);
}

/**
 * Draws the countdown on the canvas.
 */
function drawCountdown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear only the canvas
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
            requestAnimationFrame(drawCountdown); // Continue countdown animation
        }, 1000); // Decrement every second
    } else {
        gameStarted = true; // Game can now officially start
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
    if (brokenBricks > 0 && (brokenBricks === totalBricks)) {
        if (level === maxLevel) {
            // Player wins the game
            gameOver(); // Call gameOver to update leaderboard and reload
        } else {
            // Advance to the next level
            level++;
            brickRowCount++; // Increase the number of rows for the next level
            dx += 0.5; // Slightly increase ball speed horizontally
            dy = -dy; // Reverse vertical direction (and implicitly increase speed)

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
    // Only run the game loop if not paused and the game has officially started
    if (!paused && gameStarted) {
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