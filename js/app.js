import { elements, bySymbol, familyNames } from './data/elements.js?v=118-elements';
import { phases } from './data/phases.js?v=amuleto-20261013';
import { AudioEngine } from './effects/audio.js';

const app = document.querySelector('#app');
const audio = new AudioEngine();
const progress = JSON.parse(localStorage.getItem('cq-vintage-progress') || '{"chapter":1,"intro":false}');
let chapter = Math.max(1, Math.min(7, progress.chapter || 1));
let pick = [];
let beat = 0;
let revealNextScene = false;
let introCutsceneController = null;
let interactionState = 'story';
const savedPlayerName = (localStorage.getItem('playerName') || '').trim().slice(0, 24);
let playerName = savedPlayerName || 'Aprendiz';
function setInteractionState(state){interactionState=state;const sceneRoot=$('#scene');if(sceneRoot)sceneRoot.dataset.gameState=state;syncPhaseElementCard();}
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const phase = () => phases[chapter - 1];
const cutoutNames = new Set('luna cat entregador wolf homemdasneves mumia vampire frankienstein reddragon bluedragon house letter candle candle2 candles3 boladecristal broom pumpkin rose bookshelf shelf decoracao amuletolobisohomem armadurafrankienstein drees pocao1 pocao2 pocao3 pocaodragao pocaohomemdasneves pocaomumia pocaovampiro caldeiraodecoracao clock moon'.split(' '));
const art = (name) => name==='reddragon' ? 'static/images/cutouts/reddragon-restored.png' : name==='homemdasneves' ? 'static/images/cutouts/homemdasneves-clean.png' : `static/images/${cutoutNames.has(name) ? 'cutouts/' : ''}${name}.png`;
const familyColors = { nobres:'#bb8ad8', transicao:'#91a9c8', alcalinos:'#e88356', calcogenios:'#c8c469', halogenios:'#8cbf9c', carbono:'#a38abb', ametais:'#9bb3a5', 'alcalino-terrosos':'#cfaa78', 'familia-do-boro':'#dda98b', nitrogenio:'#8dabc1', lantanoides:'#d69cc1', actinoides:'#c78490' };
const characters = { wolf:'wolf', snow:'homemdasneves', mummy:'mumia', vampire:'vampire', frank:'frankienstein', dragon:'bluedragon' };
const prizes = { 1:'drees', 2:'amuletolobisohomem', 3:'pocaohomemdasneves', 4:'pocaomumia', 5:'pocaovampiro', 6:'armadurafrankienstein', 7:'pocaodragao' };
const firstLines = [
  ['Luna','Uau! Fui convidada para o grande Baile das Nuvens que vai acontecer no Palácio Real!'],
  ['Mensageiro','É um evento muito especial, senhorita Luna! Lembre-se de que o traje obrigatório para a entrada é de gala!'],
  ['Luna','Traje de gala? Perfeito! Tive uma ideia mágica: vou usar a alquimia para sintetizar um lindo vestido flutuante para a ocasião!'],
  ['Luna','Antes de escolher os ingredientes, vamos até a bancada e consultar o Grimório. Cada quadradinho representa um elemento químico, uma das peças que formam as substâncias.'],
  ['Luna','No alto do quadradinho fica o número atômico: ele conta os prótons e identifica o elemento.'],
  ['Luna','No centro aparece o símbolo, uma abreviação do nome do elemento.'],
  ['Luna','Logo abaixo do símbolo está o nome completo do elemento.'],
  ['Luna','Na base aparece a massa atômica, uma medida da massa dos átomos. As colunas são famílias e as linhas são períodos. Agora vamos buscar hélio e neônio para criar um vestido leve e brilhante!']
];
const introLines = [
  ['Luna','Bem-vinda ao meu laboratório! Cada quadradinho do Grimório representa um elemento químico.'],
  ['Luna','O número no alto é o número atômico: ele identifica o elemento e indica quantos prótons há no átomo.'],
  ['Luna','O símbolo é a abreviação do elemento. C é carbono; a letra grande ajuda a encontrá-lo rapidinho.'],
  ['Luna','O nome aparece por extenso logo abaixo do símbolo. Neste exemplo, o elemento é o Carbono.'],
  ['Luna','Na parte de baixo fica a massa atômica: uma medida da massa dos átomos de Carbono.'],
  ['Luna','As colunas são famílias. Elementos da mesma família compartilham propriedades. As cores do livro ajudam a perceber os grupos!'],
  ['Luna','Vamos praticar? Toque em um quadradinho para ver o nome, a família e os números. Depois, seguimos para o baile!']
];
function opening(){
  audio.stopMusic();
  app.innerHTML=`<main class="opening"><section class="cover" id="cover"><div class="cover-bg" aria-hidden="true"></div><div class="cover-glints" aria-hidden="true"></div><div class="cover-controls"><form class="player-registration" id="player-registration"><label for="player-name">Cadastro de Aprendiz de Alquimia</label><input id="player-name" name="playerName" type="text" maxlength="24" autocomplete="given-name" placeholder="Digite seu nome aqui..." value="${escapeHTML(savedPlayerName)}"><button class="start-button" id="start" type="submit">✦ Iniciar Aventura</button></form><button id="cover-sound">♫ Som ligado</button><button id="cover-map">▦ Como ler a tabela?</button></div><section class="cover-lesson" id="cover-lesson"></section></section></main>`;
  $('#player-registration').addEventListener('submit',event=>{event.preventDefault();playerName=$('#player-name').value.trim().slice(0,24)||'Aprendiz';localStorage.setItem('playerName',playerName);beat=0;audio.startMusic();audio.sfx('open');const cover=$('#cover');cover.classList.add('zooming');$('#start').disabled=true;setTimeout(()=>progress.intro ? (chapter===1?openingCutscene():scene()) : tutorial(),1050);});
  $('#cover-sound').onclick=()=>{audio.enabled=!audio.enabled;audio.save();if(audio.enabled)audio.startMusic();else audio.stopMusic();$('#cover-sound').textContent=audio.enabled?'♫ Som ligado':'♫ Som desligado';};
  $('#cover-map').onclick=showCoverLesson;
}
function showCoverLesson(){const panel=$('#cover-lesson');panel.innerHTML=`<div class="cover-lesson-card"><button class="close" id="cover-close" aria-label="Fechar">×</button><p class="eyebrow">Guia rápido</p><h2>Como ler a tabela</h2><div class="sample-element"><span>6</span><b>C</b><small>Carbono</small><em>12,011</em></div><div class="element-key"><span><b>6</b> Número atômico</span><span><b>C</b> Símbolo</span><span><b>Carbono</b> Nome</span><span><b>12,011</b> Massa atômica</span></div><p><b>Famílias</b> são as colunas (grupos): elementos na mesma coluna costumam ter propriedades semelhantes.</p><p><b>Períodos</b> são as linhas horizontais: indicam quantas camadas eletrônicas os átomos ocupam.</p></div>`;panel.classList.add('visible');$('#cover-close').onclick=()=>panel.classList.remove('visible');}
function tutorial(){
  beat=0;
  app.innerHTML=`<main class="story"><header class="top"><span>Prólogo · Aprendendo a ler o Grimório</span><button id="skip-intro">Pular introdução</button></header><section class="scene tutorial-scene"><div class="room-art"></div><img class="room-prop shelf-prop" src="${art('bookshelf')}" alt=""><img class="room-prop decor-prop" src="${art('boladecristal')}" alt=""><img class="room-prop broom-prop" src="${art('broom')}" alt=""><img class="hero luna" src="${art('luna')}" alt="Luna"><img class="hero guest" src="${art('cat')}" alt="Gato mágico"><div class="focus-card" data-highlight="overview" aria-label="Elemento Carbono: número atômico 6, símbolo C, nome Carbono e massa atômica 12,011"><span class="atomic" data-field="atomic" data-label="Número atômico">6</span><strong data-field="symbol" data-label="Símbolo">C</strong><small data-field="name" data-label="Nome">Carbono</small><em data-field="mass" data-label="Massa atômica">12,011</em></div><div class="speech" id="speech"><span class="speaker" id="who"></span><p id="say"></p></div></section></main>`;
  $('#speech').setAttribute('role','button');$('#speech').tabIndex=0;
  bindDialogueAdvance($('.tutorial-scene'),nextTutorial);
  $('#skip-intro').onclick=()=>{progress.intro=true;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));chapter=1;openingCutscene();};
  tutorialTalk();
}
function tutorialTalk(){
  const l=introLines[beat],card=$('.focus-card');
  const highlight=['overview','atomic','symbol','name','mass','family','overview'][beat]||'overview';
  $('#who').textContent=l[0];$('#say').textContent=l[1];
  card.dataset.highlight=highlight;
  card.classList.toggle('zoomed',beat>0);
  card.querySelectorAll('[data-field]').forEach(field=>field.classList.toggle('field-active',field.dataset.field===highlight));
}
function nextTutorial(){
  if(beat===introLines.length-1){openTutorialBook();return;}
  beat++;tutorialTalk();
}
function openTutorialBook(){
  const overlay=document.createElement('section');overlay.className='lesson-overlay open';overlay.innerHTML=`<article class="lesson-book"><button class="close" id="lesson-close" aria-label="Fechar">×</button><div class="lesson-copy"><p class="eyebrow">Uma página do Grimório</p><h2>Como ler um elemento</h2><div class="sample-element"><span>6</span><b>C</b><small>Carbono</small><em>12,011</em></div><p>O <b>número atômico</b> fica no alto e identifica o elemento. O <b>símbolo</b> e o <b>nome</b> aparecem no centro. A <b>massa atômica</b> fica embaixo.</p><p><b>Famílias</b> são as colunas/grupos e reúnem elementos com propriedades semelhantes. <b>Períodos</b> são as linhas horizontais e indicam as camadas eletrônicas.</p><div class="info" id="lesson-info">Escolha um elemento no mapa.</div><button class="mix" id="lesson-done">Entendi, vamos à história</button></div><div class="lesson-map" id="lesson-map"></div></article>`;
  $('.tutorial-scene').append(overlay);
  drawElements($('#lesson-map'),true);
  $('#lesson-close').onclick=()=>overlay.remove();
  $('#lesson-done').onclick=()=>{progress.intro=true;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));chapter=1;openingCutscene();};
}
function openingCutscene(){
  introCutsceneController?.abort();document.querySelectorAll('.prologue-cutscene').forEach(node=>node.remove());app.inert=false;
  chapter=1;scene();
  const cutscene=document.createElement('section');cutscene.className='prologue-cutscene';cutscene.setAttribute('aria-label','Abertura da história');
  cutscene.innerHTML=`<div class="prologue-camera"><div class="prologue-sky"></div><div class="prologue-forest"><i class="forest-tree tree-a"></i><i class="forest-tree tree-b"></i><i class="forest-tree tree-c"></i><i class="forest-tree tree-d"></i><i class="forest-tree tree-e"></i><i class="forest-tree tree-f"></i></div><div class="prologue-path"></div><div class="house-rig prologue-house-rig"><img class="prologue-house" src="${art('house')}" alt="Casa de abóbora da Luna"><div class="prologue-doorway" aria-hidden="true"><i></i></div><div class="prologue-doorlight"></div></div><span class="prologue-knock">TOC, TOC!</span><img class="prologue-courier" src="${art('entregador')}" alt="Mensageiro"></div><div class="prologue-vignette"></div><p class="prologue-narration">Em um reino distante, havia uma jovem alquimista chamada Luna, que combinava magia e ciência para ajudar todos os habitantes do reino.</p><div class="prologue-dialogue" aria-live="polite"></div><button class="prologue-skip" type="button">Pular cena</button>`;
  document.body.append(cutscene);app.inert=true;audio.sfx('open');
  const narration=cutscene.querySelector('.prologue-narration'),dialogue=cutscene.querySelector('.prologue-dialogue');
  const controller=new AbortController();introCutsceneController=controller;
  const revealChapter=async()=>{beat=0;talk();cutscene.classList.add('entering-home');await cutsceneDelay(1250);cutscene.remove();app.inert=false;if(introCutsceneController===controller)introCutsceneController=null;};
  const steps=[
    {duration:1650,run:()=>narration.classList.add('visible')},
    {duration:3800,run:()=>cutscene.classList.add('camera-approach')},
    {duration:2050,run:()=>cutscene.classList.add('courier-arrives')},
    {duration:850,run:()=>{cutscene.classList.add('courier-knocks');audio.sfx('click');}},
    {duration:1650,run:()=>{dialogue.innerHTML='<b>Mensageiro</b><span>Luna, trouxe uma carta do baile real. Posso entrar?</span>';dialogue.classList.add('visible');audio.sfx('pop');}},
    {duration:1050,run:()=>cutscene.classList.add('door-opens','courier-enters')}
  ];
  cutscene.querySelector('.prologue-skip').onclick=()=>{controller.abort();revealChapter();};
  playCutsceneSequence(steps,controller.signal).then(async()=>{
    if(controller.signal.aborted)return;
    await revealChapter();
  });
}
function cutsceneDelay(duration,signal){return new Promise(resolve=>{if(signal?.aborted){resolve(false);return;}const finish=value=>{clearTimeout(timer);signal?.removeEventListener('abort',onAbort);resolve(value);},onAbort=()=>finish(false),timer=setTimeout(()=>finish(true),duration);signal?.addEventListener('abort',onAbort,{once:true});});}
async function playCutsceneSequence(steps,signal){for(const step of steps){if(signal.aborted)return false;step.run();if(!await cutsceneDelay(step.duration,signal))return false;}return !signal.aborted;}
function storyLines(){
  const q=phase();
  if(chapter===1)return firstLines;
  return q.dialogue;
}
function scene(){
  const q=phase(),showReveal=revealNextScene;revealNextScene=false;beat=0;pick=[];
  app.innerHTML=`<main class="story"><header class="top"><span>Capítulo ${q.id} de 7 · ${q.focus}</span><span class="chapter-progress">${'✦'.repeat(q.id)}${'·'.repeat(7-q.id)}</span><button id="sound" aria-label="Alternar som">♫ Som</button></header><section class="scene chapter-scene ${chapter===7?'dragon-scene':''}" id="scene" data-guest="${q.guestType}" style="--chapter-color:${q.color}"><div class="room-art"></div><div class="ground-plane" aria-hidden="true"><i class="ground-shadow shadow-luna"></i><i class="ground-shadow shadow-guest"></i><i class="ground-shadow shadow-pot"></i><span class="floor-rug"></span><span class="floor-mushrooms" aria-hidden="true"></span><span class="floor-stones stones-left">◆ · ◆</span><span class="floor-stones stones-right">· ◆ ·</span><span class="floor-grass grass-left"></span><span class="floor-grass grass-right"></span></div>${showReveal?'<div class="scene-reveal" aria-hidden="true"></div>':''}<img class="room-prop shelf-prop" src="${art('bookshelf')}" alt=""><img class="room-prop candles-prop" src="${art('candles3')}" alt=""><img class="room-prop clock-prop" src="${art('clock')}" alt=""><img class="room-prop rose-prop" src="${art('rose')}" alt=""><img class="room-prop decor-prop" src="${art('boladecristal')}" alt=""><img class="room-prop broom-prop" src="${art('broom')}" alt=""><img class="room-prop pumpkin-prop" src="${art('pumpkin')}" alt=""><img class="room-prop cauldron-decor" src="${art('caldeiraodecoracao')}" alt=""><img class="hero luna" id="luna" src="${art('luna')}" alt="Luna, a bruxinha"><img class="hero guest ${chapter===1?'courier':''} ${chapter===4?'giant':''} ${chapter===3||chapter===6?'monster-large':''} ${chapter===7?'dragon-guest':''}" id="guest" src="${art(chapter===1?'entregador':characters[q.guestType]||'cat')}" alt="${chapter===1?'Mensageiro':q.guest}"><img class="dress-outcome" id="dress-outcome" src="${art('drees')}" alt="Vestido criado para Luna"><div class="story-letter" id="letter"><img src="${art('letter')}" alt=""></div><div class="pot-wrap" id="pot-wrap"><img class="pot" id="pot" src="${art('caldeirao')}" alt="Caldeirão mágico"><i class="bubble bubble-a"></i><i class="bubble bubble-b"></i></div><div class="ingredient-tray" id="ingredient-tray"></div><button class="mix outside-mix" id="mix" disabled>Misturar</button><button class="book-button" id="book" type="button" aria-label="Abrir o Grimório"><img src="${art('grimorio')}" alt=""></button><button class="book-label" id="book-label">Abrir Grimório</button><div class="phase-element-card" id="phase-element-card" aria-label="Exemplo de elemento: número atômico 6, símbolo C, Carbono, massa atômica 12,011"><span data-field="atomic"><small>Número atômico</small>6</span><b data-field="symbol"><small>Símbolo</small>C</b><strong data-field="name"><small>Nome</small>Carbono</strong><em data-field="mass"><small>Massa atômica</small>12,011</em></div><div class="speech" id="speech"><span class="speaker" id="who"></span><p id="say"></p></div><section class="booklayer" id="layer"></section><section class="result" id="result"><article class="card" id="card"></article></section><div class="mix-cinematic" id="mix-cinematic" aria-live="polite"></div><div class="ingredient-fly" id="fly"></div><span class="reaction-word" id="reaction-word"></span></section></main>`;
  setInteractionState('dialogue');
  const restartButton=document.createElement('button');restartButton.type='button';restartButton.id='go-first-phase';restartButton.className='restart-phase';restartButton.textContent='↶ Voltar à Fase 1';restartButton.title='Recomeçar diretamente pela primeira fase';restartButton.onclick=()=>{chapter=1;progress.chapter=1;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));scene();};$('.top').insertBefore(restartButton,$('#sound'));
  if(showReveal)setTimeout(()=>$('.scene-reveal')?.remove(),850);
  $('#speech').setAttribute('role','button');$('#speech').tabIndex=0;
  bindDialogueAdvance($('#scene'),next);
  $('#layer').addEventListener('click',event=>{if(event.target.closest('#close'))closeBook();});
  $('#book').addEventListener('click',toggleBook);$('#book-label').addEventListener('click',toggleBook);
  $('#mix').addEventListener('click',stir);
  $('#sound').onclick=()=>{audio.enabled=!audio.enabled;audio.save();if(audio.enabled)audio.startMusic();else audio.stopMusic();$('#sound').classList.toggle('muted',!audio.enabled);};
  prepareLetterSprite();
  talk();
}
function bindDialogueAdvance(sceneRoot,advance){
  sceneRoot.addEventListener('pointerup',event=>{
    if(event.target.closest('button,input,textarea,select,#book,.book-button,.booklayer,.lesson-overlay,.result,.mix-cinematic'))return;
    const speech=$('#speech');if(speech?.dataset.failureReaction==='true'){speech.classList.add('hidden');speech.dataset.failureReaction='false';return;}
    if(speech?.classList.contains('hidden')||speech?.dataset.noTapAdvance==='true')return;
    advance();
  });
  $('#speech').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();const speech=$('#speech');if(speech.dataset.failureReaction==='true'){speech.classList.add('hidden');speech.dataset.failureReaction='false';return;}advance();}});
}
function talk(){const l=storyLines()[beat],guest=$('#guest'),speech=$('#speech');$('#who').textContent=l[0]==='Narradora'?'':l[0];$('#say').textContent=l[1];const guestSpeaking=l[0]==='Mensageiro'||l[0]===phase().guest,shouldEnter=chapter===1?beat>=0:(beat>0||guestSpeaking);if(shouldEnter&&!guest.classList.contains('entered')){guest.classList.add('entered','arriving');setTimeout(()=>guest.classList.remove('arriving'),chapter===4?1650:1400);}else if(!shouldEnter)guest.classList.remove('entered','arriving');guest.classList.toggle('talking',guestSpeaking);$('#letter').classList.toggle('visible',chapter===1&&beat===1);$('#letter').classList.toggle('in-hand',chapter===1&&beat===1);$('#luna').classList.toggle('holding-letter',chapter===1&&beat===1);$('#luna').classList.toggle('talking',l[0]==='Luna');speech.classList.toggle('speech-guest',guestSpeaking);speech.classList.toggle('speech-luna',l[0]==='Luna');speech.classList.toggle('speech-narrator',!guestSpeaking&&l[0]!=='Luna');if(guestSpeaking||l[0]==='Luna'){positionCharacterSpeech(guestSpeaking?guest:$('#luna'));}else{speech.style.left='50%';speech.style.top='68px';speech.style.bottom='auto';speech.style.width='min(650px,88%)';speech.style.transform='translateX(-50%)';}syncPhaseElementCard();}
function positionCharacterSpeech(character){
  const speech=$('#speech'),sceneRoot=$('#scene');if(!character||!speech||!sceneRoot)return;
  speech.dataset.characterAnchor=character.id;
  requestAnimationFrame(()=>{
    if(!speech.isConnected||speech.classList.contains('hidden')||speech.dataset.characterAnchor!==character.id)return;
    const width=Math.min(character.classList.contains('dragon-guest')?430:400,sceneRoot.clientWidth-32),pad=16;
    // Layout coordinates remain stable while entry animations translate the sprite.
    const center=character.offsetLeft+character.offsetWidth*.5;
    const left=Math.max(pad,Math.min(center-width/2,sceneRoot.clientWidth-width-pad));
    speech.style.setProperty('--speech-width',`${width}px`);
    speech.style.setProperty('--speech-left',`${left}px`);
    sceneRoot.style.setProperty('--dialogue-ceiling',`${speech.offsetHeight+88}px`);
    const actors=[...sceneRoot.querySelectorAll('.hero')].filter(actor=>left<actor.offsetLeft+actor.offsetWidth+16&&left+width>actor.offsetLeft-16);
    const ceiling=Math.min(...actors.map(actor=>actor.offsetTop),character.offsetTop);
    const top=Math.max(64,ceiling-speech.offsetHeight-24);
    speech.style.setProperty('--speech-top',`${top}px`);
    Object.assign(speech.style,{left:`${left}px`,top:`${top}px`,bottom:'auto',width:`${width}px`,transform:'none'});
  });
}

