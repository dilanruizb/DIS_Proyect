# Diagrama de actividad del sistema Cajero Automático

Abrir **ActividadSistema.mdj** en StarUML. En Model Explorer, desplegar **Sistema Cajero Automático**, elegir una actividad y abrir su diagrama. Los seis diagramas están en un único proyecto para mantener las llamadas enlazadas.

## Organización

| Diagrama | Contenido |
|---|---|
| 01 - Operar Cajero | Autenticación, menú, selección de las tres operaciones, regreso al menú y cierre de sesión. |
| 02 - Autenticar Usuario | Inicialización, tarjeta/Sucursal, PIN/Red Central, contador, reintentos y resultado de acceso. |
| 03 - Consultar Saldo | Respuesta de Central, saldos o rechazo y registro de la consulta. |
| 04 - Extraer Efectivo | Monto válido, autorización y débito central, entrega condicionada, saldo restante y registro. |
| 05 - Realizar Transferencia | CBU y monto, confirmación o cancelación, transferencia atómica, comprobante o rechazo y registro. |
| 06 - Cerrar Sesion | Ticket opcional, lectura de D1, devolución de tarjeta y cierre efectivo. |

Las imágenes correspondientes se encuentran en `../Vistas/`, con nombres que comienzan por `Actividad 01` a `Actividad 06`.

## Cómo se conectan

El diagrama 01 contiene cinco acciones UML de tipo **callBehavior**, sincrónicas y con referencias reales a las actividades 02-06. El pequeño símbolo dentro de esas acciones indica que existe un detalle. Al terminar la actividad llamada se regresa a la continuación del flujo 01; el nodo final de una subactividad no apaga el cajero ni cierra automáticamente la sesión.

El modelo describe el ciclo completo de una sesión de usuario. Después del final del flujo general, el sistema puede atender una nueva sesión. No representa el encendido, mantenimiento o reposición de efectivo del equipo.

## Decisiones y alternativas

- **Tarjeta inválida:** informar el rechazo, retornar `autenticada = false` y ejecutar el cierre para devolver la tarjeta.
- **PIN inválido:** incrementar `intentosPIN` y luego evaluar. Con menos de tres fallos, volver a pedir PIN; con tres, informar el agotamiento y cerrar. El contador se inicializa una sola vez, fuera del bucle.
- **PIN correcto:** autenticar y vincular la cuenta. El menú permite Consulta, Extracción, Transferencia o Finalizar; las opciones se ofrecen como selección limitada a esos cuatro valores.
- **Una operación finalizada:** mostrar su resultado, registrar cuando corresponde y volver al menú sin volver a introducir tarjeta o PIN.
- **Monto o CBU con formato inválido:** pedir que se corrijan antes de enviar una operación bancaria. El CBU tiene 22 dígitos y el monto debe ser numérico y mayor que cero, según el diccionario existente.
- **Débito rechazado:** no dispensar efectivo. Central es la autoridad que comprueba fondos y límite, y confirma o rechaza la operación.
- **Transferencia no confirmada:** cancelar y regresar al menú sin débito ni crédito. No se registra como operación bancaria procesada; el registro de auditoría de cancelaciones no forma parte de este modelo.
- **Transferencia confirmada:** solicitar a Central la operación atómica, con destino y monto. No hacer un débito local por adelantado.
- **Cierre:** solo una sesión autenticada puede solicitar ticket. Con o sin ticket se devuelve la tarjeta y después se invalida la sesión y se registra la fecha de fin. Un ticket puede corresponder a una sesión sin operaciones.

Las guardas entre corchetes indican las condiciones de las salidas de decisiones. Los rombos con varias entradas y una salida son **merge**: reúnen alternativas, no esperan ramas paralelas. No se utilizaron barras de sincronización porque este flujo no contiene ejecución paralela.

## Coherencia y alcance

Este conjunto desarrolla el punto 9 y es coherente con el ciclo de Sesion del punto 8. En el diagrama de estados el contador se compara antes del efecto de incremento; aquí se dibuja una acción de incremento previa a la decisión. Ambos cierran al tercer PIN fallido.

Se mantiene la simulación acordada: tres fallos de PIN devuelven la tarjeta; no se inventa retención física o bloqueo bancario permanente. La impresión y el dispensador se suponen operativos. Compensaciones por fallas mecánicas, cortes de red con resultado bancario incierto y tiempos de espera requieren requisitos adicionales y no están modelados. `rechazo / error` representa una respuesta terminal de la simulación, no un resultado bancario desconocido.

El registro en Sesion y D1 conserva operaciones procesadas y su resultado EXITOSA/RECHAZADA; nunca guarda el PIN. Las validaciones locales que solo piden corregir datos no se registran como operaciones ejecutadas.

## Verificación

StarUML abrió el proyecto y exportó los seis diagramas. Se revisaron sus imágenes. Desde la raíz del proyecto, ejecutar:

```powershell
node Trabajos/TrabajoCorregidoCodex/herramientas/validar_actividad.cjs
```

La validación comprueba referencias, conectividad, decisiones/merge y llamadas a actividades. Recorre escenarios de PIN, selección de operaciones, rechazo de débito, cancelación de transferencia y cierre con/sin ticket. También comprueba los hashes de los doce archivos originales. El generador independiente es `../herramientas/generar_actividad.cjs`; no modifica los otros modelos.
