# Mel & Bela — Uma Patinha de Aventura

Jogo infantil para celular feito para a Mel (4 anos) brincar com a cachorrinha Bela e a família.
Funciona no navegador do celular (Safari no iPhone, Chrome no Android), em pé, só com toques.

O briefing completo está em [`docs/BRIEFING.md`](docs/BRIEFING.md).

## Como executar

Precisa apenas do [Node.js](https://nodejs.org) 18 ou mais novo. Não há dependências para instalar.

```bash
npm start          # abre em http://localhost:8080 (só neste computador)
```

Também funciona com qualquer servidor de arquivos estáticos (por exemplo `python3 -m http.server 8080`).
Abrir o `index.html` direto com dois cliques **não** funciona, porque o navegador bloqueia os módulos JavaScript.

## Como abrir no celular

`localhost` só existe no próprio computador. Para jogar no celular, use uma destas opções:

### Opção 1: pela rede Wi-Fi de casa (mais simples)

1. No computador, rode `npm run start:lan`.
2. O terminal mostra um endereço como `http://192.168.0.12:8080`.
3. No celular, conectado **à mesma rede Wi-Fi**, abra esse endereço no Safari ou no Chrome.
4. Para encerrar, aperte `Ctrl+C` no terminal.

O jogo só fica acessível na sua rede de casa, enquanto o comando estiver rodando.
Nesse modo (endereço `http://` sem cadeado), o navegador **não** ativa o funcionamento offline nem a instalação completa como aplicativo.
Ainda dá para usar "Adicionar à Tela de Início" como atalho, mas o computador precisa estar ligado e com o comando rodando.

### Opção 2: hospedagem com HTTPS (para usar como aplicativo e sem internet)

Para instalar como aplicativo e jogar sem internet, o jogo precisa estar num endereço `https://`.
Por exemplo: GitHub Pages, Netlify ou Cloudflare Pages, que servem os arquivos desta pasta como estão, sem etapa de build.
Isso torna o jogo acessível pela internet. Decida antes se quer isso e com que visibilidade (repositório público ou privado, link aberto ou não).

Depois de publicado com HTTPS:

* **iPhone**: Safari → Compartilhar → **Adicionar à Tela de Início**.
* **Android**: Chrome → menu ⋮ → **Instalar app** (ou **Adicionar à tela inicial**).

Depois do primeiro acesso com internet, o jogo abre também sem conexão.

## O que tem no jogo

| Lugar no jardim | Brincadeira |
| --- | --- |
| Gramado (bola) | **Bela, pega!** Arraste a bolinha e solte, ou toque na grama onde ela deve cair. Três rodadas: lançamento livre; depois, sorteados, a roda de flores ou a bola igual à da pista; por fim, a rampinha ou o caminho para contornar a caixa (um aberto, outro fechado). Às vezes a Bela volta com a meia do Papai. |
| Banho (gota) | **Operação Patinha Limpinha**: esponja nas manchas de barro, chuveirinho na espuma, a Bela se sacode e molha a tela (passe o dedo para secar), toalha (ela se esconde embaixo; um toque revela o focinho) e escolha da bandana no varal. |
| Jardim de pistas (patinha) | **Detetives das Patinhas**: 1 objeto em 2 esconderijos → 2 objetos em 3 ou 4 → seguir as pegadas. Lista de figuras no alto, cesta embaixo. Tocar na Bela faz ela farejar e indicar a direção; alguém da família dá uma dica se a Mel ficar procurando. Lugares vazios mostram uma borboleta, uma joaninha ou um passarinho. |
| Cantinho da Bela (coração) | Carinho livre: passe o dedo e a Bela fecha os olhos, abana o rabo e vira de barriga para cima. Brinquedos e troca de bandana. Não há missão. |
| Álbum (livro) | Coleção de adesivos e bandanas e as lembranças ilustradas de cada piquenique. |
| Toalha do piquenique (centro) | Mostra o progresso da história. Quando bola, banho e caça estão feitos, ela brilha: a Mel chama cada pessoa da família, que está espiando, e guarda a lembrança no álbum. |

Recompensas, sempre as mesmas e sem sorteio: patinho de brinquedo (bola), bandana arco-íris (banho), almofada para o cantinho (caça), bandana de estrelinhas e uma nova lembrança no álbum (piquenique).

Botões fixos no alto: **casa** (voltar ao jardim), **balão** (repetir a fala), **mãozinha** (mostrar ajuda) e **alto-falante** (ligar ou desligar o som).
Quando a criança fica um tempo sem tocar, o jogo mostra uma mãozinha demonstrando o gesto, sem tratar a pausa como erro.

## Área dos adultos

Fica no canto inferior direito do jardim, na engrenagem discreta. Para entrar, segure o círculo por 2 segundos e toque no número escrito por extenso.

Na área dos adultos dá para:

* ajustar o volume da música, da voz e dos efeitos;
* ligar a legenda das falas (vem desligada);
* rever a abertura;
* ver o resumo do progresso;
* apagar o progresso, com confirmação;
* ler as informações de privacidade.

### Privacidade

* Sem anúncios, compras, chat, cadastro, ranking ou rastreamento. Nenhum link externo.
* Não pede câmera, microfone nem localização.
* O jogo não tem servidor: o progresso fica **apenas neste aparelho**, no armazenamento do navegador (`localStorage`).
  **Limpar os dados do navegador ou do site apaga o progresso.** Cada aparelho e cada navegador têm seu próprio progresso.
* A narração usa a voz sintetizada do próprio aparelho (Web Speech API). Em alguns sistemas, o fabricante pode processar essa voz on-line. O jogo não envia nada por conta própria.

## Personalização (fotos, nomes, cores, vozes)

Está tudo em um único arquivo: [`js/config.js`](js/config.js). O passo a passo está em [`docs/PERSONALIZACAO.md`](docs/PERSONALIZACAO.md).
Mel, Mamãe e Bela já seguem a referência visual enviada pela família (descrita em `docs/PERSONALIZACAO.md`). Papai, Teteu, Tia Laura e os primos ainda são provisórios.

## Tecnologia (e por quê)

HTML, CSS e JavaScript puros (módulos ES), com ilustrações em SVG desenhadas no código. Não há framework, etapa de build nem dependências.

* Carrega rápido e roda bem em celulares comuns.
* Qualquer servidor de arquivos estáticos serve o jogo.
* As ilustrações vetoriais ficam nítidas em qualquer tela e são fáceis de recolorir.
* Os movimentos usam trajetórias controladas, sem motor de física.

Áudio: trilha e efeitos são **sintetizados no próprio código** (Web Audio API), sem arquivos de terceiros, então não há questões de licença.
A narração usa a voz do aparelho e pode ser trocada por gravações da família (veja a personalização).

Estrutura:

```
index.html, sw.js, manifest.webmanifest
css/            estilos e animações da Bela
js/config.js    personagens, cores, bandanas, falas e gravações  ← personalização
js/engine/      relógio/animação, SVG, áudio, voz
js/logic/       regras puras e testáveis (progresso, fases, lançamento, limpeza)
js/art/         desenhos (Bela, família, objetos, cenários, ícones)
js/scenes/      telas e brincadeiras
tests/          testes unitários e teste de ponta a ponta no navegador
```

## Testes

```bash
npm test                      # testes da lógica (Node)
npm start & npm run test:e2e  # joga a aventura inteira num Chromium com emulação de celular
```

O teste de ponta a ponta usa o Playwright (precisa estar instalado) e faz os gestos com eventos de toque reais. Ele verifica:

* as três brincadeiras e todas as variações da bola, incluindo a cena da meia;
* repetir uma brincadeira e sair dela no meio;
* um arraste cancelado;
* toques repetidos que não duplicam recompensas;
* o som desligado;
* a volta do segundo plano (simulada);
* reabrir a página e recuperar o progresso;
* reiniciar o progresso pela área adulta;
* telas estreitas (320 px) e Android;
* o funcionamento sem internet depois do primeiro acesso.

## Limitações conhecidas e próximos passos

* **Não testado em aparelho físico.** Os testes rodaram em Chromium com emulação de iPhone e Android. Ainda falta conferir num iPhone e num Android reais:
  * toque, áudio e voz;
  * o tempo de resposta;
  * as áreas seguras (notch);
  * a volta depois de trocar de aplicativo.
* Papai, Teteu, Tia Laura e os primos são provisórios até chegarem as referências deles.
* A qualidade da voz sintetizada depende do aparelho. As gravações da família ainda não foram feitas, mas o jogo já aceita os arquivos.
* Expansões planejadas, ainda não implementadas: Restaurante da Bela, Circuito do Teteu, Passeio no parque e Aventura com os primos.
  A cozinha e o portão do parque já aparecem no jardim como cenário (não são botões).
  Para adicionar uma brincadeira: nova cena em `js/scenes/`, registro em `js/scenes/index.js` e um lugar no mapa (`js/scenes/map.js`).
