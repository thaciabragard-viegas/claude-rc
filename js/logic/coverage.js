// Regiões que somem com o "esfregar" do dedo (barro, espuma, água, respingos).
// Margem generosa: o toque conta mesmo um pouco fora da região.
export function makeRegions(list) {
  return list.map((r, i) => ({ id: r.id ?? i, x: r.x, y: r.y, r: r.r, amount: r.amount ?? 1, need: r.need ?? 70 }));
}

// Aplica um movimento de comprimento `len` no ponto (x, y). Devolve as regiões alteradas.
export function scrub(regions, x, y, len, tolerance = 30) {
  const changed = [];
  for (const reg of regions) {
    if (reg.amount <= 0) continue;
    const d = Math.hypot(reg.x - x, reg.y - y);
    if (d <= reg.r + tolerance) {
      reg.amount = Math.max(0, reg.amount - len / reg.need);
      if (reg.amount < 0.18) reg.amount = 0; // não exige perfeição
      changed.push(reg);
    }
  }
  return changed;
}

export const remaining = (regions) => regions.filter((r) => r.amount > 0);
export const progress = (regions) => regions.length ? 1 - regions.reduce((s, r) => s + r.amount, 0) / regions.length : 1;
export const isDone = (regions) => regions.every((r) => r.amount <= 0);
