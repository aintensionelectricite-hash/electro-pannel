// electro-pannel — CAO armoire électrique Spacial S3D
// Version : v13 (2026-05-30) — coupes multiples, undo/redo, vue 3D, Legrand rouge, Schneider vert, Hager bleu
// Résumé des fonctionnalités : voir js/library.js pour les composants, css/style.css pour les styles
const EP_VERSION='v13';

const MODELS={
  '600x1200':{w:600,h:1200,m:30},
  '600x800': {w:600,h:800, m:30},
  '800x1200':{w:800,h:1200,m:30},
  '800x800': {w:800,h:800, m:30},
  '600x600': {w:600,h:600, m:25}
};
const VGOUL_W=60,RAIL_H=35,RAIL_D_APP=50,RAIL_D_BORN=30,THICK_BOT=50;
const BEND_R={1.5:15,2.5:20,6:35,10:50,16:70};
const TOLE_EP=1.5; // épaisseur tôle S3D mm

const FLAGS={cotes:true,capots:true};
const PLACED=[];       // composants sur le fond
const DOOR_PLACED=[];  // composants sur la porte
const WIRES=[];
let wireCount=0,peCount=0,voyantCount=0;
let faceZoom=1.0;            // zoom vue face (molette souris)
let facePanX=0,facePanY=0;  // décalage pan (clic molette ou Alt+drag)
let cutLineY=null,cutDir=1;  // cutDir +1=vers droite, -1=vers gauche
let cutDragging=false;
const EXTRA_CUTS=[];           // [{id,y,dir,label}] coupes secondaires
let extraCutNext=2;            // prochain id de coupe extra
let cutDragId=null;            // id coupe extra en cours de drag
let hoveredComp=null,selectedComp=null,clipboard=null;
let dragging=null,dragOffX=0,dragOffY=0;
let libGhost=null;
let doorVisible=false;
let wm={active:false,startP:null,startPtId:null,prevX:0,prevY:0,waypoints:[]};
let doorDragging=null,doorDragOX=0,doorDragOY=0;
let doorHovered=null,doorSelected=null;
let faceCursorWX=null;
const ZONE_DEPTHS={};    // zone.label → profondeur section (mm)
const RAIL_OFFSETS={};   // rail.label → décalage Y (mm)
const RAIL_FRONT_Z={};   // rail.label → position Z face avant rail (mm depuis face avant panneau)
let planViewMeta=null,planDepthDrag=null;
let peLibDragActive=false; // PE en cours de drag depuis bibliothèque
const COTE_HITS=[];        // cotes cliquables vue face {x,y,r,val,min,max,onSubmit}
const PLAN_COTE_HITS=[];   // cotes cliquables vue coupe
let wireDragging=null;     // {wire,ptIdx} point intermédiaire fil en drag

// ═══════════════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════════════
function GH()  {return Math.max(20,+document.getElementById('gh-h').value||40)}
function ESP() {return Math.max(0, +document.getElementById('esp-r').value||20)}
function NAP() {return Math.max(1, +document.getElementById('nb-app').value||4)}
function NBN() {return Math.max(0, +document.getElementById('nb-born').value||2)}
function THK() {return Math.max(60,+document.getElementById('thickness').value||90)}
function SEC() {return parseFloat(document.getElementById('sel-fil').value)||2.5}

function tog(k){FLAGS[k]=!FLAGS[k];document.getElementById('btn-'+k).classList.toggle('on',FLAGS[k]);draw()}

// Zoom centralisé — met à jour le slider, le % et la vue
function setZoom(z,resetPan){
  faceZoom=Math.max(0.25,Math.min(4,+z||1));
  if(resetPan){facePanX=0;facePanY=0;}
  const pct=Math.round(faceZoom*100);
  const sl=document.getElementById('zoom-slider');if(sl)sl.value=Math.min(200,Math.max(25,pct));
  const lbl=document.getElementById('zoom-pct');if(lbl)lbl.textContent=pct+'%';
  const hdr=document.getElementById('_zoom_lbl');if(hdr)hdr.textContent=pct+'%';
  draw();
}

// Ajuster zoom pour voir toute l'armoire
function zoomFit(){
  const area=document.getElementById('views-area');
  if(!area)return;
  const{w,h}=MODELS[document.getElementById('sel-model').value];
  const sc0=getSc(); // scale de base (zoom=1)
  const availW=area.clientWidth-30,availH=area.clientHeight-30;
  const canW=w*sc0+130,canH=h*sc0+100;
  const fitZ=Math.min(availW/canW,availH/canH,2);
  setZoom(Math.max(0.25,fitZ),true);
}

// Compteur composants/fils dans le titre
function updateStats(){
  const el=document.getElementById('_stats_lbl');
  if(!el)return;
  const nc=PLACED.length+DOOR_PLACED.length,nw=WIRES.length;
  el.textContent=nc?`${nc} comp. · ${nw} fil${nw!==1?'s':''}`:''
;}

// Nomenclature / BOM
function exportBOM(){
  const counts={};
  [...PLACED,...DOOR_PLACED].forEach(p=>{
    const key=`${p.comp.name}||${p.comp.sub}||${p.comp.group}`;
    counts[key]=(counts[key]||{comp:p.comp,n:0});counts[key].n++;
  });
  const rows=[['Désignation','Référence','Groupe','Qté']];
  Object.values(counts).forEach(({comp,n})=>rows.push([comp.name,comp.sub,comp.group,n]));
  // Fils
  rows.push(['','','','']);rows.push(['--- Filerie ---','','','']);
  const byType={};
  WIRES.forEach(w=>{const k=`${w.wtype||'H07V-K'} ${w.section}mm²`;byType[k]=(byType[k]||0)+wireSplineLength(w);});
  Object.entries(byType).forEach(([k,l])=>rows.push([k,'','Câblage',`${(l/1000).toFixed(1)} m`]));
  const bom=['BOM / Nomenclature — CAO Armoire Électrique\n',
    '========================================\n',
    ...rows.map(r=>r.join('\t'))].join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([bom],{type:'text/plain;charset=utf-8'}));
  a.download=`nomenclature-${new Date().toISOString().slice(0,10)}.txt`;a.click();
}
// ── Onglets de vues
let currentView='all';
function setView(v){
  currentView=v;
  document.querySelectorAll('.vtab').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  const face=v==='all'||v==='face',plan=v==='all'||v==='plan';
  const plaques=v==='all'||v==='plaques',porte=(v==='all'||v==='porte')&&doorVisible;
  const iso=v==='iso';
  document.getElementById('cv-face').style.display=face?'block':'none';
  document.getElementById('cv-plan').style.display=plan?'block':'none';
  document.getElementById('cv-top').style.display=plaques?'block':'none';
  document.getElementById('cv-bot').style.display=plaques?'block':'none';
  document.getElementById('cv-door').style.display=porte?'block':'none';
  document.getElementById('cv-iso').style.display=iso?'block':'none';
  if(iso)draw();
}

// ── Collapse panneaux
function toggleLib(){
  const el=document.getElementById('lib');
  el.classList.toggle('collapsed');
  const btn=el.querySelector('.panel-toggle');
  btn.textContent=el.classList.contains('collapsed')?'▶':'◀ Biblio';
}
function toggleWP(){
  const el=document.getElementById('wp');
  el.classList.toggle('collapsed');
  const btn=el.querySelector('.panel-toggle');
  btn.textContent=el.classList.contains('collapsed')?'◀':'Filerie ▶';
}

// Input flottant pour éditer une étiquette (remplace prompt())
function showLabelInput(screenX,screenY,currentLabel,onSubmit){
  const old=document.getElementById('_label_inp');if(old)old.remove();
  const wrap=document.createElement('div');
  wrap.id='_label_inp';
  const lx=Math.min(screenX-60,window.innerWidth-200);
  const ly=Math.max(4,screenY-28);
  wrap.style.cssText=`position:fixed;left:${lx}px;top:${ly}px;z-index:9999;background:#fff;border:2.5px solid #185FA5;border-radius:9px;box-shadow:0 6px 24px rgba(0,0,0,.28);padding:5px 8px;display:flex;align-items:center;gap:6px`;
  const lbl=document.createElement('span');lbl.style.cssText='font-size:9px;color:#888';lbl.textContent='Étiquette';
  const inp=document.createElement('input');
  inp.type='text';inp.value=currentLabel||'';inp.maxLength=20;
  inp.style.cssText='width:80px;font-size:13px;font-weight:600;border:none;outline:none;color:#185FA5;background:transparent';
  const btn=document.createElement('button');
  btn.textContent='✓';
  btn.style.cssText='font-size:11px;font-weight:700;background:#185FA5;color:#fff;border:none;border-radius:6px;padding:3px 8px;cursor:pointer';
  wrap.appendChild(lbl);wrap.appendChild(inp);wrap.appendChild(btn);
  document.body.appendChild(wrap);
  inp.focus();inp.select();
  let closed=false;
  function submit(){if(closed)return;closed=true;wrap.remove();document.removeEventListener('mousedown',onOut,true);onSubmit(inp.value.trim());}
  function cancel(){if(closed)return;closed=true;wrap.remove();document.removeEventListener('mousedown',onOut,true);}
  function onOut(e){if(!wrap.contains(e.target))cancel();}
  setTimeout(()=>document.addEventListener('mousedown',onOut,true),50);
  btn.addEventListener('click',e=>{e.stopPropagation();submit();});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit();}if(e.key==='Escape'){e.preventDefault();cancel();}e.stopPropagation();});
}

