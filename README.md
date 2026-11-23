# Memorama con HTML5 Canvas y JavaScript

Servir la carpeta mediante un servidor HTTP local para cargar correctamente los archivos SVG.

Desde la carpeta `memorama`, ejecuta:

```bash
python3 -m http.server 8000
```

Abrir en el navegador:

```text
http://localhost:8000
```



# ¿Qué hace new Promise()?

Una Promise (promesa) es un objeto de JavaScript que representa una operación que todavía no ha terminado, pero que producirá un resultado en el futuro.

Puede tener tres estados:
- Pending: la operación está pendiente.
- Fulfilled: la operación terminó correctamente.
- Rejected: la operación terminó con un error.


```js
return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(
        new Error(`No se pudo cargar ${archivo}`)
    );
    imagen.src = archivo;
});
```


## Promise.all

Espera a que todas las promesas del arreglo se resuelvan correctamente.
- Si las cuatro imágenes cargan, ejecuta .then().
- Si al menos una falla, ejecuta .catch().


```js
Promise.all(promesas)
    .then((resultado) => {
        imagenes = resultado;
        iniciarJuego();
    })
    .catch((error) => {
        console.error(error);
        alert("Error al cargar las imágenes SVG.");
    });
```