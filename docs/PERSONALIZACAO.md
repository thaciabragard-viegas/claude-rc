# Personalização

Tudo que identifica a família fica em **`js/config.js`**. Depois de editar, basta recarregar a página.
Se o jogo estiver instalado com acesso offline, feche e abra de novo.

## Personagens (`CHARACTERS` e `COUSINS`)

Cada pessoa tem:

| Campo | O que muda |
| --- | --- |
| `name` / `short` | Nome completo e nome curto |
| `outfitStyle` | `'shirt'` (manga longa na cor `outfit`), `'tee'` (camiseta `shirt` de manga curta) ou `'overalls'` (camiseta `shirt` + jardineira `outfit` com shortinho) |
| `shirt`, `outfit`, `pants`, `shoes` | Cores da camiseta, da roupa/jardineira, da calça e do tênis (código de cor, ex.: `'#FF7F6B'`) |
| `skin`, `hair`, `hairLight` | Cor da pele, do cabelo e do brilho do cabelo |
| `hairStyle` | `'short'`, `'long'`, `'longWavy'` (longo ondulado), `'bun'` (coque), `'pigtails'` (maria-chiquinha), `'curly'`, `'curlyLong'` (cachinhos volumosos) ou `'none'` |
| `smile` | `'open'` para sorriso aberto, ou omita para sorriso simples |
| `badge` | Ícone na roupa que ajuda a reconhecer sem ler: `'heart'`, `'ball'`, `'cone'`, `'flower'`, `'star'`, `'leaf'`, `'necklace'` (colarzinho) ou `null` |
| `photo` | Foto do rosto (opcional). Coloque o arquivo em `images/` e escreva, por exemplo, `photo: 'images/mamae.jpg'`. A foto aparece recortada em círculo no lugar do rosto desenhado. Use uma foto quadrada, com o rosto centralizado. |
| `size` | Altura relativa (adulto = 1) |
| `voicePitch` | Tom da voz sintetizada (0.5 a 2) |

Os primos (`COUSINS`) aparecem na celebração do piquenique. Dá para renomear, adicionar ou remover.

> Importante: ao usar fotos, inclua os arquivos também na lista `ASSETS` de `sw.js` para funcionarem sem internet.

## Bela (`BELA`)

Cores do pelo (`fur`, `furDark`), do focinho, peito e patinhas (`furLight`), das orelhas (`ear`, `earLight`),
das almofadinhas das patas (`pads`), do nariz, dos olhos e da coleira (`collar`, `collarDots`).
Para mudar o formato, edite `js/art/bela.js`.

## Referência visual

A aparência da Mel, da Mamãe e da Bela segue a primeira referência visual enviada pela família (out/2026):

* **Mel**: cachinhos castanhos volumosos, sorriso aberto, camiseta branca, jardineira rosa com shortinho e tênis rosa.
* **Mamãe Thacia**: cabelo castanho-escuro longo e ondulado com risca no meio, camiseta branca, colarzinho, calça jeans e tênis branco.
* **Bela**: jeitinho de pelúcia, pelo caramelo-alaranjado, focinho, peito e patas creme, orelhas caídas marrons, rabo enrolado e felpudo, coleira rosa com carinhas amarelas. A pose de barriga para cima é obrigatória.

A imagem de referência **não** está no repositório, porque ele é público e a imagem mostra o rosto da Mel.
Para guardá-la junto ao projeto no seu computador, use a pasta `docs/referencias/`, que o git ignora.

## Bandanas (`BANDANAS`)

Cor de fundo, cor do detalhe e padrão (`dots`, `stripes`, `flowers`, `stars`, `rainbow`).
`reward: 'bath'` indica que a bandana é ganha ao concluir aquela brincadeira. As que não têm `reward` estão sempre disponíveis.

## Falas e gravações da família (`LINES`)

Cada fala tem `who` (quem fala) e `text`. Para trocar a voz sintetizada por uma gravação real:

1. Grave a fala no celular (por exemplo, com o app Gravador ou Voice Memos).
2. Copie o arquivo para a pasta `audio/`, por exemplo `audio/mamae-convite.m4a`.
3. Na fala correspondente, acrescente `clip`:

```js
'intro.invite': { who: 'mamae', text: 'Mel, a Bela já começou a brincadeira! Vamos preparar nosso piquenique?', clip: 'audio/mamae-convite.m4a' },
```

O texto continua sendo usado na legenda. Formatos que funcionam no iPhone e no Android: `.m4a` (AAC) e `.mp3`.
Inclua os arquivos de áudio em `ASSETS` no `sw.js` para funcionarem offline.

Falas com `{item}` ou `{spot}` são completadas pelo jogo (por exemplo, "Você encontrou {item}!").
Para gravar essas falas, grave uma versão por objeto e troque o texto por frases fixas, ou deixe-as com a voz sintetizada.

Não use clonagem de voz: grave as pessoas de verdade, com a permissão delas.

## Nomes dos objetos (`ITEM_NAMES`, `SPOT_NAMES`)

São as palavras usadas nas falas da brincadeira dos detetives, por exemplo "o laço da cesta" e "perto do banco".
