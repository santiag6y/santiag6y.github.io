/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */

// CONFIGURACIÓN DE FECHA Y CLOUDINARY
const fechaInicio = new Date(2026, 0, 10, 0, 0, 0);

const cloudName = "pakucszx"; 
const uploadPreset = "fotos_juntos"; // <-- Pónselo cuando lo crees en Cloudinary

let albumActualClave = 'viajes';

// PLANES
let listaDePlanes = JSON.parse(localStorage.getItem("planesJuntos")) || [
    { texto: "Viajar juntos a la playa 🏖️", completado: false },
    { texto: "Tener una noche de películas y pizza 🍕", completado: true }
];

// FOTOS (Almacenamiento compartido)
let coleccionFotos = JSON.parse(localStorage.getItem("misFotosJuntos")) || {
    viajes: [
        { url: "https://picsum.photos/id/1015/600/600", titulo: "Viaje" }
    ],
    citas: [
        { url: "https://picsum.photos/id/1060/600/600", titulo: "Cena" }
    ],
    momentos: [
        { url: "https://picsum.photos/id/1025/600/600", titulo: "Risas" }
    ]
};

document.addEventListener("DOMContentLoaded", function() {
    const btnEntrar = document.getElementById('btn-entrar');
    
    if (btnEntrar) {
        btnEntrar.addEventListener('click', function() {
            const bienvenida = document.getElementById('bienvenida');
            const menu = document.getElementById('menu-principal');

            if (bienvenida && menu) {
                bienvenida.classList.add('oculto');
                menu.classList.remove('oculto');
            }
        });
    }

    setInterval(actualizarContador, 1000);

    const formPlan = document.getElementById('form-plan');
    if (formPlan) {
        formPlan.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputPlan = document.getElementById('input-plan');
            const textoPlan = inputPlan.value.trim();

            if (textoPlan !== "") {
                listaDePlanes.push({ texto: textoPlan, completado: false });
                guardarYRenderizarPlanes();
                inputPlan.value = "";
            }
        });
    }

    // Inicializar widget de Cloudinary
    const btnSubir = document.getElementById('upload_widget');
    if (btnSubir && window.cloudinary) {
        const myWidget = cloudinary.createUploadWidget({
            cloudName: cloudName, 
            uploadPreset: uploadPreset,
            sources: ['local', 'camera', 'url'],
            multiple: true,
            maxFiles: 5
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                const urlImagen = result.info.secure_url;
                
                if (!coleccionFotos[albumActualClave]) {
                    coleccionFotos[albumActualClave] = [];
                }

                coleccionFotos[albumActualClave].push({
                    url: urlImagen,
                    titulo: "Foto subida"
                });

                localStorage.setItem("misFotosJuntos", JSON.stringify(coleccionFotos));
                renderizarFotosAlbum(albumActualClave);
            }
        });

        btnSubir.addEventListener("click", function(){
            myWidget.open();
        }, false);
    }

    renderizarPlanes();
    actualizarTextoFechaEspecial();
});

// NAVEGACIÓN
function abrirModulo(nombreModulo) {
    const menu = document.getElementById('menu-principal');

    if (nombreModulo === 'tiempo') {
        const modulo = document.getElementById('modulo-tiempo');
        if (modulo && menu) { menu.classList.add('oculto'); modulo.classList.remove('oculto'); }
    } else if (nombreModulo === 'planes') {
        const modulo = document.getElementById('modulo-planes');
        if (modulo && menu) { menu.classList.add('oculto'); modulo.classList.remove('oculto'); }
    } else if (nombreModulo === 'comienzo') {
        const modulo = document.getElementById('modulo-comienzo');
        if (modulo && menu) { menu.classList.add('oculto'); modulo.classList.remove('oculto'); }
    } else if (nombreModulo === 'fotos') {
        const modulo = document.getElementById('modulo-fotos');
        if (modulo && menu) { menu.classList.add('oculto'); modulo.classList.remove('oculto'); }
    }
}

function regresarAlMenu() {
    const menu = document.getElementById('menu-principal');
    document.querySelectorAll('.sub-seccion').forEach(sec => sec.classList.add('oculto'));
    cerrarAlbum();
    if (menu) menu.classList.remove('oculto');
}

// ÁLBUM DE FOTOS
function abrirAlbum(claveAlbum) {
    albumActualClave = claveAlbum;
    const vistaCarpetas = document.getElementById('vista-carpetas');
    const vistaAlbum = document.getElementById('vista-album');
    const tituloAlbum = document.getElementById('titulo-album-actual');

    const titulos = {
        viajes: "Nuestros Viajes ✈️",
        citas: "Citas Especiales 🍕",
        momentos: "Momentos Raros 🤪"
    };

    if (tituloAlbum) tituloAlbum.textContent = titulos[claveAlbum] || "Fotos";

    renderizarFotosAlbum(claveAlbum);

    if (vistaCarpetas && vistaAlbum) {
        vistaCarpetas.classList.add('oculto');
        vistaAlbum.classList.remove('oculto');
    }
}

