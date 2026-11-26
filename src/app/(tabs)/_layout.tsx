import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';
import { colors, FONT } from '@/lib/constants';

const icon = (emoji: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.orangeDark,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: { fontFamily: FONT, fontSize: 12 },
        tabBarStyle: { backgroundColor: '#FFFBF4', borderTopColor: colors.line, borderTopWidth: 2, height: 64, paddingTop: 4 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '오늘', tabBarIcon: icon('🍽️') }} />
      <Tabs.Screen name="month" options={{ title: '한달', tabBarIcon: icon('🗓️') }} />
      <Tabs.Screen name="week" options={{ title: '일주일', tabBarIcon: icon('📝') }} />
      <Tabs.Screen name="settings" options={{ title: '라니', tabBarIcon: icon('🐱') }} />
    </Tabs>
  );
}
