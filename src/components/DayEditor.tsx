import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Haptics from 'expo-haptics';
import {
  addMeal,
  deleteMeal,
  getDay,
  getMeals,
  setDayMemo,
  setDayScore,
  updateMeal,
  type DayRecord,
  type Meal,
} from '@/db';
import { colors, SCORES, SLOTS, scoreInfo, type Score, type Slot } from '@/lib/constants';
import { formatKorean } from '@/lib/dates';
import { Nyang } from './Nyang';
import { Button, Card, SpeechBubble, T } from './ui';

type Props = {
  date: string;
  /** 오늘 탭에서는 고양이 인사말을 크게 보여준다 */
  isToday?: boolean;
};

type Draft = { slot: Slot; id: number | null; text: string; confession: boolean };

export function DayEditor({ date, isToday = false }: Props) {
  const db = useSQLiteContext();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [day, setDay] = useState<DayRecord>({ date, score: null, memo: '' });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [memo, setMemo] = useState('');

  const load = useCallback(async () => {
    const [m, d] = await Promise.all([getMeals(db, date), getDay(db, date)]);
    setMeals(m);
    setDay(d);
    setMemo(d.memo);
  }, [db, date]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  const confessionCount = meals.filter((m) => m.confession).length;
  const info = scoreInfo(day.score);

  const greeting = (() => {
    if (info) return info.cheer;
    if (confessionCount > 0) return `엄마 양심고백 ${confessionCount}건 접수됐어... 😾 그래도 솔직해서 칭찬할게.`;
    if (meals.length === 0) return isToday ? '엄마 오늘 뭐 먹었는지 라니한테만 말해봐~' : '엄마, 이 날은 아직 기록이 없어.';
    return '엄마 잘 기록하고 있네! 건강 챙겨줘서 고마워 ⭐ 하루 끝에 점수도 매겨봐';
  })();

  const mascotMood = info ? info.mood : confessionCount > 0 ? 'angry' : meals.length === 0 ? 'idle' : 'eating';

  async function saveDraft() {
    if (!draft) return;
    const text = draft.text.trim();
    if (!text) {
      Alert.alert('앗', '엄마 먹은 걸 적어야 기록할 수 있어 🐱');
      return;
    }
    if (draft.id) await updateMeal(db, draft.id, text, draft.confession);
    else await addMeal(db, date, draft.slot, text, draft.confession);
    if (draft.confession) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setDraft(null);
    await load();
  }

  function confirmDelete(meal: Meal) {
    Alert.alert('지울 거야 엄마?', `"${meal.text}" 기록을 지울게.`, [
      { text: '아니야', style: 'cancel' },
      {
        text: '지울게',
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(db, meal.id);
          await load();
        },
      },
    ]);
  }

  async function chooseScore(s: Score) {
    const next = day.score === s ? null : s;
    await setDayScore(db, date, next);
    if (next) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await load();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Nyang mood={mascotMood} size={isToday ? 112 : 92} />
          <SpeechBubble style={{ marginLeft: 14, flex: 1 }}>{greeting}</SpeechBubble>
        </View>

        {isToday && <T style={styles.dateTitle}>{formatKorean(date)}</T>}

        {SLOTS.map((slot) => {
          const slotMeals = meals.filter((m) => m.slot === slot.key);
          const editing = draft?.slot === slot.key ? draft : null;
          return (
            <Card key={slot.key} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <T style={{ fontSize: 19 }}>
                  {slot.emoji} {slot.label}
                </T>
                {!editing && (
                  <Pressable
                    onPress={() => setDraft({ slot: slot.key, id: null, text: '', confession: false })}
                    style={styles.addBtn}
                    hitSlop={8}
                  >
                    <T style={{ color: colors.orangeDark, fontSize: 15 }}>＋ 기록</T>
                  </Pressable>
                )}
              </View>

              {slotMeals.length === 0 && !editing && (
                <T style={{ color: colors.textSoft, fontSize: 14, marginTop: 6 }}>{slot.hint}</T>
              )}

              {slotMeals.map((meal) =>
                editing?.id === meal.id ? null : (
                  <Pressable
                    key={meal.id}
                    onPress={() => setDraft({ slot: slot.key, id: meal.id, text: meal.text, confession: meal.confession })}
                    onLongPress={() => confirmDelete(meal)}
                    style={[styles.mealRow, meal.confession && styles.mealConfession]}
                  >
                    <T style={{ flex: 1, fontSize: 16 }}>{meal.text}</T>
                    {meal.confession && <T style={styles.confessTag}>😾 양심고백</T>}
                  </Pressable>
                ),
              )}
              {slotMeals.length > 0 && !editing && (
                <T style={{ color: colors.textSoft, fontSize: 12, marginTop: 6 }}>눌러서 수정 · 길게 눌러서 삭제</T>
              )}

              {editing && (
                <View style={{ marginTop: 10 }}>
                  <TextInput
                    value={editing.text}
                    onChangeText={(text) => setDraft({ ...editing, text })}
                    placeholder="예) 김치찌개, 공기밥 반 공기"
                    placeholderTextColor={colors.textSoft}
                    style={styles.input}
                    autoFocus
                    multiline
                  />
                  <Pressable
                    onPress={() => setDraft({ ...editing, confession: !editing.confession })}
                    style={[styles.confessToggle, editing.confession && styles.confessToggleOn]}
                  >
                    <Nyang mood="angry" view="face" size={44} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <T style={{ fontSize: 16, color: editing.confession ? colors.red : colors.text }}>
                        {editing.confession ? '엄마 양심고백 접수됐다냥!!' : '엄마 양심고백 할 거 있어?'}
                      </T>
                      <T style={{ fontSize: 12, color: colors.textSoft }}>
                        {editing.confession ? '누르면 취소할 수 있어' : '몰래 먹은 거라면 눌러서 라니한테 솔직하게!'}
                      </T>
                    </View>
                    <T style={{ fontSize: 22 }}>{editing.confession ? '🔥' : '🙀'}</T>
                  </Pressable>
                  <View style={styles.row}>
                    <Button label="취소" color="#EFE4D3" textColor={colors.text} onPress={() => setDraft(null)} style={{ flex: 1 }} />
                    <Button label={editing.id ? '수정' : '기록하기'} onPress={saveDraft} style={{ flex: 2 }} />
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        <Card style={{ marginTop: 6 }}>
          <T style={{ fontSize: 19, marginBottom: 4 }}>⭐ 오늘 나에게 점수를</T>
          <T style={{ color: colors.textSoft, fontSize: 13, marginBottom: 12 }}>
            {isToday ? '엄마 하루가 끝났다면 스스로 점수를 매겨봐' : '엄마 이 날을 돌아보며 점수를 매겨봐'}
          </T>
          <View style={styles.row}>
            {SCORES.map((s) => {
              const selected = day.score === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => chooseScore(s.key)}
                  style={[
                    styles.scoreBtn,
                    { backgroundColor: selected ? s.soft : '#fff', borderColor: selected ? s.color : colors.line },
                  ]}
                >
                  <Nyang mood={s.mood} view="face" size={selected ? 62 : 54} />
                  <T style={{ fontSize: 16, color: selected ? s.color : colors.textSoft, marginTop: 2 }}>{s.label}</T>
                </Pressable>
              );
            })}
          </View>

          <T style={{ fontSize: 15, marginTop: 16, marginBottom: 6 }}>한 줄 메모</T>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            onEndEditing={() => setDayMemo(db, date, memo.trim()).catch(() => {})}
            onBlur={() => setDayMemo(db, date, memo.trim()).catch(() => {})}
            placeholder="엄마 오늘 하루는 어땠어? 라니한테만 말해봐"
            placeholderTextColor={colors.textSoft}
            style={[styles.input, { minHeight: 48 }]}
            multiline
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48, gap: 12 },
  hero: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  dateTitle: { fontSize: 24, marginBottom: 2, marginLeft: 4 },
  slotCard: { paddingVertical: 14 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: colors.cardWarm, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 8,
  },
  mealConfession: { backgroundColor: colors.redSoft, borderColor: '#F5B4AE' },
  confessTag: { fontSize: 12, color: colors.red },
  input: {
    fontFamily: 'Jua_400Regular',
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#FFFBF4',
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  confessToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#F5B4AE',
    backgroundColor: '#FFF7F5',
  },
  confessToggleOn: { backgroundColor: colors.redSoft, borderStyle: 'solid', borderColor: colors.red },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  scoreBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 2.5,
  },
});
