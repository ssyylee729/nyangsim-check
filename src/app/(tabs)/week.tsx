import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Haptics from 'expo-haptics';
import { Nyang } from '@/components/Nyang';
import { Button, Card, Chip, SpeechBubble, T } from '@/components/ui';
import { EMPTY_ANSWERS, getWeekSummary, getWeeklyReview, saveWeeklyReview, type WeekSummary, type WeeklyAnswers } from '@/db';
import { colors, scoreFromAverage, scoreInfo } from '@/lib/constants';
import { addDays, DOW_LABELS, todayKey, weekLabel, weekRangeLabel, weekStartOf } from '@/lib/dates';

type Question = {
  key: keyof WeeklyAnswers;
  emoji: string;
  title: string;
  options: string[];
};

const QUESTIONS: Question[] = [
  { key: 'drink', emoji: '🍺', title: '혼술 했냐옹?', options: ['한 번도 안 함', '1~2번', '3번 이상'] },
  { key: 'workout', emoji: '🏃', title: '운동은 잘 갔냐옹?', options: ['목표 달성', '반은 갔다', '거의 못 감'] },
  { key: 'snack', emoji: '🍪', title: '군것질 잘 참았냐옹?', options: ['완벽하게 참음', '조금 먹음', '많이 먹음'] },
  { key: 'body', emoji: '🪞', title: '눈바디는 어때?', options: ['눈에 띄게 좋아짐', '비슷함', '좀 쪘다...'] },
];

