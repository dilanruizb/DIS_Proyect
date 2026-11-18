/* Generador independiente: no regenera ni sobrescribe los demás diagramas. */
const path=require('path'),assert=require('assert');
let serial=0;
const ref=x=>({$ref:x._id});
function obj(t,p,extra={}){return {_type:t,_id:'sesion-'+(++serial),...(p?{_parent:ref(p)}:{}),...extra}}
const project=obj('Project',null,{name:'Cajero Automático - Estados de Sesion',ownedElements:[]});
const cls=obj('UMLClass',project,{name:'Sesion',documentation:'Clase de contexto de esta máquina de estados. El diagrama de clases completo se mantiene en su archivo independiente.',ownedElements:[]});project.ownedElements.push(cls);
const machine=obj('UMLStateMachine',cls,{name:'Ciclo de vida de Sesion',regions:[],ownedElements:[]});cls.ownedElements.push(machine);
const region=obj('UMLRegion',machine,{name:'Ciclo de sesión',vertices:[],transitions:[]});machine.regions.push(region);
const diagram=obj('UMLStatechartDiagram',machine,{name:'Estados de Sesion',defaultDiagram:true,ownedViews:[],documentation:'Inicial -> Iniciada -> Autenticando (tarjeta) -> Validando (PIN) -> Operando -> Cerrando -> Cerrada -> final. intentosPIN cuenta fallos previos: 0,1 permiten reintentar; 2 produce el cierre al tercer fallo. Las guardas se evalúan antes del efecto registrarIntentoFallido(). iniciar() inicializa intentosPIN=0, autenticada=false y deseaTicket=false. solicitarYValidarPIN() espera el ingreso del PIN y consulta CentralDB; emite pinValido o pinInvalido. completarCierre(deseaTicket) imprime ticket solo cuando corresponde y devuelve la tarjeta; emite cierreCompletado únicamente al terminar. cerrar() registra el fin e invalida la autenticación. Los puntos inicial y final usan transiciones de inicialización/completitud sin disparador, como corresponde a UML.'});machine.ownedElements.push(diagram);
const style={font:'Arial;13;0',showShadow:false,fillColor:'#ffffff',lineColor:'#333333',fontColor:'#111111'};
function label(type,p,text,x,y,w,extra={}){return obj(type,p,{...style,text,left:x,top:y,width:w,height:18,...extra})}
function state(name,x,y,w,activities=[]){
 const s=obj('UMLState',region,{name,entryActivities:[],doActivities:[],exitActivities:[],regions:[]});region.vertices.push(s);
 for(const [kind,n] of activities)s[kind].push(obj('UMLActivity',s,{name:n}));
 const v=obj('UMLStateView',diagram,{...style,model:ref(s),left:x,top:y,width:w,height:80,subViews:[]});diagram.ownedViews.push(v);
 const nc=obj('UMLNameCompartmentView',v,{...style,model:ref(s),left:x,top:y,width:w,height:28,subViews:[]});
 for(const [key,text] of [['stereotypeLabel',''],['nameLabel',name],['namespaceLabel',''],['propertyLabel','']]){let l=label('LabelView',nc,text,x+5,y+5,w-10,{visible:key==='nameLabel',font:'Arial;13;'+(key==='nameLabel'?'1':'0')});nc.subViews.push(l);nc[key]=ref(l)}
 v.subViews.push(nc);v.nameCompartment=ref(nc);
 for(const [key,t]of [['internalActivityCompartment','UMLInternalActivityCompartmentView'],['internalTransitionCompartment','UMLInternalTransitionCompartmentView'],['decompositionCompartment','UMLDecompositionCompartmentView']]){
  const c=obj(t,v,{...style,model:ref(s),left:x,top:y+28,width:w,height:35,subViews:[]});
  if(key==='internalActivityCompartment')activities.forEach(([kind,n],i)=>{const b=s[kind].find(b=>b.name===n);c.subViews.push(label('UMLInternalActivityView',c,n,x+8,y+34+i*18,w-16,{model:ref(b),horizontalAlignment:0}));});
  v.subViews.push(c);v[key]=ref(c);
 }
 return {s,v};
}
function dot(type,x,y){let s=obj(type,region,type==='UMLPseudostate'?{kind:'initial'}:{});region.vertices.push(s);let v=obj(type+'View',diagram,{...style,model:ref(s),left:x,top:y,width:22,height:22});if(type==='UMLPseudostate'){v.subViews=[];for(let key of ['nameLabel','stereotypeLabel']){let l=label('NodeLabelView',v,'',x,y,10,{visible:false,hostNode:ref(v)});v.subViews.push(l);v[key]=ref(l)}}diagram.ownedViews.push(v);return{s,v}}
const initial=dot('UMLPseudostate',159,70);
const iniciada=state('Iniciada',60,200,220,[['entryActivities','iniciar()']]);
const autenticando=state('Autenticando (tarjeta)',510,200,270);
const validando=state('Validando (PIN)',1010,200,310,[['doActivities','solicitarYValidarPIN()']]);
const operando=state('Operando',1010,650,310,[['entryActivities','mostrarMenu()'],['doActivities','atenderOperaciones()']]);
const cerrando=state('Cerrando',510,650,310,[['doActivities','completarCierre(deseaTicket)']]);
const cerrada=state('Cerrada',60,650,220);
const final=dot('UMLFinalState',159,830);
function transition(a,b,event,guard,effect,points,opts={}){
 const t=obj('UMLTransition',region,{source:ref(a.s),target:ref(b.s),kind:'external',guard:guard||'',triggers:[],effects:[]});region.transitions.push(t);
 if(event)t.triggers.push(obj('UMLEvent',t,{name:event,kind:'signal'}));
 if(effect)t.effects.push(obj('UMLActivity',t,{name:effect}));
 const v=obj('UMLTransitionView',diagram,{...style,model:ref(t),tail:ref(a.v),head:ref(b.v),lineStyle:0,points:points.map(p=>p.join(':')).join(';'),subViews:[]});
 const text=[event,guard?'['+guard+']':'',effect?'/ '+effect:''].filter(Boolean).join(' ');
 for(const key of ['nameLabel','stereotypeLabel','propertyLabel']){const l=label('EdgeLabelView',v,key==='nameLabel'?text:'',points[0][0],points[0][1],opts.width||235,{visible:key==='nameLabel'&&!!text,hostEdge:ref(v),edgePosition:1,distance:opts.distance??28,alpha:opts.alpha??Math.PI/2,wordWrap:true});v.subViews.push(l);v[key]=ref(l)}
 diagram.ownedViews.push(v);return t;
}
transition(initial,iniciada,'','','',[[170,92],[170,200]]);
transition(iniciada,autenticando,'introducirTarjeta(datos)','','validarTarjeta(datos)',[[280,240],[510,240]],{distance:35,width:215});
transition(autenticando,validando,'tarjetaValida','','',[[780,240],[1010,240]],{distance:20});
transition(autenticando,cerrando,'tarjetaInvalida','','informarRechazo()',[[645,280],[645,650]],{distance:110,width:190,alpha:-Math.PI/2});
transition(validando,operando,'pinValido','','autenticar()',[[1165,280],[1165,650]],{distance:80,width:145});
transition(validando,validando,'pinInvalido','intentosPIN < 2','registrarIntentoFallido()',[[1320,220],[1470,220],[1470,80],[1165,80],[1165,130],[1165,200]],{distance:35,width:285});
transition(validando,cerrando,'pinInvalido','intentosPIN = 2','registrarIntentoFallido()',[[1080,280],[1080,450],[910,450],[750,450],[750,550],[750,650]],{distance:35,width:290});
transition(operando,operando,'operacionFinalizada','','mostrarResultado()',[[1320,680],[1470,680],[1470,840],[1165,840],[1165,790],[1165,730]],{distance:35,width:250});
transition(operando,cerrando,'solicitarCierre(deseaTicket)','','',[[1010,690],[820,690]],{distance:30,width:185});
transition(cerrando,cerrada,'cierreCompletado','','cerrar()',[[510,690],[280,690]],{distance:30,width:210});
transition(cerrada,final,'','','',[[170,730],[170,830]]);
function walk(x,a=[]){if(!x||typeof x!=='object')return a;if(x._type)a.push(x);Object.values(x).forEach(v=>walk(v,a));return a}
const all=walk(project),ids=new Set(all.map(x=>x._id));assert.equal(ids.size,all.length);
function refs(x){if(!x||typeof x!=='object')return;if(x.$ref)assert(ids.has(x.$ref),'Referencia inválida '+x.$ref);Object.values(x).forEach(refs)}refs(project);
assert.equal(region.vertices.filter(x=>x._type==='UMLState').length,6);
assert.equal(region.transitions.filter(x=>x.source.$ref===validando.s._id&&x.triggers[0]?.name==='pinInvalido').length,2);
for(let failures=0;failures<3;failures++){const retry=failures<2,close=failures===2;assert(retry!==close);assert.equal(close,failures+1===3)}
const target=path.resolve(__dirname,'../DiagramaDeEstado/EstadoSesion.mdj').replaceAll('\\','/');
const content=JSON.stringify(project,null,2)+'\n';
if(process.argv.includes('--patch'))console.log('*** Begin Patch\n*** Add File: '+target+'\n'+content.trimEnd().split('\n').map(s=>'+'+s).join('\n')+'\n*** End Patch');
else console.log(content);
module.exports={project};
