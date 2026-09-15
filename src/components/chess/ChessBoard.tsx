import React, { useMemo, useState } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPieceSvg } from './pieces/ChessPieceSvg';
import { MoveArrow } from './MoveArrow';

interface ChessBoardProps {
  fen: string;
  playerColor: 'w' | 'b';
  onMove: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
  arrowMove?: { from: string; to: string } | null;
  isLive?: boolean;
  isMyTurn?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  playerColor,
  onMove,
  disabled = false,
  lastMove = null,
  arrowMove = null,
  isLive = true,
  isMyTurn = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const isFlipped = playerColor === 'b';

  const boardGrid = useMemo(() => {
    const rows = fen.split(' ')[0].split('/');
    const grid: (string | null)[][] = [];

    for (const row of rows) {
      const rowPieces: (string | null)[] = [];
      for (const char of row) {
        if (!isNaN(parseInt(char, 10))) {
          const emptyCount = parseInt(char, 10);
          for (let i = 0; i < emptyCount; i++) {
            rowPieces.push(null);
          }
        } else {
          rowPieces.push(char);
        }
      }
      grid.push(rowPieces);
    }
    return grid;
  }, [fen]);

  const legalDestinations = useMemo(() => {
    if (!selectedSquare || disabled || !isLive) return new Set<string>();
    try {
      const chess = new Chess(fen);
      const moves = chess.moves({ square: selectedSquare as Square, verbose: true });
      return new Set(moves.map((m: any) => m.to));
    } catch {
      return new Set<string>();
    }
  }, [fen, selectedSquare, disabled, isLive]);

  const getSquareName = (row: number, col: number) => {
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    return `${file}${rank}`;
  };

  const handleSquareClick = (square: string, piece: string | null) => {
    if (disabled || !isLive) return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (piece && ((playerColor === 'w' && piece === piece.toUpperCase()) || (playerColor === 'b' && piece === piece.toLowerCase()))) {
        setSelectedSquare(square);
        return;
      }

      const isPawnPromotion =
        (selectedSquare[1] === '7' && square[1] === '8' && playerColor === 'w') ||
        (selectedSquare[1] === '2' && square[1] === '1' && playerColor === 'b');

      onMove(selectedSquare, square, isPawnPromotion ? 'q' : undefined);
      setSelectedSquare(null);
    } else {
      if (piece) {
        const isMyPiece = playerColor === 'w' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
        if (isMyPiece) {
          setSelectedSquare(square);
        }
      }
    }
  };

  const displayRows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const displayCols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div
      className={`relative w-full max-w-[480px] aspect-square select-none rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
        isMyTurn && isLive
          ? 'border-primary ring-4 ring-primary/40 shadow-primary/30'
          : 'border-card/80 ring-1 ring-border'
      }`}
    >
      <div className="w-full h-full grid grid-cols-8 grid-rows-8">
        {displayRows.map((r) =>
          displayCols.map((c) => {
            const squareName = getSquareName(r, c);
            const piece = boardGrid[r]?.[c] || null;
            const isLight = (r + c) % 2 === 0;
            const isSelected = selectedSquare === squareName;
            const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
            const isLegalDest = legalDestinations.has(squareName);

            return (
              <div
                key={squareName}
                onClick={() => handleSquareClick(squareName, piece)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                  isLight ? 'bg-[#eeeed2] dark:bg-[#e2d6b5]' : 'bg-[#769656] dark:bg-[#b88b4a]'
                } ${isSelected ? 'ring-4 ring-inset ring-amber-400 !bg-amber-200/90 dark:!bg-amber-400/70' : ''} ${
                  isLastMoveSquare && !isSelected
                    ? isLight
                      ? '!bg-[#f5f682] dark:!bg-[#baca44] ring-2 ring-inset ring-amber-600/30 dark:ring-amber-400/30'
                      : '!bg-[#b9ca43] dark:!bg-[#98a135] ring-2 ring-inset ring-amber-600/30 dark:ring-amber-400/30'
                    : ''
                }`}
              >
                {piece && (
                  <div className="w-[82%] h-[82%] flex items-center justify-center pointer-events-none drop-shadow-md z-0">
                    <ChessPieceSvg piece={piece} />
                  </div>
                )}

                {isLegalDest && !piece && (
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-900/30 dark:bg-white/40 pointer-events-none z-10 animate-in zoom-in-50" />
                )}

                {isLegalDest && piece && (
                  <div className="absolute inset-1 rounded-full border-4 border-red-500/50 dark:border-red-400/60 pointer-events-none z-10 animate-in zoom-in-75" />
                )}

                {r === (isFlipped ? 0 : 7) && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[9px] font-bold ${
                      isLight ? 'text-[#769656] dark:text-[#b88b4a]' : 'text-[#eeeed2] dark:text-[#e2d6b5]'
                    }`}
                  >
                    {String.fromCharCode(97 + c)}
                  </span>
                )}

                {c === (isFlipped ? 7 : 0) && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] font-bold ${
                      isLight ? 'text-[#769656] dark:text-[#b88b4a]' : 'text-[#eeeed2] dark:text-[#e2d6b5]'
                    }`}
                  >
                    {8 - r}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {arrowMove && (
        <MoveArrow from={arrowMove.from} to={arrowMove.to} isFlipped={isFlipped} />
      )}
    </div>
  );
};