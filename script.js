/* scripts.js - Quiz Festejando
   Código único e autocontido para o index.html fornecido.
*/

const TEMPO_PADRAO = 20;
const PONTUACAO_DEFAULT = { facil: 10, medio: 20, dificil: 40 };
const STORAGE_KEY = 'quiz_settings_v2';
const BG_MUSIC_KEY = 'quiz_bg_music_owner_v2';
const MUSIC_TIME_KEY = 'quiz_music_time_v2';

/* ---------- Perguntas (conteúdo do quiz) ---------- */
const questions = [
  { q: "Em que ano ocorreu a Proclamação da República no Brasil?", choices: ["1888","1889","1822","1891"], a: 1, difficulty: "facil" },
  { q: "Qual civilização construiu as famosas linhas de Nazca no Peru?", choices: ["Incas","Nazcas","Maias","Aztèques"], a: 1, difficulty: "medio" },
  { q: "Qual cidade foi capital do Império Romano do Ocidente?", choices: ["Roma","Constantinopla","Milan","Ravena"], a: 0, difficulty: "facil" },
  { q: "Qual país tem a maior extensão territorial do mundo?", choices: ["Canadá","Estados Unidos","Rússia","China"], a: 2, difficulty: "facil" },
  { q: "Em que continente fica o Deserto de Gobi?", choices: ["África","Ásia","Oceania","América do Norte"], a: 1, difficulty: "medio" },
  { q: "Quem foi o líder francês executado durante a Revolução Francesa?", choices: ["Napoleão Bonaparte","Luis XVI","Robespierre","Danton"], a: 1, difficulty: "medio" },
  { q: "Qual rio é o mais longo do mundo (disputa com o Amazonas)?", choices: ["Nilo","Amazonas","Yangtzé","Mississippi"], a: 0, difficulty: "dificil" },
  { q: "Qual foi a principal causa da Primeira Guerra Mundial?", choices: ["Invasão à Polônia","Assassinato do arquiduque Franz Ferdinand","Revolução Industrial","Descoberta do petróleo"], a: 1, difficulty: "medio" },
  { q: "Qual país colonizou o Brasil?", choices: ["Espanha","Portugal","Holanda","França"], a: 1, difficulty: "facil" },
  { q: "Qual montanha é conhecida por ser a mais alta do mundo acima do nível do mar?", choices: ["K2","Everest","Kangchenjunga","Lhotse"], a: 1, difficulty: "medio" },
  { q: "Em que ano começou a Segunda Guerra Mundial?", choices: ["1914","1939","1941","1929"], a: 1, difficulty: "facil" },
  { q: "Qual arquipélago pertence ao Reino Unido e fica a sudoeste da Ilha da Bretanha?", choices: ["Ilhas Faroé","Arquipélago do Canal (Ilhas do Canal)","Ilhas Malvinas","Shetland"], a: 1, difficulty: "dificil" },
  { q: "Qual era a principal rota de comércio entre Europa e Ásia no século XIV?", choices: ["Rota do Ouro","Rota do Chá","Rota da Seda","Rota do Clima"], a: 2, difficulty: "medio" },
  { q: "Qual país tem a maior população do mundo?", choices: ["Índia","China","Estados Unidos","Indonésia"], a: 1, difficulty: "facil" },
  { q: "Quem descobriu o Brasil (chegada registrada em 1500)?", choices: ["Vasco da Gama","Pedro Álvares Cabral","Cristóvão Colombo","Fernando de Noronha"], a: 1, difficulty: "facil" },
  { q: "Qual região histórica abrigou as civilizações Maia, Asteca e Inca?", choices: ["África","Mesoamérica e Andes","Sudeste Asiático","Península Arábica"], a: 1, difficulty: "dificil" },
  { q: "Qual tratado terminou a Primeira Guerra Mundial (1919)?", choices: ["Tratado de Versalhes","Tratado de Paris","Tratado de Tordesilhas","Tratado de Utrecht"], a: 0, difficulty: "medio" },
  { q: "Qual é o maior oceano do planeta?", choices: ["Atlântico","Índico","Pacífico","Ártico"], a: 2, difficulty: "facil" },
  { q: "Qual país africano tem a maior população?", choices: ["Egito","Nigéria","África do Sul","Etiópia"], a: 1, difficulty: "medio" },
  { q: "Que evento marcou a queda do Muro de Berlim?", choices: ["Queda do Império Romano","Queda da União Soviética","Reunificação da Alemanha","Fim da Guerra Fria"], a: 2, difficulty: "dificil" }
];

