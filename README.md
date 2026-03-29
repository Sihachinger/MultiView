# MultiView - Monitor YouTube Multi-View

Monitor multi-pantalla para ver hasta 4 streams o videos de YouTube simultáneamente.

**Última actualización:** 28/03/2026

## Características

- Vista dividida en 4 pantallas.
- Soporte para videos y streams en vivo de YouTube.
- Sistema de favoritos personalizables.
- Autoplay y reproducción automática en mute.
- Guardado persistente en caché del navegador.

## Tecnologías

- HTML5
- CSS3
- JavaScript (Youtube IFrame API)
- localStorage para persistencia de datos

## Uso

1. Pegue un enlace de YouTube en cualquiera de las 4 pantallas.
2. Para guardar en favoritos, presione el botón "Guardar" en la esquina superior izquierda y asigne un nombre personalizado.
3. Para cargar un favorito, haga clic en cualquier elemento de la lista de favoritos.
4. Para eliminar un favorito, presione el botón "X" rojo a la derecha del elemento.

## Consideraciones

- Los favoritos se guardan en el localStorage del navegador, si se elimina el caché o los datos de navegación, se perderá la lista completa de favoritos.
- Los favoritos están disponibles en las 4 pantallas.
- Esta aplicación está diseñada para monitores y pantallas horizontales, no está optimizada para dispositivos moviles.
- Use HTML puro en lugar de React a pesar de la repetición de las estructuras. Para un proyecto de esta escala, el overhead de React no me parecio justificable.

## Autor

**Victor Sihachinger**
- Contacto: https://victor.sihachinger.com
- LinkedIn: https://www.linkedin.com/in/victor-sihachinger/
- GitHub: https://github.com/Sihachinger

