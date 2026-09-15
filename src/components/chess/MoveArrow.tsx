import React from 'react';

interface MoveArrowProps {
  from: string;
  to: string;
  isFlipped: boolean;
}

export const MoveArrow: React.FC<MoveArrowProps> = ({ from, to, isFlipped }) => {
  if (!from || !to || from.length !== 2 || to.length !== 2) return null;

  const fileToCol = (file: string) => file.charCodeAt(0) - 97;
  const rankToRow = (rank: string) => 8 - parseInt(rank, 10);

  let fromCol = fileToCol(from[0]);
  let fromRow = rankToRow(from[1]);
  let toCol = fileToCol(to[0]);
  let toRow = rankToRow(to[1]);

  if (isFlipped) {
    fromCol = 7 - fromCol;
    fromRow = 7 - fromRow;
    toCol = 7 - toCol;
    toRow = 7 - toRow;
  }

  const startX = (fromCol + 0.5) * (100 / 8);
  const startY = (fromRow + 0.5) * (100 / 8);
  const endX = (toCol + 0.5) * (100 / 8);
  const endY = (toRow + 0.5) * (100 / 8);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="4"
          markerHeight="4"
          refX="2.5"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0, 4 2, 0 4" fill="#3b82f6" fillOpacity="0.85" />
        </marker>
      </defs>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#3b82f6"
        strokeWidth="2.2"
        strokeOpacity="0.85"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
};