export default function WeekScreen() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ start?: string }>();
  const thisWeek = weekStartOf(todayKey());
  const [weekStart, setWeekStart] = useState(thisWeek);
  const [summary, setSummary] = useState<WeekSummary | null>(null);
  const [answers, setAnswers] = useState<WeeklyAnswers>(EMPTY_ANSWERS);
  const [text, setText] = useState('');
  const [dirty, setDirty] = useState(false);

  // 달력의 주간 평균을 눌러서 넘어온 경우 해당 주로 이동 (파라미터가 바뀐 렌더에서만 동기화)
  const [seenStart, setSeenStart] = useState<string | undefined>(undefined);
  if (params.start !== seenStart) {
    setSeenStart(params.start);
    if (params.start) setWeekStart(weekStartOf(params.start));
  }

  const load = useCallback(async () => {
    const [s, r] = await Promise.all([getWeekSummary(db, weekStart), getWeeklyReview(db, weekStart)]);
    setSummary(s);
    setAnswers(r.answers);
    setText(r.summary);
    setDirty(false);
  }, [db, weekStart]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  async function save() {
    await saveWeeklyReview(db, { weekStart, answers, summary: text.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setDirty(false);
    Alert.alert('저장했어 엄마 🐾', `${weekLabel(weekStart)} 총평은 라니가 잘 간직할게!`);
  }

  function shift(delta: number) {
    if (dirty) {
      Alert.alert('엄마 저장 안 했어!', '저장하지 않은 총평이 있어. 그래도 넘어갈 거야?', [
        { text: '잠깐만', style: 'cancel' },
        { text: '넘어갈래', onPress: () => setWeekStart(addDays(weekStart, delta * 7)) },
      ]);
      return;
    }
    setWeekStart(addDays(weekStart, delta * 7));
  }

  const scoreValues = (summary?.days ?? []).map((d) => scoreInfo(summary?.scores[d])?.value).filter((v): v is number => v != null);
  const avg = scoreValues.length ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : null;
  const face = avg != null ? scoreFromAverage(avg) : null;
  const totalConfession = summary ? Object.values(summary.confessionCount).reduce((a, b) => a + b, 0) : 0;
  const isFuture = weekStart > thisWeek;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.titleRow}>
            <Pressable onPress={() => shift(-1)} hitSlop={12} style={styles.arrow}>
              <T style={{ fontSize: 20 }}>‹</T>
            </Pressable>
            <View style={{ alignItems: 'center' }}>
              <T style={{ fontSize: 24 }}>{weekLabel(weekStart)}</T>
              <T style={{ fontSize: 13, color: colors.textSoft }}>
                {weekRangeLabel(weekStart)}
                {weekStart === thisWeek ? ' · 이번 주' : ''}
              </T>
            </View>
            <Pressable onPress={() => shift(1)} hitSlop={12} style={styles.arrow}>
              <T style={{ fontSize: 20 }}>›</T>
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Nyang mood={face?.mood ?? 'idle'} size={92} />
            <SpeechBubble style={{ marginLeft: 14, flex: 1 }}>
              {avg == null
                ? '엄마, 이 주는 아직 점수가 없어.'
                : `이번 주 평균 ${avg.toFixed(1)}점! ${
                    totalConfession > 0 ? `엄마 양심고백이 ${totalConfession}번이나 있었어 😾` : '양심고백 0건, 엄마 대단해! ✨'
                  }`}
            </SpeechBubble>
          </View>

          <Card>
            <View style={styles.weekStrip}>
              {summary?.days.map((d, i) => {
                const sc = scoreInfo(summary.scores[d]);
                return (
                  <Pressable
                    key={d}
                    style={styles.stripCell}
                    onPress={() => router.push({ pathname: '/day/[date]', params: { date: d } })}
                  >
                    <T style={{ fontSize: 12, color: i >= 5 ? colors.red : colors.textSoft }}>{DOW_LABELS[i]}</T>
                    <View style={styles.stripFace}>
                      {sc ? <Nyang mood={sc.mood} view="face" size={34} /> : <View style={styles.emptyDot} />}
                    </View>
                    <T style={{ fontSize: 11, color: d === todayKey() ? colors.orangeDark : colors.textSoft }}>
                      {Number(d.slice(8))}
                    </T>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.avgRow}>
              <T style={{ fontSize: 15, color: colors.textSoft }}>주간 평균</T>
              <T style={{ fontSize: 26, color: face?.color ?? colors.textSoft }}>{avg != null ? `${avg.toFixed(1)} / 3` : '-'}</T>
            </View>
          </Card>

          {isFuture ? (
            <Card>
              <T style={{ textAlign: 'center', color: colors.textSoft }}>아직 오지 않은 주야 엄마. 그때 다시 라니한테 와줘 🐾</T>
            </Card>
          ) : (
            <>
              <T style={{ fontSize: 22, marginTop: 4 }}>📝 이번 주 총평</T>

              {QUESTIONS.map((q) => (
                <Card key={q.key} style={{ paddingVertical: 14 }}>
                  <T style={{ fontSize: 18, marginBottom: 10 }}>
                    {q.emoji} {q.title}
                  </T>
                  <View style={styles.chips}>
                    {q.options.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={answers[q.key] === opt}
                        onPress={() => {
                          setAnswers({ ...answers, [q.key]: answers[q.key] === opt ? null : opt });
                          setDirty(true);
                        }}
                      />
                    ))}
                  </View>
                </Card>
              ))}

              <Card>
                <T style={{ fontSize: 18, marginBottom: 8 }}>🐱 한 주 총평</T>
                <TextInput
                  value={text}
                  onChangeText={(v) => {
                    setText(v);
                    setDirty(true);
                  }}
                  placeholder="엄마 이번 주는 어땠어? 잘한 점, 아쉬운 점, 다음 주 건강 다짐을 라니한테 말해봐!"
                  placeholderTextColor={colors.textSoft}
                  style={styles.textarea}
                  multiline
                />
              </Card>

              <Button label={dirty ? '총평 저장하기' : '저장됨 ✓'} onPress={save} disabled={!dirty} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardWarm, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center' },
  weekStrip: { flexDirection: 'row' },
  stripCell: { flex: 1, alignItems: 'center', gap: 4 },
  stripFace: { height: 34, alignItems: 'center', justifyContent: 'center' },
  emptyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.line },
  avgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.line,
    borderStyle: 'dashed',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  textarea: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#FFFBF4',
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
