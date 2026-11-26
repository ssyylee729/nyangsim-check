import { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';
import { nyangSvg, type NyangMood, type NyangView } from '@/characters/nyangSvg';

type Props = {
  mood?: NyangMood;
  view?: NyangView;
  size?: number;
};

/** 우리집 고양이 "라니" */
export function Nyang({ mood = 'idle', view = 'full', size = 96 }: Props) {
  const xml = useMemo(() => nyangSvg(mood, view), [mood, view]);
  const height = view === 'face' ? (size * 150) / 180 : size;
  return <SvgXml xml={xml} width={size} height={height} />;
}
