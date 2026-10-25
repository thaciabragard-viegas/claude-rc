# Briefing — Mel & Bela: Uma Patinha de Aventura

> Briefing original enviado pela Thacia, mantido aqui como referência permanente do projeto.
> (A mensagem recebida continha o texto repetido três vezes; esta é uma cópia única e integral.)

---

## Instruções de execução para o Claude Code

Você vai implementar o jogo descrito no briefing abaixo no projeto disponível nesta sessão.

Antes de começar:

* Inspecione a pasta e identifique se já existe um projeto.
* Se existir, respeite sua estrutura e preserve alterações anteriores.
* Se a pasta estiver vazia, configure uma aplicação web mobile adequada ao jogo.
* Escolha uma solução simples de executar e manter. Não crie backend, autenticação ou banco de dados remoto sem necessidade.

Organize o desenvolvimento em etapas verificáveis:

1. Estrutura do projeto, identidade visual, personagens provisórios e mapa navegável.
2. Uma primeira experiência completa: lançar a bolinha, Bela buscar e retornar, receber carinho e voltar ao mapa.
3. Implementação completa do banho e da caça aos objetos.
4. Conexão das atividades pela história do piquenique, álbum e salvamento local.
5. Refinamento de animações, áudio, acessibilidade e experiência no celular.

Essas etapas são marcos internos de trabalho. Continue até completar a primeira versão solicitada, salvo impedimento real. Não encerre a entrega após criar apenas a estrutura ou a primeira brincadeira.

Mantenha o briefing completo em um documento do projeto. Registre em CLAUDE.md apenas as instruções duradouras, os comandos relevantes e a referência ao briefing.

Durante a implementação:

* Execute o projeto e verifique as interações.
* Use testes automatizados quando ajudarem a validar a lógica e o progresso.
* Se houver ferramenta de navegador disponível, verifique também o layout mobile e os gestos.
* Não considere compilação bem-sucedida como prova de qualidade visual.
* Não afirme ter verificado aparência, toque, áudio ou dispositivos que não conseguiu testar.
* Corrija os problemas encontrados antes da entrega.

Prioridades:

1. Interações funcionando e compreensíveis para uma criança de 4 anos.
2. Vínculo e expressividade da Bela.
3. Acabamento visual consistente.
4. Recursos complementares.

Não permita que instalação como PWA, recursos offline ou personalização avançada impeçam a conclusão das brincadeiras principais. Caso algum recurso complementar fique pendente, informe claramente.

Ao finalizar, explique como executar, como abrir no celular, quais recursos estão funcionando e quais verificações ainda precisam ser feitas em um aparelho real.

Importante: abrir um endereço localhost no computador não torna o jogo automaticamente acessível no celular. Forneça as instruções adequadas ao ambiente disponível. Não publique o projeto nem exponha um servidor à internet sem autorização.

---

## Briefing do jogo

Desenvolva um jogo infantil para celular chamado “Mel & Bela — Uma Patinha de Aventura”.

Quero uma experiência personalizada, bonita, divertida e funcional para minha filha Mel, de 4 anos. O jogo gira em torno da amizade dela com sua cachorrinha Bela e inclui pessoas reais da nossa família.

Atue como uma equipe de game design, desenvolvimento mobile, ilustração, animação, áudio e experiência infantil. Transforme este briefing em um jogo de verdade, com interações completas, personalidade e acabamento visual.

Não entregue apenas uma proposta, imagens de telas ou um menu com atividades que não funcionam. Implemente a primeira versão jogável descrita abaixo.

### 1. Conceito e experiência

Mel é a protagonista. Ela brinca, cuida e vive pequenas aventuras com Bela, acompanhada pela família.

A experiência deve despertar:

* Carinho pela Bela.
* Curiosidade para explorar.
* Diversão com pequenas surpresas.
* Satisfação ao resolver desafios.
* Autonomia para escolher o que fazer.
* Vontade espontânea de repetir as brincadeiras.

Mel deve tomar pequenas decisões, observar pistas e experimentar ações. Evite atividades em que ela apenas aperta o mesmo botão repetidamente e recebe elogios.

