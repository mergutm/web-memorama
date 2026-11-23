const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const contadorIntentos = document.getElementById("intentos");
const contadorParejas = document.getElementById("parejas");
const botonIniciar = document.getElementById("iniciar");

// Configuración del tablero: 2 filas x 4 columnas.
const FILAS = 2;
const COLUMNAS = 4;
const ANCHO = 120;
const ALTO = 150;
const ESPACIO = 15;
const MARGEN_X = 60;
const MARGEN_Y = 15;

// Cada archivo SVG representa una figura y tendrá dos tarjetas.
const archivosFiguras = [
    "img/figura1.svg",
    "img/figura2.svg",
    "img/figura3.svg",
    "img/figura4.svg"
];

let imagenes = [];
let piezas = [];
let seleccionadas = [];
let intentos = 0;
let parejasEncontradas = 0;
let bloqueado = false;
let juegoTerminado = false;
let temporizadorOcultar = null;

// Carga las cuatro imágenes antes de iniciar el juego.
function cargarImagenes() {
    const promesas = archivosFiguras.map((archivo) => {
        return new Promise((resolve, reject) => {
            const imagen = new Image();
            imagen.onload = () => resolve(imagen);
            imagen.onerror = () => reject(new Error(`No se pudo cargar ${archivo}`));
            imagen.src = archivo;
        });
    });

    Promise.all(promesas)
        .then((resultado) => {
            imagenes = resultado;
            iniciarJuego();
        })
        .catch((error) => {
            console.error(error);
            alert("No fue posible cargar las figuras SVG. Verifica los archivos del proyecto.");
        });
}

// Barajado 
function barajear(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Crea las ocho tarjetas, mezcla su orden y asigna sus coordenadas.
function iniciarJuego() {
    if (temporizadorOcultar !== null) {
        clearTimeout(temporizadorOcultar);
        temporizadorOcultar = null;
    }

    piezas = [];
    seleccionadas = [];
    intentos = 0;
    parejasEncontradas = 0;
    bloqueado = false;
    juegoTerminado = false;

    contadorIntentos.textContent = intentos;
    contadorParejas.textContent = `${parejasEncontradas} / ${archivosFiguras.length}`;

    archivosFiguras.forEach((_, id) => {
        piezas.push(crearPieza(id));
        piezas.push(crearPieza(id));
    });

    barajear(piezas);

    piezas.forEach((pieza, indice) => {
        const fila = Math.floor(indice / COLUMNAS);
        const columna = indice % COLUMNAS;

        pieza.x = MARGEN_X + columna * (ANCHO + ESPACIO);
        pieza.y = MARGEN_Y + fila * (ALTO + ESPACIO);
    });

    dibujarTablero();
}

function crearPieza(id) {
    return {
        id,
        x: 0,
        y: 0,
        visible: false,
        encontrada: false
    };
}

// Dibuja todas las tarjetas en el canvas.
function dibujarTablero() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    piezas.forEach((pieza) => {
        ctx.fillStyle = pieza.encontrada ? "#c8e6c9" : "#1976d2";
        ctx.fillRect(pieza.x, pieza.y, ANCHO, ALTO);

        ctx.strokeStyle = "#263238";
        ctx.lineWidth = 2;
        ctx.strokeRect(pieza.x, pieza.y, ANCHO, ALTO);

        if (pieza.visible || pieza.encontrada) {
            ctx.drawImage(
                imagenes[pieza.id],
                pieza.x + 25,
                pieza.y + 25,
                70,
                70
            );
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 40px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", pieza.x + ANCHO / 2, pieza.y + ALTO / 2);
        }
    });
}

// Convierte las coordenadas del clic a coordenadas internas del canvas.
function obtenerCoordenadas(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}

canvas.addEventListener("click", (event) => {
    if (bloqueado || juegoTerminado) return;

    const { x: mouseX, y: mouseY } = obtenerCoordenadas(event);

    const pieza = piezas.find((p) =>
        mouseX >= p.x &&
        mouseX <= p.x + ANCHO &&
        mouseY >= p.y &&
        mouseY <= p.y + ALTO
    );

    // Ignorar clics fuera de las tarjetas o sobre tarjetas ya descubiertas.
    if (!pieza || pieza.visible || pieza.encontrada) return;

    pieza.visible = true;
    seleccionadas.push(pieza);
    dibujarTablero();

    if (seleccionadas.length === 2) {
        intentos++;
        contadorIntentos.textContent = intentos;
        comprobarPareja();
    }
});

// Compara las dos tarjetas seleccionadas.
function comprobarPareja() {
    const [pieza1, pieza2] = seleccionadas;
    bloqueado = true;

    if (pieza1.id === pieza2.id) {
        pieza1.encontrada = true;
        pieza2.encontrada = true;

        parejasEncontradas++;
        contadorParejas.textContent =
            `${parejasEncontradas} / ${archivosFiguras.length}`;

        seleccionadas = [];
        bloqueado = false;
        dibujarTablero();

        verificarFinJuego();
    } else {
        // Se mantienen visibles un segundo para que el jugador las observe.
        temporizadorOcultar = setTimeout(() => {
            pieza1.visible = false;
            pieza2.visible = false;

            seleccionadas = [];
            bloqueado = false;
            temporizadorOcultar = null;

            dibujarTablero();
        }, 1000);
    }
}

// Muestra el resultado cuando se encuentran las cuatro parejas.
function verificarFinJuego() {
    if (parejasEncontradas === archivosFiguras.length) {
        juegoTerminado = true;

        setTimeout(() => {
            alert(
                "¡Felicidades! Terminaste el memorama.\n\n" +
                `Intentos realizados: ${intentos}`
            );
        }, 200);
    }
}

botonIniciar.addEventListener("click", iniciarJuego);

// Arranque de la aplicación.
cargarImagenes();
