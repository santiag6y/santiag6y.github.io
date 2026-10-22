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

// FOTOS COMPARTIDAS
// Las imágenes se guardan en Cloudinary y la LISTA de fotos en una base de datos
// gratuita (Supabase), así se ven iguales en cualquier celular o PC y se pueden borrar.
// Pega aquí los datos de tu proyecto de Supabase (ver LEEME-SUPABASE.md):
const SUPABASE_URL = "https://supabase.com/dashboard/project/ckttbjktidpelzpwlsxt";      // ej: https://abcdxyz.supabase.co
const SUPABASE_KEY = "sb_publishable_XMXAsAPwIPaJJy_mrJEACg_TIKzm2VN";  // la clave "publishable" o "anon"

let myWidget = null;

function supabaseConfigurado() {
    return SUPABASE_URL.startsWith("https://") && !SUPABASE_KEY.startsWith("PEGA_");
}

function cabecerasDB(extra) {
    const h = { "apikey": SUPABASE_KEY, "Content-Type": "application/json" };
    if (SUPABASE_KEY.startsWith("eyJ")) h["Authorization"] = "Bearer " + SUPABASE_KEY;
    return Object.assign(h, extra || {});
}

function urlFoto(foto, transformacion) {
    const t = transformacion ? transformacion + "/" : "";
    return "https://res.cloudinary.com/" + cloudName + "/image/upload/" + t +
           "v" + foto.version + "/" + foto.public_id + "." + foto.format;
}

async function guardarFotoEnDB(album, info) {
    const resp = await fetch(SUPABASE_URL + "/rest/v1/fotos", {
        method: "POST",
        headers: cabecerasDB({ "Prefer": "return=minimal" }),
        body: JSON.stringify({
            album: album,
            public_id: info.public_id,
            version: info.version,
            format: info.format
        })
    });
    if (!resp.ok) throw new Error("No se pudo guardar la foto (" + resp.status + ")");
}

async function borrarFotoDeDB(id) {
    const resp = await fetch(SUPABASE_URL + "/rest/v1/fotos?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        headers: cabecerasDB()
    });
    if (!resp.ok) throw new Error("No se pudo borrar (" + resp.status + ")");
}

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
        myWidget = cloudinary.createUploadWidget({
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            sources: ['local', 'camera', 'url'],
            multiple: true,
            maxFiles: 10
        }, async (error, result) => {
            if (!error && result && result.event === "success") {
                const albumDeEstaFoto = albumActualClave;
                try {
                    await guardarFotoEnDB(albumDeEstaFoto, result.info);
                    if (albumDeEstaFoto === albumActualClave) renderizarFotosAlbum(albumActualClave);
                } catch (e) {
                    alert("La foto se subió pero no se pudo guardar en la lista: " + e.message);
                }
            }
        });

        btnSubir.addEventListener("click", function () {
            if (!supabaseConfigurado()) {
                alert("Falta configurar Supabase en js/main.js (mira LEEME-SUPABASE.md).");
                return;
            }
            myWidget.open();
        }, false);
    }

    // Refrescar la galería al volver a la pestaña / app
    document.addEventListener("visibilitychange", function () {
        const vistaAlbum = document.getElementById('vista-album');
        if (!document.hidden && vistaAlbum && !vistaAlbum.classList.contains('oculto')) {
            renderizarFotosAlbum(albumActualClave);
        }
    });
    // ...y cada 30 s mientras está abierto un álbum
    setInterval(function () {
        const vistaAlbum = document.getElementById('vista-album');
        if (!document.hidden && vistaAlbum && !vistaAlbum.classList.contains('oculto')) {
            renderizarFotosAlbum(albumActualClave);
        }
    }, 30000);

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

async function renderizarFotosAlbum(clave) {
    const galeria = document.getElementById('galeria-imagenes');
    if (!galeria) return;

    if (!supabaseConfigurado()) {
        galeria.innerHTML = '<p class="msg-galeria">Falta configurar Supabase en js/main.js (mira LEEME-SUPABASE.md).</p>';
        return;
    }

    if (!galeria.children.length) galeria.innerHTML = '<p class="msg-galeria">Cargando fotos…</p>';

    let fotos = [];
    try {
        const resp = await fetch(SUPABASE_URL + "/rest/v1/fotos?select=*&album=eq." +
            encodeURIComponent(clave) + "&order=created_at.desc", { headers: cabecerasDB() });
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        fotos = await resp.json();
    } catch (e) {
        if (clave === albumActualClave && !galeria.querySelector('.tarjeta-foto')) {
            galeria.innerHTML = '<p class="msg-galeria">No se pudo cargar la galería. Revisa tu conexión o la configuración de Supabase.</p>';
        }
        return;
    }

    // Si el usuario cambió de álbum mientras cargaba, no pintar
    if (clave !== albumActualClave) return;

    galeria.innerHTML = "";

    if (fotos.length === 0) {
        galeria.innerHTML = '<p class="msg-galeria">Aún no hay fotos aquí. ¡Sube la primera! 📷</p>';
        return;
    }

    fotos.forEach(foto => {
        const div = document.createElement('div');
        div.className = 'contenedor-tarjeta-foto';

        const img = document.createElement('img');
        img.className = 'tarjeta-foto';
        img.loading = 'lazy';
        img.alt = 'Foto';
        img.src = urlFoto(foto, 'c_fill,w_300,h_300,q_auto,f_auto');
        img.addEventListener('click', () => verFotoAmpliada(urlFoto(foto, 'q_auto,f_auto,w_1600')));

        const btn = document.createElement('button');
        btn.className = 'btn-borrar-foto';
        btn.title = 'Borrar foto';
        btn.textContent = '🗑️';
        btn.addEventListener('click', () => eliminarFoto(clave, foto.id));

        div.appendChild(img);
        div.appendChild(btn);
        galeria.appendChild(div);
    });
}

async function eliminarFoto(clave, id) {
    if (!confirm("¿Quieres eliminar esta foto? Se borrará para los dos.")) return;
    try {
        await borrarFotoDeDB(id);
        renderizarFotosAlbum(clave);
    } catch (e) {
        alert(e.message);
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