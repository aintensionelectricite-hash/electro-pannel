// ═══════════════════════════════════════════════════════════════════════
// HELPERS DESSIN
// ═══════════════════════════════════════════════════════════════════════
function rr(ctx,x,y,w,h,r){
  r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

// Spline Catmull-Rom : courbe lisse passant par tous les waypoints
// Le premier et dernier segment restent tangents à la direction initiale/finale
function drawSpline(ctx,wpts,minR,sc){
  if(!wpts||wpts.length<2)return;
  const pts=wpts.map(p=>W2F(p[0],p[1]));
  if(pts.length===2){
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);return;
  }
  // Tension Catmull-Rom fixe 0.42 — courbe douce standard, sans angles vifs
  const tension=0.42;
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(i-1,0)];
    const p1=pts[i];
    const p2=pts[i+1];
    const p3=pts[Math.min(i+2,pts.length-1)];
    // Points de contrôle bezier cubique issus de Catmull-Rom
    const cp1x=p1[0]+(p2[0]-p0[0])*tension;
    const cp1y=p1[1]+(p2[1]-p0[1])*tension;
    const cp2x=p2[0]-(p3[0]-p1[0])*tension;
    const cp2y=p2[1]-(p3[1]-p1[1])*tension;
    ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,p2[0],p2[1]);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// COTES DE POSITION — affichées au clic sur un élément
