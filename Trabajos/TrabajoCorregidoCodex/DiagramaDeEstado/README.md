# Estados de la clase Sesion

Abrir `EstadoSesion.mdj` con StarUML y seleccionar **Sesion > Ciclo de vida de Sesion > Estados de Sesion**. La imagen está en `../Vistas/Estados de Sesion.jpg`.

Este archivo incorpora el punto 8 de la consigna. Es independiente de los demás proyectos StarUML; la clase Sesion incluida identifica el contexto de la máquina, no reemplaza el diagrama de clases completo.

## Estados y transiciones

| Origen | Evento o condición | Destino | Efecto |
|---|---|---|---|
| Inicial | Inicialización, sin evento | Iniciada | Al entrar: iniciar() |
| Iniciada | introducirTarjeta(datos) | Autenticando (tarjeta) | validarTarjeta(datos) |
| Autenticando (tarjeta) | tarjetaValida | Validando (PIN) | Comienza la captura y validación del PIN |
| Autenticando (tarjeta) | tarjetaInvalida | Cerrando | informarRechazo() |
| Validando (PIN) | pinValido | Operando | autenticar() |
| Validando (PIN) | pinInvalido [intentosPIN < 2] | Validando (PIN) | registrarIntentoFallido(); se solicita un nuevo PIN al reingresar |
| Validando (PIN) | pinInvalido [intentosPIN = 2] | Cerrando | registrarIntentoFallido(); es el tercer fallo |
| Operando | operacionFinalizada | Operando | mostrarResultado(); vuelve a mostrarse el menú |
| Operando | solicitarCierre(deseaTicket) | Cerrando | Recibe la preferencia del usuario para el ticket |
| Cerrando | cierreCompletado | Cerrada | cerrar() |
| Cerrada | Completitud, sin evento | Final | Termina el ciclo de esta sesión |

## Cómo leerlo

Las etiquetas usan **evento [guarda] / efecto**. `entry` indica una acción al entrar; `do` es la actividad que se realiza mientras el estado está activo. Los círculos inicial y final son símbolos UML, no dos estados adicionales llamados Iniciada y Cerrada.

- `iniciar()` establece `intentosPIN = 0`, `autenticada = false`, fecha de inicio y `deseaTicket = false`.
- `intentosPIN` cuenta fallos ya registrados. Las guardas se evalúan **antes** de incrementar: con 0 o 1 fallos se reintenta; con 2 fallos previos, el nuevo PIN inválido es el tercero y provoca cierre. El contador no se reinicia en el reintento.
- `solicitarYValidarPIN()` espera el PIN del Cliente, solicita su verificación a CentralDB y produce `pinValido` o `pinInvalido`. En este diagrama de estados esa interacción se resume como actividad; su detalle pertenece a la secuencia de autenticación.
- `atenderOperaciones()` permite seleccionar Consulta, Extracción o Transferencia y ejecutarla. Al finalizar una operación se comunica su resultado y la sesión permanece disponible para otra operación.
- `completarCierre(deseaTicket)` imprime el ticket cuando se solicitó y corresponde, y devuelve la tarjeta. **Solo después** produce `cierreCompletado`. En rechazos de tarjeta o agotamiento de PIN, `deseaTicket` permanece en false.
- `cerrar()` registra la fecha de fin e invalida la autenticación. Una nueva tarjeta inicia una nueva sesión, no reactiva esta instancia Cerrada.
- Se conserva el criterio previo de devolver la tarjeta al tercer PIN inválido. No se modela una retención o bloqueo bancario permanente no solicitado.

Los nombres de actividades representan responsabilidades de diseño; este archivo no implementa métodos ni añade código de la aplicación. No se agregaron cancelaciones, tiempos de espera o fallas de dispositivos, que no están definidos en la consigna.

El generador independiente `../herramientas/generar_estado.cjs` produce únicamente este modelo. La exportación JPEG se verificó en StarUML; se comprobaron referencias, seis estados, once transiciones, alcanzabilidad y el cierre al tercer fallo.
