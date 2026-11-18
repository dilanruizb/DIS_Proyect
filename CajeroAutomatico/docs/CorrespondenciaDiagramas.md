# Del diagrama al código: Cajero Automático

Este documento explica cómo se implementan en el simulador de consola los diagramas de `Trabajos/TrabajoCorregido`. Los nombres de métodos y clases permiten localizar cada parte del recorrido en la solución.

## Cómo se conectan los cinco proyectos

| Proyecto | Responsabilidad | Ejemplo |
|---|---|---|
| `Cajero.View` | Presentación y arranque. | `Program` crea las dependencias. `PantallaCajero` recibe datos, oculta el PIN, muestra el menú y emite el ticket. |
| `Cajero.Controller` | Recibe las solicitudes de la pantalla y coordina sus llamadas. | `CajeroController.IngresarTarjeta` inicia la sesión y solicita la validación a la sucursal. |
| `Cajero.Application` | Coordina el caso de uso y controla el estado de sesión. | `ServicioCajero` permite operar solo con una sesión autenticada en estado `Operando`. |
| `Cajero.Domain` | Entidades, reglas y contratos entre capas. | `Cuenta` valida fondos y modifica saldos. `Operacion` define `ejecutar()`. |
| `Cajero.Data` | Persistencia y simulación de los sistemas externos. | `SucursalDB`, `CentralDB`, `RepositorioSesiones` y `CajeroDbContext` usan SQLite. |

Por ejemplo, al elegir **Consultar saldo**, la solicitud pasa de `PantallaCajero` a `CajeroController` y de ahí a `ServicioCajero`. El servicio comprueba la sesión, pide a `CentralDB` la cuenta asociada, ejecuta una `Consulta` y guarda su registro. La pantalla muestra el resultado.

## Contexto y DFD

| Elemento | Representación en el programa |
|---|---|
| **Cliente** | Persona que selecciona una tarjeta de prueba, ingresa el PIN si la tarjeta es válida, elige una operación y decide si quiere un ticket. Recibe mensajes y resultados por consola. |
| **Sucursal** | `SucursalDB.validarTarjeta` busca la tarjeta por número y devuelve si está vigente, vencida, bloqueada o ausente. |
| **Red Central** | `CentralDB` verifica el PIN, consulta la cuenta, tramita el débito y procesa la transferencia. |
| **D1 — Log de operaciones** | Tabla `Operaciones` de SQLite. `RepositorioSesiones.ObtenerOperaciones` recupera los registros por identificador de sesión para el ticket. |

Los 21 flujos externos se conservan entre Contexto y Nivel 0 por nombre, terminador y dirección. Los DFD de niveles inferiores desglosan esas operaciones. Por ejemplo, en transferencia se reciben CBU y monto, se muestra el resumen, se recibe la confirmación, se ordena el movimiento y se devuelve un comprobante. En el código, la pantalla realiza los primeros pasos y `CentralDB.transferir` procesa la orden. Sucursal y Red Central son servicios simulados que comparten el mismo archivo SQLite. D2 y D3 quedan fuera del alcance acordado.

## Casos de uso y secuencias

| Caso de uso | Secuencia en el código |
|---|---|
| **Autenticar usuario** | `PantallaCajero.SeleccionarTarjeta` convierte la opción elegida en el número interno y la pantalla se lo pasa a `IngresarTarjeta`. Si `SucursalDB` acepta la tarjeta, la pantalla pide el PIN. `ServicioCajero.ValidarPIN` consulta a `CentralDB`, que compara el PIN con la credencial almacenada. Al acertar se abre el menú. |
| **Consultar saldo** | `ServicioCajero.ConsultarSaldo` obtiene la cuenta. `Consulta.ejecutar()` copia el saldo total y el disponible. El servicio registra y guarda la consulta, y la pantalla muestra ambos importes. Un saldo de cero es una consulta válida. |
| **Extraer efectivo** | `CentralDB.debitar` comprueba el límite diario y los fondos. `Extraccion.ejecutar()` llama a `Cuenta.debitar`. El saldo y la operación se guardan juntos. Después de confirmar el guardado, `dispensarEfectivo` muestra el mensaje de entrega. |
| **Realizar transferencia** | `PantallaCajero` valida el formato del CBU y pide confirmación. `CentralDB.transferir` busca la cuenta por CBU y controla el límite. `Transferencia.ejecutar()` realiza el movimiento y genera el comprobante. Se guardan el débito, el crédito y la operación en una transacción. La pantalla muestra el comprobante y el saldo restante. |
| **Emitir ticket y devolver tarjeta** | La opción de finalizar lleva la sesión a `Cerrando`. Si el usuario solicita el ticket, se leen sus operaciones y se imprime el detalle de cada una. La pantalla simula la devolución y el servicio completa el cierre. |

