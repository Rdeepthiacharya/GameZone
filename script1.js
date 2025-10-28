function getUserName() {
  return localStorage.getItem('currentUser');
}
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function getCurrentUserScore() {
  const name = getUserName();
  if (!name) return 0;
  const users = getUsers();
  return (users[name] && users[name].score) ? users[name].score : 0;
}
function addScore(points) {
  const name = getUserName();
  if (!name) return;
  const users = getUsers();
  if (!users[name]) users[name] = { score: 0, pin: "" };
  users[name].score += points;
  setUsers(users);
  updateScoreDisplay();
}
function updateScoreDisplay() {
  document.getElementById('user-score').textContent = getCurrentUserScore();
}

(function initUser() {
  const currentUser = getUserName();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
  const users = getUsers();
  if (!users[currentUser]) {
    users[currentUser] = { score: 0, pin: "" };
    setUsers(users);
  }
  document.getElementById("user-name").textContent = currentUser;
  updateScoreDisplay();
})();


// ==MiniGames and Modal Logic== 
function openGame(game) {
  document.getElementById('game-modal').classList.add('show');
  if (game === 'tic-tac-toe') showTicTacToe();
  if (game === 'memory-match') showMemoryMatch();
  if (game === 'snake') showSnake();
  if (game === '2048') show2048();
}
function closeGame() {
  document.getElementById('game-modal').classList.remove('show');
  document.getElementById('game-container').innerHTML = '';
  window.onkeydown = null;
}


// ==SINGLE PLAYER TIC TAC TOE== 
function showTicTacToe() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h3>Tic Tac Toe (Single Player)</h3><br>
    <div class="game-area">
      <div>
        <div id="ttt-board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;width:180px;margin:0 auto;">
          ${'<div class="ttt-cell" style="height:50px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#333;cursor:pointer;border-radius:6px;"></div>'.repeat(9)}
        </div>
        <div id="ttt-status" class="status"></div>
      </div>
      <div class="score-panel">
        <div>Your Score: <span id="ttt-score-x">0</span></div>
        <div>Bot Score: <span id="ttt-score-o">0</span></div>
      </div>
    </div>
    <br><button onclick="showTicTacToe()"><span>Restart</span></button>
    <div id="ttt-finalscore" class="final-score"></div>`;
    
  // Initialize game state
  let userScore = 0, botScore = 0;
  let board = Array(9).fill('');
  let finished = false, totalMoves = 0;
  const status = document.getElementById('ttt-status');
  document.getElementById('ttt-status').textContent = 'Try to beat the bot by getting three in a row!';
  function updateScore() {
    document.getElementById('ttt-score-x').textContent = userScore;
    document.getElementById('ttt-score-o').textContent = botScore;
  }
  updateScore();
  const cells = document.querySelectorAll('.ttt-cell');
  cells.forEach((cell, i) => {
    cell.textContent = '';
    cell.onclick = () => {
      if (!finished && board[i] === '') {
        board[i] = 'X';
        cell.textContent = 'X';
        userScore++;
        addScore(1); // Add points to user
        totalMoves++;
        updateScore();
        if (win(board, 'X')) {
          status.textContent = `You Win! 🎉`;
          finished = true;
          addScore(5); // Bonus for winning
          showFinalScore();
          return;
        } else if (board.every(x => x)) {
          status.textContent = `It's a draw.`;
          finished = true;
          showFinalScore();
          return;
        }
        status.textContent = "Bot's move...";
        setTimeout(() => {
          botMove();
        }, 500);
      }
    };
  });
  function win(b, p) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    return lines.some(line => line.every(i => b[i] === p));
  }
  function botMove() {
    if (finished) return;
    const empties = board
      .map((v, idx) => v === '' ? idx : null)
      .filter(v => v !== null);
    if (empties.length === 0) return;
    const move = empties[Math.floor(Math.random() * empties.length)];
    board[move] = 'O';
    cells[move].textContent = 'O';
    botScore++;
    totalMoves++;
    updateScore();
    if (win(board, 'O')) {
      status.textContent = `Bot Wins! 😢`;
      finished = true;
      showFinalScore();
    } else if (board.every(x => x)) {
      status.textContent = `It's a draw.`;
      finished = true;
      showFinalScore();
    } else {
      status.textContent = "Your turn!";
    }
  }
  function showFinalScore() {
    document.getElementById('ttt-finalscore').textContent =
      `Game Over! Total Moves: ${totalMoves} | You: ${userScore}, Bot: ${botScore}`;
  }
}