/* ---------- Estado da aplicação ---------- */
const state = {
  pool: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  totalTimeElapsed: 0,
  timer: null,
  timeLeft: TEMPO_PADRAO,
  settings: {
    timePerQuestion: TEMPO_PADRAO,
    shuffleQuestions: true,
    scoreMap: { ...PONTUACAO_DEFAULT },
    globalVolume: 0.35,
    questionsCount: 20,
    musicEnabled: true,     // controla se tocar música de fundo
    playbackRate: 1.0       // se quiser acelerar / desacelerar
  },
  lastAnswerTimestamp: null,
  startedAt: null
};

/* ---------- Helpers DOM ---------- */
const qs = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => Array.from(c.querySelectorAll(s));

/* ---------- Elementos (resiliente a null) ---------- */
const el = {
  screenHome: qs('#screen-home'),
  screenGame: qs('#screen-game'),
  screenResults: qs('#screen-results'),
  btnPlay: qs('#btn-play'),
  btnOpenSettings: qs('#btn-open-settings'),
  modalSettings: qs('#modal-settings'),
  modalSettingsClose: qs('#modal-settings-close'),
  btnSaveSettings: qs('#btn-save-settings'),
  selectDiff: qs('#select-diff'),
  selectCount: qs('#select-count'),
  settingsSummary: qs('#settings-summary'),
  progressText: qs('#progress-text'),
  progressBarInner: qs('.progress-inner'),
  timerSeconds: qs('#timer-seconds'),
  questionText: qs('#question-text'),
  questionImgWrapper: qs('#question-img-wrapper'),
  questionImg: qs('#question-img'),
  answersWrapper: qs('#answers'),
  btnBackMenu: qs('#btn-back-menu'),
  btnOpenAudio: qs('#btn-open-audio'),
  resultScore: qs('#result-score'),
  resultCorrect: qs('#result-correct'),
  resultTotal: qs('#result-total'),
  resultPercent: qs('#result-percent'),
  resultTime: qs('#result-time'),
  btnRestart: qs('#btn-restart'),
  btnBackMenu2: qs('#btn-back-menu-2'),
  sfxCorrect: qs('#sfx-correct'),
  sfxWrong: qs('#sfx-wrong'),
  sfxClick: qs('#sfx-click'),
  sfxTick: qs('#sfx-tick'),
  inputTime: qs('#input-time'),
  toggleShuffle: qs('#toggle-shuffle'),
  scoreFacil: qs('#score-facil'),
  scoreMedio: qs('#score-medio'),
  scoreDificil: qs('#score-dificil'),
  musicVolume: qs('#music-volume'),
  btnCredits: qs('#btn-credits'),
  bgMusic: document.getElementById('bg-music') // garante pegar o elemento correto
};

/* ---------- Utilidades ---------- */
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

/* ---------- Persistência e configurações ---------- */
function loadSettings(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved) state.settings = Object.assign({}, state.settings, saved);
  }catch(e){ /* ignore */ }

  // Atualiza elementos do formulário (se existirem)
  if(el.inputTime) el.inputTime.value = state.settings.timePerQuestion;
  if(el.toggleShuffle) el.toggleShuffle.value = state.settings.shuffleQuestions ? 'true' : 'false';
  if(el.scoreFacil) el.scoreFacil.value = state.settings.scoreMap.facil;
  if(el.scoreMedio) el.scoreMedio.value = state.settings.scoreMap.medio;
  if(el.scoreDificil) el.scoreDificil.value = state.settings.scoreMap.dificil;
  if(el.musicVolume) el.musicVolume.value = state.settings.globalVolume;
  if(el.selectCount) el.selectCount.value = state.settings.questionsCount;
  updateSettingsSummary();
  applyGlobalVolume();
}

