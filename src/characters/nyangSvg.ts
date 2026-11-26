// 우리집 고양이 "라니" SVG 생성기.
// 앱(SvgXml)과 에셋 스크립트(scripts/render-assets.mjs)가 같이 쓰기 때문에
// 다른 파일을 import 하지 않는 순수 문자열 생성 코드로 유지한다.

export type NyangMood = 'idle' | 'happy' | 'soso' | 'reflect' | 'angry' | 'eating' | 'sleepy';
export type NyangView = 'full' | 'face';

const OUTLINE = '#7A4B2A';
const INK = '#4A2E1B';
const ORANGE = '#F2A04E';
const ORANGE_DARK = '#D9822B';
const WHITE = '#FFFDF8';
const PINK = '#F59A9A';

const CX = 100;
const CY = 100;
const RX = 72;
const RY = 58;

// 머리 타원 위의 점 (deg: 0=오른쪽, 90=위쪽)
function headPt(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [+(CX + RX * Math.cos(r)).toFixed(1), +(CY - RY * Math.sin(r)).toFixed(1)];
}

function eyeRound(x: number, y: number, opts: { look?: number; big?: boolean } = {}): string {
  const look = opts.look ?? 0;
  const r = opts.big ? 14 : 12.5;
  return `
  <g transform="translate(${x} ${y})">
    <circle r="${r}" fill="#E0A431" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="${look}" cy="0" rx="${opts.big ? 8 : 6}" ry="${opts.big ? 11 : 10}" fill="${INK}"/>
    <circle cx="${look - 4.5}" cy="-5" r="${opts.big ? 4.4 : 3.6}" fill="#fff"/>
    <circle cx="${look + 4}" cy="4" r="1.8" fill="#fff" opacity=".9"/>
  </g>`;
}

function eyeArc(x: number, y: number, up: boolean): string {
  const d = up ? 'M-11 4 Q0 -9 11 4' : 'M-11 -1 Q0 10 11 -1';
  return `<path transform="translate(${x} ${y})" d="${d}" fill="none" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/>`;
}

function eyeSoso(x: number, y: number): string {
  return `${eyeRound(x, y)}
  <g transform="translate(${x} ${y})">
    <path d="M-15 -15 L15 -15 L15 -2 L-15 -2 Z" fill="${WHITE}"/>
    <path d="M-14 -2 L14 -2" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
  </g>`;
}

function eyeAngry(x: number, y: number, left: boolean): string {
  const s = left ? 1 : -1;
  return `${eyeRound(x, y)}
  <g transform="translate(${x} ${y}) scale(${s} 1)">
    <path d="M-16 -17 L16 -17 L16 5 L-16 -8 Z" fill="${WHITE}"/>
    <path d="M-16 -8 L16 5" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  </g>`;
}

function nose(): string {
  return `<path d="M94 112 Q100 108.5 106 112 Q104 119 100 120 Q96 119 94 112Z" fill="${PINK}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
}

function mouth(mood: NyangMood): string {
  const line = `stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  switch (mood) {
    case 'happy':
      return `<path d="M100 120 L100 124" ${line}/>
      <path d="M85 126 Q100 148 115 126 Q100 132 85 126Z" fill="#C9473F" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M93 134 Q100 140 107 134" stroke="${PINK}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    case 'soso':
      return `<path d="M100 120 L100 125 M88 131 Q94 127 100 131 Q106 135 112 131" ${line}/>`;
    case 'reflect':
      return `<path d="M100 120 L100 125 M90 134 Q100 123 110 134" ${line}/>`;
    case 'angry':
      return `<path d="M100 120 L100 123" ${line}/>
      <path d="M86 128 Q100 120 114 128 Q112 142 100 142 Q88 142 86 128Z" fill="#B3352F" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M91 128.5 L94.5 135 L98 126Z M109 128.5 L105.5 135 L102 126Z" fill="#fff" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>`;
    case 'eating':
      return `<path d="M100 120 L100 124 M91 128 Q95.5 133 100 126 Q104.5 133 109 128" ${line}/>`;
    case 'sleepy':
      return `<path d="M100 120 L100 124 M92 127 Q96 131 100 126 Q104 131 108 127" ${line}/>`;
    default:
      return `<path d="M100 120 L100 124 M89 126 Q94.5 133 100 124 Q105.5 133 111 126" ${line}/>`;
  }
}

