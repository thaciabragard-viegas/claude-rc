// Lógica da brincadeira "Bela, pega!": trajetórias controladas, sem física complexa.
export const FIELD = { minX: 40, maxX: 350, minY: 240, maxY: 560 };
export const START = { x: 195, y: 650 };
export const THROW_GAIN = 2.6;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Converte o arraste em ponto de queda (dentro do gramado).
export function throwTarget(start, pointer, gain = THROW_GAIN, field = FIELD) {
  const dx = pointer.x - start.x;
  let dy = pointer.y - start.y;
  if (dy > -10) dy = -10; // arrastar para baixo vira um lançamento curtinho para a frente
  return { x: clamp(start.x + dx * gain, field.minX, field.maxX), y: clamp(start.y + dy * gain, field.minY, field.maxY) };
}

// Ponto que, arrastado, leva a bolinha até `target` (usado pela mão de ajuda e pelos testes).
export function dragPointFor(start, target, gain = THROW_GAIN) {
  return { x: start.x + (target.x - start.x) / gain, y: start.y + (target.y - start.y) / gain };
}

export function clampToField(p, field = FIELD) {
  return { x: clamp(p.x, field.minX, field.maxX), y: clamp(p.y, field.minY, field.maxY) };
}

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Alvo tolerante: cada tentativa fora amplia a área; depois de 2, a bolinha é "puxada" para dentro.
export function resolveLanding(target, zone, misses) {
  const radius = zone.r * (1 + 0.35 * misses);
  const d = dist(target, zone);
  if (d <= radius) return { hit: true, point: target };
  if (misses >= 2) {
    const k = (zone.r * 0.5) / d;
    return { hit: true, point: { x: zone.x + (target.x - zone.x) * k, y: zone.y + (target.y - zone.y) * k }, assisted: true };
  }
  return { hit: false, point: target };
}

// Escala de profundidade: o que está mais longe (em cima) fica menor.
export function depthScale(y) {
  return 0.55 + 0.45 * clamp((y - 200) / 480, 0, 1);
}

// Três rodadas: livre, depois uma de pontaria/associação e uma de obstáculo/caminho.
export function planRounds(rng) {
  return ['free', rng.pick(['hoop', 'match']), rng.pick(['ramp', 'box'])];
}

export const BALLS = [
  { id: 'listras', color: '#FF7F6B', mark: '#FFFFFF', pattern: 'stripes' },
  { id: 'bolinhas', color: '#6FBCEB', mark: '#FFFFFF', pattern: 'dots' },
  { id: 'estrela', color: '#FFD45C', mark: '#FF9F6B', pattern: 'star' },
];

export const HOOPS = [{ x: 110, y: 330 }, { x: 280, y: 340 }, { x: 195, y: 300 }];
