const PIECE_NAMES = {
    'K': 'king', 'Q': 'queen', 'R': 'rook', 'B': 'bishop', 'N': 'knight', 'P': 'pawn',
    'k': 'king', 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight', 'p': 'pawn'
};

let board = [];
let currentPlayer = 'white';
let selectedSquare = null;
let possibleMoves = [];
let moveHistory = [];
let gameMode = 'ai';
let aiDifficulty = 'intermediate';
let isFlipped = false;
let gameEnded = false;
let whiteTime = 600;
let blackTime = 600;
let timerInterval = null;
let draggedPiece = null;
let promotionPending = null;
let dragPreview = null;
let isDragging = false;

function playSound(type) {
    const audio = new Audio();
    if (type === 'move') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPLaizsIGGS57OScTgwOUKzn7bllGgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuIAUoe8/y3Yo8CRZiuOzqnVANCE+p5+y9Zx0GNYnU8tGAMQYfcsLu45ZFCw9YrufqsFoXCECY3PLEcSEEJnnP8+KMQQ0VYLXq66xVFApFnuDyvmwhBCh+zPLaizsIGGS57OScTgwOUKzn7bllGgU1jdT0z3wvBSJ0xe/glEILElyx6OyrWRUIRJve8sFuIAUoe8/y3Yo8CRVht+zqnVANCE+p5+y9Zx0GNYnU8tGAMQYfccPu45ZFCw9YrufqsFoXCD+Y3PLEcSEEJnnP8+KMQQ0VYLXq66xVFApFnuDyvmwhBCh+zPLaizsIGGS57OScTgwOUKzn7bllGgU1jdT0z3wvBSJ0xe/glEILElyx6OyrWRUIRJve8sFuIAUoe8/y3Yo8CRVht+zqnVANCE+p5+y9Zx0GNYnU8tGAMQYfccPu45ZFC';
    } else {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPLaizsIGGS57OScTgwOUKzn7bllGgU2jdXzzn0vBSF1xe/glEILElyx6OyrWBUIQ5zd8sFuIAUoe8/y3Yo8CRZiuOzqnVANCE+p5+y9Zx0GNYnU8tGAMQYfcsLu45ZFCw9YrufqsFoXCECY3PLEcSEEJnnP8+KMQQ0VYLXq66xVFApFnuDyvmwhBCh+zPLaizsIGGS57OScTgwOUKzn7bllGgU1jdT0z3wvBSJ0xe/glEILElyx6OyrWRUIRJve8sFuIAUoe8/y3Yo8CRVht+zqnVANCE+p5+y9Zx0GNYnU8tGAMQYfccPu45ZFCw9YrufqsFoXCD+Y3PLEcSEEJnnP8+KMQQ0VYLXq66xVFApFnuDyvmwhBCh+zPLaizsIGGS57OScTgwOUKzn7bllGgU1jdT0z3wvBSJ0xe/glEILElyx6OyrWRUIRJve8sFuIAUoe8/y3Yo8CRVht+zqnVANCE+p5+y9Zx0GNYnU8tGAMQYfccPu45ZFC';
    }
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

let castlingRights = {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true
};

let enPassantTarget = null;

const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const pieceValues = {
    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0,
    'P': -1, 'N': -3, 'B': -3, 'R': -5, 'Q': -9, 'K': 0
};

