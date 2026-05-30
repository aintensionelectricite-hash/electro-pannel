// ═══════════════════════════════════════════════════════════════════════
// RAIL DIN — profil oméga métallique
// ═══════════════════════════════════════════════════════════════════════
function drawRailDIN(ctx,sx,sy,sw,z,intX,intW,sc){
  const rx=sx(intX),ry=sy(z.y),rw=sw(intW),rh=sw(z.h);
  const mg=ctx.createLinearGradient(rx,ry,rx,ry+rh);
  mg.addColorStop(0,'#AAAAAA');mg.addColorStop(.1,'#D2D2D2');mg.addColorStop(.3,'#EEEEEE');
  mg.addColorStop(.5,'#FAFAFA');mg.addColorStop(.7,'#E5E5E5');mg.addColorStop(.9,'#C5C5C5');mg.addColorStop(1,'#A5A5A5');
  ctx.fillStyle=mg;rr(ctx,rx,ry,rw,rh,2);ctx.fill();
  const fh=Math.max(2,rh*.16);
  const tg=ctx.createLinearGradient(rx,ry,rx,ry+fh);tg.addColorStop(0,'#888');tg.addColorStop(1,'#CCC');
  ctx.fillStyle=tg;ctx.fillRect(rx,ry,rw,fh);
  const bg=ctx.createLinearGradient(rx,ry+rh-fh,rx,ry+rh);bg.addColorStop(0,'#C0C0C0');bg.addColorStop(1,'#888');
  ctx.fillStyle=bg;ctx.fillRect(rx,ry+rh-fh,rw,fh);
  ctx.fillStyle='rgba(0,0,0,.05)';ctx.fillRect(rx,ry+rh*.36,rw,rh*.28);
  const hW=Math.max(2.5,sw(7)),hH=Math.max(3.5,sw(11)),hCY=ry+rh*.5;
  for(let hx=sx(intX+12.5);hx<rx+rw-hW;hx+=sw(25)){
    ctx.fillStyle='#767676';ctx.beginPath();ctx.ellipse(hx,hCY,hW/2,hH/2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#545454';ctx.beginPath();ctx.ellipse(hx,hCY,hW*.28,hH*.28,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.2)';ctx.beginPath();ctx.ellipse(hx,hCY-hH*.13,hW*.3,hH*.19,0,0,Math.PI*2);ctx.fill();
  }
  ctx.strokeStyle='#909090';ctx.lineWidth=.7;rr(ctx,rx,ry,rw,rh,2);ctx.stroke();
  if(rh>7){
    const fs=Math.max(6,Math.round(rh*.33));
    ctx.font=`500 ${fs}px system-ui`;ctx.fillStyle='#686868';ctx.textAlign='left';
    ctx.fillText(z.label,rx+5,ry+rh*.5+fs*.35);
    ctx.textAlign='right';ctx.fillStyle='#A8A8A8';ctx.font=`${fs*.8}px system-ui`;
    ctx.fillText(z.sub==='born'?'Born.':'App.',rx+rw-5,ry+rh*.5+fs*.35);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// GOULOTTE VERTICALE
// ═══════════════════════════════════════════════════════════════════════
function drawVertGoul(ctx,x,y,w,h,label){
  ctx.fillStyle='#FAECE7';ctx.strokeStyle='#D85A30';ctx.lineWidth=.7;
  rr(ctx,x,y,w,h,2);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(216,90,48,.25)';ctx.lineWidth=.35;
  for(let iy=y+12;iy<y+h-6;iy+=12){ctx.beginPath();ctx.moveTo(x+3,iy);ctx.lineTo(x+w-3,iy);ctx.stroke();}
  if(h>40){
    const fs=Math.max(7,Math.round(w*.22));
    ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(-Math.PI/2);
    ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='#C05020';ctx.textAlign='center';
    ctx.fillText(label,0,fs*.35);ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════════
// VUES PLAQUE HAUTE / BASSE (presse-étoupes)
// ═══════════════════════════════════════════════════════════════════════
function drawPlateView(which,layout){
  const{m,w,h,intX,intW}=layout;
  const cvId=which==='top'?'cv-top':'cv-bot';
  const band=which==='top'?'top':'bottom';
  const sc=getSc(),scZ=3; // profondeur plate = m, affiché 3× agrandi
  const PW=Math.round(w*sc)+90,PH=Math.round(m*scZ)+55;
  const cv=document.getElementById(cvId);
  cv.width=PW;cv.height=PH;cv.style.width=PW+'px';cv.style.height=PH+'px';
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,PW,PH);
  const OX=46,OZ=14;
  function px(x){return OX+x*sc}function pw(v){return v*sc}function pd(v){return v*scZ}

  // Tôle
  const tg=ctx.createLinearGradient(OX,OZ,OX,OZ+pd(m));
  tg.addColorStop(0,'#9598A8');tg.addColorStop(1,'#7A7D8C');
  ctx.fillStyle=tg;ctx.fillRect(OX,OZ,pw(w),pd(m));
  ctx.strokeStyle='#565868';ctx.lineWidth=1;ctx.strokeRect(OX,OZ,pw(w),pd(m));

  // Bande intérieure
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(px(intX),OZ,pw(intW),pd(m));

  // PE
  PLACED.filter(p=>p.comp?.type==='petoupe'&&p.band===band).forEach(p=>{
    const cx=px(p.wx+p.comp.modW/2),cz=OZ+pd(m/2);
    const r=Math.max(2,pw(p.comp.modW/2));
    // Trou
    ctx.fillStyle='#222';ctx.beginPath();ctx.arc(cx,cz,r,0,Math.PI*2);ctx.fill();
    // Corps presse-étoupe
    const rg=ctx.createRadialGradient(cx-r*.2,cz-r*.2,r*.1,cx,cz,r);
    rg.addColorStop(0,'rgba(220,220,220,.8)');rg.addColorStop(.6,'rgba(140,140,140,.8)');
    rg.addColorStop(1,'rgba(80,80,80,.8)');
    ctx.fillStyle=rg;ctx.beginPath();ctx.arc(cx,cz,r*.85,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#505050';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(cx,cz,r*.85,0,Math.PI*2);ctx.stroke();
    // Label
    const fs=Math.max(5,Math.round(r*.55));
    ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='#FFF';ctx.textAlign='center';
    ctx.fillText(p.label||'PE?',cx,OZ-4);
    ctx.font=`${fs*.85}px system-ui`;ctx.fillStyle='#CCC';
    ctx.fillText(`ISO${p.comp.isoD}`,cx,OZ+pd(m)+12);
  });
  // Label vue
  ctx.font='bold 8.5px system-ui';ctx.fillStyle='#7A7D8C';ctx.textAlign='left';
  ctx.fillText(`Vue plaque ${which==='top'?'haute (GV haut)':'basse (GV bas)'} — Ø perçages PE`,OX,OZ+pd(m)+24);
}

// ═══════════════════════════════════════════════════════════════════════
// VUE PORTE
// ═══════════════════════════════════════════════════════════════════════
function drawDoorView(layout){
  const{m,w,h}=layout;
  const sc=getSc();
  const DW=Math.round(w*sc)+80,DH=Math.round(h*sc)+60;
  const cv=document.getElementById('cv-door');
  cv.width=DW;cv.height=DH;cv.style.width=DW+'px';cv.style.height=DH+'px';
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,DW,DH);
  function sx(v){return 40+v*sc}function sy(v){return 20+v*sc}function sw(v){return v*sc}

  // Porte
  const pg=ctx.createLinearGradient(sx(0),sy(0),sx(w),sy(h));
  pg.addColorStop(0,'#C8D8E8');pg.addColorStop(1,'#A8BCCC');
  ctx.fillStyle=pg;ctx.strokeStyle='#6080A0';ctx.lineWidth=1.5;
  rr(ctx,sx(0),sy(0),sw(w),sw(h),8);ctx.fill();ctx.stroke();

  // Zone signalisation (en haut de la porte, 120mm de haut)
  const zoneH=120;
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.strokeStyle='#8090A0';ctx.lineWidth=.7;
  ctx.setLineDash([4,3]);rr(ctx,sx(m),sy(m),sw(w-2*m),sw(zoneH),4);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  ctx.font='500 9px system-ui';ctx.fillStyle='rgba(80,100,120,.8)';ctx.textAlign='center';
  ctx.fillText('Zone signalisation (voyants)',sx(w/2),sy(m+10));

  // Poignée
  ctx.fillStyle='rgba(200,210,220,.8)';ctx.strokeStyle='#507090';ctx.lineWidth=.7;
  rr(ctx,sx(w-m-14),sy(h/2-40),sw(10),sw(80),3);ctx.fill();ctx.stroke();

  // Voyants posés
  DOOR_PLACED.forEach(p=>{
    if(p.type!=='comp')return;
    drawVoyant(ctx,p,sc,sx,sy);
    if(p===doorHovered||p===doorSelected){
      const cvx=sx(p.wx+p.comp.modW/2),cvy=sy(p.wy+p.comp.modH/2),rv=p.comp.modW*sc/2;
      ctx.strokeStyle=p===doorSelected?'#185FA5':'rgba(24,95,165,.55)';ctx.lineWidth=1.8;ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.arc(cvx,cvy,rv+4,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    }
  });

  // Points d'accrochage (hover porte)
  if(doorHovered){
    getConnPts(doorHovered).forEach(pt=>{
      const[px2,py2]=[sx(0)+pt.wx*sc,sy(0)+pt.wy*sc];
      ctx.fillStyle='rgba(255,140,0,.88)';ctx.beginPath();ctx.arc(px2,py2,5,0,Math.PI*2);ctx.fill();
    });
  }

  // Label
  ctx.font='bold 10px system-ui';ctx.fillStyle='#6B3DA6';ctx.textAlign='center';
  ctx.fillText('VUE PORTE — Glisser voyants depuis bibliothèque',sx(w/2),DH-10);
}

function drawVoyant(ctx,p,sc,sx,sy){
  const c=p.comp;
  const cx=sx(p.wx+c.modW/2),cy=sy(p.wy+c.modH/2);
  const r=c.modW*sc/2;
  // Corps
  const rg=ctx.createRadialGradient(cx-r*.3,cy-r*.3,r*.05,cx,cy,r);
  rg.addColorStop(0,c.color+'FF');rg.addColorStop(.6,c.color+'CC');
  rg.addColorStop(1,c.color+'88');
  ctx.fillStyle=rg;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  // Anneau
  ctx.strokeStyle='#333';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
  // Brillance
  ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.arc(cx-r*.28,cy-r*.28,r*.32,0,Math.PI*2);ctx.fill();
  // Label
  const fs=Math.max(6,Math.round(r*.5));
  ctx.font=`bold ${fs}px system-ui`;ctx.fillStyle='#fff';ctx.textAlign='center';
  ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.5;
  ctx.strokeText(p.label||'V?',cx,cy+fs*.35);ctx.fillText(p.label||'V?',cx,cy+fs*.35);
}

// ═══════════════════════════════════════════════════════════════════════
// DESSIN FIL
// ═══════════════════════════════════════════════════════════════════════
function drawWire(ctx,wire,sc,layout){
  if(!wire.pts||wire.pts.length<2)return;
  const sec=wire.section,minR=BEND_R[sec]||20;
  const lw=Math.max(1.2,wireR(sec)*sc*2),hl=wire.highlighted;
  const wCol=wire.color||'#C47820';
  // Halo blanc pour visibilité maximale sur tout fond (capot ou fond)
  ctx.strokeStyle=hl?'rgba(255,180,0,.7)':'rgba(255,255,255,0.75)';
  ctx.lineWidth=lw+3;ctx.lineCap='round';ctx.lineJoin='round';
  drawSpline(ctx,wire.pts,minR,sc);ctx.stroke();
  // Fil couleur réelle
  ctx.strokeStyle=hl?'#FF9500':wCol;ctx.lineWidth=lw;
  drawSpline(ctx,wire.pts,minR,sc);ctx.stroke();
  ctx.lineCap='butt';
  // Points départ/arrivée
  [[wire.pts[0][0],wire.pts[0][1]],[wire.pts[wire.pts.length-1][0],wire.pts[wire.pts.length-1][1]]].forEach(([wx2,wy2])=>{
    const[px,py]=W2F(wx2,wy2);
    ctx.fillStyle=hl?'#FF9500':'#8B5C00';ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();
  });
  // Points intermédiaires : toujours visibles (petits), grands+numérotés si surligné
  if(wire.pts.length>2){
    wire.pts.slice(1,-1).forEach((pt,idx)=>{
      const[mx,my]=W2F(pt[0],pt[1]);
      if(hl){
        // Grand handle orange avec numéro
        ctx.fillStyle='rgba(255,145,0,.95)';ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(mx,my,5,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.font='bold 6px system-ui';ctx.fillStyle='#fff';ctx.textAlign='center';
        ctx.fillText(idx+2,mx,my+2.2);
      } else {
        // Petit point discret toujours visible
        ctx.fillStyle='rgba(160,90,10,.55)';ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(mx,my,2.5,0,Math.PI*2);ctx.fill();ctx.stroke();
      }
    });
  }
  // Label Wn
  const fs=Math.max(7,Math.round(7*Math.min(getSc()*1.8,1)));
  const[lx,ly]=W2F(wire.pts[0][0],wire.pts[0][1]);
  ctx.font=`bold ${fs}px system-ui`;
  ctx.strokeStyle='rgba(255,255,255,.92)';ctx.lineWidth=2.5;ctx.strokeText(`${wire.id} ${sec}mm²`,lx+3,ly-4);
  ctx.fillStyle=hl?'#CC5500':'#5A2E00';ctx.fillText(`${wire.id} ${sec}mm²`,lx+3,ly-4);
}

// ═══════════════════════════════════════════════════════════════════════
// DESSIN COMPOSANT
// ═══════════════════════════════════════════════════════════════════════
function drawComp(ctx,p,sc){
  const c=p.comp;const[px2,py]=W2F(p.wx,p.wy);const cw=c.modW*sc,ch=c.modH*sc;
  if(p===dragging)ctx.globalAlpha=.6;
  if(p===hoveredComp&&p!==selectedComp){ctx.save();ctx.strokeStyle='rgba(24,95,165,.4)';ctx.lineWidth=2;ctx.setLineDash([]);rr(ctx,px2-2,py-2,cw+4,ch+4,5);ctx.stroke();ctx.restore();}
  if(c.type==='petoupe'){
    // ── Coupe verticale presse-étoupe (profil vu de face)
    const cx=px2+cw/2;
    const band=p.band||'top';
    const topOut=band==='top'; // le câble sort par le haut
    // Gradient métalique (reflet cylindrique horizontal)
    const mg=ctx.createLinearGradient(px2,py,px2+cw,py);
    mg.addColorStop(0,'#555');mg.addColorStop(.2,'#AAA');mg.addColorStop(.5,'#E2E2E2');
    mg.addColorStop(.8,'#AAA');mg.addColorStop(1,'#555');
    // Corps principal
    ctx.fillStyle=mg;ctx.strokeStyle='#404040';ctx.lineWidth=.7;
    ctx.fillRect(px2,py,cw,ch);ctx.strokeRect(px2,py,cw,ch);
    // Écrou hexagonal (côté extérieur)
    const nutH=Math.max(3,ch*.3),nutW=cw*1.35;
    const nutY=topOut?py:py+ch-nutH;
    ctx.fillStyle='#909090';ctx.strokeStyle='#555';ctx.lineWidth=.6;
    ctx.fillRect(cx-nutW/2,nutY,nutW,nutH);ctx.strokeRect(cx-nutW/2,nutY,nutW,nutH);
    // Facettes hex
    [.25,.75].forEach(f=>{ctx.beginPath();ctx.moveTo(cx-nutW/2+nutW*f,nutY);ctx.lineTo(cx-nutW/2+nutW*f,nutY+nutH);ctx.stroke();});
    // Filetage (stries horizontales sur le corps)
    ctx.strokeStyle='rgba(90,90,90,.35)';ctx.lineWidth=.35;
    const threadStart=topOut?nutY+nutH:py,threadEnd=topOut?py+ch:nutY;
    for(let ty=threadStart+1.5;ty<threadEnd-1;ty+=(threadEnd-threadStart)*0.18){
      ctx.beginPath();ctx.moveTo(px2+1,ty);ctx.lineTo(px2+cw-1,ty);ctx.stroke();
    }
    // Orifice câble (côté extérieur)
    const holeR=cw*.3,holeCY=topOut?py+holeR*.9:py+ch-holeR*.9;
    ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.arc(cx,holeCY,holeR,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#555';ctx.lineWidth=.4;ctx.beginPath();ctx.arc(cx,holeCY,holeR,0,Math.PI*2);ctx.stroke();
    // Anneau interne câble
    ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=.5;
    ctx.beginPath();ctx.arc(cx,holeCY,holeR*.5,0,Math.PI*2);ctx.stroke();
    // Label
    if(cw>7){
      const fs=Math.max(5,Math.round(cw*.38));
      ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='#fff';ctx.textAlign='center';
      ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.5;
      ctx.strokeText(p.label||'PE',cx,py+ch*.58+fs*.35);
      ctx.fillText(p.label||'PE',cx,py+ch*.58+fs*.35);
    }
  } else if(c.type==='bornier'){
    ctx.fillStyle='#FEFAF0';ctx.strokeStyle=c.color;ctx.lineWidth=Math.max(.5,cw*.07);
    rr(ctx,px2,py,cw,ch,Math.max(1,cw*.14));ctx.fill();ctx.stroke();
    ctx.fillStyle=c.color;
    rr(ctx,px2+cw*.08,py+ch*.04,cw*.84,ch*.11,1);ctx.fill();
    rr(ctx,px2+cw*.08,py+ch*.85,cw*.84,ch*.11,1);ctx.fill();
    const vr=Math.max(1,cw*.27);
    ctx.fillStyle=c.color+'CC';ctx.beginPath();ctx.arc(px2+cw/2,py+ch*.5,vr,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=Math.max(.3,cw*.05);
    ctx.beginPath();ctx.moveTo(px2+cw*.28,py+ch*.5);ctx.lineTo(px2+cw*.72,py+ch*.5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(px2+cw/2,py+ch*.37);ctx.lineTo(px2+cw/2,py+ch*.63);ctx.stroke();
    if(cw>8){
      const fs=Math.max(5,Math.round(ch*.1));
      ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='#3A1800';ctx.textAlign='center';
      ctx.fillText(p.label||'B?',px2+cw/2,py+ch*.27);
    }
  } else {
    // Corps gris (comme un vrai disjoncteur)
    const bodyGrad=ctx.createLinearGradient(px2,py,px2+cw,py);
    bodyGrad.addColorStop(0,'#E0E0E0');bodyGrad.addColorStop(.5,'#F5F5F5');bodyGrad.addColorStop(1,'#D5D5D5');
    ctx.fillStyle=bodyGrad;ctx.strokeStyle='#888';ctx.lineWidth=.8;
    rr(ctx,px2,py,cw,ch,3);ctx.fill();ctx.stroke();
    // Bande couleur marque (gauche)
    const stripeW=Math.max(2,cw*.08);
    ctx.fillStyle=c.color;
    rr(ctx,px2,py,stripeW,ch,3);ctx.fill();
    if(c.type==='disj'||c.type==='diff'||c.type==='sect'){
      const pw2=cw/c.poles;
      // Séparateurs entre pôles
      if(c.poles>1){
        ctx.strokeStyle='#BBBBBB';ctx.lineWidth=.5;
        for(let pi=1;pi<c.poles;pi++){
          ctx.beginPath();ctx.moveTo(px2+pi*pw2,py+2);ctx.lineTo(px2+pi*pw2,py+ch-2);ctx.stroke();
        }
      }
      // Ampérage extrait du nom
      const amps=(c.name.match(/(\d+)\s*A/)||[])[1]||'';
      for(let pi=0;pi<c.poles;pi++){
        const ppx=px2+pi*pw2;
        // Borne haute (métal)
        const tg=ctx.createLinearGradient(ppx+pw2*.15,py+ch*.05,ppx+pw2*.85,py+ch*.22);
        tg.addColorStop(0,'#C0C0C0');tg.addColorStop(.5,'#F0F0F0');tg.addColorStop(1,'#A0A0A0');
        ctx.fillStyle=tg;ctx.strokeStyle='#888';ctx.lineWidth=.5;
        rr(ctx,ppx+pw2*.15,py+ch*.05,pw2*.7,ch*.17,2);ctx.fill();ctx.stroke();
        // Vis borne haute
        if(pw2>8){
          ctx.fillStyle='#787878';ctx.beginPath();ctx.arc(ppx+pw2*.5,py+ch*.13,Math.max(1,pw2*.1),0,Math.PI*2);ctx.fill();
          ctx.strokeStyle='#505050';ctx.lineWidth=.5;ctx.beginPath();
          ctx.moveTo(ppx+pw2*.5-pw2*.06,py+ch*.13);ctx.lineTo(ppx+pw2*.5+pw2*.06,py+ch*.13);ctx.stroke();
        }
        // Borne basse (métal)
        ctx.fillStyle=tg;ctx.strokeStyle='#888';ctx.lineWidth=.5;
        rr(ctx,ppx+pw2*.15,py+ch*.78,pw2*.7,ch*.17,2);ctx.fill();ctx.stroke();
        if(pw2>8){
          ctx.fillStyle='#787878';ctx.beginPath();ctx.arc(ppx+pw2*.5,py+ch*.87,Math.max(1,pw2*.1),0,Math.PI*2);ctx.fill();
          ctx.strokeStyle='#505050';ctx.lineWidth=.5;ctx.beginPath();
          ctx.moveTo(ppx+pw2*.5-pw2*.06,py+ch*.87);ctx.lineTo(ppx+pw2*.5+pw2*.06,py+ch*.87);ctx.stroke();
        }
        // Levier basculeur (rocker)
        const hg=ctx.createLinearGradient(ppx+pw2*.18,py+ch*.26,ppx+pw2*.82,py+ch*.71);
        hg.addColorStop(0,'#555');hg.addColorStop(.45,'#888');hg.addColorStop(1,'#444');
        ctx.fillStyle=hg;ctx.strokeStyle='#333';ctx.lineWidth=.5;
        rr(ctx,ppx+pw2*.18,py+ch*.26,pw2*.64,ch*.45,3);ctx.fill();ctx.stroke();
        // Position I (haut du levier)
        if(ch>.22){
          const hPos=py+ch*.32;
          ctx.fillStyle='rgba(255,255,255,.7)';
          rr(ctx,ppx+pw2*.25,hPos,pw2*.5,ch*.1,2);ctx.fill();
          if(pw2>10){ctx.font='bold '+(Math.max(5,Math.round(pw2*.45)))+'px system-ui';ctx.fillStyle='rgba(255,255,255,.9)';ctx.textAlign='center';ctx.fillText('I',ppx+pw2*.5,hPos+ch*.07);}
        }
        // Indicateur différentiel (bouton TEST vert)
        if(c.type==='diff'&&pi===0){
          ctx.fillStyle='#00B060';ctx.strokeStyle='#007040';ctx.lineWidth=.5;
          rr(ctx,ppx+pw2*.25,py+ch*.73,Math.min(pw2*.5,25),ch*.04,2);ctx.fill();ctx.stroke();
          if(pw2>14){ctx.font='500 '+(Math.max(4,Math.round(pw2*.22)))+'px system-ui';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('TEST',ppx+pw2*.5,py+ch*.755);}
        }
      }
      // Etiquette : ampérage + repère
      const fs=Math.max(5,Math.round(Math.min(cw,54)*.11));
      ctx.textAlign='center';
      if(amps&&cw>18){
        ctx.font=`bold ${Math.max(6,fs+1)}px system-ui`;ctx.fillStyle='#1A1A1A';
        ctx.fillText(amps+'A',px2+cw/2,py+ch*.245);
      }
      ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='#333';
      ctx.fillText(p.label||'—',px2+cw/2,py+ch-3);
    } else if(c.type==='peigne'){
      ctx.fillStyle='#F0997B';ctx.strokeStyle='#993C1D';ctx.lineWidth=.5;
      rr(ctx,px2,py,cw,ch,1);ctx.fill();ctx.stroke();
      const pw2=cw/c.poles;
      for(let pi=0;pi<c.poles;pi++){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px2+pi*pw2+pw2/2,py+ch/2,Math.max(1.5,ch*.28),0,Math.PI*2);ctx.fill();}
    } else if(c.type==='repot'){
      // Répartiteur de potentiel monopotentiel
      const N=c.poles;
      const stagPx=Math.min(30*sc,(N-1)*4*sc); // décalage total en pixels
      const step=N>1?stagPx/(N-1):0;
      const pw2=cw/N;
      // ── Queues de sortie décalées (dessinées AVANT le corps pour rester derrière)
      ctx.strokeStyle='rgba(160,80,0,.5)';ctx.lineWidth=.8;
      for(let pi=0;pi<N;pi++){
        const cx2=px2+(pi+.5)*pw2, tailY=py+ch+pi*step;
        ctx.beginPath();ctx.moveTo(cx2,py+ch);ctx.lineTo(cx2,tailY);ctx.stroke();
      }
      // Queue entrée (haut)
      ctx.beginPath();ctx.moveTo(px2+cw/2,py);ctx.lineTo(px2+cw/2,py-Math.max(4,ch*.4));ctx.stroke();
      // ── Corps
      const bg2=ctx.createLinearGradient(px2,py,px2,py+ch);
      bg2.addColorStop(0,'#E8A040');bg2.addColorStop(1,'#B06000');
      ctx.fillStyle=bg2;ctx.strokeStyle='#804800';ctx.lineWidth=.7;
      rr(ctx,px2,py,cw,ch,2);ctx.fill();ctx.stroke();
      // Plots (vis)
      for(let pi=0;pi<N;pi++){
        const cx2=px2+(pi+.5)*pw2;
        ctx.fillStyle='rgba(0,0,0,.3)';ctx.strokeStyle='#804800';ctx.lineWidth=.4;
        rr(ctx,px2+pi*pw2+.8,py+ch*.1,pw2-1.6,ch*.8,1);ctx.fill();ctx.stroke();
        ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.arc(cx2,py+ch*.5,Math.max(1,pw2*.17),0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=.4;ctx.beginPath();ctx.arc(cx2,py+ch*.5,Math.max(1,pw2*.17),0,Math.PI*2);ctx.stroke();
      }
      // ── Points de connexion décalés (petits cercles orange au bout des queues)
      for(let pi=0;pi<N;pi++){
        const cx2=px2+(pi+.5)*pw2, tailY=py+ch+pi*step;
        ctx.fillStyle='rgba(220,110,0,.88)';ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(cx2,tailY,2.2,0,Math.PI*2);ctx.fill();ctx.stroke();
      }
      // Point entrée (haut)
      ctx.fillStyle='rgba(180,80,0,.88)';ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(px2+cw/2,py-Math.max(4,ch*.4),2.5,0,Math.PI*2);ctx.fill();ctx.stroke();
      // ── Label
      if(cw>20){
        const fs=Math.max(5,Math.round(ch*.36));
        ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='rgba(255,255,255,.9)';ctx.textAlign='center';
        ctx.fillText(p.label||`${N}P`,px2+cw/2,py+ch*.55+fs*.35);
      }
    } else if(c.type==='repartiteur'){
      // Corps
      ctx.fillStyle='#B8B0F0';ctx.strokeStyle='#534AB7';ctx.lineWidth=.7;
      rr(ctx,px2,py,cw,ch,3);ctx.fill();ctx.stroke();
      // 4 barreaux de puissance colorés : Ph3(brun), Ph2(noir), Ph1(rouge/gris), N(bleu)
      const barLabels=['Ph3','Ph2','Ph1','N'];
      const barColors=['#6D3B1E','#1A1A1A','#808080','#0040C0'];
      const bh=ch/4;
      barColors.forEach((bc,bi)=>{
        const gy=py+bi*bh;
        const bg=ctx.createLinearGradient(px2,gy,px2,gy+bh);
        bg.addColorStop(0,bc+'CC');bg.addColorStop(1,bc+'88');
        ctx.fillStyle=bg;rr(ctx,px2+3,gy+2,cw-6,bh-4,2);ctx.fill();
        ctx.strokeStyle=bc;ctx.lineWidth=.5;rr(ctx,px2+3,gy+2,cw-6,bh-4,2);ctx.stroke();
        if(cw>25){
          const fs=Math.max(6,Math.round(bh*.38));
          ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='#fff';ctx.textAlign='center';
          ctx.fillText(barLabels[bi],px2+cw/2,gy+bh*.5+fs*.35);
        }
      });
      // Label repère
      if(p.label&&p.label!==c.name){
        const fs=Math.max(6,Math.round(cw*.13));
        ctx.font=`500 ${fs}px system-ui`;ctx.fillStyle='rgba(255,255,255,.8)';ctx.textAlign='center';
        ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;
        ctx.strokeText(p.label,px2+cw/2,py+ch+fs+2);ctx.fillStyle='#534AB7';
        ctx.fillText(p.label,px2+cw/2,py+ch+fs+2);
      }
    }
  }
  ctx.globalAlpha=1;
}
