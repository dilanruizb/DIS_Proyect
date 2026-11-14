# Cajero Automático — TrabajoCorregidoCodex

Modelos corregidos derivados de TrabajoCorregido. Los originales se conservan intactos. Esta carpeta contiene diagramas StarUML y documentación; todavía no es una aplicación ejecutable.

## Archivos para abrir

- DiagramaContexto/DiagramaDeContexto.mdj: contexto con tres terminadores y flujos agrupados documentados.
- DFD/DFDNivel0.mdj: cinco procesos y D1; balanceado con el contexto.
- DFD/DFDNivel1.mdj: desarrollo de los cinco procesos.
- DFD/*Nivel2*.mdj: descomposición selectiva de validación, consulta, débito, transferencia y ticket; no es obligatorio descomponer procesos triviales.
- CasosDeUso/CasoDeUsoContextual.mdj: diagrama general con include y extend.
- CasosDeUso/CasoDeUso.mdj: cinco vistas individuales y documentación de escenarios.
- DiagramaDeClases/DiagramaClases.mdj: ocho clases, herencias, asociaciones y composición.
- DiagramaDeSecuencia/DiagramaSecuencia.mdj: autenticación y alternativas, tres operaciones y cierre con/sin ticket.
- DiccionarioDeDatos.md: flujos, estructuras, elementos, D1 y tabla de balanceo.
- DiagramaDeEstado/EstadoSesion.mdj: los seis estados de Sesion, eventos, reintentos del PIN y cierre; explicación en DiagramaDeEstado/README.md.
- DiagramaDeActividad/ActividadSistema.mdj: seis diagramas enlazados del sistema (general, autenticación, consulta, extracción, transferencia y cierre); explicación en DiagramaDeActividad/README.md.
- Vistas/: imágenes JPEG exportadas directamente por StarUML para consultar los diagramas.
- VALIDACION.md: comprobaciones realizadas y alcance de la revisión visual.
- output/pdf/Informe_errores_diagramas.pdf: informe de 10 páginas sobre los originales, con ubicación, motivo y corrección de los hallazgos.

Abrir cada .mdj desde File > Open en StarUML y seleccionar el diagrama en Model Explorer. Los archivos son independientes, no referencias enlazadas entre proyectos. Las vistas repetidas de terminadores/almacenes en DFD corresponden a un mismo elemento dentro de cada diagrama.

## Decisiones de modelado

Revisión visual del 13 de noviembre de 2026: distribución de clases en dos filas, casos de uso con disposición similar a la original, DFD compactos y secuencias con menor separación. Se conservaron los elementos del modelo corregido. Las notas extensas se encuentran en la documentación del diagrama (propiedad Documentation) para despejar el lienzo. El estilo se aplica con herramientas/presentacion.cjs; el informe se genera con herramientas/informe_errores.py.

1. Se ignoran D2/D3 y la referencia a la sección 5 por aclaración expresa del alumno. Se conserva D1 porque los modelos originales registran operaciones y emiten tickets.
2. Autenticar Usuario se ejecuta como include de cada operación para garantizar acceso. Su primera rama reutiliza la sesión ya autenticada; únicamente sin sesión válida se pide tarjeta/PIN. No se solicita PIN otra vez para cada operación.
3. El cierre extiende las operaciones en finDeOperacion cuando el cliente solicita finalizar. Dentro del cierre, deseaTicket controla la impresión; devolución de tarjeta y cierre son obligatorios en ambas ramas. También puede cerrarse desde el menú sin operaciones.
4. Una tarjeta accede a una cuenta en esta simulación; un cliente puede tener varias tarjetas y sesiones. Cada operación pertenece a una sesión y una cuenta de origen. Sesion compone operaciones en memoria; D1 conserva el historial persistente independientemente de esos objetos.
5. Consulta/Extraccion/Transferencia redefinen ejecutar(): Boolean de Operacion abstracta. Los atributos son privados; los métodos, públicos. Clases sin subrayar: el subrayado de la consigna se refiere a instancias, no a las clases.
6. Central es la autoridad para fondos, débitos y transferencias. La transferencia es atómica; no se debita localmente antes de enviar la orden. El escenario exitoso supone que el dispensador funciona; fallas mecánicas/compensación quedan fuera de esta simulación académica.
7. Máximo tres PIN fallidos por sesión. Al agotarlos se devuelve tarjeta y se cierra; no se inventa un bloqueo bancario permanente ni retención física.
8. Los DFD son lógicos y usan registros compuestos definidos en el DD. Un flujo puede agrupar una conversación; las secuencias describen el orden de las interacciones.

## Cambios frente al material original

- Se eliminaron flujos sin nombre, conexiones directas de terminadores a almacenes y discrepancias de frontera entre niveles.
- Se unificaron nombres y numeración y se desarrolló el débito de extracción que estaba incompleto.
- Se corrigieron los miembros de Cliente y Tarjeta y se añadieron relaciones y multiplicidades justificadas.
- Se corrigieron destinatarios, parámetros, llamadas asíncronas y activaciones de las secuencias. Los retornos se modelan como reply.
- Se documentaron las condiciones de extend y los puntos de extensión.

## Pendientes fuera de esta corrección

Se incorporaron el diagrama de estados de Sesion (punto 8) y los seis diagramas de actividad del sistema (punto 9) por pedidos posteriores. Continúa pendiente la implementación en capas (punto 10). Este README explica cómo abrir modelos; no reemplaza instrucciones para ejecutar una aplicación futura. Integrantes del equipo: pendiente de completar por el alumno. El PDF de errores documenta la revisión anterior de los originales y no se modifica retroactivamente con estas incorporaciones.

La carpeta herramientas contiene el generador y validador usados para producir los modelos. El generador sólo emite parches y no modifica los originales.
