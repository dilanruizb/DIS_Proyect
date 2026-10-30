# Diccionario de datos — Cajero Automático

Versión propuesta para TrabajoCorregidoCodex. D2 y D3 se excluyen por aclaración del alumno. Los flujos son lógicos: pueden agrupar varias pantallas o intercambios, sin imponer orden temporal.

Notación: `+` composición; `[x]` componente opcional; `{x}` cero o más repeticiones; `|` alternativa. Los importes usan Decimal, nunca punto flotante binario.

## Flujos de datos

| Nombre | Descripción | Composición | Valores permitidos / restricciones |
|---|---|---|---|
| Credenciales de autenticación | Datos aportados por el cliente para abrir una sesión. | DatosTarjeta + pin | Tarjeta con formato válido; PIN de 4 dígitos. Se solicitan en dos pasos. |
| Resultado de autenticación | Respuesta de acceso y pantalla siguiente. | estadoAutenticacion + mensaje + intentosRestantes + tarjetaDevuelta + [menu] | AUTENTICADA \| TARJETA_INVALIDA \| PIN_INVALIDO \| INTENTOS_AGOTADOS; menú sólo si AUTENTICADA. |
| Solicitud de PIN | Pantalla que solicita el PIN después de validar tarjeta. | numeroTarjeta + intentosRestantes | Tarjeta válida; intentosRestantes entre 1 y 3. |
| Solicitud de validación de tarjeta | Consulta del cajero al sistema de Sucursal. | DatosTarjeta | Número no vacío, vencimiento y entidad emisora presentes. |
| Estado de tarjeta | Resultado enviado por Sucursal. | estadoTarjeta + [numeroCuenta] + mensaje | VALIDA \| VENCIDA \| BLOQUEADA \| DESCONOCIDA; cuenta sólo si VALIDA. |
| Solicitud de validación de PIN | Verificación enviada a Red Central. | numeroTarjeta + pin | PIN de 4 dígitos; no registrar en D1. |
| Confirmación de PIN | Respuesta de Red Central a la autenticación. | pinValido + mensaje | pinValido: Boolean. |
| Solicitud de consulta | Elección de consulta de saldo. | idSesion + numeroCuenta | Sesión autenticada y cuenta vinculada. |
| Solicitud de consulta de saldo | Petición al sistema central. | numeroCuenta | Cuenta existente. |
| Información de saldo | Respuesta central de consulta. | exito + saldoDisponible + saldoTotal + mensaje | Importes >= 0; si exito=false, no interpretar los saldos. |
| Resultado de consulta | Saldo mostrado al cliente. | ResultadoOperacion + [saldoDisponible] + [saldoTotal] | Saldo disponible presente si estado=EXITOSA; saldo total puede mostrarse adicionalmente. |
| Solicitud de extracción | Monto y cuenta de una extracción. | idSesion + numeroCuenta + monto | monto > 0; sesión autenticada. |
| Solicitud de débito | Autorización y débito atómico en Red Central. | numeroCuenta + monto | monto > 0; central verifica fondos y límite diario. |
| Resultado de débito | Confirmación o rechazo de débito. | exito + [numeroTransaccion] + saldoRestante + mensaje | exito: Boolean; saldoRestante >= 0; no dispensar si exito=false. |
| Resultado de extracción | Resultado mostrado y constancia de entrega de efectivo. | ResultadoOperacion + montoEntregado + saldoRestante | montoEntregado=monto si éxito; 0 si rechazo. |
| Solicitud de transferencia | Datos y confirmación de una transferencia. | idSesion + numeroCuenta + cbuDestino + monto + confirmacion | monto > 0; CBU de 22 dígitos; confirmacion=true para ejecutar. |
| Instrucción de transferencia | Orden atómica a Red Central. | numeroCuenta + cbuDestino + monto | Destino válido; fondos suficientes; sin débito local previo. |
| Resultado central de transferencia | Resultado, confirmación y comprobante central. | exito + [numeroComprobante] + saldoRestante + mensaje | Comprobante sólo si exito=true. |
| Resultado de transferencia | Resultado y comprobante mostrado al cliente. | ResultadoOperacion + [numeroComprobante] + saldoRestante | Estado EXITOSA o RECHAZADA. |
| Solicitud de cierre | Decisión del cliente de finalizar la sesión. | idSesion + deseaTicket | deseaTicket: Boolean. |
| Resultado de cierre | Confirmación, ticket opcional y devolución de tarjeta. | idSesion + tarjetaDevuelta + [Ticket] + estadoSesion | tarjetaDevuelta=true; estadoSesion=CERRADA; Ticket sólo si deseaTicket=true. |
| Contexto de sesión | Identidad y cuenta autenticadas para operar. | idSesion + numeroTarjeta + numeroCuenta + autenticada | autenticada=true; no contiene PIN. |
| Registro de operación | Operación finalizada para el historial de la sesión. | RegistroOperacion | Tipo CONSULTA \| EXTRACCION \| TRANSFERENCIA; estado EXITOSA \| RECHAZADA. |
| Consulta de operaciones de sesión | Filtro para leer el registro. | idSesion | Identificador de sesión existente. |
| Operaciones de sesión | Operaciones registradas para confeccionar ticket. | idSesion + {RegistroOperacion} | Lista de cero o más registros, sin PIN. |
| Datos de tarjeta | Datos leídos, preparados para validar. | DatosTarjeta | Número, vencimiento y entidad emisora. |
| Tarjeta validada | Datos de tarjeta con resultado de Sucursal. | DatosTarjeta + estadoTarjeta + [numeroCuenta] | Estado de tarjeta según rt. |
| PIN capturado | PIN capturado y asociado a la tarjeta. | numeroTarjeta + pin | 4 dígitos, dato transitorio que no se persiste. |
| Autenticación procesada | Resultado de validación para presentar al cliente. | estadoAutenticacion + intentosRestantes + [ContextoSesion] | Intentos restantes 0..3; contexto sólo si autenticada. |
| Operación preparada | Solicitud validada y datos de sesión asociados. | tipoOperacion + ContextoSesion + [monto] + [cbuDestino] | Datos específicos presentes según tipo; autenticada=true. |
| Operación procesada | Resultado que se registra y presenta. | RegistroOperacion + mensaje | No se registra como EXITOSA una respuesta central rechazada. |
| Cierre preparado | Decisión de cierre y sesión correspondiente. | idSesion + deseaTicket | Id existente; booleano. |
| Datos de ticket | Contenido opcional listo para imprimir. | idSesion + deseaTicket + {RegistroOperacion} | Lista vacía permitida; no imprimir cuando deseaTicket=false. |
| Solicitud de tarjeta preparada | Datos listos para enviar a Sucursal. | DatosTarjeta | Mismas restricciones que vt. |
| Solicitud de PIN preparada | Credenciales listas para enviar a Central. | numeroTarjeta + pin | Mismas restricciones que vp. |
| Consulta preparada para Central | Número de cuenta para solicitud central. | numeroCuenta | Cuenta válida de sesión autenticada. |
| Débito preparado para Central | Petición de extracción validada localmente. | numeroCuenta + monto | Monto positivo; no implica autorización de débito. |
| Transferencia preparada para Central | Orden validada localmente. | numeroCuenta + cbuDestino + monto | Confirmada, monto positivo, CBU con formato válido. |
| Detalle recuperado | Lista de operaciones para preparar ticket. | idSesion + {RegistroOperacion} | Cero o más operaciones de esa sesión. |

