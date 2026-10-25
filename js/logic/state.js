// Estado do progresso. Funções puras (sem DOM) para facilitar testes; o armazenamento é injetado.
import { BANDANAS, REWARDS, DEFAULTS } from '../config.js';

export const ACTIVITIES = ['fetch', 'bath', 'hunt'];
const VERSION = 1;

export function defaultState() {
  return {
    v: VERSION,
    introSeen: false,
    settings: { ...DEFAULTS, muted: false },
    bandana: 'coral',
    unlocked: {
      bandanas: BANDANAS.filter((b) => !b.reward).map((b) => b.id),
      toys: [],
      cushion: false,
    },
    plays: { fetch: 0, bath: 0, hunt: 0, picnic: 0 },
    adventure: { done: [] },
    album: [],
  };
}

const clone = (o) => JSON.parse(JSON.stringify(o));

// Junta o que foi salvo com os valores padrão, tolerando dados antigos ou corrompidos.
export function normalize(raw) {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  const s = { ...d, ...raw };
  s.settings = { ...d.settings, ...(raw.settings || {}) };
  s.unlocked = { ...d.unlocked, ...(raw.unlocked || {}) };
  s.unlocked.bandanas = Array.from(new Set([...d.unlocked.bandanas, ...(s.unlocked.bandanas || [])]))
    .filter((id) => BANDANAS.some((b) => b.id === id));
  s.unlocked.toys = Array.isArray(s.unlocked.toys) ? s.unlocked.toys : [];
  s.plays = { ...d.plays, ...(raw.plays || {}) };
  s.adventure = { done: Array.isArray(raw.adventure?.done) ? raw.adventure.done.filter((a) => ACTIVITIES.includes(a)) : [] };
  s.album = Array.isArray(raw.album) ? raw.album : [];
  if (!s.unlocked.bandanas.includes(s.bandana)) s.bandana = 'coral';
  s.v = VERSION;
  return s;
}

export function load(storage, key) {
  try {
    const txt = storage.getItem(key);
    return normalize(txt ? JSON.parse(txt) : null);
  } catch {
    return defaultState();
  }
}

export function save(storage, key, state) {
  try {
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function grant(s, reward) {
  if (!reward) return null;
  if (reward.kind === 'toy') {
    if (s.unlocked.toys.includes(reward.id)) return null;
    s.unlocked.toys.push(reward.id);
  } else if (reward.kind === 'bandana') {
    if (s.unlocked.bandanas.includes(reward.id)) return null;
    s.unlocked.bandanas.push(reward.id);
  } else if (reward.kind === 'cushion') {
    if (s.unlocked.cushion) return null;
    s.unlocked.cushion = true;
  }
  return reward;
}

// Conclui uma brincadeira. Recompensas só são dadas uma vez (idempotente).
export function completeActivity(state, id) {
  if (!ACTIVITIES.includes(id)) return { state, rewards: [] };
  const s = clone(state);
  s.plays[id] = (s.plays[id] || 0) + 1;
  if (!s.adventure.done.includes(id)) s.adventure.done.push(id);
  const r = grant(s, REWARDS[id]);
  return { state: s, rewards: r ? [r] : [] };
}

export function adventureReady(state) {
  return ACTIVITIES.every((a) => state.adventure.done.includes(a));
}

// Próximo passo sugerido da história do piquenique.
export function nextStep(state) {
  return ACTIVITIES.find((a) => !state.adventure.done.includes(a)) || 'picnic';
}

// Fecha a aventura: cria a lembrança do álbum e recomeça a história.
export function completePicnic(state, { date, members }) {
  if (!adventureReady(state)) return { state, rewards: [], memory: null };
  const s = clone(state);
  const memory = {
    id: s.album.length + 1,
    date,
    bandana: s.bandana,
    members,
    cushion: s.unlocked.cushion,
  };
  s.album.push(memory);
  s.plays.picnic = (s.plays.picnic || 0) + 1;
  s.adventure.done = [];
  const r = grant(s, REWARDS.picnic);
  return { state: s, rewards: r ? [r] : [], memory };
}

export function setBandana(state, id) {
  if (!state.unlocked.bandanas.includes(id)) return state;
  return { ...clone(state), bandana: id };
}

export function setSettings(state, patch) {
  const s = clone(state);
  s.settings = { ...s.settings, ...patch };
  return s;
}

export function markIntroSeen(state) {
  if (state.introSeen) return state;
  return { ...clone(state), introSeen: true };
}

// Apaga o progresso e mantém os ajustes de áudio.
export function resetProgress(state) {
  const d = defaultState();
  d.settings = { ...state.settings };
  return d;
}
