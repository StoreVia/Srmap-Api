'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Clock,
  Swords,
  Gamepad2,
  Users,
  WifiOff,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useArcadeSocket } from '@/hooks/arcade/useArcadeSocket';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { GameHeader } from '@/components/chess/GameHeader';
import { MoveControls } from '@/components/chess/MoveControls';
import { ChessChat } from '@/components/chess/ChessChat';
import { ActiveGameCard } from '@/components/chess/ActiveGameCard';
import { FriendChallengeDialog } from '@/components/chess/FriendChallengeDialog';
import { GameOverModal } from '@/components/chess/GameOverModal';
import { ResignDialog } from '@/components/chess/ResignDialog';
import { DrawOfferDialog } from '@/components/chess/DrawOfferDialog';
import { SearchingOverlay } from '@/components/chess/SearchingOverlay';
import { ReconnectingOverlay } from '@/components/chess/ReconnectingOverlay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/utils/useToast';

export default function ArcadeChessPage() {
  const [isFriendDialogOpen, setIsFriendDialogOpen] = useState(false);
  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false);
  const [isDrawDialogOpen, setIsDrawDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const shouldAutoResume = searchParams.get('resume') === '1';

  const {
    status,
    activeGame,
    cachedActiveGame,
    hasActiveGameInLobby,
    messages,
    viewingMoveIndex,
    searchPosition,
    selectedTimeControl,
    reconnectCountdown,
    opponentDisconnected,
    opponentDisconnectCountdown,
    friendChallengeStatus,
    isSendingFriendChallenge,
    incomingChallenge,
    rematchRequested,
    rematchOfferedByOpponent,
    displayFen,
    lastMove,
    arrowMove,
    setSelectedTimeControl,
    findMatch,
    cancelSearch,
    sendFriendChallenge,
    acceptFriendChallenge,
    declineFriendChallenge,
    resumeActiveGame,
    makeMove,
    sendMessage,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    requestRematch,
    acceptRematch,
    declineRematch,
    navigateMove,
    backToLobby,
    setFriendChallengeStatus,
  } = useArcadeSocket();

  const timeOptions = [
    { label: '10 min', value: 600, desc: 'Rapid' },
    { label: '20 min', value: 1200, desc: 'Standard' },
    { label: '30 min', value: 1800, desc: 'Classical' },
  ];

  const handleStartRandom = () => {
    if (hasActiveGameInLobby) {
      toast.error('You already have an active game in progress. Resign it first to start a new one.');
      return;
    }
    findMatch(selectedTimeControl);
  };

  const handleOpenFriendDialog = () => {
    if (hasActiveGameInLobby) {
      toast.error('You already have an active game in progress. Resign it first to start a new one.');
      return;
    }
    setIsFriendDialogOpen(true);
  };

  const isLive = !activeGame || viewingMoveIndex === activeGame.moves.length - 1;
  const isMyTurn = activeGame?.turn === activeGame?.color;

  useEffect(() => {
    if (shouldAutoResume && hasActiveGameInLobby && cachedActiveGame && status === 'idle') {
      resumeActiveGame(cachedActiveGame.gameId);
    }
  }, [shouldAutoResume, hasActiveGameInLobby, cachedActiveGame, status, resumeActiveGame]);

  const renderStatusBadge = () => {
    if (status === 'connecting' || status === 'reconnecting') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium shrink-0">
          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
          <span>Connecting</span>
        </div>
      );
    }
    if (status === 'disconnected') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
          Offline
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border text-muted-foreground text-xs font-medium shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Online
      </div>
    );
  };

  return (
    <div className="w-full px-2 sm:px-4 space-y-6 animate-in fade-in">
      {status === 'idle' || status === 'connecting' ? (
        <div className="flex items-center justify-between gap-2 pb-2 border-b w-full">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <Link href="/arcade">
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 -ml-1.5 rounded-lg p-0">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">Chess Arena</h1>
            </div>
          </div>
          {renderStatusBadge()}
        </div>
      ) : (
        <div className="flex items-center justify-between pb-2 border-b w-full">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              Match in progress ({Math.floor((activeGame?.timeControl || selectedTimeControl) / 60)}m)
            </div>
            {status === 'playing' && activeGame && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isMyTurn
                    ? 'bg-primary text-primary-foreground animate-pulse ring-2 ring-primary/40'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isMyTurn ? 'YOUR TURN' : 'Opponent Turn'}
              </div>
            )}
          </div>
          {renderStatusBadge()}
        </div>
      )}

      {incomingChallenge && (
        <div className="w-full p-4 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                Challenge from {incomingChallenge.fromUser.username} ({incomingChallenge.fromUser.regNumber})
              </div>
              <div className="text-xs text-muted-foreground">
                Time format: {Math.floor(incomingChallenge.timeControl / 60)} minutes
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => acceptFriendChallenge(incomingChallenge.challengeId)}
              className="text-xs font-semibold rounded-xl"
            >
              Accept Challenge
            </Button>
            <Button
              variant="outline"
              onClick={() => declineFriendChallenge(incomingChallenge.challengeId)}
              className="text-xs font-medium rounded-xl"
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {opponentDisconnected && status === 'playing' && (
        <div className="w-full p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-pulse shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
          <span>
            Opponent disconnected. Waiting for reconnection... ({opponentDisconnectCountdown}s remaining before forfeit)
          </span>
        </div>
      )}

      {(status === 'idle' || status === 'connecting') && (
        <div className="w-full space-y-6 animate-in fade-in">
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Select Time Control</span>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full">
              {timeOptions.map((opt) => {
                const isSelected = selectedTimeControl === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedTimeControl(opt.value)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all w-full ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30 shadow-sm'
                        : 'border-border/60 hover:border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-lg font-bold">{opt.label}</span>
                    <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Card
              onClick={handleStartRandom}
              className="group cursor-pointer transition-all hover:shadow-xl hover:border-primary/50 flex flex-col justify-between min-h-[190px] rounded-3xl overflow-hidden w-full"
            >
              <CardContent className="p-6 space-y-2 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Play Random</h3>
                  <p className="text-xs text-muted-foreground">
                    Quick matchmaking against any online player with the same time control.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Find Match</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </CardContent>
            </Card>

            <Card
              onClick={handleOpenFriendDialog}
              className="group cursor-pointer transition-all hover:shadow-xl hover:border-primary/50 flex flex-col justify-between min-h-[190px] rounded-3xl overflow-hidden w-full"
            >
              <CardContent className="p-6 space-y-2 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Play With Friends</h3>
                  <p className="text-xs text-muted-foreground">
                    Challenge your friend directly using their registration number.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Enter Reg Number</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {hasActiveGameInLobby && cachedActiveGame && (
            <div className="pt-2 w-full">
              <ActiveGameCard
                opponentName={cachedActiveGame.opponent?.name || cachedActiveGame.opponent?.username || 'Opponent'}
                opponentReg={cachedActiveGame.opponent?.regNumber || ''}
                timeControl={cachedActiveGame.timeControl}
                whiteTime={cachedActiveGame.whiteTime}
                blackTime={cachedActiveGame.blackTime}
                playerColor={cachedActiveGame.color}
                onResume={() => resumeActiveGame(cachedActiveGame.gameId)}
                onResign={() => setIsResignDialogOpen(true)}
              />
            </div>
          )}
        </div>
      )}

      {status === 'searching' && (
        <div className="w-full">
          <SearchingOverlay
            queuePosition={searchPosition}
            onCancel={cancelSearch}
          />
        </div>
      )}

      {(status === 'playing' || status === 'game_over') && activeGame && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          <div className="w-full lg:col-span-7 flex flex-col items-center space-y-4">
            <ChessBoard
              fen={displayFen}
              playerColor={activeGame.color}
              onMove={(from, to, promo) => makeMove(from, to, promo)}
              disabled={status === 'game_over' || !isMyTurn}
              lastMove={lastMove}
              arrowMove={arrowMove}
              isLive={isLive}
              isMyTurn={isMyTurn}
            />

            <div className="w-full max-w-[480px]">
              <MoveControls
                currentIndex={viewingMoveIndex}
                totalMoves={activeGame.moves.length}
                onNavigate={navigateMove}
              />
            </div>
          </div>

          <div className="w-full lg:col-span-5 flex flex-col space-y-4 h-full">
            <GameHeader
              playerColor={activeGame.color}
              opponentName={activeGame.opponent?.name || activeGame.opponent?.username || 'Opponent'}
              opponentReg={activeGame.opponent?.regNumber || ''}
              turn={activeGame.turn}
              whiteTime={activeGame.whiteTime}
              blackTime={activeGame.blackTime}
              isDrawOfferedByOpponent={activeGame.drawOfferedBy === (activeGame.color === 'w' ? 'b' : 'w')}
              onResign={() => setIsResignDialogOpen(true)}
              onOfferDraw={() => setIsDrawDialogOpen(true)}
              onAcceptDraw={acceptDraw}
              onDeclineDraw={declineDraw}
            />

            <div className="w-full flex-1 min-h-[300px]">
              <ChessChat
                messages={messages}
                onSendMessage={sendMessage}
                currentUserReg={activeGame.color === 'w' ? 'WHITE' : 'BLACK'}
              />
            </div>
          </div>
        </div>
      )}

      {status === 'reconnecting' && (
        <ReconnectingOverlay
          countdown={reconnectCountdown}
          isOpponent={opponentDisconnected}
        />
      )}

      {status === 'disconnected' && (
        <div className="w-full p-8 bg-destructive/10 border border-destructive/20 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <WifiOff className="w-12 h-12 mx-auto text-destructive" />
          <h2 className="text-xl font-bold">Connection Lost</h2>
          <p className="text-xs text-muted-foreground">
            Could not reconnect to the arcade server within 60 seconds.
          </p>
          <Button
            onClick={backToLobby}
            className="text-xs font-semibold rounded-xl"
          >
            Back to Lobby
          </Button>
        </div>
      )}

      <FriendChallengeDialog
        isOpen={isFriendDialogOpen}
        onClose={() => {
          setIsFriendDialogOpen(false);
          setFriendChallengeStatus(null);
        }}
        onSendChallenge={(reg) => sendFriendChallenge(reg, selectedTimeControl)}
        selectedTimeControl={selectedTimeControl}
        statusMessage={friendChallengeStatus}
        isSending={isSendingFriendChallenge}
      />

      <ResignDialog
        isOpen={isResignDialogOpen}
        onClose={() => setIsResignDialogOpen(false)}
        onConfirmResign={resign}
      />

      <DrawOfferDialog
        isOpen={isDrawDialogOpen}
        onClose={() => setIsDrawDialogOpen(false)}
        onConfirmDraw={offerDraw}
      />

      <GameOverModal
        isOpen={status === 'game_over'}
        result={
          activeGame?.winner === 'draw'
            ? 'draw'
            : activeGame?.winner === 'w'
            ? 'white_win'
            : activeGame?.winner === 'b'
            ? 'black_win'
            : null
        }
        reason={activeGame?.status || 'game_over'}
        winReason={activeGame?.winReason}
        playerColor={activeGame?.color || 'w'}
        opponentName={activeGame?.opponent?.name || activeGame?.opponent?.username || 'Opponent'}
        onPlayAgain={requestRematch}
        onBackToLobby={backToLobby}
        rematchRequested={rematchRequested}
        rematchOfferedByOpponent={rematchOfferedByOpponent}
        onAcceptRematch={acceptRematch}
      />
    </div>
  );
}