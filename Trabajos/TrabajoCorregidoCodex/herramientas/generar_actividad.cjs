/* Generador independiente de las actividades del sistema Cajero Automático. */
const path=require('path');
let serial=0;
const ref=x=>({$ref:x._id});
const obj=(t,p,extra={})=>({_type:t,_id:'actividad-'+(++serial),...(p?{_parent:ref(p)}:{}),...extra});
const project=obj('Project',null,{name:'Cajero Automático - Actividades del sistema',ownedElements:[]});
const model=obj('UMLModel',project,{name:'Sistema Cajero Automático',ownedElements:[]});project.ownedElements.push(model);
const style={font:'Arial;13;0',showShadow:false,fillColor:'#ffffff',lineColor:'#333333',fontColor:'#111111'};
const activities={};
function activity(key,name,doc){
 const a=obj('UMLActivity',model,{name,nodes:[],edges:[],ownedElements:[],documentation:doc});model.ownedElements.push(a);
 const d=obj('UMLActivityDiagram',a,{name:'Actividad '+name,defaultDiagram:key==='general',ownedViews:[]});a.ownedElements.push(d);
 return activities[key]={a,d,n:{}};
}
activity('general','01 - Operar Cajero','Flujo del sistema durante una sesión. Las cinco acciones callBehavior invocan de forma sincrónica las actividades de detalle del mismo proyecto. Finalizar una actividad invocada devuelve el control al flujo general; únicamente el final de este flujo termina la sesión. El menú ofrece exactamente Consulta, Extracción, Transferencia y Finalizar.');
activity('auth','02 - Autenticar Usuario','Salida: autenticada true/false. iniciar() pone intentosPIN=0, autenticada=false y deseaTicket=false una sola vez. Cada PIN inválido incrementa antes de comparar con 3. La tarjeta rechazada y el tercer PIN inválido retornan false al flujo general, que ejecuta Cerrar Sesión y devuelve la tarjeta.');
activity('consulta','03 - Consultar Saldo','Precondición: sesión autenticada. Red Central devuelve éxito y saldos o rechazo/error. Se registra el resultado en Sesion y D1 sin guardar el PIN; al terminar vuelve al menú general.');
activity('extraccion','04 - Extraer Efectivo','Precondición: sesión autenticada. Se captura un monto numérico positivo. Red Central verifica fondos y límite, y realiza autorización y débito atómicos. Solo se entrega efectivo si se confirma el débito. Se supone que el dispensador funciona, como en el modelo previo; compensación por falla física queda fuera de esta simulación.');
activity('transferencia','05 - Realizar Transferencia','Precondición: sesión autenticada. CBU de 22 dígitos y monto numérico positivo. La cancelación de la confirmación vuelve al menú sin movimiento ni registro de operación procesada. Central valida cuenta destino, fondos y límites y ejecuta débito/crédito atómicos. Nunca se debita antes de enviar la orden.');
activity('cierre','06 - Cerrar Sesion','Una sesión autenticada permite elegir ticket; un acceso rechazado no lo ofrece. D1 devuelve cero o más operaciones. La tarjeta se devuelve tanto con ticket como sin él. Solo después se registra el fin y se invalida la sesión. Se mantienen los supuestos de dispositivos operativos del proyecto.');
function label(t,p,text,x,y,w,extra={}){return obj(t,p,{...style,text,left:x,top:y,width:w,height:18,...extra})}
function node(A,key,type,name,cx,cy,w=260,h=55,extra={}){
 const m=obj(type,A.a,{name,...extra});A.a.nodes.push(m);
 const action=type==='UMLAction';const v=obj(action?'UMLActionView':'UMLControlNodeView',A.d,{...style,model:ref(m),wordWrap:true,left:cx-w/2,top:cy-h/2,width:w,height:h,subViews:[]});A.d.ownedViews.push(v);
 if(action){
  const nc=obj('UMLNameCompartmentView',v,{...style,model:ref(m),left:v.left,top:v.top,width:w,height:h,subViews:[]});
  for(const [k,text]of [['stereotypeLabel',''],['nameLabel',name],['namespaceLabel',''],['propertyLabel','']]){const l=label('LabelView',nc,text,v.left+7,v.top+7,w-14,{visible:k==='nameLabel',wordWrap:true});nc.subViews.push(l);nc[k]=ref(l)}
  v.subViews.push(nc);v.nameCompartment=ref(nc);
 }
 return A.n[key]={m,v,x:cx,y:cy,w,h};
}
const action=(A,k,n,x,y,w=260)=>node(A,k,'UMLAction',n,x,y,w,55,{kind:'opaque'});
const call=(A,k,target,x,y,w=260)=>node(A,k,'UMLAction',activities[target].a.name,x,y,w,60,{kind:'callBehavior',target:ref(activities[target].a),isSynchronous:true});
const start=(A,x,y)=>node(A,'inicio','UMLInitialNode','',x,y,20,20);
const end=(A,x,y)=>node(A,'fin','UMLActivityFinalNode','',x,y,24,24);
const decision=(A,k,x,y)=>node(A,k,'UMLDecisionNode',k,x,y,34,34);
const merge=(A,k,x,y)=>node(A,k,'UMLMergeNode',k,x,y,26,26);
function edge(A,from,to,guard='',via=[],opts={}){
 const a=A.n[from],b=A.n[to],m=obj('UMLControlFlow',A.a,{source:ref(a.m),target:ref(b.m),guard});A.a.edges.push(m);
 const pts=[[a.x,a.y],...via,[b.x,b.y]];
 const v=obj('UMLControlFlowView',A.d,{...style,model:ref(m),tail:ref(a.v),head:ref(b.v),lineStyle:via.length?0:1,points:pts.map(p=>p.join(':')).join(';'),subViews:[]});
 for(const k of ['nameLabel','stereotypeLabel','propertyLabel']){const l=label('EdgeLabelView',v,k==='nameLabel'&&guard?'['+guard+']':'',a.x,a.y,opts.width||140,{visible:k==='nameLabel'&&!!guard,hostEdge:ref(v),edgePosition:1,distance:opts.distance??19,alpha:opts.alpha??Math.PI/2,wordWrap:true});v.subViews.push(l);v[k]=ref(l)}
 A.d.ownedViews.push(v);return m;
}
function chain(A,...ids){for(let i=1;i<ids.length;i++)edge(A,ids[i-1],ids[i]);}
// 01: navegación de la sesión; las llamadas apuntan a actividades reales.
{
 const A=activities.general;
 start(A,540,35);call(A,'auth','auth',540,120);decision(A,'acceso',540,235);
 merge(A,'menuEntrada',540,325);action(A,'menu','Mostrar menú y recibir opción',540,410);decision(A,'opcion',540,520);
 call(A,'consulta','consulta',180,660);call(A,'extraccion','extraccion',540,660);call(A,'transferencia','transferencia',900,660,290);
 merge(A,'operacionTerminada',540,810);merge(A,'cierreEntrada',1260,925);call(A,'cierre','cierre',1260,1020);end(A,1260,1130);
 chain(A,'inicio','auth','acceso');edge(A,'acceso','menuEntrada','autenticada');edge(A,'acceso','cierreEntrada','no autenticada',[[1360,235],[1360,925]],{width:130});
 chain(A,'menuEntrada','menu','opcion');
 edge(A,'opcion','consulta','Consulta',[],{width:110});edge(A,'opcion','extraccion','Extracción',[],{distance:65,width:105});edge(A,'opcion','transferencia','Transferencia',[],{width:120});
 edge(A,'opcion','cierreEntrada','Finalizar',[[1190,520],[1190,925]],{width:105});
 edge(A,'consulta','operacionTerminada','',[[180,810]]);edge(A,'extraccion','operacionTerminada');edge(A,'transferencia','operacionTerminada','',[[900,810]]);
 edge(A,'operacionTerminada','menuEntrada','',[[540,870],[20,870],[20,325]]);chain(A,'cierreEntrada','cierre','fin');
}
// 02: autenticación y contador de fallos (incrementar ANTES de comparar).
{
 const A=activities.auth;
 start(A,600,30);action(A,'iniciar','Iniciar sesión: intentosPIN = 0; autenticada = false; deseaTicket = false',600,110,340);
 action(A,'tarjeta','Recibir tarjeta y leer datos',600,205);
 action(A,'validarTarjeta','Solicitar validación de tarjeta a Sucursal y recibir respuesta',600,305,330);decision(A,'tarjetaValida',600,410);
 action(A,'tarjetaRechazada','Mostrar motivo del rechazo; autenticada = false',1030,505,280);
 merge(A,'reintento',600,510);action(A,'pedirPIN','Solicitar y recibir PIN del Cliente',600,600,300);
 action(A,'validarPIN','Enviar tarjeta y PIN a Red Central; recibir validación',600,700,310);decision(A,'PINvalido',600,805);
 action(A,'sumarFallo','intentosPIN = intentosPIN + 1',220,895,280);decision(A,'limiteIntentos',220,1000);
 action(A,'agotar','Informar intentos agotados; autenticada = false',220,1130,300);
 action(A,'autenticar','Autenticar sesión y vincular cuenta; autenticada = true',600,1100,310);
 merge(A,'resultado',600,1270);end(A,600,1350);
 chain(A,'inicio','iniciar','tarjeta','validarTarjeta','tarjetaValida');
 edge(A,'tarjetaValida','reintento','válida',[],{distance:48,width:85});edge(A,'tarjetaValida','tarjetaRechazada','inválida',[[1030,410]],{width:95});
 chain(A,'reintento','pedirPIN','validarPIN','PINvalido');edge(A,'PINvalido','autenticar','PIN correcto',[],{distance:65,width:115});
 edge(A,'PINvalido','sumarFallo','PIN incorrecto',[[220,805]],{width:120});edge(A,'sumarFallo','limiteIntentos');
 edge(A,'limiteIntentos','reintento','intentosPIN < 3',[[40,1000],[40,510]],{distance:85,width:145});
 edge(A,'limiteIntentos','agotar','intentosPIN = 3',[],{distance:85,width:140});
 edge(A,'tarjetaRechazada','resultado','',[[1030,1270]]);edge(A,'agotar','resultado','',[[220,1270]]);chain(A,'autenticar','resultado','fin');
}
// 03: consulta; ambos resultados se registran y retornan al menú.
{
 const A=activities.consulta;
 start(A,440,35);action(A,'solicitar','Consultar saldo de la cuenta en Red Central',440,130,300);decision(A,'exito',440,245);
 action(A,'mostrar','Mostrar saldo disponible y saldo total; resultado = EXITOSA',190,370,300);action(A,'rechazo','Mostrar motivo del rechazo/error; resultado = RECHAZADA',720,370,310);
 merge(A,'resultado',440,505);action(A,'registrar','Registrar consulta y resultado en Sesion y D1',440,600,320);end(A,440,710);
 chain(A,'inicio','solicitar','exito');edge(A,'exito','mostrar','éxito',[[190,245]],{width:85});edge(A,'exito','rechazo','rechazo / error',[[720,245]],{width:130});
 edge(A,'mostrar','resultado','',[[190,505]]);edge(A,'rechazo','resultado','',[[720,505]]);chain(A,'resultado','registrar','fin');
}
// 04: validación de monto, autorización/débito y entrega condicionada.
{
 const A=activities.extraccion;
 start(A,500,30);merge(A,'entradaMonto',500,105);action(A,'monto','Solicitar y recibir monto a retirar',500,195,300);decision(A,'montoValido',500,300);
 action(A,'montoError','Mostrar error de monto',900,300,250);
 action(A,'debito','Solicitar débito a Red Central: verifica fondos y límite; recibir resultado',500,435,350);decision(A,'autorizacion',500,550);
 action(A,'efectivo','Dispensar efectivo por el monto autorizado',230,690,310);action(A,'mostrar','Mostrar monto entregado y saldo restante; resultado = EXITOSA',230,800,330);
 action(A,'rechazo','Mostrar rechazo/error; no dispensar; resultado = RECHAZADA',850,745,330);
 merge(A,'resultado',500,935);action(A,'registrar','Registrar extracción y resultado en Sesion y D1',500,1030,340);end(A,500,1140);
 chain(A,'inicio','entradaMonto','monto','montoValido');edge(A,'montoValido','debito','numérico y > 0',[],{distance:80,width:135});edge(A,'montoValido','montoError','inválido',[],{width:100});
 edge(A,'montoError','entradaMonto','',[[1080,300],[1080,105]]);edge(A,'debito','autorizacion');
 edge(A,'autorizacion','efectivo','débito confirmado',[[230,550]],{width:150});edge(A,'autorizacion','rechazo','rechazo / error',[[850,550]],{width:130});
 edge(A,'efectivo','mostrar');edge(A,'mostrar','resultado','',[[230,935]]);edge(A,'rechazo','resultado','',[[850,935]]);chain(A,'resultado','registrar','fin');
}
// 05: transferencia confirmada y atómica; cancelar no genera débito.
{
 const A=activities.transferencia;
 start(A,540,30);merge(A,'entradaDatos',540,105);action(A,'datos','Solicitar y recibir CBU destino y monto',540,195,310);decision(A,'datosValidos',540,300);
 action(A,'datosError','Mostrar error de CBU o monto',1040,300,280);
 action(A,'resumen','Mostrar destino y monto; solicitar confirmación',540,420,320);decision(A,'confirmada',540,535);
 action(A,'cancelar','Informar cancelación; sin débito ni crédito',1060,650,300);
 action(A,'transferir','Enviar orden a Red Central: validar destino y fondos; transferir atómicamente',540,690,360);decision(A,'exito',540,810);
 action(A,'comprobante','Mostrar comprobante y saldo restante; resultado = EXITOSA',220,945,330);action(A,'rechazo','Mostrar rechazo/error; sin movimiento; resultado = RECHAZADA',850,945,330);
 merge(A,'resultado',540,1085);action(A,'registrar','Registrar transferencia y resultado en Sesion y D1',540,1180,350);merge(A,'retorno',540,1290);end(A,540,1380);
 chain(A,'inicio','entradaDatos','datos','datosValidos');edge(A,'datosValidos','resumen','CBU: 22 dígitos; monto numérico > 0',[],{distance:130,width:190});
 edge(A,'datosValidos','datosError','datos inválidos',[],{width:135});edge(A,'datosError','entradaDatos','',[[1240,300],[1240,105]]);
 edge(A,'resumen','confirmada');edge(A,'confirmada','transferir','confirmada',[],{distance:65,width:100});edge(A,'confirmada','cancelar','no confirmada',[[1060,535]],{width:135});
 edge(A,'transferir','exito');edge(A,'exito','comprobante','éxito',[[220,810]],{width:80});edge(A,'exito','rechazo','rechazo / error',[[850,810]],{width:130});
 edge(A,'comprobante','resultado','',[[220,1085]]);edge(A,'rechazo','resultado','',[[850,1085]]);chain(A,'resultado','registrar','retorno','fin');
 edge(A,'cancelar','retorno','',[[1280,650],[1280,1290]]);
}
// 06: convergencia de todos los cierres antes de devolver tarjeta.
{
 const A=activities.cierre;
 start(A,500,30);action(A,'cerrando','Pasar Sesion a Cerrando',500,120);decision(A,'autenticada',500,225);
 action(A,'preguntar','Preguntar si desea ticket y recibir decisión',500,335,320);decision(A,'ticket',500,445);
 action(A,'recuperar','Obtener de D1 las operaciones de la sesión',230,580,320);action(A,'imprimir','Preparar e imprimir ticket (puede no tener operaciones)',230,690,340);
 merge(A,'devolucion',500,840);action(A,'devolver','Devolver tarjeta al Cliente',500,940,290);action(A,'cerrar','Invalidar autenticación y registrar fecha de fin; Sesion = Cerrada',500,1050,360);end(A,500,1160);
 chain(A,'inicio','cerrando','autenticada');edge(A,'autenticada','preguntar','autenticada',[],{distance:65,width:100});edge(A,'autenticada','devolucion','no autenticada',[[1040,225],[1040,840]],{width:135});
 edge(A,'preguntar','ticket');edge(A,'ticket','recuperar','deseaTicket',[[230,445]],{width:110});edge(A,'ticket','devolucion','no deseaTicket',[[790,445],[790,760],[500,760]],{width:130});
 edge(A,'recuperar','imprimir');edge(A,'imprimir','devolucion','',[[230,840]]);chain(A,'devolucion','devolver','cerrar','fin');
}
const target=path.resolve(__dirname,'../DiagramaDeActividad/ActividadSistema.mdj').replaceAll('\\','/');
const content=JSON.stringify(project,null,2)+'\n',lines=content.trimEnd().split('\n');
if(require.main===module){
 if(process.argv[2]==='--size')console.log(lines.length);
 else if(process.argv[2]==='--chunk'){
  const start=Number(process.argv[3]),size=Number(process.argv[4]||1000),part=lines.slice(start,start+size),more=start+size<lines.length;
  console.log('*** Begin Patch\n'+(start===0?'*** Add File: '+target:'*** Update File: '+target+'\n@@\n-__CODEX_APPEND__')+'\n'+[...part,...(more?['__CODEX_APPEND__']:[])].map(x=>'+'+x).join('\n')+'\n*** End Patch');
 }else console.log(content);
}
module.exports={project,activities};
