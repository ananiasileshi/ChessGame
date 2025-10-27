function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const moves = [];
    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    switch (pieceType) {
        case 'p':
            moves.push(...getPawnMoves(row, col, isWhite));
            break;
        case 'n':
            moves.push(...getKnightMoves(row, col, isWhite));
            break;
        case 'b':
            moves.push(...getBishopMoves(row, col, isWhite));
            break;
        case 'r':
            moves.push(...getRookMoves(row, col, isWhite));
            break;
        case 'q':
            moves.push(...getQueenMoves(row, col, isWhite));
            break;
        case 'k':
            moves.push(...getKingMoves(row, col, isWhite));
            break;
    }

    return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col, isWhite));
}

function getPawnMoves(row, col, isWhite) {
    const moves = [];
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
        moves.push({ row: row + direction, col });

        if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col });
        }
    }

    [-1, 1].forEach(offset => {
        if (isValidSquare(row + direction, col + offset)) {
            const target = board[row + direction][col + offset];
            if (target && isOpponentPiece(target, isWhite)) {
                moves.push({ row: row + direction, col: col + offset });
            }
        }
    });

    if (enPassantTarget && 
        ((isWhite && row === 3) || (!isWhite && row === 4))) {
        if (Math.abs(col - enPassantTarget.col) === 1 && 
            row + direction === enPassantTarget.row) {
            moves.push({ row: enPassantTarget.row, col: enPassantTarget.col });
        }
    }

    return moves;
}

function getKnightMoves(row, col, isWhite) {
    const moves = [];
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    knightMoves.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidSquare(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || isOpponentPiece(target, isWhite)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });

    return moves;
}

function getBishopMoves(row, col, isWhite) {
    const moves = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    directions.forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            
            if (!isValidSquare(newRow, newCol)) break;
            
            const target = board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (isOpponentPiece(target, isWhite)) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
        }
    });

    return moves;
}

function getRookMoves(row, col, isWhite) {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    directions.forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            
            if (!isValidSquare(newRow, newCol)) break;
            
            const target = board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (isOpponentPiece(target, isWhite)) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
        }
    });

    return moves;
}

function getQueenMoves(row, col, isWhite) {
    return [...getBishopMoves(row, col, isWhite), ...getRookMoves(row, col, isWhite)];
}

function getKingMoves(row, col, isWhite) {
    const moves = [];
    const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    kingMoves.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isValidSquare(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || isOpponentPiece(target, isWhite)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });

    if (!isInCheck(isWhite)) {
        const castlingRow = isWhite ? 7 : 0;
        
        if ((isWhite && castlingRights.whiteKingside) || (!isWhite && castlingRights.blackKingside)) {
            if (!board[castlingRow][5] && !board[castlingRow][6] &&
                !wouldBeInCheck(row, col, castlingRow, 5, isWhite) &&
                !wouldBeInCheck(row, col, castlingRow, 6, isWhite)) {
                moves.push({ row: castlingRow, col: 6 });
            }
        }
        
        if ((isWhite && castlingRights.whiteQueenside) || (!isWhite && castlingRights.blackQueenside)) {
            if (!board[castlingRow][1] && !board[castlingRow][2] && !board[castlingRow][3] &&
                !wouldBeInCheck(row, col, castlingRow, 3, isWhite) &&
                !wouldBeInCheck(row, col, castlingRow, 2, isWhite)) {
                moves.push({ row: castlingRow, col: 2 });
            }
        }
    }

    return moves;
}

function isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isPlayerPiece(piece, player) {
    if (!piece) return false;
    return player === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
}

function isOpponentPiece(piece, isWhite) {
    if (!piece) return false;
    return isWhite ? piece === piece.toLowerCase() : piece === piece.toUpperCase();
}

function wouldBeInCheck(fromRow, fromCol, toRow, toCol, isWhite) {
    const tempBoard = board.map(row => [...row]);
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = null;

    const inCheck = isInCheck(isWhite);

    board = tempBoard;
    return inCheck;
}