// ==MEMORY MATCH==
function showMemoryMatch() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h3>Memory Match</h3><br>
    <div class="game-area">
      <div>
        <div id="mm-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;width:200px;margin:0 auto;"></div>
        <div id="mm-status" class="status"></div>
      </div>
      <div class="score-panel">
        <div>Score: <span id="mm-score">0</span></div>
      </div>
    </div>
    <br><button onclick="showMemoryMatch()"><span>Restart</span></button>
    <div id="mm-finalscore" class="final-score"></div>`;
  let score = 0, flips = 0;
  const emojis = ['😀', '🎲', '🦄', '🍕', '🚀', '🌈', '🐱', '🏀'];
  let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  let revealed = [], matched = [];
  let status = document.getElementById('mm-status');
  status.textContent = 'Find all matching pairs of emojis!';
  const board = document.getElementById('mm-board');
  board.innerHTML = '';
  function updateScore() {
    document.getElementById('mm-score').textContent = score;
  }
  updateScore();
  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.style = 'height:40px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:#333;cursor:pointer;border-radius:6px;';
    card.textContent = '';
    card.onclick = () => {
      if (matched.includes(i) || revealed.includes(i) || revealed.length === 2) return;
      card.textContent = emoji;
      revealed.push(i);
      flips++;
      if (revealed.length === 2) {
        setTimeout(() => {
          if (cards[revealed[0]] === cards[revealed[1]]) {
            matched.push(...revealed);
            score += 2; // +2 for a matched pair
            addScore(2); // Add to user score
            updateScore();
            if (matched.length === cards.length) {
              status.textContent = "You won!";
              addScore(5); // Bonus for winning
              showFinalScore();
            }
          } else {
            board.children[revealed[0]].textContent = '';
            board.children[revealed[1]].textContent = '';
            score--; // -1 for wrong pair
            updateScore();
          }
          revealed = [];
        }, 700);
      }
    };
    board.appendChild(card);
  });
  function showFinalScore() {
    document.getElementById('mm-finalscore').textContent =
      `Game Over! Total Flips: ${flips} | Final Score: ${score}`;
  }
}


// ==Snake==
function showSnake() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
  <h3>Snake</h3><br>
    <div class="game-area">
      <div>
        <canvas id="snake-canvas" width="240" height="240" style="background:#333;display:block;margin:0 auto;border-radius:8px;"></canvas>
        <div id="snake-status" class="status">Press any arrow key to start</div>
      </div>
      <div class="score-panel">
        <div>Score: <span id="snake-score">0</span></div>
      </div>
    </div>
    <br><button onclick="showSnake()"><span>Restart</span></button>
    <div id="snake-finalscore" class="final-score"></div>`;

  setTimeout(() => {
    let score = 0, totalMoves = 0;
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    let snake = [{ x: 6, y: 6 }];
    let dir = { x: 0, y: 0 }; // Start with no movement
    let food = { x: Math.floor(Math.random() * 12), y: Math.floor(Math.random() * 12) };
    let alive = true;
    let gameStarted = false;
    let gameSpeed = 350; // Slower speed (milliseconds between moves)
    let gameInterval;

    function updateScore() {
      document.getElementById('snake-score').textContent = score;
    }

    function draw() {
      ctx.clearRect(0, 0, 240, 240);
      // Draw snake
      ctx.fillStyle = '#00fff0';
      snake.forEach(s => ctx.fillRect(s.x * 20, s.y * 20, 18, 18));
      // Draw food
      ctx.fillStyle = '#ff0044';
      ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
    }

    function gameOver() {
      clearInterval(gameInterval);
      alive = false;
      document.getElementById('snake-status').textContent = 'Game Over!';
      addScore(score);
      showFinalScore();
    }

    function moveSnake() {
      if (!alive || !gameStarted) return;

      let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Check collisions
      if (head.x < 0 || head.x > 11 || head.y < 0 || head.y > 11 ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
      }

      snake.unshift(head);
      totalMoves++;

      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        score += 5;
        updateScore();
        addScore(5);
        // Generate new food
        do {
          food = { x: Math.floor(Math.random() * 12), y: Math.floor(Math.random() * 12) };
        } while (snake.some(s => s.x === food.x && s.y === food.y));
      } else {
        snake.pop();
      }

      score++;
      updateScore();
      draw();
    }

    function showFinalScore() {
      document.getElementById('snake-finalscore').textContent =
        `Game Over! Total Moves: ${totalMoves} | Final Score: ${score}`;
    }

    function startGame() {
      if (!gameStarted) {
        gameStarted = true;
        document.getElementById('snake-status').textContent = 'Game started!';
        gameInterval = setInterval(moveSnake, gameSpeed);
      }
    }

    updateScore();
    draw();

    window.onkeydown = e => {
      if (!alive) return;

      // Start game on first key press if not started
      if (!gameStarted && (e.key.startsWith('Arrow'))) {
        startGame();
      }

      // Change direction
      if (e.key === 'ArrowUp' && dir.y !== 1) dir = { x: 0, y: -1 };
      else if (e.key === 'ArrowDown' && dir.y !== -1) dir = { x: 0, y: 1 };
      else if (e.key === 'ArrowLeft' && dir.x !== 1) dir = { x: -1, y: 0 };
      else if (e.key === 'ArrowRight' && dir.x !== -1) dir = { x: 1, y: 0 };
    };
  }, 0);
}



