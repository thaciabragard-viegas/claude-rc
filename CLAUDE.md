# Mel & Bela — instruções do projeto

Jogo infantil web para celular (Mel, 4 anos, e a cachorrinha Bela). Briefing completo e permanente: `docs/BRIEFING.md`. Consulte-o antes de mudar comportamento de jogo.

## Comandos

- `npm start`: servidor local em http://localhost:8080 (`npm run start:lan` expõe na rede local).
- `npm test`: testes unitários da lógica (node:test).
- `npm run test:e2e`: com o servidor rodando, joga tudo num Chromium móvel via Playwright. `SHOTS=<pasta>` salva capturas; `SPEED=4` acelera.
- Parâmetros de URL para teste: `?speed=N` (acelera o relógio do jogo), `?nosw` (sem service worker), `?rounds=free,match,box` (força as rodadas da bola), `?sock=1` (força a cena da meia).

## Regras duradouras

- Sem build e sem dependências: HTML/CSS/JS (módulos ES) + SVG desenhado no código. Mantenha assim.
- Tudo que é personalizável (nomes, cores, fotos, falas, gravações, bandanas) fica em `js/config.js`. Não espalhe esses dados pelas cenas.
- `js/logic/` é puro (sem DOM) e coberto por testes. Regras novas de progresso ou de fases entram ali, com teste.
- Ao adicionar ou remover arquivos em `js/`, `css/` ou `icons/`, atualize `ASSETS` em `sw.js` (um teste confere) e a versão do `CACHE` quando publicar.
- Animações CSS não podem ir em elementos SVG com `transform` posicional. Use um grupo interno (veja `Actor` em `js/engine/svg.js`).
- Temporizações de cena usam `ctx.scope.wait/tween` (pausam em segundo plano e são canceladas ao trocar de cena), não `setTimeout`.
- Experiência infantil: sem derrota, cronômetro, buzina de erro ou pontuação. Áreas de toque de 56 px ou mais. Uma instrução por vez. A Bela nunca fica triste nem cobra atenção.
- Privacidade: nada de rede, anúncios, câmera, microfone, localização ou links externos na área infantil.
- Toda a interface e todas as falas em português do Brasil.
