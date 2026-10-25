// Imagens dos personagens (opcionais). São carregadas antes da primeira cena; se um arquivo
// não existir ou falhar, o jogo usa o desenho vetorial correspondente.
const info = new Map();

export async function preloadSprites(urls, timeoutMs = 4000) {
  const skip = new URLSearchParams(location.search).has('nosprites');
  if (skip) return;
  const load = (url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { info.set(url, { w: img.naturalWidth, h: img.naturalHeight }); resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  });
  await Promise.race([Promise.all(urls.filter(Boolean).map(load)), new Promise((r) => setTimeout(r, timeoutMs))]);
}

export const spriteInfo = (url) => (url ? info.get(url) || null : null);