function eyes(mood: NyangMood): string {
  switch (mood) {
    case 'happy':
      return eyeArc(70, 106, true) + eyeArc(130, 106, true);
    case 'soso':
      return eyeSoso(70, 104) + eyeSoso(130, 104);
    case 'reflect':
      return eyeRound(70, 104, { big: true }) + eyeRound(130, 104, { big: true });
    case 'angry':
      return eyeAngry(70, 104, true) + eyeAngry(130, 104, false);
    case 'eating':
      return eyeRound(70, 104, { look: 5 }) + eyeRound(130, 104, { look: 5 });
    case 'sleepy':
      return eyeArc(70, 104, false) + eyeArc(130, 104, false);
    default:
      return eyeRound(70, 104) + eyeRound(130, 104);
  }
}

function extras(mood: NyangMood): string {
  switch (mood) {
    case 'happy':
      return `<g fill="#FFC83D" stroke="#E09A00" stroke-width="1.2" stroke-linejoin="round">
        <path transform="translate(168 40)" d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3Z"/>
        <path transform="translate(30 36) scale(.7)" d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3Z"/>
      </g>
      <path transform="translate(176 92) scale(.9)" d="M0 6 C-12 -4 -6 -14 0 -7 C6 -14 12 -4 0 6Z" fill="#FF7A8A" stroke="#D9485C" stroke-width="1.4" stroke-linejoin="round"/>`;
    case 'reflect':
      return `<path d="M60 84 L83 77 M140 84 L117 77" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <path transform="translate(60 128)" d="M0 -8 C6 0 8 4 8 7 C8 12 -8 12 -8 7 C-8 4 -6 0 0 -8Z" fill="#7CC8F2" stroke="#3E8FC0" stroke-width="1.6" stroke-linejoin="round"/>
      <path transform="translate(150 40)" d="M0 -9 C5 -2 7 2 7 5 C7 9.5 -7 9.5 -7 5 C-7 2 -5 -2 0 -9Z" fill="#B7E2F8" stroke="#3E8FC0" stroke-width="1.4" stroke-linejoin="round"/>`;
    case 'angry':
      return `<g transform="translate(166 34)" fill="none" stroke="#E53935" stroke-width="4.6" stroke-linecap="round">
        <path d="M-13 -5 Q-5 -5 -5 -13 M5 -13 Q5 -5 13 -5 M13 5 Q5 5 5 13 M-5 13 Q-5 5 -13 5"/>
      </g>`;
    case 'sleepy':
      return `<g fill="none" stroke="#7B8FD6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path transform="translate(158 40)" d="M-9 -9 H7 L-9 9 H7"/>
        <path transform="translate(182 18) scale(.7)" d="M-9 -9 H7 L-9 9 H7"/>
      </g>`;
    case 'eating':
      return `<path d="M30 176 l4 -3 M168 174 l5 2 M160 186 l3 3" stroke="#D9A066" stroke-width="3" stroke-linecap="round"/>`;
    default:
      return '';
  }
}

function cheeks(mood: NyangMood): string {
  const color = mood === 'angry' ? '#FF7B72' : '#FFB3AE';
  const op = mood === 'happy' || mood === 'angry' ? 0.85 : 0.6;
  return `<ellipse cx="50" cy="122" rx="11" ry="6.5" fill="${color}" opacity="${op}"/>
  <ellipse cx="150" cy="122" rx="11" ry="6.5" fill="${color}" opacity="${op}"/>`;
}

function whiskers(): string {
  return `<g stroke="#CDBBA5" stroke-width="2" stroke-linecap="round" fill="none">
    <path d="M42 116 L18 110 M42 123 L16 124 M44 130 L22 138"/>
    <path d="M158 116 L182 110 M158 123 L184 124 M156 130 L178 138"/>
  </g>`;
}

function tail(): string {
  return `<path d="M146 176 C186 176 196 134 174 120" fill="none" stroke="${OUTLINE}" stroke-width="22" stroke-linecap="round"/>
  <path d="M146 176 C186 176 196 134 174 120" fill="none" stroke="${ORANGE}" stroke-width="16" stroke-linecap="round"/>
  <path d="M186 148 L194 144 M182 162 L190 162" stroke="${ORANGE_DARK}" stroke-width="3.2" stroke-linecap="round"/>`;
}

function body(): string {
  return `<ellipse cx="100" cy="170" rx="56" ry="36" fill="${WHITE}" stroke="${OUTLINE}" stroke-width="3"/>
  <path d="M142 150 C156 160 156 184 138 194 C146 188 150 168 142 150Z" fill="${ORANGE}" opacity=".95"/>`;
}