function initializeBoard() {
    board = initialBoard.map(row => [...row]);
    currentPlayer = 'white';
    selectedSquare = null;
    possibleMoves = [];
    moveHistory = [];
    gameEnded = false;
    whiteTime = 600;
    blackTime = 600;
    castlingRights = {
        whiteKingside: true,
        whiteQueenside: true,
        blackKingside: true,
        blackQueenside: true
    };
    enPassantTarget = null;
    
    renderBoard();
    updateStatus();
    updateMoveList();
    updatePlayerCards();
    startTimer();
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const displayRow = isFlipped ? 7 - row : row;
            const displayCol = isFlipped ? 7 - col : col;
            
            const square = document.createElement('div');
            square.className = 'square';
            square.className += (row + col) % 2 === 0 ? ' light' : ' dark';
            
            if (selectedSquare && selectedSquare.row === displayRow && selectedSquare.col === displayCol) {
                square.classList.add('selected');
            }
            
            if (moveHistory.length > 0) {
                const lastMove = moveHistory[moveHistory.length - 1];
                if ((lastMove.from.row === displayRow && lastMove.from.col === displayCol) ||
                    (lastMove.to.row === displayRow && lastMove.to.col === displayCol)) {
                    square.classList.add('last-move');
                }
            }
            
            const piece = board[displayRow][displayCol];
            if (piece && piece.toLowerCase() === 'k' && isInCheck(piece === piece.toUpperCase())) {
                square.classList.add('check');
            }
            
            square.dataset.row = displayRow;
            square.dataset.col = displayCol;
            
            square.addEventListener('click', () => handleSquareClick(displayRow, displayCol));
            square.addEventListener('dragover', (e) => e.preventDefault());
            square.addEventListener('drop', (e) => handleDrop(e, displayRow, displayCol));
            square.addEventListener('mouseup', (e) => {
                if (isDragging && draggedPiece) {
                    const move = possibleMoves.find(m => m.row === displayRow && m.col === displayCol);
                    if (move) {
                        makeMove(draggedPiece.row, draggedPiece.col, displayRow, displayCol);
                    }
                }
            });
            
            if (piece) {
                const pieceElement = document.createElement('div');
                const isWhite = piece === piece.toUpperCase();
                const pieceName = PIECE_NAMES[piece];
                pieceElement.className = `piece ${isWhite ? 'white' : 'black'} ${pieceName}`;
                pieceElement.draggable = false;
                
                pieceElement.addEventListener('mousedown', (e) => handleMouseDown(e, displayRow, displayCol));
                pieceElement.addEventListener('touchstart', (e) => handleTouchStart(e, displayRow, displayCol), { passive: false });
                
                square.appendChild(pieceElement);
            }
            
            boardElement.appendChild(square);
        }
    }
    
    highlightPossibleMoves();
}

function highlightPossibleMoves() {
    possibleMoves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (square) {
            if (board[move.row][move.col]) {
                square.classList.add('possible-capture');
            } else {
                square.classList.add('possible-move');
            }
        }
    });
}

function handleSquareClick(row, col) {
    if (gameEnded) return;
    
    const piece = board[row][col];
    
    if (selectedSquare) {
        const move = possibleMoves.find(m => m.row === row && m.col === col);
        if (move) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
        } else if (piece && isPlayerPiece(piece, currentPlayer) && 
                  (gameMode === 'human' || currentPlayer === 'white')) {
            selectedSquare = { row, col };
            possibleMoves = getValidMoves(row, col);
            renderBoard();
        } else {
            selectedSquare = null;
            possibleMoves = [];
            renderBoard();
        }
    } else if (piece && isPlayerPiece(piece, currentPlayer) && 
              (gameMode === 'human' || currentPlayer === 'white')) {
        selectedSquare = { row, col };
        possibleMoves = getValidMoves(row, col);
        renderBoard();
    }
}

function handleMouseDown(e, row, col) {
    e.preventDefault();
    if (gameEnded) return;
    
    const piece = board[row][col];
    if (!piece || !isPlayerPiece(piece, currentPlayer) || 
        (gameMode === 'ai' && currentPlayer === 'black')) return;
    
    isDragging = true;
    draggedPiece = { row, col, piece };
    selectedSquare = { row, col };
    possibleMoves = getValidMoves(row, col);
    
    const pieceElement = e.target;
    const rect = pieceElement.getBoundingClientRect();
    
    dragPreview = pieceElement.cloneNode(true);
    dragPreview.classList.add('drag-preview');
    dragPreview.style.width = '58px';
    dragPreview.style.height = '58px';
    document.body.appendChild(dragPreview);
    
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    
    dragPreview.style.left = (e.clientX - rect.width / 2) + 'px';
    dragPreview.style.top = (e.clientY - rect.height / 2) + 'px';
    
    pieceElement.style.opacity = '0.3';
    
    renderBoard();
    
    const handleMouseMove = (e) => {
        if (!isDragging || !dragPreview) return;
        
        dragPreview.style.left = (e.clientX - 29) + 'px';
        dragPreview.style.top = (e.clientY - 29) + 'px';
        
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        if (elementBelow && elementBelow.classList.contains('square')) {
            const targetRow = parseInt(elementBelow.dataset.row);
            const targetCol = parseInt(elementBelow.dataset.col);
            
            document.querySelectorAll('.square').forEach(sq => {
                sq.classList.remove('drag-over');
            });
            
            if (possibleMoves.find(m => m.row === targetRow && m.col === targetCol)) {
                elementBelow.classList.add('drag-over');
            }
        }
    };
    
    const handleMouseUp = (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        
        if (dragPreview) {
            dragPreview.remove();
            dragPreview = null;
        }
        
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        if (elementBelow && elementBelow.classList.contains('square')) {
            const targetRow = parseInt(elementBelow.dataset.row);
            const targetCol = parseInt(elementBelow.dataset.col);
            
            const move = possibleMoves.find(m => m.row === targetRow && m.col === targetCol);
            if (move && draggedPiece) {
                makeMove(draggedPiece.row, draggedPiece.col, targetRow, targetCol);
            }
        }
        
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('drag-over');
        });
        
        if (pieceElement) {
            pieceElement.style.opacity = '1';
        }
        
        draggedPiece = null;
        selectedSquare = null;
        possibleMoves = [];
        renderBoard();
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleTouchStart(e, row, col) {
    e.preventDefault();
    if (gameEnded) return;
    
    const piece = board[row][col];
    if (!piece || !isPlayerPiece(piece, currentPlayer) || 
        (gameMode === 'ai' && currentPlayer === 'black')) return;
    
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    
    e.target.dispatchEvent(mouseEvent);
}

