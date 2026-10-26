'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Swords,
  Trophy,
  Gamepad2,
  Keyboard,
  Flame,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react';
import { useArcadeSocket } from '@/hooks/arcade/useArcadeSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActiveGameCard } from '@/components/chess/ActiveGameCard';
import { ResignDialog } from '@/components/chess/ResignDialog';

export default function ArcadeHubPage() {
  const router = useRouter();
  const [leaderboardTab, setLeaderboardTab] = useState<'chess' | 'typing'>('chess');
  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false);

  const {
    status,
    cachedActiveGame,
    hasActiveGameInLobby,
    dailyLeaderboard,
    incomingChallenge,
    acceptFriendChallenge,
    declineFriendChallenge,
    resumeActiveGame,
    resign,
  } = useArcadeSocket();

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
    <div className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Arcade</h1>
          </div>
        </div>
        {renderStatusBadge()}
      </div>

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

      {hasActiveGameInLobby && cachedActiveGame && (
        <div className="w-full">
          <ActiveGameCard
            opponentName={cachedActiveGame.opponent?.name || cachedActiveGame.opponent?.username || 'Opponent'}
            opponentReg={cachedActiveGame.opponent?.regNumber || ''}
            timeControl={cachedActiveGame.timeControl}
            whiteTime={cachedActiveGame.whiteTime}
            blackTime={cachedActiveGame.blackTime}
            playerColor={cachedActiveGame.color}
            onResume={() => {
              router.push('/arcade/chess?resume=1');
            }}
            onResign={() => setIsResignDialogOpen(true)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        <Link href="/arcade/chess" className="w-full block group">
          <Card className="h-full border-border/70 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer relative bg-card">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <Swords className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>10m / 20m / 30m</span>
                </div>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Chess Arena</h2>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>Play Now</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/arcade/typingtest" className="w-full block group">
          <Card className="h-full border-border/70 hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer relative bg-card">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Keyboard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="w-3.5 h-3.5" />
                  <span>1 Min Test</span>
                </div>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Typing Test</h2>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Start Test</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="w-full space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">Daily Leaderboards</h2>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-fit">
            <button
              onClick={() => setLeaderboardTab('chess')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                leaderboardTab === 'chess'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Chess Top 3
            </button>
            <button
              onClick={() => setLeaderboardTab('typing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                leaderboardTab === 'typing'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Typing Top 3
            </button>
          </div>
        </div>

        {leaderboardTab === 'chess' ? (
          <Card className="rounded-2xl border-border/70 overflow-hidden w-full">
            <CardContent className="p-4 sm:p-5 space-y-5">
              {[
                { label: '10 Min Rapid', key: '600' as const, desc: '10m Games' },
                { label: '20 Min Standard', key: '1200' as const, desc: '20m Games' },
                { label: '30 Min Classical', key: '1800' as const, desc: '30m Games' },
              ].map((tier, sectionIdx) => {
                const records = dailyLeaderboard?.chess[tier.key] || [];
                return (
                  <div key={tier.key} className={`space-y-2.5 ${sectionIdx > 0 ? 'pt-4 border-t border-border/60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-sm text-foreground">{tier.label}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground uppercase">{tier.desc}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                      {records.length === 0 ? (
                        <div className="col-span-full py-3 text-center text-xs text-muted-foreground italic">
                          No wins recorded yet today. Be the first!
                        </div>
                      ) : (
                        records.map((r, idx) => (
                          <div
                            key={r.regNumber}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  idx === 0
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-muted border border-border text-muted-foreground'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <div className="truncate">
                                <div className="font-semibold truncate">{r.name || r.username}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{r.regNumber}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 pl-2 shrink-0">
                              <Flame className="w-3.5 h-3.5" />
                              <span>{r.wins} {r.wins === 1 ? 'Win' : 'Wins'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-border/70 overflow-hidden w-full">
            <CardContent className="p-4 sm:p-5 space-y-5">
              {[
                { label: 'Easy Mode', key: 'easy' as const, badge: 'Lowercase Words' },
                { label: 'Medium Mode', key: 'medium' as const, badge: 'Capitals & Commas' },
                { label: 'Hard Mode', key: 'hard' as const, badge: 'Punctuation, Hyphens & Symbols' },
              ].map((tier, sectionIdx) => {
                const records = dailyLeaderboard?.typing[tier.key] || [];
                return (
                  <div key={tier.key} className={`space-y-2.5 ${sectionIdx > 0 ? 'pt-4 border-t border-border/60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Keyboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-sm text-foreground">{tier.label}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{tier.badge}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
                      {records.length === 0 ? (
                        <div className="col-span-full py-3 text-center text-xs text-muted-foreground italic">
                          No scores recorded yet today. Be the first!
                        </div>
                      ) : (
                        records.map((r, idx) => (
                          <div
                            key={r.regNumber + idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  idx === 0
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-muted border border-border text-muted-foreground'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <div className="truncate">
                                <div className="font-semibold truncate">{r.name || r.username}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {r.regNumber} • {r.accuracy}% acc
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 pl-2 shrink-0">
                              <span>{r.wpm} WPM</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <ResignDialog
        isOpen={isResignDialogOpen}
        onClose={() => setIsResignDialogOpen(false)}
        onConfirmResign={resign}
      />
    </div>
  );
}