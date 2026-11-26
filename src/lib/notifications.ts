import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_HOURS } from '@/lib/constants';

const CHANNEL_ID = 'yangsim-daily';

const MESSAGES: Record<(typeof NOTIFICATION_HOURS)[number], { title: string; bodies: string[] }> = {
  8: {
    title: '라니의 아침 잔소리 🌅',
    bodies: [
      '엄마 일어났어? 아침 꼭 챙겨 먹어야 돼냥! 🐱',
      '건강 챙겨줘 엄마! 오늘 아침은 뭐 먹을 거야?',
      '엄마 오늘도 건강하게 가보자냥! 😼',
    ],
  },
  13: {
    title: '라니의 점심 잔소리 🍚',
    bodies: [
      '엄마 점심 뭐 먹었는지 라니한테만 말해봐 😾',
      '엄마 밥은 먹었어? 먹었으면 라니한테 기록부터 해줘!',
      '엄마 혹시 점심에 몰래 디저트 먹은 거 아니지...? 👀',
    ],
  },
  18: {
    title: '라니의 저녁 잔소리 🍽️',
    bodies: [
      '엄마 저녁 시간이야! 오늘 건강 잘 챙기고 있어? 😼',
      '엄마 오후 간식 먹었으면 지금 라니한테 양심고백 해봐 😾',
      '엄마 저녁은 가볍게 먹기로 했잖아! 라니는 믿는다냥 🥗',
    ],
  },
  22: {
    title: '라니의 밤 잔소리 🌙',
    bodies: [
      '엄마 야식 생각하고 있지...? 😾 먹기 전에 라니한테 먼저 말해봐',
      '엄마 오늘 하루 어땠어? 건강 챙겨줘 제발~ ⭐',
      '엄마 혼술은 안 했어? 라니는 다 알고 있다냥 👀',
    ],
  },
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

/**
 * 매일 8/13/18/22시 로컬 알림을 (다시) 예약한다.
 * 알림 문구가 매번 같으면 심심해서, 앱을 열 때마다 문구를 새로 뽑아 다시 예약한다.
 */
export async function scheduleDailyReminders(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const granted = await ensurePermission();
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '라니의 잔소리 알림',
      // eslint-disable-next-line import/namespace -- `export *` 로 내보내는 enum 을 린트가 추적하지 못함
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 100, 200],
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const hour of NOTIFICATION_HOURS) {
    const msg = MESSAGES[hour];
    await Notifications.scheduleNotificationAsync({
      content: { title: msg.title, body: pick(msg.bodies) },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
        channelId: CHANNEL_ID,
      },
    });
  }
  return true;
}

export async function cancelDailyReminders() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