function handleDrop(e, row, col) {
    e.preventDefault();
}

function makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    const piece = board[fromRow][fromCol];
    const isPawn = piece && piece.toLowerCase() === 'p';
    const isPromotionRow = (piece === 'P' && toRow === 0) || (piece === 'p' && toRow === 7);
    
    if (isPawn && isPromotionRow && !promotionPiece) {
        promotionPending = { fromRow, fromCol, toRow, toCol };
        showPromotionModal(piece === piece.toUpperCase());
        return;
    }

    let isEnPassant = false;
    if (piece && piece.toLowerCase() === 'p' && enPassantTarget && 
        toRow === enPassantTarget.row && toCol === enPassantTarget.col) {
        isEnPassant = true;
    }
    
    const capturedPiece = board[toRow][toCol] || (isEnPassant ? board[fromRow][toCol] : null);
    
    const moveData = {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: piece,
        capturedPiece: capturedPiece,
        notation: getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece, promotionPiece),
        castlingRights: {...castlingRights},
        enPassantTarget: enPassantTarget
    };

    updateCastlingRights(piece, fromRow, fromCol);

    board[toRow][toCol] = promotionPiece || piece;
    board[fromRow][fromCol] = null;
    
    if (isEnPassant) {
        board[fromRow][toCol] = null;
    }
    
    enPassantTarget = null;
    if (piece && piece.toLowerCase() === 'p' && Math.abs(toRow - fromRow) === 2) {
        enPassantTarget = {
            row: (fromRow + toRow) / 2,
            col: fromCol
        };
    }
    
    if (piece && piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
        if (toCol > fromCol) {
            board[toRow][5] = board[toRow][7];
            board[toRow][7] = null;
        } else {
            board[toRow][3] = board[toRow][0];
            board[toRow][0] = null;
        }
    }
    
    moveHistory.push(moveData);
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    selectedSquare = null;
    possibleMoves = [];
    
    renderBoard();
    updateStatus();
    updateMoveList();
    updatePlayerCards();
    
    if (capturedPiece) {
        playSound('capture');
    } else {
        playSound('move');
    }
    
    if (isCheckmate(currentPlayer === 'white')) {
        endGame(`${currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate!`);
    } else if (isStalemate(currentPlayer === 'white')) {
        endGame('Draw by stalemate');
    } else if (isInsufficientMaterial()) {
        endGame('Draw by insufficient material');
    } else if (gameMode === 'ai' && currentPlayer === 'black' && !gameEnded) {
        setTimeout(makeAIMove, 500);
    }
}

function updateCastlingRights(piece, fromRow, fromCol) {
    if (!piece) return;
    
    if (piece === 'K') {
        castlingRights.whiteKingside = false;
        castlingRights.whiteQueenside = false;
    } else if (piece === 'k') {
        castlingRights.blackKingside = false;
        castlingRights.blackQueenside = false;
    } else if (piece === 'R') {
        if (fromRow === 7 && fromCol === 0) castlingRights.whiteQueenside = false;
        if (fromRow === 7 && fromCol === 7) castlingRights.whiteKingside = false;
    } else if (piece === 'r') {
        if (fromRow === 0 && fromCol === 0) castlingRights.blackQueenside = false;
        if (fromRow === 0 && fromCol === 7) castlingRights.blackKingside = false;
    }
}

function showPromotionModal(isWhite) {
    const modal = document.getElementById('promotion-modal');
    const piecesDiv = document.getElementById('promotion-pieces');
    piecesDiv.innerHTML = '';
    
    const pieces = isWhite ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    pieces.forEach(piece => {
        const pieceDiv = document.createElement('div');
        const pieceName = PIECE_NAMES[piece];
        pieceDiv.className = `promotion-piece piece ${isWhite ? 'white' : 'black'} ${pieceName}`;
        pieceDiv.style.width = '70px';
        pieceDiv.style.height = '70px';
        pieceDiv.onclick = () => {
            modal.style.display = 'none';
            makeMove(promotionPending.fromRow, promotionPending.fromCol, 
                    promotionPending.toRow, promotionPending.toCol, piece);
            promotionPending = null;
        };
        piecesDiv.appendChild(pieceDiv);
    });
    
    modal.style.display = 'block';
}

