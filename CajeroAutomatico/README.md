# Cajero Automático

Simulador de cajero automático en consola con C#, .NET 10,
Entity Framework Core y SQLite. Permite validar una tarjeta y su PIN, consultar saldo,
extraer efectivo, transferir y pedir un ticket al finalizar.

## Integrantes

- Ruiz Besson Dilan, Nieva Julieta

## Cómo ejecutar

1. Abrir `CajeroAutomatico.sln` en Visual Studio.
2. Establecer `Cajero.Presentacion` como proyecto de inicio.
3. Ejecutar con F5 para abrir la consola. Al iniciar se aplican las
   migraciones pendientes y se cargan las tarjetas de prueba que todavía
   no existen.

La solución tiene tres proyectos. `Cajero.Datos` contiene SQLite, las migraciones
y los sistemas simulados. `Cajero.Logica` contiene las entidades, reglas y servicio.
`Cajero.Presentacion` contiene la pantalla de consola y su controlador.

La base se guarda en `src/Cajero.Presentacion/datos/cajero.db`.
Los saldos y el historial se conservan entre ejecuciones.

Para abrir el cajero en una consola independiente, hacé doble clic en
`IniciarCajero.cmd` desde la carpeta de la solución. Al terminar, la ventana
queda abierta para que puedas leer el ticket antes de cerrarla.

## Tarjetas de prueba

Elegí una tarjeta en el menú inicial.
Si la tarjeta es válida, el cajero te pide el PIN. La tarjeta vencida se rechaza antes de pedirlo.

| Opción | Número interno | PIN de prueba | CBU de la cuenta | Saldo inicial | Estado |
|---|---|---|---|---:|---|
| Tarjeta 1 | `1000000000000001` | `1111` | `0000000000000000000001` | $100.000 | Vigente |
| Tarjeta 2 | `1000000000000002` | `2222` | `0000000000000000000002` | $0 | Vigente |
| Tarjeta 3 | `1000000000000003` | `3333` | `0000000000000000000003` | $50.000 | Vencida |

Los saldos de la tabla son los de una base recién inicializada.
Para probar una transferencia desde la tarjeta 1, usá el CBU de la cuenta
asociada a la tarjeta 2 como destino.
