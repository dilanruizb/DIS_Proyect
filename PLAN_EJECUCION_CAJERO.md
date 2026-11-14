# Plan de ejecución del Cajero Automático

Fecha: 13 de noviembre de 2026. Estado: solución base creada con cinco proyectos y dependencias de Entity Framework Core y SQLite; funcionalidades y base de datos pendientes de implementar.

La referencia funcional y de diseño será exclusivamente la versión actual de `Trabajos/TrabajoCorregido`. Se revisaron sus clases, contexto, DFD Nivel 0, casos de uso, secuencias, estados y actividades. Esa carpeta ahora contiene las clases corregidas y las actividades de las tres operaciones; no se utilizarán como referencia las versiones anteriores del chat.

**1. Alcance propuesto y diferencia con la consigna**

Construir una aplicación C# de consola, organizada en cinco proyectos siguiendo la estructura solicitada: Application, Controller, Data, Domain y View. Utilizar SQLite y tres tarjetas de demostración: vigente con saldo, vigente sin saldo y vencida. La consola representará la pantalla, lectura de tarjeta, entrega de efectivo y ticket mediante entradas y salidas de texto.

`Cajero.View` será el proyecto de presentación y el ejecutable de consola. Contendrá el punto de entrada, PantallaCajero y la interacción con el usuario.

Se propone implementar **Consulta, Extraccion y Transferencia**, aunque el enunciado admite una sola operación visible. Los diagramas elegidos describen las tres y el código debe contener las tres clases concretas con `override de ejecutar()`. La extracción será el primer recorrido completo que se implemente para demostrar la diferencia entre una cuenta con saldo y una sin saldo.

La consola **no cumple literalmente** el requisito de un formulario `FormCajero`. La propuesta respeta la preferencia del alumno; queda pendiente que la cátedra acepte esa sustitución. Si exige el formulario, se adaptará el proyecto de presentación a WinForms, reutilizando Domain, Data, Application y Controller. Renombrar una clase de consola como FormCajero no resolvería esa diferencia.

**2. Tecnología y ubicación**

