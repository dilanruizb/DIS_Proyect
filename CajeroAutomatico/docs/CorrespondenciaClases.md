# Correspondencia con el diagrama de clases

En la transferencia, la consola recibe el CBU y `CentralDB` busca la cuenta de destino en SQLite dentro de la transacción. Por eso `Cuenta.transferir(Cuenta destino, decimal monto)` recibe la cuenta ya resuelta, mientras que el diagrama muestra `transferir(string cbuDestino, decimal monto)`. La entidad mueve los saldos y la capa de datos guarda ambos cambios y la operación juntos.

`Cliente`, `Consulta` y `Extraccion` reciben `IInteraccionCajero` en los métodos que requieren interacción. `PantallaCajero` implementa ese contrato y conserva la lectura del PIN, el menú y la salida de texto. `seleccionarOperacion` devuelve la opción para que la pantalla despache la solicitud. `ingresarPIN` devuelve el PIN o un valor nulo al cancelar. `finalizarSesion` solicita el cierre de la sesión actual. Esas firmas incluyen los datos que las capas necesitan para completar el flujo.

En la extracción, `CentralDB` comprueba el límite diario y `solicitarAutorizacion` comprueba los fondos de la cuenta. La pantalla llama a `dispensarEfectivo` cuando recibe una extracción guardada con éxito y muestra la entrega simulada.
