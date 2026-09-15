import React from 'react';

interface ChessPieceSvgProps {
  piece: string;
  className?: string;
}

export const ChessPieceSvg: React.FC<ChessPieceSvgProps> = ({ piece, className = 'w-full h-full' }) => {
  const isWhite = piece === piece.toUpperCase();
  const type = piece.toLowerCase();

  const whiteFill = '#FFFFFF';
  const whiteStroke = '#0f172a';
  const blackFill = '#0f172a';
  const blackStroke = '#ffffff';

  switch (type) {
    case 'k':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={whiteStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={whiteFill} stroke={whiteStroke} />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z" fill={whiteFill} stroke={whiteStroke} />
            <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" stroke={whiteStroke} />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={blackStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" stroke={blackStroke} />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={blackFill} stroke={blackStroke} />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z" fill={blackFill} stroke={blackStroke} />
            <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" stroke={blackStroke} />
          </g>
        </svg>
      );
    case 'q':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={whiteFill} fillRule="evenodd" stroke={whiteStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.5-5.2 14-3-14.5-3 14.5-5.2-14L14 25 6.5 13.5 9 26z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0M11 38.5c6.5-1.5 16.5-1.5 23 0" fill="none" stroke={whiteStroke} />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={blackFill} fillRule="evenodd" stroke={blackStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.5-5.2 14-3-14.5-3 14.5-5.2-14L14 25 6.5 13.5 9 26z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0M11 38.5c6.5-1.5 16.5-1.5 23 0" fill="none" stroke={blackStroke} />
          </g>
        </svg>
      );
    case 'r':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={whiteFill} fillRule="evenodd" stroke={whiteStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" fill="none" stroke={whiteStroke} />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={blackFill} fillRule="evenodd" stroke={blackStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" fill="none" stroke={blackStroke} />
          </g>
        </svg>
      );
    case 'b':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={whiteStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <g fill={whiteFill}>
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-5.5.5-1.5 1.5-2.5 1.5-4.5 0-4-3.5-7.5-6.5-7.5s-6.5 3.5-6.5 7.5c0 2 1 3 1.5 4.5 0 1.5-2.5 3-2.5 5.5 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path d="M17.5 26h10M15 30h15M22.5 10v4M20 12h5" strokeLinejoin="miter" stroke={whiteStroke} />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={blackStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <g fill={blackFill}>
              <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-5.5.5-1.5 1.5-2.5 1.5-4.5 0-4-3.5-7.5-6.5-7.5s-6.5 3.5-6.5 7.5c0 2 1 3 1.5 4.5 0 1.5-2.5 3-2.5 5.5 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path d="M17.5 26h10M15 30h15M22.5 10v4M20 12h5" strokeLinejoin="miter" stroke={blackStroke} />
          </g>
        </svg>
      );
    case 'n':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={whiteStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={whiteFill} stroke={whiteStroke} />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-4.04 3-6 2.1-2.6 4.46-4.94 4-8.5-.66-4.8 2.09-8.49 6-9.5 0 0 .5 3 2 4s4.5 2 6 0c1.5-2-.5-5-3-7-2.5-2-5.5-2-8-.5-2.5 1.5-4.5 4.5-5 7.5s-3 5.5-5 6.5c-2 1-4 1.5-4.5 2.5s0 2.5 1 3.5 2.5 1 4 .5 3-2 4-4 3-5 4-6c1-1 2.5-1 3 0s1.5 1 2 2z" fill={whiteFill} stroke={whiteStroke} />
            <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill={whiteStroke} stroke={whiteStroke} />
            <path d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 1 1 1 0z" fill={whiteStroke} stroke={whiteStroke} transform="rotate(30 14.5 15.5)" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill="none" fillRule="evenodd" stroke={blackStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill={blackFill} stroke={blackStroke} />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-4.04 3-6 2.1-2.6 4.46-4.94 4-8.5-.66-4.8 2.09-8.49 6-9.5 0 0 .5 3 2 4s4.5 2 6 0c1.5-2-.5-5-3-7-2.5-2-5.5-2-8-.5-2.5 1.5-4.5 4.5-5 7.5s-3 5.5-5 6.5c-2 1-4 1.5-4.5 2.5s0 2.5 1 3.5 2.5 1 4 .5 3-2 4-4 3-5 4-6c1-1 2.5-1 3 0s1.5 1 2 2z" fill={blackFill} stroke={blackStroke} />
            <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill={blackStroke} stroke={blackStroke} />
            <path d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 1 1 1 0z" fill={blackStroke} stroke={blackStroke} transform="rotate(30 14.5 15.5)" />
          </g>
        </svg>
      );
    case 'p':
    default:
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={whiteFill}
            stroke={whiteStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={blackFill}
            stroke={blackStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
};