O jogo precisa ser compreensível sem leitura. Use instruções faladas em português brasileiro, demonstrações visuais, ícones claros e gestos simples.

### 2. Personagens

Inclua:

* Mel: menina de 4 anos, protagonista.
* Bela: cachorrinha da Mel e companheira de todas as aventuras.
* Mamãe Thacia.
* Papai Bruno.
* Teteu: irmão mais velho da Mel.
* Tia Laura: babá da Mel.
* Primos: personagens adicionais que serão personalizados posteriormente.

As funções abaixo são propostas narrativas, não descrições de personalidade real:

* Mamãe participa da preparação do piquenique e das surpresas.
* Bruno participa das brincadeiras de bola e de cenas bem-humoradas.
* Teteu monta pequenos circuitos e desafios.
* Tia Laura participa dos cuidados e das descobertas.
* Os primos poderão trazer novas brincadeiras em expansões.

Mel continua sendo quem escolhe e resolve. Os adultos ajudam sem dominar a experiência.

Não invente características físicas definitivas para pessoas reais ou para Bela. Se não houver fotos, use personagens provisórios ilustrados, consistentes e fáceis de substituir. Não interrompa o desenvolvimento pela ausência dessas referências.

Organize nomes, imagens, cores, falas e áudios em uma configuração central para facilitar a personalização posterior.

### 3. Direção visual

Crie um universo infantil acolhedor, com aparência de livro ilustrado interativo.

Características desejadas:

* Ilustração 2D ou 2.5D com formas arredondadas.
* Personagens expressivos e consistentes entre as telas.
* Cenários com profundidade suave.
* Cores alegres e equilibradas.
* Contraste suficiente para identificar os elementos interativos.
* Interface limpa.
* Animações suaves.
* Objetos grandes e fáceis de reconhecer.
* Poucos elementos disputando atenção simultaneamente.

Sugestão de paleta: creme, pêssego, amarelo suave, azul-céu, verde delicado e pontos de coral.

Evite aparência de painel administrativo, botões genéricos de aplicativo, excesso de texto, poluição visual, anúncios e estética feita apenas de emojis.

O jogo deve ter identidade própria. Não copie personagens ou universos de franquias existentes.

### 4. Formato para celular

Priorize uma aplicação web responsiva em orientação vertical, utilizável no Safari do iPhone e no Chrome do Android.

Requisitos:

* Interações por toque.
* Áreas de toque generosas, preferencialmente com pelo menos 56 × 56 pixels CSS.
* Margens adequadas às áreas seguras do celular.
* Nenhuma ação dependente de passar o mouse.
* Nenhum gesto que exija precisão fina.
* Nenhum uso obrigatório de dois dedos.
* Ausência de rolagem acidental durante as brincadeiras.
* Layout adaptável sem cortar personagens ou controles essenciais.
* Botões persistentes de início, som e ajuda visual, discretos e acessíveis.
* Botão de repetir a instrução falada.

Impeça o zoom acidental durante gestos do jogo sem desabilitar globalmente a acessibilidade da página.

Se o ambiente permitir, prepare como PWA instalável e com funcionamento offline após o carregamento dos recursos necessários. Só informe que o modo offline funciona se ele tiver sido implementado e testado.

### 5. Abertura e história

A família está preparando um piquenique no jardim, mas Bela espalhou alguns objetos enquanto brincava.

A abertura deve ser curta e pulável:

* Uma bolinha atravessa a tela.
* Aparecem pequenas pegadas.
* Ouvimos Bela.
* Ela surge dentro da cesta com um guardanapo na cabeça.
* Mel é convidada a ajudar na preparação da festa.

Fala sugerida:

“Mel, a Bela já começou a brincadeira! Vamos preparar nosso piquenique?”

Exiba um botão grande de brincar, com ícone reconhecível.

Não obrigue a criança a assistir à abertura em todas as visitas.

### 6. Mapa principal

Use a casa e o jardim como um pequeno mundo explorável.

Na primeira versão, os locais ativos serão:

