import type { SQLiteDatabase } from 'expo-sqlite';
import type { Score, Slot } from '@/lib/constants';
import { addDays, weekDays } from '@/lib/dates';

export const DB_NAME = 'yangsim.db';

export type Meal = {
  id: number;
  date: string;
  slot: Slot;
  text: string;
  confession: boolean;
};

export type DayRecord = {
  date: string;
  score: Score | null;
  memo: string;
};

export type WeeklyAnswers = {
  drink: string | null;
  workout: string | null;
  snack: string | null;
  body: string | null;
};

export type WeeklyReview = {
  weekStart: string;
  answers: WeeklyAnswers;
  summary: string;
};

export const EMPTY_ANSWERS: WeeklyAnswers = { drink: null, workout: null, snack: null, body: null };

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      slot TEXT NOT NULL,
      text TEXT NOT NULL,
      confession INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
    CREATE TABLE IF NOT EXISTS days (
      date TEXT PRIMARY KEY NOT NULL,
      score TEXT,
      memo TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS weekly_reviews (
      week_start TEXT PRIMARY KEY NOT NULL,
      answers TEXT NOT NULL DEFAULT '{}',
      summary TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

type MealRow = { id: number; date: string; slot: string; text: string; confession: number };

const toMeal = (r: MealRow): Meal => ({
  id: r.id,
  date: r.date,
  slot: r.slot as Slot,
  text: r.text,
  confession: r.confession === 1,
});

export async function getMeals(db: SQLiteDatabase, date: string): Promise<Meal[]> {
  const rows = await db.getAllAsync<MealRow>('SELECT * FROM meals WHERE date = ? ORDER BY id', date);
  return rows.map(toMeal);
}

export async function getMealsInRange(db: SQLiteDatabase, from: string, to: string): Promise<Meal[]> {
  const rows = await db.getAllAsync<MealRow>(
    'SELECT * FROM meals WHERE date >= ? AND date <= ? ORDER BY date, id',
    from,
    to,
  );
  return rows.map(toMeal);
}

export async function addMeal(db: SQLiteDatabase, date: string, slot: Slot, text: string, confession: boolean) {
  await db.runAsync(
    'INSERT INTO meals (date, slot, text, confession, created_at) VALUES (?, ?, ?, ?, ?)',
    date,
    slot,
    text.trim(),
    confession ? 1 : 0,
    Date.now(),
  );
}

export async function updateMeal(db: SQLiteDatabase, id: number, text: string, confession: boolean) {
  await db.runAsync('UPDATE meals SET text = ?, confession = ? WHERE id = ?', text.trim(), confession ? 1 : 0, id);
}

export async function deleteMeal(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM meals WHERE id = ?', id);
}

export async function getDay(db: SQLiteDatabase, date: string): Promise<DayRecord> {
  const row = await db.getFirstAsync<{ date: string; score: string | null; memo: string }>(
    'SELECT * FROM days WHERE date = ?',
    date,
  );
  return { date, score: (row?.score as Score | null) ?? null, memo: row?.memo ?? '' };
}

export async function getDaysInRange(db: SQLiteDatabase, from: string, to: string): Promise<DayRecord[]> {
  const rows = await db.getAllAsync<{ date: string; score: string | null; memo: string }>(
    'SELECT * FROM days WHERE date >= ? AND date <= ?',
    from,
    to,
  );
  return rows.map((r) => ({ date: r.date, score: r.score as Score | null, memo: r.memo }));
}

export async function setDayScore(db: SQLiteDatabase, date: string, score: Score | null) {
  await db.runAsync(
    `INSERT INTO days (date, score) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET score = excluded.score`,
    date,
    score,
  );
}

export async function setDayMemo(db: SQLiteDatabase, date: string, memo: string) {
  await db.runAsync(
    `INSERT INTO days (date, memo) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET memo = excluded.memo`,
    date,
    memo,
  );
}

export async function getWeeklyReview(db: SQLiteDatabase, weekStart: string): Promise<WeeklyReview> {
  const row = await db.getFirstAsync<{ answers: string; summary: string }>(
    'SELECT answers, summary FROM weekly_reviews WHERE week_start = ?',
    weekStart,
  );
  let answers = EMPTY_ANSWERS;
  if (row) {
    try {
      answers = { ...EMPTY_ANSWERS, ...JSON.parse(row.answers) };
    } catch {
      answers = EMPTY_ANSWERS;
    }
  }
  return { weekStart, answers, summary: row?.summary ?? '' };
}

export async function getWeeklyReviewsInRange(db: SQLiteDatabase, from: string, to: string): Promise<WeeklyReview[]> {
  const rows = await db.getAllAsync<{ week_start: string; answers: string; summary: string }>(
    'SELECT * FROM weekly_reviews WHERE week_start >= ? AND week_start <= ?',
    from,
    to,
  );
  return rows.map((r) => {
    let answers = EMPTY_ANSWERS;
    try {
      answers = { ...EMPTY_ANSWERS, ...JSON.parse(r.answers) };
    } catch {}
    return { weekStart: r.week_start, answers, summary: r.summary };
  });
}

export async function saveWeeklyReview(db: SQLiteDatabase, review: WeeklyReview) {
  await db.runAsync(
    `INSERT INTO weekly_reviews (week_start, answers, summary) VALUES (?, ?, ?)
     ON CONFLICT(week_start) DO UPDATE SET answers = excluded.answers, summary = excluded.summary`,
    review.weekStart,
    JSON.stringify(review.answers),
    review.summary,
  );
}

export async function getSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value,
  );
}

/** 점수 평균(1~3). 점수가 하나도 없으면 null */
export function averageScore(days: DayRecord[], valueOf: (s: Score) => number): number | null {
  const scored = days.filter((d) => d.score);
  if (scored.length === 0) return null;
  return scored.reduce((sum, d) => sum + valueOf(d.score as Score), 0) / scored.length;
}

/** 주 하나의 요약 (달력/주간 화면에서 공통으로 사용) */
export type WeekSummary = {
  weekStart: string;
  days: string[];
  scores: Record<string, Score | null>;
  mealCount: Record<string, number>;
  confessionCount: Record<string, number>;
  review: WeeklyReview | null;
};

export async function getWeekSummary(db: SQLiteDatabase, weekStart: string): Promise<WeekSummary> {
  const days = weekDays(weekStart);
  const end = addDays(weekStart, 6);
  const [dayRows, meals, review] = await Promise.all([
    getDaysInRange(db, weekStart, end),
    getMealsInRange(db, weekStart, end),
    getWeeklyReview(db, weekStart),
  ]);
  const scores: WeekSummary['scores'] = {};
  const mealCount: WeekSummary['mealCount'] = {};
  const confessionCount: WeekSummary['confessionCount'] = {};
  for (const d of days) {
    scores[d] = null;
    mealCount[d] = 0;
    confessionCount[d] = 0;
  }
  for (const r of dayRows) scores[r.date] = r.score;
  for (const m of meals) {
    mealCount[m.date] += 1;
    if (m.confession) confessionCount[m.date] += 1;
  }
  const hasReview = review.summary.trim() !== '' || Object.values(review.answers).some(Boolean);
  return { weekStart, days, scores, mealCount, confessionCount, review: hasReview ? review : null };
}