## Estructuras compuestas

| Nombre | Descripción | Composición | Valores permitidos / restricciones |
|---|---|---|---|
| DatosTarjeta | Datos leídos de la tarjeta | numeroTarjeta + fechaVencimiento + entidadEmisora | No incluye PIN; estado validado por Sucursal. |
| ContextoSesion | Identidad operativa de sesión | idSesion + numeroTarjeta + numeroCuenta + autenticada | Sólo se entrega para operar con autenticada=true. |
| ResultadoOperacion | Resumen de ejecución | numeroOperacion + tipoOperacion + estado + mensaje | EXITOSA o RECHAZADA; mensaje legible. |
| RegistroOperacion | Fila de historial de operación | idSesion + numeroOperacion + fechaHora + tipoOperacion + estado + numeroCuenta + [monto] + [cbuDestino] + [numeroComprobante] + [saldoDisponible] + [saldoTotal] + [saldoRestante] | Campos opcionales dependen del tipo y resultado; no guardar PIN. |
| Ticket | Comprobante de sesión | idSesion + fechaHora + {RegistroOperacion} | Puede contener cero operaciones; sólo se imprime si deseaTicket=true. |

## Elementos de datos

| Nombre | Descripción | Composición / tipo | Valores permitidos |
|---|---|---|---|
| idSesion | Identifica una sesión | Integer | Entero positivo, único. |
| numeroOperacion | Identifica operación local | Integer | Entero positivo, único. |
| numeroTarjeta | Identifica tarjeta | String | 13 a 19 dígitos; conservar ceros iniciales. Supuesto de simulación. |
| numeroCuenta | Identifica cuenta | String | No vacío; autoridad: Sucursal/Central. |
| pin | Secreto de autenticación | String | Exactamente 4 dígitos; conservar ceros iniciales; máximo 3 intentos. |
| fechaVencimiento | Vencimiento de tarjeta | Date | Fecha válida; vencimiento resuelto por Sucursal. |
| entidadEmisora | Entidad de la tarjeta | String | No vacío. |
| fechaHora | Instante de registro | DateTime | Fecha/hora válida; formato ISO 8601 en persistencia. |
| tipoOperacion | Clase de operación | Enum | CONSULTA / EXTRACCION / TRANSFERENCIA. |
| estado | Resultado de operación | Enum | EXITOSA / RECHAZADA. |
| estadoTarjeta | Resultado de validación | Enum | VALIDA / VENCIDA / BLOQUEADA / DESCONOCIDA. |
| estadoAutenticacion | Resultado de acceso | Enum | AUTENTICADA / TARJETA_INVALIDA / PIN_INVALIDO / INTENTOS_AGOTADOS. |
| estadoSesion | Estado de ciclo de vida | Enum | INICIADA / AUTENTICANDO / VALIDANDO / OPERANDO / CERRANDO / CERRADA. |
| intentosRestantes | PIN disponibles | Integer | 0..3. |
| intentosPIN | Intentos fallidos de la sesión | Integer | 0..3; inicial 0. |
| monto | Importe solicitado | Decimal | Mayor que 0, dos decimales. En extracción, validar disponibilidad de billetes en presentación. |
| montoEntregado | Efectivo realmente entregado | Decimal | >=0; 0 si operación rechazada. |
| saldoDisponible | Fondos utilizables | Decimal | >=0; no mayor a saldoTotal en esta simulación. |
| saldoTotal | Saldo contabilizado | Decimal | >=0 en esta simulación, sin descubierto. |
| saldoRestante | Saldo disponible posterior | Decimal | >=0. |
| limiteDiario | Máximo diario de extracción | Decimal | >=0; verificado por Central. |
| cbuDestino | Cuenta destino | String | Exactamente 22 dígitos; formato no garantiza existencia. Central valida destino. |
| numeroTransaccion | Referencia de débito | String | No vacía en débito exitoso. |
| numeroComprobante | Referencia de transferencia | String | No vacía en transferencia exitosa. |
| mensaje | Texto para el usuario | String | Texto legible; no incluye PIN. |
| menu | Opciones disponibles | Lista de Enum | CONSULTAR / EXTRAER / TRANSFERIR / FINALIZAR. |
| autenticada | Indicador autenticada | Boolean | true / false. |
| pinValido | Indicador pinValido | Boolean | true / false. |
| exito | Indicador exito | Boolean | true / false. |
| confirmacion | Indicador confirmacion | Boolean | true / false. |
| deseaTicket | Indicador deseaTicket | Boolean | true / false. |
| tarjetaDevuelta | Indicador tarjetaDevuelta | Boolean | true / false. |
| bloqueada | Indicador bloqueada | Boolean | true / false. |

