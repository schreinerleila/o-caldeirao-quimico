import { elements, bySymbol, familyNames } from './data/elements.js?v=118-elements';
import { phases } from './data/phases.js';
import { AudioEngine } from './effects/audio.js';

const app = document.querySelector('#app');
const audio = new AudioEngine();
const progress = JSON.parse(localStorage.getItem('cq-vintage-progress') || '{"chapter":1,"intro":false}');
let chapter = Math.max(1, Math.min(7, progress.chapter || 1));
let pick = [];
let beat = 0;
let revealNextScene = false;
let introCutsceneController = null;
let opaqueLetterDataUrl = null;
const $ = (selector) => document.querySelector(selector);
const phase = () => phases[chapter - 1];
const cutoutNames = new Set('luna cat entregador wolf homemdasneves mumia vampire frankienstein reddragon bluedragon house letter candle candle2 candles3 boladecristal broom pumpkin rose bookshelf shelf decoracao amuletolobisohomem armadurafrankienstein drees pocao1 pocao2 pocao3 pocaodragao pocaohomemdasneves pocaomumia pocaovampiro caldeiraodecoracao clock moon'.split(' '));
const art = (name) => `static/images/${cutoutNames.has(name) ? 'cutouts/' : ''}${name}.png`;
const familyColors = { nobres:'#bb8ad8', transicao:'#91a9c8', alcalinos:'#e88356', calcogenios:'#c8c469', halogenios:'#8cbf9c', carbono:'#a38abb', ametais:'#9bb3a5', 'alcalino-terrosos':'#cfaa78', 'familia-do-boro':'#dda98b', nitrogenio:'#8dabc1', lantanoides:'#d69cc1', actinoides:'#c78490' };
const characters = { wolf:'wolf', snow:'homemdasneves', mummy:'mumia', vampire:'vampire', frank:'frankienstein', dragon:'bluedragon' };
const prizes = { 1:'drees', 2:'amuletolobisohomem', 3:'pocaohomemdasneves', 4:'pocaomumia', 5:'pocaovampiro', 6:'armadurafrankienstein', 7:'pocaodragao' };
const firstLines = [
  ['Mensageiro','Luna, trouxe uma carta do baile real para você.'],
  ['Luna','Obrigada por trazê-la. Entre, vamos ver o que diz.'],
  ['Luna','Antes da poção, vou mostrar como ler o Grimório. Cada quadradinho representa um elemento: um tipo de átomo que forma as substâncias ao nosso redor.'],
  ['Luna','No alto do quadradinho fica o número atômico, que conta os prótons e identifica o elemento. No centro estão o símbolo e o nome completo.'],
  ['Luna','Na parte de baixo aparece a massa atômica, uma medida da massa dos átomos daquele elemento. Famílias ficam nas colunas e períodos nas linhas.'],
  ['Luna','Que convite encantador! Um vestido que flutua parece impossível... mas a química pode nos dar uma pista.'],
  ['Mensageiro','O baile começa ao anoitecer. Será que ainda dá tempo?'],
  ['Luna','Dá, sim. Vamos procurar no Grimório dois gases: um bem leve e outro famoso por brilhar nos letreiros.']
];
const introLines = [
  ['Luna','Bem-vinda ao meu laboratório! Cada quadradinho do Grimório representa um elemento químico.'],
  ['Luna','O número no alto é o número atômico: ele identifica o elemento e indica quantos prótons há no átomo.'],
  ['Luna','O símbolo é a abreviação do elemento. C é carbono; a letra grande ajuda a encontrá-lo rapidinho.'],
  ['Luna','O nome aparece por extenso, e o número decimal embaixo é a massa atômica: uma medida da massa dos átomos.'],
  ['Luna','As colunas são famílias. Elementos da mesma família compartilham propriedades. As cores do livro ajudam a perceber os grupos!'],
  ['Luna','Vamos praticar? Toque em um quadradinho para ver o nome, a família e os números. Depois, seguimos para o baile!']
];
function opening(){
  audio.stopMusic();
  app.innerHTML=`<main class="opening"><section class="cover" id="cover"><div class="cover-bg" aria-hidden="true"></div><div class="cover-glints" aria-hidden="true"></div><div class="cover-controls"><button class="start-button" id="start">✦ Iniciar aventura</button><button id="cover-sound">♫ Som ligado</button><button id="cover-map">▦ Como ler a tabela?</button></div><section class="cover-lesson" id="cover-lesson"></section></section></main>`;
  $('#start').onclick=()=>{ beat=0; audio.startMusic(); audio.sfx('open'); const cover=$('#cover');cover.classList.add('zooming');$('#start').disabled=true;setTimeout(()=>progress.intro ? (chapter===1?openingCutscene():scene()) : tutorial(),1050); };
  $('#cover-sound').onclick=()=>{audio.enabled=!audio.enabled;audio.save();if(audio.enabled)audio.startMusic();else audio.stopMusic();$('#cover-sound').textContent=audio.enabled?'♫ Som ligado':'♫ Som desligado';};
  $('#cover-map').onclick=showCoverLesson;
}
function showCoverLesson(){const panel=$('#cover-lesson');panel.innerHTML=`<div class="cover-lesson-card"><button class="close" id="cover-close" aria-label="Fechar">×</button><p class="eyebrow">Guia rápido</p><h2>Como ler a tabela</h2><div class="sample-element"><span>6</span><b>C</b><small>Carbono</small><em>12,011</em></div><div class="element-key"><span><b>6</b> Número atômico</span><span><b>C</b> Símbolo</span><span><b>Carbono</b> Nome</span><span><b>12,011</b> Massa atômica</span></div><p><b>Famílias</b> são as colunas (grupos): elementos na mesma coluna costumam ter propriedades semelhantes.</p><p><b>Períodos</b> são as linhas horizontais: indicam quantas camadas eletrônicas os átomos ocupam.</p></div>`;panel.classList.add('visible');$('#cover-close').onclick=()=>panel.classList.remove('visible');}
function tutorial(){
  beat=0;
  app.innerHTML=`<main class="story"><header class="top"><span>Prólogo · Aprendendo a ler o Grimório</span><button id="skip-intro">Pular introdução</button></header><section class="scene tutorial-scene"><div class="room-art"></div><img class="room-prop shelf-prop" src="${art('bookshelf')}" alt=""><img class="room-prop decor-prop" src="${art('boladecristal')}" alt=""><img class="room-prop broom-prop" src="${art('broom')}" alt=""><img class="hero luna" src="${art('luna')}" alt="Luna"><img class="hero guest" src="${art('cat')}" alt="Gato mágico"><div class="focus-card"><span class="atomic">6</span><strong>C</strong><small>Carbono</small><em>12,011</em></div><div class="speech" id="speech"><span class="speaker" id="who"></span><p id="say"></p><small class="next">toque para continuar</small></div></section></main>`;
  $('#speech').onclick=nextTutorial;
  $('#skip-intro').onclick=()=>{progress.intro=true;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));chapter=1;openingCutscene();};
  tutorialTalk();
}
function tutorialTalk(){const l=introLines[beat];$('#who').textContent=l[0];$('#say').textContent=l[1];$('.focus-card').classList.toggle('zoomed',beat>0);}
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
  cutscene.innerHTML=`<div class="prologue-camera"><div class="prologue-sky"></div><div class="prologue-forest"><i class="forest-tree tree-a"></i><i class="forest-tree tree-b"></i><i class="forest-tree tree-c"></i><i class="forest-tree tree-d"></i><i class="forest-tree tree-e"></i><i class="forest-tree tree-f"></i></div><div class="prologue-path"></div><img class="prologue-house" src="${art('house')}" alt="Casa de abóbora da Luna"><div class="prologue-doorway" aria-hidden="true"><i></i></div><span class="prologue-knock">TOC, TOC!</span><img class="prologue-courier" src="${art('entregador')}" alt="Mensageiro"><div class="prologue-doorlight"></div></div><div class="prologue-vignette"></div><p class="prologue-narration">Em um reino distante, havia uma jovem alquimista chamada Luna, que combinava magia e ciência para ajudar todos os habitantes do reino.</p><div class="prologue-dialogue" aria-live="polite"></div><button class="prologue-skip" type="button">Pular cena</button>`;
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
  app.innerHTML=`<main class="story"><header class="top"><span>Capítulo ${q.id} de 7 · ${q.focus}</span><span class="chapter-progress">${'✦'.repeat(q.id)}${'·'.repeat(7-q.id)}</span><button id="sound" aria-label="Alternar som">♫ Som</button></header><section class="scene chapter-scene" id="scene" style="--chapter-color:${q.color}"><div class="room-art"></div><div class="ground-plane" aria-hidden="true"><i class="ground-shadow shadow-luna"></i><i class="ground-shadow shadow-guest"></i><i class="ground-shadow shadow-pot"></i><span class="floor-rug"></span><span class="floor-mushrooms" aria-hidden="true"></span><span class="floor-stones stones-left">◆ · ◆</span><span class="floor-stones stones-right">· ◆ ·</span><span class="floor-grass grass-left"></span><span class="floor-grass grass-right"></span></div>${showReveal?'<div class="scene-reveal" aria-hidden="true"></div>':''}<img class="room-prop shelf-prop" src="${art('bookshelf')}" alt=""><img class="room-prop candles-prop" src="${art('candles3')}" alt=""><img class="room-prop clock-prop" src="${art('clock')}" alt=""><img class="room-prop rose-prop" src="${art('rose')}" alt=""><img class="room-prop decor-prop" src="${art('boladecristal')}" alt=""><img class="room-prop broom-prop" src="${art('broom')}" alt=""><img class="room-prop pumpkin-prop" src="${art('pumpkin')}" alt=""><img class="room-prop cauldron-decor" src="${art('caldeiraodecoracao')}" alt=""><img class="hero luna" id="luna" src="${art('luna')}" alt="Luna, a bruxinha"><img class="hero guest ${chapter===1?'courier':''} ${chapter===4?'giant':''} ${chapter===3||chapter===6?'monster-large':''} ${chapter===7?'dragon-guest':''}" id="guest" src="${art(chapter===1?'entregador':characters[q.guestType]||'cat')}" alt="${chapter===1?'Mensageiro':q.guest}"><img class="dress-outcome" id="dress-outcome" src="${art('drees')}" alt="Vestido criado para Luna"><div class="story-letter" id="letter"><img src="${art('letter')}" alt=""></div><div class="pot-wrap" id="pot-wrap"><img class="pot" id="pot" src="${art('caldeirao')}" alt="Caldeirão mágico"><i class="bubble bubble-a"></i><i class="bubble bubble-b"></i></div><div class="ingredient-tray" id="ingredient-tray"></div><button class="mix outside-mix" id="mix" disabled>Misturar</button><img class="book-button" id="book" src="${art('grimorio')}" alt="Abrir o Grimório"><button class="book-label" id="book-label">Abrir Grimório</button><div class="speech" id="speech"><span class="speaker" id="who"></span><p id="say"></p><small class="next">toque para continuar</small></div><section class="booklayer" id="layer"></section><section class="result" id="result"><article class="card" id="card"></article></section><div class="mix-cinematic" id="mix-cinematic" aria-live="polite"></div><div class="ingredient-fly" id="fly"></div><span class="reaction-word" id="reaction-word"></span></section></main>`;
  const restartButton=document.createElement('button');restartButton.type='button';restartButton.id='go-first-phase';restartButton.className='restart-phase';restartButton.textContent='↶ Voltar à Fase 1';restartButton.title='Recomeçar diretamente pela primeira fase';restartButton.onclick=()=>{chapter=1;progress.chapter=1;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));scene();};$('.top').insertBefore(restartButton,$('#sound'));
  if(showReveal)setTimeout(()=>$('.scene-reveal')?.remove(),850);
  $('#speech').onclick=next;
  $('#layer').addEventListener('click',event=>{if(event.target.closest('#close'))closeBook();});
  $('#book').onclick=toggleBook;$('#book-label').onclick=toggleBook;
  $('#mix').onclick=stir;
  $('#sound').onclick=()=>{audio.enabled=!audio.enabled;audio.save();if(audio.enabled)audio.startMusic();else audio.stopMusic();$('#sound').classList.toggle('muted',!audio.enabled);};
  prepareLetterSprite();
  talk();
}
function talk(){const l=storyLines()[beat],guest=$('#guest'),speech=$('#speech');$('#who').textContent=l[0]==='Narradora'?'':l[0];$('#say').textContent=l[1];const guestSpeaking=l[0]==='Mensageiro'||l[0]===phase().guest,shouldEnter=chapter===1?beat>=0:beat>0;if(shouldEnter&&!guest.classList.contains('entered')){guest.classList.add('entered','arriving');setTimeout(()=>guest.classList.remove('arriving'),chapter===4?1650:1400);}else if(!shouldEnter)guest.classList.remove('entered','arriving');guest.classList.toggle('talking',guestSpeaking);$('#letter').classList.toggle('visible',chapter===1&&beat===1);$('#letter').classList.toggle('in-hand',chapter===1&&beat===1);$('#luna').classList.toggle('holding-letter',chapter===1&&beat===1);$('#luna').classList.toggle('talking',l[0]==='Luna');speech.classList.toggle('speech-guest',guestSpeaking);speech.classList.toggle('speech-luna',l[0]==='Luna');speech.classList.toggle('speech-narrator',!guestSpeaking&&l[0]!=='Luna');if(guestSpeaking||l[0]==='Luna'){const speaker=guestSpeaking?guest:$('#luna');requestAnimationFrame(()=>{const box=speaker.getBoundingClientRect(),width=window.innerWidth<=800?Math.min(340,window.innerWidth*.82):Math.min(390,window.innerWidth*.43);speech.style.width=`${width}px`;const left=guestSpeaking?Math.max(12,box.right-width):Math.max(12,box.left-16),highestCharacterTop=Math.min(...[...document.querySelectorAll('#scene .hero')].map(character=>character.getBoundingClientRect().top)),top=Math.max(58,Math.min(box.top,highestCharacterTop)-speech.offsetHeight-20);speech.style.left=`${Math.min(left,window.innerWidth-width-12)}px`;speech.style.top=`${top}px`;speech.style.bottom='auto';speech.style.transform='none';});}else{speech.style.left='50%';speech.style.top='78px';speech.style.bottom='auto';speech.style.width='min(650px,88%)';speech.style.transform='translateX(-50%)';}}
function next(){if(beat<storyLines().length-1){beat++;talk();audio.sfx('click');return;}$('#speech').classList.add('hidden');$('#scene').classList.add('focus','controls-ready');$('#guest').classList.add('entered');$('#pot-wrap').classList.add('zoom');$('#book').classList.add('book-ready');$('#book-label').classList.add('visible');audio.sfx('open');}
function transitionToScene(){const sceneRoot=$('#scene');if(!sceneRoot)return;$('#result').classList.remove('show');const q=phase(),guestArt=art(characters[q.guestType]||'cat'),curtain=document.createElement('div');curtain.className=`chapter-transition transition-chapter-${chapter}`;const bat=`<svg class="arrival-bat" viewBox="0 0 120 70" aria-hidden="true"><path d="M60 28C49 9 36 8 26 2c5 12 3 20-9 12 2 17-5 25-16 23 14 18 28 20 43 13l16-11 16 11c15 7 29 5 43-13-11 2-18-6-16-23-12 8-14 0-9-12-10 6-23 7-34 26Z" fill="#17111f" stroke="#dab9ef" stroke-width="3" stroke-linejoin="round"/><circle cx="51" cy="34" r="2.4" fill="#ffe79a"/><circle cx="69" cy="34" r="2.4" fill="#ffe79a"/></svg>`;curtain.innerHTML=`<div class="arrival-stage"><div class="arrival-sky"></div><div class="arrival-trees"><i></i><i></i><i></i><i></i><i></i></div><div class="arrival-path"></div><img class="arrival-house" src="${art('house')}" alt="Casa de abóbora da Luna"><span class="arrival-door"></span><span class="arrival-caption">${chapter===4?'A Múmia vem pedir ajuda...':chapter===5?'Um morcego cruza a noite...':'Uma visita chega à casa de Luna...'}</span><div class="arrival-guest ${chapter===4?'arrival-mummy':''} ${chapter===5?'arrival-vampire':''}">${chapter===5?bat:''}<img src="${guestArt}" alt="${q.guest}"></div><span class="arrival-knock">TOC, TOC!</span><div class="arrival-doorlight"></div></div><span class="transition-title">✦ ${q.title} ✦</span>`;sceneRoot.append(curtain);audio.sfx('open');setTimeout(()=>curtain.classList.add('arrival-knocks'),2550);setTimeout(()=>{curtain.classList.add('arrival-enters');audio.sfx('click');},3350);setTimeout(()=>{revealNextScene=true;scene();},4650);}
function drawElements(host,lesson=false){
  host.innerHTML=elements.map(e=>{const style=`grid-column:${e.column};grid-row:${e.row};--family-color:${familyColors[e.family]||'#b3a47e'}`;return `<button class="element" data-e="${e.symbol}" data-family="${e.family}" style="${style}" aria-label="${e.name}, ${e.symbol}, número atômico ${e.number}, massa ${e.mass}" title="${e.name} · ${e.mass}"><span class="n">${e.number}</span><b>${e.symbol}</b><small class="element-name">${e.name}</small><small class="element-mass">${e.mass} u</small></button>`;}).join('');
  if(lesson)host.querySelectorAll('[data-e]').forEach(button=>button.onclick=()=>{const e=bySymbol[button.dataset.e];const info=$('#lesson-info');info.innerHTML=`<b>${e.name} (${e.symbol})</b> · número atômico ${e.number} · massa ${e.mass} · ${familyNames[e.family]||e.family} · grupo ${e.group}, período ${e.period}.`;host.querySelectorAll('.element').forEach(b=>b.classList.toggle('lesson-selected',b===button));});
}
function closeBook(){const sceneRoot=$('#scene');sceneRoot.append($('#ingredient-tray'),$('#mix'));$('#layer').classList.remove('open');sceneRoot.classList.remove('book-open');}
function toggleBook(){if($('#layer').classList.contains('open')){closeBook();return;}openBook();}
function openBook(){
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
function stir(){const q=phase(),mix=$('#mix');if(!mix||mix.disabled||pick.length!==q.recipe.length)return;const ok=q.recipe.every(s=>pick.includes(s));mix.disabled=true;mix.classList.remove('ready');mix.textContent='Misturando…';closeBook();audio.sfx('stir');setTimeout(()=>showMixCinematic(ok),220);}
async function showMixCinematic(ok){
  const overlay=$('#mix-cinematic'),pot=$('#pot'),guest=$('#guest');if(!overlay)return;
  document.body.append(overlay);
  const selected=pick.map(symbol=>bySymbol[symbol]).filter(Boolean);
  overlay.className=`mix-cinematic show ${ok?'success':'failure'}`;
  if(!ok){
    overlay.remove();await showFailureAnimation();return;
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
  if(chapter>=2&&chapter<=5){const box=guest.getBoundingClientRect(),handY=chapter===2?.68:chapter===3?.62:chapter===4?.58:.62;await delay(flightTime);await flyRewardImage(prizes[chapter],{x:box.left+box.width*.5,y:box.top+box.height*handY},{hold:true});finishReward();return;}
  setTimeout(finishReward,flightTime);
  function finishReward(){guest.classList.add('celebrate');$('#luna')?.classList.add('celebrate');audio.sfx('pop');setTimeout(()=>{$('#guest')?.classList.remove('celebrate');$('#luna')?.classList.remove('celebrate');overlay.remove();result(true,false);},850);}
}
async function showFailureAnimation(){
  const sceneRoot=$('#scene'),guest=$('#guest'),pot=$('#pot'),failedChapter=chapter;
  if(failedChapter===1)$('#dress-outcome').classList.add('stone-ragged','costume-reveal');
  const effect=document.createElement('div');effect.className=`failure-effect failure-chapter-${failedChapter}`;effect.setAttribute('aria-hidden','true');
  effect.innerHTML='<div class="failure-smoke">'+Array.from({length:10},()=>'<i></i>').join('')+'</div><div class="failure-burst"><i></i><i></i><i></i><i></i></div>';
  sceneRoot.append(effect);sceneRoot.classList.add('failure-active',`failure-scene-${failedChapter}`);pot.classList.add('fail','react');
  if(failedChapter!==1)guest.classList.add('cartoon-hit');else $('#luna').classList.add('cartoon-hit');
  audio.sfx('fail');
  await delay(failedChapter===4?3850:3350);
  effect.remove();sceneRoot.classList.remove('failure-active',`failure-scene-${failedChapter}`);pot.classList.remove('fail','react');guest.classList.remove('cartoon-hit');$('#luna').classList.remove('cartoon-hit');
  pick=[];renderTray();$('#book').classList.add('book-ready');$('#book-label').classList.add('visible');
}
function showNarratorOutcome(message,buttonText,onContinue){
  const speech=$('#speech');speech.classList.remove('hidden','speech-luna','speech-guest');speech.classList.add('speech-narrator','outcome-dialogue');
  speech.style.left='50%';speech.style.top='78px';speech.style.bottom='auto';speech.style.width='min(820px,90%)';speech.style.transform='translateX(-50%)';
  speech.innerHTML=`<p>${message}</p><button class="story-choice" id="narrator-continue">${buttonText}</button>`;
  speech.onclick=event=>event.stopPropagation();$('#narrator-continue').onclick=onContinue;
}
function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function prepareLetterSprite(){
  const image=$('#letter img');if(!image)return;
  if(opaqueLetterDataUrl){image.src=opaqueLetterDataUrl;return;}
  const source=new Image();source.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height);for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i])pixels.data[i]=255;context.putImageData(pixels,0,0);opaqueLetterDataUrl=canvas.toDataURL('image/png');image.src=opaqueLetterDataUrl;}catch{image.style.opacity='1';}};source.src=art('letter');
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
async function dressLuna(){
  const luna=$('#luna'),base=new Image(),dress=new Image();base.src=art('luna');dress.src=art('drees');
  await Promise.all([base.decode().catch(()=>{}),dress.decode().catch(()=>{})]);
  const canvas=document.createElement('canvas');canvas.width=base.naturalWidth||368;canvas.height=base.naturalHeight||512;const context=canvas.getContext('2d');
  context.drawImage(base,0,0,canvas.width,canvas.height);
  const garmentWidth=canvas.width*.59,garmentHeight=garmentWidth*(dress.naturalHeight/dress.naturalWidth),garmentTop=canvas.height*.436;
  context.imageSmoothingEnabled=false;context.drawImage(dress,(canvas.width-garmentWidth)/2,garmentTop,garmentWidth,Math.min(garmentHeight,canvas.height*.46));
  const redrawForeground=points=>{context.save();context.beginPath();context.moveTo(points[0][0],points[0][1]);for(const [x,y] of points.slice(1))context.lineTo(x,y);context.closePath();context.clip();context.drawImage(base,0,0,canvas.width,canvas.height);context.restore();};
  // Put Luna's head, hands, sleeves and boots back in front of the garment.
  redrawForeground([[0,0],[canvas.width,0],[canvas.width,canvas.height*.46],[canvas.width*.9,canvas.height*.49],[canvas.width*.83,canvas.height*.45],[canvas.width*.75,canvas.height*.47],[canvas.width*.67,canvas.height*.50],[canvas.width*.58,canvas.height*.46],[canvas.width*.43,canvas.height*.45],[canvas.width*.36,canvas.height*.49],[canvas.width*.29,canvas.height*.48],[canvas.width*.22,canvas.height*.46],[canvas.width*.15,canvas.height*.49],[0,canvas.height*.48]]);
  redrawForeground([[canvas.width*.32,canvas.height*.47],[canvas.width*.45,canvas.height*.47],[canvas.width*.44,canvas.height*.65],[canvas.width*.36,canvas.height*.64],[canvas.width*.33,canvas.height*.56]]);
  redrawForeground([[canvas.width*.68,canvas.height*.51],[canvas.width*.84,canvas.height*.55],[canvas.width*.98,canvas.height*.68],[canvas.width*.95,canvas.height*.74],[canvas.width*.84,canvas.height*.75],[canvas.width*.72,canvas.height*.68]]);
  redrawForeground([[canvas.width*.26,canvas.height*.88],[canvas.width*.48,canvas.height*.89],[canvas.width*.47,canvas.height],[canvas.width*.27,canvas.height]]);
  redrawForeground([[canvas.width*.59,canvas.height*.88],[canvas.width*.79,canvas.height*.88],[canvas.width*.79,canvas.height],[canvas.width*.57,canvas.height]]);
  luna.classList.add('dress-arrival');luna.src=canvas.toDataURL('image/png');luna.alt='Luna vestindo o vestido leve e brilhante do baile';await delay(900);luna.classList.remove('dress-arrival');luna.classList.add('dressed');
}
async function equipFrankenstein(){
  const guest=$('#guest'),scene=$('#scene'),pot=$('#pot'),g=guest.getBoundingClientRect(),s=scene.getBoundingClientRect(),p=pot.getBoundingClientRect();
  const source=new Image();await new Promise(resolve=>{source.onload=resolve;source.onerror=resolve;source.src=art('armadurafrankienstein');if(source.complete&&source.naturalWidth)resolve();});
  const armor=new Image();armor.className='frank-armor';armor.alt='Armadura de cristal em Frankenstein';
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
  const width=g.width*.72,height=g.height*.72,left=g.left-s.left+(g.width-width)/2,top=g.top-s.top+g.height*.13;
  armor.style.left=`${left}px`;armor.style.top=`${top}px`;armor.style.width=`${width}px`;armor.style.height=`${height}px`;scene.append(armor);
  const fromX=p.left+p.width/2-(s.left+left+width/2),fromY=p.top+p.height/2-(s.top+top+height/2);
  await armor.animate([{transform:`translate(${fromX}px,${fromY}px) scale(.2) rotate(-18deg)`,opacity:0},{transform:'translate(0,0) scale(1.08) rotate(5deg)',opacity:1,offset:.78},{transform:'translate(0,0) scale(1) rotate(0)',opacity:1}],{duration:1550,easing:'cubic-bezier(.2,.8,.25,1)',fill:'forwards'}).finished.catch(()=>{});
  guest.classList.add('celebrate');audio.sfx('win');await delay(600);guest.classList.remove('celebrate');
}
async function dragonTransformation(){
  const guest=$('#guest'),box=guest.getBoundingClientRect();
  await flyRewardImage('pocaodragao',{x:box.left+box.width*.49,y:box.top+box.height*.3});
  const colorShift=guest.animate([{filter:'brightness(1) saturate(1)',transform:'scale(1)'},{filter:'brightness(2.2) sepia(.9) saturate(2.4) drop-shadow(0 0 35px #fff1a8)',transform:'scale(1.09)'},{filter:'brightness(1.4) saturate(1.3) drop-shadow(0 0 24px #ff724c)',transform:'scale(1.02)'},{filter:'brightness(1) saturate(1.1)',transform:'scale(1)'}],{duration:1550,easing:'ease-in-out',fill:'forwards'});
  await delay(620);guest.src=art('reddragon');guest.alt='Dragão de Cristal vermelho, recuperado pela poção';guest.classList.add('dragon-red');
  await colorShift.finished.catch(()=>{});audio.sfx('win');guest.classList.add('celebrate');await delay(600);guest.classList.remove('celebrate');
}
function showCertificate(){
  const resultPanel=$('#result'),card=$('#card');card.className='card certificate-card';
  card.innerHTML=`<article class="certificate"><div class="certificate-frame"><div class="certificate-stars">✦　✧　✦</div><p class="certificate-school">Casa de Luna · Academia de Magia &amp; Ciência</p><h2>Certificado</h2><p class="certificate-subtitle">de Mestre Alquimista</p><div class="certificate-rule"><i></i><i></i><i></i></div><p class="certificate-copy">Certificamos que</p><h3>Luna</h3><p class="certificate-copy">concluiu as sete missões do Grimório, explorou as famílias da tabela periódica e dominou a arte de criar poções com ciência e magia.</p><img class="certificate-potion" src="${art('pocaodragao')}" alt="Poção do Dragão de Cristal"><div class="certificate-footer"><span>✦ Guardiã dos Elementos ✦</span><span>Lua Cheia · Ano da Grande Poção</span></div><div class="certificate-seal">✦<br><small>ALQUIMIA</small></div></div><button id="replay-certificate">Rever a aventura</button></article>`;
  resultPanel.classList.add('show');$('#replay-certificate').onclick=()=>{chapter=1;progress.chapter=1;progress.intro=true;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));scene();};
}
async function result(ok,playSound=true){
  if(!ok)return;
  const q=phase();if(playSound)audio.sfx(ok?(chapter===7?'win':'success'):'fail');$('#pot').classList.toggle('success',ok);$('#pot').classList.toggle('fail',!ok);
  if(chapter===1){
    const speech=$('#speech');speech.classList.remove('hidden','speech-narrator','speech-guest');speech.classList.add('speech-luna','outcome-dialogue');
    speech.innerHTML=`<span class="speaker">Luna</span><p>O hélio deixou o vestido leve, e o neônio trouxe seu brilho! Estou pronta para o baile.</p><button class="story-choice" id="dress-continue">Seguir para a próxima visita</button>`;
    speech.onclick=e=>e.stopPropagation();
    $('#dress-continue').onclick=()=>{chapter=2;progress.chapter=chapter;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));speech.classList.add('hidden');transitionToScene();};
    return;
  }
  if(ok){
    const completedChapter=chapter;
    if(completedChapter===6)await equipFrankenstein();
    if(completedChapter===7)await dragonTransformation();
    if(completedChapter<7){chapter=completedChapter+1;progress.chapter=chapter;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));}
    else{progress.chapter=7;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));}
    const message=completedChapter===5?'A poção ficou pronta! O Conde Vlad segurou o frasco, viu o brilho voltar ao sorriso e ficou muito feliz.':completedChapter===6?'Frankenstein vestiu a armadura de cristal. Ela se ajustou ao corpo e o deixou protegido e confiante.':completedChapter===7?'A poção devolveu as cores e a chama ao Dragão de Cristal. Luna concluiu sua grande aventura e recebeu o título de Mestre Alquimista.':q.success;
    showNarratorOutcome(message,completedChapter===7?'Ver meu certificado':'Continuar a história',()=>{
      $('#speech').classList.add('hidden');$('#speech').classList.remove('outcome-dialogue');
      if(completedChapter===7)showCertificate();else transitionToScene();
    });
    return;
  }
}
opening();
