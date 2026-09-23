'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Keyboard,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Zap,
  CheckCircle2,
  AlertCircle,
  Flame,
  Loader2,
} from 'lucide-react';
import { useArcadeSocket } from '@/hooks/arcade/useArcadeSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type Difficulty = 'easy' | 'medium' | 'hard';

const TEST_DURATION = 60;

function splitIntoLines(text: string, maxLineLength = 48): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxLineLength) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export default function TypingTestPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentLineInput, setCurrentLineInput] = useState('');
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);

  const inputRef = useRef<HTMLInputElement>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingSessionRef = useRef<any>(null);
  const allTypedTextRef = useRef<string>('');
  const isSubmittedRef = useRef<boolean>(false);

  const {
    status,
    typingSession,
    typingResult,
    isSubmittingTyping,
    dailyLeaderboard,
    startTypingTest,
    beginTypingTest,
    submitTypingTest,
    resetTypingTest,
  } = useArcadeSocket();

  typingSessionRef.current = typingSession;

  const promptLines = useMemo(() => {
    return splitIntoLines(typingSession?.prompt || '');
  }, [typingSession?.prompt]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typingSession) {
      setCurrentLineIndex(0);
      setCurrentLineInput('');
      setCompletedLines([]);
      setHasStartedTyping(false);
      setTimeLeft(TEST_DURATION);
      startedAtRef.current = null;
      allTypedTextRef.current = '';
      isSubmittedRef.current = false;
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [typingSession]);

  const handleStart = useCallback((diff: Difficulty) => {
    setSelectedDifficulty(diff);
    resetTypingTest();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    startedAtRef.current = null;
    isSubmittedRef.current = false;
    startTypingTest(diff);
  }, [resetTypingTest, startTypingTest]);

  const handleFinalSubmit = useCallback(() => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (typingSessionRef.current) {
      submitTypingTest(typingSessionRef.current.sessionId, allTypedTextRef.current);
    }
  }, [submitTypingTest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!typingSession || typingResult || isSubmittingTyping || timeLeft <= 0 || isSubmittedRef.current) {
      return;
    }

    const value = e.target.value;

    if (!hasStartedTyping) {
      setHasStartedTyping(true);
      startedAtRef.current = Date.now();
      beginTypingTest(typingSession.sessionId);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        if (!startedAtRef.current) return;
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        const remaining = Math.max(0, TEST_DURATION - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          handleFinalSubmit();
        }
      }, 100);
    }

    const activeTargetLine = promptLines[currentLineIndex] || '';
    const isLastLine = currentLineIndex >= promptLines.length - 1;

    if (value.length >= activeTargetLine.length) {
      const updatedCompleted = [...completedLines, value];
      setCompletedLines(updatedCompleted);
      allTypedTextRef.current = updatedCompleted.join(' ');

      if (isLastLine) {
        setCurrentLineInput(value);
        handleFinalSubmit();
        return;
      }

      setCurrentLineIndex((prev) => prev + 1);
      setCurrentLineInput('');
      return;
    }

    setCurrentLineInput(value);
    const currentFull = [...completedLines, value].join(' ');
    allTypedTextRef.current = currentFull;
  };

  const fullTyped = allTypedTextRef.current || [...completedLines, currentLineInput].join(' ');
  const currentTotalLen = fullTyped.length;
  const prompt = typingSession?.prompt || '';

  let correctCount = 0;
  const compareLen = Math.min(currentTotalLen, prompt.length);
  for (let i = 0; i < compareLen; i++) {
    if (fullTyped[i] === prompt[i]) {
      correctCount++;
    }
  }

  const elapsedSeconds = Math.max(TEST_DURATION - timeLeft, 1);
  const liveAccuracy = currentTotalLen > 0 ? Math.round((correctCount / currentTotalLen) * 100) : 100;
  const liveWpm = hasStartedTyping ? Math.round((correctCount / 5) / (elapsedSeconds / 60)) : 0;

  const difficultyTabs: { id: Difficulty; label: string; icon: any }[] = [
    { id: 'easy', label: 'Easy', icon: Zap },
    { id: 'medium', label: 'Medium', icon: Keyboard },
    { id: 'hard', label: 'Hard', icon: Flame },
  ];

  const currentLeaderboard = dailyLeaderboard?.typing[selectedDifficulty] || [];
  const currentLineText = promptLines[currentLineIndex] || '';
  const nextLineText = promptLines[currentLineIndex + 1] || '';

  return (
    <div className="w-full space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between gap-2 pb-3 border-b w-full">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <Link href="/arcade">
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 -ml-1.5 rounded-lg p-0">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </Link>
          <div className="hidden sm:flex p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">Typing Test</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(status === 'connecting' || status === 'reconnecting') && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium shrink-0">
              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
              <span className="hidden sm:inline">Connecting</span>
            </div>
          )}

          <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/60 p-0.5 sm:p-1 rounded-xl shrink-0">
            {difficultyTabs.map((tab) => {
              const isSelected = selectedDifficulty === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleStart(tab.id)}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3 h-3 hidden sm:inline-block" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!typingSession && (
        <Card className="rounded-2xl sm:rounded-3xl border-border/80 shadow-md overflow-hidden w-full">
          <CardContent className="p-6 sm:p-10 text-center space-y-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Keyboard className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h2 className="text-base sm:text-lg font-bold">1-Minute Typing Test</h2>
              <p className="text-xs text-muted-foreground">
                {selectedDifficulty === 'easy'
                  ? 'Easy Mode: Lowercase words only, no punctuation.'
                  : selectedDifficulty === 'medium'
                    ? 'Medium Mode: Sentences with capital letters & commas.'
                    : 'Hard Mode: Code syntax, hyphens, and symbols.'}
              </p>
            </div>
            <Button
              onClick={() => handleStart(selectedDifficulty)}
              className="rounded-xl text-xs font-semibold px-6 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Start 1-Minute Test
            </Button>
          </CardContent>
        </Card>
      )}

      {typingSession && (
        <div className="space-y-3.5 w-full">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-card border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Time Remaining</div>
              <div className={`text-lg sm:text-xl font-black font-mono mt-0.5 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-amber-500'
                }`}>
                {timeLeft}s
              </div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-card border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Speed</div>
              <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {liveWpm} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">WPM</span>
              </div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-card border text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Accuracy</div>
              <div className="text-lg sm:text-xl font-black text-primary font-mono mt-0.5">
                {liveAccuracy}%
              </div>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${timeLeft <= 10 ? 'bg-destructive' : 'bg-emerald-500'
                }`}
              style={{ width: `${(timeLeft / TEST_DURATION) * 100}%` }}
            />
          </div>

          <Card className="rounded-2xl sm:rounded-3xl border-border/80 shadow-md overflow-hidden bg-card/95 w-full">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-1 border-b">
                <span className="font-semibold text-foreground">
                  Line {currentLineIndex + 1} of {promptLines.length}
                </span>
                <span>{selectedDifficulty.toUpperCase()} MODE</span>
              </div>

              <div
                onClick={() => inputRef.current?.focus()}
                className="space-y-3 cursor-text select-none py-2"
              >
                <div className="font-mono text-base sm:text-lg leading-relaxed p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border/60 min-h-[58px] flex flex-wrap items-center">
                  {currentLineText.split('').map((char, index) => {
                    let statusClass = 'text-muted-foreground/70';
                    const isCurrent = index === currentLineInput.length;

                    if (index < currentLineInput.length) {
                      if (currentLineInput[index] === char) {
                        statusClass = 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/15 rounded-xs';
                      } else {
                        statusClass = 'text-red-500 bg-red-500/20 underline decoration-red-500 decoration-2 rounded-xs font-semibold';
                      }
                    }

                    return (
                      <span
                        key={index}
                        className={`${statusClass} ${isCurrent
                            ? 'bg-primary/30 text-foreground border-b-2 border-primary animate-pulse rounded-xs'
                            : ''
                          }`}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    );
                  })}
                </div>

                {nextLineText && (
                  <div className="font-mono text-sm sm:text-base text-muted-foreground/80 px-2 py-1 -mt-1.5 flex items-center gap-2 truncate">
                    <span className="text-[10px] sm:text-[11px] uppercase font-sans font-bold px-1.5 py-0.5 rounded-md bg-muted border border-border/70 text-muted-foreground tracking-wider shrink-0">
                      Next
                    </span>
                    <span className="truncate font-medium">{nextLineText}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentLineInput}
                  onChange={handleInputChange}
                  onPaste={(e) => e.preventDefault()}
                  placeholder={hasStartedTyping ? 'Type the line above...' : 'Start typing to begin the 1-minute test...'}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled={isSubmittingTyping || !!typingResult || timeLeft <= 0}
                  className="w-full bg-muted/50 border rounded-xl sm:rounded-2xl px-4 py-3 text-[16px] sm:text-base font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>{!hasStartedTyping ? '⏱ Timer starts on first keypress' : 'Lines advance automatically as you type'}</span>
                  <button
                    onClick={() => handleStart(selectedDifficulty)}
                    className="flex items-center gap-1 hover:text-foreground transition font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-2.5 pt-1 w-full">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <h3 className="font-bold text-xs sm:text-sm">Today&apos;s {selectedDifficulty.toUpperCase()} Top 3</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Daily Leaderboard</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
          {currentLeaderboard.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
              No scores recorded yet for {selectedDifficulty} today.
            </div>
          ) : (
            currentLeaderboard.map((r, idx) => (
              <div
                key={r.regNumber + idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-card border text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${idx === 0
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : 'bg-amber-700 text-white'
                      }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs truncate">{r.name || r.username}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">
                      {r.regNumber} • {r.accuracy}% acc
                    </div>
                  </div>
                </div>
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 pl-2 shrink-0">
                  {r.wpm} WPM
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!typingResult} onOpenChange={(open) => !open && resetTypingTest()}>
        <DialogContent className="max-w-sm sm:max-w-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl">
          <DialogHeader className="space-y-2 text-center">
            {typingResult?.valid ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <DialogTitle className="text-base sm:text-lg font-bold">
              {typingResult?.valid ? '1-Minute Test Complete!' : 'Submission Flagged'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {typingResult?.valid
                ? `Verified 1-minute score for ${typingResult.difficulty.toUpperCase()} mode.`
                : typingResult?.message || 'Score could not be verified.'}
            </DialogDescription>
          </DialogHeader>

          {typingResult?.valid && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-muted/40 border text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Speed</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {typingResult.wpm}
                </div>
                <div className="text-[10px] text-muted-foreground">WPM</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-muted/40 border text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Accuracy</div>
                <div className="text-xl sm:text-2xl font-black text-primary font-mono mt-0.5">
                  {typingResult.accuracy}%
                </div>
                <div className="text-[10px] text-muted-foreground">Correct</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-muted/40 border text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Duration</div>
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  60s
                </div>
                <div className="text-[10px] text-muted-foreground">Completed</div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={resetTypingTest}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
            <Button
              onClick={() => handleStart(selectedDifficulty)}
              className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}