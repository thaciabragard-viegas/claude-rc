// Configuração central do jogo: personagens, cores, bandanas, falas e gravações.
// Para personalizar, edite apenas este arquivo (veja docs/PERSONALIZACAO.md).
//
// IMPORTANTE: cabelo, pele e roupas abaixo são PROVISÓRIOS. Não representam a aparência
// real de ninguém; foram escolhidos só para os personagens serem fáceis de distinguir.
// Para usar uma foto no rosto, coloque o arquivo em /images e preencha `photo`.

export const GAME = {
  title: 'Mel & Bela',
  subtitle: 'Uma Patinha de Aventura',
  storageKey: 'melbela.v1',
};

// hairStyle: 'short' | 'long' | 'bun' | 'pigtails' | 'curly' | 'none'
// badge: ícone no peito que ajuda a reconhecer a pessoa sem ler ('heart' | 'ball' | 'cone' | 'flower' | 'star' | 'leaf')
export const CHARACTERS = {
  mel: {
    name: 'Mel', short: 'Mel', size: 0.74,
    outfit: '#FF8FA3', pants: '#FFD3B0', skin: '#F2C6A0', hair: '#7A5236', hairStyle: 'pigtails',
    badge: 'star', photo: null, voicePitch: 1.5,
  },
  mamae: {
    name: 'Mamãe Thacia', short: 'Mamãe', size: 1,
    outfit: '#FF7F6B', pants: '#6B5B8C', skin: '#E9B892', hair: '#5A3B2A', hairStyle: 'long',
    badge: 'heart', photo: null, voicePitch: 1.2,
  },
  papai: {
    name: 'Papai Bruno', short: 'Papai', size: 1.04,
    outfit: '#5FA8DC', pants: '#5B6B8C', skin: '#E2AE86', hair: '#4A3328', hairStyle: 'short',
    badge: 'ball', photo: null, voicePitch: 0.8,
  },
  teteu: {
    name: 'Teteu', short: 'Teteu', size: 0.86,
    outfit: '#7CC37A', pants: '#4F6E8F', skin: '#EDBE98', hair: '#5A3B2A', hairStyle: 'curly',
    badge: 'cone', photo: null, voicePitch: 1.25,
  },
  laura: {
    name: 'Tia Laura', short: 'Tia Laura', size: 0.98,
    outfit: '#B79CE8', pants: '#6B5B8C', skin: '#D9A37C', hair: '#3E2A20', hairStyle: 'bun',
    badge: 'flower', photo: null, voicePitch: 1.1,
  },
};

// Primos: aparecem na celebração do piquenique. Acrescente, remova ou renomeie à vontade.
export const COUSINS = [
  { name: 'Primo', short: 'Primo', size: 0.8, outfit: '#FFC94D', pants: '#5B6B8C', skin: '#EDBE98', hair: '#4A3328', hairStyle: 'short', badge: 'leaf', photo: null, voicePitch: 1.3 },
  { name: 'Prima', short: 'Prima', size: 0.76, outfit: '#5CC9C0', pants: '#FFD3B0', skin: '#E2AE86', hair: '#2E1F18', hairStyle: 'bun', badge: 'flower', photo: null, voicePitch: 1.45 },
];

// Bela: cores provisórias. Ajuste para ficar parecida com a Bela de verdade.
export const BELA = {
  name: 'Bela',
  fur: '#E8B77E',      // pelo principal
  furLight: '#FFF1DC', // focinho, peito e patinhas
  ear: '#B9814F',      // orelhas
  nose: '#4A3328',
  eye: '#3A2A22',
};

// Bandanas. `reward` indica a brincadeira que libera a bandana (recompensa previsível).
export const BANDANAS = [
  { id: 'coral', color: '#FF7F6B', dots: '#FFF1DC', pattern: 'dots' },
  { id: 'ceu', color: '#6FBCEB', dots: '#FFFFFF', pattern: 'stripes' },
  { id: 'sol', color: '#FFD45C', dots: '#FF9F6B', pattern: 'flowers' },
  { id: 'arco', color: '#FF9FB0', dots: '#7CC6F2', pattern: 'rainbow', reward: 'bath' },
  { id: 'estrelas', color: '#5B6FB8', dots: '#FFE58F', pattern: 'stars', reward: 'picnic' },
];