// Input flottant au clic sur une cotation
// Reste ouvert jusqu'à : Entrée, bouton ✓, Échap, ou clic en dehors
function showCoteInput(screenX,screenY,val,min,max,onSubmit){
  const old=document.getElementById('_cote_inp');if(old)old.remove();
  const wrap=document.createElement('div');
  wrap.id='_cote_inp';
  // Positionner en s'assurant que la boîte reste visible à l'écran
  const lx=Math.min(screenX-50, window.innerWidth-160);
  const ly=Math.max(4, screenY-26);
  wrap.style.cssText=`position:fixed;left:${lx}px;top:${ly}px;z-index:9999;background:#fff;border:2.5px solid #1D9E75;border-radius:9px;box-shadow:0 6px 24px rgba(0,0,0,.28);padding:5px 8px;display:flex;align-items:center;gap:6px`;
  // Label de la valeur actuelle
  const lbl=document.createElement('span');
  lbl.style.cssText='font-size:9px;color:#888;white-space:nowrap';
  lbl.textContent=`${Math.round(val)} mm →`;
  // Champ de saisie
  const inp=document.createElement('input');
  inp.type='number';inp.value=Math.round(val);inp.min=min;inp.max=max;inp.step=1;
  inp.style.cssText='width:68px;font-size:14px;font-weight:700;border:none;outline:none;text-align:center;color:#0A5040;background:transparent';
  const unit=document.createElement('span');unit.textContent='mm';unit.style.cssText='font-size:10px;color:#888;margin-right:2px';
  // Bouton valider
  const btn=document.createElement('button');
  btn.textContent='✓ OK';
  btn.style.cssText='font-size:11px;font-weight:700;background:#1D9E75;color:#fff;border:none;border-radius:6px;padding:3px 8px;cursor:pointer;white-space:nowrap';
  wrap.appendChild(lbl);wrap.appendChild(inp);wrap.appendChild(unit);wrap.appendChild(btn);
  document.body.appendChild(wrap);
  // Focus sans sélectionner — l'utilisateur voit la valeur entière
  inp.focus();inp.select();

  let closed=false;
  function submit(){
    if(closed)return;closed=true;
    const v=parseFloat(inp.value);
    wrap.remove();
    document.removeEventListener('mousedown',onOutside,true);
    if(!isNaN(v)&&v>=min&&v<=max){onSubmit(v);draw();}
  }
  function cancel(){
    if(closed)return;closed=true;
    wrap.remove();
    document.removeEventListener('mousedown',onOutside,true);
  }
  // Clic en dehors → ferme sans valider
  function onOutside(e){
    if(!wrap.contains(e.target))cancel();
  }
  // Attendre un tick avant d'armer le listener "dehors" (sinon le clic d'ouverture le déclenche)
  setTimeout(()=>document.addEventListener('mousedown',onOutside,true),50);

  btn.addEventListener('click',e=>{e.stopPropagation();submit();});
  inp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();submit();}
    if(e.key==='Escape'){e.preventDefault();cancel();}
    e.stopPropagation();
  });
  // PAS de handler blur — l'input reste ouvert même si l'utilisateur clique sur les flèches ↑↓
}

function updateInfo(){
  const el=document.getElementById('info');
  if(wm.active&&!wm.startP){el.innerHTML='<b style="color:#A06000">⚡ Mode fil</b> — Cliquer un point <span style="color:#FF8C00">⬤</span> de départ sur un composant &nbsp;<span style="color:#BBB">· Échap : annuler</span>';return;}
  if(wm.active&&wm.startP){el.innerHTML='<b style="color:#A06000">⚡ Fil en cours</b> — Cliquer le point <span style="color:#FF8C00">⬤</span> d\'arrivée &nbsp;<span style="color:#BBB">· Échap : annuler · Clic vide : annuler départ</span>';return;}
  if(selectedComp){const c=selectedComp.comp,rl=selectedComp.railRef;const amps=(c.name.match(/(\d+)\s*A/)||[])[1];el.innerHTML=`<b style="color:#185FA5">${selectedComp.label||c.name}</b> &mdash; ${c.name}${amps?` <b>${amps}A</b>`:''}  &middot; Réf: ${c.ref||c.sub}  &middot; ${c.modW}×${c.modH}mm${rl?` &middot; ${rl.label}`:''}  <span style="color:#BBB;margin-left:8px">Dbl-clic renommer · Ctrl+C copier · Ctrl+D dupliquer · Supr supprimer</span>`;}
  else if(doorSelected){const c=doorSelected.comp;el.innerHTML=`<b style="color:#6B3DA6">${doorSelected.label||c.name}</b> &mdash; ${c.name} &middot; ${c.sub} &middot; ${c.modW}×${c.modH}mm  <span style="color:#BBB;margin-left:8px">Dbl-clic renommer · Clic droit supprimer</span>`;}
  else{el.innerHTML='Glisser-déposer composants · Clic droit supprimer · <b>W</b> = mode fil · Dbl-clic sur fil = ajouter point · Ctrl+C/D/V = copier/dupliquer/coller · Ctrl+Z/Y = annuler/rétablir';}
}
function togWire(){
  wm={active:!wm.active,startP:null,startPtId:null,prevX:0,prevY:0};
  document.getElementById('btn-fil').classList.toggle('wire-on',wm.active);draw();
}
function togDoor(){
  doorVisible=!doorVisible;
  document.getElementById('btn-door').classList.toggle('door-on',doorVisible);
  if(!doorVisible){doorSelected=null;doorHovered=null;}
  setView(currentView);
  draw();updateInfo();
}
function addExtraCut(){
  const{h}=MODELS[document.getElementById('sel-model').value];
  const letters='BCDEFGHIJ';
  const label=(letters[EXTRA_CUTS.length]||String(extraCutNext))+'-'+(letters[EXTRA_CUTS.length]||String(extraCutNext));
  EXTRA_CUTS.push({id:extraCutNext++,y:h*(0.4+EXTRA_CUTS.length*0.15),dir:1,label});
  draw();schedSave();
}
function removeExtraCut(id){
  const i=EXTRA_CUTS.findIndex(c=>c.id===id);
  if(i>=0){EXTRA_CUTS.splice(i,1);draw();schedSave();}
}

function clearAll(){
  if(!confirm('Vider tout ?'))return;
  PLACED.length=0;DOOR_PLACED.length=0;WIRES.length=0;EXTRA_CUTS.length=0;extraCutNext=2;
  wireCount=peCount=voyantCount=0;selectedComp=null;doorSelected=null;
  for(const k in RAIL_OFFSETS)delete RAIL_OFFSETS[k];
  for(const k in ZONE_DEPTHS)delete ZONE_DEPTHS[k];
  for(const k in RAIL_FRONT_Z)delete RAIL_FRONT_Z[k];
  cutLineY=null;
  draw();updateWT();updateInfo();schedSave();
}

// ═══════════════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════════════
function getLayout(){
  const model=MODELS[document.getElementById('sel-model').value];
  const nbApp=NAP(),nbBorn=NBN(),ghH=GH(),espR=ESP();
  const{w,h,m}=model;
  const intX=m+VGOUL_W,intW=w-2*m-2*VGOUL_W;
  const zones=[];let cy=m;
  // Rails appareillage (haut)
  for(let i=0;i<nbApp+1;i++){
    zones.push({type:'goulH',y:cy,h:ghH,idx:i,sub:'app',label:`GH${i+1}`});cy+=ghH;
    if(i<nbApp){
      cy+=espR;
      const lbl=`R${i+1}`,off=RAIL_OFFSETS[lbl]||0;
      zones.push({type:'rail',y:cy+off,h:RAIL_H,idx:i,sub:'app',depth:RAIL_D_APP,label:lbl,baseY:cy});
      cy+=RAIL_H+espR;
    }
  }
  // Rails borniers (bas) — la dernière GH app sert de transition, pas de GH dupliquée
  for(let i=0;i<nbBorn;i++){
    const ri=nbApp+1+i;
    cy+=espR;
    const lbl=`R${ri}`,off=RAIL_OFFSETS[lbl]||0;
    zones.push({type:'rail',y:cy+off,h:RAIL_H,idx:ri-1,sub:'born',depth:RAIL_D_BORN,label:lbl,baseY:cy});
    cy+=RAIL_H+espR;
    zones.push({type:'goulH',y:cy,h:ghH,idx:nbApp+1+i,sub:'born',label:`GH${nbApp+2+i}`});cy+=ghH;
  }
  if(cutLineY===null)cutLineY=h/2;
  return{model,nbApp,nbBorn,ghH,espR,intX,intW,zones,m,w,h};
}

function panelThick(y,h){const t=THK();return t-(t-THICK_BOT)*Math.max(0,Math.min(y/h,1))}
function getZD(zone){return ZONE_DEPTHS[zone.label]!==undefined?ZONE_DEPTHS[zone.label]:zone.type==='goulH'?40:zone.depth||30;}

// ═══════════════════════════════════════════════════════════════════════
// COORDONNÉES
// ═══════════════════════════════════════════════════════════════════════
function getSc(){const{w,h}=MODELS[document.getElementById('sel-model').value];return Math.min(360/w,640/h,.66)}
function W2F(wx,wy){const sc=getSc()*faceZoom;return[58+facePanX+wx*sc,34+facePanY+wy*sc]}
function F2W(px,py){const sc=getSc()*faceZoom;return[(px-58-facePanX)/sc,(py-34-facePanY)/sc]}
function wireR(sec){const m={1.5:1.4,2.5:1.8,6:2.8,10:3.6,16:4.5};return(m[String(sec)]||2)/2}

// ═══════════════════════════════════════════════════════════════════════
// POINTS D'ACCROCHAGE
// ═══════════════════════════════════════════════════════════════════════
function getConnPts(p){
  if(!p?.comp)return[];
  const c=p.comp,cw=c.modW,ch=c.modH;
  if(c.type==='disj'||c.type==='diff'||c.type==='sect')
    return[{id:'top',wx:p.wx+cw/2,wy:p.wy},{id:'bot',wx:p.wx+cw/2,wy:p.wy+ch}];
  if(c.type==='repot'){
    // 1 entrée en haut (centre) + N sorties décalées en bas (éventail)
    const N=c.poles;
    const stagMM=Math.min(30,(N-1)*4); // décalage total max 30mm
    const step=N>1?stagMM/(N-1):0;
    const pts=[{id:'in',wx:p.wx+cw/2,wy:p.wy}]; // entrée alimentation
    for(let i=0;i<N;i++){
      pts.push({id:`b${i}`,wx:p.wx+(i+.5)*cw/N,wy:p.wy+ch+i*step});
    }
    return pts;
  }
  if(c.type==='bornier')
    return[{id:'left',wx:p.wx,wy:p.wy+ch/2},{id:'right',wx:p.wx+cw,wy:p.wy+ch/2}];
  if(c.type==='petoupe')
    return[{id:'inner',wx:p.wx+cw/2,wy:p.wy+ch*(p.band==='top'?1:0)}];
  if(c.type==='voyant'){
    // Si le voyant a une position face (panneau porte à droite), utiliser celle-là
    if(p._faceWX!==undefined)return[{id:'face',wx:p._faceWX,wy:p._faceWY}];
    return[{id:'bot',wx:p.wx+cw/2,wy:p.wy+ch}];
  }
  return[];
}