function saveSettings(){
  state.settings.timePerQuestion = Number(el.inputTime?.value) || TEMPO_PADRAO;
  state.settings.shuffleQuestions = (el.toggleShuffle?.value === 'true');
  state.settings.scoreMap = {
    facil: Number(el.scoreFacil?.value) || PONTUACAO_DEFAULT.facil,
    medio: Number(el.scoreMedio?.value) || PONTUACAO_DEFAULT.medio,
    dificil: Number(el.scoreDificil?.value) || PONTUACAO_DEFAULT.dificil
  };
  state.settings.globalVolume = Number(el.musicVolume?.value) || 0;
  state.settings.questionsCount = Number(el.selectCount?.value) || 20;
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings)); }catch(e){}
  applyGlobalVolume();
  updateSettingsSummary();
}

function updateSettingsSummary(){
  if(!el.settingsSummary) return;
  const modo = el.selectDiff ? el.selectDiff.value : 'medio';
  el.settingsSummary.textContent = `Modo: ${modo} • ${state.settings.questionsCount} perguntas • Tempo: ${state.settings.timePerQuestion}s • Embaralhar: ${state.settings.shuffleQuestions ? 'Sim' : 'Não'}`;
}

/* ---------- Controle de áudio entre abas (evita múltiplas abas tocando) ---------- */
const tabId = Math.random().toString(36).slice(2,9);
let bc = null;
if('BroadcastChannel' in window){
  try{
    bc = new BroadcastChannel('quiz_channel_v2');
    bc.onmessage = (ev) => {
      if(ev.data && ev.data.type === 'bg_play' && ev.data.owner !== tabId){
        pauseBgMusicLocal();
      }
    };
  }catch(e){}
}

function applyGlobalVolume(){
  const v = Number(state.settings.globalVolume);
  try{
    if(el.bgMusic) el.bgMusic.volume = Math.max(0, Math.min(1, v));
  }catch(e){}
  [el.sfxClick, el.sfxCorrect, el.sfxWrong, el.sfxTick].forEach(a => {
    try{ if(a) a.volume = Math.max(0, Math.min(1, v)); }catch(e){}
  });
}

/* ---------- Controle de música de fundo (owner por aba) ---------- */
function tryPlayBgMusic(){
  if(!el.bgMusic || !state.settings.musicEnabled) return;
  try{
    const owner = localStorage.getItem(BG_MUSIC_KEY);
    if(owner && owner !== tabId) return; // outra aba é dona
  }catch(e){}

  try{
    el.bgMusic.volume = Math.max(0, Math.min(1, state.settings.globalVolume));
    el.bgMusic.play().then(() => {
      try{ localStorage.setItem(BG_MUSIC_KEY, tabId); }catch(e){}
      if(bc) bc.postMessage({ type:'bg_play', owner: tabId });
    }).catch(()=>{ /* autoplay bloqueado até interação */});
  }catch(e){}
}

function pauseBgMusicLocal(){ try{ if(el.bgMusic) el.bgMusic.pause(); }catch(e){} }

window.addEventListener('storage', (ev) => {
  if(ev.key === BG_MUSIC_KEY){
    const val = ev.newValue;
    if(val && val !== tabId) pauseBgMusicLocal();
  }
});
window.addEventListener('beforeunload', () => {
  try{
    const owner = localStorage.getItem(BG_MUSIC_KEY);
    if(owner === tabId) localStorage.removeItem(BG_MUSIC_KEY);
    // salva tempo da música
    saveMusicTime();
  }catch(e){}
});