// Recompensas (sempre as mesmas, sem sorteio).
export const REWARDS = {
  fetch: { kind: 'toy', id: 'patinho', line: 'reward.toy' },
  bath: { kind: 'bandana', id: 'arco', line: 'reward.bandana' },
  hunt: { kind: 'cushion', id: 'almofada', line: 'reward.cushion' },
  picnic: { kind: 'bandana', id: 'estrelas', line: 'reward.stars' },
};

// Falas. `who` define quem fala (narrador = 'narr'). Para usar uma gravação real,
// preencha `clip` com o caminho do arquivo, ex.: clip: 'audio/mamae-convite.m4a'.
// Textos com {x} recebem valores na hora (ex.: o nome do objeto encontrado).
export const LINES = {
  'intro.invite': { who: 'mamae', text: 'Mel, a Bela já começou a brincadeira! Vamos preparar nosso piquenique?' },

  'map.welcome': { who: 'narr', text: 'Para onde vamos? Toque em um lugar do jardim!' },
  'map.suggest.fetch': { who: 'narr', text: 'Que tal brincar de bola com a Bela no gramado?' },
  'map.suggest.bath': { who: 'narr', text: 'A Bela ficou cheia de barro! Vamos dar um banho nela?' },
  'map.suggest.hunt': { who: 'narr', text: 'A Bela escondeu as coisas do piquenique! Vamos procurar?' },
  'map.suggest.picnic': { who: 'mamae', text: 'Tudo pronto! Toque na toalha para chamar a família!' },
  'map.sneeze': { who: 'narr', text: 'Atchim! A Bela cheirou uma flor!' },

  'fetch.free': { who: 'papai', text: 'Arraste a bolinha e solte para jogar!' },
  'fetch.free.alt': { who: 'narr', text: 'Você também pode tocar na grama onde a bolinha vai cair.' },
  'fetch.tap.ball': { who: 'narr', text: 'Segure a bolinha e arraste para cima!' },
  'fetch.back': { who: 'narr', text: 'A Bela trouxe a bolinha!' },
  'fetch.hoop': { who: 'papai', text: 'Agora jogue a bolinha dentro da roda de flores!' },
  'fetch.hoop.in': { who: 'narr', text: 'Caiu bem na roda de flores!' },
  'fetch.hoop.miss': { who: 'narr', text: 'A roda de flores está ali. Vamos de novo?' },
  'fetch.match': { who: 'papai', text: 'Qual bolinha é igual a esta? Toque nela!' },
  'fetch.match.other': { who: 'narr', text: 'Essa é diferente. Qual é igual à do balão?' },
  'fetch.match.ok': { who: 'narr', text: 'Essa mesma! Agora jogue para a Bela!' },
  'fetch.ramp': { who: 'papai', text: 'Jogue a bolinha na rampinha!' },
  'fetch.ramp.ok': { who: 'narr', text: 'Uau! A bolinha pulou a rampinha!' },
  'fetch.ramp.miss': { who: 'narr', text: 'A rampinha está ali. Mais uma vez!' },
  'fetch.box': { who: 'narr', text: 'Opa! A bolinha foi parar atrás da caixa! Por onde a Bela passa?' },
  'fetch.box.closed': { who: 'narr', text: 'Por aqui está fechado. Tem outro caminho?' },
  'fetch.box.ok': { who: 'narr', text: 'Isso! A Bela achou a passagem!' },
  'fetch.sock': { who: 'papai', text: 'Uai, essa eu estava procurando!' },
  'fetch.done': { who: 'narr', text: 'A Bela buscou todas as bolinhas!' },

  'bath.intro': { who: 'laura', text: 'Ih, a Bela ficou cheia de barro! Passe a esponja nas manchas.' },
  'bath.rinse': { who: 'laura', text: 'Agora o chuveirinho! Tire a espuma.' },
  'bath.shake': { who: 'narr', text: 'A Bela se sacudiu! Passe o dedo para limpar a água!' },
  'bath.dry': { who: 'laura', text: 'Agora a toalha. Vamos secar a Bela!' },
  'bath.hide': { who: 'narr', text: 'Cadê a Bela? Toque na toalha!' },
  'bath.peek': { who: 'narr', text: 'Achou! Olha o focinho!' },
  'bath.bandana': { who: 'laura', text: 'Escolha uma bandana para a Bela!' },
  'bath.help': { who: 'laura', text: 'Deixa que eu ajudo um pouquinho!' },
  'bath.done': { who: 'narr', text: 'As patinhas ficaram limpinhas!' },

  'hunt.intro': { who: 'narr', text: 'A Bela espalhou as coisas do piquenique! Toque nos esconderijos para procurar.' },
  'hunt.two': { who: 'narr', text: 'Agora são duas coisas. Olhe a lista lá em cima!' },
  'hunt.trail': { who: 'narr', text: 'Olha as pegadas da Bela! Siga as pegadas.' },
  'hunt.found': { who: 'narr', text: 'Você encontrou {item}!' },
  'hunt.sniff': { who: 'narr', text: 'A Bela está farejando… é por ali!' },
  'hunt.clue': { who: 'any', text: 'Olhe perto {spot}!' },
  'hunt.empty.butterfly': { who: 'narr', text: 'Uma borboleta!' },
  'hunt.empty.ladybug': { who: 'narr', text: 'Olha, uma joaninha!' },
  'hunt.empty.bird': { who: 'narr', text: 'Um passarinho!' },
  'hunt.empty.leaves': { who: 'narr', text: 'Só folhinhas por aqui.' },
  'hunt.empty.snail': { who: 'narr', text: 'Um caracol bem devagarinho!' },
  'hunt.done': { who: 'narr', text: 'Você encontrou tudo para o piquenique!' },

  'corner.intro': { who: 'narr', text: 'Este é o cantinho da Bela. Passe o dedo para fazer carinho!' },
  'corner.wardrobe': { who: 'narr', text: 'Qual bandana a Bela vai usar?' },

  'picnic.call': { who: 'mamae', text: 'Vamos chamar a família? Toque em quem está escondido!' },
  'picnic.mamae': { who: 'mamae', text: 'Que piquenique lindo, Mel!' },
  'picnic.papai': { who: 'papai', text: 'Uai, que festa boa!' },
  'picnic.teteu': { who: 'teteu', text: 'Eba! Piquenique!' },
  'picnic.laura': { who: 'laura', text: 'A Bela está cheirosa!' },
  'picnic.photo': { who: 'mamae', text: 'Todo mundo junto! Toque na moldura para guardar a lembrança.' },
  'picnic.saved': { who: 'narr', text: 'Uma lembrança nova no álbum!' },

  'album.intro': { who: 'narr', text: 'Aqui ficam as lembranças das aventuras.' },
  'album.empty': { who: 'narr', text: 'O álbum está esperando a primeira lembrança. Vamos preparar o piquenique?' },

  'reward.toy': { who: 'narr', text: 'A Bela ganhou um patinho de brinquedo! Ele está no cantinho dela.' },
  'reward.bandana': { who: 'narr', text: 'Uma bandana nova de arco-íris!' },
  'reward.cushion': { who: 'narr', text: 'A Bela ganhou uma almofada nova para o cantinho!' },
  'reward.stars': { who: 'narr', text: 'Uma bandana de estrelinhas para a Bela!' },

  'end.choose': { who: 'narr', text: 'De novo, outra brincadeira, ou descansar?' },
  'bye': { who: 'narr', text: 'A Bela adorou brincar com você. Até a próxima aventura!' },
};

// Nomes falados de objetos e esconderijos (usados nas falas com {item} e {spot}).
export const ITEM_NAMES = {
  guardanapo: 'o guardanapo',
  bolinha: 'a bolinha',
  laco: 'o laço da cesta',
  pratinho: 'o pratinho',
};
export const SPOT_NAMES = {
  caixa: 'da caixa',
  banco: 'do banco',
  cesto: 'do cesto',
  casinha: 'da casinha',
  arbusto: 'da plantinha',
  regador: 'do regador',
};

// Legenda das falas: desligada por padrão (a Mel ainda não lê e a legenda cobriria pistas visuais).
// Um adulto pode ligá-la na área adulta, por exemplo para acompanhar com o som desligado.
export const DEFAULTS = {
  music: 0.45,
  voice: 1,
  sfx: 0.8,
  captions: false,
};
