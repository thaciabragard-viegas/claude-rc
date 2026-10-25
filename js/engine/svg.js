// Utilitários para criar SVG e HTML sem dependências.
export const NS = 'http://www.w3.org/2000/svg';

function apply(el, attrs, isSvg) {
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class' && !isSvg) el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
}

export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(NS, tag);
  apply(el, attrs, true);
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k);
  return el;
}

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  apply(el, attrs, false);
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k);
  return el;
}

// Ator posicionável: o grupo externo recebe a transformação; animações CSS ficam nos filhos.
export class Actor {
  constructor(child, { x = 0, y = 0, scale = 1, flip = 1, rot = 0 } = {}) {
    this.el = s('g', {}, child);
    this.inner = child;
    Object.assign(this, { x, y, scale, flip, rot, opacity: 1 });
    this.apply();
  }
  apply() {
    this.el.setAttribute('transform', `translate(${this.x.toFixed(1)} ${this.y.toFixed(1)}) rotate(${this.rot.toFixed(1)}) scale(${(this.scale * this.flip).toFixed(3)} ${this.scale.toFixed(3)})`);
    this.el.style.opacity = this.opacity;
    return this;
  }
  set(props) { Object.assign(this, props); return this.apply(); }
}

// Converte coordenadas do evento (tela) para o sistema do SVG.
export function toSvgPoint(svg, evt) {
  const m = svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = new DOMPoint(evt.clientX, evt.clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

export function toScreenPoint(svg, x, y) {
  const m = svg.getScreenCTM();
  const p = new DOMPoint(x, y).matrixTransform(m);
  return { x: p.x, y: p.y };
}

export const lerp = (a, b, t) => a + (b - a) * t;
