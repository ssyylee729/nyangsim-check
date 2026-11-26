import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { DayEditor } from '@/components/DayEditor';
import { T } from '@/components/ui';
import { colors } from '@/lib/constants';
import { formatKorean } from '@/lib/dates';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <T style={{ fontSize: 20 }}>‹</T>
        </Pressable>
        <T style={{ fontSize: 20 }}>{formatKorean(date)}</T>
        <View style={styles.back} />
      </View>
      <DayEditor date={date} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardWarm, alignItems: 'center', justifyContent: 'center' },
});