function isInCheck(isWhite) {
    let kingPos = null;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.toLowerCase() === 'k' && isPlayerPiece(piece, isWhite ? 'white' : 'black')) {
                kingPos = { row, col };
                break;
            }
        }
        if (kingPos) break;
    }

    if (!kingPos) return false;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isOpponentPiece(piece, isWhite)) {
                const moves = getAttackingMoves(row, col);
                if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function getAttackingMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const moves = [];
    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

    switch (pieceType) {
        case 'p':
            const direction = isWhite ? -1 : 1;
            [-1, 1].forEach(offset => {
                if (isValidSquare(row + direction, col + offset)) {
                    moves.push({ row: row + direction, col: col + offset });
                }
            });
            break;
        case 'n':
            moves.push(...getKnightMoves(row, col, isWhite));
            break;
        case 'b':
            moves.push(...getBishopMoves(row, col, isWhite));
            break;
        case 'r':
            moves.push(...getRookMoves(row, col, isWhite));
            break;
        case 'q':
            moves.push(...getQueenMoves(row, col, isWhite));
            break;
        case 'k':
            const kingMoves = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            kingMoves.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (isValidSquare(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                }
            });
            break;
    }

    return moves;
}

function isCheckmate(isWhite) {
    if (!isInCheck(isWhite)) return false;
    return !hasLegalMoves(isWhite);
}

function isStalemate(isWhite) {
    if (isInCheck(isWhite)) return false;
    return !hasLegalMoves(isWhite);
}

function hasLegalMoves(isWhite) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isPlayerPiece(piece, isWhite ? 'white' : 'black')) {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) return true;
            }
        }
    }
    return false;
}

function isInsufficientMaterial() {
    const pieces = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col]) {
                pieces.push(board[row][col].toLowerCase());
            }
        }
    }
    
    if (pieces.length === 2 && pieces.every(p => p === 'k')) return true;
    
    if (pieces.length === 3 && pieces.filter(p => p === 'k').length === 2 && 
        pieces.includes('b')) return true;
    
    if (pieces.length === 3 && pieces.filter(p => p === 'k').length === 2 && 
        pieces.includes('n')) return true;
    
    return false;
}

function makeAIMove() {
    if (gameEnded) return;
    
    const moves = getAllPossibleMoves(false);
    if (moves.length === 0) return;
    
    let depth;
    switch(aiDifficulty) {
        case 'beginner':
            depth = 1;
            break;
        case 'intermediate':
            depth = 2;
            break;
        case 'advanced':
            depth = 3;
            break;
        case 'expert':
            depth = 4;
            break;
        default:
            depth = 2;
    }
    
    if (aiDifficulty === 'beginner') {
        const randomIndex = Math.floor(Math.random() * moves.length);
        const randomMove = moves[randomIndex];
        if (randomMove) {
            setTimeout(() => {
                makeMove(randomMove.from.row, randomMove.from.col, randomMove.to.row, randomMove.to.col);
            }, 300);
        }
        return;
    }
    
    let bestMove = null;
    let bestValue = -Infinity;
    
    moves.forEach(move => {
        const tempBoard = board.map(row => [...row]);
        const tempCastling = {...castlingRights};
        const tempEnPassant = enPassantTarget;
        
        board[move.to.row][move.to.col] = board[move.from.row][move.from.col];
        board[move.from.row][move.from.col] = null;
        
        const value = minimax(depth, -Infinity, Infinity, false);
        
        board = tempBoard;
        castlingRights = tempCastling;
        enPassantTarget = tempEnPassant;
        
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    });
    
    if (bestMove) {
        setTimeout(() => {
            makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
        }, 300);
    }
}

function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
        return evaluatePosition();
    }
    
    const moves = getAllPossibleMoves(isMaximizing);
    
    if (moves.length === 0) {
        if (isInCheck(isMaximizing)) {
            return isMaximizing ? -1000 : 1000;
        }
        return 0;
    }
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const tempBoard = board.map(row => [...row]);
            board[move.to.row][move.to.col] = board[move.from.row][move.from.col];
            board[move.from.row][move.from.col] = null;
            
            const evalScore = minimax(depth - 1, alpha, beta, false);
            board = tempBoard;
            
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const tempBoard = board.map(row => [...row]);
            board[move.to.row][move.to.col] = board[move.from.row][move.from.col];
            board[move.from.row][move.from.col] = null;
            
            const evalScore = minimax(depth - 1, alpha, beta, true);
            board = tempBoard;
            
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluatePosition() {
    let score = 0;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const value = pieceValues[piece] * 10;
                score += value;
                
                if ((row === 3 || row === 4) && (col === 3 || col === 4)) {
                    score += piece === piece.toUpperCase() ? -2 : 2;
                }
            }
        }
    }
    
    return score;
}

function getAllPossibleMoves(isWhite) {
    const moves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isPlayerPiece(piece, isWhite ? 'white' : 'black')) {
                const validMoves = getValidMoves(row, col);
                validMoves.forEach(move => {
                    moves.push({
                        from: { row, col },
                        to: { row: move.row, col: move.col }
                    });
                });
            }
        }
    }
    
    return moves;
}

initializeBoard();
