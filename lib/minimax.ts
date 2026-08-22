import { Chess } from 'chess.js';

// Piece value weightings
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Positional bonuses (from White's perspective)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  5,  5,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  5,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDDLEGAME_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

// Evaluate the current board state
function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (!square) continue;

      const type = square.type;
      const color = square.color;
      let val = PIECE_VALUES[type] || 0;

      // Add positional bonus
      let bonus = 0;
      const tableRow = color === 'w' ? 7 - r : r;
      const tableCol = color === 'w' ? c : 7 - c;

      if (type === 'p') bonus = PAWN_TABLE[tableRow][tableCol];
      else if (type === 'n') bonus = KNIGHT_TABLE[tableRow][tableCol];
      else if (type === 'b') bonus = BISHOP_TABLE[tableRow][tableCol];
      else if (type === 'r') bonus = ROOK_TABLE[tableRow][tableCol];
      else if (type === 'q') bonus = QUEEN_TABLE[tableRow][tableCol];
      else if (type === 'k') bonus = KING_MIDDLEGAME_TABLE[tableRow][tableCol];

      const pieceValue = val + bonus;
      if (color === 'w') {
        score += pieceValue;
      } else {
        score -= pieceValue;
      }
    }
  }

  // Return from the perspective of the active color
  return chess.turn() === 'w' ? score : -score;
}

// Alpha-Beta Minimax search
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; move: string | null } {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess), move: null };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluateBoard(chess), move: null };
  }

  // Simple move ordering: prioritize captures
  moves.sort((a, b) => {
    const scoreA = a.captured ? PIECE_VALUES[a.captured] : 0;
    const scoreB = b.captured ? PIECE_VALUES[b.captured] : 0;
    return scoreB - scoreA;
  });

  let bestMove: string | null = null;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const m of moves) {
      chess.move(m.lan);
      const { score } = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      if (score > maxScore) {
        maxScore = score;
        bestMove = m.lan;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Prune
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const m of moves) {
      chess.move(m.lan);
      const { score } = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (score < minScore) {
        minScore = score;
        bestMove = m.lan;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Prune
    }
    return { score: minScore, move: bestMove };
  }
}

// Public function to calculate the best bot move
export function calculateBotMove(pgn: string, difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'): string {
  const chess = new Chess();
  if (pgn) chess.loadPgn(pgn);

  const moves = chess.moves();
  if (moves.length === 0) return '';

  // 1. Beginner: 40% random move, otherwise depth 1 minimax
  if (difficulty === 'BEGINNER') {
    if (Math.random() < 0.4) {
      const idx = Math.floor(Math.random() * moves.length);
      return moves[idx];
    }
    const { move } = minimax(chess, 1, -Infinity, Infinity, true);
    return move || moves[0];
  }

  // 2. Intermediate: 15% random move, otherwise depth 2 minimax
  if (difficulty === 'INTERMEDIATE') {
    if (Math.random() < 0.15) {
      const idx = Math.floor(Math.random() * moves.length);
      return moves[idx];
    }
    const { move } = minimax(chess, 2, -Infinity, Infinity, true);
    return move || moves[0];
  }

  // 3. Advanced: Depth 3 minimax search (strict positional evaluation)
  if (difficulty === 'ADVANCED') {
    const { move } = minimax(chess, 3, -Infinity, Infinity, true);
    return move || moves[0];
  }

  // 4. Expert: Depth 4 minimax search (strict deep positional evaluation)
  if (difficulty === 'EXPERT') {
    const { move } = minimax(chess, 4, -Infinity, Infinity, true);
    return move || moves[0];
  }

  return moves[0];
}