La autenticación que se incluye como requisito de las operaciones se satisface con la sesión vigente. El PIN se pide al inicio de esa sesión. El cierre se solicita desde el menú y el ticket depende de la elección del usuario. Los mensajes de secuencia se representan mediante llamadas a métodos y sus valores de retorno. El código agrega un controlador y un servicio entre la pantalla y los sistemas simulados.

## Diagrama de clases

| Clase | Cómo aparece en el código |
|---|---|
| `Cliente` | Guarda la identidad. Sus métodos solicitan la selección de operación, la lectura del PIN y el cierre a través de `IInteraccionCajero`. |
| `Tarjeta` | Guarda número, vencimiento, bloqueo y emisor. `validar()` comprueba que esté vigente y habilitada. |
| `Cuenta` | Guarda número, CBU, saldos y límite. Contiene las reglas para consultar, validar fondos, debitar, acreditar y mover dinero entre cuentas. |
| `Sesion` | Guarda fechas, estado, autenticación, intentos y operaciones. Sus métodos inicializan, autentican y cierran la sesión. |
| `Operacion` | Clase abstracta con datos comunes. `registrar()` vincula la operación con la sesión y `obtenerDetalle()` prepara el detalle para el ticket. |
| `Consulta` | Guarda los saldos consultados y sabe cómo mostrarlos. |
| `Extraccion` | Guarda monto y saldo restante, comprueba fondos y simula la entrega. |
| `Transferencia` | Guarda monto, CBU destino y comprobante. Valida el destino y usa las reglas de `Cuenta` para mover los fondos. |

Las tres operaciones concretas heredan de `Operacion` y redefinen `ejecutar()`. Las entidades usan campos privados, propiedades públicas y constructores. Las claves foráneas de SQLite representan las relaciones entre cliente, tarjeta, cuenta, sesión y operación. Una sesión mantiene una colección de operaciones y cada registro de operación requiere su sesión. EF Core guarda los tres tipos en la tabla `Operaciones` y usa la columna `TipoOperacion` para distinguirlos. El borrado de una sesión con operaciones está restringido para preservar el historial.

La firma de `Cuenta.transferir` recibe el objeto `Cuenta` de destino. La búsqueda por CBU pertenece a `CentralDB`. Los métodos de interacción reciben `IInteraccionCajero`, que implementa la pantalla. Esas diferencias permiten ubicar la búsqueda en la capa de datos y mantener la interacción en la presentación. Véase también [CorrespondenciaClases.md](CorrespondenciaClases.md).

## Estados y actividad

| Transición | Evento y respuesta en el programa |
|---|---|
| Inicio → `Iniciada` | `Sesion.iniciar()` pone el contador en cero y la autenticación en falso. |
| `Iniciada` → `Autenticando` | El controlador recibe el número y solicita a la sucursal la validación. |
| `Autenticando` → `Validando` | Al aceptar la tarjeta, el servicio la vincula con la sesión y se pide el PIN. |
| `Autenticando` → `Cerrando` | Si se rechaza la tarjeta, se muestra el motivo y se pasa a la devolución. |
| `Validando` → `Validando` | El primer y segundo PIN incorrectos incrementan el contador y permiten reintentar. |
| `Validando` → `Operando` | Un PIN correcto autentica la sesión y habilita el menú. |
| `Validando` → `Cerrando` | El tercer PIN incorrecto o la cancelación con Escape inician el cierre. |
| `Operando` → `Operando` | Al terminar una operación, el programa muestra el resultado y vuelve al menú. |
| `Operando` → `Cerrando` | El cliente elige finalizar. |
| `Cerrando` → `Cerrada` | Tras el ticket opcional y la devolución simulada, se registra la fecha de fin y se invalida la autenticación. |

Los bucles de `PantallaCajero.Ejecutar()` representan el reintento del PIN y el regreso al menú. Los condicionales representan las decisiones del diagrama de actividad, como tarjeta válida, PIN correcto, fondos disponibles y transferencia confirmada. Si la tarjeta se rechaza antes de vincularla, la sesión completa el cierre en memoria.

## Diferencias y alcance de la simulación

- Elegir «Tarjeta 1», «Tarjeta 2» o «Tarjeta 3» simula introducir la tarjeta en el cajero. La devolución, la entrega de efectivo y la emisión del ticket se muestran por consola.
- La pantalla obtiene el número interno a partir de la selección y `SucursalDB` busca la tarjeta en SQLite. Así se simula la lectura de los datos de la tarjeta que muestra el diagrama de secuencia.
- D1 guarda las operaciones exitosas y los rechazos de débitos que pueden vincularse con la cuenta de origen. Si una consulta falla porque falta la cuenta, se muestra el error y esa consulta no se registra. Una transferencia cancelada antes de confirmarla no llega a la capa de datos.
- El límite diario se comparte entre extracciones y transferencias exitosas de la cuenta de origen. Las consultas, las operaciones rechazadas y los créditos recibidos quedan fuera de esa suma.
