// 캐릭터 시안을 한 장의 PNG 시트로 뽑아 눈으로 확인하기 위한 스크립트.
// 사용: node scripts/preview-characters.mjs <출력 PNG 경로>
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { nyangSvg, NYANG_MOODS } from '../src/characters/nyangSvg.ts';

const out = process.argv[2];
if (!out) throw new Error('출력 경로를 인자로 주세요');

const cell = 300;
const cols = 4;
const rows = Math.ceil(NYANG_MOODS.length / cols);
const parts = NYANG_MOODS.map((mood, i) => {
  const inner = nyangSvg(mood, 'full').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const x = (i % cols) * cell;
  const y = Math.floor(i / cols) * cell;
  return `<g transform="translate(${x} ${y}) scale(${cell / 200})">${inner}</g>`;
});
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${rows * cell}">
<rect width="100%" height="100%" fill="#FFF3E2"/>${parts.join('')}</svg>`;

const png = new Resvg(sheet).render().asPng();
writeFileSync(out, png);
console.log('saved', out);
