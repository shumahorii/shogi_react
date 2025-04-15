import React, { useState } from 'react';
import './App.css';

type Player = 'black' | 'white';

interface Piece {
  type: string;
  owner: Player;
}

type Square = Piece | null;

const createInitialBoard = (): Square[][] => {
  const emptyRow = Array(9).fill(null);

  const board: Square[][] = [
    [
      { type: '香', owner: 'white' },
      { type: '桂', owner: 'white' },
      { type: '銀', owner: 'white' },
      { type: '金', owner: 'white' },
      { type: '玉', owner: 'white' },
      { type: '金', owner: 'white' },
      { type: '銀', owner: 'white' },
      { type: '桂', owner: 'white' },
      { type: '香', owner: 'white' },
    ],
    [
      null,
      { type: '飛', owner: 'white' },
      null,
      null,
      null,
      null,
      null,
      { type: '角', owner: 'white' },
      null,
    ],
    Array(9).fill({ type: '歩', owner: 'white' }),
    ...Array(3).fill(emptyRow),
    Array(9).fill({ type: '歩', owner: 'black' }),
    [
      null,
      { type: '角', owner: 'black' },
      null,
      null,
      null,
      null,
      null,
      { type: '飛', owner: 'black' },
      null,
    ],
    [
      { type: '香', owner: 'black' },
      { type: '桂', owner: 'black' },
      { type: '銀', owner: 'black' },
      { type: '金', owner: 'black' },
      { type: '玉', owner: 'black' },
      { type: '金', owner: 'black' },
      { type: '銀', owner: 'black' },
      { type: '桂', owner: 'black' },
      { type: '香', owner: 'black' },
    ],
  ];

  return board;
};

const App: React.FC = () => {
  const [board, setBoard] = useState<Square[][]>(createInitialBoard());
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  const shouldPromote = (piece: Piece, fromRow: number, toRow: number): boolean => {
    const zone = piece.owner === 'black' ? [0, 1, 2] : [6, 7, 8];
    return (
      ['歩', '銀', '桂', '角', '飛'].includes(piece.type) &&
      (zone.includes(fromRow) || zone.includes(toRow))
    );
  };

  const promote = (piece: Piece): Piece => {
    const map: Record<string, string> = {
      '歩': 'と',
      '銀': '成銀',
      '桂': '成桂',
      '角': '馬',
      '飛': '龍',
    };
    return { type: map[piece.type] || piece.type, owner: piece.owner };
  };

  const getMovablePositions = (piece: Piece, row: number, col: number): [number, number][] => {
    const moves: [number, number][] = [];
    const isInside = (r: number, c: number) =>
      r >= 0 && r < 9 && c >= 0 && c < 9 &&
      (!board[r][c] || board[r][c]?.owner !== piece.owner);
    const dir = piece.owner === 'black' ? -1 : 1;

    const goldLike = () => {
      [[dir, 0], [dir, -1], [dir, 1], [0, -1], [0, 1], [-dir, 0]].forEach(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        if (isInside(r, c)) moves.push([r, c]);
      });
    };

    switch (piece.type) {
      case '歩':
        if (isInside(row + dir, col)) moves.push([row + dir, col]);
        break;
      case '金':
      case 'と':
      case '成銀':
      case '成桂':
        goldLike();
        break;
      case '玉':
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (isInside(r, c)) moves.push([r, c]);
          }
        }
        break;
      case '銀':
        [[dir, 0], [dir, -1], [dir, 1], [-dir, -1], [-dir, 1]].forEach(([dr, dc]) => {
          const r = row + dr;
          const c = col + dc;
          if (isInside(r, c)) moves.push([r, c]);
        });
        break;
      case '桂':
        const r1 = row + 2 * dir;
        if (isInside(r1, col - 1)) moves.push([r1, col - 1]);
        if (isInside(r1, col + 1)) moves.push([r1, col + 1]);
        break;
      case '角':
      case '馬':
        for (let i = 1; i < 9; i++) {
          [[i, i], [i, -i], [-i, i], [-i, -i]].forEach(([dr, dc]) => {
            const r = row + dr;
            const c = col + dc;
            if (!isInside(r, c)) return;
            moves.push([r, c]);
            if (board[r][c]) return;
          });
        }
        if (piece.type === '馬') goldLike();
        break;
      case '飛':
      case '龍':
        for (let i = 1; i < 9; i++) {
          [[i, 0], [-i, 0], [0, i], [0, -i]].forEach(([dr, dc]) => {
            const r = row + dr;
            const c = col + dc;
            if (!isInside(r, c)) return;
            moves.push([r, c]);
            if (board[r][c]) return;
          });
        }
        if (piece.type === '龍') {
          [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
            const r = row + dr;
            const c = col + dc;
            if (isInside(r, c)) moves.push([r, c]);
          });
        }
        break;
    }

    return moves;
  };

  const handleClick = (row: number, col: number) => {
    const clicked = board[row][col];

    if (selectedPosition) {
      const [fromRow, fromCol] = selectedPosition;
      const piece = board[fromRow][fromCol];
      if (piece) {
        const movable = getMovablePositions(piece, fromRow, fromCol);
        const isMovable = movable.some(([r, c]) => r === row && c === col);

        if (isMovable) {
          const newBoard = board.map(r => [...r]);
          let movedPiece = piece;
          if (shouldPromote(piece, fromRow, row)) {
            movedPiece = promote(piece);
          }
          newBoard[row][col] = movedPiece;
          newBoard[fromRow][fromCol] = null;
          setBoard(newBoard);
          setSelectedPosition(null);
          return;
        }
      }
      setSelectedPosition(null);
    } else if (clicked && clicked.owner === 'black') {
      setSelectedPosition([row, col]);
    }
  };

  const movablePositions =
    selectedPosition && board[selectedPosition[0]][selectedPosition[1]]
      ? getMovablePositions(board[selectedPosition[0]][selectedPosition[1]]!, selectedPosition[0], selectedPosition[1])
      : [];

  return (
    <div className="app-container">
      <h1 className="title">将棋ゲーム</h1>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((square, colIndex) => {
              const isSelected =
                selectedPosition?.[0] === rowIndex && selectedPosition?.[1] === colIndex;
              const isMovable = movablePositions.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );

              return (
                <div
                  key={colIndex}
                  className={`board-cell ${isSelected ? 'selected' : ''} ${isMovable ? 'movable' : ''
                    }`}
                  onClick={() => handleClick(rowIndex, colIndex)}
                >
                  {square && (
                    <div
                      className={`piece ${square.owner === 'black' ? '' : 'piece-rotated'}`}
                    >
                      {square.type}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