// ==2048==
function show2048() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h3>2048</h3><br>
    <div class="game-area">
      <div>
        <div id="g2048-board" style="width:220px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:5px;"></div>
        <div id="g2048-status" class="status"></div>
      </div>
      <div class="score-panel">
        <div>Score: <span id="g2048-score">0</span></div>
      </div>
    </div>
    <br><button onclick="show2048()"><span>Restart</span></button>
    <div id="g2048-finalscore" class="final-score"></div>`;
  let score = 0, moves = 0;
  let board = Array(16).fill(0);
  function randomTile() {
    let empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
    if (empty.length) board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  }
  randomTile(); randomTile();
  updateBoard();
  document.getElementById('g2048-status').textContent = 'Use arrow keys to combine tiles and reach 2048!';
  function updateScore() {
    document.getElementById('g2048-score').textContent = score;
  }
  updateScore();
  function updateBoard() {
    const grid = document.getElementById('g2048-board');
    grid.innerHTML = '';
    board.forEach((v, i) => {
      const c = document.createElement('div');
      c.style.cssText = `
        height:40px;
        background:#${v ? '00fff0' : '333'};
        color:#${v ? '222' : 'fff'};
        font-size:1.2rem;font-weight:bold;
        display:flex;align-items:center;justify-content:center;
        border-radius:6px;
        transition:background 0.2s;`;
      c.textContent = v ? v : '';
      grid.appendChild(c);
    });
  }
  window.onkeydown = function (e) {
    let moved = false;
    let mergeScore = 0;
    function slide(arr) {
      let out = arr.filter(v => v);
      for (let i = 0; i < out.length - 1; i++)
        if (out[i] === out[i + 1]) { out[i] *= 2; mergeScore += out[i]; out[i + 1] = 0; }
      return out.filter(v => v).concat(Array(4 - out.filter(v => v).length).fill(0));
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      let rows = [0, 1, 2, 3].map(i => board.slice(i * 4, i * 4 + 4));
      let cols = [0, 1, 2, 3].map(i => [board[i], board[4 + i], board[8 + i], board[12 + i]]);
      let newBoard = Array(16).fill(0);
      if (e.key === 'ArrowLeft') {
        rows = rows.map(slide);
        rows.forEach((r, i) => r.forEach((v, j) => newBoard[i * 4 + j] = v));
      }
      if (e.key === 'ArrowRight') {
        rows = rows.map(r => slide(r.reverse()).reverse());
        rows.forEach((r, i) => r.forEach((v, j) => newBoard[i * 4 + j] = v));
      }
      if (e.key === 'ArrowUp') {
        cols = cols.map(slide);
        cols.forEach((c, i) => c.forEach((v, j) => newBoard[j * 4 + i] = v));
      }
      if (e.key === 'ArrowDown') {
        cols = cols.map(c => slide(c.reverse()).reverse());
        cols.forEach((c, i) => c.forEach((v, j) => newBoard[j * 4 + i] = v));
      }
      if (newBoard.toString() !== board.toString()) {
        board = newBoard;
        randomTile();
        score += mergeScore;
        addScore(mergeScore); // Add merge score to user
        moves++;
        updateScore();
        updateBoard();
        if (!canMove()) {
          document.getElementById('g2048-status').textContent = 'Game Over!';
          showFinalScore();
        }
      }
    }
  };
  function canMove() {
    for (let i = 0; i < 16; i++) {
      if (board[i] === 0) return true;
      if (i % 4 < 3 && board[i] === board[i + 1]) return true;
      if (i < 12 && board[i] === board[i + 4]) return true;
    }
    return false;
  }
  function showFinalScore() {
    document.getElementById('g2048-finalscore').textContent =
      `Game Over! Total Moves: ${moves} | Final Score: ${score}`;
  }
}