// ═══════════════════════════════════════════════════════════════════════
function drawPosCotes(ctx,sx,sy,sw,p,layout,sc){
  const{intX,intW,m,h}=layout;
  const c=p.comp,cw=c.modW,ch=c.modH;
  const C='#1060C0';
  ctx.strokeStyle=C;ctx.fillStyle=C;ctx.lineWidth=.6;
  const fs=Math.max(7,Math.round(sc*14));
  ctx.font=`600 ${fs}px system-ui`;

  // ── Cote X : distance depuis bord gauche intérieur
  const dx=Math.round(p.wx-intX);
  if(dx>=0){
    const y0=sy(p.wy)-18;
    const x1=sx(intX),x2=sx(p.wx);
    if(Math.abs(x2-x1)>8){
      ctx.setLineDash([4,2]);
      ctx.beginPath();ctx.moveTo(x1,sy(p.wy));ctx.lineTo(x1,y0+4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x2,sy(p.wy));ctx.lineTo(x2,y0+4);ctx.stroke();
      ctx.setLineDash([]);ctx.lineWidth=.7;
      ctx.beginPath();ctx.moveTo(x1,y0);ctx.lineTo(x2,y0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x1,y0-3);ctx.lineTo(x1,y0+3);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x2,y0-3);ctx.lineTo(x2,y0+3);ctx.stroke();
      ctx.textAlign='center';ctx.fillText(`X:${dx}`,( x1+x2)/2,y0-4);
    }
  }

  // ── Cote largeur composant
  const compW=Math.round(cw);
  {
    const y1=sy(p.wy)-8;
    const xa=sx(p.wx),xb=sx(p.wx+cw);
    ctx.setLineDash([2,2]);ctx.lineWidth=.5;
    ctx.beginPath();ctx.moveTo(xa,sy(p.wy));ctx.lineTo(xa,y1+2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(xb,sy(p.wy));ctx.lineTo(xb,y1+2);ctx.stroke();
    ctx.setLineDash([]);ctx.lineWidth=.6;
    ctx.beginPath();ctx.moveTo(xa,y1);ctx.lineTo(xb,y1);ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle='rgba(16,96,192,.7)';
    ctx.fillText(`${compW}mm`,( xa+xb)/2,y1-3);ctx.fillStyle=C;
  }

  // ── Cote Y : distance depuis bord supérieur intérieur (y=m)
  if(p.type==='comp'&&c.type!=='petoupe'){
    const refY=p.railRef?p.railRef.y:p.wy;
    const dy=Math.round(refY-m);
    const x0=sx(intX)-22;
    const ya=sy(m),yb=sy(refY);
    if(Math.abs(yb-ya)>8){
      ctx.setLineDash([4,2]);ctx.lineWidth=.6;
      ctx.beginPath();ctx.moveTo(sx(intX),ya);ctx.lineTo(x0+3,ya);ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx(intX),yb);ctx.lineTo(x0+3,yb);ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();ctx.moveTo(x0,ya);ctx.lineTo(x0,yb);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x0-3,ya);ctx.lineTo(x0+3,ya);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x0-3,yb);ctx.lineTo(x0+3,yb);ctx.stroke();
      ctx.save();ctx.translate(x0-fs-1,(ya+yb)/2);ctx.rotate(-Math.PI/2);
      ctx.textAlign='center';ctx.fillText(`Y:${dy}`,0,0);ctx.restore();
    }
  }

  // ── Pour PE : indiquer la bande et distance X
  if(c.type==='petoupe'){
    const bLbl=p.band==='top'?'Bande haute':'Bande basse';
    const[qx,qy]=W2F(p.wx+cw/2,p.wy+ch/2);
    ctx.textAlign='center';ctx.fillStyle='rgba(16,96,192,.85)';
    ctx.font=`500 ${Math.max(7,fs-1)}px system-ui`;
    ctx.fillText(bLbl,qx,qy+ch*sc*.5+10);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// DESSIN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════
function draw(){
  const layout=getLayout();
  const{intX,intW,zones,m,w,h}=layout;
  const sc=getSc()*faceZoom;  // échelle avec zoom appliqué
  const DOOR_PANEL_W=doorVisible&&DOOR_PLACED.length?80:0;
  const panExtra=Math.max(0,Math.ceil(Math.abs(facePanX)),Math.ceil(Math.abs(facePanY)));
  const FW=Math.round(w*sc)+130+(DOOR_PANEL_W?DOOR_PANEL_W+24:0)+panExtra*2,FH=Math.round(h*sc)+100+panExtra*2;
  const cv=document.getElementById('cv-face');
  cv.width=FW;cv.height=FH;cv.style.width=FW+'px';cv.style.height=FH+'px';
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,FW,FH);
  function sx(v){return 58+facePanX+v*sc}function sy(v){return 34+facePanY+v*sc}function sw(v){return v*sc}

  // ── Fond
  const fg=ctx.createLinearGradient(sx(0),sy(0),sx(w),sy(h));
  fg.addColorStop(0,'#E8F2FC');fg.addColorStop(1,'#D2E6F6');
  ctx.fillStyle=fg;ctx.strokeStyle='#5B9FD4';ctx.lineWidth=1.5;
  rr(ctx,sx(0),sy(0),sw(w),sw(h),6);ctx.fill();ctx.stroke();

  // ── Bandes tôle haut/bas (presse-étoupes)
  [0,h-m].forEach((bandY,bi)=>{
    const grad=ctx.createLinearGradient(sx(0),sy(bandY),sx(0),sy(bandY+m));
    grad.addColorStop(0,bi===0?'#B8C8D8':'#A8BCC8');
    grad.addColorStop(1,bi===0?'#A8BCC8':'#98ACBC');
    ctx.fillStyle=grad;
    ctx.fillRect(sx(0),sy(bandY),sw(w),sw(m));
    ctx.strokeStyle='#889AAA';ctx.lineWidth=.5;
    ctx.strokeRect(sx(0),sy(bandY),sw(w),sw(m));
    // Label GV bande
    const fs=Math.max(7,Math.round(sc*16));
    ctx.font=`500 ${fs}px system-ui`;ctx.fillStyle='#7090B0';ctx.textAlign='left';
    ctx.fillText(bi===0?'GV1 — GV2 (haut)':'GV1 — GV2 (bas)',sx(m+VGOUL_W+5),sy(bandY+m/2)+fs*.35);
  });

  // ── Goulottes verticales GV1 (gauche) et GV2 (droite)
  drawVertGoul(ctx,sx(m),sy(m),sw(VGOUL_W),sw(h-2*m),'GV1');
  drawVertGoul(ctx,sx(w-m-VGOUL_W),sy(m),sw(VGOUL_W),sw(h-2*m),'GV2');

  // ── Zones horizontales
  zones.forEach(z=>{
    if(z.type==='goulH'){
      ctx.fillStyle='#FAECE7';ctx.strokeStyle='#D85A30';ctx.lineWidth=.7;
      rr(ctx,sx(intX),sy(z.y),sw(intW),sw(z.h),2);ctx.fill();ctx.stroke();
      if(FLAGS.capots){
        ctx.fillStyle='rgba(83,74,183,.07)';ctx.strokeStyle='#534AB7';ctx.lineWidth=.35;
        rr(ctx,sx(intX+3),sy(z.y+3),sw(intW-6),sw(z.h-6),1);ctx.fill();ctx.stroke();
      }
      if(sw(z.h)>7){
        const fs=Math.max(6,Math.round(sw(z.h)*.46));
        ctx.font=`500 ${fs}px system-ui`;ctx.fillStyle='#A04010';ctx.textAlign='left';
        ctx.fillText(z.label,sx(intX+5),sy(z.y+z.h/2)+fs*.35);
      }
    } else if(z.type==='rail'){
      drawRailDIN(ctx,sx,sy,sw,z,intX,intW,sc);
    }
  });

  // ── Composants fond
  PLACED.forEach(p=>{if(p.type==='comp')drawComp(ctx,p,sc);});

  // ── Fils (dessinés APRÈS les composants pour toujours être visibles)
  ctx.save();
  WIRES.forEach(wire=>drawWire(ctx,wire,sc,layout));
  ctx.restore();

  // ── Preview fil en cours
  if(wm.active&&wm.startP){
    const sp=getConnPts(wm.startP).find(pt=>pt.id===wm.startPtId);
    if(sp){
      const sec=SEC(),minR=BEND_R[sec]||20;
      const prev=routeWireStrict([sp.wx,sp.wy],[wm.prevX,wm.prevY],wm.startP,null,layout);
      ctx.strokeStyle='rgba(192,112,0,.55)';
      ctx.lineWidth=Math.max(1.5,wireR(sec)*sc*2);ctx.lineCap='round';ctx.lineJoin='round';
      drawSpline(ctx,prev,minR,sc);ctx.stroke();ctx.lineCap='butt';
      // Point de départ accentué
      const[spx,spy]=W2F(sp.wx,sp.wy);
      ctx.fillStyle='#D06000';ctx.beginPath();ctx.arc(spx,spy,5,0,Math.PI*2);ctx.fill();
    }
  }

  // ── Points d'accrochage (hover ou mode fil)
  const connTargets=wm.active?PLACED:hoveredComp?[hoveredComp]:[];
  connTargets.forEach(p=>{
    if(p.type!=='comp')return;
    getConnPts(p).forEach(pt=>{
      const[px,py]=W2F(pt.wx,pt.wy);
      ctx.fillStyle='rgba(255,140,0,.88)';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.stroke();
    });
  });

  // ── Sélection + cotes de position
  if(selectedComp?.type==='comp'){
    const c=selectedComp.comp;const[spx,spy]=W2F(selectedComp.wx,selectedComp.wy);
    ctx.strokeStyle='#185FA5';ctx.lineWidth=2;ctx.setLineDash([3,2]);
    rr(ctx,spx-3,spy-3,c.modW*sc+6,c.modH*sc+6,4);ctx.stroke();ctx.setLineDash([]);
    // Cotes de position
    drawPosCotes(ctx,sx,sy,sw,selectedComp,layout,sc);
  }

  // ── Trait de coupe A-A
  drawCutLine(ctx,sx,sy,sw,w,h,sc,layout);

  if(FLAGS.cotes)drawCotes(ctx,sx,sy,sw,w,h,m,intX,intW,zones,sc,layout.espR);

  // ── Ghost
  if(libGhost){
    const c=libGhost.comp;
    const[wx0,wy0]=F2W(libGhost.x,libGhost.y);
    const{wx,wy,onRail,noSpace}=applySnap(wx0-c.modW/2,wy0-c.modH/2,c,layout);
    const[gx,gy]=W2F(wx,wy);
    ctx.fillStyle=noSpace?'rgba(200,0,0,.1)':onRail?'rgba(24,95,165,.13)':'rgba(80,150,220,.09)';
    ctx.strokeStyle=noSpace?'#C00':onRail?'#185FA5':'#5B9FD4';
    ctx.lineWidth=1;ctx.setLineDash([3,2]);
    rr(ctx,gx,gy,c.modW*sc,c.modH*sc,3);ctx.fill();ctx.stroke();ctx.setLineDash([]);
  }

  drawPlanView(layout);
  drawPlateView('top',layout);
  drawPlateView('bot',layout);
  if(doorVisible)drawDoorView(layout);
  if(currentView==='iso')drawIsoView(layout);

  // ── Panneau voyants porte (à droite de la vue face)
  if(doorVisible&&DOOR_PLACED.length){
    const dpX=sx(w)+36,dpW=DOOR_PANEL_W;
    ctx.fillStyle='#C8D8E8';ctx.strokeStyle='#6080A0';ctx.lineWidth=1;
    rr(ctx,dpX,sy(0),dpW,sw(h),6);ctx.fill();ctx.stroke();
    ctx.font='bold 8px system-ui';ctx.fillStyle='#4060A0';ctx.textAlign='center';
    ctx.fillText('PORTE',dpX+dpW/2,sy(0)-6);
    // Trait pointillé joint
    ctx.strokeStyle='rgba(80,80,200,.35)';ctx.lineWidth=.8;ctx.setLineDash([5,3]);
    ctx.beginPath();ctx.moveTo(sx(w)+2,sy(h*.5));ctx.lineTo(dpX,sy(h*.5));ctx.stroke();
    ctx.setLineDash([]);
    ctx.font='7px system-ui';ctx.fillStyle='rgba(80,80,200,.6)';
    ctx.fillText(`joint ${DOOR_GAP()}mm`,sx(w)+18,sy(h*.5)-5);
    // Dessiner voyants avec point de connexion
    DOOR_PLACED.forEach((p,pi)=>{
      const c=p.comp;
      const vcx=dpX+dpW/2;
      const vcy=sy(m+((h-2*m)/(DOOR_PLACED.length+1))*(pi+1));
      const r=Math.max(8,Math.min(14,dpW*.18));
      const rg=ctx.createRadialGradient(vcx-r*.25,vcy-r*.25,r*.05,vcx,vcy,r);
      rg.addColorStop(0,c.color+'FF');rg.addColorStop(1,c.color+'88');
      ctx.fillStyle=rg;ctx.beginPath();ctx.arc(vcx,vcy,r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.beginPath();ctx.arc(vcx,vcy,r,0,Math.PI*2);ctx.stroke();
      // Reflet
      ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.arc(vcx-r*.28,vcy-r*.28,r*.32,0,Math.PI*2);ctx.fill();
      // Label
      const fs=Math.max(6,Math.round(r*.42));
      ctx.font=`600 ${fs}px system-ui`;ctx.fillStyle='#fff';ctx.textAlign='center';
      ctx.fillText(p.label||'V?',vcx,vcy+fs*.35);
      // Point de connexion (gauche du panneau)
      const connX=dpX-2;
      ctx.fillStyle='rgba(255,140,0,.8)';ctx.strokeStyle='#fff';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(connX,vcy,4,0,Math.PI*2);ctx.fill();ctx.stroke();
      // Stocker la position monde de ce voyant pour le câblage
      p._faceWX=(connX-58)/sc;p._faceWY=(vcy-34)/sc;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// TRAIT DE COUPE A-A (étendu -CUT_EXT … h+CUT_EXT, avec œil)
// ═══════════════════════════════════════════════════════════════════════
function drawCutLine(ctx,sx,sy,sw,w,h,sc,layout){
  const clamp=Math.max(-CUT_EXT,Math.min(cutLineY||h/2,h+CUT_EXT));
  const cy=sy(clamp); // utilise sy() pour intégrer facePanY
  const x0=sx(0)-18,x1=sx(w)+18;
  ctx.save();
  // Ligne pointillée ISO
  ctx.strokeStyle='#C85800';ctx.lineWidth=1.2;ctx.setLineDash([10,4,2,4]);
  ctx.beginPath();ctx.moveTo(x0,cy);ctx.lineTo(x1,cy);ctx.stroke();ctx.setLineDash([]);
  // Flèches A — A
  function arrow(ax,ay,dir){
    ctx.fillStyle='#C85800';
    ctx.beginPath();
    if(dir>0){ctx.moveTo(ax+8,ay);ctx.lineTo(ax,ay-4);ctx.lineTo(ax,ay+4);}
    else{ctx.moveTo(ax-8,ay);ctx.lineTo(ax,ay-4);ctx.lineTo(ax,ay+4);}
    ctx.closePath();ctx.fill();
    ctx.font='bold 9px system-ui';ctx.fillStyle='#C85800';
    ctx.textAlign=dir>0?'left':'right';
    ctx.fillText('A',ax+(dir>0?11:-11),ay+3);
  }
  arrow(x0,cy,-1);arrow(x1,cy,1);
  // Œil gauche (avec indicateur direction)
  drawEye(ctx,x0-28,cy,cutDir<0);
  // Œil droit
  drawEye(ctx,x1+28,cy,cutDir>0);
  // Label hauteur (+Xmm hors fond haut / Xmm intérieur / -Xmm hors fond bas)
  const cY2=cutLineY||layout.h/2;
  let lbl;
  if(cY2<0)lbl=`+${Math.abs(Math.round(cY2))} mm`;
  else if(cY2>layout.h)lbl=`-${Math.round(cY2-layout.h)} mm`;
  else lbl=`${Math.round(layout.h-cY2)} mm`;
  const midX=(x0+x1)/2;
  ctx.fillStyle='rgba(200,88,0,.88)';rr(ctx,midX-28,cy-9,56,14,5);ctx.fill();
  ctx.font='bold 8.5px system-ui';ctx.fillStyle='#fff';ctx.textAlign='center';
  ctx.fillText(lbl,midX,cy+1);
  ctx.restore();
}

function drawEye(ctx,cx,cy,active){
  ctx.save();
  ctx.strokeStyle='#C85800';ctx.fillStyle=active?'#C85800':'rgba(200,88,0,.3)';ctx.lineWidth=1;
  // Contour œil
  ctx.beginPath();ctx.moveTo(cx-9,cy);
  ctx.bezierCurveTo(cx-9,cy-5.5,cx+9,cy-5.5,cx+9,cy);
  ctx.bezierCurveTo(cx+9,cy+5.5,cx-9,cy+5.5,cx-9,cy);
  ctx.closePath();
  ctx.fillStyle=active?'rgba(200,88,0,.2)':'rgba(200,88,0,.08)';ctx.fill();ctx.stroke();
  // Pupille
  ctx.fillStyle='#C85800';ctx.beginPath();ctx.arc(cx,cy,2.5,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════
// VUE PLAN (COUPE A-A) — section horizontale
// ═══════════════════════════════════════════════════════════════════════
function drawPlanView(layout){
  planViewMeta=null;PLAN_COTE_HITS.length=0; // reset
  const{m,w,h,intX,intW,zones}=layout;
  const cutY=Math.max(-CUT_EXT,Math.min(cutLineY||h/2,h+CUT_EXT));
  const isAbove=cutY<0,isBelow=cutY>h;
  const thick=isAbove||isBelow?TOLE_EP:panelThick(cutY,h);
  const scX=getSc(),scZ=Math.min(130/Math.max(thick,.1),2.5);
  const PW=Math.round(w*scX)+90,PH=Math.round(Math.max(thick,4)*scZ)+66;
  const cv=document.getElementById('cv-plan');
  cv.width=PW;cv.height=PH;cv.style.width=PW+'px';cv.style.height=PH+'px';
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,PW,PH);
  const OX=46,OZ=18;
  const flip=cutDir<0;
  function px(x){return OX+(flip?(w-x):x)*scX}
  function pz(z){return OZ+(flip?(thick-z):z)*scZ}
  function pw(v){return v*scX}function pd(v){return v*scZ}

  // ── Matière
  if(isAbove||isBelow){
    // Tôle S3D 1.5mm — coupe hors fond
    const tg=ctx.createLinearGradient(OX,OZ,OX,OZ+pd(TOLE_EP));
    tg.addColorStop(0,'#9090A0');tg.addColorStop(1,'#707080');
    ctx.fillStyle=tg;ctx.fillRect(OX,OZ,pw(w),pd(TOLE_EP));
    ctx.strokeStyle='#505060';ctx.lineWidth=.7;ctx.strokeRect(OX,OZ,pw(w),pd(TOLE_EP));
    // Perçages PE
    const band=isAbove?'top':'bottom';
    PLACED.filter(p=>p.comp?.type==='petoupe'&&p.band===band).forEach(p=>{
      const cx=px(p.wx+p.comp.modW/2);
      const pr=Math.max(1.5,pw(p.comp.modW/2));
      ctx.fillStyle='#333';ctx.beginPath();ctx.arc(cx,pz(TOLE_EP/2),pr,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#888';ctx.lineWidth=.5;ctx.beginPath();ctx.arc(cx,pz(TOLE_EP/2),pr,0,Math.PI*2);ctx.stroke();
      const fs=Math.max(6,Math.round(pw(p.comp.modW)*.3));
      ctx.font=`${fs}px system-ui`;ctx.fillStyle='#EEE';ctx.textAlign='center';
      ctx.fillText(p.label||'PE?',cx,OZ+pd(TOLE_EP)+10);
    });
  } else {
    // ABS matière fond
    const mat=ctx.createLinearGradient(OX,OZ,OX,OZ+pd(thick));
    mat.addColorStop(0,'#C0C8D5');mat.addColorStop(1,'#AEB8C5');
    ctx.fillStyle=mat;ctx.fillRect(OX,OZ,pw(w),pd(thick));
    ctx.strokeStyle='#4E6070';ctx.lineWidth=1;ctx.strokeRect(OX,OZ,pw(w),pd(thick));

    // Goulottes verticales GV1, GV2
    function gvSection(x1,gw){
      ctx.fillStyle='#FAECE7';ctx.strokeStyle='#D85A30';ctx.lineWidth=.7;
      ctx.fillRect(px(x1),OZ,pw(gw)*(flip?-1:1),pd(thick));
      ctx.strokeRect(Math.min(px(x1),px(x1)+pw(gw)*(flip?-1:1)),OZ,pw(gw),pd(thick));
    }
    gvSection(m,VGOUL_W);gvSection(w-m-VGOUL_W,VGOUL_W);

    // Zone à cutY — gorges variables et épaulement rail
    const planViewHandles=[];
    const zone=zones.find(z=>cutY>=z.y&&cutY<z.y+z.h);
    if(zone?.type==='goulH'){
      const goulD=getZD(zone);
      const gX=px(intX),gW=pw(intW)*(flip?-1:1),gD=pd(goulD);
      ctx.fillStyle='#FAECE7';ctx.strokeStyle='#D85A30';ctx.lineWidth=.7;
      ctx.fillRect(Math.min(gX,gX+gW),OZ,Math.abs(gW),gD);
      ctx.strokeRect(Math.min(gX,gX+gW),OZ,Math.abs(gW),gD);
      ctx.fillStyle='rgba(216,90,48,.45)';
      ctx.fillRect(Math.min(gX,gX+gW),OZ,3,gD);
      ctx.fillRect(Math.max(gX,gX+gW)-3,OZ,3,gD);
      ctx.fillRect(Math.min(gX,gX+gW),OZ+gD-3,Math.abs(gW),3);
      // Drag handle gorge
      const hY=OZ+gD,midX=(Math.min(gX,gX+gW)+Math.max(gX,gX+gW))/2;
      const isDrg=planDepthDrag?.zoneLabel===zone.label;
      ctx.strokeStyle=isDrg?'#C85800':'rgba(200,88,0,.65)';ctx.lineWidth=isDrg?2:1.2;ctx.setLineDash([5,3]);
      ctx.beginPath();ctx.moveTo(Math.min(gX,gX+gW),hY);ctx.lineTo(Math.max(gX,gX+gW),hY);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=isDrg?'#C85800':'rgba(200,88,0,.8)';ctx.beginPath();ctx.arc(midX,hY,4,0,Math.PI*2);ctx.fill();
      // Cote gorge
      const cX=Math.max(gX,gX+gW)+18;
      ctx.strokeStyle='#1D9E75';ctx.fillStyle='#C85800';ctx.lineWidth=.6;
      ctx.beginPath();ctx.moveTo(cX,OZ);ctx.lineTo(cX,hY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cX-3,OZ);ctx.lineTo(cX+3,OZ);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cX-3,hY);ctx.lineTo(cX+3,hY);ctx.stroke();
      ctx.save();ctx.translate(cX+11,(OZ+hY)/2);ctx.rotate(Math.PI/2);
      ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText(`gorge ${Math.round(goulD)}mm`,0,0);ctx.restore();
      // Cote gorge cliquable
      PLAN_COTE_HITS.push({x:cX+11,y:(OZ+hY)/2,r:20,val:goulD,min:10,max:thick-5,
        onSubmit:v=>{ZONE_DEPTHS[zone.label]=Math.round(v);draw();}});
      planViewHandles.push({zoneLabel:zone.label,canvasY:hY,minD:10,maxD:thick-5,scZ,OZ});
    } else if(zone?.type==='rail'){
      const railD=getZD(zone);
      const RAIL_DIN_H=10; // épaisseur profil DIN 35 mm (fixe)
      const defaultRailFZ=Math.max(RAIL_DIN_H+4,Math.round(railD*0.25));
      const railFZ=Math.max(2,Math.min(
        RAIL_FRONT_Z[zone.label]!==undefined?RAIL_FRONT_Z[zone.label]:defaultRailFZ,
        railD-RAIL_DIN_H-2));
      const rX=px(intX),rW=pw(intW)*(flip?-1:1);
      const sectionEndY=OZ+pd(railD);
      const rFaceY=OZ+pd(railFZ);    // face avant rail DIN (canvas Y)
      const rH=pd(RAIL_DIN_H);       // hauteur rail en pixels
      const midX2=(Math.min(rX,rX+rW)+Math.max(rX,rX+rW))/2;

      // Section fond gris-bleu
      ctx.fillStyle='#D8E4EE';ctx.strokeStyle='#7090A8';ctx.lineWidth=.5;
      ctx.fillRect(Math.min(rX,rX+rW),OZ,Math.abs(rW),pd(railD));
      ctx.strokeRect(Math.min(rX,rX+rW),OZ,Math.abs(rW),pd(railD));

      // Rail DIN profil
      const rg2=ctx.createLinearGradient(Math.min(rX,rX+rW),rFaceY,Math.min(rX,rX+rW),rFaceY+rH);
      rg2.addColorStop(0,'#CCC');rg2.addColorStop(.45,'#F5F5F5');rg2.addColorStop(1,'#AAA');
      ctx.fillStyle=rg2;ctx.fillRect(Math.min(rX,rX+rW),rFaceY,Math.abs(rW),rH);
      ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.strokeRect(Math.min(rX,rX+rW),rFaceY,Math.abs(rW),rH);

      // ── Cotes inter ──
      const jeuAv=Math.max(0,Math.round(railFZ));
      const jeuAr=Math.max(0,Math.round(railD-railFZ-RAIL_DIN_H));
      const cX2=Math.max(rX,rX+rW)+8;

      // Jeu avant (vert)
      ctx.strokeStyle='#1D9E75';ctx.fillStyle='#1D9E75';ctx.lineWidth=.6;
      if(pd(jeuAv)>3){
        ctx.beginPath();ctx.moveTo(cX2,OZ);ctx.lineTo(cX2,rFaceY);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cX2-2.5,OZ);ctx.lineTo(cX2+2.5,OZ);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cX2-2.5,rFaceY);ctx.lineTo(cX2+2.5,rFaceY);ctx.stroke();
        if(pd(jeuAv)>14){ctx.save();ctx.translate(cX2+9,(OZ+rFaceY)/2);ctx.rotate(Math.PI/2);ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText(`jeu av.${jeuAv}mm`,0,0);ctx.restore();}
      }
      // Rail DIN (bleu)
      const rcX=cX2+20;
      ctx.strokeStyle='#4060C0';ctx.fillStyle='#4060C0';ctx.lineWidth=.6;
      ctx.beginPath();ctx.moveTo(rcX,rFaceY);ctx.lineTo(rcX,rFaceY+rH);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rcX-2.5,rFaceY);ctx.lineTo(rcX+2.5,rFaceY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rcX-2.5,rFaceY+rH);ctx.lineTo(rcX+2.5,rFaceY+rH);ctx.stroke();
      if(rH>10){ctx.save();ctx.translate(rcX+9,rFaceY+rH/2);ctx.rotate(Math.PI/2);ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText(`rail ${RAIL_DIN_H}mm`,0,0);ctx.restore();}
      // Jeu arrière (vert)
      ctx.strokeStyle='#1D9E75';ctx.fillStyle='#1D9E75';ctx.lineWidth=.6;
      if(pd(jeuAr)>3){
        ctx.beginPath();ctx.moveTo(cX2,rFaceY+rH);ctx.lineTo(cX2,sectionEndY);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cX2-2.5,rFaceY+rH);ctx.lineTo(cX2+2.5,rFaceY+rH);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cX2-2.5,sectionEndY);ctx.lineTo(cX2+2.5,sectionEndY);ctx.stroke();
        if(pd(jeuAr)>14){ctx.save();ctx.translate(cX2+9,(rFaceY+rH+sectionEndY)/2);ctx.rotate(Math.PI/2);ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText(`jeu ar.${jeuAr}mm`,0,0);ctx.restore();}
      }
      // Profondeur totale (orange)
      const cX3=cX2+40;
      ctx.strokeStyle='#C85800';ctx.fillStyle='#C85800';ctx.lineWidth=.6;
      ctx.beginPath();ctx.moveTo(cX3,OZ);ctx.lineTo(cX3,sectionEndY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cX3-3,OZ);ctx.lineTo(cX3+3,OZ);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cX3-3,sectionEndY);ctx.lineTo(cX3+3,sectionEndY);ctx.stroke();
      ctx.save();ctx.translate(cX3+11,(OZ+sectionEndY)/2);ctx.rotate(Math.PI/2);
      ctx.font='bold 7px system-ui';ctx.textAlign='center';ctx.fillText(`prof. ${Math.round(railD)}mm`,0,0);ctx.restore();
      // Cote profondeur rail cliquable
      PLAN_COTE_HITS.push({x:cX3+11,y:(OZ+sectionEndY)/2,r:20,val:railD,min:RAIL_DIN_H+6,max:thick-5,
        onSubmit:v=>{ZONE_DEPTHS[zone.label]=Math.round(v);draw();}});

      // ── Drag handles ──
      // Orange = profondeur totale section (bas)
      const isDrg2=planDepthDrag?.zoneLabel===zone.label&&planDepthDrag?.type!=='railZ';
      ctx.strokeStyle=isDrg2?'#C85800':'rgba(200,88,0,.55)';ctx.lineWidth=isDrg2?2:1;ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.moveTo(Math.min(rX,rX+rW),sectionEndY);ctx.lineTo(Math.max(rX,rX+rW),sectionEndY);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=isDrg2?'#C85800':'rgba(200,88,0,.7)';ctx.beginPath();ctx.arc(midX2,sectionEndY,3.5,0,Math.PI*2);ctx.fill();
      // Bleu = position Z rail DIN (face avant rail)
      const isDrg3=planDepthDrag?.zoneLabel===zone.label&&planDepthDrag?.type==='railZ';
      ctx.strokeStyle=isDrg3?'#1A5FD0':'rgba(26,95,208,.6)';ctx.lineWidth=isDrg3?2:1.2;ctx.setLineDash([2,4]);
      ctx.beginPath();ctx.moveTo(Math.min(rX,rX+rW),rFaceY);ctx.lineTo(Math.max(rX,rX+rW),rFaceY);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=isDrg3?'#1A5FD0':'rgba(26,95,208,.8)';ctx.beginPath();ctx.arc(midX2,rFaceY,4,0,Math.PI*2);ctx.fill();

      // Composants en section
      PLACED.filter(p=>p.type==='comp'&&p.railRef?.label===zone.label&&cutY>=p.wy&&cutY<=p.wy+p.comp.modH).forEach(p=>{
        const cx=px(p.wx),cW=pw(p.comp.modW)*(flip?-1:1);
        const cFr=rFaceY-pd(3),cD=rH+pd(6);
        ctx.fillStyle=p.comp.color+'90';ctx.strokeStyle=p.comp.color;ctx.lineWidth=.5;
        ctx.fillRect(Math.min(cx,cx+cW),cFr,Math.abs(cW),cD);
        ctx.strokeRect(Math.min(cx,cx+cW),cFr,Math.abs(cW),cD);
        if(Math.abs(cW)>12){
          const fs=Math.max(5,Math.round(Math.abs(cW)*.12));
          ctx.font=`500 ${fs}px system-ui`;ctx.fillStyle='#fff';ctx.textAlign='center';
          ctx.fillText(p.label||'',Math.min(cx,cx+cW)+Math.abs(cW)/2,cFr+cD/2+fs*.35);
        }
      });

      // Indicateur inclinaison 15° pour rails borniers
      if(zone.sub==='born'){
        ctx.save();
        ctx.strokeStyle='rgba(130,70,20,.5)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
        ctx.beginPath();ctx.moveTo(Math.min(rX,rX+rW),rFaceY);ctx.lineTo(Math.max(rX,rX+rW),rFaceY+rH);ctx.stroke();
        ctx.setLineDash([]);
        ctx.font='bold 7px system-ui';ctx.fillStyle='rgba(100,50,10,.8)';ctx.textAlign='left';
        ctx.fillText('15°',Math.max(rX,rX+rW)+3,rFaceY+rH*.6);
        ctx.restore();
      }
      planViewHandles.push({type:'depth',zoneLabel:zone.label,canvasY:sectionEndY,minD:RAIL_DIN_H+6,maxD:thick-5,scZ,OZ});
      planViewHandles.push({type:'railZ',zoneLabel:zone.label,canvasY:rFaceY,minZ:2,maxZ:railD-RAIL_DIN_H-2,scZ,OZ});
    }
    planViewMeta={OZ,scZ,thick,isAbove,isBelow,cutY,handles:planViewHandles,w,flip,OX};
  }

  // ── Cotation épaisseur
  if(FLAGS.cotes){
    ctx.strokeStyle='#1D9E75';ctx.lineWidth=.5;
    ctx.beginPath();ctx.moveTo(OX,OZ-10);ctx.lineTo(OX+pw(w),OZ-10);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX,OZ-14);ctx.lineTo(OX,OZ-6);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX+pw(w),OZ-14);ctx.lineTo(OX+pw(w),OZ-6);ctx.stroke();
    ctx.font='500 9px system-ui';ctx.fillStyle='#1D9E75';ctx.textAlign='center';
    ctx.fillText(`${layout.w} mm`,OX+pw(w)/2,OZ-13);
    ctx.beginPath();ctx.moveTo(OX+pw(w)+11,OZ);ctx.lineTo(OX+pw(w)+11,OZ+pd(thick));ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX+pw(w)+7,OZ);ctx.lineTo(OX+pw(w)+15,OZ);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX+pw(w)+7,OZ+pd(thick));ctx.lineTo(OX+pw(w)+15,OZ+pd(thick));ctx.stroke();
    ctx.save();ctx.translate(OX+pw(w)+22,OZ+pd(thick)/2);ctx.rotate(Math.PI/2);
    ctx.textAlign='center';ctx.fillText(`ép.${Math.round(thick)}mm`,0,0);ctx.restore();
    // Cote épaisseur fond → cliquable
    PLAN_COTE_HITS.push({x:OX+pw(w)+22,y:OZ+pd(thick)/2,r:22,val:thick,min:60,max:150,
      onSubmit:v=>{const el=document.getElementById('thickness');el.value=v;el.dispatchEvent(new Event('input'));}});
    // Cote largeur → non modifiable directement
    PLAN_COTE_HITS.push({x:OX+pw(w)/2,y:OZ-13,r:20,val:layout.w,min:600,max:800,
      onSubmit:_=>alert('Modifiez la largeur via le menu "Modèle".')});
  }

  // ── Labels
  const cy3=cutLineY||layout.h/2;
  let posLbl;
  if(cy3<0)posLbl=`+${Math.abs(Math.round(cy3))}mm (hors fond, haut)`;
  else if(cy3>layout.h)posLbl=`-${Math.round(cy3-layout.h)}mm (hors fond, bas)`;
  else posLbl=`${Math.round(layout.h-cy3)}mm du bas`;
  const dirLabel=cutDir>0?'→':'←';
  ctx.font='bold 8.5px system-ui';ctx.fillStyle='#C85800';ctx.textAlign='left';
  ctx.fillText(`Coupe A-A ${dirLabel}  ${posLbl}`,OX,OZ+pd(thick)+15);
  if(isAbove||isBelow)ctx.fillText('(zone hors fond — tôle S3D 1.5mm)',OX,OZ+pd(thick)+26);
  ctx.font='9px system-ui';ctx.fillStyle='#888';ctx.textAlign='right';
  ctx.fillText(`Coupe A-A`,OX+pw(w),OZ+pd(thick)+15);
  // Curseur X synchronisé avec la vue face
  if(faceCursorWX!==null){
    const cxc=px(faceCursorWX);
    ctx.save();ctx.strokeStyle='rgba(200,88,0,.55)';ctx.lineWidth=1;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(cxc,OZ-6);ctx.lineTo(cxc,OZ+pd(thick)+6);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
  }
  // Surlignage sélection / survol dans la coupe
  if(!isAbove&&!isBelow){
    [selectedComp,hoveredComp].forEach((p,pi)=>{
      if(!p||p.type!=='comp')return;
      if(cutY<p.wy||cutY>p.wy+p.comp.modH)return;
      const cxL=px(p.wx),cW=pw(p.comp.modW)*(flip?-1:1);
      ctx.save();ctx.strokeStyle=pi===0?'#185FA5':'rgba(24,95,165,.45)';ctx.lineWidth=pi===0?1.8:1;ctx.setLineDash([3,2]);
      ctx.strokeRect(Math.min(cxL,cxL+cW)-2,OZ-2,Math.abs(cW)+4,pd(thick)+4);
      ctx.setLineDash([]);
      if(pi===0){ctx.font='bold 8px system-ui';ctx.fillStyle='#185FA5';ctx.textAlign='center';ctx.fillText(p.label||p.comp.name,Math.min(cxL,cxL+cW)+Math.abs(cW)/2,OZ-5);}
      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════
// COTATIONS
// ═══════════════════════════════════════════════════════════════════════
function drawCotes(ctx,sx,sy,sw,w,h,m,intX,intW,zones,sc,espR){
  COTE_HITS.length=0;
  const C='#1D9E75';ctx.strokeStyle=C;ctx.fillStyle=C;
  function dimH(x,y1,y2,lbl,big){
    if(Math.abs(y2-y1)<3)return;
    const fs=big?Math.max(7,Math.round(sc*19)):Math.max(6,Math.round(sc*15));
    ctx.lineWidth=big?.8:.4;ctx.setLineDash(big?[]:[2,2]);
    ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x,y2);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(x-3,y1);ctx.lineTo(x+3,y1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-3,y2);ctx.lineTo(x+3,y2);ctx.stroke();
    ctx.save();ctx.translate(x-(big?10:7),(y1+y2)/2);ctx.rotate(-Math.PI/2);
    ctx.textAlign='center';ctx.font=`${big?'600 ':''}${fs}px system-ui`;ctx.fillText(lbl,0,0);ctx.restore();
  }
  function dimW(y,x1,x2,lbl,big){
    const fs=big?Math.max(7,Math.round(sc*19)):Math.max(6,Math.round(sc*15));
    ctx.lineWidth=big?.8:.4;ctx.setLineDash(big?[]:[2,2]);
    ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(x1,y-3);ctx.lineTo(x1,y+3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x2,y-3);ctx.lineTo(x2,y+3);ctx.stroke();
    ctx.textAlign='center';ctx.font=`${big?'600 ':''}${fs}px system-ui`;
    ctx.fillText(lbl,(x1+x2)/2,y-(big?6:4));
  }
  // Cotation H totale (gauche) — cliquable → non éditable directement (modèle)
  dimW(sy(0)-24,sx(0),sx(w),`${w} mm`,true);
  dimW(sy(0)-13,sx(intX),sx(intX+intW),`${intW} mm`,false);
  dimH(sx(0)-34,sy(0),sy(h),`${h} mm`,true);
  const ex=sx(w)+22;
  zones.forEach(z=>{
    const cx=ex+(z.type==='rail'?13:0);
    const cy=(sy(z.y)+sy(z.y+z.h))/2;
    dimH(cx,sy(z.y),sy(z.y+z.h),`${z.h}`,false);
    if(z.type==='goulH'){
      // Cote hauteur GH → édite le champ gh-h
      COTE_HITS.push({x:cx-10,y:cy,r:20,val:z.h,min:20,max:200,
        onSubmit:v=>{const el=document.getElementById('gh-h');el.value=v;el.dispatchEvent(new Event('input'));draw();}});
    } else if(z.type==='rail'){
      // Cote hauteur rail → non modifiable (fixe RAIL_H), mais affiche l'espacement
    }
  });
  // Cote hauteur totale (gauche) — édite nb-app via prompt simplifié
  COTE_HITS.push({x:sx(0)-34,y:(sy(0)+sy(h))/2,r:20,val:h,min:600,max:2000,
    onSubmit:_=>alert('Modifiez la hauteur via le menu "Modèle".')});
  // Cote espacement rails (bas de chaque zone rail, côté droit)
  zones.filter(z=>z.type==='rail').forEach(z=>{
    const cx=ex+13+14,cy=(sy(z.y)+sy(z.y+z.h))/2;
    COTE_HITS.push({x:cx,y:cy,r:16,val:espR,min:0,max:50,
      onSubmit:v=>{const el=document.getElementById('esp-r');el.value=v;el.dispatchEvent(new Event('input'));}});
  });
}

// ═══════════════════════════════════════════════════════════════════════
// VUE 3D ISOMÉTRIQUE — projection oblique cabinet
// ═══════════════════════════════════════════════════════════════════════
function drawIsoView(layout){
  const cv=document.getElementById('cv-iso');
  if(!cv||cv.style.display==='none')return;
  const{m,w,h,intX,intW,zones}=layout;
  const thick=THK();
  const sc=getSc()*.9;               // échelle sans zoom (vue fixe)
  const dA=Math.PI/6;               // angle 30° pour profondeur
  const dF=0.45;                    // facteur raccourcissement profondeur
  const OX=Math.round(thick*dF*Math.cos(dA)*sc)+50;
  const OY=20;
  const CW=Math.round(w*sc)+OX+40;
  const CH=Math.round(h*sc)+Math.round(thick*dF*Math.sin(dA)*sc)+OY+30;
  cv.width=CW;cv.height=CH;cv.style.width=CW+'px';cv.style.height=CH+'px';
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,CW,CH);

  // Projection (x=largeur, y=hauteur, z=profondeur depuis avant)
  function proj(x,y,z){
    return[
      OX+x*sc+z*sc*dF*Math.cos(dA),
      OY+y*sc-z*sc*dF*Math.sin(dA)
    ];
  }
  function projPt(x,y,z){const[px,py]=proj(x,y,z);return{x:px,y:py};}

  // Helper : polygone 4 points
  function poly4(pts,fill,stroke,lw){
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
    pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||.7;ctx.stroke();}
  }

  // ── Face arrière (mat ABS)
  poly4([projPt(0,0,thick),projPt(w,0,thick),projPt(w,h,thick),projPt(0,h,thick)],
    '#A8B8C8','#5870A0',1);

  // ── Face haute (top)
  const tg=ctx.createLinearGradient(...Object.values(projPt(0,0,0)),
    ...Object.values(projPt(0,0,thick)));
  tg.addColorStop(0,'#C8D8E8');tg.addColorStop(1,'#9AAABB');
  poly4([projPt(0,0,0),projPt(w,0,0),projPt(w,0,thick),projPt(0,0,thick)],null,'#708098',.8);
  ctx.fillStyle=tg;ctx.fill();

  // ── Face côté droit
  const rg=ctx.createLinearGradient(...Object.values(projPt(w,0,0)),
    ...Object.values(projPt(w,0,thick)));
  rg.addColorStop(0,'#B0C0D0');rg.addColorStop(1,'#8898A8');
  poly4([projPt(w,0,0),projPt(w,h,0),projPt(w,h,thick),projPt(w,0,thick)],null,'#708098',.8);
  ctx.fillStyle=rg;ctx.fill();

  // ── Face avant — fond gradient
  const fg=ctx.createLinearGradient(...Object.values(projPt(0,0,0)),
    ...Object.values(projPt(w,h,0)));
  fg.addColorStop(0,'#E8F2FC');fg.addColorStop(1,'#D2E6F6');
  const fpts=[projPt(0,0,0),projPt(w,0,0),projPt(w,h,0),projPt(0,h,0)];
  poly4(fpts,null,'#5B9FD4',1.5);ctx.fillStyle=fg;ctx.fill();

  // ── Bandes tôle haut/bas (presse-étoupes)
  [[0,m],[h-m,m]].forEach(([by,bh],bi)=>{
    const grad=ctx.createLinearGradient(...Object.values(projPt(0,by,0)),
      ...Object.values(projPt(0,by+bh,0)));
    grad.addColorStop(0,bi===0?'#B8C8D8':'#A8BCC8');
    grad.addColorStop(1,bi===0?'#A8BCC8':'#98ACBC');
    poly4([projPt(0,by,0),projPt(w,by,0),projPt(w,by+bh,0),projPt(0,by+bh,0)],null,'#889AAA',.5);
    ctx.fillStyle=grad;ctx.fill();
  });

  // ── Goulottes verticales GV1, GV2
  [[m,VGOUL_W],[w-m-VGOUL_W,VGOUL_W]].forEach(([gx,gw])=>{
    const goulD=40;
    poly4([projPt(gx,m,0),projPt(gx+gw,m,0),projPt(gx+gw,h-m,0),projPt(gx,h-m,0)],
      '#FAECE7','#D85A30',.6);
    // Profondeur goulotte
    poly4([projPt(gx,m,0),projPt(gx+gw,m,0),projPt(gx+gw,m,goulD),projPt(gx,m,goulD)],
      '#E8D8D0','#D85A30',.5);
  });

  // ── Zones horizontales
  zones.forEach(z=>{
    if(z.type==='goulH'){
      const goulD=getZD(z);
      // Face avant goulotte
      poly4([projPt(intX,z.y,0),projPt(intX+intW,z.y,0),projPt(intX+intW,z.y+z.h,0),projPt(intX,z.y+z.h,0)],
        '#FAECE7','#D85A30',.5);
      // Dessus goulotte (profondeur)
      poly4([projPt(intX,z.y,0),projPt(intX+intW,z.y,0),projPt(intX+intW,z.y,goulD),projPt(intX,z.y,goulD)],
        '#F0D8D0','#D85A30',.4);
      // Label
      const[lx,ly]=proj(intX+5,z.y+z.h/2,0);
      ctx.font='500 '+(Math.max(6,Math.round(z.h*sc*.4)))+'px system-ui';
      ctx.fillStyle='#A04010';ctx.textAlign='left';ctx.fillText(z.label,lx,ly+3);
    } else if(z.type==='rail'){
      const railD=getZD(z);
      const railFZ=RAIL_FRONT_Z[z.label]!==undefined?RAIL_FRONT_Z[z.label]:Math.round(railD*.25);
      // Face avant du rail
      poly4([projPt(intX,z.y,0),projPt(intX+intW,z.y,0),projPt(intX+intW,z.y+z.h,0),projPt(intX,z.y+z.h,0)],
        '#D8D8D8','#909090',.5);
      // Rail DIN en 3D (face du rail visible)
      const rY=z.y+(RAIL_H-z.h)/2+z.h/2-5;
      poly4([projPt(intX,rY,railFZ),projPt(intX+intW,rY,railFZ),
             projPt(intX+intW,rY+10,railFZ),projPt(intX,rY+10,railFZ)],
        '#EEEEEE','#777',.5);
      // Dessus rail (profondeur)
      poly4([projPt(intX,z.y,0),projPt(intX+intW,z.y,0),
             projPt(intX+intW,z.y,railD),projPt(intX,z.y,railD)],
        '#C8D0D8','#909090',.4);
      // Composants sur ce rail
      PLACED.filter(p=>p.type==='comp'&&p.railRef?.label===z.label).forEach(p=>{
        const c=p.comp;
        const cz=railFZ+1;
        // Face avant composant
        const[cx0,cy0]=proj(p.wx,p.wy,cz);
        const[cx1,cy1]=proj(p.wx+c.modW,p.wy,cz);
        const[cx2,cy2]=proj(p.wx+c.modW,p.wy+c.modH,cz);
        const[cx3,cy3]=proj(p.wx,p.wy+c.modH,cz);
        ctx.beginPath();ctx.moveTo(cx0,cy0);ctx.lineTo(cx1,cy1);ctx.lineTo(cx2,cy2);ctx.lineTo(cx3,cy3);ctx.closePath();
        ctx.fillStyle=c.color+'CC';ctx.fill();
        ctx.strokeStyle=c.color;ctx.lineWidth=.6;ctx.stroke();
        // Dessus composant
        const cd=c.modH*.3;
        const[tx0,ty0]=proj(p.wx,p.wy,cz);
        const[tx1,ty1]=proj(p.wx+c.modW,p.wy,cz);
        const[tx2,ty2]=proj(p.wx+c.modW,p.wy,cz+cd);
        const[tx3,ty3]=proj(p.wx,p.wy,cz+cd);
        ctx.beginPath();ctx.moveTo(tx0,ty0);ctx.lineTo(tx1,ty1);ctx.lineTo(tx2,ty2);ctx.lineTo(tx3,ty3);ctx.closePath();
        const tg2=ctx.createLinearGradient(tx0,ty0,tx2,ty2);
        tg2.addColorStop(0,c.color+'99');tg2.addColorStop(1,c.color+'44');
        ctx.fillStyle=tg2;ctx.fill();ctx.strokeStyle=c.color+'88';ctx.lineWidth=.4;ctx.stroke();
        // Label
        if(c.modW*sc>14){
          const[lx,ly]=proj(p.wx+c.modW/2,p.wy+c.modH*.7,cz);
          ctx.font='bold '+(Math.max(5,Math.round(c.modW*sc*.1)))+'px system-ui';
          ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(p.label||c.name.slice(0,4),lx,ly+2);
        }
      });
    }
  });

  // ── Contour face avant
  ctx.beginPath();ctx.moveTo(fpts[0].x,fpts[0].y);
  fpts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();
  ctx.strokeStyle='#5B9FD4';ctx.lineWidth=1.5;ctx.stroke();

  // ── Arêtes 3D
  [[projPt(0,0,0),projPt(0,0,thick)],[projPt(w,0,0),projPt(w,0,thick)],
   [projPt(0,h,0),projPt(0,h,thick)],[projPt(w,h,0),projPt(w,h,thick)]].forEach(([a,b])=>{
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.strokeStyle='rgba(80,90,110,.5)';ctx.lineWidth=1;ctx.stroke();
  });

  // ── Titre
  ctx.font='bold 9px system-ui';ctx.fillStyle='#5870A0';ctx.textAlign='left';
  ctx.fillText(`Vue 3D — ${w}×${h}mm ép.${thick}mm`,OX,CH-8);
}