function nearestConnPt(wx,wy,excludeP,collectionOverride){
  const th=18;let best=null,bd=Infinity;
  const coll=collectionOverride||[...PLACED,...(doorVisible?DOOR_PLACED:[])];
  coll.forEach(p=>{
    if(p===excludeP)return;
    getConnPts(p).forEach(pt=>{
      const d=Math.hypot(wx-pt.wx,wy-pt.wy);
      if(d<th&&d<bd){bd=d;best={placed:p,pt};}
    });
  });
  return best;
}

// ═══════════════════════════════════════════════════════════════════════
// SNAP & PLACEMENT
// ═══════════════════════════════════════════════════════════════════════
function findFreeX(wx,comp,rail,layout){
  const{intX,intW}=layout,grid=comp.type==='bornier'?1:18;
  const peers=PLACED.filter(p=>p.type==='comp'&&p.railRef?.label===rail.label);
  const fits=x=>x>=intX&&x+comp.modW<=intX+intW&&!peers.some(p=>x<p.wx+p.comp.modW&&x+comp.modW>p.wx);
  let s=intX+Math.round((wx-intX)/grid)*grid;
  s=Math.max(intX,Math.min(s,intX+intW-comp.modW));
  for(let x=s;x<=intX+intW-comp.modW;x+=grid)if(fits(x))return x;
  for(let x=s-grid;x>=intX;x-=grid)if(fits(x))return x;
  return null;
}

function applySnap(wx,wy,comp,layout){
  const{zones,intX,intW,m,h}=layout;
  // Presse-étoupe : bandes haute/basse
  if(comp.type==='petoupe'){
    const grid=5,band=wy<h/2?'top':'bottom';
    const peWy=band==='top'?m/2-comp.modH/2:h-m/2-comp.modH/2;
    const peers=PLACED.filter(p=>p.type==='comp'&&p.comp?.type==='petoupe'&&p.band===band);
    const fits=x=>!peers.some(p=>x<p.wx+p.comp.modW+2&&x+comp.modW+2>p.wx);
    let fx=intX+Math.round((wx-intX)/grid)*grid;
    fx=Math.max(intX,Math.min(fx,intX+intW-comp.modW));
    if(!fits(fx)){for(let d=grid;d<intW;d+=grid){if(fits(fx+d)){fx+=d;break;}if(fits(fx-d)){fx-=d;break;}}}
    return{wx:Math.max(intX,Math.min(fx,intX+intW-comp.modW)),wy:peWy,band,onRail:false};
  }
  // Composant standard
  const isBorn=comp.type==='bornier',isApp=['disj','diff','sect'].includes(comp.type);
  const needSub=isBorn?'born':isApp?'app':null;
  const th=28;
  const rail=zones.find(z=>z.type==='rail'&&(needSub===null||z.sub===needSub)&&Math.abs(wy-(z.y+(RAIL_H-comp.modH)/2))<th);
  if(!rail)return{wx:Math.max(intX,Math.min(wx,intX+intW-comp.modW)),wy,onRail:false};
  const fx=findFreeX(wx,comp,rail,layout);
  const fy=rail.y+(RAIL_H-comp.modH)/2;
  if(fx===null)return{wx:Math.max(intX,wx),wy:fy,onRail:true,noSpace:true,rail};
  return{wx:fx,wy:fy,onRail:true,rail};
}

function autoLabel(comp){
  if(comp.type==='bornier'){return`B${PLACED.filter(p=>p.comp?.type==='bornier').length+1}`;}
  if(comp.type==='petoupe'){return`PE${PLACED.filter(p=>p.comp?.type==='petoupe').length+1}`;}
  if(comp.type==='voyant'){return`V${DOOR_PLACED.filter(p=>p.comp?.type==='voyant').length+1}`;}
  // Disjoncteurs/sectionneurs/différentiels : numérotation avec préfixe type
  if(comp.type==='disj'){const n=PLACED.filter(p=>p.comp?.type==='disj').length+1;return`Q${n}`;}
  if(comp.type==='diff'){const n=PLACED.filter(p=>p.comp?.type==='diff').length+1;return`ID${n}`;}
  if(comp.type==='sect'){const n=PLACED.filter(p=>p.comp?.type==='sect').length+1;return`QS${n}`;}
  if(comp.type==='repot'){const n=PLACED.filter(p=>p.comp?.type==='repot').length+1;return`RP${n}`;}
  if(comp.type==='repartiteur'){const n=PLACED.filter(p=>p.comp?.type==='repartiteur').length+1;return`REP${n}`;}
  return comp.name;
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTAGE FIL — 3 segments stricts à l'équerre
// Départ → montée/descente vers goulotte GH → horizontal → descente/montée arrivée
// Jamais de diagonale, jamais de traversée de composant
// ═══════════════════════════════════════════════════════════════════════
function routeWireStrict(startPt,endPt,startComp,endComp,layout,startPtId,endPtId){
  const{zones}=layout;
  const[x1,y1]=startPt,[x2,y2]=endPt;
  const goulottes=zones.filter(z=>z.type==='goulH');
  if(!goulottes.length)return[startPt,endPt];

  // Sélection de la goulotte selon la direction de sortie du composant :
  // 'bot' → fil descend → goulotte en dessous
  // 'top' → fil monte → goulotte au dessus
  // bornier (left/right) → goulotte la plus proche
  let pool;
  if(startPtId==='bot'){
    const below=goulottes.filter(z=>z.y+z.h/2>y1);
    pool=below.length?below:goulottes;
  } else if(startPtId==='top'){
    const above=goulottes.filter(z=>z.y+z.h/2<y1);
    pool=above.length?above:goulottes;
  } else {
    // Bornier ou inconnu : goulotte entre les deux points
    const yMin=Math.min(y1,y2),yMax=Math.max(y1,y2);
    const between=goulottes.filter(z=>{const gY=z.y+z.h/2;return gY>=yMin-5&&gY<=yMax+5;});
    pool=between.length?between:goulottes;
  }

  // Goulotte la plus proche du point de départ dans le pool
  const goulotte=pool.reduce((a,b)=>Math.abs(a.y+a.h/2-y1)<Math.abs(b.y+b.h/2-y1)?a:b);
  const gY=goulotte.y+goulotte.h/2;

  // 4 points de base : départ → goulotte → arrivée (spline lisse)
  return[[x1,y1],[x1,gY],[x2,gY],[x2,y2]];
}

// Ajoute des waypoints intermédiaires tous les spacingMM mm sur chaque segment
function addWaypoints(pts,spacingMM=100){
  if(pts.length<2)return pts;
  const res=[pts[0]];
  for(let i=1;i<pts.length;i++){
    const[x1,y1]=pts[i-1],[x2,y2]=pts[i];
    const d=Math.hypot(x2-x1,y2-y1);
    if(d>spacingMM*1.5){
      const n=Math.round(d/spacingMM);
      for(let j=1;j<n;j++)res.push([x1+(x2-x1)*j/n,y1+(y2-y1)*j/n]);
    }
    res.push([x2,y2]);
  }
  return res;
}

// Distance d'un point à un segment (coords canvas)
function ptSegDist(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;
  if(len2<0.001)return Math.hypot(px-ax,py-ay);
  const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/len2));
  return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
}
// Paramètre t de la projection sur segment
function ptSegT(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;
  if(len2<0.001)return 0;
  return Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/len2));
}

function wireLength(pts){
  if(!pts||pts.length<2)return 0;
  let l=0;for(let i=1;i<pts.length;i++)l+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
  return Math.round(l);
}

// ═══════════════════════════════════════════════════════════════════════
// TABLEAU FILERIE
// ═══════════════════════════════════════════════════════════════════════
const WIRE_TYPES=['H07V-K','H07V-R','H07Z1-K','LIYY','NYY','SYT','XVB'];
const DOOR_GAP=()=>Math.max(100,+document.getElementById('door-gap')?.value||500);

// Longueur réelle de la spline Catmull-Rom (en mm)
function wireSplineLength(wire){
  if(!wire?.pts||wire.pts.length<2)return 0;
  const pts=wire.pts;
  if(pts.length===2)return Math.round(Math.hypot(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]));
  const T=0.42,S=10;let total=0;
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(i+2,pts.length-1)];
    const cp1x=p1[0]+(p2[0]-p0[0])*T,cp1y=p1[1]+(p2[1]-p0[1])*T;
    const cp2x=p2[0]-(p3[0]-p1[0])*T,cp2y=p2[1]-(p3[1]-p1[1])*T;
    let px=p1[0],py=p1[1];
    for(let s=1;s<=S;s++){
      const t=s/S,mt=1-t;
      const bx=mt*mt*mt*p1[0]+3*mt*mt*t*cp1x+3*mt*t*t*cp2x+t*t*t*p2[0];
      const by=mt*mt*mt*p1[1]+3*mt*mt*t*cp1y+3*mt*t*t*cp2y+t*t*t*p2[1];
      total+=Math.hypot(bx-px,by-py);px=bx;py=by;
    }
  }
  // Ajouter joint de porte si voyant connecté
  const hasVoyant=wire.endP?.comp?.type==='voyant'||wire.startP?.comp?.type==='voyant';
  return Math.round(total)+(hasVoyant?DOOR_GAP():0);
}

