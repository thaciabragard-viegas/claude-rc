// Geração das fases de "Detetives das Patinhas". Sempre produz fases solucionáveis.
export const HUNT_ITEMS = ['guardanapo', 'bolinha', 'laco', 'pratinho'];
export const SPOT_TYPES = ['caixa', 'banco', 'cesto', 'casinha', 'arbusto', 'regador'];
export const CRITTERS = ['butterfly', 'ladybug', 'bird', 'leaves', 'snail'];

// Posições (no viewBox 390x780) para cada quantidade de esconderijos.
export const SLOTS = {
  2: [{ x: 108, y: 420 }, { x: 284, y: 420 }],
  3: [{ x: 100, y: 330 }, { x: 290, y: 330 }, { x: 195, y: 535 }],
  4: [{ x: 100, y: 315 }, { x: 290, y: 315 }, { x: 100, y: 535 }, { x: 290, y: 535 }],
};

// Fase 1: 1 objeto entre 2 esconderijos. Fase 2: 2 objetos entre 3 ou 4. Fase 3: pegadas até 1 objeto entre 4.
export function generateSession(rng) {
  const items = rng.shuffle(HUNT_ITEMS);
  const plan = [
    { items: [items[0]], spots: 2, trail: false },
    { items: [items[1], items[2]], spots: rng.next() < 0.5 ? 3 : 4, trail: false },
    { items: [items[3]], spots: 4, trail: true },
  ];
  return plan.map((p) => generateStage(p, rng));
}

export function generateStage({ items, spots, trail }, rng) {
  if (items.length > spots) throw new Error('mais objetos que esconderijos');
  const types = rng.shuffle(SPOT_TYPES).slice(0, spots);
  const slots = SLOTS[spots];
  const spotList = types.map((type, i) => ({ id: `s${i}`, type, x: slots[i].x, y: slots[i].y, item: null, critter: null }));
  const holders = rng.shuffle(spotList).slice(0, items.length);
  holders.forEach((sp, i) => { sp.item = items[i]; });
  const critters = rng.shuffle(CRITTERS);
  spotList.filter((sp) => !sp.item).forEach((sp, i) => { sp.critter = critters[i % critters.length]; });
  return { items: items.slice(), spots: spotList, trail };
}

// Esconderijo ainda não aberto que guarda um objeto não encontrado (para dicas).
export function nextTarget(stage, openedIds) {
  return stage.spots.find((s) => s.item && !openedIds.includes(s.id)) || null;
}

export function isStageDone(stage, foundItems) {
  return stage.items.every((it) => foundItems.includes(it));
}
