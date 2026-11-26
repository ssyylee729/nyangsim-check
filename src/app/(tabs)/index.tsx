import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { DayEditor } from '@/components/DayEditor';
import { todayKey } from '@/lib/dates';

export default function TodayScreen() {
  // 자정이 지난 뒤에 탭으로 돌아오면 날짜를 새로 계산한다.
  const [date, setDate] = useState(todayKey());
  useFocusEffect(
    useCallback(() => {
      setDate(todayKey());
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <DayEditor key={date} date={date} isToday />
    </SafeAreaView>
  );
}