* Gramado: brincadeira de bolinha.
* Cantinho do banho: cuidar da Bela.
* Jardim de pistas: procurar objetos.
* Cantinho da Bela: carinho e escolha de bandana.
* Álbum: lembranças das aventuras.

A cozinha e o portão do parque podem aparecer como elementos de cenário para expansões, sem parecer botões ativos caso ainda não funcionem.

Bela deve permanecer visível em boa parte da experiência, reagindo ao toque e acompanhando a navegação de forma coerente.

### 7. Personalidade e reações da Bela

Bela é o coração emocional do jogo.

Implemente estados visuais perceptíveis:

* Esperando.
* Animada.
* Correndo.
* Buscando.
* Curiosa.
* Recebendo carinho.
* Se sacudindo.
* Descansando.

Ela pode:

* Abanar o rabinho quando Mel chega.
* Inclinar a cabeça diante de uma pista.
* Seguir a bolinha com os olhos.
* Trazer um objeto engraçado.
* Deitar de barriga para cima ao receber carinho.
* Espirrar depois de cheirar uma flor.
* Se esconder parcialmente atrás de uma toalha.

Distribua essas reações para que não ocorram todas ao mesmo tempo nem se repitam de forma mecânica.

Nunca faça Bela sofrer, adoecer, ficar triste ou cobrar atenção porque a criança deixou de jogar.

### 8. Primeira brincadeira: “Bela, pega!”

Objetivo: brincar de lançar e buscar a bolinha.

Interação:

* Mel toca na bolinha e arrasta para indicar o lançamento.
* Mostre uma prévia visual simples da direção.
* Ao soltar, a bolinha percorre uma trajetória.
* Bela corre, pega e retorna.
* Ofereça também uma alternativa por toque em um alvo grande, para quem tiver dificuldade de arrastar.

Comece com uma rodada livre, sem obstáculo.

Depois introduza variações:

* Lançar dentro de uma área grande marcada no gramado.
* Escolher a bola igual à mostrada em uma pista.
* Fazer a bola passar por uma rampinha.
* Encontrar uma passagem para Bela contornar uma caixa.
* Escolher entre dois caminhos visuais.

Não use cronômetro, derrota ou pontuação competitiva.

Se o lançamento sair fora da área esperada, mantenha a brincadeira: Bela busca onde for possível ou a bola retorna suavemente para nova tentativa.

Cena de humor ocasional:

Bela volta com uma meia do Bruno. Ele aparece e diz:

“Uai, essa eu estava procurando!”

Depois a brincadeira continua normalmente.

Evite exigir muitos lançamentos para concluir uma missão. Três pequenas etapas variadas são suficientes.

### 9. Segunda brincadeira: “Operação Patinha Limpinha”

Objetivo: limpar Bela depois da brincadeira.

Etapas:

* Passar a esponjinha nas manchas de barro.
* Enxaguar.
* Secar com a toalha.
* Escolher uma bandana.

Use gestos amplos e tolerantes. O progresso deve acompanhar as regiões realmente limpas, com margem generosa para o toque infantil.

Mostre visualmente o que falta sem exigir perfeição.

Surpresas:

* Bela se sacode e respinga água na tela.
* Mel limpa os respingos passando o dedo.
* Bela se esconde atrás da toalha.
* Um toque revela seu focinho.

A sequência deve permitir ajuda automática se a criança ficar presa. Nunca transforme a limpeza em uma tarefa longa ou repetitiva.

As bandanas devem poder ser trocadas depois.

### 10. Terceira brincadeira: “Detetives das Patinhas”

Objetivo: encontrar objetos do piquenique com ajuda de Bela e da família.

Objetos possíveis:

* Guardanapo.
* Bolinha.
* Laço da cesta.

Use uma lista visual com desenhos dos objetos procurados.

Funcionamento:

* Mel toca em esconderijos grandes.
* Cada esconderijo oferece uma reação.
* Bela pode farejar e indicar uma direção.
* Um personagem pode oferecer uma pista falada curta.
* O objeto encontrado aparece na cesta e na lista visual.

Exemplos de esconderijos:

* Atrás de uma caixa.
* Embaixo de um banco.
* Dentro de um cesto aberto.
* Ao lado da casinha.

Evite esconder objetos em lugares perigosos que incentivem imitação, como tomadas, fogão, produtos de limpeza ou locais altos.

Introduza complexidade aos poucos:

* Primeiro, um objeto entre dois esconderijos.
* Depois, dois objetos entre três ou quatro.
* Por fim, uma pista visual simples, como seguir pegadas até o banco.

Varie as posições entre partidas usando combinações válidas e solucionáveis.

Tocar no lugar errado pode revelar uma borboleta ou uma reação simpática. Não use buzina de erro, “você perdeu” ou expressão de decepção.

### 11. Carinho na Bela

Inclua uma interação livre acessível pelo cantinho da Bela.

Ao passar o dedo:

* Bela fecha os olhos.
* Abana o rabinho.
* Muda suavemente de pose.
* Pode se virar de barriga para cima.

Não exija missão, recompensa ou objetivo. Esse espaço deve funcionar como um momento de vínculo e exploração.

### 12. Como as brincadeiras se conectam

A primeira aventura deve ter começo, meio e fim:

* Brincar de bola com Bela.
* Limpar as patinhas depois da brincadeira.
* Encontrar os objetos do piquenique.
* Reunir a família para uma pequena celebração.
* Guardar uma lembrança no álbum.

Permita também acessar as brincadeiras individualmente pelo mapa.

Cada atividade deve durar aproximadamente de um a três minutos, dependendo do ritmo da criança. A aventura completa deve permitir pausas e retomada, sem obrigação de terminar de uma vez.

### 13. Álbum e recompensas

Ao concluir uma aventura, crie uma lembrança ilustrada no álbum: uma composição dos personagens no piquenique.

Não use a câmera do celular nem solicite fotos da criança durante a partida.

As recompensas podem incluir:

* Uma bandana.
* Um brinquedo.
* Uma almofada para o cantinho da Bela.
* Uma nova lembrança no álbum.

Use recompensas previsíveis, sem roleta, sorteio, caixas-surpresa pagas ou escassez artificial.

Não bloqueie o carinho na Bela nem as brincadeiras principais atrás de moedas.

A tela de conclusão deve oferecer com o mesmo destaque:

* Brincar de novo.
* Escolher outra brincadeira.
* Encerrar por agora.

Fala de despedida sugerida:

“A Bela adorou brincar com você. Até a próxima aventura!”

### 14. Dificuldade e ajuda

A dificuldade deve crescer pela variedade e pelas pequenas decisões, sem acelerar o jogo.

Priorize:

* Reconhecimento visual.
* Associação.
* Sequências curtas.
* Observação.
* Coordenação motora simples.
* Escolha entre poucas alternativas.

Apresente uma instrução por vez.

Quando houver dificuldade:

* Destaque suavemente o objeto relevante.
* Mostre uma mão demonstrando o gesto.
* Repita a instrução de forma curta.
* Amplie a tolerância da interação.
* Permita que Bela ajude.

Não interprete uma pausa como erro: a criança pode estar apenas observando.

Evite elogios automáticos a cada toque. Prefira reações concretas:

“Você encontrou a bolinha!”

“As patinhas ficaram limpinhas!”

### 15. Som e narração

Todo o conteúdo deve estar em português brasileiro.

Inclua:

* Trilha instrumental delicada.
* Sons de passos, água, bola e objetos.
* Latidos suaves e pouco frequentes.
* Falas curtas e claras.
* Controles separados para música e voz, na área adulta.

Reduza a música durante falas importantes.

O jogo deve continuar compreensível sem áudio, por meio de pistas e demonstrações.

Inicie o áudio somente depois de uma interação do usuário, respeitando as restrições dos navegadores mobile.

Prepare a substituição das falas por gravações reais da família, sem exigir isso para a primeira versão. Não clone vozes.

Se usar síntese de voz provisória, trate sua ausência ou falha sem bloquear a partida.

Use apenas recursos sonoros próprios ou com licença adequada e documentada.