function paws(mood: NyangMood): string {
  const toes = (x: number) =>
    `<path d="M${x - 5} 186 v5 M${x} 186 v6 M${x + 5} 186 v5" stroke="#E7B7B0" stroke-width="2" stroke-linecap="round"/>`;
  const paw = (x: number, y: number) =>
    `<ellipse cx="${x}" cy="${y}" rx="17" ry="11.5" fill="${WHITE}" stroke="${OUTLINE}" stroke-width="3"/>`;
  if (mood === 'eating') {
    return `${paw(78, 183)}${paw(122, 183)}
    <g>
      <circle cx="100" cy="176" r="17" fill="#E2AE72" stroke="#A9743F" stroke-width="2.6"/>
      <circle cx="94" cy="171" r="2.6" fill="#6B4226"/><circle cx="106" cy="174" r="2.6" fill="#6B4226"/>
      <circle cx="98" cy="183" r="2.4" fill="#6B4226"/><circle cx="108" cy="165" r="2" fill="#6B4226"/>
    </g>
    <ellipse cx="86" cy="186" rx="9" ry="7" fill="${WHITE}" stroke="${OUTLINE}" stroke-width="2.6"/>
    <ellipse cx="114" cy="186" rx="9" ry="7" fill="${WHITE}" stroke="${OUTLINE}" stroke-width="2.6"/>`;
  }
  return `${paw(78, 183)}${toes(78)}${paw(122, 183)}${toes(122)}`;
}

function ears(mood: NyangMood): string {
  // 스코티시 폴드: 작게 앞으로 접힌 귀. 반성할 땐 더 처진다.
  const droop = mood === 'reflect' ? 8 : 0;
  const left = `M30 ${78 + droop} C24 ${54 + droop} 38 ${36 + droop} 58 ${38 + droop} C74 ${40 + droop} 84 ${50 + droop} 90 ${60 + droop} Z`;
  const right = `M170 ${78 + droop} C176 ${54 + droop} 162 ${36 + droop} 142 ${38 + droop} C126 ${40 + droop} 116 ${50 + droop} 110 ${60 + droop} Z`;
  const foldL = `M40 ${58 + droop} Q60 ${50 + droop} 82 ${62 + droop}`;
  const foldR = `M160 ${58 + droop} Q140 ${50 + droop} 118 ${62 + droop}`;
  return `<path d="${left}" fill="${ORANGE}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
  <path d="${right}" fill="${ORANGE}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
  <path d="${foldL}" fill="none" stroke="#F7C48C" stroke-width="3.4" stroke-linecap="round"/>
  <path d="${foldR}" fill="none" stroke="#F7C48C" stroke-width="3.4" stroke-linecap="round"/>`;
}

function head(): string {
  const [lx, ly] = headPt(168);
  const [rx, ry] = headPt(12);
  // 이마 주황 무늬 (가운데 흰 줄)
  const cap = `M${lx} ${ly} A${RX} ${RY} 0 0 1 ${rx} ${ry}
    C158 90 150 84 142 78 C134 72 124 70 117 62 L108 50 Q100 43 92 50 L83 62
    C76 70 66 72 58 78 C50 84 42 90 ${lx} ${ly} Z`;
  return `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="${WHITE}"/>
  <path d="${cap}" fill="${ORANGE}"/>
  <g stroke="${ORANGE_DARK}" stroke-width="3.4" stroke-linecap="round" fill="none">
    <path d="M70 58 Q76 66 74 74"/><path d="M58 64 Q63 70 62 77"/><path d="M130 58 Q124 66 126 74"/><path d="M142 64 Q137 70 138 77"/>
  </g>
  <ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="none" stroke="${OUTLINE}" stroke-width="3.2"/>`;
}

export function nyangSvg(mood: NyangMood = 'idle', view: NyangView = 'full'): string {
  const viewBox = view === 'face' ? '10 24 180 150' : '0 0 200 200';
  const showBody = view === 'full';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  ${showBody ? tail() + body() : ''}
  ${ears(mood)}
  ${head()}
  ${cheeks(mood)}
  ${whiskers()}
  ${eyes(mood)}
  ${nose()}
  ${mouth(mood)}
  ${extras(mood)}
  ${showBody ? paws(mood) : ''}
</svg>`;
}

export const NYANG_MOODS: NyangMood[] = ['idle', 'happy', 'soso', 'reflect', 'angry', 'eating', 'sleepy'];