/* Salvar / restaurar posição da música */
function saveMusicTime(){
  try{
    if(el.bgMusic) localStorage.setItem(MUSIC_TIME_KEY, String(el.bgMusic.currentTime || 0));
  }catch(e){}
}
function restoreMusicTime(){
  try{
    if(!el.bgMusic) return;
    const t = parseFloat(localStorage.getItem(MUSIC_TIME_KEY)) || 0;
    if(!isNaN(t) && t > 0 && t < (el.bgMusic.duration || 999999)){
      el.bgMusic.currentTime = t;
    }
  }catch(e){}
}

/* ---------- Lógica do jogo (preparar, renderizar, timer, respostas) ---------- */
function prepareGame(){
  saveSettings();
  state.score = 0;
  state.correctCount = 0;
  state.totalTimeElapsed = 0;
  state.currentIndex = 0;
  state.startedAt = Date.now();

  const diff = el.selectDiff ? el.selectDiff.value : 'medio';
  let pool = questions.filter(q => q.difficulty === diff);

  // se não houver perguntas suficientes do nível, misturar com outras
  if(pool.length < state.settings.questionsCount){
    const others = questions.filter(q => q.difficulty !== diff);
    shuffleArray(others);
    pool = pool.concat(others).slice(0, Math.min(questions.length, state.settings.questionsCount));
  }

  if(state.settings.shuffleQuestions) shuffleArray(pool);
  state.pool = pool.slice(0, Math.min(state.settings.questionsCount, pool.length));

  renderQuestion();
  showScreen('screen-game');
  tryPlayBgMusic();
}

function renderQuestion(){
  clearTimer();
  const i = state.currentIndex;
  const card = state.pool[i];
  if(!card){ finishGame(); return; }

  // progresso
  if(el.progressText) el.progressText.textContent = `${i+1} / ${state.pool.length}`;
  if(el.progressBarInner) el.progressBarInner.style.width = `${Math.round((i / state.pool.length) * 100)}%`;

  if(el.questionText) el.questionText.textContent = card.q || '';
  if(card.img && el.questionImg && el.questionImgWrapper){
    el.questionImg.src = card.img;
    el.questionImg.alt = `Imagem ${i+1}`;
    el.questionImgWrapper.hidden = false;
  } else if(el.questionImgWrapper){
    el.questionImgWrapper.hidden = true;
  }

  // prepara escolhas e embaralha visualmente
  const choices = card.choices.map((c, idx) => ({ text: c, origIndex: idx }));
  shuffleArray(choices);
  const newCorrectIndex = choices.findIndex(c => c.origIndex === card.a);

  if(el.answersWrapper) el.answersWrapper.innerHTML = '';
  choices.forEach((ch, k) => {
    const btn = document.createElement('button');
    btn.className = 'answer';
    btn.type = 'button';
    btn.setAttribute('role', 'button');
    btn.setAttribute('data-choice-index', String(k));
    btn.setAttribute('data-correct', k === newCorrectIndex ? '1' : '0');
    btn.tabIndex = 0;
    btn.innerHTML = `<div class="label">${String.fromCharCode(65 + k)}</div><div class="text">${ch.text}</div>`;
    btn.addEventListener('click', onAnswerClick);
    if(el.answersWrapper) el.answersWrapper.appendChild(btn);
  });

  // timer
  state.timeLeft = Number(state.settings.timePerQuestion) || TEMPO_PADRAO;
  if(el.timerSeconds) el.timerSeconds.textContent = String(state.timeLeft);
  state.timer = setInterval(() => {
    state.timeLeft--;
    if(state.timeLeft < 0) state.timeLeft = 0;
    if(el.timerSeconds) el.timerSeconds.textContent = String(state.timeLeft);
    if(state.timeLeft <= 0){
      clearTimer();
      handleAnswerTimeout();
    }
  }, 1000);

  // foco acessível na primeira resposta
  const first = el.answersWrapper?.querySelector('.answer');
  if(first) first.focus();
}