### 16. Conteúdo para expansões

Planeje a estrutura para adicionar posteriormente:

“Restaurante da Bela”:

* Escolher uma tigela.
* Colocar uma porção indicada de ração própria para cães.
* Servir água.
* Levar a refeição até Bela.
* Trabalhar associação e sequência visual.

Não inclua alimentos inadequados para cães como opções divertidas de alimentação.

“Circuito do Teteu”:

* Túneis.
* Caminhos.
* Obstáculos baixos.
* Escolha de trajetos.

“Passeio no parque”:

* Escolher um brinquedo.
* Colocar a guia com ajuda de um adulto.
* Explorar com supervisão.

“Aventura com os primos”:

* Pequenas missões cooperativas com os personagens dos primos.

Essas expansões não devem atrasar a entrega das três brincadeiras completas da primeira versão.

### 17. Privacidade e área adulta

Não inclua:

* Anúncios.
* Compras.
* Chat.
* Links externos na área infantil.
* Cadastro obrigatório.
* Ranking.
* Rastreamento publicitário.
* Pedidos de câmera, microfone ou localização.

Salve o progresso localmente no dispositivo.

Explique na documentação adulta que a limpeza dos dados do navegador pode apagar esse progresso.

Crie uma área adulta discreta, protegida por uma etapa apropriada para afastar acessos acidentais da criança.

Nela, permita:

* Ajustar áudio.
* Gerenciar referências e gravações, se implementado.
* Reiniciar o progresso com confirmação.
* Consultar informações de privacidade.

Se houver serviços externos, informe claramente na documentação quais dados saem do dispositivo. Priorize uma experiência sem dependência de servidor.

### 18. Implementação

Escolha uma tecnologia adequada ao ambiente disponível e explique brevemente a decisão.

Priorize:

* Carregamento rápido.
* Desempenho em celulares comuns.
* Animações estáveis.
* Recursos leves.
* Separação entre lógica, conteúdo e apresentação.
* Estado de jogo previsível.
* Retomada após alternar de aplicativo.
* Ausência de botões decorativos que não fazem nada.

Evite dependências desnecessárias e física complexa quando uma trajetória controlada produzir uma experiência melhor.

Se não houver recursos ilustrados prontos, crie elementos vetoriais originais e consistentes. Eles precisam sustentar uma experiência visual caprichada.

Não dependa de imagens externas instáveis para funcionar.

### 19. Verificação

Teste, dentro das ferramentas disponíveis:

* Concluir as três brincadeiras.
* Repetir uma brincadeira sem travar.
* Voltar ao mapa durante uma atividade.
* Arrastar o dedo para fora de um objeto sem bloquear a interface.
* Tocar repetidamente em um botão sem duplicar cenas ou recompensas.
* Desativar o áudio.
* Retomar depois de minimizar o navegador.
* Reabrir a página e recuperar o progresso.
* Usar uma tela estreita sem cortes.
* Reiniciar o progresso pela área adulta.

Garanta que nenhuma missão dependa de uma ação impossível ou de um recurso que ainda não foi implementado.

Diferencie testes efetivamente executados de verificações ainda pendentes. Não afirme ter testado em iPhone físico se isso não ocorreu.

### 20. Entrega

Entregue:

* Primeira versão funcional e jogável.
* Forma de abrir e experimentar.
* Código organizado.
* Instruções simples de execução.
* Local de configuração dos personagens, imagens e falas.
* Lista curta do que está pronto.
* Limitações reais e recursos previstos para depois.

Faça escolhas razoáveis e avance sem solicitar aprovação para cada detalhe. Só pergunte quando uma informação ausente impedir uma decisão essencial.

O resultado deve transmitir: “Este é o mundinho da Mel e da Bela”.

Quero que minha filha reconheça as pessoas que ama, ria das travessuras da cachorrinha, descubra pequenas soluções e sinta que participa da aventura.

O principal critério de sucesso é uma criança de 4 anos conseguir começar a brincar com pouca ajuda, compreender o que pode fazer e encontrar graça em experimentar novamente.
