# AQPixel — Plan por fases

RPG de combate por turnos 1 contra 1 para navegador, estética pixel art.
Cada fase deja el juego jugable; las siguientes suman sistemas y contenido sin cambiar el bucle principal:
**pueblo → zona → combate → recompensas → mejorar → volver**.

## Fase 1 — Versión jugable (núcleo) ✅

- Creación de personaje (nombre) y guardado automático en el navegador.
- Pueblo central con edificios clickeables y dueños con personalidad:
  posada, herrería, tienda de magia, entrenador, mochila y puerta del pueblo.
- Personaje: 6 atributos (FUE, DES, INT, RES, CAR, SUE), vida, maná, nivel y experiencia.
  Al subir de nivel se reparten puntos; el entrenador vende puntos por oro.
- Combate por turnos 1 contra 1: iniciativa, precisión contra evasión, críticos,
  ataque con arma (cuerpo a cuerpo o a distancia), hechizo, pociones y huida.
- Sistema elemental de 8 elementos con resistencias porcentuales visibles del enemigo.
- 5 zonas (Nv 1–15) con 3 monstruos cada una; los monstruos reutilizan dibujos con variantes de color.
- Equipo: arma, armadura y hechizo. Variantes elementales de cada arma, armadura y hechizo.
- Objetos raros que solo se consiguen como botín.
- Economía: oro, venta a un cuarto del precio, descuentos por carisma, sumideros de oro.
- Derrota sin castigo duro: volvés a la posada con media vida.

## Fase 1.5 — Pueblo visual ✅

- Villa Pixelia como escena: vista del pueblo desde lejos con edificios detallados y clickeables,
  humo, fuego de la forja, fuente, banderas, vecinos paseando y un slime mascota.
- Cada local es un interior propio con su dueño detrás del mostrador (parpadea y habla),
  decoración acorde a lo que vende y un pergamino con la mercadería a la derecha.
- Cuadro de diálogo de RPG: los dueños describen los objetos y reaccionan a las compras.
- Tu casa muestra al héroe con el equipo puesto, la ficha de atributos y el inventario.
- Tablón de misiones en la plaza (se habilita en la Fase 3).

## Fase 2 — Equipo y combate profundo

- Ranuras de escudo, mascota y misceláneo.
- Inventario limitado y banco en el pueblo.
- Clases atadas a la armadura: habilidades y puntos especiales.
- Estados alterados: veneno, quemadura, aturdimiento.
- Efectos especiales de objetos (golpe doble, robo de vida, etc.).
- Cambiar de equipo en combate a costa de un turno.
- Cadenas de mejora de objetos con oro y materiales.

## Fase 3 — Misiones y narrativa

- Tablón de misiones con escenas de diálogo y retratos.
- Jefes con mecánicas: fases, inmunidades que rotan, ataques cargados telegrafiados.
- Tiendas de recompensa que se desbloquean al completar misiones.
- Primera saga encadenada.

## Fase 4 — Presentación y retención

- Música chiptune y efectos de sonido (Web Audio).
- Más animaciones de ataque e impacto.
- Logros y títulos.
- Eventos de temporada según la fecha (Halloween, invierno, aniversario).
- Panel de novedades alimentado por datos.

## Fase 5 — Modos extra

- Arena de oleadas, mazmorra de varios pisos, torneo.
- Suba del nivel máximo con equipo nuevo.
- Monetización: a definir (o ninguna si es un proyecto personal).

## Decisiones tomadas para la Fase 1

| Pregunta del documento | Decisión |
| --- | --- |
| ¿1 contra 1 o grupo? | 1 contra 1 |
| ¿Cuántos elementos? | Los 8 del documento, con su tabla de opuestos |
| ¿Clases por armadura o al crear? | Por armadura (llega en Fase 2) |
| ¿Mundo de menús o exploración? | Menús y pantallas |
| ¿Tono? | Humor absurdo con épica liviana |
| ¿Monetización? | Ninguna por ahora |
