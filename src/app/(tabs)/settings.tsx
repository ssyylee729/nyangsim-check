import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import { Nyang } from '@/components/Nyang';
import { Button, Card, SpeechBubble, T } from '@/components/ui';
import { getSetting, setSetting } from '@/db';
import { colors, NOTIFICATION_HOURS } from '@/lib/constants';
import { cancelDailyReminders, scheduleDailyReminders } from '@/lib/notifications';

const SETTING_KEY = 'reminders_enabled';

const HOUR_LABELS: Record<number, string> = {
  8: '아침 체크',
  13: '점심 체크',
  18: '저녁 체크',
  22: '밤 양심고백 체크',
};

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [enabled, setEnabled] = useState(true);
  const [permitted, setPermitted] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    const saved = await getSetting(db, SETTING_KEY);
    setEnabled(saved !== 'off');
    if (Platform.OS !== 'web') {
      const p = await Notifications.getPermissionsAsync();
      setPermitted(p.granted);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
    }, [refresh]),
  );

  async function toggle(next: boolean) {
    setEnabled(next);
    await setSetting(db, SETTING_KEY, next ? 'on' : 'off');
    if (next) {
      const ok = await scheduleDailyReminders();
      setPermitted(ok);
      if (!ok) {
        Alert.alert('엄마, 알림이 꺼져 있어', '기기 설정에서 알림을 허용해줘야 라니가 잔소리하러 갈 수 있어', [
          { text: '다음에', style: 'cancel' },
          { text: '설정 열기', onPress: () => Linking.openSettings() },
        ]);
      }
    } else {
      await cancelDailyReminders();
    }
  }

  async function sendTest() {
    const ok = permitted || (await scheduleDailyReminders());
    if (!ok) {
      Alert.alert('엄마, 알림 권한이 필요해');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: '라니의 잔소리다냥! 😼', body: '엄마 테스트 알림이야. 건강 챙겨줘 엄마~' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
    });
    Alert.alert('3초 뒤에 라니가 잔소리하러 갈게 🐾');
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <T style={{ fontSize: 26 }}>라니의 냥심체크 🐱</T>

        <View style={styles.hero}>
          <Nyang mood={enabled ? 'idle' : 'sleepy'} size={120} />
          <SpeechBubble style={{ marginLeft: 14, flex: 1 }}>
            {enabled
              ? '엄마, 내가 하루 네 번 찾아가서 잔소리할 거야. 건강 챙겨야 하니까 도망치면 안 된다냥 😼'
              : '알림을 끄면 라니는 낮잠 잔다냥... 엄마 건강은 누가 챙겨... 쿨쿨 💤'}
          </SpeechBubble>
        </View>

        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <T style={{ fontSize: 18 }}>냥심체크 알림</T>
              <T style={{ fontSize: 13, color: colors.textSoft }}>매일 정해진 시간에 라니가 엄마한테 잔소리하러 가</T>
            </View>
            <Switch
              value={enabled}
              onValueChange={toggle}
              trackColor={{ true: colors.orange, false: '#E5D8C5' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.times}>
            {NOTIFICATION_HOURS.map((h) => (
              <View key={h} style={[styles.timeRow, !enabled && { opacity: 0.4 }]}>
                <T style={{ fontSize: 20, width: 74 }}>{String(h).padStart(2, '0')}:00</T>
                <T style={{ fontSize: 15, color: colors.textSoft }}>{HOUR_LABELS[h]}</T>
              </View>
            ))}
          </View>

          {enabled && permitted === false && (
            <T style={{ color: colors.red, fontSize: 13, marginTop: 10 }}>
              엄마, 알림 권한이 없어서 라니가 잔소리를 못 해. 기기 설정에서 허용해줘!
            </T>
          )}
          {Platform.OS !== 'web' && <Button label="테스트 알림 받아보기" onPress={sendTest} style={{ marginTop: 14 }} color={colors.orangeDark} />}
        </Card>

        <Card>
          <T style={{ fontSize: 18, marginBottom: 4 }}>🔒 내 기록은 내 폰에만</T>
          <T style={{ fontSize: 14, color: colors.textSoft, lineHeight: 20 }}>
            엄마가 먹은 기록, 점수, 총평은 모두 이 기기 안에만 저장돼. 서버로 보내지 않으니 안심하고 라니한테만 양심고백 해도 된다냥!
            (앱을 지우면 기록도 같이 사라지니 조심해 엄마)
          </T>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48, gap: 14 },
  hero: { flexDirection: 'row', alignItems: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  times: { marginTop: 14, gap: 8 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});