function getMoveNotation(fromRow, fromCol, toRow, toCol, capturedPiece, promotionPiece) {
    const piece = board[fromRow][fromCol];
    const capture = capturedPiece ? 'x' : '';
    const fromFile = String.fromCharCode(97 + fromCol);
    const toFile = String.fromCharCode(97 + toCol);
    const toRank = 8 - toRow;
    
    let notation = '';
    
    if (piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
        return toCol > fromCol ? 'O-O' : 'O-O-O';
    }
    
    if (piece.toLowerCase() === 'p') {
        if (capture) {
            notation = fromFile + capture;
        }
        notation += toFile + toRank;
        if (promotionPiece) {
            notation += '=' + promotionPiece.toUpperCase();
        }
    } else {
        notation = piece.toUpperCase() + capture + toFile + toRank;
    }
    
    return notation;
}

function updateStatus() {
    const statusElement = document.getElementById('status');
    if (gameEnded) {
        return;
    }
    
    if (isInCheck(currentPlayer === 'white')) {
        statusElement.textContent = `${currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
    } else {
        statusElement.textContent = `${currentPlayer === 'white' ? 'White' : 'Black'} to move`;
    }
}

function updateMoveList() {
    const moveListElement = document.getElementById('move-list-content');
    moveListElement.innerHTML = '';
    
    for (let i = 0; i < moveHistory.length; i += 2) {
        const moveRow = document.createElement('div');
        moveRow.className = 'move-row';
        
        const moveNumber = document.createElement('div');
        moveNumber.className = 'move-number';
        moveNumber.textContent = Math.floor(i / 2) + 1 + '.';
        moveRow.appendChild(moveNumber);
        
        const whiteMove = document.createElement('div');
        whiteMove.className = 'move';
        whiteMove.textContent = moveHistory[i].notation;
        moveRow.appendChild(whiteMove);
        
        if (i + 1 < moveHistory.length) {
            const blackMove = document.createElement('div');
            blackMove.className = 'move';
            blackMove.textContent = moveHistory[i + 1].notation;
            moveRow.appendChild(blackMove);
        } else {
            moveRow.appendChild(document.createElement('div'));
        }
        
        moveListElement.appendChild(moveRow);
    }
    
    moveListElement.scrollTop = moveListElement.scrollHeight;
}

function updatePlayerCards() {
    document.getElementById('white-player').classList.toggle('active', currentPlayer === 'white');
    document.getElementById('black-player').classList.toggle('active', currentPlayer === 'black');
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameEnded) {
            if (currentPlayer === 'white') {
                whiteTime--;
            } else {
                blackTime--;
            }
            
            updateTimerDisplay();
            
            if (whiteTime <= 0 || blackTime <= 0) {
                clearInterval(timerInterval);
                const winner = whiteTime <= 0 ? 'Black' : 'White';
                endGame(`${winner} wins on time!`);
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('white-time').textContent = formatTime(whiteTime);
    document.getElementById('black-time').textContent = formatTime(blackTime);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function endGame(message) {
    gameEnded = true;
    clearInterval(timerInterval);
    document.getElementById('game-end-message').textContent = message;
    document.getElementById('game-end-modal').style.display = 'block';
    document.getElementById('status').textContent = message;
}

function closeEndModal() {
    document.getElementById('game-end-modal').style.display = 'none';
}

function newGame() {
    closeEndModal();
    initializeBoard();
}

function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    
    board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
    
    castlingRights = lastMove.castlingRights;
    enPassantTarget = lastMove.enPassantTarget;
    
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    renderBoard();
    updateStatus();
    updateMoveList();
    updatePlayerCards();
}

function flipBoard() {
    isFlipped = !isFlipped;
    renderBoard();
}

function setGameMode(mode) {
    gameMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const diffPanel = document.getElementById('difficulty-panel');
    if (mode === 'human') {
        document.getElementById('black-player').querySelector('.player-name').textContent = 'Player 2';
        diffPanel.style.display = 'none';
    } else {
        document.getElementById('black-player').querySelector('.player-name').textContent = 'Computer';
        diffPanel.style.display = 'block';
    }
    
    newGame();
}

function setDifficulty(level) {
    aiDifficulty = level;
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}