function syncPhaseElementCard(){const card=document.querySelector('#phase-element-card');if(!card)return;const show=chapter===1&&['dialogue','story'].includes(interactionState)&&beat>=3&&beat<=7;card.hidden=!show;card.classList.toggle('visible',show);const fields=beat===4?['atomic']:beat===5?['symbol']:beat===6?['name']:beat===7?['mass']:[];card.querySelectorAll('[data-field]').forEach(field=>field.classList.toggle('field-active',fields.includes(field.dataset.field)));if(!show)return;requestAnimationFrame(()=>{if(!card.isConnected||!card.classList.contains('visible'))return;const scene=document.querySelector('#scene'),speech=document.querySelector('#speech');if(!scene||!speech)return;const frame=scene.getBoundingClientRect(),dialog=speech.getBoundingClientRect(),width=card.offsetWidth,height=card.offsetHeight,gap=12,pad=16;let left=dialog.right+gap-frame.left,top=dialog.top-frame.top;if(left+width>frame.width-pad)left=dialog.left-frame.left-width-gap;if(left<pad||left+width>frame.width-pad){left=Math.max(pad,(frame.width-width)/2);top=dialog.bottom-frame.top+gap;if(top+height>frame.height-pad)top=Math.max(pad,dialog.top-frame.top-height-gap);}left=Math.max(pad,Math.min(left,frame.width-width-pad));top=Math.max(pad,Math.min(top,frame.height-height-pad));card.style.left=`${left}px`;card.style.top=`${top}px`;});}
function next(){if(interactionState==='transition')return;if(chapter===1&&beat===2){const sceneRoot=$('#scene');beat=3;setInteractionState('transition');sceneRoot.classList.add('lesson-transition');audio.sfx('open');setTimeout(()=>{if(!sceneRoot.isConnected)return;sceneRoot.classList.remove('lesson-transition');sceneRoot.classList.add('focus');setInteractionState('story');talk();audio.sfx('click');},950);return;}if(beat<storyLines().length-1){beat++;talk();audio.sfx('click');return;}setInteractionState('ready');$('#speech').classList.add('hidden');$('#phase-element-card')?.remove();$('#scene').classList.add('focus','controls-ready');$('#guest').classList.add('entered');$('#pot-wrap').classList.add('zoom');$('#book').classList.add('book-ready');$('#book-label').classList.add('visible');audio.sfx('open');}
function transitionToScene(){const sceneRoot=$('#scene');if(!sceneRoot)return;sceneRoot.classList.remove('controls-ready');setInteractionState('transition');$('#result').classList.remove('show');const q=phase(),guestArt=art(characters[q.guestType]||'cat'),curtain=document.createElement('div');curtain.className=`chapter-transition transition-chapter-${chapter}`;const bat=`<svg class="arrival-bat" viewBox="0 0 120 70" aria-hidden="true"><path d="M60 28C49 9 36 8 26 2c5 12 3 20-9 12 2 17-5 25-16 23 14 18 28 20 43 13l16-11 16 11c15 7 29 5 43-13-11 2-18-6-16-23-12 8-14 0-9-12-10 6-23 7-34 26Z" fill="#17111f" stroke="#dab9ef" stroke-width="3" stroke-linejoin="round"/><circle cx="51" cy="34" r="2.4" fill="#ffe79a"/><circle cx="69" cy="34" r="2.4" fill="#ffe79a"/></svg>`;curtain.innerHTML=`<div class="arrival-stage"><div class="arrival-sky"></div><div class="arrival-trees"><i></i><i></i><i></i><i></i><i></i></div><div class="arrival-path"></div><div class="house-rig arrival-house-rig"><img class="arrival-house" src="${art('house')}" alt="Casa de abóbora da Luna"><span class="arrival-door"></span><div class="arrival-doorlight"></div></div><span class="arrival-caption">${chapter===4?'A Múmia vem pedir ajuda...':chapter===5?'Um morcego cruza a noite...':'Uma visita chega à casa de Luna...'}</span><div class="arrival-guest ${chapter===4?'arrival-mummy':''} ${chapter===5?'arrival-vampire':''}">${chapter===5?bat:''}<img src="${guestArt}" alt="${q.guest}"></div><span class="arrival-knock">TOC, TOC!</span></div><span class="transition-title">✦ ${q.title} ✦</span>`;sceneRoot.append(curtain);audio.sfx('open');setTimeout(()=>curtain.classList.add('arrival-knocks'),2550);setTimeout(()=>{curtain.classList.add('arrival-enters');audio.sfx('click');},3350);setTimeout(()=>{revealNextScene=true;scene();},4650);}
function drawElements(host,lesson=false){
  host.innerHTML=elements.map(e=>{const style=`grid-column:${e.column};grid-row:${e.row};--family-color:${familyColors[e.family]||'#b3a47e'}`;return `<button class="element" data-e="${e.symbol}" data-family="${e.family}" style="${style}" aria-label="${e.name}, ${e.symbol}, número atômico ${e.number}, massa ${e.mass}" title="${e.name} · ${e.mass}"><span class="n">${e.number}</span><b>${e.symbol}</b><small class="element-name">${e.name}</small><small class="element-mass">${e.mass} u</small></button>`;}).join('');
  if(lesson)host.querySelectorAll('[data-e]').forEach(button=>button.onclick=()=>{const e=bySymbol[button.dataset.e];const info=$('#lesson-info');info.innerHTML=`<b>${e.name} (${e.symbol})</b> · número atômico ${e.number} · massa ${e.mass} · ${familyNames[e.family]||e.family} · grupo ${e.group}, período ${e.period}.`;host.querySelectorAll('.element').forEach(b=>b.classList.toggle('lesson-selected',b===button));});
}
function closeBook(){const sceneRoot=$('#scene');sceneRoot.append($('#ingredient-tray'),$('#mix'));$('#layer').classList.remove('open');sceneRoot.classList.remove('book-open');if(interactionState!=='processing')setInteractionState('ready');}
function toggleBook(){if($('#layer').classList.contains('open')){closeBook();return;}openBook();}
function openBook(){
  if(interactionState==='processing'||interactionState==='transition'||interactionState==='complete')return;
  $('#speech')?.classList.add('hidden');
  if($('#speech'))$('#speech').dataset.failureReaction='false';
  app.inert=false;setInteractionState('book-open');
  $('#scene').querySelectorAll('.mummy-stench').forEach(effect=>effect.remove());
  if(chapter===1){const luna=$('#luna');if(luna?.classList.contains('dressed')){luna.src=art('luna');luna.alt='Luna, a bruxinha';luna.classList.remove('dressed','dress-arrival');}}
  if(chapter===2){const guest=$('#guest');if(guest?.classList.contains('pincher-form')){guest.getAnimations().forEach(animation=>animation.cancel());guest.src=art('wolf');guest.alt='Lobisomem';guest.classList.remove('pincher-form');['transform','opacity','filter','visibility','animation','left','top','right','bottom','width','height'].forEach(property=>guest.style.removeProperty(property));}}
  $('#book')?.classList.remove('retry-pulse');$('#book-label')?.classList.remove('retry-pulse');
  $('#dress-outcome')?.classList.remove('stone-ragged','costume-reveal');$('#pot')?.classList.remove('fail');
  const q=phase();const layer=$('#layer');layer.innerHTML=`<div class="grimoire"><article class="page recipe-page"><button class="close" id="close" aria-label="Fechar">×</button><p class="eyebrow">Grimório da Luna · Missão ${q.id}</p><h2>${q.product}</h2><h3>O pedido</h3><p class="ink">${q.mission}</p><h3>Pistas para a mistura</h3><p class="ink">${q.hint}</p><h3>Ingredientes escolhidos</h3><div class="ingredient-tray" id="ingredient-slot"></div><div class="info" id="info">Escolha elementos na tabela para ver seus dados e enviá-los ao caldeirão.</div><p class="mix-note">Ao misturar, o livro se fecha e a poção é preparada no caldeirão.</p><div id="mix-slot"></div></article><article class="page table-page"><p class="eyebrow">Tabela Periódica · 118 elementos</p><h2>Escolha os ingredientes</h2><p class="map-hint">Família em destaque: ${familyNames[q.family]||q.focus}. As outras famílias continuam visíveis no Grimório.</p><div class="periodic family-focus" id="grid" data-focus-family="${q.family}"></div></article></div>`;
  if(q.final){$('#grid').dataset.focusFamily='final';$('.table-page .map-hint').textContent='Desafio final · em destaque: gases nobres, metais de transição e halogênios. Toque nos elementos para enviá-los ao caldeirão.';}
  $('#ingredient-slot').append($('#ingredient-tray'));$('#mix-slot').append($('#mix'));
  layer.classList.add('open');$('#scene').classList.add('book-open');drawElements($('#grid'));pick.forEach(symbol=>$('#grid [data-e="'+symbol+'"]')?.classList.add('selected'));$('#grid').onclick=e=>{const button=e.target.closest('[data-e]');if(!button)return;const element=bySymbol[button.dataset.e];$('#info').innerHTML=`<b>${element.name} (${element.symbol})</b><br>Número atômico: ${element.number} · Massa atômica: ${element.mass}<br>Família: ${familyNames[element.family]||element.family} · Grupo ${element.group} · Período ${element.period}`;choose(element,button);};renderTray();audio.sfx('open');
}
function renderTray(){const tray=$('#ingredient-tray'),mix=$('#mix');if(!tray||!mix)return;tray.innerHTML=pick.map(s=>`<button class="ingredient-tag" data-remove="${s}" title="Remover ${s}">${s} <small>×</small></button>`).join('');tray.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{pick=pick.filter(s=>s!==b.dataset.remove);renderTray();document.querySelector(`#grid [data-e="${b.dataset.remove}"]`)?.classList.remove('selected');});const needed=phase().recipe.length;mix.disabled=pick.length!==needed;mix.textContent=mix.disabled?`Escolha ${needed} (${pick.length}/${needed})`:'Misturar!';mix.classList.toggle('ready',!mix.disabled);}
function choose(element,source){
  if(pick.includes(element.symbol))pick=pick.filter(s=>s!==element.symbol);else if(pick.length<phase().recipe.length)pick.push(element.symbol);else pick=[...pick.slice(1),element.symbol];
  renderTray();document.querySelectorAll(`#grid [data-e="${element.symbol}"]`).forEach(b=>b.classList.toggle('selected',pick.includes(element.symbol)));const fly=$('#fly'),pot=$('#pot'),origin=source?.getBoundingClientRect(),target=pot.getBoundingClientRect();fly.innerHTML=`<img src="${art('pocao1')}" alt=""><b>${element.symbol}</b>`;fly.style.left=`${origin?origin.left+origin.width/2-30:window.innerWidth*.75}px`;fly.style.top=`${origin?origin.top+origin.height/2-35:window.innerHeight*.35}px`;fly.style.opacity='1';const fromX=origin?origin.left+origin.width/2:window.innerWidth*.75,fromY=origin?origin.top+origin.height/2:window.innerHeight*.35,toX=target.left+target.width/2,toY=target.top+target.height/2;const flight=fly.animate([{transform:'translate(0,0) scale(.45)',opacity:0},{transform:`translate(${(toX-fromX)*.16}px,${(toY-fromY)*.16}px) scale(1.1)`,opacity:1,offset:.18},{transform:`translate(${toX-fromX}px,${toY-fromY}px) scale(.55)`,opacity:.1}],{duration:900,easing:'cubic-bezier(.22,.75,.35,1)'});flight.onfinish=()=>{fly.style.opacity='0';};pot.classList.add('react');$('#reaction-word').textContent='PLOP!';$('#reaction-word').classList.remove('show');void $('#reaction-word').offsetWidth;$('#reaction-word').classList.add('show');audio.sfx('pop');setTimeout(()=>pot.classList.remove('react'),700);
}
async function stir(){
  const q=phase(),mix=$('#mix');
  if(interactionState==='processing'||!mix||mix.disabled||pick.length!==q.recipe.length)return;
  const selected=pick.map(symbol=>bySymbol[symbol]).filter(Boolean),ok=q.recipe.every(symbol=>pick.includes(symbol));
  setInteractionState('processing');mix.disabled=true;$('#book').style.pointerEvents='none';$('#book-label').style.pointerEvents='none';
  mix.classList.remove('ready');mix.textContent='Misturando…';closeBook();audio.sfx('stir');
  try{await consumeIngredientsIntoCauldron();await showMixCinematic(ok,selected);}
  catch(error){console.error('Não foi possível concluir a mistura:',error);releaseAfterFailure();}
}
async function consumeIngredientsIntoCauldron(){
  const tray=$('#ingredient-tray'),pot=$('#pot'),fly=$('#fly');
  if(!tray||!pot)return;
  const target=pot.getBoundingClientRect(),targetX=target.left+target.width/2,targetY=target.top+target.height*.58;
  const animations=[...tray.querySelectorAll('.ingredient-tag')].map(token=>{
    const box=token.getBoundingClientRect(),dx=targetX-(box.left+box.width/2),dy=targetY-(box.top+box.height/2);
    return token.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(.18) rotate(18deg)`,opacity:0}],{duration:480,easing:'cubic-bezier(.5,0,.8,.4)',fill:'forwards'}).finished.catch(()=>{});
  });
  if(fly){fly.getAnimations().forEach(animation=>animation.cancel());fly.replaceChildren();fly.style.opacity='0';}
  if(animations.length)await Promise.all(animations);
  tray.replaceChildren();
}
async function showMixCinematic(ok,selectedElements=pick.map(symbol=>bySymbol[symbol]).filter(Boolean)){
  let overlay=$('#mix-cinematic');
  if(!overlay){overlay=document.createElement('div');overlay.id='mix-cinematic';overlay.className='mix-cinematic';overlay.setAttribute('aria-live','polite');$('#scene')?.append(overlay);}
  const pot=$('#pot'),guest=$('#guest');if(!pot||!guest){setInteractionState('ready');$('#book').style.pointerEvents='auto';$('#book-label').style.pointerEvents='auto';return;}
  document.body.append(overlay);
  const selected=selectedElements;
  overlay.className=`mix-cinematic show ${ok?'success':'failure'}${ok&&chapter===3?' snow-warmth':''}`;
  if(!ok){
    overlay.remove();try{await showFailureAnimation();}catch(error){console.error('A animação de erro foi interrompida:',error);}finally{releaseAfterFailure();}return;
  }
  if(chapter===1){overlay.remove();const luna=$('#luna'),lunaBox=luna.getBoundingClientRect();await flyRewardImage('drees',{x:lunaBox.left+lunaBox.width*.5,y:lunaBox.top+lunaBox.height*.62});await dressLuna();luna.classList.add('celebrate');audio.sfx('win');setTimeout(()=>{luna.classList.remove('celebrate');result(true,false);},650);return;}
  const p=pot.getBoundingClientRect(),g=guest.getBoundingClientRect(),startX=p.left+p.width/2,startY=p.top+p.height*.35,targetX=g.left+g.width*.53,targetY=g.top+g.height*.42;
  overlay.innerHTML=`<div class="success-aura"></div><div class="flight-elements">${selected.map((e,i)=>`<span class="element-comet" data-flight="${i}"><b>${e.symbol}</b><small>${e.name}</small></span>`).join('')}<i class="celebration-sparkles">✦　✧　✦</i></div>`;
  audio.sfx(chapter===7?'win':'success');
  overlay.querySelectorAll('.element-comet').forEach((comet,i)=>{
    comet.style.left=`${startX}px`;comet.style.top=`${startY}px`;
    const spread=(i-(selected.length-1)/2)*35;
    comet.animate([{transform:'translate(-50%,-50%) scale(.4) rotate(-12deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1.12) rotate(8deg)',opacity:1,offset:.18},{transform:`translate(calc(-50% + ${targetX-startX+spread}px),calc(-50% + ${targetY-startY}px)) scale(.22) rotate(22deg)`,opacity:0}],{duration:1050,delay:i*150,easing:'cubic-bezier(.2,.8,.25,1)',fill:'forwards'});
  });
  const flightTime=selected.length?1050+(selected.length-1)*150:400;
  if(chapter>=2&&chapter<=5){const box=guest.getBoundingClientRect(),handY=chapter===2?.53:chapter===3?.62:chapter===4?.58:.62;await delay(flightTime);await flyRewardImage(prizes[chapter],{x:box.left+box.width*.5,y:box.top+box.height*handY},{hold:true});finishReward();return;}
  setTimeout(finishReward,flightTime);
  function finishReward(){guest.classList.add('celebrate');$('#luna')?.classList.add('celebrate');audio.sfx('pop');setTimeout(()=>{$('#guest')?.classList.remove('celebrate');$('#luna')?.classList.remove('celebrate');overlay.remove();result(true,false);},850);}
}
async function showFailureAnimation(){
  const sceneRoot=$('#scene'),guest=$('#guest'),pot=$('#pot'),failedChapter=chapter;
  if(failedChapter===1){
    const luna=$('#luna'),lunaBox=luna.getBoundingClientRect();
    try{await flyRewardImage('drees',{x:lunaBox.left+lunaBox.width*.5,y:lunaBox.top+lunaBox.height*.62});await dressLuna({ragged:true});}
    catch(error){console.error('Não foi possível vestir o traje de erro:',error);}
  }
  const effect=document.createElement('div');effect.className=`failure-effect failure-chapter-${failedChapter} boom-phase`;effect.setAttribute('aria-hidden','true');
  effect.innerHTML=`<div class="failure-smoke">${Array.from({length:10},()=>'<i></i>').join('')}</div><div class="failure-burst"><i></i><i></i><i></i><i></i></div><img class="failure-boom boom-animation" src="static/images/boom.svg" alt=""><strong class="failure-bum">BUM!</strong>`;
  document.body.append(effect);sceneRoot.classList.add('failure-active',`failure-scene-${failedChapter}`);pot.classList.add('fail','react');
  audio.sfx('fail');
  await delay(2900);
  effect.classList.remove('boom-phase');effect.classList.add('consequence-phase');
  if(failedChapter===3)showMeltingConsequence(guest,sceneRoot);
  else if(failedChapter!==1)guest.classList.add('cartoon-hit');else $('#luna').classList.add('cartoon-hit');
  if(failedChapter===2)await transformWolfToPincher(guest);
  if(failedChapter===7)guest.classList.add('dragon-ashen');
  if(failedChapter===4)showMummyStench(guest,sceneRoot);
  if(failedChapter===6)animateArmorBreakdown(guest,sceneRoot);
  showFailureReaction(failedChapter);
  await delay(failedChapter===4?3000:2350);
  effect.remove();sceneRoot.classList.remove('failure-active',`failure-scene-${failedChapter}`);pot.classList.remove('fail','react');guest.classList.remove('cartoon-hit','melting');sceneRoot.querySelectorAll('.melting-vapor').forEach(vapor=>vapor.remove());$('#luna').classList.remove('cartoon-hit');
}
function showMummyStench(guest,sceneRoot){
  sceneRoot.querySelectorAll('.mummy-stench').forEach(effect=>effect.remove());
  const box=guest.getBoundingClientRect(),frame=sceneRoot.getBoundingClientRect(),effect=document.createElement('div');
  effect.className='mummy-stench';effect.setAttribute('aria-hidden','true');
  Object.assign(effect.style,{left:`${box.left-frame.left}px`,top:`${box.top-frame.top}px`,width:`${box.width}px`,height:`${box.height}px`});
  effect.innerHTML=Array.from({length:9},(_,i)=>`<i style="--bubble-x:${8+(i*29)%83}%;--bubble-y:${15+(i*17)%65}%;--bubble-delay:${-i*.29}s;--bubble-size:${18+(i%3)*10}px"></i>`).join('');
  sceneRoot.append(effect);
}
function showMeltingConsequence(guest,sceneRoot){
  const sprite=guest.getBoundingClientRect(),frame=sceneRoot.getBoundingClientRect(),vapor=document.createElement('div');
  guest.classList.add('melting');vapor.className='melting-vapor';vapor.setAttribute('aria-hidden','true');
  vapor.style.left=`${sprite.left-frame.left+sprite.width*.37}px`;vapor.style.top=`${sprite.top-frame.top+sprite.height*.08}px`;vapor.style.width=`${sprite.width*.45}px`;vapor.innerHTML='<i></i><i></i><i></i>';sceneRoot.append(vapor);
}
function showFailureReaction(failedChapter){
  const reactions={
    1:'Ah, não! Esse vestido ficou horrível e nada elegante para o baile... Vamos consultar o Grimório e tentar a poção de novo!',
    2:'Ah, não! A poção deu errado e o Lobisomem virou um Pinscher! Vamos tentar de novo!',
    3:'Ah, não! Essa mistura esquentou demais e o Homem de Gelo está quase derretendo! Rápido, vamos consultar o Grimório e tentar de novo!',
    4:'Que cheiro forte! Essa mistura errada vai deixar a Múmia super fedida! Vamos corrigir essa poção!',
    5:'Ops! Essa mistura deixou o Conde Vlad com dentes de coelho em vez de presas! Vamos tentar outra combinação!',
    6:'Ah, não! A armadura desmoronou todinha... Vamos reajustar os elementos e tentar novamente!',
    7:'Ah, não! A mistura não deu certo e o Dragão ainda precisa de ajuda. Vamos rever os elementos no Grimório e tentar outra combinação!'
  };
  const speech=$('#speech');speech.classList.remove('hidden','speech-narrator','speech-guest','speech-luna');speech.classList.add('speech-luna','failure-reaction');speech.dataset.noTapAdvance='false';speech.dataset.failureReaction='true';
  $('#who').textContent='Luna';$('#say').textContent=reactions[failedChapter]||'A mistura não saiu como esperado. Vamos consultar o Grimório e tentar novamente!';
  positionCharacterSpeech($('#luna'));
}
function releaseAfterFailure(){
  const sceneRoot=$('#scene'),guest=$('#guest'),pot=$('#pot'),book=$('#book'),label=$('#book-label');
  document.querySelectorAll('body > .failure-effect').forEach(effect=>effect.remove());
  if(sceneRoot){sceneRoot.classList.remove('failure-active');for(let id=1;id<=7;id++)sceneRoot.classList.remove(`failure-scene-${id}`);sceneRoot.style.pointerEvents='auto';}
  document.querySelectorAll('body > .mix-cinematic').forEach(effect=>effect.remove());
  sceneRoot?.classList.remove('book-open');sceneRoot?.classList.add('controls-ready');$('#layer')?.classList.remove('open');$('#result')?.classList.remove('show');
  pot?.classList.remove('fail','react');guest?.classList.remove('cartoon-hit','melting');sceneRoot?.querySelectorAll('.melting-vapor').forEach(vapor=>vapor.remove());$('#luna')?.classList.remove('cartoon-hit');
  pick=[];renderTray();setInteractionState('ready');app.inert=false;
  if(book){book.disabled=false;book.hidden=false;book.style.pointerEvents='auto';book.style.visibility='visible';book.classList.add('book-ready','retry-pulse');}
  if(label){label.disabled=false;label.hidden=false;label.style.pointerEvents='auto';label.classList.add('visible','retry-pulse');}
  const speech=$('#speech');if(speech?.dataset.failureReaction!=='true')showFailureReaction(chapter);
}
async function transformWolfToPincher(guest){
  const scene=$('#scene'),sceneBox=scene.getBoundingClientRect(),spriteBox=guest.getBoundingClientRect(),pincher=new Image();
  pincher.src=art('pincher');
  try{await pincher.decode();}catch{}
  if(!pincher.naturalWidth)return;
  guest.getAnimations().forEach(animation=>animation.cancel());guest.classList.remove('cartoon-hit','arriving');guest.src=pincher.src;guest.alt='Pinscher raivoso, resultado da mistura';guest.classList.add('entered','pincher-form');
  const width=Math.min(spriteBox.width*.48,window.innerWidth<=800?92:126),height=width*pincher.naturalHeight/pincher.naturalWidth,left=spriteBox.left+spriteBox.width/2-width/2,top=spriteBox.bottom-height;
  guest.style.left=`${left-sceneBox.left}px`;guest.style.top=`${top-sceneBox.top}px`;guest.style.right='auto';guest.style.bottom='auto';guest.style.width=`${width}px`;guest.style.height=`${height}px`;guest.style.opacity='1';guest.style.visibility='visible';guest.style.transform='none';guest.style.animation='none';guest.style.objectFit='contain';guest.style.mixBlendMode='normal';guest.style.filter='drop-shadow(0 4px 3px #160e0c99)';
  guest.animate([{transform:'scale(.88)',opacity:1},{transform:'scale(1.04)',opacity:1,offset:.72},{transform:'scale(1)',opacity:1}],{duration:520,easing:'cubic-bezier(.2,.8,.25,1)'});
}
function animateArmorBreakdown(guest,sceneRoot){
  const box=guest.getBoundingClientRect(),sceneBox=sceneRoot.getBoundingClientRect(),shards=document.createElement('div');shards.className='armor-breakup';
  shards.style.left=`${box.left-sceneBox.left+box.width*.28}px`;shards.style.top=`${box.top-sceneBox.top+box.height*.25}px`;shards.style.width=`${box.width*.46}px`;shards.style.height=`${box.height*.52}px`;
  shards.innerHTML=Array.from({length:7},(_,i)=>`<i style="--shard:${i}"></i>`).join('');sceneRoot.append(shards);
  shards.querySelectorAll('i').forEach((shard,i)=>shard.animate([{transform:'translate(0,0) rotate(0) scale(1)',opacity:1},{transform:`translate(${(i-3)*34}px,${70+(i%3)*28}px) rotate(${(i%2?1:-1)*(70+i*12)}deg) scale(.7)`,opacity:0}],{duration:1050,delay:i*55,easing:'cubic-bezier(.2,.65,.3,1)',fill:'forwards'}).finished.catch(()=>{}));
  setTimeout(()=>shards.remove(),1550);
}
function showNarratorOutcome(message,buttonText,onContinue,speaker='Narradora'){
  setInteractionState('victory-dialogue');
  const speech=$('#speech'),guestOutcome=speaker!=='Narradora';speech.classList.remove('hidden','speech-luna','speech-guest','speech-narrator','guest-outcome','failure-reaction');speech.classList.add(guestOutcome?'speech-guest':'speech-narrator','outcome-dialogue');if(guestOutcome)speech.classList.add('guest-outcome');speech.dataset.failureReaction='false';
  speech.dataset.noTapAdvance='true';
  speech.style.left='50%';speech.style.top='78px';speech.style.bottom='auto';speech.style.width='min(820px,90%)';speech.style.transform='translateX(-50%)';
  speech.innerHTML=`${guestOutcome?`<span class="speaker">${escapeHTML(speaker)}</span>`:''}<p>${escapeHTML(message)}</p><button class="story-choice" id="narrator-continue">${escapeHTML(buttonText)}</button>`;
  if(guestOutcome)positionCharacterSpeech($('#guest'));
  speech.onclick=event=>event.stopPropagation();$('#narrator-continue').addEventListener('click',()=>{setInteractionState('transition');onContinue();});
}
function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function prepareLetterSprite(){
  const image=$('#letter img');if(!image)return;
  // Use the cutout PNG unchanged; rewriting alpha to 255 used to restore its white background.
  image.src=art('letter');image.style.opacity='1';image.style.mixBlendMode='normal';
}
function flyRewardImage(asset,target,{hold=false}={}){
  return new Promise(resolve=>{
    const scene=$('#scene'),pot=$('#pot'),sceneBox=scene.getBoundingClientRect(),start=pot.getBoundingClientRect();
    const sprite=new Image();sprite.className='reward-flight';sprite.dataset.rewardAsset=asset;sprite.src=art(asset);sprite.alt=asset==='drees'?'Vestido do baile':asset==='amuletolobisohomem'?'Amuleto de proteção':'Poção pronta';document.body.append(sprite);
    sprite.decode().catch(()=>{}).then(()=>{
      sprite.style.left=`${start.left+start.width/2-sprite.getBoundingClientRect().width/2}px`;sprite.style.top=`${start.top+start.height*.28-sprite.getBoundingClientRect().height/2}px`;
      const fromX=start.left+start.width/2,fromY=start.top+start.height*.28;
      const flight=sprite.animate([{transform:'translate(0,0) scale(.35) rotate(-18deg)',opacity:0},{transform:`translate(${target.x-fromX}px,${target.y-fromY}px) scale(1.12) rotate(8deg)`,opacity:1,offset:.72},{transform:`translate(${target.x-fromX}px,${target.y-fromY}px) scale(1) rotate(0deg)`,opacity:1}],{duration:1150,easing:'cubic-bezier(.2,.8,.25,1)',fill:'forwards'});
      flight.finished.catch(()=>{}).then(()=>{
        if(hold){flight.cancel();sprite.className='held-potion';scene.append(sprite);const heldBox=sprite.getBoundingClientRect();sprite.style.left=`${target.x-sceneBox.left-heldBox.width/2}px`;sprite.style.top=`${target.y-sceneBox.top-heldBox.height/2}px`;}
        else sprite.remove();
        audio.sfx('pop');resolve(sprite);
      });
    });
  });
}
async function dressLuna({ragged=false}={}){
  const luna=$('#luna'),base=new Image(),dress=new Image();base.src=art('luna');dress.src=art('drees');
  await Promise.all([base.decode(),dress.decode()]);
  const canvas=document.createElement('canvas');canvas.width=base.naturalWidth;canvas.height=base.naturalHeight;
  const context=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  context.imageSmoothingEnabled=false;context.drawImage(base,0,0);
  // Fit the garment to the original sprite's neckline, waist and hem in sprite coordinates.
  // The same composed sprite follows Luna's flip, breathing and celebration animations.
  const seams=[[.465,.405,.642],[.515,.411,.665],[.605,.433,.655],[.635,.405,.690],[.705,.356,.736],[.805,.282,.813],[.866,.263,.837],[.901,.342,.761]];
  const garment=document.createElement('canvas');garment.width=dress.naturalWidth;garment.height=dress.naturalHeight;
  const ink=garment.getContext('2d');ink.drawImage(dress,0,0);
  const pixels=ink.getImageData(0,0,garment.width,garment.height).data;
  const rows=[];
  for(let y=0;y<garment.height;y++){
    let left=garment.width,right=-1;
    for(let x=0;x<garment.width;x++)if(pixels[(y*garment.width+x)*4+3]>96){left=Math.min(left,x);right=x;}
    if(right>=left)rows.push({y,left,width:right-left+1});
  }
  const top=Math.round(seams[0][0]*h),bottom=Math.round(seams.at(-1)[0]*h);
  context.save();
  context.beginPath();seams.forEach(([y,left],index)=>index?context.lineTo(left*w,y*h):context.moveTo(left*w,y*h));
  [...seams].reverse().forEach(([y,,right])=>context.lineTo(right*w,y*h));context.closePath();
  // Replace the old robe rather than stacking a second skirt over it.
  context.globalCompositeOperation='destination-out';context.fill();context.globalCompositeOperation='source-over';
  if(ragged)context.filter='grayscale(1) sepia(.62) contrast(1.18) brightness(.78)';
  for(let y=top;y<bottom;y++){
    const t=(y-top)/(bottom-top),source=rows[Math.min(rows.length-1,Math.floor(t*rows.length))];
    if(!source)continue;
    const index=Math.max(0,seams.findIndex(point=>point[0]*h>y)-1),a=seams[index],b=seams[index+1]||a;
    const blend=b[0]===a[0]?0:(y/h-a[0])/(b[0]-a[0]);
    const left=(a[1]+(b[1]-a[1])*blend)*w,right=(a[2]+(b[2]-a[2])*blend)*w;
    context.drawImage(garment,source.left,source.y,source.width,1,Math.round(left),y,Math.round(right-left),1);
  }
  context.restore();
  const foreground=points=>{context.save();context.beginPath();points.forEach(([x,y],i)=>i?context.lineTo(x*w,y*h):context.moveTo(x*w,y*h));context.closePath();context.clip();context.drawImage(base,0,0);context.restore();};
  // Restore hair/neck, the raised arm, the lowered sleeve/hand, and both boots.
  foreground([[0,0],[1,0],[1,.465],[.64,.465],[.61,.48],[.43,.48],[.40,.465],[0,.465]]);
  foreground([[0,.44],[.405,.44],[.405,.59],[.37,.63],[0,.65]]);
  foreground([[.72,.465],[1,.465],[1,.73],[.80,.73],[.73,.64]]);
  foreground([[0,.901],[1,.901],[1,1],[0,1]]);
  luna.classList.add('dress-arrival');luna.src=canvas.toDataURL('image/png');
  luna.alt=ragged?'Luna vestindo o vestido de pedra rasgado':'Luna vestindo o vestido leve e brilhante do baile';
  await delay(900);luna.classList.remove('dress-arrival');luna.classList.add('dressed');
}
async function equipFrankenstein(){
  const guest=$('#guest'),scene=$('#scene'),pot=$('#pot'),g=guest.getBoundingClientRect(),s=scene.getBoundingClientRect(),p=pot.getBoundingClientRect();
  const base=new Image(),source=new Image();base.src=art('frankienstein');source.src=art('armadurafrankienstein');
  await Promise.all([base.decode(),source.decode()]);
  const armor=new Image();armor.className='frank-armor';armor.alt='Peças da armadura se encaixando no corpo de Frankenstein';
  try{
    const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height),data=pixels.data,w=canvas.width,h=canvas.height,queue=new Int32Array(w*h),queued=new Uint8Array(w*h);let read=0,write=0;
    const isPaper=i=>data[i]>165&&data[i+1]>185&&data[i+2]>210;
    const enqueue=cell=>{if(!queued[cell]){queued[cell]=1;queue[write++]=cell;}};
    for(let x=0;x<w;x++){const top=x*4,bottom=((h-1)*w+x)*4;if(isPaper(top))enqueue(x);if(isPaper(bottom))enqueue((h-1)*w+x);}
    for(let y=1;y<h-1;y++){const left=y*w*4,right=(y*w+w-1)*4;if(isPaper(left))enqueue(y*w);if(isPaper(right))enqueue(y*w+w-1);}
    while(read<write){const cell=queue[read++],i=cell*4;if(!isPaper(i))continue;data[i+3]=0;const x=cell%w,y=(cell/w)|0;if(x>0)enqueue(cell-1);if(x<w-1)enqueue(cell+1);if(y>0)enqueue(cell-w);if(y<h-1)enqueue(cell+w);}
    context.putImageData(pixels,0,0);armor.src=canvas.toDataURL('image/png');
  }catch{armor.src=source.src;}
  await armor.decode();
  const outfit=document.createElement('canvas');outfit.width=base.naturalWidth;outfit.height=base.naturalHeight;
  const ink=outfit.getContext('2d'),w=outfit.width,h=outfit.height,aw=armor.naturalWidth,ah=armor.naturalHeight;
  ink.imageSmoothingEnabled=false;
  // Separate the breastplate/gauntlets and leggings; leave Frankenstein's face uncovered.
  ink.drawImage(armor,0,ah*.355,aw,ah*.34,w*.025,h*.425,w*.95,h*.35);
  ink.drawImage(armor,0,ah*.695,aw,ah*.305,w*.08,h*.775,w*.84,h*.205);
  const fitted=document.createElement('canvas');fitted.width=w;fitted.height=h;
  const body=fitted.getContext('2d');body.imageSmoothingEnabled=false;body.drawImage(base,0,0);
  body.clearRect(0,h*.445,w,h*.535);body.drawImage(outfit,0,0);
  body.drawImage(base,0,0,w,h*.445,0,0,w,h*.445);
  // Both layers use the exact same sprite box and horizontal flip while dressing.
  armor.src=outfit.toDataURL('image/png');
  Object.assign(armor.style,{left:`${g.left-s.left}px`,top:`${g.top-s.top}px`,width:`${g.width}px`,height:`${g.height}px`});scene.append(armor);
  const fromX=p.left+p.width/2-(g.left+g.width/2),fromY=p.top+p.height/2-(g.top+g.height*.62);
  await armor.animate([{transform:`translate(${fromX}px,${fromY}px) scale(.2) rotate(-18deg)`,opacity:0},{transform:'translate(0,0) scale(1.04)',opacity:1,offset:.8},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:1550,easing:'cubic-bezier(.2,.8,.25,1)',fill:'forwards'}).finished.catch(()=>{});
  guest.src=fitted.toDataURL('image/png');guest.alt='Frankenstein vestindo a armadura de cristal';armor.remove();
  guest.classList.add('armor-fitting');audio.sfx('pop');await delay(650);guest.classList.remove('armor-fitting');
  guest.classList.add('celebrate');audio.sfx('win');await delay(600);guest.classList.remove('celebrate');
}
async function fittedDragonTexture(){
  // Normalize transparent margins so the red and blue forms share the same framing.
  const image=new Image();image.src=art('reddragon');await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ink=canvas.getContext('2d',{willReadFrequently:true});ink.drawImage(image,0,0);
  const data=ink.getImageData(0,0,canvas.width,canvas.height).data;
  let left=canvas.width,top=canvas.height,right=0,bottom=0;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(left>right)return image.src;
  const framed=document.createElement('canvas');framed.width=right-left+1;framed.height=bottom-top+1;
  const sprite=framed.getContext('2d');sprite.imageSmoothingEnabled=false;sprite.drawImage(image,left,top,framed.width,framed.height,0,0,framed.width,framed.height);
  return framed.toDataURL('image/png');
}
async function dragonTransformation(){
  const guest=$('#guest');guest.classList.remove('dragon-ashen');const box=guest.getBoundingClientRect();
  await flyRewardImage('pocaodragao',{x:box.left+box.width*.49,y:box.top+box.height*.3});
  const colorShift=guest.animate([{filter:'brightness(1) saturate(1)',transform:'scale(1)'},{filter:'brightness(2.2) sepia(.9) saturate(2.4) drop-shadow(0 0 35px #fff1a8)',transform:'scale(1.09)'},{filter:'brightness(1.4) saturate(1.3) drop-shadow(0 0 24px #ff724c)',transform:'scale(1.02)'},{filter:'brightness(1) saturate(1.1)',transform:'scale(1)'}],{duration:1550,easing:'ease-in-out',fill:'forwards'});
  await delay(620);guest.src=await fittedDragonTexture();guest.alt='Dragão de Cristal vermelho, recuperado pela poção';guest.classList.add('dragon-red');
  await colorShift.finished.catch(()=>{});audio.sfx('win');guest.classList.add('celebrate');await delay(600);guest.classList.remove('celebrate');
}
function showCertificate(){
  const resultPanel=$('#result'),card=$('#card'),sceneRoot=$('#scene');
  sceneRoot?.classList.add('game-complete');setInteractionState('complete');
  $('#layer')?.classList.remove('open');$('#mix')?.setAttribute('disabled','');
  const book=$('#book'),label=$('#book-label');if(book)book.style.pointerEvents='none';if(label)label.style.pointerEvents='none';
  card.className='card certificate-card';
  card.innerHTML=`<article class="certificate"><div class="certificate-frame"><div class="certificate-stars">✦　✧　✦</div><p class="certificate-school">Casa de Luna · Academia de Magia &amp; Ciência</p><h2>Certificado</h2><p class="certificate-subtitle">de Mestre Alquimista</p><div class="certificate-rule"><i></i><i></i><i></i></div><p class="certificate-copy">Certificamos que o(a) Alquimista</p><h3>${escapeHTML(playerName)}</h3><p class="certificate-copy">com a ajuda da bruxinha Luna, concluiu com êxito todas as 7 missões alquímicas do reino!</p><img class="certificate-potion" src="${art('pocaodragao')}" alt="Poção do Dragão de Cristal"><div class="certificate-footer"><span>✦ Mestre Alquimista ✦</span><span>Lua Cheia · Ano da Grande Poção</span></div><div class="certificate-seal">✦<br><small>ALQUIMIA</small></div></div><button id="replay-certificate">Rever a aventura</button></article>`;
  resultPanel.classList.add('show');$('#replay-certificate').onclick=()=>{chapter=1;progress.chapter=1;progress.intro=true;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));scene();};
}
async function result(ok,playSound=true){
  if(!ok)return;
  const q=phase();if(playSound)audio.sfx(ok?(chapter===7?'win':'success'):'fail');$('#pot').classList.toggle('success',ok);$('#pot').classList.toggle('fail',!ok);
  if(chapter===1){
    setInteractionState('victory-dialogue');const speech=$('#speech');speech.classList.remove('hidden','speech-narrator','speech-guest');speech.classList.add('speech-luna','outcome-dialogue');
    speech.innerHTML=`<span class="speaker">Luna</span><p>O hélio deixou o vestido leve, e o neônio trouxe seu brilho! Estou pronta para o baile.</p><button class="story-choice" id="dress-continue">Seguir para a próxima visita</button>`;
    speech.onclick=e=>e.stopPropagation();
    $('#dress-continue').addEventListener('click',()=>{setInteractionState('transition');chapter=2;progress.chapter=chapter;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));speech.classList.add('hidden');transitionToScene();});
    return;
  }
  if(ok){
    const completedChapter=chapter;
    if(completedChapter===6)await equipFrankenstein();
    if(completedChapter===7)await dragonTransformation();
    if(completedChapter<7){chapter=completedChapter+1;progress.chapter=chapter;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));}
    else{progress.chapter=7;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));}
    const message=completedChapter===3?'Uau! Que calorzinho gostoso e seguro! Muito obrigado, Luna!':completedChapter===5?'A poção ficou pronta! O Conde Vlad segurou o frasco, viu o brilho voltar ao sorriso e ficou muito feliz.':completedChapter===6?'Frankenstein vestiu a armadura de cristal. Ela se ajustou ao corpo e o deixou protegido e confiante.':completedChapter===7?`A poção devolveu as cores e a chama ao Dragão de Cristal. Parabéns, ${playerName}! Com a ajuda de Luna, você concluiu sua grande aventura e se tornou Mestre Alquimista.`:q.success;
    showNarratorOutcome(message,completedChapter===7?'Ver meu certificado':'Continuar a história',()=>{
      $('#speech').classList.add('hidden');$('#speech').classList.remove('outcome-dialogue');
      if(completedChapter===7)showCertificate();else transitionToScene();
    },completedChapter===3?'Homem de Gelo':'Narradora');
    return;
  }
}
opening();
