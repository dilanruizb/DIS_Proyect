const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const {project,activities}=require('./generar_actividad.cjs');
const root=path.resolve(__dirname,'..');
const saved=JSON.parse(fs.readFileSync(path.join(root,'DiagramaDeActividad/ActividadSistema.mdj'),'utf8'));
assert.deepStrictEqual(saved,project,'El archivo no coincide con el generador');
function all(x,a=[]){if(!x||typeof x!=='object')return a;if(x._type)a.push(x);Object.values(x).forEach(v=>all(v,a));return a}
const elements=all(saved),ids=new Map(elements.map(x=>[x._id,x]));assert.equal(ids.size,elements.length);
function refs(x){if(!x||typeof x!=='object')return;if(x.$ref)assert(ids.has(x.$ref),'Referencia rota');Object.values(x).forEach(refs)}refs(saved);
assert.equal(elements.filter(x=>x._type==='UMLActivityDiagram').length,6);
for(const A of Object.values(activities)){
 const a=ids.get(A.a._id),nodes=new Map(a.nodes.map(n=>[n._id,n]));
 const initial=a.nodes.filter(n=>n._type==='UMLInitialNode'),final=a.nodes.filter(n=>n._type==='UMLActivityFinalNode');assert.equal(initial.length,1);assert.equal(final.length,1);
 for(const e of a.edges)assert(nodes.has(e.source.$ref)&&nodes.has(e.target.$ref));
 for(const n of a.nodes){const inc=a.edges.filter(e=>e.target.$ref===n._id),out=a.edges.filter(e=>e.source.$ref===n._id);
  if(n._type==='UMLInitialNode'){assert.equal(inc.length,0);assert.equal(out.length,1)}
  else if(n._type==='UMLActivityFinalNode'){assert.equal(out.length,0);assert(inc.length>0)}
  else if(n._type==='UMLDecisionNode'){assert.equal(inc.length,1);assert(out.length>=2);assert(out.every(e=>e.guard));assert.equal(new Set(out.map(e=>e.guard)).size,out.length)}
  else if(n._type==='UMLMergeNode'){assert(inc.length>=2);assert.equal(out.length,1)}
  else{assert.equal(inc.length,1);assert.equal(out.length,1)}
 }
 function reach(from,reverse=false){const found=new Set([from]);for(let i=0;i<a.nodes.length;i++)for(const e of a.edges){let s=reverse?e.target.$ref:e.source.$ref,t=reverse?e.source.$ref:e.target.$ref;if(found.has(s))found.add(t)}return found}
 assert.equal(reach(initial[0]._id).size,nodes.size,'Nodo inaccesible');assert.equal(reach(final[0]._id,true).size,nodes.size,'Nodo sin camino al final');
}
const calls=elements.filter(x=>x._type==='UMLAction'&&x.kind==='callBehavior');assert.equal(calls.length,5);assert(calls.every(c=>c.isSynchronous&&ids.get(c.target.$ref)._type==='UMLActivity'));
function run(key,choices={},onNode=()=>{}){
 const A=activities[key],a=ids.get(A.a._id),keyOf=new Map(Object.entries(A.n).map(([k,v])=>[v.m._id,k]));
 let at=A.n.inicio.m._id,trace=[];
 for(let step=0;step<250;step++){
  const k=keyOf.get(at);trace.push(k);onNode(k);
  if(k==='fin')return trace;
  let next=a.edges.filter(e=>e.source.$ref===at);
  if(next.length>1){let choice=typeof choices[k]==='function'?choices[k]():choices[k];next=next.filter(e=>e.guard===choice)}
  assert.equal(next.length,1,'Decisión ambigua o sin ruta: '+key+'/'+k);at=next[0].target.$ref;
 }throw Error('Recorrido no termina: '+key);
}
// Escenarios sobre el grafo real, no sobre un flujo alternativo escrito aparte.
assert(!run('auth',{tarjetaValida:'inválida'}).includes('pedirPIN'));
for(const outcomes of [[true],[false,true],[false,false,true],[false,false,false]]){
 let fails=0,pin=0;const trace=run('auth',{tarjetaValida:'válida',PINvalido:()=>outcomes[pin++]?'PIN correcto':'PIN incorrecto',limiteIntentos:()=>fails<3?'intentosPIN < 3':'intentosPIN = 3'},k=>{if(k==='iniciar')fails=0;if(k==='sumarFallo')fails++});
 assert.equal(trace.filter(k=>k==='iniciar').length,1);assert.equal(pin,outcomes.length);assert.equal(fails,outcomes.filter(x=>!x).length);assert.equal(trace.includes('agotar'),fails===3);
}
for(const op of ['Consulta','Extracción','Transferencia']){let choices=0;const trace=run('general',{acceso:'autenticada',opcion:()=>choices++===0?op:'Finalizar'});assert.equal(trace.filter(k=>k==='menu').length,2);assert(trace.includes('cierre'))}
const rejected=run('general',{acceso:'no autenticada'});assert(!rejected.includes('menu'));assert(rejected.includes('cierre'));
for(const ok of [true,false]){const trace=run('extraccion',{montoValido:'numérico y > 0',autorizacion:ok?'débito confirmado':'rechazo / error'});assert.equal(trace.includes('efectivo'),ok);assert(trace.includes('registrar'))}
let attempt=0;assert.equal(run('extraccion',{montoValido:()=>attempt++===0?'inválido':'numérico y > 0',autorizacion:'rechazo / error'}).filter(k=>k==='monto').length,2);
const canceled=run('transferencia',{datosValidos:'CBU: 22 dígitos; monto numérico > 0',confirmada:'no confirmada'});assert(!canceled.includes('transferir'));assert(!canceled.includes('registrar'));
for(const ok of [true,false]){const trace=run('transferencia',{datosValidos:'CBU: 22 dígitos; monto numérico > 0',confirmada:'confirmada',exito:ok?'éxito':'rechazo / error'});assert.equal(trace.includes('comprobante'),ok);assert(trace.includes('registrar'));}
for(const authenticated of [true,false])for(const ticket of [true,false]){const trace=run('cierre',{autenticada:authenticated?'autenticada':'no autenticada',ticket:ticket?'deseaTicket':'no deseaTicket'});assert.equal(trace.includes('imprimir'),authenticated&&ticket);assert(trace.indexOf('devolver')<trace.indexOf('cerrar'));assert.equal(trace.filter(k=>k==='devolver').length,1)}
const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,'originales.sha256.json'),'utf8'));for(const [f,h]of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'../TrabajoCorregido',f))).digest('hex'),h);
console.log('OK: seis actividades, referencias y conectividad, decisiones/merges, llamadas enlazadas, PIN, menú, rechazo de débito, cancelación de transferencia, cierre y originales intactos.');
