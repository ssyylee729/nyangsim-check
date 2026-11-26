import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { DB_NAME, migrate } from '@/db';
import { colors } from '@/lib/constants';
import { scheduleDailyReminders, setupNotificationHandler } from '@/lib/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});
setupNotificationHandler();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Jua_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // 앱을 열 때마다 알림 문구를 새로 뽑아 다시 예약한다.
  useEffect(() => {
    scheduleDailyReminders().catch(() => {});
  }, []);

  // 알림을 눌러서 들어오면 오늘 탭으로 보낸다.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate('/');
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={migrate}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="day/[date]" options={{ presentation: 'card' }} />
      </Stack>
    </SQLiteProvider>
  );
}