function updateWT(){
  const tbody=document.getElementById('wt-body');tbody.innerHTML='';
  WIRES.forEach(wire=>{
    if(!wire.color)wire.color='#C47820';
    if(!wire.wtype)wire.wtype='H07V-K';
    const tr=document.createElement('tr');
    if(wire.highlighted)tr.classList.add('hl');
    const de=wire.startP?.label||'—',vers=wire.endP?.label||'—';
    const L=wireSplineLength(wire);

    // Repère
    const tdId=document.createElement('td');tdId.className='wlabel';tdId.textContent=wire.id;tr.appendChild(tdId);

    // Couleur
    const tdClr=document.createElement('td');
    const swatch=document.createElement('span');swatch.className='wclr';
    swatch.style.background=wire.color;swatch.title='Changer couleur';
    const colInp=document.createElement('input');colInp.type='color';colInp.value=wire.color;
    colInp.style.cssText='position:absolute;opacity:0;width:1px;height:1px;pointer-events:none';
    swatch.addEventListener('click',e=>{e.stopPropagation();colInp.click();});
    colInp.addEventListener('input',()=>{wire.color=colInp.value;swatch.style.background=wire.color;draw();});
    tdClr.appendChild(swatch);tdClr.appendChild(colInp);tr.appendChild(tdClr);

    // Type fil
    const tdType=document.createElement('td');tdType.className='editable';
    const selType=document.createElement('select');selType.style.cssText='font-size:9px;border:none;background:transparent;max-width:58px';
    WIRE_TYPES.forEach(t=>{const o=document.createElement('option');o.value=t;o.textContent=t;if(t===wire.wtype)o.selected=true;selType.appendChild(o);});
    selType.addEventListener('change',()=>{wire.wtype=selType.value;});
    tdType.appendChild(selType);tr.appendChild(tdType);

    // Section mm²
    const tdSec=document.createElement('td');tdSec.className='editable';
    const selSec=document.createElement('select');selSec.style.cssText='font-size:9px;border:none;background:transparent;max-width:36px';
    ['1.5','2.5','6','10','16'].forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;if(s===String(wire.section))o.selected=true;selSec.appendChild(o);});
    selSec.addEventListener('change',()=>{wire.section=parseFloat(selSec.value);draw();});
    tdSec.appendChild(selSec);tr.appendChild(tdSec);

    // De / Vers
    const tdDe=document.createElement('td');tdDe.textContent=de;tdDe.title=de;tr.appendChild(tdDe);
    const tdVers=document.createElement('td');tdVers.textContent=vers;tdVers.title=vers;tr.appendChild(tdVers);

    // Longueur spline
    const tdL=document.createElement('td');
    tdL.textContent=L;
    if(wire.endP?.comp?.type==='voyant'||wire.startP?.comp?.type==='voyant')tdL.title=`+${DOOR_GAP()}mm joint porte`;
    tr.appendChild(tdL);

    tr.addEventListener('click',()=>{WIRES.forEach(w2=>w2.highlighted=false);wire.highlighted=true;draw();updateWT();});
    tbody.appendChild(tr);
  });
  // Barre de totaux en bas du tableau
  const totalL=WIRES.reduce((s,w)=>s+wireSplineLength(w),0);
  let foot=document.getElementById('_wt_foot');
  if(!foot){
    foot=document.createElement('div');foot.id='_wt_foot';
    foot.style.cssText='font-size:9px;color:#888;padding:3px 6px;border-top:.5px solid #E0DEDB;background:#F8F7F4;flex-shrink:0';
    document.getElementById('wp').appendChild(foot);
  }
  foot.textContent=`${WIRES.length} fil${WIRES.length>1?'s':''} · ${(totalL/1000).toFixed(1)} m total`;
}