function clearTimer(){
  if(state.timer){ clearInterval(state.timer); state.timer = null; }
}

function handleAnswerTimeout(){
  const answers = qsa('.answer', el.answersWrapper || document);
  answers.forEach(a => { a.classList.add('disabled'); });
  const correctBtn = el.answersWrapper?.querySelector('[data-correct="1"]');
  if(correctBtn) correctBtn.classList.add('correct');
  try{ if(el.sfxWrong){ el.sfxWrong.currentTime = 0; el.sfxWrong.play(); } }catch(e){}
  state.lastAnswerTimestamp = Date.now();
  state.totalTimeElapsed += (Number(state.settings.timePerQuestion) || TEMPO_PADRAO);

  // avança para próxima pergunta
  setTimeout(() => { state.currentIndex += 1; renderQuestion(); }, 1000);
}

function onAnswerClick(e){
  const btn = e.currentTarget;
  if(!btn || btn.classList.contains('disabled')) return;

  try{ if(el.sfxClick){ el.sfxClick.currentTime = 0; el.sfxClick.play(); } }catch(e){}

  clearTimer();

  const isCorrect = btn.getAttribute('data-correct') === '1';
  const answers = qsa('.answer', el.answersWrapper || document);
  answers.forEach(a => a.classList.add('disabled'));

  if(isCorrect){
    btn.classList.add('correct');
    try{ if(el.sfxCorrect){ el.sfxCorrect.currentTime = 0; el.sfxCorrect.play(); } }catch(e){}
    state.correctCount += 1;
    const diff = state.pool[state.currentIndex].difficulty;
    const scoreGain = (state.settings.scoreMap && state.settings.scoreMap[diff]) || PONTUACAO_DEFAULT[diff] || 10;
    state.score += Number(scoreGain);
  } else {
    btn.classList.add('wrong');
    try{ if(el.sfxWrong){ el.sfxWrong.currentTime = 0; el.sfxWrong.play(); } }catch(e){}
    const correctBtn = el.answersWrapper?.querySelector('[data-correct="1"]');
    if(correctBtn) correctBtn.classList.add('correct');
  }

  const timeSpent = (Number(state.settings.timePerQuestion) || TEMPO_PADRAO) - state.timeLeft;
  state.totalTimeElapsed += timeSpent;
  state.lastAnswerTimestamp = Date.now();

  setTimeout(() => { state.currentIndex += 1; renderQuestion(); }, 1000);
}

function finishGame(){
  clearTimer();
  if(el.progressBarInner) el.progressBarInner.style.width = '100%';
  if(el.resultScore) el.resultScore.textContent = String(state.score);
  if(el.resultCorrect) el.resultCorrect.textContent = String(state.correctCount);
  if(el.resultTotal) el.resultTotal.textContent = String(state.pool.length || 0);
  const pct = state.pool.length ? Math.round((state.correctCount / state.pool.length) * 100) : 0;
  if(el.resultPercent) el.resultPercent.textContent = pct + '%';
  if(el.resultTime) el.resultTime.textContent = Math.round(state.totalTimeElapsed) + 's';
  showScreen('screen-results');
}

/* ---------- Navegação entre telas ---------- */
function showScreen(id){
  qsa('.screen').forEach(s => s.hidden = true);
  const node = qs(`#${id}`);
  if(node) node.hidden = false;
  qsa('.screen').forEach(s => s.classList.remove('active'));
  if(node) node.classList.add('active');
}

