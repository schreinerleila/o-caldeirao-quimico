import { elements, bySymbol, familyNames } from './data/elements.js';
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
const $ = (selector) => document.querySelector(selector);
const phase = () => phases[chapter - 1];
const cutoutNames = new Set('luna cat entregador wolf homemdasneves mumia vampire frankienstein reddragon bluedragon house letter candle candle2 candles3 boladecristal broom pumpkin rose bookshelf shelf decoracao amuletolobisohomem armadurafrankienstein drees pocao1 pocao2 pocao3 pocaodragao pocaohomemdasneves pocaomumia pocaovampiro caldeiraodecoracao clock moon'.split(' '));
const art = (name) => `static/images/${cutoutNames.has(name) ? 'cutouts/' : ''}${name}.png`;
const familyColors = { nobres:'#bb8ad8', transicao:'#91a9c8', alcalinos:'#e88356', calcogenios:'#c8c469', halogenios:'#8cbf9c', carbono:'#a38abb', ametais:'#9bb3a5', 'alcalino-terrosos':'#cfaa78' };
const xy = { H:[1,1],He:[18,1],Li:[1,2],C:[14,2],N:[15,2],O:[16,2],F:[17,2],Ne:[18,2],Na:[1,3],Si:[14,3],P:[15,3],S:[16,3],Cl:[17,3],Ar:[18,3],K:[1,4],Ca:[2,4],Fe:[8,4],Cu:[11,4],Se:[16,4],Br:[17,4],Ag:[11,5],I:[17,5],Au:[11,6],Pb:[14,6] };
const characters = { wolf:'wolf', snow:'homemdasneves', mummy:'mumia', vampire:'vampire', frank:'frankienstein', dragon:'reddragon' };
const prizes = { 1:'drees', 2:'amuletolobisohomem', 3:'pocaohomemdasneves', 4:'pocaomumia', 5:'pocaovampiro', 6:'armadurafrankienstein', 7:'pocaodragao' };
const firstLines = [
  ['Mensageiro','Uma entrega especial para a bruxa Luna!'],
  ['Mensageiro','“Querida Luna, você está convidada ao baile real nas nuvens. Precisamos de um vestido leve, que brilhe como as estrelas!”'],
  ['Luna','Que convite encantador! Um vestido que flutua parece impossível... mas a química pode nos dar uma pista.'],
  ['Mensageiro','“O baile começa ao anoitecer. Será que ainda dá tempo?”'],
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
function showCoverLesson(){const panel=$('#cover-lesson');panel.innerHTML=`<div class="cover-lesson-card"><button class="close" id="cover-close" aria-label="Fechar">×</button><p class="eyebrow">Guia rápido</p><h2>Como ler a tabela</h2><div class="sample-element"><span>6</span><b>C</b><small>Carbono</small><em>12,011</em></div><p><b>Número de cima:</b> número atômico, que identifica o elemento.</p><p><b>Letras grandes:</b> símbolo. <b>Nome:</b> elemento por extenso. <b>Número de baixo:</b> massa atômica.</p><p>As colunas são famílias: elementos da mesma coluna têm propriedades parecidas.</p></div>`;panel.classList.add('visible');$('#cover-close').onclick=()=>panel.classList.remove('visible');}
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
  const overlay=document.createElement('section');overlay.className='lesson-overlay open';overlay.innerHTML=`<article class="lesson-book"><button class="close" id="lesson-close" aria-label="Fechar">×</button><div class="lesson-copy"><p class="eyebrow">Uma página do Grimório</p><h2>Como ler um elemento</h2><p>O <b>número atômico</b> fica no alto. O <b>símbolo</b> e o <b>nome</b> identificam o elemento. A <b>massa atômica</b> aparece embaixo.</p><p>As colunas reúnem famílias com propriedades parecidas. Toque em qualquer elemento para investigar.</p><div class="info" id="lesson-info">Escolha um elemento no mapa.</div><button class="mix" id="lesson-done">Entendi, vamos à história</button></div><div class="lesson-map" id="lesson-map"></div></article>`;
  $('.tutorial-scene').append(overlay);
  drawElements($('#lesson-map'),true);
  $('#lesson-close').onclick=()=>overlay.remove();
  $('#lesson-done').onclick=()=>{progress.intro=true;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));chapter=1;openingCutscene();};
}
function openingCutscene(){
  introCutsceneController?.abort();document.querySelectorAll('.prologue-cutscene').forEach(node=>node.remove());app.inert=false;
  chapter=1;scene();
  const cutscene=document.createElement('section');cutscene.className='prologue-cutscene';cutscene.setAttribute('aria-label','Abertura da história');
  cutscene.innerHTML=`<div class="prologue-camera"><div class="prologue-sky"></div><div class="prologue-forest"><i class="forest-tree tree-a"></i><i class="forest-tree tree-b"></i><i class="forest-tree tree-c"></i><i class="forest-tree tree-d"></i><i class="forest-tree tree-e"></i><i class="forest-tree tree-f"></i></div><div class="prologue-path"></div><img class="prologue-house" src="${art('house')}" alt="Casa de abóbora da Luna"><div class="prologue-doorway" aria-hidden="true"><i></i></div><span class="prologue-knock">TOC, TOC!</span><img class="prologue-luna" src="${art('luna')}" alt="Luna"><img class="prologue-courier" src="${art('entregador')}" alt="Mensageiro"><div class="prologue-doorlight"></div><div class="prologue-letter"><img src="${art('letter')}" alt="Carta do baile"></div></div><div class="prologue-vignette"></div><p class="prologue-narration">A bruxinha Luna ensinava magia e ciência para criar as suas poções.</p><div class="prologue-dialogue" aria-live="polite"></div><button class="prologue-skip" type="button">Pular cena</button>`;
  document.body.append(cutscene);app.inert=true;audio.sfx('open');
  const narration=cutscene.querySelector('.prologue-narration'),dialogue=cutscene.querySelector('.prologue-dialogue');
  const controller=new AbortController();introCutsceneController=controller;
  const revealChapter=async()=>{beat=2;talk();cutscene.classList.add('entering-home');await cutsceneDelay(1250);cutscene.remove();app.inert=false;if(introCutsceneController===controller)introCutsceneController=null;};
  const steps=[
    {duration:1650,run:()=>narration.classList.add('visible')},
    {duration:3800,run:()=>cutscene.classList.add('camera-approach')},
    {duration:2050,run:()=>cutscene.classList.add('courier-arrives')},
    {duration:850,run:()=>{cutscene.classList.add('courier-knocks');audio.sfx('click');}},
    {duration:1650,run:()=>{dialogue.innerHTML='<b>Mensageiro</b><span>“Luna, você está convidada ao baile nas nuvens! Precisamos de um vestido leve, que brilhe como as estrelas.”</span>';dialogue.classList.add('visible');audio.sfx('pop');}},
    {duration:1200,run:()=>cutscene.classList.add('letter-delivered')},
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
  app.innerHTML=`<main class="story"><header class="top"><span>Capítulo ${q.id} de 7 · ${q.focus}</span><span class="chapter-progress">${'✦'.repeat(q.id)}${'·'.repeat(7-q.id)}</span><button id="sound" aria-label="Alternar som">♫ Som</button></header><section class="scene chapter-scene" id="scene" style="--chapter-color:${q.color}"><div class="room-art"></div><div class="ground-plane" aria-hidden="true"><i class="ground-shadow shadow-luna"></i><i class="ground-shadow shadow-guest"></i><i class="ground-shadow shadow-pot"></i><span class="floor-rug"></span><span class="floor-mushrooms" aria-hidden="true"></span><span class="floor-stones stones-left">◆ · ◆</span><span class="floor-stones stones-right">· ◆ ·</span><span class="floor-grass grass-left"></span><span class="floor-grass grass-right"></span></div>${showReveal?'<div class="scene-reveal" aria-hidden="true"></div>':''}<img class="room-prop shelf-prop" src="${art('bookshelf')}" alt=""><img class="room-prop candles-prop" src="${art('candles3')}" alt=""><img class="room-prop clock-prop" src="${art('clock')}" alt=""><img class="room-prop rose-prop" src="${art('rose')}" alt=""><img class="room-prop decor-prop" src="${art('boladecristal')}" alt=""><img class="room-prop broom-prop" src="${art('broom')}" alt=""><img class="room-prop pumpkin-prop" src="${art('pumpkin')}" alt=""><img class="room-prop cauldron-decor" src="${art('caldeiraodecoracao')}" alt=""><img class="hero luna" id="luna" src="${art('luna')}" alt="Luna, a bruxinha"><img class="hero guest ${chapter===1?'courier':''} ${chapter===4?'giant':''}" id="guest" src="${art(chapter===1?'entregador':characters[q.guestType]||'cat')}" alt="${chapter===1?'Mensageiro':q.guest}"><img class="dress-outcome" id="dress-outcome" src="${art('drees')}" alt="Vestido criado para Luna"><div class="story-letter" id="letter"><img src="${art('letter')}" alt=""><span>Uma carta misteriosa...</span></div><div class="pot-wrap" id="pot-wrap"><img class="pot" id="pot" src="${art('caldeirao')}" alt="Caldeirão mágico"><i class="bubble bubble-a"></i><i class="bubble bubble-b"></i></div><div class="ingredient-tray" id="ingredient-tray"></div><button class="mix outside-mix" id="mix" disabled>Misturar</button><img class="book-button" id="book" src="${art('grimorio')}" alt="Abrir o Grimório"><button class="book-label" id="book-label">Abrir Grimório</button><div class="speech" id="speech"><span class="speaker" id="who"></span><p id="say"></p><small class="next">toque para continuar</small></div><section class="booklayer" id="layer"></section><section class="result" id="result"><article class="card" id="card"></article></section><div class="mix-cinematic" id="mix-cinematic" aria-live="polite"></div><div class="ingredient-fly" id="fly"></div><span class="reaction-word" id="reaction-word"></span></section></main>`;
  if(showReveal)setTimeout(()=>$('.scene-reveal')?.remove(),850);
  $('#speech').onclick=next;
  $('#book').onclick=toggleBook;$('#book-label').onclick=toggleBook;
  $('#mix').onclick=stir;
  $('#sound').onclick=()=>{audio.enabled=!audio.enabled;audio.save();if(audio.enabled)audio.startMusic();else audio.stopMusic();$('#sound').classList.toggle('muted',!audio.enabled);};
  talk();
}
function talk(){const l=storyLines()[beat],guest=$('#guest'),speech=$('#speech');$('#who').textContent=l[0];$('#say').textContent=l[1];const guestSpeaking=l[0]==='Mensageiro'||l[0]===phase().guest,shouldEnter=chapter===1?beat>=0:beat>0;if(shouldEnter&&!guest.classList.contains('entered')){guest.classList.add('entered','arriving');setTimeout(()=>guest.classList.remove('arriving'),chapter===4?1650:1400);}else if(!shouldEnter)guest.classList.remove('entered','arriving');guest.classList.toggle('talking',guestSpeaking);$('#letter').classList.toggle('visible',chapter===1&&beat===1);$('#letter').classList.toggle('in-hand',chapter===1&&beat===2);$('#luna').classList.toggle('holding-letter',chapter===1&&beat===2);$('#luna').classList.toggle('talking',l[0]==='Luna');speech.classList.toggle('speech-guest',guestSpeaking);speech.classList.toggle('speech-luna',l[0]==='Luna');speech.classList.toggle('speech-narrator',!guestSpeaking&&l[0]!=='Luna');if(guestSpeaking||l[0]==='Luna'){const speaker=guestSpeaking?guest:$('#luna');requestAnimationFrame(()=>{const box=speaker.getBoundingClientRect(),width=window.innerWidth<=800?Math.min(340,window.innerWidth*.82):Math.min(390,window.innerWidth*.43);speech.style.width=`${width}px`;const left=guestSpeaking?Math.max(12,box.right-width):Math.max(12,box.left-16),highestCharacterTop=Math.min(...[...document.querySelectorAll('#scene .hero')].map(character=>character.getBoundingClientRect().top)),top=Math.max(58,Math.min(box.top,highestCharacterTop)-speech.offsetHeight-20);speech.style.left=`${Math.min(left,window.innerWidth-width-12)}px`;speech.style.top=`${top}px`;speech.style.bottom='auto';speech.style.transform='none';});}else{speech.style.left='50%';speech.style.top='78px';speech.style.bottom='auto';speech.style.width='min(650px,88%)';speech.style.transform='translateX(-50%)';}}
function next(){if(beat<storyLines().length-1){beat++;talk();audio.sfx('click');return;}$('#speech').classList.add('hidden');$('#scene').classList.add('focus');$('#guest').classList.add('entered');$('#pot-wrap').classList.add('zoom');$('#book').classList.add('book-ready');$('#book-label').classList.add('visible');audio.sfx('open');}
function transitionToScene(){const sceneRoot=$('#scene');if(!sceneRoot)return;$('#result').classList.remove('show');const q=phase(),guestArt=art(characters[q.guestType]||'cat'),curtain=document.createElement('div');curtain.className=`chapter-transition transition-chapter-${chapter}`;const bat=`<svg class="arrival-bat" viewBox="0 0 120 70" aria-hidden="true"><path d="M60 28C49 9 36 8 26 2c5 12 3 20-9 12 2 17-5 25-16 23 14 18 28 20 43 13l16-11 16 11c15 7 29 5 43-13-11 2-18-6-16-23-12 8-14 0-9-12-10 6-23 7-34 26Z" fill="#17111f" stroke="#dab9ef" stroke-width="3" stroke-linejoin="round"/><circle cx="51" cy="34" r="2.4" fill="#ffe79a"/><circle cx="69" cy="34" r="2.4" fill="#ffe79a"/></svg>`;curtain.innerHTML=`<div class="arrival-stage"><img class="arrival-house" src="${art('house')}" alt="Casa de abóbora da Luna"><span class="arrival-door"></span><span class="arrival-caption">${chapter===4?'A Múmia vem pedir ajuda...':chapter===5?'Um morcego cruza a noite...':'Uma visita chega à casa de Luna...'}</span><div class="arrival-guest ${chapter===4?'arrival-mummy':''} ${chapter===5?'arrival-vampire':''}">${chapter===5?bat:''}<img src="${guestArt}" alt="${q.guest}"></div></div><span class="transition-title">✦ ${q.title} ✦</span>`;sceneRoot.append(curtain);audio.sfx('open');setTimeout(()=>{revealNextScene=true;scene();},2850);}
function drawElements(host,lesson=false){
  host.innerHTML=elements.map(e=>{const pos=xy[e.symbol]||[e.number%18+1,Math.floor(e.number/18)+1];const style=`grid-column:${pos[0]};grid-row:${pos[1]};--family-color:${familyColors[e.family]||'#b3a47e'}`;return `<button class="element" data-e="${e.symbol}" style="${style}" aria-label="${e.name}, ${e.symbol}"><span class="n">${e.number}</span><b>${e.symbol}</b><small>${e.name}</small></button>`;}).join('');
  if(lesson)host.querySelectorAll('[data-e]').forEach(button=>button.onclick=()=>{const e=bySymbol[button.dataset.e];const info=$('#lesson-info');info.innerHTML=`<b>${e.name} (${e.symbol})</b> · número atômico ${e.number} · massa ${e.mass} · ${familyNames[e.family]||e.family}.`;host.querySelectorAll('.element').forEach(b=>b.classList.toggle('lesson-selected',b===button));});
}
function closeBook(){ $('#layer').classList.remove('open');$('#scene').classList.remove('book-open'); }
function toggleBook(){if($('#layer').classList.contains('open')){closeBook();return;}openBook();}
function openBook(){
  const q=phase();const layer=$('#layer');layer.innerHTML=`<div class="grimoire"><article class="page table-page"><button class="close" id="close" aria-label="Fechar">×</button><p class="eyebrow">Missão ${q.id} · ${q.focus}</p><h2>${q.product}</h2><p class="ink">“${q.hint}”</p><p class="map-hint">Toque nos elementos: cada frasco voa até o caldeirão no laboratório.</p><div class="periodic" id="grid"></div><div class="info" id="info">Escolha um elemento para ver nome, número atômico, massa e família.</div></article></div>`;
  layer.classList.add('open');$('#scene').classList.add('book-open');drawElements($('#grid'));pick.forEach(symbol=>$('#grid [data-e="'+symbol+'"]')?.classList.add('selected'));$('#close').onclick=closeBook;$('#grid').onclick=e=>{const button=e.target.closest('[data-e]');if(!button)return;const element=bySymbol[button.dataset.e];$('#info').innerHTML=`<b>${element.name} (${element.symbol})</b><br>Número atômico: ${element.number} · Massa: ${element.mass}<br>Família ${element.group}: ${familyNames[element.family]||element.family}`;choose(element,button);};renderTray();audio.sfx('open');
}
function renderTray(){const tray=$('#ingredient-tray'),mix=$('#mix');if(!tray||!mix)return;tray.innerHTML=pick.map(s=>`<button class="ingredient-tag" data-remove="${s}" title="Remover ${s}">${s} <small>×</small></button>`).join('');tray.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{pick=pick.filter(s=>s!==b.dataset.remove);renderTray();document.querySelector(`#grid [data-e="${b.dataset.remove}"]`)?.classList.remove('selected');});const needed=phase().recipe.length;mix.disabled=pick.length!==needed;mix.textContent=mix.disabled?`Escolha ${needed} (${pick.length}/${needed})`:'Misturar!';mix.classList.toggle('ready',!mix.disabled);}
function choose(element,source){
  if(pick.includes(element.symbol))pick=pick.filter(s=>s!==element.symbol);else if(pick.length<phase().recipe.length)pick.push(element.symbol);else pick=[...pick.slice(1),element.symbol];
  renderTray();document.querySelectorAll(`#grid [data-e="${element.symbol}"]`).forEach(b=>b.classList.toggle('selected',pick.includes(element.symbol)));const fly=$('#fly'),pot=$('#pot'),origin=source?.getBoundingClientRect(),target=pot.getBoundingClientRect();fly.innerHTML=`<img src="${art('pocao1')}" alt=""><b>${element.symbol}</b>`;fly.style.left=`${origin?origin.left+origin.width/2-30:window.innerWidth*.75}px`;fly.style.top=`${origin?origin.top+origin.height/2-35:window.innerHeight*.35}px`;fly.style.opacity='1';const fromX=origin?origin.left+origin.width/2:window.innerWidth*.75,fromY=origin?origin.top+origin.height/2:window.innerHeight*.35,toX=target.left+target.width/2,toY=target.top+target.height/2;const flight=fly.animate([{transform:'translate(0,0) scale(.45)',opacity:0},{transform:`translate(${(toX-fromX)*.16}px,${(toY-fromY)*.16}px) scale(1.1)`,opacity:1,offset:.18},{transform:`translate(${toX-fromX}px,${toY-fromY}px) scale(.55)`,opacity:.1}],{duration:900,easing:'cubic-bezier(.22,.75,.35,1)'});flight.onfinish=()=>{fly.style.opacity='0';};pot.classList.add('react');$('#reaction-word').textContent='PLOP!';$('#reaction-word').classList.remove('show');void $('#reaction-word').offsetWidth;$('#reaction-word').classList.add('show');audio.sfx('pop');setTimeout(()=>pot.classList.remove('react'),700);
}
function stir(){const q=phase(),mix=$('#mix');if(!mix||mix.disabled||pick.length!==q.recipe.length)return;const ok=q.recipe.every(s=>pick.includes(s));mix.disabled=true;mix.classList.remove('ready');mix.textContent='Misturando…';$('#layer').classList.remove('open');$('#scene').classList.remove('book-open');audio.sfx('stir');setTimeout(()=>showMixCinematic(ok),220);}
function showMixCinematic(ok){
  const overlay=$('#mix-cinematic'),pot=$('#pot'),guest=$('#guest');if(!overlay)return;
  document.body.append(overlay);
  const selected=pick.map(symbol=>bySymbol[symbol]).filter(Boolean);
  overlay.className=`mix-cinematic show ${ok?'success':'failure'}`;
  if(!ok){
    if(chapter===1){overlay.remove();$('#dress-outcome').classList.add('stone-ragged','costume-reveal');$('#luna').classList.add('cartoon-hit');audio.sfx('fail');setTimeout(()=>{$('#luna')?.classList.remove('cartoon-hit');result(false,false);},900);return;}
    overlay.innerHTML=`<div class="screen-explosion"><span class="blast-core">✹</span><b>BOOM!</b></div><div class="wrong-combination"><span>A mistura saiu diferente</span><strong>${selected.map(e=>e.symbol).join(' + ')||'Caldeirão vazio'}</strong><small>Essa combinação não formou a poção.</small></div>`;
    audio.sfx('fail');setTimeout(()=>{overlay.remove();guest.classList.add('cartoon-hit');setTimeout(()=>{guest.classList.remove('cartoon-hit');result(false,false);},680);},1900);return;
  }
  if(chapter===1){overlay.remove();$('#dress-outcome').classList.add('dress-reveal','costume-reveal');$('#luna').classList.add('celebrate');audio.sfx('win');setTimeout(()=>{$('#luna')?.classList.remove('celebrate');result(true,false);},1450);return;}
  const p=pot.getBoundingClientRect(),g=guest.getBoundingClientRect(),startX=p.left+p.width/2,startY=p.top+p.height*.35,targetX=g.left+g.width*.53,targetY=g.top+g.height*.42;
  overlay.innerHTML=`<div class="success-aura"></div><p class="success-message">A magia funcionou!</p><div class="flight-elements">${selected.map((e,i)=>`<span class="element-comet" data-flight="${i}"><b>${e.symbol}</b><small>${e.name}</small></span>`).join('')}<i class="celebration-sparkles">✦　✧　✦</i></div>`;
  audio.sfx(chapter===7?'win':'success');
  overlay.querySelectorAll('.element-comet').forEach((comet,i)=>{
    comet.style.left=`${startX}px`;comet.style.top=`${startY}px`;
    const spread=(i-(selected.length-1)/2)*35;
    comet.animate([{transform:'translate(-50%,-50%) scale(.4) rotate(-12deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1.12) rotate(8deg)',opacity:1,offset:.18},{transform:`translate(calc(-50% + ${targetX-startX+spread}px),calc(-50% + ${targetY-startY}px)) scale(.22) rotate(22deg)`,opacity:0}],{duration:1050,delay:i*150,easing:'cubic-bezier(.2,.8,.25,1)',fill:'forwards'});
  });
  const flightTime=selected.length?1050+(selected.length-1)*150:400;
  setTimeout(()=>{guest.classList.add('celebrate');$('#luna')?.classList.add('celebrate');audio.sfx('pop');setTimeout(()=>{$('#guest')?.classList.remove('celebrate');$('#luna')?.classList.remove('celebrate');overlay.remove();result(true,false);},850);},flightTime);
}
function result(ok,playSound=true){
  const q=phase();const card=$('#card');if(playSound)audio.sfx(ok?(chapter===7?'win':'success'):'fail');$('#pot').classList.toggle('success',ok);$('#pot').classList.toggle('fail',!ok);
  if(chapter===1){
    const speech=$('#speech');speech.classList.remove('hidden','speech-narrator','speech-guest');speech.classList.add('speech-luna','outcome-dialogue');
    speech.innerHTML=ok?`<span class="speaker">Luna</span><p>O hélio deixou o vestido leve, e o neônio trouxe seu brilho! Estou pronta para o baile.</p><button class="story-choice" id="dress-continue">Seguir para a próxima visita</button>`:`<span class="speaker">Luna</span><p>A mistura ficou pesada: o vestido virou pedra e se rasgou. Vou rever as pistas do Grimório.</p><button class="story-choice" id="dress-retry">Tentar outra combinação</button>`;
    speech.onclick=e=>e.stopPropagation();
    if(ok){$('#dress-continue').onclick=()=>{chapter=2;progress.chapter=chapter;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));speech.classList.add('hidden');transitionToScene();};}
    else{$('#dress-retry').onclick=()=>{$('#dress-outcome').classList.remove('stone-ragged','costume-reveal');$('#pot').classList.remove('fail');pick=[];speech.classList.add('hidden');openBook();};}
    return;
  }
  if(ok){if(chapter<7){chapter++;progress.chapter=chapter;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));card.innerHTML=`<p class="eyebrow">Poção concluída</p><h2>Deu certo!</h2><img class="prize" src="${art(prizes[chapter-1])}" alt="${q.product}"><p>${q.success}</p><p class="learning-note"><b>Descoberta:</b> ${q.focus}. ${q.hint}</p><button id="continue">Ir para o próximo capítulo</button>`;card.querySelector('#continue').onclick=transitionToScene;}else{progress.chapter=7;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));card.innerHTML=`<p class="eyebrow">Fim da aventura</p><h2>Mestre Alquimista!</h2><img class="prize" src="${art('pocao1')}" alt="Poção final do Dragão de Cristal"><p>${q.success}</p><p class="learning-note">Você investigou sete missões, aprendeu a ler os elementos e combinou três famílias diferentes.</p><button id="replay">Rever a jornada</button>`;card.querySelector('#replay').onclick=()=>{chapter=1;progress.chapter=1;progress.intro=true;localStorage.setItem('cq-vintage-progress',JSON.stringify(progress));scene();};}}
  else{card.innerHTML=`<p class="eyebrow">A mistura saiu diferente...</p><h2>${chapter===2?'AU-AU!':'PLOP!'}</h2><div class="comic-result"><img src="${art(chapter===2?'wolf':chapter===3?'homemdasneves':chapter===4?'mumia':chapter===5?'vampire':chapter===6?'frankienstein':'cat')}" alt="Reação surpresa"><span>${chapter===2?'Pinscher mágico!':'Fumaça mágica!'}</span></div><p>${q.error}</p><p class="learning-note">Releia a pista e compare o número, a massa e a família dos elementos. Cada tentativa ensina uma propriedade nova.</p><button id="retry">Tentar outra mistura</button>`;card.querySelector('#retry').onclick=()=>{$('#result').classList.remove('show');$('#pot').classList.remove('fail');pick=[];openBook();};}
  $('#result').classList.add('show');
}
opening();