- C# y .NET 10, cuyo SDK ya está instalado en este equipo. Se propone por ser una versión LTS; la compatibilidad del equipo de evaluación debe confirmarse antes de entregar. [Política oficial de soporte](https://dotnet.microsoft.com/en-us/platform/support/policy).
- SQLite, almacenada en `datos/cajero.db`, para disponer de una base persistente local sin instalar un servidor.
- Acceso mediante **Entity Framework Core 10.0.15**, con `Microsoft.EntityFrameworkCore.Sqlite` en Data. Usar `Microsoft.EntityFrameworkCore.Design` y la herramienta local `dotnet-ef` de la misma versión para migraciones. [Proveedor oficial de EF Core para SQLite](https://learn.microsoft.com/en-us/ef/core/providers/sqlite/).
- Respuestas deterministas basadas en los datos. No se utilizará azar para decidir si el PIN es correcto, si una tarjeta venció o si hay fondos.
- Crear una carpeta nueva `CajeroAutomatico/` en la raíz del proyecto. Los diagramas de `Trabajos/TrabajoCorregido` permanecerán como referencia, sin ser regenerados.

Estructura prevista:

```text
CajeroAutomatico/
  CajeroAutomatico.sln
  global.json                # SDK .NET 10
  dotnet-tools.json          # herramienta local dotnet-ef
  src/
    Cajero.Application/
    Cajero.Controller/
    Cajero.Data/             # DbContext, configuraciones y migraciones
    Cajero.Domain/
    Cajero.View/              # proyecto de inicio; aplicación de consola
  tests/
    Cajero.Pruebas/           # proyecto auxiliar fuera de la solución principal
  datos/
    cajero.db                 # generado al ejecutar; fuera de Git
  docs/
    CORRESPONDENCIA_DIAGRAMAS.md
  README.md
```

La solución principal mostrará cinco proyectos, como en la imagen. El proyecto auxiliar de pruebas referenciará los proyectos necesarios y se ejecutará por su ruta, sin añadirse a esa solución principal.

| Proyecto | Tipo previsto | Responsabilidad |
|---|---|---|
| Cajero.Application | Biblioteca de clases | Casos de aplicación, ServicioCajero, autenticación, coordinación de operaciones, cierre y resultados para la presentación. |
| Cajero.Controller | Biblioteca de clases | CajeroController: recibir solicitudes de la presentación y delegarlas en Application. No contiene SQL ni duplica reglas bancarias. |
| Cajero.Data | Biblioteca de clases | SQLite, SucursalDB, CentralDB, repositorios, carga inicial y transacciones. |
| Cajero.Domain | Biblioteca de clases | Las ocho clases UML, estados, reglas propias de las entidades y contratos que necesitan para acceder a servicios externos o persistencia. |
| Cajero.View | Ejecutable de consola | Program, PantallaCajero, menú, entrada de tarjeta/PIN y salida de resultados y tickets. Configura las dependencias al iniciar. |

Correspondencia con la consigna: **Datos = Data; Lógica = Domain + Application; Presentación = View + Controller**. Los cinco proyectos distribuyen las responsabilidades de las tres capas solicitadas.

**3. Correspondencia que debe conservarse**

| Elemento de los diagramas | Implementación prevista |
|---|---|
| PantallaCajero | Clase en Cajero.View que recibe tarjeta, PIN y opciones, muestra resultados en consola e invoca CajeroController. |
| Sucursal / SucursalDB | Implementación en Cajero.Data: tarjeta, vencimiento, bloqueo y cuenta vinculada. |
| Red Central / CentralDB | Implementación en Cajero.Data: PIN, saldo, débito y transferencia. |
| D1 Log de operaciones | Tabla Operaciones, consultable por sesión para el ticket. |
| Cliente, Tarjeta, Cuenta, Sesion | Clases en Cajero.Domain con atributos y asociaciones del diagrama de clases. |
| Operacion | Clase abstracta en Cajero.Domain con `public abstract bool ejecutar()`. |
| Consulta, Extraccion, Transferencia | Clases en Cajero.Domain; heredan de Operacion y redefinen `ejecutar()`. |
| Sesion compone operaciones | Colección de operaciones de esa sesión en memoria; historial persistente independiente en D1. |
| include de autenticación | Toda operación exige sesión autenticada; la sesión válida se reutiliza sin pedir nuevamente el PIN. |
| extend del cierre | Se cierra cuando lo solicita el usuario; el ticket es opcional y la devolución de tarjeta obligatoria. |

Las propiedades y constructores requeridos por la consigna se agregarán aunque no estén dibujados como miembros separados. Los campos serán privados con `_`, por ejemplo `_saldoDisponible`, y las propiedades públicas, por ejemplo `SaldoDisponible { get; set; }`, con validación cuando corresponda. Se conservarán nombres de clases y firmas de métodos representadas, incluido `ejecutar()` en minúscula para facilitar la comparación.

Los ocho tipos de dominio no limitan la posibilidad de agregar clases auxiliares de conexión, resultados, repositorios o coordinación. Cada auxiliar se justificará en el documento de correspondencia.

**4. Primera fase: solución y contratos entre capas**

Crear la solución con los cinco proyectos de producción. Primero definir los contratos de Domain; después implementar sus adaptadores en Data y los casos de aplicación. Usar dependencias por constructor y estas referencias de proyecto:

| Proyecto | Referencias permitidas |
|---|---|
| Domain | Ninguna a los otros cuatro proyectos. |
| Application | Domain. |
| Data | Domain. |
| Controller | Application. |
| View | Controller para las solicitudes; Application, Data y Domain para configurar dependencias en Program e implementar los contratos de interacción. |

Domain definirá los contratos de acceso bancario, repositorios y unidad de trabajo que necesitan sus clases y Application. Data implementará esos contratos con SQLite. Los resultados bancarios compartidos se definirán junto a los contratos en Domain; los DTO de solicitudes y respuestas de Controller estarán en Application. Así, ni Domain ni Application deberán referenciar Data y no habrá dependencias circulares.

Recorrido habitual de una solicitud: **PantallaCajero (View) -> CajeroController -> ServicioCajero (Application) -> clases/contratos de Domain -> implementaciones de Data**. Las referencias de View usadas al configurar dependencias no autorizan a PantallaCajero a consultar la base directamente.

- **Data:** concentra CajeroDbContext, configuración de entidades con Fluent API, migraciones, carga inicial, persistencia, transacciones, SucursalDB y CentralDB. No escribe en consola. Domain no depende de EF Core.
- **Domain:** conserva las ocho clases y sus reglas: vencimiento, fondos, estados y comportamiento polimórfico de ejecutar(). Las llamadas a servicios externos o al registro usan los contratos inyectados.
- **Application:** coordina autenticación, sesión, ejecución de operaciones, transacciones y cierre mediante ServicioCajero. No repite el SQL de Data ni la lógica propia de las entidades.
- **Controller:** expone las acciones que necesita la presentación, adapta las solicitudes y entrega resultados de Application. Será una clase ordinaria invocada por View.
- **View:** contiene la interfaz de consola: lectura, menú, PIN oculto y representación de ticket/efectivo/tarjeta devuelta. No modifica saldos directamente.

Hay métodos de los diagramas con intención de interacción, como `Cliente.ingresarPIN()` y `Consulta.mostrarSaldo()`. Se conservarán y delegarán esa interacción en un contrato pequeño `IInteraccionCajero`, definido en Domain e implementado por View. Esto conserva las firmas del modelo sin agregar referencias de Domain a View ni llamadas directas a `Console.ReadLine` o `Console.WriteLine` dentro de las entidades. Esa adaptación se documentará por separado del recorrido de solicitudes al Controller.

Resultado de esta fase: la solución compila, las responsabilidades están definidas y se puede cambiar la presentación sin reescribir el modelo.

**5. Segunda fase: esquema de datos y tres tarjetas**

Crear estas tablas y sus claves:

Definir primero las entidades de Domain y su configuración en Data. Crear el esquema mediante migraciones de EF Core, versionadas en `Cajero.Data/Migrations`. No combinar `EnsureCreated()` con migraciones. La carga de datos de prueba utilizará EF Core y será independiente de la definición del esquema. Todavía no se genera una migración inicial porque faltan las entidades y el DbContext.

| Tabla | Información principal |
|---|---|
| Clientes | Id, nombre y apellido. |
| Cuentas | Número único, CBU único, saldo total, saldo disponible y límite diario. |
| Tarjetas | Número único, vencimiento, bloqueo, entidad emisora, cliente y cuenta asociados. |
| Credenciales | Tarjeta y verificador del PIN; sin guardar el PIN en logs ni tickets. |
| Sesiones | Id, cliente/tarjeta asociados, fechas, estado, autenticación e intentos fallidos. |
| Operaciones | Id, sesión, cuenta origen, tipo, estado, fecha, monto cuando corresponda, destino/comprobante y detalle del resultado. |

Una tarjeta pertenece a un cliente y accede a una cuenta; no se impondrá una restricción de una sola tarjeta por cuenta, porque el diagrama permite varias. Una sesión tiene cero o más operaciones. Para este demo, las tres tarjetas utilizarán tres cuentas diferentes.

En C# se utilizará `decimal`. En SQLite se propone guardar importes en **centavos enteros**, con conversión controlada en Datos, máximo dos decimales y límites explícitos de importe. Así se evita convertir dinero a `double` o `REAL`. SQLite tiene tipos primitivos limitados y Microsoft advierte que `REAL` pierde precisión para `decimal`. [Tipos de datos del proveedor](https://learn.microsoft.com/en-us/dotnet/standard/data/sqlite/types).

Datos ficticios iniciales propuestos; los importes pueden ajustarse antes de implementar:

| Tarjeta | Número de prueba | PIN de demo | Saldo inicial | Vencimiento | Resultado esperado |
|---|---|---|---:|---|---|
| Con saldo | 1000000000000001 | 1111 | $100.000,00 | Fecha de creación + 2 años | Autentica, consulta y permite débitos dentro del saldo/límite. |
| Sin saldo | 1000000000000002 | 2222 | $0,00 | Fecha de creación + 2 años | Autentica y consulta cero; rechaza débitos por falta de fondos. |
| Vencida | 1000000000000003 | 3333 | $50.000,00 | Fecha de creación - 1 año | Se rechaza antes de solicitar PIN. |

El PIN se documentará como dato ficticio de prueba; en Credenciales se guardará un verificador con sal. Los números de tarjeta son identificadores del simulador, sin afirmar que sean tarjetas bancarias reales.

Generar un CBU de 22 dígitos distinto para cada cuenta. La segunda cuenta servirá como destino de una transferencia exitosa desde la primera, sin añadir una cuarta tarjeta. Después de recibirla ya no tendrá saldo cero: eso es parte del comportamiento persistente esperado.

La carga inicial será idempotente: se ejecuta al crear la base, no restablece saldos cada vez que se abre el programa. Ofrecer un comando explícito de reinicio del demo con confirmación, separado del uso normal. Las fechas de vencimiento se persistirán y no se recalcularán en cada inicio.

**6. Tercera fase: Cajero.Data, SucursalDB, CentralDB y persistencia**

Implementar en Cajero.Data los contratos definidos en Cajero.Domain, conforme a las secuencias:

- `SucursalDB.validarTarjeta(numero, vencimiento, entidadEmisora)`: devolver estado y cuenta vinculada. Incorporar una consulta por número para simular que el lector obtiene los datos de tarjeta desde la base; el usuario no tendrá que escribir el vencimiento.
- `CentralDB.validarPIN(numero, pin)`: comprobar el PIN de esa tarjeta vigente.
- `CentralDB.consultarSaldo(numeroCuenta)`: devolver saldo disponible y total.
- `CentralDB.debitar(numeroCuenta, monto)`: comprobar fondos/límite y realizar un único débito.
- `CentralDB.transferir(numeroCuenta, cbuDestino, monto)`: validar destino, fondos y límite; debitar origen y acreditar destino dentro de la misma transacción.
- Repositorios de sesiones y operaciones para guardar estados, intentos e historial y obtener el ticket de una sesión.

SucursalDB y CentralDB simularán dos sistemas externos mediante clases separadas, aunque usen un mismo archivo SQLite para el demo. La ubicación física de sus tablas no las convierte en almacenes internos adicionales del DFD: se mantiene la frontera lógica y D1 sigue siendo el registro de operaciones del cajero.

El débito/crédito y el registro persistente de una operación exitosa se coordinarán en una transacción compartida, administrada por Datos mediante EF Core. Los adaptadores participantes utilizarán el mismo CajeroDbContext durante esa operación; la unidad de trabajo encapsulará ese contexto y su transacción. `Operacion.registrar()` no repetirá el movimiento de dinero ni creará un segundo registro. Un rechazo se registra sin modificar saldos. Una cancelación de transferencia previa al envío no constituye una operación bancaria ejecutada.

Resultado de esta fase: se pueden consultar tarjetas, validar PIN y modificar cuentas mediante los servicios, con persistencia y reversión ante fallos.

**7. Cuarta fase: Cajero.Domain, Cajero.Application y autenticación completa**

Implementar en Cajero.Domain atributos, propiedades, constructores y métodos de las ocho clases, respetando asociaciones, herencias y retornos. Ejemplos: `Cuenta.debitar(decimal monto): bool`, `Cuenta.consultarSaldo(): decimal`, `Sesion.obtenerOperaciones(): List<Operacion>` y `Operacion.obtenerDetalle(): string`. Implementar en Cajero.Application el servicio que coordina esas clases y las dependencias de acceso bancario/persistencia.

Implementar el recorrido de autenticación:

1. Iniciar Sesion, fecha de inicio, `intentosPIN = 0` y `autenticada = false`.
2. Recibir número de tarjeta y obtener los datos del lector simulado.
3. Pasar a Autenticando y consultar SucursalDB.
4. Si no existe, está bloqueada o vencida: mostrar el motivo, pasar a Cerrando, devolver tarjeta y finalizar en Cerrada.
5. Si es válida: pasar a Validando, pedir PIN y consultar CentralDB.
6. Ante PIN incorrecto: incrementar una vez; si hay menos de tres fallos, reintentar sin reiniciar el contador; al tercero, cerrar y devolver tarjeta.
7. Ante PIN correcto: autenticar, vincular cuenta y pasar a Operando.

Los nombres de estados seguirán el diagrama: Iniciada, Autenticando, Validando, Operando, Cerrando y Cerrada; tarjeta y PIN describen qué se valida. Se utilizará un reloj sustituible en pruebas para verificar vencimientos sin depender del día en que se ejecute el test. Una tarjeta con fecha anterior al día de ejecución se considera vencida; una que vence ese día sigue siendo válida durante ese día.

Resultado de esta fase: las tres tarjetas producen el resultado de acceso esperado y el tercer PIN incorrecto cierra la sesión, sin bloquear permanentemente la tarjeta.

**8. Quinta fase: Cajero.Controller, Cajero.View y operaciones completas**

Construir CajeroController para recibir las solicitudes de tarjeta, PIN, operación y cierre y delegarlas en ServicioCajero. Construir PantallaCajero en Cajero.View con estas opciones: Consultar saldo, Extraer efectivo, Transferir y Finalizar sesión. Application verificará sesión autenticada antes de ejecutar cada operación de Domain. La lectura y escritura de consola permanecerán en View.

Orden de implementación:

1. **Extraccion:** solicitar monto, comprobar formato/positividad, enviar débito a CentralDB, simular entrega solo tras confirmación, mostrar saldo restante y registrar el resultado. Es el primer recorrido completo desde la consola hasta la base.
2. **Consulta:** mostrar saldo disponible y total; el saldo cero es un resultado exitoso, no un error de autenticación ni una consulta rechazada. Registrar la consulta.
3. **Transferencia:** solicitar CBU y monto, mostrar resumen, pedir confirmación y enviar una sola orden atómica. Si se cancela, no modificar cuentas. Si tiene éxito, generar comprobante, mostrar resultado y registrar.

Las clases concretas expondrán `public override bool ejecutar()`. Los resultados detallados se obtendrán de la operación/resultado auxiliar, sin cambiar ese retorno booleano. Las operaciones se incorporarán una sola vez a la colección de Sesion.

Después de una operación, incluida una rechazada por falta de fondos, se volverá al menú con la misma sesión autenticada. Montos con texto, cero, negativos o más de dos decimales se pedirán nuevamente sin terminar el programa.

Política propuesta que los diagramas no precisan completamente: límite diario de $20.000 para la suma de débitos exitosos por cuenta (extracciones y transferencias), acumulado entre sesiones del día. Se documentará expresamente; no se presentará como un valor suministrado por el docente. Si la cátedra define otra política, se ajustará antes de cerrar la implementación.

**9. Sexta fase: cierre, ticket y persistencia entre ejecuciones**

Al elegir Finalizar, pasar a Cerrando y preguntar por ticket solamente si hubo autenticación válida. Si lo solicita, recuperar las operaciones de esa sesión y mostrar el ticket en consola; también puede representar una sesión sin operaciones. En todos los casos simular devolución de tarjeta, registrar fecha de fin, invalidar autenticación y pasar a Cerrada.

Una nueva tarjeta crea una nueva Sesion. Reiniciar la aplicación debe conservar saldos e historial; nunca debe reabrir automáticamente una sesión previamente autenticada. El ticket contendrá identificación de sesión, fechas y operaciones, sin PIN ni credenciales.

Resultado de esta fase: cierre con/sin ticket y nueva sesión funcionales, con datos conservados al reiniciar.

**10. Séptima fase: pruebas y demostración**

Usar bases temporales aisladas para las pruebas. Ejecutar al menos estos escenarios:

| Escenario | Comprobación |
|---|---|
| Tarjeta vigente con PIN correcto | Menú y estado Operando. |
| Tarjeta sin saldo con PIN correcto | Acceso permitido y consulta de $0. |
| Tarjeta vencida | Rechazo antes del PIN y cierre. |
| Número de tarjeta inexistente | Mensaje claro y ningún acceso a cuenta. |
| PIN incorrecto una/dos veces y luego correcto | Acceso permitido, contador sin reinicio indebido. |
| Tres PIN incorrectos | Cierre; ningún menú ni operación. |
| Extracción válida | Débito una sola vez, saldo correcto y registro único. |
| Extracción sin fondos o sobre el límite | Sin entrega ni cambio de saldo; rechazo registrado. |
| Monto inválido | Reintento de entrada, sin movimiento bancario. |
| Transferencia confirmada de tarjeta 1 a cuenta 2 | Origen baja, destino sube, suma conservada y comprobante. |
| Transferencia cancelada o destino inválido | Sin cambios en ambas cuentas. |
| Falla durante la escritura de transferencia | Reversión de ambos saldos y ausencia de una operación exitosa parcial. |
| Cierre con/sin ticket | Tarjeta devuelta y sesión Cerrada en ambos recorridos. |
| Reabrir el programa | Saldos persistidos; se solicita nueva autenticación. |

La prueba de falta de fondos debe partir de una base recién inicializada o de una cuenta realmente vacía, porque la segunda cuenta deja de estar vacía cuando recibe dinero.

**11. Octava fase: entrega y correspondencia final**

Completar README con descripción, integrantes, SDK requerido, restauración, compilación, ejecución, credenciales ficticias, ubicación de la base y reinicio explícito del demo. Los nombres de los integrantes quedan pendientes de que el alumno los proporcione.

Agregar `docs/CORRESPONDENCIA_DIAGRAMAS.md`: cada clase, método relevante, estado, flujo principal y alternativa se vinculará con su implementación y prueba. Explicar las adaptaciones de consola, lector simulado y SQLite; no modificar silenciosamente los diagramas para esconder diferencias.

Comandos previstos una vez construida la solución:

```powershell
dotnet restore CajeroAutomatico/CajeroAutomatico.sln
dotnet build CajeroAutomatico/CajeroAutomatico.sln
dotnet test CajeroAutomatico/tests/Cajero.Pruebas/Cajero.Pruebas.csproj
dotnet run --project CajeroAutomatico/src/Cajero.View
```

El proyecto estará listo para demostración cuando las tres tarjetas, las tres operaciones, el contador de PIN, los seis estados, los tickets y la persistencia funcionen, las pruebas pasen y la correspondencia con `TrabajoCorregido` esté documentada. El cumplimiento literal del formulario seguirá dependiendo de la aceptación de consola por la cátedra o de agregar FormCajero como presentación adicional.
