# Validación de los modelos corregidos

Fecha de revisión visual: 13 de noviembre de 2026.

Se ajustaron las vistas de los 12 proyectos `.mdj` con 28 diagramas para recuperar una presentación más compacta, inspirada en `TrabajoCorregido`. StarUML abrió los 12 proyectos y exportó los 28 diagramas a JPEG en `Vistas/`. Se inspeccionaron las 28 imágenes: contexto, Nivel 0, cinco desarrollos de Nivel 1, seis desarrollos de Nivel 2, clases, seis vistas de casos de uso y ocho secuencias.

Una comparación de los elementos semánticos con la versión previa guardada en Git confirmó que no cambiaron clases, atributos, operaciones, relaciones, mensajes ni flujos. Los ajustes se limitaron a las vistas; las notas extensas se trasladaron a la documentación de cada diagrama. Se conservaron los modelos corregidos, sin restaurar los errores de la carpeta original.

Se creó `output/pdf/Informe_errores_diagramas.pdf`, de 10 páginas A4, que identifica problemas en los originales, su ubicación, explicación y corrección. Se renderizaron e inspeccionaron las diez páginas, sin cortes de texto ni desbordamientos. El informe distingue errores comprobables, inconsistencias, aclaraciones de diseño y entregables pendientes; excluye D2/D3 y la referencia errónea a la sección 5.

Comprobaciones automáticas realizadas con `node herramientas/validar.cjs` desde esta carpeta:

- JSON válido, identificadores únicos y referencias resueltas en los 12 archivos.
- Ningún flujo de datos sin nombre.
- Ningún flujo directo entre terminadores y almacenes.
- Igualdad de los flujos externos de Contexto y Nivel 0, incluidos nombre, terminador y dirección.
- Balanceo de las cinco descomposiciones de Nivel 1 y las seis descomposiciones selectivas de Nivel 2.
- Ocho clases, atributos privados, tres herencias y multiplicidades en ambos extremos de cada asociación/composición.
- Clase Operacion abstracta y ejecutar() redefinido en sus tres especializaciones.
- Mensajes de llamada sincrónicos y mensajes de retorno reply; retornos entre participantes emparejados con sus llamadas.
- Coincidencia de los archivos generados con su generador.
- SHA-256 de los doce `.mdj` originales: sin cambios.

Estas comprobaciones verifican estructura y coherencia de los modelos; no sustituyen la evaluación del docente. Las decisiones de diseño y los supuestos de simulación están documentados en README.md y DiccionarioDeDatos.md.

En aquella revisión no se añadieron los diagramas de estados o actividad ni código de una aplicación, porque quedaron fuera del alcance acordado para esa corrección.

## Incorporación posterior: estados de Sesion

Por pedido posterior se agregó `DiagramaDeEstado/EstadoSesion.mdj` y la exportación `Vistas/Estados de Sesion.jpg`. StarUML abrió y exportó el archivo; se inspeccionó la imagen y se ajustó una etiqueta que se cruzaba con otra transición.

Se verificaron seis estados ordinarios, un pseudestado inicial, un estado final y once transiciones. Todos los estados son alcanzables; los identificadores y referencias son válidos. Las únicas transiciones sin disparador son la inicial y la de completitud hacia el nodo final. Las guardas del PIN admiten reintento con cero o un fallos previos y llevan a Cerrando con dos fallos previos, incrementando el contador por tercera vez. Los hashes de los doce archivos originales siguen coincidiendo.

El nuevo archivo es independiente y no modifica los diagramas que el usuario reorganizó en carpetas con el sufijo MeGusta. En ese momento, la actividad y la implementación continuaban pendientes. El informe PDF conserva la evaluación histórica de los originales.

## Incorporación posterior: actividad del sistema

Se agregó `DiagramaDeActividad/ActividadSistema.mdj` con seis actividades y seis diagramas: flujo general, autenticación, consulta, extracción, transferencia y cierre. Las cinco llamadas del general son `callBehavior` sincrónicas enlazadas a las actividades de detalle del mismo proyecto. StarUML abrió y exportó las seis vistas; se revisaron las imágenes y se corrigieron ajustes de texto y solapamientos de recorridos.

`herramientas/validar_actividad.cjs` verifica IDs y referencias, un inicio/final por actividad, alcanzabilidad de todos los nodos, posibilidad de llegar al final, guardas de decisiones, convergencias mediante merge y ausencia de bifurcaciones implícitas en acciones. Recorre el acceso rechazado, PIN correcto al primer/segundo/tercer intento, tres PIN fallidos, retorno al menú tras cada operación, débito rechazado sin dispensación, corrección de monto, cancelación de transferencia sin movimiento y cierre con o sin ticket. Los doce modelos originales conservan sus hashes.

Las actividades describen una sesión completa bajo los supuestos de simulación documentados en su README; no incluyen mantenimiento del equipo ni recuperación ante fallas mecánicas. La implementación en capas continúa pendiente.
