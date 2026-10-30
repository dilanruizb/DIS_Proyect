# Validación de los modelos corregidos

Fecha: 30 de octubre de 2026.

Se generaron 12 proyectos `.mdj` con 28 diagramas. StarUML abrió los 12 proyectos y exportó los 28 diagramas a JPEG en `Vistas/`. Se revisaron visualmente las vistas generales de contexto, Nivel 0, autenticación DFD, clases, casos de uso y secuencias de autenticación y consulta, además de una descomposición de Nivel 2. Las imágenes restantes se exportaron, pero no tuvieron una inspección visual individual.

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

No se añadieron los diagramas de estados o actividad ni código de una aplicación, porque quedaron fuera del alcance acordado para esta corrección.
