/* Ajustes de vistas: conserva íntegro el modelo semántico. */
function all(root){let a=[];function w(x){if(!x||typeof x!=='object')return;if(x._type)a.push(x);Object.values(x).forEach(w)}w(root);return a}
function adjust(root,file){
 let items=all(root),map=new Map(items.map(x=>[x._id,x]));const get=r=>map.get(r?.$ref),model=v=>get(v.model);
 const ref=x=>({$ref:x._id});
 function box(v,x,y,w,h){const dx=x-v.left,dy=y-v.top;for(const s of all(v)){if(typeof s.left==='number')s.left+=dx;if(typeof s.top==='number')s.top+=dy;if(s.font)s.font='Arial;13;'+(s.font.split(';')[2]||'0');s.showShadow=false;}Object.assign(v,{left:x,top:y,width:w,height:h});const nc=get(v.nameCompartment);if(nc)Object.assign(nc,{left:x,top:y,width:w,height:25});const nl=get(nc?.nameLabel||v.nameLabel);if(nl)Object.assign(nl,{left:x+6,top:y+6,width:w-12,height:18,wordWrap:true});
  if(v._type.startsWith('DFD')){for(const s of all(v).filter(x=>x._type==='LabelView'))s.visible=false;if(nl)Object.assign(nl,{visible:true,font:'Arial;13;0',height:32,top:y+(v.idLabel?24:8)});const il=get(v.idLabel);if(il)Object.assign(il,{visible:!!model(v).id,left:x+7,top:y+4,width:w-14,height:16,font:'Arial;13;0'});}
 }
 function route(v,pts,style=0){v.points=pts.map(p=>p.map(Math.round).join(':')).join(';');v.lineStyle=style;for(const s of all(v)){s.showShadow=false;if(s.font)s.font='Arial;12;0';}const l=get(v.nameLabel);if(l){l.distance=12;l.alpha=Math.PI/2;}}
 const center=v=>[v.left+v.width/2,v.top+v.height/2];
 function endpoints(v){return [get(v.tail),get(v.head)]}
 for(const d of items.filter(x=>x._type?.endsWith('Diagram'))){
  const notes=d.ownedViews?.filter(v=>v._type==='UMLNoteView')||[];
  if(notes.length)d.documentation=[d.documentation,...notes.map(n=>n.text)].filter(Boolean).join('\n');
  d.ownedViews=(d.ownedViews||[]).filter(v=>v._type!=='UMLNoteView');
  if(d._type==='UMLSequenceDiagram'){
   const lines=d.ownedViews.filter(v=>v._type==='UMLSeqLifelineView'),msgs=d.ownedViews.filter(v=>v._type==='UMLSeqMessageView');const oldC=lines.map(v=>get(v.linePart).left),newC=lines.map((_,i)=>80+i*245);const X=x=>{let i=oldC.reduce((best,v,i)=>Math.abs(v-x)<Math.abs(oldC[best]-x)?i:best,0);return newC[i]+(x-oldC[i])*.65},Y=y=>100+(y-260)*.74;
   lines.forEach((v,i)=>{const title=model(v).name||get(model(v).represent)?.type||'';const w=Math.max(80,Math.min(155,title.length*7+24));box(v,newC[i]-w/2,40,w,110+msgs.length*48);const lp=get(v.linePart);Object.assign(lp,{left:newC[i],top:70,width:1,height:80+msgs.length*48});const nc=get(v.nameCompartment);nc.height=30;});
   msgs.forEach(v=>{const pts=v.points.split(';').map(p=>p.split(':').map(Number));const act=get(v.activation),old={left:act.left,top:act.top,height:act.height};route(v,pts.map(([x,y])=>[X(x),Y(y)]),1);Object.assign(act,{left:X(old.left),top:Y(old.top),height:Math.max(16,old.height*.74),width:10});});
  }else if(d._type==='UMLClassDiagram'){
   const pos={Cliente:[20,35,225],Tarjeta:[345,35,250],Cuenta:[700,35,300],Sesion:[1110,35,315],Consulta:[20,450,225],Extraccion:[345,450,250],Operacion:[700,450,300],Transferencia:[1110,450,315]};
   for(const v of d.ownedViews.filter(x=>x._type==='UMLClassView')){const c=model(v),[x,y,w]=pos[c.name];box(v,x,y,w,100);const ac=get(v.attributeCompartment),oc=get(v.operationCompartment);Object.assign(ac,{left:x,top:y+25,width:w,height:c.attributes.length*17+8});ac.subViews.forEach((l,i)=>Object.assign(l,{left:x+6,top:ac.top+4+i*17,width:w-12,height:17}));Object.assign(oc,{left:x,top:ac.top+ac.height,width:w,height:c.operations.length*17+8});oc.subViews.forEach((l,i)=>Object.assign(l,{left:x+6,top:oc.top+4+i*17,width:w-12,height:17}));v.height=25+ac.height+oc.height;}
   for(const v of d.ownedViews.filter(x=>x._type.endsWith('View')&&x.head)){const [a,b]=endpoints(v),an=model(a).name,bn=model(b).name;let pts;
    if(v._type==='UMLGeneralizationView'){pts=an==='Consulta'?[[a.left+a.width/2,a.top+a.height],[132,710],[850,710],[850,b.top+b.height]]:an==='Extraccion'?[[a.left+a.width,a.top+60],[b.left,b.top+60]]:[[a.left,a.top+70],[b.left+b.width,b.top+70]];}
    else if(an==='Cliente'&&bn==='Sesion')pts=[[120,35],[120,8],[1260,8],[1260,35]];
    else if(an==='Sesion'&&bn==='Tarjeta')pts=[[1210,a.top+a.height],[1210,365],[470,365],[470,b.top+b.height]];
    else if(an==='Sesion'&&bn==='Operacion')pts=[[1340,a.top+a.height],[1340,405],[960,405],[960,b.top]];
    else if(an==='Operacion'&&bn==='Cuenta')pts=[[850,a.top],[850,b.top+b.height]];
    else pts=[[a.left+a.width,a.top+65],[b.left,b.top+65]];
    route(v,pts);for(const k of ['tailMultiplicityLabel','headMultiplicityLabel']){let l=get(v[k]);if(l){l.font='Arial;13;0';l.distance=20;}}
   }
  }else if(d._type==='UMLUseCaseDiagram'){
   const subject=d.ownedViews.find(v=>v._type==='UMLUseCaseSubjectView'),cases=d.ownedViews.filter(v=>v._type==='UMLUseCaseView'),single=cases.length===1;
   box(subject,190,60,single?560:760,single?350:510);
   const positions={'Autenticar Usuario':[465,105,200,50],'Consultar Saldo':[225,260,190,75],'Extraer Efectivo':[470,260,190,75],'Realizar Transferencia':[705,260,215,75],'Emitir ticket y Devolver Tarjeta':[420,455,295,50]};
   for(const v of cases){const [x,y,w,h]=single?[330,200,280,70]:positions[model(v).name];box(v,x,y,w,h)}
   for(const v of d.ownedViews.filter(v=>v._type==='UMLActorView')){const n=model(v).name;box(v,n==='Cliente'?40:(single?820:1020),n==='Sucursal'?105:n==='Cliente'?270:385,n==='Red Central'?85:70,80);}
   for(const v of d.ownedViews.filter(v=>v.head)){const [a,b]=endpoints(v);let pts=[center(a),center(b)];if(!single&&v._type==='UMLAssociationView'){const actor=a._type==='UMLActorView'?a:b,uc=actor===a?b:a,n=model(actor).name,un=model(uc).name;if(n==='Cliente'&&['Consultar Saldo','Extraer Efectivo','Realizar Transferencia'].includes(un)){let i=['Consultar Saldo','Extraer Efectivo','Realizar Transferencia'].indexOf(un);pts=[center(actor),[155,200+i*17],[uc.left+30,200+i*17],[uc.left+30,uc.top]];}else if(n==='Red Central'&&un!=='Autenticar Usuario'){let i=['Consultar Saldo','Extraer Efectivo','Realizar Transferencia'].indexOf(un);pts=[center(actor),[980,360+i*20],[uc.left+uc.width-25,360+i*20],[uc.left+uc.width-25,uc.top+uc.height]];}else if(n==='Red Central'&&un==='Autenticar Usuario')pts=[center(actor),[990,175],[720,175],center(uc)];if(actor!==a&&pts.length>2)pts.reverse();}route(v,pts,1);const nl=get(v.nameLabel);if(v._type==='UMLExtendView'){nl.visible=false;nl.text='';}const sl=get(v.stereotypeLabel);if(sl){sl.distance=18;sl.font='Arial;12;0';}}
  }else if(d._type==='DFDDiagram'){
   let nodes=d.ownedViews.filter(v=>/^DFD(Process|ExternalEntity|DataStore)View$/.test(v._type)),edges=d.ownedViews.filter(v=>v._type==='DFDDataFlowView');const local=nodes.filter(v=>v._type==='DFDProcessView'&&v.left===680);const isContext=file.startsWith('DiagramaContexto');const level0=file==='DFD/DFDNivel0.mdj';
   if(isContext){
    const p=local[0],c=nodes.find(v=>model(v).name==='Cliente'),s=nodes.find(v=>model(v).name==='Sucursal'),r=nodes.find(v=>model(v).name==='Red Central');box(p,465,300,240,100);box(c,30,320,120,60);box(s,520,35,140,44);box(r,1130,320,130,60);
    let lc=0,rc=0,sc=0;for(const e of edges){const [a,b]=endpoints(e);let pts;if(a===c||b===c){let y=100+lc++*49;pts=[[150,350],[235,y],[395,y],[465,350]];if(b===c)pts.reverse();}else if(a===r||b===r){let y=140+rc++*57;pts=[[705,350],[775,y],[1030,y],[1130,350]];if(a===r)pts.reverse();}else{let n=sc++,xx=n?630:540;pts=[[xx,79],[xx,155+n*55],[n?650:510,155+n*55],[n?650:510,300]];if(a===p)pts.reverse();}route(e,pts,1);const l=get(e.nameLabel);l.font='Arial;12;0';l.distance=11;}
   }else if(level0){
    local.forEach((v,i)=>box(v,430,160+i*210,200,70));
    const counts={};for(const v of nodes.filter(v=>!local.includes(v))){const incident=edges.find(e=>get(e.head)===v||get(e.tail)===v);const [a,b]=endpoints(incident),lv=local.includes(a)?a:b,i=local.indexOf(lv),n=model(v).name;let x=n==='Cliente'?30:950,y=160+i*210;const k=i+'-'+x;const j=counts[k]||0;counts[k]=j+1;y+=j*80;if(n==='Sucursal'){x=460;y=20;}box(v,x,y,n==='Log de operaciones'?190:130,44);}
    const pairCounts={};let branch=0;for(const e of edges){const [a,b]=endpoints(e),la=local.includes(a),lb=local.includes(b);let pts;if(la&&lb){const x=685+branch++*45;pts=[[a.left+a.width,a.top+a.height-10],[x,a.top+a.height-10],[x,b.top+150],[550,b.top+150],[530,b.top+100],[530,b.top+b.height]];}else{const v=la?b:a,lv=la?a:b;const k=v._id+'-'+lv._id,j=pairCounts[k]||0;pairCounts[k]=j+1;if(model(v).name==='Sucursal'){let y=85+j*40;pts=[[v.left+v.width/2,v.top+v.height],[430+j*210,y],[480+j*100,y],[lv.left+50+j*100,lv.top]];if(la)pts.reverse();}else{let left=v.left<lv.left,y=lv.top-5+j*40;if(v._type==='DFDDataStoreView')y=v.top+15+j*40;pts=left?[[v.left+v.width,v.top+v.height/2],[220,y],[350,y],[lv.left,lv.top+35]]:[[lv.left+lv.width,lv.top+35],[700,y],[860,y],[v.left,v.top+v.height/2]];if(left===la)pts.reverse();}}route(e,pts,1);}
   }else{
    // Columna vertical de procesos como en los desarrollos originales.
    local.forEach((v,i)=>box(v,500,140+i*165,230,65));
    const outside=nodes.filter(v=>!local.includes(v));const unique=new Map();for(const v of outside){const k=v.model.$ref;if(!unique.has(k))unique.set(k,v);else{const keep=unique.get(k);for(const e of edges){if(e.head.$ref===v._id)e.head=ref(keep);if(e.tail.$ref===v._id)e.tail=ref(keep);}d.ownedViews=d.ownedViews.filter(x=>x!==v);}}
    const outsiders=[...unique.values()],lastY=local.at(-1).top+local.at(-1).height;let neighbors=0;
    for(const v of outsiders){const m=model(v),inc=edges.find(e=>get(e.head)===v||get(e.tail)===v),[a,b]=endpoints(inc),lv=local.includes(a)?a:b;
     if(m.name==='Cliente')box(v,555,35,120,42);
     else if(v._type==='DFDDataStoreView')box(v,930,lv.top+10,200,45);
     else if(v._type==='DFDExternalEntityView')box(v,970,lv.top+8,145,44);
     else {box(v,25,110+neighbors++*110,225,70);}
    }
    let skip=0,clientLane=0,neighborLane=0;const pairs={};for(const e of edges){const [a,b]=endpoints(e),la=local.includes(a),lb=local.includes(b);let pts;
     if(la&&lb){if(local.indexOf(b)===local.indexOf(a)+1)pts=[[615,a.top+a.height],[615,b.top]];else{let x=1200+skip++*130;pts=[[a.left+a.width,a.top+a.height-10],[x,a.top+a.height-10],[x,b.top+b.height-10],[b.left+b.width,b.top+b.height-10]];}}
     else {const v=la?b:a,lv=la?a:b,key=v._id+'-'+lv._id,j=pairs[key]||0;pairs[key]=j+1;let n=model(v).name;if(n==='Cliente'){if(!la&&lv===local[0])pts=[[615,77],[615,lv.top]];else{const k=clientLane++,x=455+k*15,y=85-k*30;pts=[[lv.left,lv.top+30],[x,lv.top+30],[x,y],[490,y],[550,y],[v.left,55]];if(!la)pts.reverse();}}else if(v.left>lv.left){let y=lv.top+12+j*35;pts=[[lv.left+lv.width,y],[790,y],[890,y],[v.left,v.top+22]];if(!la)pts.reverse();}else {let y=v.top+35,x=435-neighborLane++*12;pts=[[lv.left,lv.top+30],[x,lv.top+30],[x,y],[325,y],[300,y],[v.left+v.width,y]];if(!la)pts.reverse();}}
     route(e,pts,pts.length===2?0:1);
    }
   }
  }
 }
 return root;
}
module.exports=adjust;