function renderizarFotosAlbum(clave) {
    const galeria = document.getElementById('galeria-imagenes');
    if (!galeria) return;

    galeria.innerHTML = "";
    const fotos = coleccionFotos[clave] || [];

    fotos.forEach((foto, index) => {
        const div = document.createElement('div');
        div.className = 'contenedor-tarjeta-foto';
        div.innerHTML = `
            <img src="${foto.url}" alt="${foto.titulo}" class="tarjeta-foto" onclick="verFotoAmpliada('${foto.url}')">
            <button class="btn-borrar-foto" onclick="eliminarFoto('${clave}', ${index})" title="Borrar foto">🗑️</button>
        `;
        galeria.appendChild(div);
    });
}

function eliminarFoto(clave, index) {
    if (confirm("¿Quieres eliminar esta foto?")) {
        coleccionFotos[clave].splice(index, 1);
        localStorage.setItem("misFotosJuntos", JSON.stringify(coleccionFotos));
        renderizarFotosAlbum(clave);
    }
}

function cerrarAlbum() {
    const vistaCarpetas = document.getElementById('vista-carpetas');
    const vistaAlbum = document.getElementById('vista-album');
    if (vistaCarpetas && vistaAlbum) {
        vistaAlbum.classList.add('oculto');
        vistaCarpetas.classList.remove('oculto');
    }
}

function verFotoAmpliada(url) {
    const visor = document.getElementById('visor-modal');
    const img = document.getElementById('imagen-ampliada');
    if (visor && img) {
        img.src = url;
        visor.classList.remove('oculto');
    }
}

function cerrarVisor() {
    const visor = document.getElementById('visor-modal');
    if (visor) visor.classList.add('oculto');
}

// OTROS MÓDULOS
function actualizarTextoFechaEspecial() {
    const elemFecha = document.getElementById('fecha-comienzo-texto');
    if (elemFecha) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        elemFecha.textContent = `Nuestra fecha: ${fechaInicio.toLocaleDateString('es-ES', opciones)}`;
    }
}

function renderizarPlanes() {
    const contenedorLista = document.getElementById('lista-planes');
    if (!contenedorLista) return;

    contenedorLista.innerHTML = "";
    listaDePlanes.forEach((plan, index) => {
        const li = document.createElement('li');
        li.className = `item-plan ${plan.completado ? 'completado' : ''}`;
        li.innerHTML = `
            <span class="texto-plan">${plan.texto}</span>
            <div class="acciones-plan">
                <button class="btn-completar" onclick="togglePlan(${index})">${plan.completado ? '✅' : '✔'}</button>
                <button class="btn-eliminar" onclick="eliminarPlan(${index})">🗑️</button>
            </div>
        `;
        contenedorLista.appendChild(li);
    });
}

function togglePlan(index) {
    listaDePlanes[index].completado = !listaDePlanes[index].completado;
    guardarYRenderizarPlanes();
}

function eliminarPlan(index) {
    listaDePlanes.splice(index, 1);
    guardarYRenderizarPlanes();
}

function guardarYRenderizarPlanes() {
    localStorage.setItem("planesJuntos", JSON.stringify(listaDePlanes));
    renderizarPlanes();
}

function actualizarContador() {
    const ahora = new Date();
    const diferencia = ahora - fechaInicio;
    if (diferencia < 0) return;

    const segundosTotales = Math.floor(diferencia / 1000);
    const minutosTotales = Math.floor(segundosTotales / 60);
    const horasTotales = Math.floor(minutosTotales / 60);

    const segundos = segundosTotales % 60;
    const minutos = minutosTotales % 60;
    const horas = horasTotales % 24;

    let anos = ahora.getFullYear() - fechaInicio.getFullYear();
    let meses = ahora.getMonth() - fechaInicio.getMonth();
    let dias = ahora.getDate() - fechaInicio.getDate();

    if (dias < 0) {
        meses--;
        const ultimoMes = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
        dias += ultimoMes.getDate();
    }

    if (meses < 0) {
        anos--;
        meses += 12;
    }

    const elemAnos = document.getElementById('anos');
    const elemMeses = document.getElementById('meses');
    const elemDias = document.getElementById('dias');
    const elemHoras = document.getElementById('horas');
    const elemMinutos = document.getElementById('minutos');
    const elemSegundos = document.getElementById('segundos');

    if (elemAnos) elemAnos.textContent = anos;
    if (elemMeses) elemMeses.textContent = meses;
    if (elemDias) elemDias.textContent = dias;
    if (elemHoras) elemHoras.textContent = horas;
    if (elemMinutos) elemMinutos.textContent = minutos;
    if (elemSegundos) elemSegundos.textContent = segundos;
}