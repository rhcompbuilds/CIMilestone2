const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// Ball properties
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Bricks properties
let brickRowCount = 3; // Starting number of rows
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
function createBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 1 };
    
          // Determine hit count based on row index and randomize within the range
          if (r < brickRowCount / 3) {
            bricks[c][r].hits = Math.floor(Math.random() * 2) + 2; // Randomize between 2 and 3
          } else if (r < 2 * brickRowCount / 3) {
            bricks[c][r].hits = Math.floor(Math.random() * 2) + 1; // Randomize between 1 and 2
          } else {
            bricks[c][r].hits = 1; // Bottom row always has 1 hit
          }
        }
      }
    }
createBricks();

let rightPressed = false;
let leftPressed = false;
let score = 0;
let lives = 5;
let level = 1;
let maxLevel = 10;

let paused = false; // Game paused state
let animationFrameId; // To store the requestAnimationFrame id

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

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function togglePause() {
    paused = !paused;
    if (!paused) {
        draw(); // Resume the game
    } else {
        cancelAnimationFrame(animationFrameId); // Pause the game
    }
}

// Function to show the jQuery dialog and pause the game
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
                
                // Resume the game after the dialog is closed
                paused = false;
                
                // Call the callback if provided
                if (callback) callback();
                
                // Resume the game loop
                draw();
            }
        }
    });
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.hits--;
                    if (b.hits === 0) {
                        b.status = 0;
                        score++;
                        if (score === brickRowCount * brickColumnCount) {
                            if (level === maxLevel) {
                                showDialog("YOU WIN, CONGRATULATIONS!", function() {
                                    document.location.reload(); // Reload the game
                                });
                            } else {
                                level++;
                                brickRowCount++;
                                dx += 1; // Increase ball speed
                                dy = -dy;
                                score = 0;
                                createBricks();
                                x = canvas.width / 2;
                                y = canvas.height - 30;
                                paddleX = (canvas.width - paddleWidth) / 2;
                                showDialog("Level " + level);
                            }
                        }
                    }
                }
            }
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
  ctx.arcTo(paddleX + paddleWidth, canvas.height - paddleHeight, paddleX + paddleWidth, canvas.height, 10); // Adjust the radius as needed
  ctx.lineTo(paddleX, canvas.height);
  ctx.arcTo(paddleX, canvas.height - paddleHeight, paddleX + paddleWidth / 2, canvas.height - paddleHeight, 10); // Adjust the radius as needed
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

function draw() {
    // Only run the game loop if not paused
    if (!paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        drawLevel();
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
                    showDialog("GAME OVER", function() {
                        document.location.reload(); // Reload the game
                    });
                } else {
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    dx = 2 + (level - 1); // Increase difficulty based on level
                    dy = -2 - (level - 1);
                    paddleX = (canvas.width - paddleWidth) / 2;
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

// Start the game
draw();
