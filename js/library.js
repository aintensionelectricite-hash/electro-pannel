const COMPS=[
  // ── LEGRAND DX3 — Sectionneurs
  {id:'lgst2p63', name:'DX3 Sect.2P 63A', sub:'Réf.400710 — 17.5kA', brand:'Legrand DX3', group:'Sectionneurs', poles:2, modW:35, modH:85, type:'sect', color:'#CC2020', ref:'400710'},
  {id:'lgst2p100',name:'DX3 Sect.2P 100A',sub:'Réf.400711 — 17.5kA', brand:'Legrand DX3', group:'Sectionneurs', poles:2, modW:35, modH:85, type:'sect', color:'#CC2020', ref:'400711'},
  {id:'lgst4p63', name:'DX3 Sect.4P 63A', sub:'Réf.400720 — 17.5kA', brand:'Legrand DX3', group:'Sectionneurs', poles:4, modW:70, modH:85, type:'sect', color:'#CC2020', ref:'400720'},
  {id:'lgst4p100',name:'DX3 Sect.4P 100A',sub:'Réf.400721 — 17.5kA', brand:'Legrand DX3', group:'Sectionneurs', poles:4, modW:70, modH:85, type:'sect', color:'#CC2020', ref:'400721'},

  // ── LEGRAND DX3 — Disjoncteurs 1P (DX3-E, 6kA, courbe C)
  {id:'lg1p6',  name:'DX3-E 1P  6A', sub:'Réf.407710  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407710', conn:'std'},
  {id:'lg1p10', name:'DX3-E 1P 10A', sub:'Réf.407712  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407712', conn:'std'},
  {id:'lg1p16', name:'DX3-E 1P 16A', sub:'Réf.407714  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407714', conn:'std'},
  {id:'lg1p20', name:'DX3-E 1P 20A', sub:'Réf.407716  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407716', conn:'std'},
  {id:'lg1p25', name:'DX3-E 1P 25A', sub:'Réf.407717  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407717', conn:'std'},
  {id:'lg1p32', name:'DX3-E 1P 32A', sub:'Réf.407718  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407718', conn:'std'},
  {id:'lg1p40', name:'DX3-E 1P 40A', sub:'Réf.407720  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407720', conn:'std'},
  {id:'lg1p50', name:'DX3-E 1P 50A', sub:'Réf.407722  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407722', conn:'std'},
  {id:'lg1p63', name:'DX3-E 1P 63A', sub:'Réf.407724  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407724', conn:'std'},
  // XP peignable
  {id:'lg1p16xp',name:'DX3-E 1P 16A XP',sub:'Réf.407774 Peignable',  brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407774', conn:'xp'},
  {id:'lg1p20xp',name:'DX3-E 1P 20A XP',sub:'Réf.407776 Peignable',  brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407776', conn:'xp'},
  {id:'lg1p25xp',name:'DX3-E 1P 25A XP',sub:'Réf.407777 Peignable',  brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407777', conn:'xp'},
  {id:'lg1p32xp',name:'DX3-E 1P 32A XP',sub:'Réf.407778 Peignable',  brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407778', conn:'xp'},
  // XE embrochable
  {id:'lg1p16xe',name:'DX3-E 1P 16A XE',sub:'Réf.407834 Embrochable',brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407834', conn:'xe'},
  {id:'lg1p20xe',name:'DX3-E 1P 20A XE',sub:'Réf.407836 Embrochable',brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407836', conn:'xe'},
  {id:'lg1p25xe',name:'DX3-E 1P 25A XE',sub:'Réf.407837 Embrochable',brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407837', conn:'xe'},
  {id:'lg1p32xe',name:'DX3-E 1P 32A XE',sub:'Réf.407838 Embrochable',brand:'Legrand DX3', group:'Disjoncteurs 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#CC2020', ref:'407838', conn:'xe'},

  // ── LEGRAND DX3 — Disjoncteurs 2P
  {id:'lg2p6',  name:'DX3-E 2P  6A', sub:'Réf.407800  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407800', conn:'std'},
  {id:'lg2p10', name:'DX3-E 2P 10A', sub:'Réf.407802  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407802', conn:'std'},
  {id:'lg2p16', name:'DX3-E 2P 16A', sub:'Réf.407804  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407804', conn:'std'},
  {id:'lg2p20', name:'DX3-E 2P 20A', sub:'Réf.407806  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407806', conn:'std'},
  {id:'lg2p25', name:'DX3-E 2P 25A', sub:'Réf.407808  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407808', conn:'std'},
  {id:'lg2p32', name:'DX3-E 2P 32A', sub:'Réf.407810  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407810', conn:'std'},
  {id:'lg2p40', name:'DX3-E 2P 40A', sub:'Réf.407812  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407812', conn:'std'},
  {id:'lg2p63', name:'DX3-E 2P 63A', sub:'Réf.407816  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407816', conn:'std'},
  {id:'lg2p16xp',name:'DX3-E 2P 16A XP',sub:'Réf.407864 Peignable', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407864', conn:'xp'},
  {id:'lg2p25xp',name:'DX3-E 2P 25A XP',sub:'Réf.407867 Peignable', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407867', conn:'xp'},
  {id:'lg2p32xp',name:'DX3-E 2P 32A XP',sub:'Réf.407868 Peignable', brand:'Legrand DX3', group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407868', conn:'xp'},
  {id:'lg2p16xe',name:'DX3-E 2P 16A XE',sub:'Réf.407904 Embrochable',brand:'Legrand DX3',group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407904', conn:'xe'},
  {id:'lg2p25xe',name:'DX3-E 2P 25A XE',sub:'Réf.407907 Embrochable',brand:'Legrand DX3',group:'Disjoncteurs 2P', poles:2, modW:35, modH:85, type:'disj', color:'#CC2020', ref:'407907', conn:'xe'},

  // ── LEGRAND DX3 — Disjoncteurs 4P
  {id:'lg4p6',  name:'DX3-E 4P  6A', sub:'Réf.407880  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407880', conn:'std'},
  {id:'lg4p10', name:'DX3-E 4P 10A', sub:'Réf.407882  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407882', conn:'std'},
  {id:'lg4p16', name:'DX3-E 4P 16A', sub:'Réf.407884  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407884', conn:'std'},
  {id:'lg4p20', name:'DX3-E 4P 20A', sub:'Réf.407886  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407886', conn:'std'},
  {id:'lg4p25', name:'DX3-E 4P 25A', sub:'Réf.407888  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407888', conn:'std'},
  {id:'lg4p32', name:'DX3-E 4P 32A', sub:'Réf.407890  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407890', conn:'std'},
  {id:'lg4p40', name:'DX3-E 4P 40A', sub:'Réf.407892  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407892', conn:'std'},
  {id:'lg4p63', name:'DX3-E 4P 63A', sub:'Réf.407896  6kA courbe C', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407896', conn:'std'},
  {id:'lg4p25xp',name:'DX3-E 4P 25A XP',sub:'Réf.407947 Peignable', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407947', conn:'xp'},
  {id:'lg4p40xp',name:'DX3-E 4P 40A XP',sub:'Réf.407950 Peignable', brand:'Legrand DX3', group:'Disjoncteurs 4P', poles:4, modW:70, modH:85, type:'disj', color:'#CC2020', ref:'407950', conn:'xp'},

  // ── LEGRAND DX3 — Disjoncteurs différentiels (DDX3-E, 1P+N)
  {id:'lgdd6',  name:'DDX3-E 1P+N  6A 30mA',sub:'Réf.411662 AC',  brand:'Legrand DX3', group:'Différentiels 1P+N', poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'411662'},
  {id:'lgdd10', name:'DDX3-E 1P+N 10A 30mA',sub:'Réf.411664 AC',  brand:'Legrand DX3', group:'Différentiels 1P+N', poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'411664'},
  {id:'lgdd16', name:'DDX3-E 1P+N 16A 30mA',sub:'Réf.411666 AC',  brand:'Legrand DX3', group:'Différentiels 1P+N', poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'411666'},
  {id:'lgdd20', name:'DDX3-E 1P+N 20A 30mA',sub:'Réf.411668 AC',  brand:'Legrand DX3', group:'Différentiels 1P+N', poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'411668'},
  {id:'lgdd25', name:'DDX3-E 1P+N 25A 30mA',sub:'Réf.411670 AC',  brand:'Legrand DX3', group:'Différentiels 1P+N', poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'411670'},
  {id:'lgdd32', name:'DDX3-E 1P+N 32A 30mA',sub:'Réf.411672 AC',  brand:'Legrand DX3', group:'Différentiels 1P+N', poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'411672'},
  // TX3 blocs différentiels 2P
  {id:'lgtx2p25', name:'TX3 2P 25A 30mA', sub:'Réf.403013 AC 2P', brand:'Legrand DX3', group:'Blocs diff. 2P',     poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'403013'},
  {id:'lgtx2p40', name:'TX3 2P 40A 30mA', sub:'Réf.403015 AC 2P', brand:'Legrand DX3', group:'Blocs diff. 2P',     poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'403015'},
  {id:'lgtx2p63', name:'TX3 2P 63A 30mA', sub:'Réf.403017 AC 2P', brand:'Legrand DX3', group:'Blocs diff. 2P',     poles:2, modW:35, modH:85, type:'diff', color:'#CC2020', ref:'403017'},
  {id:'lgtx4p40', name:'TX3 4P 40A 30mA', sub:'Réf.403045 AC 4P', brand:'Legrand DX3', group:'Blocs diff. 4P',     poles:4, modW:70, modH:85, type:'diff', color:'#CC2020', ref:'403045'},
  {id:'lgtx4p63', name:'TX3 4P 63A 30mA', sub:'Réf.403047 AC 4P', brand:'Legrand DX3', group:'Blocs diff. 4P',     poles:4, modW:70, modH:85, type:'diff', color:'#CC2020', ref:'403047'},

  // ── SCHNEIDER ACTI9 — Sectionneurs iSW-NA
  {id:'sw2p40', name:'iSW-NA 2P 40A', sub:'A9S60240 — 14.5kA',brand:'Schneider Acti9', group:'Sectionneurs', poles:2, modW:36, modH:85, type:'sect', color:'#009c41', ref:'A9S60240'},
  {id:'sw2p63', name:'iSW-NA 2P 63A', sub:'A9S60263 — 14.5kA',brand:'Schneider Acti9', group:'Sectionneurs', poles:2, modW:36, modH:85, type:'sect', color:'#009c41', ref:'A9S60263'},
  {id:'sw2p100',name:'iSW-NA 2P 100A',sub:'A9S60299 — 14.5kA',brand:'Schneider Acti9', group:'Sectionneurs', poles:2, modW:36, modH:85, type:'sect', color:'#009c41', ref:'A9S60299'},
  {id:'sw4p40', name:'iSW-NA 4P 40A', sub:'A9S60440 — 14.5kA',brand:'Schneider Acti9', group:'Sectionneurs', poles:4, modW:72, modH:85, type:'sect', color:'#009c41', ref:'A9S60440'},
  {id:'sw4p63', name:'iSW-NA 4P 63A', sub:'A9S60463 — 14.5kA',brand:'Schneider Acti9', group:'Sectionneurs', poles:4, modW:72, modH:85, type:'sect', color:'#009c41', ref:'A9S60463'},
  {id:'sw4p100',name:'iSW-NA 4P 100A',sub:'A9S60499 — 14.5kA',brand:'Schneider Acti9', group:'Sectionneurs', poles:4, modW:72, modH:85, type:'sect', color:'#009c41', ref:'A9S60499'},

  // ── SCHNEIDER ACTI9 iC60N — 1P (17.5mm, 6kA cour.C)
  {id:'d1p6',  name:'iC60N 1P  6A', sub:'A9F74106  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74106', conn:'std'},
  {id:'d1p10', name:'iC60N 1P 10A', sub:'A9F74110  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74110', conn:'std'},
  {id:'d1p16', name:'iC60N 1P 16A', sub:'A9F74116  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74116', conn:'std'},
  {id:'d1p20', name:'iC60N 1P 20A', sub:'A9F74120  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74120', conn:'std'},
  {id:'d1p25', name:'iC60N 1P 25A', sub:'A9F74125  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74125', conn:'std'},
  {id:'d1p32', name:'iC60N 1P 32A', sub:'A9F74132  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74132', conn:'std'},
  {id:'d1p40', name:'iC60N 1P 40A', sub:'A9F74140  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74140', conn:'std'},
  {id:'d1p50', name:'iC60N 1P 50A', sub:'A9F74150  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74150', conn:'std'},
  {id:'d1p63', name:'iC60N 1P 63A', sub:'A9F74163  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74163', conn:'std'},
  // XP peignable
  {id:'d1p',   name:'iC60N 1P 6-63A',sub:'A9F7xx XP peignable', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9F7xx', conn:'xp'},
  // XE embrochable (socle iC60)
  {id:'d1pxe', name:'iC60N 1P 6-63A',sub:'XE + socle A9C70100', brand:'Schneider Acti9', group:'iC60N 1P', poles:1, modW:17.5, modH:85, type:'disj', color:'#009c41', ref:'A9C701xx', conn:'xe'},

  // ── SCHNEIDER ACTI9 iC60N — 2P
  {id:'d2p6',  name:'iC60N 2P  6A', sub:'A9F74206  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74206', conn:'std'},
  {id:'d2p10', name:'iC60N 2P 10A', sub:'A9F74210  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74210', conn:'std'},
  {id:'d2p16', name:'iC60N 2P 16A', sub:'A9F74216  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74216', conn:'std'},
  {id:'d2p20', name:'iC60N 2P 20A', sub:'A9F74220  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74220', conn:'std'},
  {id:'d2p25', name:'iC60N 2P 25A', sub:'A9F74225  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74225', conn:'std'},
  {id:'d2p32', name:'iC60N 2P 32A', sub:'A9F74232  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74232', conn:'std'},
  {id:'d2p40', name:'iC60N 2P 40A', sub:'A9F74240  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74240', conn:'std'},
  {id:'d2p63', name:'iC60N 2P 63A', sub:'A9F74263  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F74263', conn:'std'},
  {id:'d2pxp', name:'iC60N 2P XP',  sub:'A9F7xx XP peignable',  brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9F7xxP', conn:'xp'},
  {id:'d2pxe', name:'iC60N 2P XE',  sub:'XE + socle A9C70200',  brand:'Schneider Acti9', group:'iC60N 2P', poles:2, modW:35, modH:85, type:'disj', color:'#009c41', ref:'A9C702xx', conn:'xe'},

  // ── SCHNEIDER ACTI9 iC60N — 3P
  {id:'d3p6',  name:'iC60N 3P  6A', sub:'A9F74306  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74306', conn:'std'},
  {id:'d3p10', name:'iC60N 3P 10A', sub:'A9F74310  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74310', conn:'std'},
  {id:'d3p16', name:'iC60N 3P 16A', sub:'A9F74316  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74316', conn:'std'},
  {id:'d3p20', name:'iC60N 3P 20A', sub:'A9F74320  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74320', conn:'std'},
  {id:'d3p25', name:'iC60N 3P 25A', sub:'A9F74325  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74325', conn:'std'},
  {id:'d3p32', name:'iC60N 3P 32A', sub:'A9F74332  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74332', conn:'std'},
  {id:'d3p40', name:'iC60N 3P 40A', sub:'A9F74340  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74340', conn:'std'},
  {id:'d3p63', name:'iC60N 3P 63A', sub:'A9F74363  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 3P', poles:3, modW:52.5, modH:85, type:'disj', color:'#009c41', ref:'A9F74363', conn:'std'},

  // ── SCHNEIDER ACTI9 iC60N — 4P
  {id:'d4p6',  name:'iC60N 4P  6A', sub:'A9F74406  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74406', conn:'std'},
  {id:'d4p10', name:'iC60N 4P 10A', sub:'A9F74410  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74410', conn:'std'},
  {id:'d4p16', name:'iC60N 4P 16A', sub:'A9F74416  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74416', conn:'std'},
  {id:'d4p20', name:'iC60N 4P 20A', sub:'A9F74420  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74420', conn:'std'},
  {id:'d4p25', name:'iC60N 4P 25A', sub:'A9F74425  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74425', conn:'std'},
  {id:'d4p32', name:'iC60N 4P 32A', sub:'A9F74432  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74432', conn:'std'},
  {id:'d4p40', name:'iC60N 4P 40A', sub:'A9F74440  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74440', conn:'std'},
  {id:'d4p63', name:'iC60N 4P 63A', sub:'A9F74463  6kA cour.C', brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F74463', conn:'std'},
  {id:'d4pxp', name:'iC60N 4P XP',  sub:'A9F7xx XP peignable',  brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9F7xxP', conn:'xp'},
  {id:'d4pxe', name:'iC60N 4P XE',  sub:'XE + socle A9C70400',  brand:'Schneider Acti9', group:'iC60N 4P', poles:4, modW:70, modH:85, type:'disj', color:'#009c41', ref:'A9C704xx', conn:'xe'},

  // ── SCHNEIDER ACTI9 — Interrupteurs différentiels iID
  {id:'df2',  name:'iID 2P 25A 30mA',  sub:'A9R11225 AC 30mA',  brand:'Schneider Acti9', group:'Diff. iID 2P', poles:2, modW:35,  modH:90, type:'diff', color:'#009c41', ref:'A9R11225'},
  {id:'df2b', name:'iID 2P 40A 30mA',  sub:'A9R11240 AC 30mA',  brand:'Schneider Acti9', group:'Diff. iID 2P', poles:2, modW:35,  modH:90, type:'diff', color:'#009c41', ref:'A9R11240'},
  {id:'df2c', name:'iID 2P 63A 30mA',  sub:'A9R11263 AC 30mA',  brand:'Schneider Acti9', group:'Diff. iID 2P', poles:2, modW:35,  modH:90, type:'diff', color:'#009c41', ref:'A9R11263'},
  {id:'df2r', name:'iID 2P 25A 300mA', sub:'A9R12225 AC 300mA', brand:'Schneider Acti9', group:'Diff. iID 2P', poles:2, modW:35,  modH:90, type:'diff', color:'#009c41', ref:'A9R12225'},
  {id:'df2s', name:'iID 2P 40A 300mA', sub:'A9R12240 AC 300mA', brand:'Schneider Acti9', group:'Diff. iID 2P', poles:2, modW:35,  modH:90, type:'diff', color:'#009c41', ref:'A9R12240'},
  {id:'df4',  name:'iID 4P 25A 30mA',  sub:'A9R11425 AC 30mA',  brand:'Schneider Acti9', group:'Diff. iID 4P', poles:4, modW:70,  modH:90, type:'diff', color:'#009c41', ref:'A9R11425'},
  {id:'df4b', name:'iID 4P 40A 30mA',  sub:'A9R11440 AC 30mA',  brand:'Schneider Acti9', group:'Diff. iID 4P', poles:4, modW:70,  modH:90, type:'diff', color:'#009c41', ref:'A9R11440'},
  {id:'df4c', name:'iID 4P 63A 30mA',  sub:'A9R11463 AC 30mA',  brand:'Schneider Acti9', group:'Diff. iID 4P', poles:4, modW:70,  modH:90, type:'diff', color:'#009c41', ref:'A9R11463'},
  {id:'df4r', name:'iID 4P 40A 300mA', sub:'A9R12440 AC 300mA', brand:'Schneider Acti9', group:'Diff. iID 4P', poles:4, modW:70,  modH:90, type:'diff', color:'#009c41', ref:'A9R12440'},

  // ── ACCESSOIRES
  {id:'pg12', name:'Peigne 12P', sub:'pas 9mm',      brand:'Accessoires', group:'Peignes/Barres', poles:12,modW:108, modH:10, type:'peigne', color:'#993C1D'},
  {id:'pg24', name:'Peigne 24P', sub:'pas 9mm',      brand:'Accessoires', group:'Peignes/Barres', poles:24,modW:216, modH:10, type:'peigne', color:'#993C1D'},
  {id:'rep4', name:'Répart. 4B', sub:'4 barreaux',   brand:'Accessoires', group:'Peignes/Barres', poles:4, modW:60,  modH:40, type:'repartiteur',color:'#534AB7'},
  {id:'rp5',  name:'Rép.pot. 5P',sub:'5 pts monopot',brand:'Accessoires', group:'Peignes/Barres', poles:5, modW:45,  modH:18, type:'repot', color:'#B06000'},
  {id:'rp8',  name:'Rép.pot. 8P',sub:'8 pts monopot',brand:'Accessoires', group:'Peignes/Barres', poles:8, modW:72,  modH:18, type:'repot', color:'#B06000'},

  // ── BORNIERS Phoenix Contact UTTB
  {id:'ph15',name:'UTTB 1.5', sub:'5.2×51mm Réf.3044088', brand:'Borniers', group:'Phoenix Contact', poles:1, modW:5.2, modH:51, type:'bornier',color:'#E85C00'},
  {id:'ph25',name:'UTTB 2.5', sub:'6.2×51mm Réf.3044130', brand:'Borniers', group:'Phoenix Contact', poles:1, modW:6.2, modH:51, type:'bornier',color:'#E85C00'},
  {id:'ph6', name:'UTTB 6',   sub:'8.2×51mm Réf.3044172', brand:'Borniers', group:'Phoenix Contact', poles:1, modW:8.2, modH:51, type:'bornier',color:'#E85C00'},
  // Schneider Linergy TR
  {id:'sn15',name:'Linergy 1.5',sub:'5.2×55mm NSYTRR15',  brand:'Borniers', group:'Schneider Linergy',poles:1,modW:5.2, modH:55, type:'bornier',color:'#3DBA4C'},
  {id:'sn25',name:'Linergy 2.5',sub:'6.2×55mm NSYTRR25',  brand:'Borniers', group:'Schneider Linergy',poles:1,modW:6.2, modH:55, type:'bornier',color:'#3DBA4C'},
  {id:'sn6', name:'Linergy 6',  sub:'8.2×55mm NSYTRR6',   brand:'Borniers', group:'Schneider Linergy',poles:1,modW:8.2, modH:55, type:'bornier',color:'#3DBA4C'},
  // Wago 2002
  {id:'wg15',name:'Wago 1.5', sub:'5×51mm 2002-1201',   brand:'Borniers', group:'Wago 2002',       poles:1, modW:5, modH:51, type:'bornier',color:'#C89800'},
  {id:'wg25',name:'Wago 2.5', sub:'6×51mm 2002-1221',   brand:'Borniers', group:'Wago 2002',       poles:1, modW:6, modH:51, type:'bornier',color:'#C89800'},
  {id:'wg6', name:'Wago 6',   sub:'8×51mm 2002-1261',   brand:'Borniers', group:'Wago 2002',       poles:1, modW:8, modH:51, type:'bornier',color:'#C89800'},
  // Entrelec/ABB
  {id:'en10',name:'Entrelec 10',sub:'10×61mm 1SNA165552R',brand:'Borniers', group:'Entrelec/ABB',   poles:1, modW:10, modH:61, type:'bornier',color:'#7A5E40'},
  {id:'en16',name:'Entrelec 16',sub:'12×61mm 1SNA165553R',brand:'Borniers', group:'Entrelec/ABB',   poles:1, modW:12, modH:61, type:'bornier',color:'#7A5E40'},
  {id:'en25',name:'Entrelec 25',sub:'16×65mm 1SNA165555R',brand:'Borniers', group:'Entrelec/ABB',   poles:1, modW:16, modH:65, type:'bornier',color:'#7A5E40'},

  // ── PRESSE-ÉTOUPES
  {id:'pe16',name:'PE ISO 16',sub:'Ø16mm — M16',brand:'Presse-étoupes',group:'Presse-étoupes',poles:1,modW:16,modH:16,type:'petoupe',color:'#505050',isoD:16},
  {id:'pe20',name:'PE ISO 20',sub:'Ø20mm — M20',brand:'Presse-étoupes',group:'Presse-étoupes',poles:1,modW:20,modH:20,type:'petoupe',color:'#505050',isoD:20},
  {id:'pe26',name:'PE ISO 26',sub:'Ø26mm — M25',brand:'Presse-étoupes',group:'Presse-étoupes',poles:1,modW:26,modH:26,type:'petoupe',color:'#505050',isoD:26},
  {id:'pe32',name:'PE ISO 32',sub:'Ø32mm — M32',brand:'Presse-étoupes',group:'Presse-étoupes',poles:1,modW:32,modH:32,type:'petoupe',color:'#505050',isoD:32},

  // ── SIGNALISATION (porte)
  {id:'vv', name:'Voyant vert',  sub:'Ø22mm LED',brand:'Signalisation',group:'Voyants Ø22mm',poles:1,modW:22,modH:22,type:'voyant',color:'#00A830'},
  {id:'vr', name:'Voyant rouge', sub:'Ø22mm LED',brand:'Signalisation',group:'Voyants Ø22mm',poles:1,modW:22,modH:22,type:'voyant',color:'#CC1010'},
  {id:'vo', name:'Voyant orange',sub:'Ø22mm LED',brand:'Signalisation',group:'Voyants Ø22mm',poles:1,modW:22,modH:22,type:'voyant',color:'#E07000'},
  {id:'vb', name:'Voyant blanc', sub:'Ø22mm LED',brand:'Signalisation',group:'Voyants Ø22mm',poles:1,modW:22,modH:22,type:'voyant',color:'#D8D8D8'},
  {id:'vbl',name:'Voyant bleu',  sub:'Ø22mm LED',brand:'Signalisation',group:'Voyants Ø22mm',poles:1,modW:22,modH:22,type:'voyant',color:'#0050CC'},
];

const BRAND_COLORS={'Legrand DX3':'#CC2020','Schneider Acti9':'#009c41',
  'Borniers':'#E85C00','Accessoires':'#534AB7',
  'Presse-étoupes':'#505050','Signalisation':'#6B3DA6'};
