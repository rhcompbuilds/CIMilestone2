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
 * Function to create the preset bricks.
 */
function createBricks() {
    bricks = [];
    for (c = 0; c < brickColumnCount; c+= 1) {
        bricks[c] = [];
        for (r = 0; r < brickRowCount; r+= 1) {
          bricks[c][r] = { x: 0, y: 0, status: 1 };

        /**
         * Determine hit count based on row index and randomize within the range
         */
          if (r < brickRowCount / 3) {
            bricks[c][r].hits = Math.floor(Math.random() * 2) + 2;
          } else if (r < 2 * brickRowCount / 3) {
            bricks[c][r].hits = Math.floor(Math.random() * 2) + 1;
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
    const leaderboard = document.getElementById("leaderboard");
    const leaderboardData = getLeaderboardData();
    leaderboard.innerHTML = " "; // Clear existing entries
    leaderboardData.forEach(function (entry, index) {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
        leaderboard.appendChild(li);
    });
    /**
      * Adapt to show leaderboard only if there are scores
    */
    if (leaderboardData.length > 0) {
        document.getElementById("leaderboardSection")
        .classList.remove("hidden");
    } else {
        document.getElementById("leaderboardSection")
        .classList.add("hidden");
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
      * @returns Error message if special characters are used
      */
    function validate() {
        const name = document.getElementById("name").value;
        const warning = document.getElementById("warning");
        /**
         *Regular expression to match only letters and numbers
         */
        const regex = /^[A-Za-z0-9]*$/;
        if (!regex.test(name)) {
        warning.style.display = "block";  // Show the warning
        return false;
        } else {
        warning.style.display = "none";   // Hide the warning
        return true;
        }
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
                    // Show the game
            document.getElementById("game").style.display = "flex";
                    // Initialize game and start drawing
                    createBricks();
                    updateGameStatsDisplay();
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
            * Updating the leaderboard on game over
            */
function gameOver() {
    const playerName = document.getElementById("name").value;
    const playerScore = score;
    updateGameStatsDisplay();
    showDialog("Game Over! Your score: " + playerScore);
    // Update the leaderboard
    updateLeaderboard(playerName, playerScore);
    // Show the leaderboard again
    showLeaderboard();
    // Reload the game or reset game logic
    document.location.reload(); // Optionally reload the page to start over
}
/**
 * Show the leaderboard when the page loads
 */
window.onload = function() {
    showLeaderboard(); // Show leaderboard on page load
};
createBricks();
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

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

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
 * Game controls key up handler
 */
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}
/**
 * Pause toggle function
 */
function togglePause() {
    paused = !paused;
    if (!paused) {
        // Only resume if the countdown is finished and the game has started
        if (gameStarted) {
            draw(); // Resume the game
        }
    } else {
        cancelAnimationFrame(animationFrameId); // Pause the game
    }
}
/**
 * Function to show the pause dialog and pause the game
*/
function showDialog(message, callback) {
    // Set paused to true to stop the game loop
    paused = true;
    // Show the dialog
    $("#dialogMessage").text(message);
    $("#dialog").dialog({
        modal: true,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
                // Resume the game after the dialog is closed, but only if the countdown is done and the game has started
                if (gameStarted) {
                    paused = false;
                    draw();
                }
                // Call the callback if provided
                if (callback) {callback();}
            }
        }
    });
}

/**
 * Countdown logic
 * Function to start the timer
 */
function startCountdown() {
    countdown = 3; // Reset countdown for each game start
    gameStarted = false; // Ensure game is not yet started
    updateGameStatsDisplay();
    requestAnimationFrame(drawCountdown);
}

/**
 * Function to show the timer
 */
function drawCountdown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall(); 
    drawPaddle();
    updateGameStatsDisplay();
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);

    if (countdown > 0) {
        setTimeout(() => {
            countdown--;
            requestAnimationFrame(drawCountdown);
        }, 1000); // Decrement every second
    } else {
        gameStarted = true; // Game can now officially start
        paused = false; // Unpause the game
        draw(); // Start the main game loop
    }
}

/**
 * Function to count and break bricks
 */
function collisionDetection() {
    let brokenBricks = 0; // Initialize broken bricks count
    let totalBricks = 0; // To keep track of total bricks
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                totalBricks++; // Count total bricks
if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.hits--;
                    if (b.hits === 0) {
                        b.status = 0; // Mark the brick as broken
                        score++;
                        brokenBricks++; // Increment the broken bricks count
                    }
                }
            }
        }
    }
    // Check if all bricks are broken
if (brokenBricks > 0 && (brokenBricks + (brickRowCount * brickColumnCount - totalBricks)) === brickRowCount * brickColumnCount) {
        if (level === maxLevel) {
            showDialog("YOU WIN, CONGRATULATIONS!", function() {
                document.location.reload(); // Reload the game
            });
        } else {
            level++;
            brickRowCount++; // Increase the number of rows for the next level
            dx += 1; // Increase ball speed
            dy = -dy; // Reverse the direction of the ball
            createBricks(); // Create new bricks for the new level
            x = canvas.width / 2; // Reset ball position
            y = canvas.height - 30; // Reset ball position
            paddleX = (canvas.width - paddleWidth) / 2; // Reset paddle position
            updateGameStatsDisplay();
            showDialog("Level " + level, startCountdown); // Start countdown for the new level
        }
    }
}
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "gray";
    ctx.fill();
    ctx.closePath();
}
function drawPaddle() {
    ctx.beginPath();
    ctx.fillStyle = "lightgrey"; // Change color
    ctx.fill();
  ctx.moveTo(paddleX + paddleWidth / 2, canvas.height - paddleHeight);
  ctx.arcTo(paddleX + paddleWidth, canvas.height - paddleHeight,
    paddleX + paddleWidth, canvas.height, 10); // Adjust the radius as needed
  ctx.lineTo(paddleX, canvas.height);
  ctx.arcTo(paddleX, canvas.height - paddleHeight,
    // Adjust the radius as needed
    paddleX + paddleWidth / 2, canvas.height - paddleHeight, 10);
  ctx.fill();
  ctx.closePath();
}
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          // Determine the fill color based on the hit count
          if (bricks[c][r].hits === 1) {
            ctx.fillStyle = "cyan";
          } else if (bricks[c][r].hits === 2) {
            ctx.fillStyle = "blue";
          } else {
            // Default color for other hit counts
            ctx.fillStyle = "red";
          }
          ctx.fill();
          ctx.closePath();
        }
      }
    }
}

/**
 * Function to update the HTML elements for score, lives and level.
 */
function updateGameStatsDisplay() {
    document.getElementById("scoreDisplay").textContent = "Score: " + score;
    document.getElementById("livesDisplay").textContent = "Lives: " + lives;
    document.getElementById("levelDisplay").textContent = "Level: " + level;
}

function draw() {
    // Only run the game loop if not paused and the game has officially started
    if (!paused && gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();

       updateGameStatsDisplay();

        collisionDetection();        
        // Ball movement logic
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                lives--;
                if (!lives) {
                    gameOver();
                } else {
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    dx = 2 + (level - 1); // Increase difficulty based on level
                    dy = -2 - (level - 1);
                    paddleX = (canvas.width - paddleWidth) / 2;
                    // Start countdown again after losing a life
                    startCountdown();
                    return; // Stop the current draw call to prevent immediate movement
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
/*  I have left these commented out as I have changed the layout.
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "lightblue";
    ctx.fillText("Score: " + score, 8, 20);
}
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "lightblue";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}
function drawLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "lightblue";
    ctx.fillText("Level: " + level, canvas.width / 2 - 30, 20);
}
*/