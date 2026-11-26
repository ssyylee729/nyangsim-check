// 라니 SVG로 앱 아이콘/스플래시/파비콘 PNG를 만든다.
// 사용: npm run assets
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nyangSvg } from '../src/characters/nyangSvg.ts';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

const inner = (mood, view) => nyangSvg(mood, view).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

function render(svg, size, file) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(join(assets, file), png);
  console.log('wrote', file);
}

// 1024 캔버스 안에 얼굴을 가운데 배치. scale 은 캔버스 대비 얼굴 크기.
function icon({ bg, scale, mood = 'happy', mono = false }) {
  const size = 1024;
  const w = 180 * scale * (size / 200);
  const s = w / 180;
  const h = 150 * s;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  const face = inner(mood, 'face');
  const body = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 24 180 150" x="${x}" y="${y}" width="${w}" height="${h}">${face}</svg>`;
  const bgRect = bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : '';
  const filter = mono ? ' filter="url(#mono)"' : '';
  const defs = mono
    ? `<defs><filter id="mono"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter></defs>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}${bgRect}<g${filter}>${body}</g></svg>`;
}

// iOS/기본 아이콘 (꽉 찬 사각형, OS가 모서리를 깎는다)
render(icon({ bg: '#FFE2B8', scale: 0.82 }), 1024, 'icon.png');
// Android adaptive: 전경은 안전영역(가운데 66%) 안에 들어오도록 작게
render(icon({ bg: null, scale: 0.6 }), 1024, 'android-icon-foreground.png');
render(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#FFE2B8"/></svg>`, 1024, 'android-icon-background.png');
render(icon({ bg: null, scale: 0.6, mono: true }), 1024, 'android-icon-monochrome.png');
// 스플래시: 전신 라니
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><svg viewBox="0 0 200 200" x="212" y="212" width="600" height="600">${inner('idle', 'full')}</svg></svg>`;
render(splash, 1024, 'splash-icon.png');
render(icon({ bg: '#FFE2B8', scale: 0.88 }), 128, 'favicon.png');
// 알림 아이콘 (안드로이드: 흰색 단색 + 투명, 96px)
render(icon({ bg: null, scale: 0.9, mono: true }), 96, 'notification-icon.png');