function exportCSV(){
  const rows=[['Repère','Type','Section (mm²)','Couleur','De','Vers','Longueur (mm)']];
  WIRES.forEach(w=>{
    rows.push([w.id,w.wtype||'H07V-K',w.section,w.color||'',w.startP?.label||'',w.endP?.label||'',wireSplineLength(w)]);
  });
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob(['﻿'+rows.map(r=>r.join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  a.download='filerie.csv';a.click();
}

async function exportHTML(){
  const state={
    v:2,ts:Date.now(),
    model:document.getElementById('sel-model').value,
    nbApp:document.getElementById('nb-app').value,
    nbBorn:document.getElementById('nb-born').value,
    ghH:document.getElementById('gh-h').value,
    espR:document.getElementById('esp-r').value,
    thickness:document.getElementById('thickness').value,
    doorGap:document.getElementById('door-gap')?.value||500,
    doorVisible,cutLineY,cutDir,wireCount,peCount,voyantCount,
    extraCuts:EXTRA_CUTS.map(c=>({...c})),extraCutNext,
    railOffsets:{...RAIL_OFFSETS},zoneDepths:{...ZONE_DEPTHS},railFrontZ:{...RAIL_FRONT_Z},
    placed:PLACED.map(p=>({id:p.comp.id,wx:p.wx,wy:p.wy,label:p.label,railLabel:p.railRef?.label||null,band:p.band||null})),
    doorPlaced:DOOR_PLACED.map(p=>({id:p.comp.id,wx:p.wx,wy:p.wy,label:p.label})),
    wires:WIRES.map(w=>({id:w.id,section:w.section,color:w.color,wtype:w.wtype,
      sLabel:w.startP?.label||null,sPtId:w.startPtId,eLabel:w.endP?.label||null,ePtId:w.endPtId,pts:w.pts}))
  };
  const injectScript=`<script>try{localStorage.setItem('ep_v2',${JSON.stringify(JSON.stringify(state))});}catch(e){}<\/script>`;
  // Inline CSS et JS pour fichier standalone
  let html=document.documentElement.outerHTML;
  try{
    const css=await fetch('css/style.css').then(r=>r.text());
    html=html.replace('<link rel="stylesheet" href="css/style.css">',`<style>\n${css}\n</style>`);
    for(const src of['js/library.js','js/app.js','js/components.js','js/draw.js']){
      const js=await fetch(src).then(r=>r.text());
      html=html.replace(`<script src="${src}"></script>`,`<script>\n${js}\n<\/script>`);
    }
  }catch(e){console.warn('exportHTML inline:',e);}
  html=html.replace('</body>',injectScript+'\n</body>');
  const date=new Date().toISOString().slice(0,10);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  a.download=`cao-armoire-${date}.html`;a.click();
}

// ═══════════════════════════════════════════════════════════════════════
// BIBLIOTHÈQUE
// ═══════════════════════════════════════════════════════════════════════
function buildLib(){
  const panel=document.getElementById('lib');
  const existingToggle=panel.querySelector('.panel-toggle');
  panel.innerHTML='';
  if(existingToggle)panel.appendChild(existingToggle);

  // Titre
  const hdr=document.createElement('div');
  hdr.style.cssText='font-size:10px;font-weight:700;color:#BBBBB5;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px;flex-shrink:0';
  hdr.textContent='Bibliothèque';panel.appendChild(hdr);

  // Champ de recherche
  const srch=document.createElement('input');
  srch.id='lib-search';srch.type='text';srch.placeholder='Rechercher… nom, réf, ampérage';
  panel.appendChild(srch);

  // Grouper par marque puis par catégorie
  const brands=[...new Set(COMPS.map(c=>c.brand))];
  const brandEls={};

  brands.forEach(brand=>{
    const bc=BRAND_COLORS[brand]||'#555';
    const bHdr=document.createElement('div');
    bHdr.className='lib-brand-hdr';
    bHdr.style.cssText=`background:${bc}22;color:${bc};border:.5px solid ${bc}55`;
    bHdr.innerHTML=`<span>${brand}</span><span class="arrow">▶</span>`;
    const bBody=document.createElement('div');bBody.className='lib-brand-body';
    bHdr.addEventListener('click',()=>{bHdr.classList.toggle('open');bBody.classList.toggle('open');});
    panel.appendChild(bHdr);panel.appendChild(bBody);

    const cats=[...new Set(COMPS.filter(c=>c.brand===brand).map(c=>c.group))];
    cats.forEach(cat=>{
      const cHdr=document.createElement('div');cHdr.className='lib-cat-hdr';
      cHdr.innerHTML=`<span>${cat}</span><span style="font-size:8px">▾</span>`;
      const cBody=document.createElement('div');cBody.className='lib-cat-body';
      cHdr.addEventListener('click',()=>cBody.classList.toggle('hidden'));
      bBody.appendChild(cHdr);bBody.appendChild(cBody);

      COMPS.filter(c=>c.brand===brand&&c.group===cat).forEach(c=>{
        const d=document.createElement('div');d.className='lib-item';d._comp=c;
        const badge=c.conn==='xp'?'<span class="conn-badge badge-xp">XP</span>':
                    c.conn==='xe'?'<span class="conn-badge badge-xe">XE</span>':'';
        const refLine=c.ref?`<span class="lib-ref">${c.ref} ${c.modW}×${c.modH}mm</span>`:'';
        d.innerHTML=`<div class="li-chip" style="background:${c.color}"></div><div class="li-info"><div class="li-name">${c.name}${badge}</div><div class="li-sub">${c.sub}</div>${refLine}</div>`;
        d.title=c.type==='petoupe'?'Glisser sur zone haute/basse du fond ou vue plaque':
                c.type==='voyant'?'Glisser sur la porte (bouton Porte requis)':
                `${c.name} — ${c.ref||''} ${c.modW}×${c.modH}mm`;
        d.addEventListener('mousedown',e=>{e.preventDefault();startLibDrag(e,c);});
        cBody.appendChild(d);
      });
    });
    brandEls[brand]={hdr:bHdr,body:bBody};
  });

  // Recherche temps réel
  srch.addEventListener('input',()=>{
    const q=srch.value.trim().toLowerCase();
    if(!q){
      Object.values(brandEls).forEach(({hdr:h,body:b})=>{h.classList.remove('open');b.classList.remove('open');});
      panel.querySelectorAll('.lib-item').forEach(d=>d.style.display='');
      panel.querySelectorAll('.lib-cat-body').forEach(b=>b.classList.remove('hidden'));
      return;
    }
    Object.values(brandEls).forEach(({hdr:h,body:b})=>{h.classList.add('open');b.classList.add('open');});
    panel.querySelectorAll('.lib-cat-body').forEach(b=>b.classList.remove('hidden'));
    panel.querySelectorAll('.lib-item').forEach(d=>{
      const c=d._comp;if(!c)return;
      d.style.display=(c.name+c.sub+(c.ref||'')+(c.group||'')).toLowerCase().includes(q)?'':'none';
    });
  });
}

function startLibDrag(e,comp){
  const isDoor=comp.type==='voyant';
  const cvId=isDoor&&doorVisible?'cv-door':'cv-face';
  const cv=document.getElementById(cvId);
  const rect=cv.getBoundingClientRect();
  function onMove(ev){
    if(!isDoor){libGhost={comp,x:ev.clientX-rect.left,y:ev.clientY-rect.top};draw();}
  }
  function onUp(ev){
    // ── Drop PE direct sur vue plaque haute (cv-top) ou basse (cv-bot)
    if(comp.type==='petoupe'){
      for(const[cvId,band] of [['cv-top','top'],['cv-bot','bottom']]){
        const cvEl=document.getElementById(cvId);
        if(cvEl.style.display==='none')continue;
        const rp=cvEl.getBoundingClientRect();
        const ppx=ev.clientX-rp.left,ppy=ev.clientY-rp.top;
        if(ppx>0&&ppx<cvEl.width&&ppy>0&&ppy<cvEl.height){
          const layout=getLayout();
          const{intX,intW,m,h}=layout;
          const sc=getSc(),OX=46,grid=5;
          const wx0=(ppx-OX)/sc;
          const peWy=band==='top'?m/2-comp.modH/2:h-m/2-comp.modH/2;
          const peers=PLACED.filter(p=>p.comp?.type==='petoupe'&&p.band===band);
          const fits=x=>!peers.some(p=>x<p.wx+p.comp.modW+2&&x+comp.modW+2>p.wx);
          let fx=intX+Math.round((wx0-intX)/grid)*grid;
          fx=Math.max(intX,Math.min(fx,intX+intW-comp.modW));
          if(!fits(fx)){for(let d=grid;d<intW;d+=grid){if(fits(fx+d)){fx+=d;break;}if(fits(fx-d)){fx-=d;break;}}}
          PLACED.push({comp,wx:fx,wy:peWy,type:'comp',label:autoLabel(comp),railRef:null,band});
          libGhost=null;document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);
          draw();updateWT();return;
        }
      }
    }
    // ── Drop normal : porte ou fond
    const target=isDoor&&doorVisible?document.getElementById('cv-door'):document.getElementById('cv-face');
    const r=target.getBoundingClientRect();
    const px=ev.clientX-r.left,py=ev.clientY-r.top;
    if(px>0&&px<target.width&&py>0&&py<target.height){
      if(isDoor&&doorVisible){
        const sc=getSc();
        const wx=(px-40)/sc-comp.modW/2,wy=(py-20)/sc-comp.modH/2;
        DOOR_PLACED.push({comp,wx:Math.max(0,wx),wy:Math.max(0,wy),type:'comp',label:autoLabel(comp)});
      } else {
        const layout=getLayout();
        const[wx0,wy0]=F2W(px,py);
        const{wx,wy,onRail,noSpace,rail,band}=applySnap(wx0-comp.modW/2,wy0-comp.modH/2,comp,layout);
        if(noSpace){alert('Plus de place.');}
        else{PLACED.push({comp,wx,wy,type:'comp',label:autoLabel(comp),railRef:rail||null,band:band||null});}
      }
    }
    libGhost=null;document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);
    draw();updateWT();schedSave();
  }
  document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
}

// ═══════════════════════════════════════════════════════════════════════
// INTERACTIONS CANVAS FACE
// ═══════════════════════════════════════════════════════════════════════
function setupFaceCanvas(){
  const cv=document.getElementById('cv-face');
  cv.addEventListener('mousemove',e=>{
    const r=cv.getBoundingClientRect();
    const[wx,wy]=F2W(e.clientX-r.left,e.clientY-r.top);
    const[,cutPY]=W2F(0,cutLineY||0);
    const my=e.clientY-r.top;
    if(cutDragging){
      cutLineY=wy;draw();return;
    }
    if(cutDragId!==null){
      const ec=EXTRA_CUTS.find(c=>c.id===cutDragId);
      if(ec){ec.y=wy;draw();}return;
    }
    const layout0=getLayout();
    const onRail=!wm.active&&!dragging&&layout0.zones.some(z=>z.type==='rail'&&wx>=layout0.intX&&wx<=layout0.intX+layout0.intW&&wy>=z.y&&wy<z.y+z.h);
    const px0=e.clientX-r.left,py0=e.clientY-r.top;
    const onCote=FLAGS.cotes&&!wm.active&&COTE_HITS.some(c=>c.r>0&&Math.hypot(px0-c.x,py0-c.y)<c.r);
    // Curseur ns-resize si survol d'un trait de coupe (principal ou secondaire)
    const onAnyCut=EXTRA_CUTS.some(ec=>{const[,ey]=W2F(0,ec.y||0);return Math.abs(my-ey)<8;});
    cv.style.cursor=Math.abs(my-cutPY)<8&&!wm.active?'ns-resize':onAnyCut&&!wm.active?'ns-resize':onRail&&!hoveredComp?'ns-resize':wm.active?'crosshair':onCote?'text':'default';
    faceCursorWX=wx;
    const oldH=hoveredComp;
    hoveredComp=PLACED.find(p=>p.type==='comp'&&wx>=p.wx&&wx<=p.wx+p.comp.modW&&wy>=p.wy&&wy<=p.wy+p.comp.modH)||null;
    if(wm.active&&wm.startP){wm.prevX=wx;wm.prevY=wy;}
    if(oldH!==hoveredComp){
      // Info-bar hover rapide (sans cliquer)
      if(hoveredComp&&!selectedComp){
        const c=hoveredComp.comp,rl=hoveredComp.railRef;
        const amps=(c.name.match(/(\d+)\s*A/)||[])[1];
        const el=document.getElementById('info');
        if(el)el.innerHTML=`<span style="color:#555">${hoveredComp.label||c.name}</span> &mdash; <b>${c.name}</b>${amps?` <b style="color:#185FA5">${amps}A</b>`:''} &middot; ${c.ref||c.sub} &middot; ${c.modW}×${c.modH}mm${rl?` &middot; <span style="color:#888">${rl.label}</span>`:''}`;
      } else if(!selectedComp&&!doorSelected) updateInfo();
    }
    if(oldH!==hoveredComp||(wm.active&&wm.startP))draw();else drawPlanView(getLayout());
  });
  cv.addEventListener('mouseleave',()=>{faceCursorWX=null;hoveredComp=null;drawPlanView(getLayout());});
  // ── Zoom molette souris + pan clic molette (ou Alt+drag)
  cv.addEventListener('wheel',e=>{
    e.preventDefault();
    if(e.ctrlKey||!e.shiftKey){
      // Zoom vers position souris
      const r2=cv.getBoundingClientRect();
      const mx=e.clientX-r2.left,my=e.clientY-r2.top;
      const oldZ=faceZoom,newZ=Math.max(0.25,Math.min(4,faceZoom*(e.deltaY<0?1.12:1/1.12)));
      // Ajuster pan pour zoomer vers la souris
      facePanX=mx-(mx-facePanX)*newZ/oldZ;
      facePanY=my-(my-facePanY)*newZ/oldZ;
      setZoom(newZ);
    } else {
      // Shift+molette = défilement horizontal (pan)
      facePanX-=e.deltaY;draw();
    }
  },{passive:false});
  // Pan avec clic molette (bouton 1) ou Alt+drag gauche
  cv.addEventListener('mousedown',e=>{
    if(e.button===1||(e.button===0&&e.altKey)){
      e.preventDefault();
      const startX=e.clientX,startY=e.clientY,spX=facePanX,spY=facePanY;
      cv.style.cursor='grabbing';
      function onPan(ev){facePanX=spX+(ev.clientX-startX);facePanY=spY+(ev.clientY-startY);draw();}
      function onPanUp(){cv.style.cursor='default';document.removeEventListener('mousemove',onPan);document.removeEventListener('mouseup',onPanUp);}
      document.addEventListener('mousemove',onPan);document.addEventListener('mouseup',onPanUp);
      return;
    }
  });
  cv.addEventListener('mousedown',e=>{
    if(e.button!==0)return;
    const r=cv.getBoundingClientRect();
    const[wx,wy]=F2W(e.clientX-r.left,e.clientY-r.top);
    const[,cutPY]=W2F(0,cutLineY||0);
    const my=e.clientY-r.top;
    const px_=e.clientX-r.left,py_=e.clientY-r.top;
    // ── Cotes interactives (clic → input flottant éditable)
    if(FLAGS.cotes&&!wm.active){
      const chit=COTE_HITS.find(c=>c.r>0&&Math.hypot(px_-c.x,py_-c.y)<c.r);
      if(chit&&chit.onSubmit){
        const rect=cv.getBoundingClientRect();
        showCoteInput(rect.left+chit.x,rect.top+chit.y,chit.val,chit.min,chit.max,chit.onSubmit);
        return;
      }
    }
    // ── Points intermédiaires fils — drag libre ou insertion par clic segment
    if(!wm.active){
      // 1. Point intermédiaire existant → drag libre 2D
      let whit=null;
      for(const w of WIRES){
        for(let i=1;i<w.pts.length-1;i++){
          const[mx,my2]=W2F(w.pts[i][0],w.pts[i][1]);
          if(Math.hypot(px_-mx,py_-my2)<8){whit={w,i};break;}
        }
        if(whit)break;
      }
      if(whit){
        WIRES.forEach(w2=>w2.highlighted=w2===whit.w);
        wireDragging={wire:whit.w,ptIdx:whit.i};
        function onWPMove(ev){
          const[wx2,wy2]=F2W(ev.clientX-r.left,ev.clientY-r.top);
          wireDragging.wire.pts[wireDragging.ptIdx]=[wx2,wy2];
          draw();updateWT();
        }
        function onWPUp(){wireDragging=null;document.removeEventListener('mousemove',onWPMove);document.removeEventListener('mouseup',onWPUp);draw();updateWT();}
        document.addEventListener('mousemove',onWPMove);document.addEventListener('mouseup',onWPUp);
        return;
      }
      // 2. Clic sur un segment de fil → ajouter un point de dévoiement + drag immédiat
      let segHit=null,segHitW=null,segHitI=-1;
      for(const w of WIRES){
        for(let i=0;i<w.pts.length-1;i++){
          const[ax,ay]=W2F(w.pts[i][0],w.pts[i][1]);
          const[bx,by]=W2F(w.pts[i+1][0],w.pts[i+1][1]);
          if(ptSegDist(px_,py_,ax,ay,bx,by)<10){segHit=w;segHitI=i;break;}
        }
        if(segHit){segHitW=segHit;break;}
      }
      if(segHitW){
        WIRES.forEach(w2=>w2.highlighted=w2===segHitW);
        // Insérer un nouveau point à la position du clic
        const t=ptSegT(px_,py_,...W2F(segHitW.pts[segHitI][0],segHitW.pts[segHitI][1]),...W2F(segHitW.pts[segHitI+1][0],segHitW.pts[segHitI+1][1]));
        const newPt=[segHitW.pts[segHitI][0]+(segHitW.pts[segHitI+1][0]-segHitW.pts[segHitI][0])*t,
                     segHitW.pts[segHitI][1]+(segHitW.pts[segHitI+1][1]-segHitW.pts[segHitI][1])*t];
        segHitW.pts.splice(segHitI+1,0,newPt);
        wireDragging={wire:segHitW,ptIdx:segHitI+1};
        function onWPMv(ev){
          const[wx2,wy2]=F2W(ev.clientX-r.left,ev.clientY-r.top);
          wireDragging.wire.pts[wireDragging.ptIdx]=[wx2,wy2];
          draw();updateWT();
        }
        function onWPUp2(){wireDragging=null;document.removeEventListener('mousemove',onWPMv);document.removeEventListener('mouseup',onWPUp2);draw();updateWT();schedSave();}
        document.addEventListener('mousemove',onWPMv);document.addEventListener('mouseup',onWPUp2);
        draw();updateWT();return;
      }
    }
    // Clic sur œils → toggle direction
    const sc=getSc()*faceZoom,cy=cutPY;
    const x0=58+facePanX-18,x1=58+facePanX+getLayout().w*sc+18;
    if(Math.abs(my-cy)<10&&(Math.abs(e.clientX-r.left-x0)<14||Math.abs(e.clientX-r.left-x1)<14)){
      cutDir*=-1;draw();return;
    }
    // Coupes secondaires — drag ou suppression (× bouton)
    if(!wm.active){
      const sc2=getSc()*faceZoom,x1ec=58+facePanX+getLayout().w*sc2+18;
      for(const ec of EXTRA_CUTS){
        const[,ey]=W2F(0,ec.y||0);
        // Clic sur bouton × (à droite)
        if(Math.hypot(e.clientX-r.left-(x1ec+42),my-ey)<7){removeExtraCut(ec.id);return;}
        // Drag du trait
        if(Math.abs(my-ey)<8){cutDragId=ec.id;return;}
      }
    }
    // Trait de coupe principal
    if(Math.abs(my-cutPY)<8&&!wm.active){cutDragging=true;return;}
    // Mode fil — polyline : clic vide = ajouter waypoint, clic connexion = terminer
    if(wm.active){
      const nearest=nearestConnPt(wx,wy,wm.startP);
      if(!wm.startP){
        // Premier clic : sélectionner le point de départ (obligatoirement une connexion)
        if(!nearest)return;
        wm.startP=nearest.placed;wm.startPtId=nearest.pt.id;wm.prevX=wx;wm.prevY=wy;
        wm.waypoints=[];draw();return;
      }
      if(!nearest){
        // Clic dans l'espace vide → ajouter un waypoint manuel
        wm.waypoints.push([wx,wy]);wm.prevX=wx;wm.prevY=wy;draw();return;
      }
      // Clic sur un point de connexion → terminer le fil
      const sp=getConnPts(wm.startP).find(pt=>pt.id===wm.startPtId);
      if(sp&&nearest.placed!==wm.startP){
        const sec=SEC();
        const startPt=[sp.wx,sp.wy],endPt=[nearest.pt.wx,nearest.pt.wy];
        // Si pas de waypoints manuels → route automatique via goulotte
        // Sinon → polyline directe avec waypoints
        let pts;
        if(wm.waypoints.length===0){
          pts=routeWireStrict(startPt,endPt,wm.startP,nearest.placed,getLayout(),wm.startPtId,nearest.pt.id);
        } else {
          pts=[startPt,...wm.waypoints,endPt];
        }
        wireCount++;
        WIRES.push({id:`W${wireCount}`,section:sec,startP:wm.startP,startPtId:wm.startPtId,endP:nearest.placed,endPtId:nearest.pt.id,pts,highlighted:false});
        wm.startP=null;wm.startPtId=null;wm.waypoints=[];draw();updateWT();schedSave();
      }
      return;
    }
    // Sélection/drag
    const hit=PLACED.slice().reverse().find(p=>p.type==='comp'&&wx>=p.wx&&wx<=p.wx+p.comp.modW&&wy>=p.wy&&wy<=p.wy+p.comp.modH);
    selectedComp=hit||null;doorSelected=null;updateInfo();
    if(!hit){
      // Rail drag (décalage Y)
      const layout2=getLayout();
      const railHit=layout2.zones.find(z=>z.type==='rail'&&wx>=layout2.intX&&wx<=layout2.intX+layout2.intW&&wy>=z.y&&wy<z.y+z.h);
      if(railHit&&!wm.active){
        const startWY=wy,startOff=RAIL_OFFSETS[railHit.label]||0;
        // Limites : ne pas sortir de l'espace entre les goulottes adjacentes
        const above=layout2.zones.filter(z=>z.type==='goulH'&&z.y<railHit.y).pop();
        const below=layout2.zones.find(z=>z.type==='goulH'&&z.y>railHit.y);
        const minOff=above?above.y+above.h-(railHit.baseY||railHit.y)+2:-40;
        const maxOff=below?below.y-(railHit.baseY||railHit.y)-RAIL_H-2:40;
        function onRM(ev){
          const[,wy2]=F2W(ev.clientX-r.left,ev.clientY-r.top);
          const delta=wy2-startWY;
          RAIL_OFFSETS[railHit.label]=Math.round(Math.max(minOff,Math.min(startOff+delta,maxOff)));
          const nl=getLayout(),nr=nl.zones.find(z=>z.label===railHit.label);
          if(nr){PLACED.filter(p=>p.railRef?.label===railHit.label).forEach(p=>{p.wy=nr.y+(RAIL_H-p.comp.modH)/2;p.railRef=nr;});}
          draw();
        }
        function onRU(){document.removeEventListener('mousemove',onRM);document.removeEventListener('mouseup',onRU);}
        document.addEventListener('mousemove',onRM);document.addEventListener('mouseup',onRU);
        return;
      }
      draw();return;
    }
    dragging=hit;dragOffX=wx-hit.wx;dragOffY=wy-hit.wy;
    const idx=PLACED.indexOf(hit);PLACED.splice(idx,1);
    function onMove(ev){
      const[wx2,wy2]=F2W(ev.clientX-r.left,ev.clientY-r.top);
      const layout=getLayout();
      const{wx:nx,wy:ny,rail,band}=applySnap(wx2-dragOffX,wy2-dragOffY,hit.comp,layout);
      hit.wx=nx;hit.wy=ny;if(rail)hit.railRef=rail;if(band)hit.band=band;
      // Recalculer fils connectés
      WIRES.filter(w=>w.startP===hit||w.endP===hit).forEach(w=>{
        const sp=getConnPts(w.startP).find(pt=>pt.id===w.startPtId);
        const ep=getConnPts(w.endP).find(pt=>pt.id===w.endPtId);
        if(sp&&ep)w.pts=routeWireStrict([sp.wx,sp.wy],[ep.wx,ep.wy],w.startP,w.endP,layout,w.startPtId,w.endPtId);
      });
      draw();
    }
    function onUp(){PLACED.splice(idx,0,hit);dragging=null;document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);draw();updateWT();schedSave();}
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  });
  document.addEventListener('mouseup',()=>{
    if(cutDragging){cutDragging=false;draw();schedSave();}
    if(cutDragId!==null){cutDragId=null;draw();schedSave();}
  });
  cv.addEventListener('dblclick',e=>{
    if(wm.active)return;
    const r=cv.getBoundingClientRect();
    const[wx,wy]=F2W(e.clientX-r.left,e.clientY-r.top);
    const px_=e.clientX-r.left,py_=e.clientY-r.top;
    // Double-clic sur segment de fil → insérer un point de déviation
    for(const w of WIRES){
      for(let i=0;i<w.pts.length-1;i++){
        const[ax,ay]=W2F(w.pts[i][0],w.pts[i][1]);
        const[bx,by]=W2F(w.pts[i+1][0],w.pts[i+1][1]);
        if(ptSegDist(px_,py_,ax,ay,bx,by)<8){
          const t=ptSegT(px_,py_,ax,ay,bx,by);
          w.pts.splice(i+1,0,[w.pts[i][0]+(w.pts[i+1][0]-w.pts[i][0])*t,
                               w.pts[i][1]+(w.pts[i+1][1]-w.pts[i][1])*t]);
          WIRES.forEach(w2=>w2.highlighted=w2===w);
          draw();updateWT();return;
        }
      }
    }
    // Double-clic sur composant → renommer
    const idx=PLACED.findIndex(p=>p.type==='comp'&&wx>=p.wx&&wx<=p.wx+p.comp.modW&&wy>=p.wy&&wy<=p.wy+p.comp.modH);
    if(idx>=0){
      const r2=cv.getBoundingClientRect();
      const[cpx,cpy]=W2F(PLACED[idx].wx+PLACED[idx].comp.modW/2,PLACED[idx].wy);
      showLabelInput(r2.left+cpx,r2.top+cpy,PLACED[idx].label,l=>{if(l!==undefined){PLACED[idx].label=l;draw();updateWT();schedSave();}});
    }
  });
  cv.addEventListener('contextmenu',e=>{
    e.preventDefault();
    const r=cv.getBoundingClientRect();
    const[wx,wy]=F2W(e.clientX-r.left,e.clientY-r.top);
    const px_=e.clientX-r.left,py_=e.clientY-r.top;
    // Clic droit sur un point intermédiaire de fil → supprimer ce point
    for(const w of WIRES){
      for(let i=1;i<w.pts.length-1;i++){
        const[mx,my2]=W2F(w.pts[i][0],w.pts[i][1]);
        if(Math.hypot(px_-mx,py_-my2)<8){w.pts.splice(i,1);draw();updateWT();schedSave();return;}
      }
    }
    // Clic droit sur un fil → supprimer le fil entier
    for(let wi=WIRES.length-1;wi>=0;wi--){
      const w=WIRES[wi];
      for(let i=0;i<w.pts.length-1;i++){
        const[ax,ay]=W2F(w.pts[i][0],w.pts[i][1]);
        const[bx,by]=W2F(w.pts[i+1][0],w.pts[i+1][1]);
        if(ptSegDist(px_,py_,ax,ay,bx,by)<6){
          if(confirm(`Supprimer le fil ${w.id} ?`)){WIRES.splice(wi,1);draw();updateWT();schedSave();}
          return;
        }
      }
    }
    // Clic droit sur composant → supprimer
    const idx=PLACED.findIndex(p=>p.type==='comp'&&wx>=p.wx&&wx<=p.wx+p.comp.modW&&wy>=p.wy&&wy<=p.wy+p.comp.modH);
    if(idx>=0&&confirm('Supprimer ce composant ?')){
      const rm=PLACED[idx];PLACED.splice(idx,1);
      for(let i=WIRES.length-1;i>=0;i--){if(WIRES[i].startP===rm||WIRES[i].endP===rm)WIRES.splice(i,1);}
      if(selectedComp===rm)selectedComp=null;draw();updateWT();updateInfo();schedSave();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════
// INTERACTIONS CANVAS PLAN
// ═══════════════════════════════════════════════════════════════════════
function setupPlanCanvas(){
  const cv=document.getElementById('cv-plan');
  cv.addEventListener('mousemove',e=>{
    const r=cv.getBoundingClientRect();
    const my=e.clientY-r.top;
    // Hover poignées gorge
    const mx0=e.clientX-r.left;
    if(planViewMeta&&planViewMeta.handles&&planViewMeta.handles.length){
      const near=planViewMeta.handles.find(h=>Math.abs(my-h.canvasY)<7);
      if(near){cv.style.cursor='ns-resize';return;}
    }
    // Hover cotes cliquables coupe
    if(FLAGS.cotes&&PLAN_COTE_HITS.some(c=>Math.hypot(mx0-c.x,my-c.y)<c.r)){cv.style.cursor='text';return;}
    // Hover composants dans coupe
    const layout=getLayout();const{w,h,zones}=layout;
    const mx=e.clientX-r.left;
    const cutY=Math.max(-CUT_EXT,Math.min(cutLineY||h/2,h+CUT_EXT));
    const zone=zones.find(z=>z.type==='rail'&&cutY>=z.y&&cutY<z.y+z.h);
    if(!zone){cv.style.cursor='default';return;}
    const scX=getSc(),flip=cutDir<0,OX=46;
    const worldX=flip?(w-(mx-OX)/scX):(mx-OX)/scX;
    const hit=PLACED.find(p=>p.type==='comp'&&p.railRef?.label===zone.label&&cutY>=p.wy&&cutY<=p.wy+p.comp.modH&&worldX>=p.wx&&worldX<=p.wx+p.comp.modW);
    cv.style.cursor=hit?'pointer':'default';
  });
  cv.addEventListener('mousedown',e=>{
    const r=cv.getBoundingClientRect();
    const mx=e.clientX-r.left,my=e.clientY-r.top;
    // ── Cotes plan cliquables (épaisseur, profondeur gorge…)
    if(FLAGS.cotes&&PLAN_COTE_HITS.length){
      const chit=PLAN_COTE_HITS.find(c=>Math.hypot(mx-c.x,my-c.y)<c.r);
      if(chit&&chit.onSubmit){showCoteInput(r.left+chit.x,r.top+chit.y,chit.val,chit.min,chit.max,chit.onSubmit);return;}
    }
    // Drag poignées gorge / profondeur / position rail Z
    if(planViewMeta&&planViewMeta.handles){
      const near=planViewMeta.handles.find(h=>Math.abs(my-h.canvasY)<7);
      if(near){
        planDepthDrag={zoneLabel:near.zoneLabel,type:near.type||'depth'};
        const{scZ,OZ}=near;
        if(near.type==='railZ'){
          const{minZ,maxZ}=near;
          const onPD2=ev=>{const nY=ev.clientY-r.top-OZ;RAIL_FRONT_Z[near.zoneLabel]=Math.round(Math.max(minZ,Math.min(nY/scZ,maxZ)));draw();};
          const onPU2=()=>{planDepthDrag=null;document.removeEventListener('mousemove',onPD2);document.removeEventListener('mouseup',onPU2);draw();};
          document.addEventListener('mousemove',onPD2);document.addEventListener('mouseup',onPU2);
        } else {
          const{minD,maxD}=near;
          const onPD=ev=>{const nY=ev.clientY-r.top-OZ;ZONE_DEPTHS[near.zoneLabel]=Math.round(Math.max(minD,Math.min(nY/scZ,maxD)));draw();};
          const onPU=()=>{planDepthDrag=null;document.removeEventListener('mousemove',onPD);document.removeEventListener('mouseup',onPU);draw();};
          document.addEventListener('mousemove',onPD);document.addEventListener('mouseup',onPU);
        }
        return;
      }
    }
    // Clic sur composant dans coupe → sélection
    if(mx<30||mx>r.width-30){cutDir*=-1;draw();return;}
    const layout=getLayout();const{w,h,zones}=layout;
    const cutY=Math.max(-CUT_EXT,Math.min(cutLineY||h/2,h+CUT_EXT));
    const zone=zones.find(z=>z.type==='rail'&&cutY>=z.y&&cutY<z.y+z.h);
    if(!zone)return;
    const scX=getSc(),flip=cutDir<0,OX=46;
    const worldX=flip?(w-(mx-OX)/scX):(mx-OX)/scX;
    const hit=PLACED.find(p=>p.type==='comp'&&p.railRef?.label===zone.label&&cutY>=p.wy&&cutY<=p.wy+p.comp.modH&&worldX>=p.wx&&worldX<=p.wx+p.comp.modW);
    selectedComp=hit||null;doorSelected=null;draw();updateInfo();
  });
}

// ═══════════════════════════════════════════════════════════════════════
// INTERACTIONS CANVAS PORTE
// ═══════════════════════════════════════════════════════════════════════
function setupDoorCanvas(){
  const cv=document.getElementById('cv-door');
  function dCoords(e){const sc=getSc(),r=cv.getBoundingClientRect();return[(e.clientX-r.left-40)/sc,(e.clientY-r.top-20)/sc];}
  function dHit(wx,wy){return DOOR_PLACED.slice().reverse().find(p=>p.type==='comp'&&wx>=p.wx&&wx<=p.wx+p.comp.modW&&wy>=p.wy&&wy<=p.wy+p.comp.modH)||null;}
  cv.addEventListener('mousemove',e=>{
    if(!doorVisible)return;
    const[wx,wy]=dCoords(e);
    if(doorDragging){
      const{w,h}=getLayout();
      doorDragging.wx=Math.max(0,Math.min(wx-doorDragOX,w-doorDragging.comp.modW));
      doorDragging.wy=Math.max(0,Math.min(wy-doorDragOY,h-doorDragging.comp.modH));
      draw();return;
    }
    const oldH=doorHovered;doorHovered=dHit(wx,wy);
    cv.style.cursor=doorHovered?'grab':'default';
    if(oldH!==doorHovered)draw();
  });
  cv.addEventListener('mousedown',e=>{
    if(!doorVisible||e.button!==0)return;
    const[wx,wy]=dCoords(e);const hit=dHit(wx,wy);if(!hit)return;
    e.preventDefault();
    doorSelected=hit;doorDragging=hit;doorDragOX=wx-hit.wx;doorDragOY=wy-hit.wy;
    selectedComp=null;draw();updateInfo();
    function onUp(){doorDragging=null;document.removeEventListener('mouseup',onUp);draw();}
    document.addEventListener('mouseup',onUp);
  });
  cv.addEventListener('dblclick',e=>{
    if(!doorVisible)return;
    const[wx,wy]=dCoords(e);
    const idx=DOOR_PLACED.findIndex(p=>p.type==='comp'&&wx>=p.wx&&wx<=p.wx+p.comp.modW&&wy>=p.wy&&wy<=p.wy+p.comp.modH);
    if(idx>=0){
      const r2=cv.getBoundingClientRect();
      showLabelInput(e.clientX,e.clientY,DOOR_PLACED[idx].label,l=>{if(l!==undefined){DOOR_PLACED[idx].label=l;draw();updateInfo();}});
    }
  });
  cv.addEventListener('contextmenu',e=>{
    e.preventDefault();if(!doorVisible)return;
    const[wx,wy]=dCoords(e);
    const idx=DOOR_PLACED.findIndex(p=>p.type==='comp'&&wx>=p.wx&&wx<=p.wx+p.comp.modW&&wy>=p.wy&&wy<=p.wy+p.comp.modH);
    if(idx>=0&&confirm('Supprimer ce voyant ?')){DOOR_PLACED.splice(idx,1);doorHovered=null;doorSelected=null;draw();updateInfo();}
  });
  cv.addEventListener('mouseleave',()=>{doorHovered=null;if(!doorDragging)draw();});
}

// ═══════════════════════════════════════════════════════════════════════
// CLAVIER
// ═══════════════════════════════════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){wm={active:false,startP:null,startPtId:null,prevX:0,prevY:0,waypoints:[]};selectedComp=null;doorSelected=null;document.getElementById('btn-fil').classList.remove('wire-on');draw();updateInfo();return;}
  // Undo / Redo
  if(e.ctrlKey&&e.key.toLowerCase()==='z'&&!e.shiftKey&&document.activeElement===document.body){e.preventDefault();undo();return;}
  if(e.ctrlKey&&(e.key.toLowerCase()==='y'||(e.key.toLowerCase()==='z'&&e.shiftKey))&&document.activeElement===document.body){e.preventDefault();redo();return;}
  // Zoom clavier Ctrl+0 (reset), Ctrl+= (in), Ctrl+- (out)
  if(e.ctrlKey&&(e.key==='0'||e.key==='Numpad0')){e.preventDefault();zoomFit();return;}
  if(e.ctrlKey&&(e.key==='='||e.key==='+')){e.preventDefault();setZoom(faceZoom*1.18);return;}
  if(e.ctrlKey&&e.key==='-'){e.preventDefault();setZoom(faceZoom/1.18);return;}
  // Raccourci W → mode fil
  if(e.key==='w'&&!e.ctrlKey&&document.activeElement===document.body){togWire();return;}
  if(e.ctrlKey&&e.key.toLowerCase()==='c'&&selectedComp)clipboard={comp:selectedComp.comp,label:selectedComp.label};
  if(e.ctrlKey&&e.key.toLowerCase()==='v'&&clipboard){
    const layout=getLayout();
    const ref=selectedComp||PLACED.filter(p=>p.comp===clipboard.comp).slice(-1)[0];
    const bx=ref?ref.wx+ref.comp.modW+1:layout.intX;
    const by=ref?ref.wy:layout.zones.find(z=>z.type==='rail')?.y||100;
    const{wx,wy,noSpace,rail,band}=applySnap(bx,by,clipboard.comp,layout);
    if(!noSpace){const np={comp:clipboard.comp,wx,wy,type:'comp',label:autoLabel(clipboard.comp),railRef:rail||null,band:band||null};PLACED.push(np);selectedComp=np;draw();updateWT();schedSave();}
  }
  // Ctrl+D : dupliquer le composant sélectionné
  if(e.ctrlKey&&e.key.toLowerCase()==='d'&&selectedComp&&document.activeElement===document.body){
    e.preventDefault();
    clipboard={comp:selectedComp.comp,label:selectedComp.label};
    const layout=getLayout();
    const bx=selectedComp.wx+selectedComp.comp.modW+1;
    const by=selectedComp.wy;
    const{wx,wy,noSpace,rail,band}=applySnap(bx,by,clipboard.comp,layout);
    if(!noSpace){const np={comp:clipboard.comp,wx,wy,type:'comp',label:autoLabel(clipboard.comp),railRef:rail||null,band:band||null};PLACED.push(np);selectedComp=np;draw();updateWT();schedSave();}
    return;
  }
  if((e.key==='Delete'||e.key==='Backspace')&&selectedComp&&document.activeElement===document.body){
    const idx=PLACED.indexOf(selectedComp);
    if(idx>=0){
      PLACED.splice(idx,1);
      for(let i=WIRES.length-1;i>=0;i--){if(WIRES[i].startP===selectedComp||WIRES[i].endP===selectedComp)WIRES.splice(i,1);}
      selectedComp=null;draw();updateWT();updateInfo();
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════
// RESIZE HANDLES — redimensionnement des panneaux latéraux
// ═══════════════════════════════════════════════════════════════════════
function setupResize(handleId,targetId,side,minW,maxW){
  const handle=document.getElementById(handleId);
  if(!handle)return;
  handle.addEventListener('mousedown',e=>{
    e.preventDefault();
    const target=document.getElementById(targetId);
    const startX=e.clientX,startW=target.getBoundingClientRect().width;
    handle.classList.add('dragging');
    function onMove(ev){
      const delta=side==='left'?ev.clientX-startX:startX-ev.clientX;
      const nw=Math.max(minW,Math.min(maxW,startW+delta));
      target.style.width=nw+'px';target.style.flexShrink='0';
      draw(); // redessine pour adapter les canvas
    }
    function onUp(){handle.classList.remove('dragging');document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// UNDO / REDO
// ═══════════════════════════════════════════════════════════════════════
const HISTORY=[];
let historyIdx=-1;
let _inRestore=false;

function _captureState(){
  return JSON.stringify({
    placed:PLACED.map(p=>({id:p.comp.id,wx:p.wx,wy:p.wy,label:p.label,railLabel:p.railRef?.label||null,band:p.band||null})),
    doorPlaced:DOOR_PLACED.map(p=>({id:p.comp.id,wx:p.wx,wy:p.wy,label:p.label})),
    wires:WIRES.map(w=>({id:w.id,section:w.section,color:w.color,wtype:w.wtype,
      sLabel:w.startP?.label||null,sPtId:w.startPtId,eLabel:w.endP?.label||null,ePtId:w.endPtId,pts:w.pts})),
    railOffsets:{...RAIL_OFFSETS},zoneDepths:{...ZONE_DEPTHS},railFrontZ:{...RAIL_FRONT_Z},
    cutLineY,cutDir,extraCuts:EXTRA_CUTS.map(c=>({...c})),extraCutNext,
    wireCount,peCount,voyantCount
  });
}

function snapshot(){
  if(_inRestore)return;
  if(historyIdx<HISTORY.length-1)HISTORY.splice(historyIdx+1);
  HISTORY.push(_captureState());
  if(HISTORY.length>60){HISTORY.shift();}else{historyIdx++;}
}

function _applyState(s){
  _inRestore=true;
  const d=JSON.parse(s),layout=getLayout();
  PLACED.length=0;
  (d.placed||[]).forEach(p=>{
    const comp=COMPS.find(c=>c.id===p.id);if(!comp)return;
    const railRef=layout.zones.find(z=>z.label===p.railLabel)||null;
    PLACED.push({comp,wx:p.wx,wy:p.wy,label:p.label,type:'comp',railRef,band:p.band||null});
  });
  DOOR_PLACED.length=0;
  (d.doorPlaced||[]).forEach(p=>{
    const comp=COMPS.find(c=>c.id===p.id);if(!comp)return;
    DOOR_PLACED.push({comp,wx:p.wx,wy:p.wy,label:p.label,type:'comp'});
  });
  for(const k in RAIL_OFFSETS)delete RAIL_OFFSETS[k];
  for(const k in ZONE_DEPTHS)delete ZONE_DEPTHS[k];
  for(const k in RAIL_FRONT_Z)delete RAIL_FRONT_Z[k];
  Object.assign(RAIL_OFFSETS,d.railOffsets||{});
  Object.assign(ZONE_DEPTHS,d.zoneDepths||{});
  Object.assign(RAIL_FRONT_Z,d.railFrontZ||{});
  cutLineY=d.cutLineY??null;cutDir=d.cutDir??1;
  EXTRA_CUTS.length=0;(d.extraCuts||[]).forEach(c=>EXTRA_CUTS.push({...c}));
  extraCutNext=d.extraCutNext||2;
  wireCount=d.wireCount||0;peCount=d.peCount||0;voyantCount=d.voyantCount||0;
  const all=[...PLACED,...DOOR_PLACED];WIRES.length=0;
  (d.wires||[]).forEach(w=>{
    const startP=all.find(p=>p.label===w.sLabel)||null;
    const endP=all.find(p=>p.label===w.eLabel)||null;
    WIRES.push({id:w.id,section:w.section||2.5,color:w.color||'#C47820',wtype:w.wtype||'H07V-K',
      startP,startPtId:w.sPtId,endP,endPtId:w.ePtId,pts:w.pts||[],highlighted:false});
  });
  selectedComp=null;doorSelected=null;
  _inRestore=false;
  draw();updateWT();updateInfo();saveSession();
}

function undo(){if(historyIdx>0){historyIdx--;_applyState(HISTORY[historyIdx]);}}
function redo(){if(historyIdx<HISTORY.length-1){historyIdx++;_applyState(HISTORY[historyIdx]);}}

// ═══════════════════════════════════════════════════════════════════════
// SAUVEGARDE SESSION (localStorage)
// ═══════════════════════════════════════════════════════════════════════
let _saveTmr=null;
function schedSave(){snapshot();clearTimeout(_saveTmr);_saveTmr=setTimeout(saveSession,800);}

function saveSession(){
  try{
    const data={
      v:2,ts:Date.now(),
      model:document.getElementById('sel-model').value,
      nbApp:document.getElementById('nb-app').value,
      nbBorn:document.getElementById('nb-born').value,
      ghH:document.getElementById('gh-h').value,
      espR:document.getElementById('esp-r').value,
      thickness:document.getElementById('thickness').value,
      doorGap:document.getElementById('door-gap')?.value||500,
      doorVisible,cutLineY,cutDir,wireCount,peCount,voyantCount,
      extraCuts:EXTRA_CUTS.map(c=>({...c})),extraCutNext,
      railOffsets:{...RAIL_OFFSETS},zoneDepths:{...ZONE_DEPTHS},railFrontZ:{...RAIL_FRONT_Z},
      placed:PLACED.map(p=>({id:p.comp.id,wx:p.wx,wy:p.wy,label:p.label,railLabel:p.railRef?.label||null,band:p.band||null})),
      doorPlaced:DOOR_PLACED.map(p=>({id:p.comp.id,wx:p.wx,wy:p.wy,label:p.label})),
      wires:WIRES.map(w=>({id:w.id,section:w.section,color:w.color,wtype:w.wtype,
        sLabel:w.startP?.label||null,sPtId:w.startPtId,eLabel:w.endP?.label||null,ePtId:w.endPtId,pts:w.pts}))
    };
    localStorage.setItem('ep_v2',JSON.stringify(data));
    const el=document.getElementById('_save_lbl');
    if(el){el.textContent='💾 '+new Date().toLocaleTimeString('fr');el.style.color='#1D9E75';}
  }catch(e){}
}

function loadSession(){
  try{
    const raw=localStorage.getItem('ep_v2');if(!raw)return false;
    const d=JSON.parse(raw);if(!d||d.v!==2)return false;
    ['sel-model','nb-app','nb-born','gh-h','esp-r','thickness'].forEach(id=>{
      if(d[{sel:'model','nb-app':'nbApp','nb-born':'nbBorn','gh-h':'ghH','esp-r':'espR',thickness:'thickness'}[id]||id.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]!==undefined)
        document.getElementById(id).value=d[id.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())];
    });
    // plus simple :
    if(d.model)document.getElementById('sel-model').value=d.model;
    if(d.nbApp)document.getElementById('nb-app').value=d.nbApp;
    if(d.nbBorn)document.getElementById('nb-born').value=d.nbBorn;
    if(d.ghH)document.getElementById('gh-h').value=d.ghH;
    if(d.espR)document.getElementById('esp-r').value=d.espR;
    if(d.thickness)document.getElementById('thickness').value=d.thickness;
    if(d.doorGap&&document.getElementById('door-gap'))document.getElementById('door-gap').value=d.doorGap;
    Object.assign(RAIL_OFFSETS,d.railOffsets||{});Object.assign(ZONE_DEPTHS,d.zoneDepths||{});Object.assign(RAIL_FRONT_Z,d.railFrontZ||{});
    cutLineY=d.cutLineY??null;cutDir=d.cutDir??1;
    EXTRA_CUTS.length=0;(d.extraCuts||[]).forEach(c=>EXTRA_CUTS.push({...c}));
    extraCutNext=d.extraCutNext||2;
    wireCount=d.wireCount||0;peCount=d.peCount||0;voyantCount=d.voyantCount||0;
    if(d.doorVisible){doorVisible=true;document.getElementById('btn-door').classList.add('door-on');}
    // Restituer composants
    const layout=getLayout();
    PLACED.length=0;
    (d.placed||[]).forEach(p=>{
      const comp=COMPS.find(c=>c.id===p.id);if(!comp)return;
      const railRef=layout.zones.find(z=>z.label===p.railLabel)||null;
      PLACED.push({comp,wx:p.wx,wy:p.wy,label:p.label,type:'comp',railRef,band:p.band||null});
    });
    DOOR_PLACED.length=0;
    (d.doorPlaced||[]).forEach(p=>{
      const comp=COMPS.find(c=>c.id===p.id);if(!comp)return;
      DOOR_PLACED.push({comp,wx:p.wx,wy:p.wy,label:p.label,type:'comp'});
    });
    // Restituer fils (reconnexion par label)
    const allPlaced=[...PLACED,...DOOR_PLACED];
    WIRES.length=0;
    (d.wires||[]).forEach(w=>{
      const startP=allPlaced.find(p=>p.label===w.sLabel)||null;
      const endP=allPlaced.find(p=>p.label===w.eLabel)||null;
      WIRES.push({id:w.id,section:w.section||2.5,color:w.color||'#C47820',wtype:w.wtype||'H07V-K',
        startP,startPtId:w.sPtId,endP,endPtId:w.ePtId,pts:w.pts||[],highlighted:false});
    });
    return true;
  }catch(e){console.warn('loadSession:',e);return false;}
}