## Almacén D1

| Nombre | Descripción | Composición | Valores permitidos / restricciones |
|---|---|---|---|
| D1 — Log de operaciones | Historial de operaciones para auditoría y ticket. | {RegistroOperacion} | Cero o más registros; clave numeroOperacion; filtro idSesion. Sólo acceden procesos del cajero. No contiene PIN. |

## Balanceo

Cada fila representa un flujo externo presente en Contexto y Nivel 0 con el mismo nombre, terminador y dirección. Los flujos internos de sesión y D1 no aparecen en el contexto.

| Terminador | Dirección | Flujo | Proceso Nivel 0 |
|---|---|---|---|
| Cliente | Entrada al cajero | Credenciales de autenticación | 1.0 Autenticar Usuario |
| Cliente | Salida del cajero | Solicitud de PIN | 1.0 Autenticar Usuario |
| Cliente | Salida del cajero | Resultado de autenticación | 1.0 Autenticar Usuario |
| Sucursal | Salida del cajero | Solicitud de validación de tarjeta | 1.0 Autenticar Usuario |
| Sucursal | Entrada al cajero | Estado de tarjeta | 1.0 Autenticar Usuario |
| Red Central | Salida del cajero | Solicitud de validación de PIN | 1.0 Autenticar Usuario |
| Red Central | Entrada al cajero | Confirmación de PIN | 1.0 Autenticar Usuario |
| Cliente | Entrada al cajero | Solicitud de consulta | 2.0 Consultar Saldo |
| Red Central | Salida del cajero | Solicitud de consulta de saldo | 2.0 Consultar Saldo |
| Red Central | Entrada al cajero | Información de saldo | 2.0 Consultar Saldo |
| Cliente | Salida del cajero | Resultado de consulta | 2.0 Consultar Saldo |
| Cliente | Entrada al cajero | Solicitud de extracción | 3.0 Extraer Efectivo |
| Red Central | Salida del cajero | Solicitud de débito | 3.0 Extraer Efectivo |
| Red Central | Entrada al cajero | Resultado de débito | 3.0 Extraer Efectivo |
| Cliente | Salida del cajero | Resultado de extracción | 3.0 Extraer Efectivo |
| Cliente | Entrada al cajero | Solicitud de transferencia | 4.0 Realizar Transferencia |
| Red Central | Salida del cajero | Instrucción de transferencia | 4.0 Realizar Transferencia |
| Red Central | Entrada al cajero | Resultado central de transferencia | 4.0 Realizar Transferencia |
| Cliente | Salida del cajero | Resultado de transferencia | 4.0 Realizar Transferencia |
| Cliente | Entrada al cajero | Solicitud de cierre | 5.0 Finalizar Sesión |
| Cliente | Salida del cajero | Resultado de cierre | 5.0 Finalizar Sesión |

Los flujos de credenciales y resultados agrupan los datos que antes estaban repartidos en flechas separadas. Resultado de autenticación incluye solicitud de reintento, error o menú según estado; Resultado de cierre representa la información del ticket y la devolución física, no un transporte de objetos por un flujo lógico. Los pedidos de PIN y las acciones físicas se detallan en secuencias.
