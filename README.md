# AQPixel

RPG de fantasía con combate por turnos 1 contra 1, para jugar en el navegador en sesiones cortas.
Estética pixel art, tono de humor absurdo y un sistema elemental que premia llegar bien preparado.

El plan de desarrollo por fases está en [ROADMAP.md](ROADMAP.md).

## Cómo jugar

El juego no necesita instalación ni dependencias. Por usar módulos de JavaScript, hay que abrirlo desde un servidor local
(abrir `index.html` con doble clic no funciona):

```bash
python3 -m http.server 8000
# o: npm start
```

Después entrá a <http://localhost:8000>.

Para generar una versión en un único archivo HTML (para compartir o publicar):

```bash
npm install
npm run build   # crea dist/aqpixel.html
```

## Bucle de juego

1. **Pueblo**: una escena de Villa Pixelia donde tocás cada edificio para entrar. Adentro te atiende su dueño
   y a la derecha hay un pergamino con lo que ofrece: posada (curarse), herrería (armas y armaduras),
   tienda de magia (hechizos y pociones), gimnasio (comprar puntos de atributo) y tu casa (equipo, atributos y venta).
2. **Puerta del pueblo**: elegís una zona según su nivel y elemento.
3. **Cazar**: combate por turnos. Atacá con el arma, lanzá el hechizo, tomá pociones o huí.
   El panel del enemigo muestra a qué es débil; los botones marcan ×1,5 cuando tu elemento le pega fuerte.
4. **Recompensas**: experiencia, oro y, con suerte, un objeto raro que solo se consigue cazando.

Atajos en combate: teclas `1` a `5`.

La partida se guarda sola en el navegador (localStorage).

## Estructura

```
index.html
css/style.css          Estilos y animaciones
js/main.js             Arranque y navegación entre pantallas
js/state.js            Jugador, fórmulas derivadas, inventario y guardado
js/combat.js           Lógica de combate (sin interfaz): devuelve eventos que la pantalla reproduce
js/sprites.js          Sprites chicos como grillas de texto (héroe, monstruos, íconos) y fondos de combate
js/art/paint.js        Primitivas y piezas de pixel art: piedra, tejas, entramado, ventanas, árboles...
js/art/town.js         Villa Pixelia: composición, zonas clickeables y animaciones
js/art/interiors.js    Interiores de cada local
js/art/npcs.js         Retratos de los dueños (parpadean y hablan)
js/scene.js            Escenario animado sobre canvas
js/ui.js               Componentes compartidos (HUD, barras, filas de objetos, avisos)
js/screens/            Una pantalla por archivo (interior.js arma la estructura común de los locales)
js/data/               Contenido: elementos, objetos, monstruos, zonas y pueblo
tools/build-single.mjs Empaquetado en un solo HTML
```

## Cómo agregar contenido

Todo el contenido vive en `js/data/` y no requiere tocar el motor:

- **Monstruo nuevo**: agregá una entrada en `monsters.js`. Podés reutilizar un sprite existente con otra paleta (`pal`).
- **Zona nueva**: agregá una entrada en `zones.js` con sus monstruos y los colores del fondo.
- **Objeto nuevo**: agregá una llamada a `add()` en `items.js`. Con `shop: null` solo se consigue como botín.
- **Sprite nuevo**: dibujalo como grilla de caracteres en `SPRITES` dentro de `sprites.js`
  (`a`, `b` y `c` toman los colores del elemento).
