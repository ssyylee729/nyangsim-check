import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Nyang } from '@/components/Nyang';
import { Card, SpeechBubble, T } from '@/components/ui';
import { getWeekSummary, type WeekSummary } from '@/db';
import { colors, SCORES, scoreFromAverage, scoreInfo } from '@/lib/constants';
import { DOW_LABELS, todayKey, weekLabel, weeksOfMonth } from '@/lib/dates';

function weekAverage(w: WeekSummary): number | null {
  const vals = w.days.map((d) => scoreInfo(w.scores[d])?.value).filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function MonthScreen() {
  const db = useSQLiteContext();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [weeks, setWeeks] = useState<WeekSummary[]>([]);
  const today = todayKey();

  const load = useCallback(async () => {
    const starts = weeksOfMonth(year, month);
    setWeeks(await Promise.all(starts.map((s) => getWeekSummary(db, s))));
  }, [db, year, month]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  // 이번 달 전체 평균 + 점수별 개수
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthScores = weeks
    .flatMap((w) => w.days.filter((d) => d.startsWith(monthPrefix)).map((d) => w.scores[d]))
    .filter((s): s is NonNullable<typeof s> => s != null);
  const monthAvg = monthScores.length
    ? monthScores.reduce((sum, s) => sum + (scoreInfo(s)?.value ?? 0), 0) / monthScores.length
    : null;
  const monthFace = monthAvg != null ? scoreFromAverage(monthAvg) : null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Pressable onPress={() => shift(-1)} hitSlop={12} style={styles.arrow}>
            <T style={{ fontSize: 20 }}>‹</T>
          </Pressable>
          <T style={{ fontSize: 26 }}>
            {year}년 {month + 1}월
          </T>
          <Pressable onPress={() => shift(1)} hitSlop={12} style={styles.arrow}>
            <T style={{ fontSize: 20 }}>›</T>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Nyang mood={monthFace?.mood ?? 'idle'} size={92} />
          <SpeechBubble style={{ marginLeft: 14, flex: 1 }}>
            {monthAvg == null
              ? '엄마 아직 점수가 없어. 오늘부터 건강하게 하나씩 채워보자냥!'
              : `엄마 이번 달 평균은 ${monthAvg.toFixed(1)}점이야. ${
                  monthAvg >= 2.5 ? '건강 잘 챙기고 있네, 엄마 최고! 🎉' : monthAvg >= 1.75 ? '조금만 더 건강 챙겨줘 엄마!' : '엄마 반성 모드... 라니랑 같이 다시 해보자 💪'
                }`}
          </SpeechBubble>
        </View>

        <Card style={{ padding: 12 }}>
          <View style={styles.gridRow}>
            {DOW_LABELS.map((l, i) => (
              <View key={l} style={styles.cell}>
                <T style={{ fontSize: 13, color: i >= 5 ? colors.red : colors.textSoft }}>{l}</T>
              </View>
            ))}
            <View style={styles.avgCell}>
              <T style={{ fontSize: 13, color: colors.orangeDark }}>평균</T>
            </View>
          </View>

          {weeks.map((w) => {
            const avg = weekAverage(w);
            const face = avg != null ? scoreFromAverage(avg) : null;
            return (
              <View key={w.weekStart} style={styles.gridRow}>
                {w.days.map((d) => {
                  const inMonth = d.startsWith(monthPrefix);
                  const sc = scoreInfo(w.scores[d]);
                  const conf = w.confessionCount[d];
                  const isToday = d === today;
                  return (
                    <Pressable
                      key={d}
                      style={[styles.cell, styles.dayCell, isToday && styles.todayCell, { opacity: inMonth ? 1 : 0.28 }]}
                      onPress={() => router.push({ pathname: '/day/[date]', params: { date: d } })}
                    >
                      <T style={{ fontSize: 12, color: isToday ? colors.orangeDark : colors.textSoft }}>
                        {Number(d.slice(8))}
                      </T>
                      <View style={styles.faceBox}>
                        {sc ? (
                          <Nyang mood={sc.mood} view="face" size={30} />
                        ) : w.mealCount[d] > 0 ? (
                          <T style={{ fontSize: 15 }}>🍽️</T>
                        ) : (
                          <View style={styles.emptyDot} />
                        )}
                      </View>
                      {conf > 0 ? <T style={styles.confBadge}>😾{conf}</T> : <View style={{ height: 13 }} />}
                    </Pressable>
                  );
                })}
                <Pressable
                  style={styles.avgCell}
                  onPress={() => router.navigate({ pathname: '/week', params: { start: w.weekStart } })}
                >
                  {face ? (
                    <>
                      <T style={{ fontSize: 16, color: face.color }}>{avg!.toFixed(1)}</T>
                      <T style={{ fontSize: 10, color: colors.textSoft }}>{weekLabel(w.weekStart).split(' ')[1]}</T>
                    </>
                  ) : (
                    <T style={{ fontSize: 12, color: colors.textSoft }}>-</T>
                  )}
                  {w.review && <T style={{ fontSize: 11 }}>📝</T>}
                </Pressable>
              </View>
            );
          })}
        </Card>

        <View style={styles.legend}>
          {SCORES.map((s) => (
            <View key={s.key} style={styles.legendItem}>
              <Nyang mood={s.mood} view="face" size={22} />
              <T style={{ fontSize: 13, color: colors.textSoft }}>
                {s.label} {s.value}점
              </T>
            </View>
          ))}
        </View>
        <T style={{ textAlign: 'center', fontSize: 12, color: colors.textSoft }}>
          날짜를 누르면 상세 기록, 평균을 누르면 그 주의 총평으로 가! 🐾
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardWarm, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center' },
  gridRow: { flexDirection: 'row', alignItems: 'stretch', marginTop: 4 },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  dayCell: { borderRadius: 12, minHeight: 66, marginHorizontal: 1, backgroundColor: '#FFFBF4' },
  todayCell: { borderWidth: 2, borderColor: colors.orange, backgroundColor: colors.yellowSoft },
  faceBox: { height: 28, alignItems: 'center', justifyContent: 'center' },
  emptyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  confBadge: { fontSize: 10, color: colors.red },
  avgCell: {
    width: 44,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: colors.cardWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
