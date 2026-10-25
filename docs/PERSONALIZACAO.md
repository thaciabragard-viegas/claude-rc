# Personalização

Tudo que identifica a família fica em **`js/config.js`**. Depois de editar, basta recarregar a página.
Se o jogo estiver instalado com acesso offline, feche e abra de novo.

## Personagens (`CHARACTERS` e `COUSINS`)

Cada pessoa tem:

| Campo | O que muda |
| --- | --- |
| `name` / `short` | Nome completo e nome curto |
| `outfit`, `pants` | Cor da roupa (código de cor, ex.: `'#FF7F6B'`) |
| `skin`, `hair` | Cor da pele e do cabelo |
| `hairStyle` | `'short'`, `'long'`, `'bun'` (coque), `'pigtails'` (maria-chiquinha), `'curly'` ou `'none'` |
| `badge` | Ícone na roupa que ajuda a reconhecer sem ler: `'heart'`, `'ball'`, `'cone'`, `'flower'`, `'star'`, `'leaf'` |
| `photo` | Foto do rosto (opcional). Coloque o arquivo em `images/` e escreva, por exemplo, `photo: 'images/mamae.jpg'`. A foto aparece recortada em círculo no lugar do rosto desenhado. Use uma foto quadrada, com o rosto centralizado. |
| `size` | Altura relativa (adulto = 1) |
| `voicePitch` | Tom da voz sintetizada (0.5 a 2) |

Os primos (`COUSINS`) aparecem na celebração do piquenique. Dá para renomear, adicionar ou remover.

> Importante: ao usar fotos, inclua os arquivos também na lista `ASSETS` de `sw.js` para funcionarem sem internet.

## Bela (`BELA`)

Cores do pelo (`fur`), do focinho e peito (`furLight`), das orelhas (`ear`), do nariz e dos olhos.
O desenho é provisório: ajuste as cores para ficar parecida com a Bela de verdade.
Para mudar o formato (orelhas em pé, rabo enrolado etc.), edite `js/art/bela.js`.

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
