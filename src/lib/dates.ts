// 날짜는 항상 'YYYY-MM-DD' 문자열(기기 로컬 시간 기준)로 다룬다. 한 주는 월요일 시작.

export const DOW_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** 월요일 기준 0~6 (월=0 … 일=6) */
export function dowIndex(key: string): number {
  return (fromKey(key).getDay() + 6) % 7;
}

export function weekStartOf(key: string): string {
  return addDays(key, -dowIndex(key));
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatKorean(key: string): string {
  const d = fromKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW_LABELS[dowIndex(key)]})`;
}

/** 그 주의 목요일이 속한 달을 기준으로 "11월 2주차" 같은 라벨을 만든다. */
export function weekLabel(weekStart: string): string {
  const thursday = fromKey(addDays(weekStart, 3));
  const nth = Math.ceil(thursday.getDate() / 7);
  return `${thursday.getMonth() + 1}월 ${nth}주차`;
}

export function weekRangeLabel(weekStart: string): string {
  const s = fromKey(weekStart);
  const e = fromKey(addDays(weekStart, 6));
  return `${s.getMonth() + 1}.${s.getDate()} ~ ${e.getMonth() + 1}.${e.getDate()}`;
}

/** 해당 월에 걸치는 모든 주의 시작일(월요일) 목록 */
export function weeksOfMonth(year: number, month0: number): string[] {
  const first = toKey(new Date(year, month0, 1));
  const last = toKey(new Date(year, month0 + 1, 0));
  const weeks: string[] = [];
  for (let w = weekStartOf(first); w <= last; w = addDays(w, 7)) weeks.push(w);
  return weeks;
}
