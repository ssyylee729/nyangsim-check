import type { NyangMood } from '@/characters/nyangSvg';

export const colors = {
  bg: '#FFF6EA',
  card: '#FFFFFF',
  cardWarm: '#FFEFD9',
  line: '#F1DEC4',
  text: '#5A3A22',
  textSoft: '#A18568',
  orange: '#F2A04E',
  orangeDark: '#D9822B',
  red: '#E5534B',
  redSoft: '#FFE3E0',
  green: '#6BBF8A',
  greenSoft: '#E3F5E9',
  yellowSoft: '#FFF0C2',
  blueSoft: '#E1EEFB',
};

export const FONT = 'Jua_400Regular';

export type Slot = 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'night';

export const SLOTS: { key: Slot; label: string; emoji: string; hint: string }[] = [
  { key: 'morning', label: '오전', emoji: '🌅', hint: '엄마, 아침은 먹었어? 굶으면 안 돼!' },
  { key: 'lunch', label: '점심', emoji: '🍚', hint: '점심 뭐 챙겨 먹었어?' },
  { key: 'afternoon', label: '오후', emoji: '☕', hint: '엄마 오후 간식 먹었으면 라니한테만 살짝 말해봐' },
  { key: 'dinner', label: '저녁', emoji: '🍽️', hint: '엄마 저녁은 꼭 챙겨 먹어야 돼! 건강하게!' },
  { key: 'night', label: '밤', emoji: '🌙', hint: '밤에 뭐 먹었는지 라니한테 솔직하게...' },
];

export type Score = 'praise' | 'soso' | 'reflect';

export const SCORES: {
  key: Score;
  label: string;
  value: number;
  mood: NyangMood;
  color: string;
  soft: string;
  cheer: string;
}[] = [
  { key: 'praise', label: '칭찬해', value: 3, mood: 'happy', color: colors.green, soft: colors.greenSoft, cheer: '엄마 오늘 완전 잘했어! 라니가 칭찬해줄게냥~ 🎉' },
  { key: 'soso', label: '쏘쏘', value: 2, mood: 'soso', color: colors.orange, soft: colors.yellowSoft, cheer: '엄마 나쁘지 않았어. 내일은 더 건강하게 먹어보자냥!' },
  { key: 'reflect', label: '반성해', value: 1, mood: 'reflect', color: colors.red, soft: colors.redSoft, cheer: '괜찮아 엄마... 내일 다시 하면 돼. 라니가 옆에 있을게 💪' },
];

export const scoreInfo = (s: Score | null | undefined) => SCORES.find((x) => x.key === s) ?? null;

/** 평균 점수(1~3)를 가장 가까운 점수 단계로 바꿔서 얼굴/색을 고른다. */
export function scoreFromAverage(avg: number) {
  if (avg >= 2.5) return SCORES[0];
  if (avg >= 1.75) return SCORES[1];
  return SCORES[2];
}

export const NOTIFICATION_HOURS = [8, 13, 18, 22] as const;
