import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, FONT } from '@/lib/constants';

export function T({ style, children, ...rest }: React.ComponentProps<typeof Text>) {
  return (
    <Text {...rest} style={[{ fontFamily: FONT, color: colors.text, fontSize: 16 }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

export function Button({ label, onPress, color = colors.orange, textColor = '#fff', style, textStyle, disabled }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: disabled ? 0.45 : pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      <T style={[{ color: textColor, fontSize: 17 }, textStyle]}>{label}</T>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  color = colors.orange,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={[
        styles.chip,
        selected ? { backgroundColor: color, borderColor: color } : { backgroundColor: '#fff', borderColor: colors.line },
      ]}
    >
      <T style={{ fontSize: 15, color: selected ? '#fff' : colors.textSoft }}>{label}</T>
    </Pressable>
  );
}

export function SpeechBubble({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.bubble, style]}>
      <T style={{ fontSize: 15, lineHeight: 21 }}>{children}</T>
      <View style={styles.bubbleTail} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.line,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 2,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexShrink: 1,
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 18,
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.line,
    transform: [{ rotate: '45deg' }],
  },
});
