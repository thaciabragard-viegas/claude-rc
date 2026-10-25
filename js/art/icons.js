// Ícones dos botões (SVG inline), desenhados no mesmo traço do jogo.
const wrap = (body, vb = '0 0 48 48') => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
const O = 'stroke="#6B4A3A" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

export const ICONS = {
  home: wrap(`<path d="M8 24 L24 10 L40 24" fill="none" ${O}/><path d="M13 21 L13 38 L35 38 L35 21" fill="#FFE9CC" ${O}/><rect x="20" y="27" width="8" height="11" rx="3" fill="#FF9F8E" ${O}/>`),
  soundOn: wrap(`<path d="M9 19 L16 19 L25 11 L25 37 L16 29 L9 29 Z" fill="#FFE58F" ${O}/><path d="M30 18 Q35 24 30 30 M34 13 Q43 24 34 35" fill="none" ${O}/>`),
  soundOff: wrap(`<path d="M9 19 L16 19 L25 11 L25 37 L16 29 L9 29 Z" fill="#E8DCCB" ${O}/><path d="M31 19 L40 29 M40 19 L31 29" fill="none" ${O}/>`),
  help: wrap(`<path d="M17 26 L17 12 Q17 8 21 8 Q25 8 25 12 L25 22 Q30 20 33 23 Q37 22 39 26 Q43 26 43 31 L42 37 Q40 43 33 43 L23 43 Q18 43 15 38 L9 30 Q7 26 11 24 Q14 23 17 28 Z" fill="#FFF6E6" ${O}/><circle cx="21" cy="6" r="2" fill="#FFD45C"/>`),
  repeat: wrap(`<path d="M10 14 Q10 8 16 8 L34 8 Q40 8 40 14 L40 26 Q40 32 34 32 L22 32 L14 39 L15 32 Q10 31 10 26 Z" fill="#BFE6FF" ${O}/><path d="M18 22 Q18 15 25 15 Q31 15 31 21" fill="none" ${O}/><path d="M28 17 L31 21 L34 17" fill="none" ${O}/>`),
  play: wrap(`<path d="M18 12 L38 24 L18 36 Z" fill="#FFF6E6" ${O}/>`),
  paw: wrap(`<ellipse cx="24" cy="30" rx="9" ry="8" fill="#FFF6E6" ${O}/><circle cx="13" cy="20" r="4.5" fill="#FFF6E6" ${O}/><circle cx="20" cy="13" r="4.5" fill="#FFF6E6" ${O}/><circle cx="29" cy="13" r="4.5" fill="#FFF6E6" ${O}/><circle cx="36" cy="20" r="4.5" fill="#FFF6E6" ${O}/>`),
  skip: wrap(`<path d="M10 14 L22 24 L10 34 Z M24 14 L36 24 L24 34 Z" fill="#FFF6E6" ${O}/>`),
  again: wrap(`<path d="M36 22 A12 12 0 1 0 32 33" fill="none" stroke="#6B4A3A" stroke-width="5" stroke-linecap="round"/><path d="M30 14 L38 22 L28 26" fill="none" stroke="#6B4A3A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  map: wrap(`<path d="M6 36 Q24 28 42 36 L42 40 L6 40 Z" fill="#A8D88C" ${O}/><path d="M14 30 L14 14 L26 18 L14 22" fill="#FF7F6B" ${O}/><circle cx="32" cy="26" r="6" fill="#FFD45C" ${O}/>`),
  moon: wrap(`<path d="M30 8 A16 16 0 1 0 40 32 A13 13 0 1 1 30 8 Z" fill="#FFE58F" ${O}/><circle cx="36" cy="12" r="2" fill="#FFF6E6"/><circle cx="40" cy="20" r="1.5" fill="#FFF6E6"/>`),
  check: wrap(`<path d="M10 25 L20 35 L38 13" fill="none" stroke="#6B4A3A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`),
  gear: wrap(`<circle cx="24" cy="24" r="9" fill="none" ${O}/><path d="M24 6 L24 12 M24 36 L24 42 M6 24 L12 24 M36 24 L42 24 M11 11 L15 15 M33 33 L37 37 M37 11 L33 15 M15 33 L11 37" fill="none" ${O}/>`),
  left: wrap(`<path d="M30 10 L16 24 L30 38" fill="none" stroke="#6B4A3A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`),
  right: wrap(`<path d="M18 10 L32 24 L18 38" fill="none" stroke="#6B4A3A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`),
  close: wrap(`<path d="M14 14 L34 34 M34 14 L14 34" fill="none" stroke="#6B4A3A" stroke-width="5" stroke-linecap="round"/>`),
  frame: wrap(`<rect x="7" y="10" width="34" height="28" rx="4" fill="#FFF6E6" ${O}/><circle cx="17" cy="20" r="4" fill="#FFD45C"/><path d="M10 34 L20 26 L27 31 L32 27 L38 34" fill="#A8D88C" ${O}/>`),
};
