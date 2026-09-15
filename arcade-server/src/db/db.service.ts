import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database = require('better-sqlite3');
import * as path from 'path';

export interface DailyChessRecord {
  regNumber: string;
  username: string;
  name?: string;
  wins: number;
  timeControl: number;
}

export interface DailyTypingRecord {
  regNumber: string;
  username: string;
  name?: string;
  difficulty: string;
  wpm: number;
  accuracy: number;
  timeTaken: number;
  createdAt: number;
}

export interface DailyLeaderboardData {
  date: string;
  chess: {
    600: DailyChessRecord[];
    1200: DailyChessRecord[];
    1800: DailyChessRecord[];
  };
  typing: {
    easy: DailyTypingRecord[];
    medium: DailyTypingRecord[];
    hard: DailyTypingRecord[];
  };
}

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private db!: Database.Database;
  private resetInterval?: NodeJS.Timeout;

  onModuleInit() {
    const dbPath = path.resolve(process.cwd(), 'arcade.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initTables();
    this.checkAndResetDaily();

    this.resetInterval = setInterval(() => {
      this.checkAndResetDaily();
    }, 60000);
  }

  onModuleDestroy() {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
    if (this.db) {
      this.db.close();
    }
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS chess_daily (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time_control INTEGER NOT NULL,
        reg_number TEXT NOT NULL,
        username TEXT NOT NULL,
        name TEXT,
        wins INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL,
        UNIQUE(time_control, reg_number)
      );

      CREATE TABLE IF NOT EXISTS typing_daily (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        difficulty TEXT NOT NULL,
        reg_number TEXT NOT NULL,
        username TEXT NOT NULL,
        name TEXT,
        wpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        time_taken REAL NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  private getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public checkAndResetDaily(): boolean {
    const today = this.getTodayDateString();
    const row = this.db.prepare('SELECT value FROM metadata WHERE key = ?').get('last_reset_date') as { value: string } | undefined;

    if (!row) {
      this.db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)').run('last_reset_date', today);
      return false;
    }

    if (row.value !== today) {
      this.db.transaction(() => {
        this.db.prepare('DELETE FROM chess_daily').run();
        this.db.prepare('DELETE FROM typing_daily').run();
        this.db.prepare('UPDATE metadata SET value = ? WHERE key = ?').run(today, 'last_reset_date');
      })();
      return true;
    }

    return false;
  }

  public recordChessWin(timeControl: number, regNumber: string, username: string, name?: string) {
    this.checkAndResetDaily();
    const now = Date.now();
    const upperReg = regNumber.toUpperCase();

    const existing = this.db.prepare(
      'SELECT id, wins FROM chess_daily WHERE time_control = ? AND reg_number = ?'
    ).get(timeControl, upperReg) as { id: number; wins: number } | undefined;

    if (existing) {
      this.db.prepare(
        'UPDATE chess_daily SET wins = wins + 1, username = ?, name = ?, updated_at = ? WHERE id = ?'
      ).run(username, name || username, now, existing.id);
    } else {
      this.db.prepare(
        'INSERT INTO chess_daily (time_control, reg_number, username, name, wins, updated_at) VALUES (?, ?, ?, ?, 1, ?)'
      ).run(timeControl, upperReg, username, name || username, now);
    }
  }

  public recordTypingScore(
    difficulty: string,
    regNumber: string,
    username: string,
    name: string | undefined,
    wpm: number,
    accuracy: number,
    timeTaken: number
  ) {
    this.checkAndResetDaily();
    const now = Date.now();
    const upperReg = regNumber.toUpperCase();
    const diff = difficulty.toLowerCase();

    const existing = this.db.prepare(
      'SELECT id, wpm, accuracy FROM typing_daily WHERE difficulty = ? AND reg_number = ?'
    ).get(diff, upperReg) as { id: number; wpm: number; accuracy: number } | undefined;

    if (existing) {
      if (wpm > existing.wpm || (wpm === existing.wpm && accuracy > existing.accuracy)) {
        this.db.prepare(
          'UPDATE typing_daily SET wpm = ?, accuracy = ?, time_taken = ?, username = ?, name = ?, created_at = ? WHERE id = ?'
        ).run(wpm, accuracy, timeTaken, username, name || username, now, existing.id);
      }
    } else {
      this.db.prepare(
        'INSERT INTO typing_daily (difficulty, reg_number, username, name, wpm, accuracy, time_taken, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(diff, upperReg, username, name || username, wpm, accuracy, timeTaken, now);
    }
  }

  public getDailyLeaderboard(): DailyLeaderboardData {
    this.checkAndResetDaily();
    const today = this.getTodayDateString();

    const getChessTop3 = (tc: number): DailyChessRecord[] => {
      const rows = this.db.prepare(
        'SELECT reg_number as regNumber, username, name, wins, time_control as timeControl FROM chess_daily WHERE time_control = ? ORDER BY wins DESC, updated_at ASC LIMIT 3'
      ).all(tc) as any[];
      return rows.map((r) => ({
        regNumber: r.regNumber,
        username: r.username,
        name: r.name,
        wins: r.wins,
        timeControl: r.timeControl,
      }));
    };

    const getTypingTop3 = (diff: string): DailyTypingRecord[] => {
      const rows = this.db.prepare(
        'SELECT reg_number as regNumber, username, name, difficulty, wpm, accuracy, time_taken as timeTaken, created_at as createdAt FROM typing_daily WHERE difficulty = ? ORDER BY wpm DESC, accuracy DESC, time_taken ASC LIMIT 3'
      ).all(diff.toLowerCase()) as any[];
      return rows.map((r) => ({
        regNumber: r.regNumber,
        username: r.username,
        name: r.name,
        difficulty: r.difficulty,
        wpm: r.wpm,
        accuracy: r.accuracy,
        timeTaken: r.timeTaken,
        createdAt: r.createdAt,
      }));
    };

    return {
      date: today,
      chess: {
        600: getChessTop3(600),
        1200: getChessTop3(1200),
        1800: getChessTop3(1800),
      },
      typing: {
        easy: getTypingTop3('easy'),
        medium: getTypingTop3('medium'),
        hard: getTypingTop3('hard'),
      },
    };
  }
}