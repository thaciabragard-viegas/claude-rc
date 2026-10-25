// Narração: usa gravações reais quando configuradas em LINES[id].clip; senão, a voz sintetizada
// do aparelho em português. Se nenhuma estiver disponível, o jogo segue normalmente (com legenda).
import { LINES, CHARACTERS } from '../config.js';
import { duck, getSettings } from './audio.js';

let ptVoice = null;
let current = null; // { id, text, vars }
let instruction = null;
let captionEl = null;
let captionTimer = null;
let captionsOn = true;
let audioEl = null;
let token = 0;

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  ptVoice = voices.find((v) => /pt[-_]BR/i.test(v.lang)) || voices.find((v) => /^pt/i.test(v.lang)) || null;
}
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export function setCaptionElement(el) { captionEl = el; }
export function setCaptions(on) { captionsOn = on; if (!on) hideCaption(); }

export function unlockVoice() {
  if (!synth) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    synth.speak(u);
  } catch { /* sem voz sintetizada */ }
}

function fill(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ''));
}

function showCaption(text) {
  if (!captionEl || !captionsOn) return;
  captionEl.textContent = text;
  captionEl.classList.add('show');
  clearTimeout(captionTimer);
  captionTimer = setTimeout(hideCaption, 1400 + text.length * 55);
}
function hideCaption() { captionEl?.classList.remove('show'); }

export function estimateMs(text) { return 900 + text.length * 62; }

export function stopVoice() {
  token++;
  try { synth?.cancel(); } catch { /* ignora */ }
  if (audioEl) { audioEl.pause(); audioEl = null; }
  duck(false);
}

// Fala uma linha. Devolve uma promessa que termina quando a fala acaba (ou por tempo estimado).
export function say(id, vars, { who, asInstruction = false } = {}) {
  const line = LINES[id] || { text: id, who: 'narr' };
  const text = fill(line.text, vars);
  current = { id, vars, who };
  if (asInstruction) instruction = { id, vars, who };
  stopVoice();
  const my = ++token;
  showCaption(text);
  const st = getSettings();
  const est = estimateMs(text);
  if (st.muted || st.voice <= 0) return Promise.resolve(text);

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (my === token) duck(false);
      resolve(text);
    };
    setTimeout(finish, est * 1.8 + 1500); // nunca trava a partida
    duck(true);

    if (line.clip) {
      try {
        audioEl = new Audio(line.clip);
        audioEl.volume = Math.min(1, st.voice);
        audioEl.onended = finish;
        audioEl.onerror = finish;
        audioEl.play().catch(finish);
      } catch { finish(); }
      return;
    }
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      setTimeout(finish, est);
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR';
      if (ptVoice) u.voice = ptVoice;
      const speaker = who || line.who;
      const pitch = CHARACTERS[speaker]?.voicePitch ?? 1.15;
      u.pitch = Math.max(0.5, Math.min(2, pitch));
      u.rate = 0.95;
      u.volume = Math.min(1, st.voice);
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
    } catch {
      setTimeout(finish, est);
    }
  });
}

export function repeatInstruction() {
  const it = instruction || current;
  if (it) return say(it.id, it.vars, { who: it.who });
  return Promise.resolve();
}

export function clearInstruction() { instruction = null; }
export function lineText(id, vars) { return fill((LINES[id] || { text: id }).text, vars); }
