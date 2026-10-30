/* Generador de las copias corregidas. Sólo emite parches; no escribe los originales. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.resolve(ROOT, '../TrabajoCorregido');
let serial = 0;
const uid = () => 'codex-atm-' + String(++serial).padStart(6, '0');
const ref = x => ({$ref: typeof x === 'string' ? x : x._id});
const obj = (type, parent, extra = {}) => ({_type:type, _id:uid(), ...(parent ? {_parent:ref(parent)} : {}), ...extra});
function walk(x, fn) { if (!x || typeof x !== 'object') return; fn(x); for (const v of Object.values(x)) walk(v,fn); }
function elements(root) { const a=[]; walk(root,x=>{if(x._type)a.push(x)}); return a; }
const sources = {};
function read(file) { return sources[file] ||= JSON.parse(fs.readFileSync(path.join(SOURCE,file),'utf8')); }
const templateFiles = ['DiagramaContexto/DiagramaDeContexto.mdj','DFD/DFDNivel1.mdj','DiagramaDeClases/DiagramaClases.mdj','CasosDeUso/CasoDeUsoContextual.mdj','DiagramaDeSecuencia/DiagramaSecuencia.mdj'];
const templates = templateFiles.flatMap(f=>elements(read(f)));
function cloneTemplate(type) {
  const original=templates.find(x=>x._type===type); if(!original)throw Error('Falta plantilla '+type);
  const copy=JSON.parse(JSON.stringify(original)), ids=new Map();
  walk(copy,x=>{if(x._id){let old=x._id;x._id=uid();ids.set(old,x._id)}});
  walk(copy,x=>{if(x.$ref&&ids.has(x.$ref))x.$ref=ids.get(x.$ref)});
  return copy;
}
function byid(root,r) { return elements(root).find(x=>x._id===r?.$ref); }
function label(parent,text,x,y,w=250,h=18,type='LabelView') { return obj(type,parent,{font:'Arial;13;0',left:x,top:y,width:w,height:h,text}); }
function node(type,model,diagram,x,y,w,h) {
  const v=cloneTemplate(type), ox=v.left||0,oy=v.top||0;
  walk(v,o=>{if(o.model)o.model=ref(model);if(typeof o.left==='number')o.left+=x-ox;if(typeof o.top==='number')o.top+=y-oy});
  v._parent=ref(diagram);v.model=ref(model);v.left=x;v.top=y;v.width=w;v.height=h;
  delete v.containerView;delete v.containedViews;
  const nc=byid(v,v.nameCompartment), nl=byid(v,nc?.nameLabel||v.nameLabel);
  if(nc){nc.left=x;nc.top=y+5;nc.width=w;nc.height=40;}
  if(nl){nl.text=model.name;nl.left=x+8;nl.top=y+10;nl.width=w-16;nl.height=35;nl.wordWrap=true;}
  const il=byid(v,v.idLabel);if(il){il.text=model.id||'';il.left=x+10;il.top=y+5;il.width=w-20;il.height=18;if(nl)nl.top=y+29;}
  diagram.ownedViews.push(v);return v;
}
function edge(type,model,diagram,tail,head,points,text='') {
  const v=cloneTemplate(type);v._parent=ref(diagram);v.model=ref(model);v.tail=ref(tail);v.head=ref(head);v.points=points.map(p=>p.join(':')).join(';');v.lineStyle=type==='DFDDataFlowView'?0:1;
  walk(v,x=>{if(x.model)x.model=ref(model)});
  let nl=byid(v,v.nameLabel);if(nl){nl.text=text;nl.visible=!!text;nl.width=Math.max(90,text.length*7);nl.height=18;nl.distance=14;nl.alpha=Math.PI/2;}
  for(const k of ['stereotypeLabel','propertyLabel']){const l=byid(v,v[k]);if(l){l.visible=false;l.text=''}}
  diagram.ownedViews.push(v);return v;
}
function note(diagram,text,x,y,w=850,h=70) { const n=obj('UMLNoteView',diagram,{font:'Arial;13;0',left:x,top:y,width:w,height:h,text});diagram.ownedViews.push(n);return n; }
function project(name,modelType='UMLModel') { const p=obj('Project',null,{name,ownedElements:[]});const m=obj(modelType,p,{name,ownedElements:[]});p.ownedElements.push(m);return {p,m}; }
const outputs={};
function save(file,p){outputs[file]=typeof p==='string'?p:JSON.stringify(p,null,2)+'\n'}

// Catálogo único de flujos: el DD y todos los niveles comparten estos nombres.
const F={};
function flow(key,name,description,composition,values){F[key]={name,description,composition,values};return key}
flow('cred','Credenciales de autenticación','Datos aportados por el cliente para abrir una sesión.','DatosTarjeta + pin','Tarjeta con formato válido; PIN de 4 dígitos. Se solicitan en dos pasos.');
flow('auth','Resultado de autenticación','Respuesta de acceso y pantalla siguiente.','estadoAutenticacion + mensaje + intentosRestantes + tarjetaDevuelta + [menu]','AUTENTICADA | TARJETA_INVALIDA | PIN_INVALIDO | INTENTOS_AGOTADOS; menú sólo si AUTENTICADA.');
flow('sp','Solicitud de PIN','Pantalla que solicita el PIN después de validar tarjeta.','numeroTarjeta + intentosRestantes','Tarjeta válida; intentosRestantes entre 1 y 3.');
flow('vt','Solicitud de validación de tarjeta','Consulta del cajero al sistema de Sucursal.','DatosTarjeta','Número no vacío, vencimiento y entidad emisora presentes.');
flow('rt','Estado de tarjeta','Resultado enviado por Sucursal.','estadoTarjeta + [numeroCuenta] + mensaje','VALIDA | VENCIDA | BLOQUEADA | DESCONOCIDA; cuenta sólo si VALIDA.');
flow('vp','Solicitud de validación de PIN','Verificación enviada a Red Central.','numeroTarjeta + pin','PIN de 4 dígitos; no registrar en D1.');
flow('rp','Confirmación de PIN','Respuesta de Red Central a la autenticación.','pinValido + mensaje','pinValido: Boolean.');
flow('sc','Solicitud de consulta','Elección de consulta de saldo.','idSesion + numeroCuenta','Sesión autenticada y cuenta vinculada.');
flow('qc','Solicitud de consulta de saldo','Petición al sistema central.','numeroCuenta','Cuenta existente.');
flow('rc','Información de saldo','Respuesta central de consulta.','exito + saldoDisponible + saldoTotal + mensaje','Importes >= 0; si exito=false, no interpretar los saldos.');
flow('oc','Resultado de consulta','Saldo mostrado al cliente.','ResultadoOperacion + [saldoDisponible] + [saldoTotal]','Saldo disponible presente si estado=EXITOSA; saldo total puede mostrarse adicionalmente.');
flow('se','Solicitud de extracción','Monto y cuenta de una extracción.','idSesion + numeroCuenta + monto','monto > 0; sesión autenticada.');
flow('qe','Solicitud de débito','Autorización y débito atómico en Red Central.','numeroCuenta + monto','monto > 0; central verifica fondos y límite diario.');
flow('re','Resultado de débito','Confirmación o rechazo de débito.','exito + [numeroTransaccion] + saldoRestante + mensaje','exito: Boolean; saldoRestante >= 0; no dispensar si exito=false.');
flow('oe','Resultado de extracción','Resultado mostrado y constancia de entrega de efectivo.','ResultadoOperacion + montoEntregado + saldoRestante','montoEntregado=monto si éxito; 0 si rechazo.');
flow('st','Solicitud de transferencia','Datos y confirmación de una transferencia.','idSesion + numeroCuenta + cbuDestino + monto + confirmacion','monto > 0; CBU de 22 dígitos; confirmacion=true para ejecutar.');
flow('qt','Instrucción de transferencia','Orden atómica a Red Central.','numeroCuenta + cbuDestino + monto','Destino válido; fondos suficientes; sin débito local previo.');
flow('rtf','Resultado central de transferencia','Resultado, confirmación y comprobante central.','exito + [numeroComprobante] + saldoRestante + mensaje','Comprobante sólo si exito=true.');
flow('ot','Resultado de transferencia','Resultado y comprobante mostrado al cliente.','ResultadoOperacion + [numeroComprobante] + saldoRestante','Estado EXITOSA o RECHAZADA.');
flow('sf','Solicitud de cierre','Decisión del cliente de finalizar la sesión.','idSesion + deseaTicket','deseaTicket: Boolean.');
flow('of','Resultado de cierre','Confirmación, ticket opcional y devolución de tarjeta.','idSesion + tarjetaDevuelta + [Ticket] + estadoSesion','tarjetaDevuelta=true; estadoSesion=CERRADA; Ticket sólo si deseaTicket=true.');
flow('ses','Contexto de sesión','Identidad y cuenta autenticadas para operar.','idSesion + numeroTarjeta + numeroCuenta + autenticada','autenticada=true; no contiene PIN.');
flow('log','Registro de operación','Operación finalizada para el historial de la sesión.','RegistroOperacion','Tipo CONSULTA | EXTRACCION | TRANSFERENCIA; estado EXITOSA | RECHAZADA.');
flow('ql','Consulta de operaciones de sesión','Filtro para leer el registro.','idSesion','Identificador de sesión existente.');
flow('rl','Operaciones de sesión','Operaciones registradas para confeccionar ticket.','idSesion + {RegistroOperacion}','Lista de cero o más registros, sin PIN.');
flow('tar','Datos de tarjeta','Datos leídos, preparados para validar.','DatosTarjeta','Número, vencimiento y entidad emisora.');
flow('val','Tarjeta validada','Datos de tarjeta con resultado de Sucursal.','DatosTarjeta + estadoTarjeta + [numeroCuenta]','Estado de tarjeta según rt.');
flow('pin','PIN capturado','PIN capturado y asociado a la tarjeta.','numeroTarjeta + pin','4 dígitos, dato transitorio que no se persiste.');
flow('resauth','Autenticación procesada','Resultado de validación para presentar al cliente.','estadoAutenticacion + intentosRestantes + [ContextoSesion]','Intentos restantes 0..3; contexto sólo si autenticada.');
flow('op','Operación preparada','Solicitud validada y datos de sesión asociados.','tipoOperacion + ContextoSesion + [monto] + [cbuDestino]','Datos específicos presentes según tipo; autenticada=true.');
flow('resop','Operación procesada','Resultado que se registra y presenta.','RegistroOperacion + mensaje','No se registra como EXITOSA una respuesta central rechazada.');
flow('cierre','Cierre preparado','Decisión de cierre y sesión correspondiente.','idSesion + deseaTicket','Id existente; booleano.');
flow('ticket','Datos de ticket','Contenido opcional listo para imprimir.','idSesion + deseaTicket + {RegistroOperacion}','Lista vacía permitida; no imprimir cuando deseaTicket=false.');
flow('soltar','Solicitud de tarjeta preparada','Datos listos para enviar a Sucursal.','DatosTarjeta','Mismas restricciones que vt.');
flow('solpin','Solicitud de PIN preparada','Credenciales listas para enviar a Central.','numeroTarjeta + pin','Mismas restricciones que vp.');
flow('solsaldo','Consulta preparada para Central','Número de cuenta para solicitud central.','numeroCuenta','Cuenta válida de sesión autenticada.');
flow('soldeb','Débito preparado para Central','Petición de extracción validada localmente.','numeroCuenta + monto','Monto positivo; no implica autorización de débito.');
flow('soltrans','Transferencia preparada para Central','Orden validada localmente.','numeroCuenta + cbuDestino + monto','Confirmada, monto positivo, CBU con formato válido.');
flow('lista','Detalle recuperado','Lista de operaciones para preparar ticket.','idSesion + {RegistroOperacion}','Cero o más operaciones de esa sesión.');
const PN={'1':'Autenticar Usuario','2':'Consultar Saldo','3':'Extraer Efectivo','4':'Realizar Transferencia','5':'Finalizar Sesión'};
const externals={C:'Cliente',S:'Sucursal',R:'Red Central',D:'Log de operaciones'};
const EX=[['C','1','cred'],['1','C','sp'],['1','C','auth'],['1','S','vt'],['S','1','rt'],['1','R','vp'],['R','1','rp'],['C','2','sc'],['2','R','qc'],['R','2','rc'],['2','C','oc'],['C','3','se'],['3','R','qe'],['R','3','re'],['3','C','oe'],['C','4','st'],['4','R','qt'],['R','4','rtf'],['4','C','ot'],['C','5','sf'],['5','C','of']];
const INT=[['1','2','ses'],['1','3','ses'],['1','4','ses'],['1','5','ses'],['2','D','log'],['3','D','log'],['4','D','log'],['5','D','ql'],['D','5','rl']];
const L1={
 '1':{names:{'1.1':'Capturar credenciales','1.2':'Validar tarjeta en Sucursal','1.3':'Preparar validación de PIN','1.4':'Validar PIN en Central','1.5':'Informar autenticación'},edges:[['C','1.1','cred'],['1.1','1.2','tar'],['1.2','S','vt'],['S','1.2','rt'],['1.2','1.3','val'],['1.1','1.3','pin'],['1.3','C','sp'],['1.3','1.4','pin'],['1.4','R','vp'],['R','1.4','rp'],['1.4','1.5','resauth'],['1.2','1.5','resauth'],['1.5','C','auth'],...['2','3','4','5'].map(n=>['1.5',n,'ses'])]},
 '2':{names:{'2.1':'Preparar consulta','2.2':'Consultar saldo en Central','2.3':'Registrar y mostrar saldo'},edges:[['C','2.1','sc'],['1','2.1','ses'],['2.1','2.2','op'],['2.2','R','qc'],['R','2.2','rc'],['2.2','2.3','resop'],['2.3','D','log'],['2.3','C','oc']]},
 '3':{names:{'3.1':'Preparar extracción','3.2':'Solicitar débito en Central','3.3':'Entregar efectivo y registrar resultado'},edges:[['C','3.1','se'],['1','3.1','ses'],['3.1','3.2','op'],['3.2','R','qe'],['R','3.2','re'],['3.2','3.3','resop'],['3.3','D','log'],['3.3','C','oe']]},
 '4':{names:{'4.1':'Preparar transferencia confirmada','4.2':'Transferir en Red Central','4.3':'Registrar y mostrar comprobante'},edges:[['C','4.1','st'],['1','4.1','ses'],['4.1','4.2','op'],['4.2','R','qt'],['R','4.2','rtf'],['4.2','4.3','resop'],['4.3','D','log'],['4.3','C','ot']]},
 '5':{names:{'5.1':'Preparar cierre','5.2':'Recuperar operaciones y preparar ticket','5.3':'Devolver tarjeta y cerrar sesión'},edges:[['C','5.1','sf'],['1','5.1','ses'],['5.1','5.2','cierre'],['5.2','D','ql'],['D','5.2','rl'],['5.2','5.3','ticket'],['5.3','C','of']]}
};
// Layout por bandas: entidades externas y D1 pueden repetirse visualmente; el modelo es único.
function dfdDiagram(model,title,names,edges,description=''){
 const d=obj('DFDDiagram',model,{name:title,ownedViews:[]});model.ownedElements.push(d);
 const keys=[...new Set(edges.flatMap(e=>e.slice(0,2)))], models={},views={};
 for(const k of keys){let t=externals[k]?(k==='D'?'DFDDataStore':'DFDExternalEntity'):'DFDProcess';models[k]=obj(t,model,{name:names[k]||PN[k]||externals[k],...(t==='DFDProcess'?{id:k}:k==='D'?{id:'D1'}:{})});model.ownedElements.push(models[k]);}
 const local=Object.keys(names);const rows=new Map();
 const buckets=new Map();
 for(const e of edges){let a=local.includes(e[0])?e[0]:e[1];if(!buckets.has(a))buckets.set(a,[]);buckets.get(a).push(e)}
 let rowY=180;
 for(const k of local){const group=buckets.get(k)||[];const outside=group.filter(e=>!(local.includes(e[0])&&local.includes(e[1])));const counts=[0,0];for(const e of outside){const other=e[0]===k?e[1]:e[0];counts[other==='C'||!externals[other]?0:1]++}const h=Math.max(180,Math.max(...counts)*90+40);rows.set(k,rowY);views[k]=node('DFDProcessView',models[k],d,680,rowY,360,h);rowY+=h+130;}
 let seq=0, bypass=0;
 for(const [key,group]of buckets){const y=rows.get(key)||180;let left=0,right=0,inner=0;const outsideViews={};
  for(const [s,t,f]of group){const localS=local.includes(s),localT=local.includes(t);let vs=views[s],vt=views[t],points;
   if(localS&&localT){const a=vs,b=vt;if(local.indexOf(t)===local.indexOf(s)+1){points=[[860,a.top+a.height],[860,b.top]];}else{const lane=1900+(bypass++)*220,sy=a.top+a.height-20-(inner++*18),ty=b.top+b.height-25;points=[[a.left+a.width,sy],[lane,sy],[lane,ty],[b.left+b.width,ty]];}}
   else {const other=localS?t:s,isLeft=other==='C'||(!externals[other]);let n=isLeft?left++:right++,yy=y+n*90;const xx=isLeft?40:1510;let ov=outsideViews[other];if(!ov){ov=node(models[other]._type+'View',models[other],d,xx,yy,270,60);outsideViews[other]=ov;}else ov.height=yy+60-ov.top;if(localS)vt=ov;else vs=ov;let localY=yy+30;points=isLeft?(localS?[[680,localY],[310,localY]]:[[310,localY],[680,localY]]):(localS?[[1040,localY],[1510,localY]]:[[1510,localY],[1040,localY]]);}
   const fm=obj('DFDDataFlow',model,{name:F[f].name,documentation:F[f].description+'\nComposición: '+F[f].composition,source:ref(models[s]),target:ref(models[t])});model.ownedElements.push(fm);const ev=edge('DFDDataFlowView',fm,d,vs,vt,points,F[f].name);const el=byid(ev,ev.nameLabel);el.font='Arial;12;0';el.distance=12;seq++;
  }
 }
 note(d,description||'Las entidades externas y D1 se repiten visualmente para reducir cruces; las vistas remiten al mismo elemento. Los flujos agrupados se definen en el Diccionario de Datos.',40,25,1700,85);
 return d;
}
// Contexto: un proceso y tres entidades; flujos idénticos a la frontera del Nivel 0.
{
 const {p,m}=project('Cajero Automático — Contexto','DFDDataFlowModel');
 dfdDiagram(m,'Diagrama de Contexto',{'0':'Cajero Automático'},EX.map(([s,t,k])=>[PN[s]?'0':s,PN[t]?'0':t,k]),'Un único sistema y tres terminadores. Las vistas repetidas representan el mismo Cliente, Sucursal o Red Central. Los flujos agrupan datos de la conversación: credenciales, resultados y comprobantes; ver DD.');
 save('DiagramaContexto/DiagramaDeContexto.mdj',p);
}
{
 const {p,m}=project('Cajero Automático — DFD Nivel 0','DFDDataFlowModel');dfdDiagram(m,'DFD Nivel 0',PN,[...EX,...INT]);save('DFD/DFDNivel0.mdj',p);
}
{
 const {p,m}=project('Cajero Automático — DFD Nivel 1','DFDDataFlowModel');
 for(const [k,s]of Object.entries(L1))dfdDiagram(m,k+'.0 '+PN[k],s.names,s.edges);
 save('DFD/DFDNivel1.mdj',p);
}
const decompositions=[
 ['1','1.2',['Preparar validación de tarjeta','Consultar Sucursal y evaluar estado'],'soltar'],
 ['1','1.4',['Preparar credenciales','Validar PIN y controlar intentos'],'solpin'],
 ['2','2.2',['Preparar consulta central','Consultar y procesar respuesta'],'solsaldo'],
 ['3','3.2',['Preparar solicitud de débito','Autorizar y debitar en Central'],'soldeb'],
 ['4','4.2',['Preparar orden de transferencia','Solicitar transferencia atómica'],'soltrans'],
 ['5','5.2',['Recuperar operaciones de D1','Preparar ticket opcional'],'lista']
];
for(let k=1;k<=5;k++){
 const {p,m}=project('Cajero Automático — Nivel 2, proceso '+k,'DFDDataFlowModel');
 for(const [parent,target,steps,inner]of decompositions.filter(x=>x[0]===String(k))){
  const spec=L1[parent],a=target+'.1',b=target+'.2',names={[a]:steps[0],[b]:steps[1]};
  const edges=spec.edges.filter(e=>e[0]===target||e[1]===target).map(([s,t,f])=>{
   // Petición principal entra en preparación. Respuestas externas entran en la ejecución.
   const firstIn=!externals[s]&&s!==target;
   if(parent==='5')return [s===target?(t==='D'?a:b):s,t===target?a:t,f];
   return [s===target?b:s,t===target?(firstIn?a:b):t,f];
  });edges.push([a,b,inner]);
  const contextNames={...PN,...spec.names};for(const key of new Set(edges.flatMap(e=>e.slice(0,2))))if(!names[key]&&!externals[key])PN[key]=contextNames[key]||key;
  dfdDiagram(m,'Descomposición de '+target+' '+spec.names[target],names,edges,'Nivel 2: descomposición selectiva del proceso '+target+'. Se conservan exactamente sus flujos de frontera. Los procesos vecinos son referencias de contexto, no terminadores nuevos.');
 }
 save('DFD/'+(k===1?'DFDNivel2-1.mdj':'DfdNivel2-'+k+'.mdj'),p);
}

// Clases: conserva los atributos y operaciones originales y repara el modelo.
const classSource=elements(read('DiagramaDeClases/DiagramaClases.mdj')).filter(x=>x._type==='UMLClass');
const classes={};
function parameter(op,name,type,direction='in'){return obj('UMLParameter',op,{name,type,direction})}
function operation(c,name,ret,args=[],abstract=false){const o=obj('UMLOperation',c,{name,visibility:'public',isAbstract:abstract,parameters:[]});o.parameters=[...args.map(([n,t])=>parameter(o,n,t)),parameter(o,'',ret,'return')];c.operations.push(o);return o}
function attr(c,name,type){const a=obj('UMLAttribute',c,{name,type,visibility:'private'});c.attributes.push(a);return a}
function populateClassView(v,c){
 const nc=byid(v,v.nameCompartment);const name=byid(v,nc.nameLabel);name.font='Arial;14;'+(c.isAbstract?'3':'1');name.text=c.name;
 const ac=byid(v,v.attributeCompartment),oc=byid(v,v.operationCompartment);ac.visible=true;oc.visible=true;ac.subViews=[];oc.subViews=[];ac.top=v.top+42;ac.left=v.left;ac.width=v.width;ac.height=c.attributes.length*22+12;
 c.attributes.forEach((a,i)=>{const l=label(ac,'-'+a.name+': '+a.type,v.left+9,ac.top+6+i*22,v.width-18,20,'UMLAttributeView');l.model=ref(a);l.horizontalAlignment=0;ac.subViews.push(l)});
 oc.top=ac.top+ac.height;oc.left=v.left;oc.width=v.width;oc.height=c.operations.length*22+12;
 c.operations.forEach((o,i)=>{const args=o.parameters.filter(x=>x.direction!=='return').map(x=>x.name+': '+x.type).join(', '),rt=o.parameters.find(x=>x.direction==='return').type;const l=label(oc,'+'+o.name+'('+args+'): '+rt,v.left+9,oc.top+6+i*22,v.width-18,20,'UMLOperationView');l.model=ref(o);l.font='Arial;13;'+(o.isAbstract?'2':'0');l.horizontalAlignment=0;oc.subViews.push(l)});v.height=42+ac.height+oc.height;
}
function association(m,d,a,b,ma,mb,roleA,roleB,composition=false,route){
 const r=obj('UMLAssociation',a,{documentation:roleA+' / '+roleB,end1:null,end2:null});r.end1=obj('UMLAssociationEnd',r,{reference:ref(a),name:'',multiplicity:ma,aggregation:composition?'composite':'none',navigable:'unspecified'});r.end2=obj('UMLAssociationEnd',r,{reference:ref(b),name:'',multiplicity:mb,aggregation:'none',navigable:'unspecified'});(a.ownedElements||=[]).push(r);
 const av=d.ownedViews.find(v=>v._type==='UMLClassView'&&v.model.$ref===a._id),bv=d.ownedViews.find(v=>v._type==='UMLClassView'&&v.model.$ref===b._id);
 const pts=route||[[av.left+av.width,av.top+60],[bv.left,bv.top+60]];
 const v=edge('UMLAssociationView',r,d,av,bv,pts);
 for(const [end,side]of [[r.end1,'tail'],[r.end2,'head']]){for(const [field,val]of [['RoleNameLabel',end.name],['MultiplicityLabel',end.multiplicity]]){let l=byid(v,v[side+field]);l.model=ref(end);l.visible=true;l.text=val;l.width=Math.max(30,val.length*7);l.height=18;}for(const field of ['PropertyLabel','QualifiersCompartment']){let l=byid(v,v[side+field]);if(l){l.model=ref(end);l.visible=false;}}}
 return r;
}
{
 const {p,m}=project('Cajero Automático — Clases');const d=obj('UMLClassDiagram',m,{name:'Modelo de dominio — ocho clases',ownedViews:[]});m.ownedElements.push(d);
 for(const src of classSource){const c=obj('UMLClass',m,{name:src.name,attributes:[],operations:[],isAbstract:src.name==='Operacion'});classes[c.name]=c;m.ownedElements.push(c);
  for(const a of src.attributes)attr(c,a.name,a.type);
  const seen=new Set();for(const o of src.operations){if(seen.has(o.name))continue;seen.add(o.name);operation(c,o.name,o.parameters.find(p=>p.direction==='return')?.type||'Void',o.parameters.filter(p=>p.direction!=='return').map(p=>[p.name,p.type]),c.name==='Operacion'&&o.name==='ejecutar');}
 }
 operation(classes.Cliente,'finalizarSesion','Void');attr(classes.Tarjeta,'entidadEmisora','String');attr(classes.Sesion,'intentosPIN','Integer');attr(classes.Sesion,'estado','String');
 operation(classes.Sesion,'estaAutenticada','Boolean');operation(classes.Sesion,'autenticar','Void');operation(classes.Sesion,'registrarIntentoFallido','Integer');
 for(const n of ['Consulta','Extraccion','Transferencia']){operation(classes[n],'ejecutar','Boolean').documentation='Redefine Operacion.ejecutar().'}
 operation(classes.Cuenta,'transferir','Boolean',[['cbuDestino','String'],['monto','Decimal']]);
 const positions={Cliente:[40,160],Tarjeta:[640,160],Cuenta:[1240,160],Sesion:[40,640],Operacion:[640,640],Consulta:[40,1210],Extraccion:[640,1210],Transferencia:[1240,1210]};
 for(const c of Object.values(classes)){const [x,y]=positions[c.name],v=node('UMLClassView',c,d,x,y,470,250);populateClassView(v,c)}
 association(m,d,classes.Cliente,classes.Tarjeta,'1','0..*','titular','tarjetas');
 association(m,d,classes.Tarjeta,classes.Cuenta,'0..*','1','tarjetas','cuenta');
 association(m,d,classes.Cliente,classes.Sesion,'1','0..*','cliente','sesiones',false,[[260,402],[260,640]]);
 association(m,d,classes.Sesion,classes.Tarjeta,'0..*','1','sesiones','tarjeta',false,[[510,720],[580,720],[580,535],[850,535],[850,416]]);
 association(m,d,classes.Sesion,classes.Operacion,'1','0..*','sesion','operaciones',true,[[510,830],[640,830]]);
 association(m,d,classes.Operacion,classes.Cuenta,'0..*','1','operaciones','cuentaOrigen',false,[[1110,720],[1475,720],[1475,460]]);
 for(const n of ['Consulta','Extraccion','Transferencia']){const c=classes[n],r=obj('UMLGeneralization',c,{source:ref(c),target:ref(classes.Operacion)});(c.ownedElements||=[]).push(r);const a=d.ownedViews.find(v=>v.model?.$ref===c._id),b=d.ownedViews.find(v=>v.model?.$ref===classes.Operacion._id);const x=a.left+235;const v=edge('UMLIncludeView',r,d,a,b,[[x,a.top],[x,1110],[875,1110],[875,b.top+b.height]]);v._type='UMLGeneralizationView';}
 note(d,'Decisiones del modelo: una tarjeta accede a una cuenta; una sesión tiene un cliente y una tarjeta. Sesion compone sus operaciones en memoria; el historial D1 persiste independientemente. Las clases no se subrayan. Operacion y ejecutar() son abstractos.',40,25,1670,90);
 save('DiagramaDeClases/DiagramaClases.mdj',p);
}

// Casos de uso: cinco objetivos, autenticación reutilizable y cierre condicional.
const UC_NAMES=['Autenticar Usuario','Consultar Saldo','Extraer Efectivo','Realizar Transferencia','Emitir ticket y Devolver Tarjeta'];
function useCases(individual=false){
 const {p,m}=project('Cajero Automático — Casos de uso');const subject=obj('UMLUseCaseSubject',m,{name:'Cajero Automático',ownedElements:[]});m.ownedElements.push(subject);const actors={};for(const n of ['Cliente','Sucursal','Red Central']){actors[n]=obj('UMLActor',m,{name:n});m.ownedElements.push(actors[n])}
 const cases=UC_NAMES.map(name=>obj('UMLUseCase',subject,{name,ownedElements:[],extensionPoints:[]}));subject.ownedElements.push(...cases);
 const docs=[
 'Objetivo: garantizar una sesión autenticada. Si la sesión ya está autenticada, devolver su contexto sin pedir nuevamente tarjeta/PIN. En caso contrario validar tarjeta en Sucursal y PIN en Central; máximo tres intentos. No persistir PIN.',
 'Incluye Autenticar Usuario. Consultar saldo en Central, registrar resultado y mostrarlo. Punto de extensión al finalizar la operación.',
 'Incluye Autenticar Usuario. Validar monto, solicitar autorización y débito atómico en Central; dispensar sólo si fue aprobado. Registrar y mostrar resultado.',
 'Incluye Autenticar Usuario. Validar monto y destino, exigir confirmación y solicitar transferencia atómica a Central. No debitar dos veces. Registrar y mostrar comprobante.',
 'Se extiende una operación cuando el cliente decide finalizar. Dentro del cierre el ticket es opcional, pero la devolución de tarjeta y el cierre de sesión son obligatorios. También puede iniciarse desde el menú sin operaciones previas.'
 ];cases.forEach((c,i)=>c.documentation=docs[i]);
 const relations=[];
 function assoc(a,b){const r=obj('UMLAssociation',a,{end1:null,end2:null});r.end1=obj('UMLAssociationEnd',r,{reference:ref(a),navigable:'unspecified'});r.end2=obj('UMLAssociationEnd',r,{reference:ref(b),navigable:'unspecified'});(a.ownedElements||=[]).push(r);relations.push(r)}
 cases.forEach(c=>assoc(actors.Cliente,c));assoc(actors.Sucursal,cases[0]);for(let i=0;i<4;i++)assoc(actors['Red Central'],cases[i]);
 for(let i=1;i<=3;i++){let inc=obj('UMLInclude',cases[i],{source:ref(cases[i]),target:ref(cases[0])});cases[i].ownedElements.push(inc);relations.push(inc);let ep=obj('UMLExtensionPoint',cases[i],{name:'finDeOperacion',location:'',documentation:'Después de informar el resultado y antes de volver al menú'});cases[i].extensionPoints.push(ep);let ext=obj('UMLExtend',cases[4],{source:ref(cases[4]),target:ref(cases[i]),condition:'cliente solicita finalizar sesión',extensionLocations:[ref(ep)]});cases[4].ownedElements.push(ext);relations.push(ext)}
 const groups=individual?cases.map((_,i)=>[i]):[[0,1,2,3,4]];
 for(const indices of groups){const d=obj('UMLUseCaseDiagram',m,{name:individual?UC_NAMES[indices[0]]:'Casos de uso — vista general',ownedViews:[]});m.ownedElements.push(d);const boundary=node('UMLUseCaseSubjectView',subject,d,300,120,1000,880),views={};
  const pos=[[680,190],[370,450],[680,450],[990,450],[670,740]];
  for(const i of indices){const c=cases[i],[x,y]=individual?[650,400]:pos[i];let v=node('UMLUseCaseView',c,d,x,y,280,130);v.containerView=ref(boundary);(boundary.containedViews||=[]).push(ref(v));views[c._id]=v;}
  for(const [n,a]of Object.entries(actors)){const needed=relations.some(r=>r._type==='UMLAssociation'&&r.end1.reference.$ref===a._id&&views[r.end2.reference.$ref]);if(needed)views[a._id]=node('UMLActorView',a,d,n==='Cliente'?80:1450,n==='Sucursal'?220:n==='Cliente'?480:600,140,100)}
  for(const r of relations){const sid=r.source?.$ref||r.end1.reference.$ref,tid=r.target?.$ref||r.end2.reference.$ref,a=views[sid],b=views[tid];if(!a||!b)continue;const pts=[[a.left+a.width/2,a.top+a.height/2],[b.left+b.width/2,b.top+b.height/2]];const v=edge(r._type+'View',r,d,a,b,pts);if(r._type==='UMLAssociation'){for(const k of ['tailRoleNameLabel','tailPropertyLabel','tailMultiplicityLabel','headRoleNameLabel','headPropertyLabel','headMultiplicityLabel','tailQualifiersCompartment','headQualifiersCompartment']){const l=byid(v,v[k]);if(l){l.visible=false;l.model=ref(k.startsWith('tail')?r.end1:r.end2)}}}else{const l=byid(v,v.stereotypeLabel);l.visible=true;l.text=r._type==='UMLInclude'?'«include»':'«extend»';l.distance=22;if(r._type==='UMLExtend'){const n=byid(v,v.nameLabel);n.text='[finalizar sesión]';n.visible=true;n.width=140;n.distance=42;}}}
  note(d,individual?docs[indices[0]]:'include: siempre se garantiza la autenticación; se reutiliza la sesión válida. extend: finDeOperacion [cliente solicita finalizar sesión]. En el cierre, imprimir ticket es opcional; devolver tarjeta y cerrar son obligatorios.',310,1020,980,100);
 }
 return p;
}
save('CasosDeUso/CasoDeUsoContextual.mdj',useCases());save('CasosDeUso/CasoDeUso.mdj',useCases(true));

// Secuencias reconstruidas con llamadas sincrónicas, retornos emparejados y activaciones.
const {p:seqP,m:seqM}=project('Cajero Automático — Secuencias');
const seqSpecs=[];
function sequence(title,names,events,description){
 const c=obj('UMLCollaboration',seqM,{name:title,ownedElements:[],attributes:[]});seqM.ownedElements.push(c);const it=obj('UMLInteraction',c,{name:title,ownedElements:[],participants:[],messages:[]});c.ownedElements.push(it);const d=obj('UMLSequenceDiagram',it,{name:title,ownedViews:[]});it.ownedElements.push(d);const lifelines={},views={};const width=380,base=140,step=410;
 names.forEach((n,i)=>{const anonymous=n.startsWith(':');const a=obj('UMLAttribute',c,{name:'rol'+i,type:anonymous?n.slice(1):''});c.attributes.push(a);const l=obj('UMLLifeline',it,{name:anonymous?'':n,represent:ref(a),isMultiInstance:false});it.participants.push(l);lifelines[n]=l;const v=node('UMLSeqLifelineView',l,d,base+i*step,140,width,events.length*65+170);const line=byid(v,v.linePart);line.left=v.left+width/2;line.top=200;line.width=1;line.height=v.height-60;const nc=byid(v,v.nameCompartment);nc.height=60;views[n]=v});
 const starts=new Map();events.forEach((e,i)=>{const [from,to,name,kind='call',pair]=e,y=260+i*65;const msg=obj('UMLMessage',it,{name,source:ref(lifelines[from]),target:ref(lifelines[to]),messageSort:kind==='return'?'reply':'synchCall'});it.messages.push(msg);const s=views[from],t=views[to],sl=byid(s,s.linePart),tl=byid(t,t.linePart),sx=sl.left,tx=tl.left;const self=from===to;const pts=self?[[sx,y],[sx+80,y],[sx+80,y+25],[tx+7,y+25]]:[[sx,y],[tx,y]];const v=edge('UMLSeqMessageView',msg,d,sl,tl,pts,name);const act=byid(v,v.activation);act.model=ref(msg);act.left=tx-7+(self?7:0);act.top=y+(self?25:0);act.width=14;act.height=30;act.visible=kind!=='return';const nameLabel=byid(v,v.nameLabel);nameLabel.font='Arial;12;0';nameLabel.distance=12;
  if(kind!=='return'){starts.set(pair||'m'+i,{act,from,to,y})}else if(pair){const call=starts.get(pair);if(!call||call.from!==to||call.to!==from)throw Error('Retorno sin llamada: '+title+' '+name);call.act.height=y-call.act.top;}
 });note(d,description,base,events.length*65+420,Math.max(1000,names.length*step-30),100);seqSpecs.push({title,names,events});return it;
}
sequence('01 Autenticar Usuario — acceso válido',['Cliente',':PantallaCajero',':SucursalDB',':CentralDB'],[
 ['Cliente',':PantallaCajero','introducirTarjeta(numero, vencimiento, entidadEmisora)','call','tarjeta'],
 [':PantallaCajero',':SucursalDB','validarTarjeta(numero, vencimiento, entidadEmisora)','call','vt'],
 [':SucursalDB',':PantallaCajero','estadoTarjeta = VALIDA; numeroCuenta','return','vt'],
 [':PantallaCajero','Cliente','solicitudPIN','return','tarjeta'],
 ['Cliente',':PantallaCajero','ingresarPIN(pin)','call','pin'],
 [':PantallaCajero',':CentralDB','validarPIN(numero, pin)','call','vp'],
 [':CentralDB',':PantallaCajero','pinValido = true','return','vp'],
 [':PantallaCajero',':PantallaCajero','establecerSesionAutenticada(numeroCuenta)','call','ses'],
 [':PantallaCajero','Cliente','resultadoAutenticacion = AUTENTICADA; menu','return','pin']
],'Escenario de primera autenticación: tarjeta válida y PIN correcto. Autenticar Usuario reutiliza una sesión ya válida sin pedir credenciales otra vez. Ver escenarios alternativos para rechazo de tarjeta y tres PIN inválidos.');
sequence('01b Autenticar Usuario — tarjeta rechazada',['Cliente',':PantallaCajero',':SucursalDB',':CentralDB'],[
 ['Cliente',':PantallaCajero','introducirTarjeta(numero, vencimiento, entidadEmisora)','call','tarjeta'],
 [':PantallaCajero',':SucursalDB','validarTarjeta(numero, vencimiento, entidadEmisora)','call','vt'],
 [':SucursalDB',':PantallaCajero','estadoTarjeta = VENCIDA; mensaje','return','vt'],
 [':PantallaCajero','Cliente','TARJETA_INVALIDA; tarjetaDevuelta = true','return','tarjeta']
],'Alternativa: tarjeta vencida, bloqueada o desconocida. No se consulta PIN ni se permite operar; se devuelve tarjeta. CentralDB no recibe mensajes en este escenario.');
const badPIN=[['Cliente',':PantallaCajero','introducirTarjeta(numero, vencimiento, entidadEmisora)','call','tarjeta'],[':PantallaCajero',':SucursalDB','validarTarjeta(numero, vencimiento, entidadEmisora)','call','vt'],[':SucursalDB',':PantallaCajero','estadoTarjeta = VALIDA; numeroCuenta','return','vt'],[':PantallaCajero','Cliente','solicitudPIN; intentosRestantes = 3','return','tarjeta']];
for(let i=1;i<=3;i++)badPIN.push(['Cliente',':PantallaCajero','ingresarPIN(pin)','call','pin'+i],[':PantallaCajero',':CentralDB','validarPIN(numero, pin)','call','vp'+i],[':CentralDB',':PantallaCajero','pinValido = false','return','vp'+i],[':PantallaCajero',':PantallaCajero','registrarIntentoFallido()','call','fallo'+i],[':PantallaCajero','Cliente',i<3?'PIN_INVALIDO; intentosRestantes = '+(3-i):'INTENTOS_AGOTADOS; tarjetaDevuelta = true','return','pin'+i]);
sequence('01c Autenticar Usuario — tres PIN inválidos',['Cliente',':PantallaCajero',':SucursalDB',':CentralDB'],badPIN,'Escenario alternativo completo de tres intentos fallidos. Al tercero se cierra la sesión y se devuelve la tarjeta. Bloqueo bancario permanente o retención física no se presuponen.');
const opDefs=[['02 Consultar Saldo',':Consulta','consultarSaldo()', 'saldoDisponible, saldoTotal',''],['03 Extraer Efectivo',':Extraccion','debitar(monto)','exito = true; saldoRestante','monto'],['04 Realizar Transferencia',':Transferencia','transferir(cbuDestino, monto)','exito = true; numeroComprobante; saldoRestante','cbuDestino, monto, confirmacion']];
for(const [title,op,method,result,args]of opDefs){const ev=[
 ['Cliente',':PantallaCajero','solicitarOperacion('+args+')','call','sol'],
 [':PantallaCajero',':Sesion','estaAutenticada()','call','aut'],[':Sesion',':PantallaCajero','autenticada = true','return','aut'],
 [':PantallaCajero',op,'ejecutar()','call','ej'],[op,':Cuenta',method,'call','ct'],
 [':Cuenta',':CentralDB',method.replace('()', '(numeroCuenta)').replace('(monto)','(numeroCuenta, monto)').replace('(cbuDestino, monto)','(numeroCuenta, cbuDestino, monto)'),'call','central'],
 [':CentralDB',':Cuenta',result,'return','central'],[':Cuenta',op,op===':Consulta'?'saldoDisponible: Decimal':'exito = true','return','ct']];
 if(op===':Transferencia')ev.splice(4,4,[op,':CentralDB','transferir(numeroCuenta, cbuDestino, monto)','call','transferencia'],[':CentralDB',op,result,'return','transferencia']);
 if(op===':Extraccion')ev.push([op,':Cuenta','consultarSaldo()','call','saldo'],[':Cuenta',op,'saldoRestante: Decimal','return','saldo'],[op,op,'dispensarEfectivo()','call','ef']);
 ev.push([op,op,'registrar()','call','reg'],[op,':PantallaCajero','ejecutada = true','return','ej'],[':PantallaCajero',':Sesion','agregarOperacion(operacion)','call','ag'],[':Sesion',':PantallaCajero','operacionAgregada','return','ag'],[':PantallaCajero',op,'obtenerDetalle()','call','det'],[op,':PantallaCajero','detalleOperacion','return','det'],[':PantallaCajero','Cliente','resultadoOperacion; detalleOperacion','return','sol']);
 sequence(title,['Cliente',':PantallaCajero',':Sesion',op,...(op===':Transferencia'?[]:[':Cuenta']),':CentralDB'],ev,'Escenario exitoso con sesión autenticada: la comprobación de Sesion es la rama de reutilización del include. Si es false se ejecuta 01 antes de continuar. Pantalla configura cuenta y parámetros antes de ejecutar(). Central actualiza el saldo de Cuenta; consultarSaldo() posterior al débito puede usar ese saldo actualizado. Transferencia recibe directamente el comprobante central. registrar() persiste D1; agregarOperacion() vincula la operación con Sesion.');
}
for(const ticket of [true,false]){
 const events=[['Cliente',':PantallaCajero','finalizarSesion(deseaTicket = '+ticket+')','call','fin']];
 if(ticket)events.push([':PantallaCajero',':Sesion','obtenerOperaciones()','call','ops'],[':Sesion',':PantallaCajero','operaciones: List<Operacion>','return','ops'],[':PantallaCajero',':PantallaCajero','imprimirTicket(operaciones)','call','imp']);
 events.push([':PantallaCajero',':PantallaCajero','devolverTarjeta()','call','dev'],[':PantallaCajero',':Sesion','cerrar()','call','cerrar'],[':Sesion',':PantallaCajero','sesionCerrada','return','cerrar'],[':PantallaCajero','Cliente','tarjetaDevuelta = true; estadoSesion = CERRADA','return','fin']);
 sequence('05'+(ticket?'a':'b')+' Finalizar Sesión — '+(ticket?'con ticket':'sin ticket'),['Cliente',':PantallaCajero',':Sesion'],events,'Extensión finDeOperacion [cliente solicita finalizar sesión], o cierre desde el menú. Siempre se devuelve tarjeta y se cierra la sesión; sólo la impresión depende de deseaTicket. Sesion conserva las operaciones registradas durante la sesión y obtenerOperaciones() puede consultar D1.');
}
save('DiagramaDeSecuencia/DiagramaSecuencia.mdj',seqP);

// Documentación, diccionario y trazabilidad.
let dd='# Diccionario de datos — Cajero Automático\n\nVersión propuesta para TrabajoCorregidoCodex. D2 y D3 se excluyen por aclaración del alumno. Los flujos son lógicos: pueden agrupar varias pantallas o intercambios, sin imponer orden temporal.\n\nNotación: `+` composición; `[x]` componente opcional; `{x}` cero o más repeticiones; `|` alternativa. Los importes usan Decimal, nunca punto flotante binario.\n\n## Flujos de datos\n\n| Nombre | Descripción | Composición | Valores permitidos / restricciones |\n|---|---|---|---|\n';
for(const f of Object.values(F))dd+='| '+[f.name,f.description,f.composition,f.values].map(s=>s.replaceAll('|','\\|')).join(' | ')+' |\n';
dd+='\n## Estructuras compuestas\n\n| Nombre | Descripción | Composición | Valores permitidos / restricciones |\n|---|---|---|---|\n'+[
 ['DatosTarjeta','Datos leídos de la tarjeta','numeroTarjeta + fechaVencimiento + entidadEmisora','No incluye PIN; estado validado por Sucursal.'],
 ['ContextoSesion','Identidad operativa de sesión','idSesion + numeroTarjeta + numeroCuenta + autenticada','Sólo se entrega para operar con autenticada=true.'],
 ['ResultadoOperacion','Resumen de ejecución','numeroOperacion + tipoOperacion + estado + mensaje','EXITOSA o RECHAZADA; mensaje legible.'],
 ['RegistroOperacion','Fila de historial de operación','idSesion + numeroOperacion + fechaHora + tipoOperacion + estado + numeroCuenta + [monto] + [cbuDestino] + [numeroComprobante] + [saldoDisponible] + [saldoTotal] + [saldoRestante]','Campos opcionales dependen del tipo y resultado; no guardar PIN.'],
 ['Ticket','Comprobante de sesión','idSesion + fechaHora + {RegistroOperacion}','Puede contener cero operaciones; sólo se imprime si deseaTicket=true.']
].map(a=>'| '+a.join(' | ')+' |').join('\n');
dd+='\n\n## Elementos de datos\n\n| Nombre | Descripción | Composición / tipo | Valores permitidos |\n|---|---|---|---|\n';
const fields=[
 ['idSesion','Identifica una sesión','Integer','Entero positivo, único.'],['numeroOperacion','Identifica operación local','Integer','Entero positivo, único.'],['numeroTarjeta','Identifica tarjeta','String','13 a 19 dígitos; conservar ceros iniciales. Supuesto de simulación.'],['numeroCuenta','Identifica cuenta','String','No vacío; autoridad: Sucursal/Central.'],['pin','Secreto de autenticación','String','Exactamente 4 dígitos; conservar ceros iniciales; máximo 3 intentos.'],['fechaVencimiento','Vencimiento de tarjeta','Date','Fecha válida; vencimiento resuelto por Sucursal.'],['entidadEmisora','Entidad de la tarjeta','String','No vacío.'],['fechaHora','Instante de registro','DateTime','Fecha/hora válida; formato ISO 8601 en persistencia.'],['tipoOperacion','Clase de operación','Enum','CONSULTA / EXTRACCION / TRANSFERENCIA.'],['estado','Resultado de operación','Enum','EXITOSA / RECHAZADA.'],['estadoTarjeta','Resultado de validación','Enum','VALIDA / VENCIDA / BLOQUEADA / DESCONOCIDA.'],['estadoAutenticacion','Resultado de acceso','Enum','AUTENTICADA / TARJETA_INVALIDA / PIN_INVALIDO / INTENTOS_AGOTADOS.'],['estadoSesion','Estado de ciclo de vida','Enum','INICIADA / AUTENTICANDO / VALIDANDO / OPERANDO / CERRANDO / CERRADA.'],['intentosRestantes','PIN disponibles','Integer','0..3.'],['intentosPIN','Intentos fallidos de la sesión','Integer','0..3; inicial 0.'],['monto','Importe solicitado','Decimal','Mayor que 0, dos decimales. En extracción, validar disponibilidad de billetes en presentación.'],['montoEntregado','Efectivo realmente entregado','Decimal','>=0; 0 si operación rechazada.'],['saldoDisponible','Fondos utilizables','Decimal','>=0; no mayor a saldoTotal en esta simulación.'],['saldoTotal','Saldo contabilizado','Decimal','>=0 en esta simulación, sin descubierto.'],['saldoRestante','Saldo disponible posterior','Decimal','>=0.'],['limiteDiario','Máximo diario de extracción','Decimal','>=0; verificado por Central.'],['cbuDestino','Cuenta destino','String','Exactamente 22 dígitos; formato no garantiza existencia. Central valida destino.'],['numeroTransaccion','Referencia de débito','String','No vacía en débito exitoso.'],['numeroComprobante','Referencia de transferencia','String','No vacía en transferencia exitosa.'],['mensaje','Texto para el usuario','String','Texto legible; no incluye PIN.'],['menu','Opciones disponibles','Lista de Enum','CONSULTAR / EXTRAER / TRANSFERIR / FINALIZAR.'],...['autenticada','pinValido','exito','confirmacion','deseaTicket','tarjetaDevuelta','bloqueada'].map(n=>[n,'Indicador '+n,'Boolean','true / false.'])];
dd+=fields.map(a=>'| '+a.join(' | ')+' |').join('\n');
dd+='\n\n## Almacén D1\n\n| Nombre | Descripción | Composición | Valores permitidos / restricciones |\n|---|---|---|---|\n| D1 — Log de operaciones | Historial de operaciones para auditoría y ticket. | {RegistroOperacion} | Cero o más registros; clave numeroOperacion; filtro idSesion. Sólo acceden procesos del cajero. No contiene PIN. |\n\n## Balanceo\n\nCada fila representa un flujo externo presente en Contexto y Nivel 0 con el mismo nombre, terminador y dirección. Los flujos internos de sesión y D1 no aparecen en el contexto.\n\n| Terminador | Dirección | Flujo | Proceso Nivel 0 |\n|---|---|---|---|\n';
for(const [s,t,k]of EX){const input=!!externals[s],pr=input?t:s;dd+='| '+externals[input?s:t]+' | '+(input?'Entrada al cajero':'Salida del cajero')+' | '+F[k].name+' | '+pr+'.0 '+PN[pr]+' |\n'}
dd+='\nLos flujos de credenciales y resultados agrupan los datos que antes estaban repartidos en flechas separadas. Resultado de autenticación incluye solicitud de reintento, error o menú según estado; Resultado de cierre representa la información del ticket y la devolución física, no un transporte de objetos por un flujo lógico. Los pedidos de PIN y las acciones físicas se detallan en secuencias.\n';
save('DiccionarioDeDatos.md',dd);
save('README.md',`# Cajero Automático — TrabajoCorregidoCodex

Modelos corregidos derivados de TrabajoCorregido. Los originales se conservan intactos. Esta carpeta contiene diagramas StarUML y documentación; todavía no es una aplicación ejecutable.

## Archivos para abrir

- DiagramaContexto/DiagramaDeContexto.mdj: contexto con tres terminadores y flujos agrupados documentados.
- DFD/DFDNivel0.mdj: cinco procesos y D1; balanceado con el contexto.
- DFD/DFDNivel1.mdj: desarrollo de los cinco procesos.
- DFD/*Nivel2*.mdj: descomposición selectiva de validación, consulta, débito, transferencia y ticket; no es obligatorio descomponer procesos triviales.
- CasosDeUso/CasoDeUsoContextual.mdj: diagrama general con include y extend.
- CasosDeUso/CasoDeUso.mdj: cinco vistas individuales y documentación de escenarios.
- DiagramaDeClases/DiagramaClases.mdj: ocho clases, herencias, asociaciones y composición.
- DiagramaDeSecuencia/DiagramaSecuencia.mdj: autenticación y alternativas, tres operaciones y cierre con/sin ticket.
- DiccionarioDeDatos.md: flujos, estructuras, elementos, D1 y tabla de balanceo.
- Vistas/: imágenes JPEG exportadas directamente por StarUML para consultar los diagramas.
- VALIDACION.md: comprobaciones realizadas y alcance de la revisión visual.

Abrir cada .mdj desde File > Open en StarUML y seleccionar el diagrama en Model Explorer. Los archivos son independientes, no referencias enlazadas entre proyectos. Las vistas repetidas de terminadores/almacenes en DFD corresponden a un mismo elemento dentro de cada diagrama.

## Decisiones de modelado

1. Se ignoran D2/D3 y la referencia a la sección 5 por aclaración expresa del alumno. Se conserva D1 porque los modelos originales registran operaciones y emiten tickets.
2. Autenticar Usuario se ejecuta como include de cada operación para garantizar acceso. Su primera rama reutiliza la sesión ya autenticada; únicamente sin sesión válida se pide tarjeta/PIN. No se solicita PIN otra vez para cada operación.
3. El cierre extiende las operaciones en finDeOperacion cuando el cliente solicita finalizar. Dentro del cierre, deseaTicket controla la impresión; devolución de tarjeta y cierre son obligatorios en ambas ramas. También puede cerrarse desde el menú sin operaciones.
4. Una tarjeta accede a una cuenta en esta simulación; un cliente puede tener varias tarjetas y sesiones. Cada operación pertenece a una sesión y una cuenta de origen. Sesion compone operaciones en memoria; D1 conserva el historial persistente independientemente de esos objetos.
5. Consulta/Extraccion/Transferencia redefinen ejecutar(): Boolean de Operacion abstracta. Los atributos son privados; los métodos, públicos. Clases sin subrayar: el subrayado de la consigna se refiere a instancias, no a las clases.
6. Central es la autoridad para fondos, débitos y transferencias. La transferencia es atómica; no se debita localmente antes de enviar la orden. El escenario exitoso supone que el dispensador funciona; fallas mecánicas/compensación quedan fuera de esta simulación académica.
7. Máximo tres PIN fallidos por sesión. Al agotarlos se devuelve tarjeta y se cierra; no se inventa un bloqueo bancario permanente ni retención física.
8. Los DFD son lógicos y usan registros compuestos definidos en el DD. Un flujo puede agrupar una conversación; las secuencias describen el orden de las interacciones.

## Cambios frente al material original

- Se eliminaron flujos sin nombre, conexiones directas de terminadores a almacenes y discrepancias de frontera entre niveles.
- Se unificaron nombres y numeración y se desarrolló el débito de extracción que estaba incompleto.
- Se corrigieron los miembros de Cliente y Tarjeta y se añadieron relaciones y multiplicidades justificadas.
- Se corrigieron destinatarios, parámetros, llamadas asíncronas y activaciones de las secuencias. Los retornos se modelan como reply.
- Se documentaron las condiciones de extend y los puntos de extensión.

## Pendientes fuera de esta corrección

No se incluyen todavía el diagrama de estados (punto 8), actividad (punto 9) ni implementación en capas (punto 10), conforme al alcance acordado antes de empezar. Este README explica cómo abrir modelos; no reemplaza instrucciones para ejecutar una aplicación futura. Integrantes del equipo: pendiente de completar por el alumno.

La carpeta herramientas contiene el generador y validador usados para producir los modelos. El generador sólo emite parches y no modifica los originales.
`);
// Evidencia de preservación de los archivos fuente.
function sourceFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?sourceFiles(path.join(dir,e.name)):[path.join(dir,e.name)])}
const hashes=Object.fromEntries(sourceFiles(SOURCE).map(f=>[path.relative(SOURCE,f).replaceAll('\\','/'),crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
save('herramientas/originales.sha256.json',JSON.stringify(hashes,null,2)+'\n');
if(process.argv[2]==='--chunk'){
 const name=process.argv[3],start=Number(process.argv[4]||0),size=Number(process.argv[5]||800);
 const lines=outputs[name].trimEnd().split('\n'),part=lines.slice(start,start+size),more=start+size<lines.length;
 const target=path.join(ROOT,name).replaceAll('\\','/');
 console.log('*** Begin Patch\n'+(start===0?'*** Add File: '+target:'*** Update File: '+target+'\n@@\n-__CODEX_APPEND__')+'\n'+[...part,...(more?['__CODEX_APPEND__']:[])].map(s=>'+'+s).join('\n')+'\n*** End Patch');
}else if(process.argv[2]==='--size')console.log(outputs[process.argv[3]].trimEnd().split('\n').length);
else if(process.argv[2]==='--list')console.log(Object.keys(outputs).join('\n'));
else if(process.argv[2]==='--patch'){
 const name=process.argv[3];if(!(name in outputs))throw Error('Archivo desconocido: '+name);
 const target=path.join(ROOT,name).replaceAll('\\','/');const old=fs.existsSync(target)?fs.readFileSync(target,'utf8'):null;
 if(old===outputs[name]){console.log('UNCHANGED');process.exit(0)}
 if(old!==null){console.log('*** Begin Patch\n*** Add File: '+target+'\n'+outputs[name].trimEnd().split('\n').map(s=>'+'+s).join('\n')+'\n*** End Patch')}
 else console.log('*** Begin Patch\n*** Add File: '+target+'\n'+outputs[name].trimEnd().split('\n').map(s=>'+'+s).join('\n')+'\n*** End Patch');
}else if(process.argv[2]==='--json')console.log(outputs[process.argv[3]]);
module.exports={outputs,F,EX,INT,L1,seqSpecs};