/* ---------- Event listeners UI ---------- */
if(el.btnPlay) el.btnPlay.addEventListener('click', () => { try{ if(el.sfxClick){ el.sfxClick.currentTime = 0; el.sfxClick.play(); } }catch(e){} prepareGame(); });
if(el.btnOpenSettings) el.btnOpenSettings.addEventListener('click', () => { if(el.modalSettings) el.modalSettings.hidden = false; });
if(el.modalSettingsClose) el.modalSettingsClose.addEventListener('click', () => { if(el.modalSettings) el.modalSettings.hidden = true; });
if(el.btnSaveSettings) el.btnSaveSettings.addEventListener('click', () => { saveSettings(); if(el.modalSettings) el.modalSettings.hidden = true; });
if(el.btnBackMenu) el.btnBackMenu.addEventListener('click', () => { showScreen('screen-home'); });
if(el.btnBackMenu2) el.btnBackMenu2.addEventListener('click', () => { showScreen('screen-home'); });
if(el.btnRestart) el.btnRestart.addEventListener('click', () => { prepareGame(); });
if(el.btnOpenAudio) el.btnOpenAudio.addEventListener('click', () => { if(el.modalSettings) el.modalSettings.hidden = false; });
if(el.btnCredits) el.btnCredits.addEventListener('click', () => { try{ if(el.sfxClick){ el.sfxClick.currentTime = 0; el.sfxClick.play(); } }catch(e){} alert('Créditos: Projeto demo.'); });

if(el.musicVolume) el.musicVolume.addEventListener('input', () => {
  const v = Number(el.musicVolume.value);
  state.settings.globalVolume = v;
  applyGlobalVolume();
  // não salvar em cada movimento para não exagerar; salva ao soltar (change)
});
if(el.musicVolume) el.musicVolume.addEventListener('change', () => { saveSettings(); });

if(el.selectDiff) el.selectDiff.addEventListener('change', updateSettingsSummary);
if(el.selectCount) el.selectCount.addEventListener('change', () => { state.settings.questionsCount = Number(el.selectCount.value); updateSettingsSummary(); });

window.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){ if(el.modalSettings && !el.modalSettings.hidden) el.modalSettings.hidden = true; }
  if(['1','2','3','4'].includes(e.key)){
    const idx = Number(e.key) - 1;
    const btn = el.answersWrapper?.querySelector(`.answer[data-choice-index="${idx}"]`);
    if(btn) btn.click();
  }
});

// fecha modal clicando no fundo (overlay)
document.addEventListener('click', (e) => {
  const modal = el.modalSettings;
  if(modal && !modal.hidden && e.target === modal) modal.hidden = true;
});

/* ---------- Música: helpers adicionais ---------- */
function playMusic(){
  if(!el.bgMusic || !state.settings.musicEnabled) return;
  try{
    el.bgMusic.play().catch(()=>{});
  }catch(e){}
}
function stopMusic(){ try{ if(el.bgMusic) el.bgMusic.pause(); }catch(e){} }
function setMusicVolume(){
  if(!el.bgMusic) return;
  const vol = Math.max(0, Math.min(1, state.settings.globalVolume));
  el.bgMusic.volume = vol;
}
function setMusicPlaybackRate(){
  if(!el.bgMusic) return;
  try{ el.bgMusic.playbackRate = Number(state.settings.playbackRate) || 1.0; }catch(e){}
}

/* ---------- Inicialização ---------- */
function init(){
  loadSettings();
  applyGlobalVolume();
  restoreMusicTime();

  // detecta se já existe dono da música (não autoplay)
  try{
    const owner = localStorage.getItem(BG_MUSIC_KEY);
    if(owner && owner !== tabId){
      // não tenta autoplay
    }
  }catch(e){}

  // iniciar música após clique do usuário (por política de autoplay)
  if(el.bgMusic){
    document.body.addEventListener('click', function oncePlay(){
      tryPlayBgMusic();
      document.body.removeEventListener('click', oncePlay);
    });
  }
}
init();

// restaura posição da música periodicamente (opcional)
window.addEventListener('DOMContentLoaded', () => {
  // Se quiser tocar automaticamente após interação e se config permitir
  if(state.settings.musicEnabled){
    // manter volume e playbackRate coerentes
    setMusicVolume();
    setMusicPlaybackRate();
  }
});

window.addEventListener('DOMContentLoaded', restoreMusicTime);
window.addEventListener('beforeunload', saveMusicTime);
