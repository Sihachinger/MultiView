// ============== SISTEMA DE VIDEOS Y EMBED (API YOUTUBE) ==============

var players = {};
var currentVideos = {}; // Almacena la URL actual de cada celda

// Cargar favoritos al inicio
document.addEventListener('DOMContentLoaded', function() {
    loadFavorites();
});

// Carga de la API de Youtube
function onYouTubeIframeAPIReady() {
    console.log("API Lista");
}

// Detecta ID de video, short o live de la url para varios formatos de YouTube
function getVideoId(urlStr) {
    try {
        if (!urlStr) return null;
        if (!urlStr.startsWith('http')) urlStr = 'https://' + urlStr;
        const url = new URL(urlStr);
        const path = url.pathname;
        
        // youtu.be/ID
        if (url.hostname.includes('youtu.be')) return path.slice(1);  // path = /ID -> slice(1) quita la barra inicial
        
        // youtube.com/watch?v=ID
        if (url.searchParams.has('v')) return url.searchParams.get('v'); // Obtener parámetro "v" de la URL qie es el ID del video
        
        // youtube.com/live/ID, /shorts/ID, /embed/ID
        if (path.includes('/live/') || path.includes('/shorts/') || path.includes('/embed/') || path.includes('/v/')) { // Diferentes formatos de path
            const segments = path.split('/').filter(s => s !== ''); // Divide y limpia segmentos vacíos
            // Como el ID suele ser el ultimo segmento (ej: /live/XYZ123) se devuelve ese mismo
            return segments[segments.length - 1]; 
        }
    } catch (e) { return null; } // Captura errores de URL erroneos
    return null;
}

// Carga por URL manual
function loadVideo(cellId) {
    const input = document.getElementById(`input-${cellId}`);
    const errorMsg = document.getElementById(`error-${cellId}`);
    const videoId = getVideoId(input.value.trim());

    // Reset de los estilos de error
    if (videoId) {
        currentVideos[cellId] = input.value.trim(); // Guarda la URL actual
        embedPlayer(cellId, videoId, 'video');
    } else {
        showError(cellId, errorMsg, input);
    }
}

// Función Maestra de Embed
function embedPlayer(cellId, id, type) {
    const wrapper = document.getElementById(`video-wrapper-${cellId}`); // Contenedor del video
    const form = document.getElementById(`form-${cellId}`); // Formulario de entrada
    const closeBtn = document.getElementById(`close-${cellId}`); // Botón de cerrar
    const saveFavBtn = document.getElementById(`save-fav-${cellId}`); // Botón de guardar favorito

    wrapper.style.display = 'block';
    closeBtn.style.display = 'flex';
    saveFavBtn.style.display = 'block';
    form.style.display = 'none'; // Ocultar formulario al cargar el video

    // Previamente, quitar instancias existentes
    if (players[cellId]) players[cellId].destroy();

    // En caso de video normal o shorts
    if (type === 'video') {
        players[cellId] = new YT.Player(`player-${cellId}`, {
            height: '100%',
            width: '100%',
            videoId: id,
            host: 'https://www.youtube-nocookie.com', // Uso host 'youtube-nocookie.com' por la compatibilidad
            playerVars: { 
                'autoplay': 1, 
                'mute': 1, // Para que no se reproduzcan varios a la vez con sonido
                'rel': 0, 
                'origin': 'https://www.youtube.com'
            },
            events: { 'onReady': (e) => e.target.playVideo() }
        });

    // En caso de live streams por un canal
    } else if (type === 'channel') {
        // Modo CANAL: Iframe manual directo al endpoint 'live_stream'
        wrapper.innerHTML = `
            <iframe 
                id="iframe-${cellId}"
                src="https://www.youtube-nocookie.com/embed/live_stream?channel=${id}&autoplay=1&mute=1&rel=0"
                width="100%" 
                height="100%" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen>
            </iframe>`;
        players[cellId] = null;
    }
}

// Mostrar error de URL inválida 
function showError(cellId, errorMsg, input) {
    input.classList.add('border-purple-500', 'shake');
    errorMsg.classList.remove('hidden');
    setTimeout(() => input.classList.remove('shake'), 500);
}

// Reset de la celda para una nueva carga
function resetCell(cellId) {
    const wrapper = document.getElementById(`video-wrapper-${cellId}`); 
    const saveFavBtn = document.getElementById(`save-fav-${cellId}`); // Botón de guardar favorito
    
    if (players[cellId]) {
        players[cellId].destroy();
        delete players[cellId];
    }

    // Restaura el div original necesario para el funcionamiento de la API 
    wrapper.innerHTML = `<div id="player-${cellId}" class="video-placeholder"></div>`;

    wrapper.style.display = 'none';
    document.getElementById(`close-${cellId}`).style.display = 'none';
    saveFavBtn.style.display = 'none'; // Ocultar botón de guardar
    document.getElementById(`form-${cellId}`).style.display = 'block';
    
    const input = document.getElementById(`input-${cellId}`);
    input.value = '';
    delete currentVideos[cellId]; // Limpiar URL guardada
    input.focus();
}

// Permite Enter en el input para comodidad del usuario
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') loadVideo(this.id.split('-')[1]);
    });
});



// ============== SISTEMA DE FAVORITOS ==============

// Guardar favorito
function saveFavorite(cellId) {
    const url = currentVideos[cellId];
    if (!url) return;
    
    // Pedir nombre personalizado
    const name = prompt('Dele un nombre a este favorito:', 'Mi video favorito');

    if (!name) return;
    
    // Obtener favoritos del localStorage
    let favorites = JSON.parse(localStorage.getItem('ytFavorites') || '[]');
    
    // Agregar nuevo favorito
    favorites.push({ name: name.trim(), url: url });
    
    // Guardar en localStorage
    localStorage.setItem('ytFavorites', JSON.stringify(favorites));
    
    // Actualizar interfaz
    loadFavorites();
    
    // Feedback visual
    const btn = document.getElementById(`save-fav-${cellId}`);
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Guardado';
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
}

// Cargar y mostrar favoritos
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('ytFavorites') || '[]');
    
    // Actualizar cada celda
    for (let i = 1; i <= 4; i++) {
        const container = document.getElementById(`favorites-${i}`);
        if (!container) continue;
        
        if (favorites.length === 0) {
            container.innerHTML = '<div class="empty-favorites">No hay favoritos</div>';
        } else {
            // mapeo de los favoritos y creación de los botones "favorite-item" y "delete-favorite"
            container.innerHTML = favorites.map((fav, index) => ` 
                <div class="favorite-item">
                    <button class="favorite-btn" onclick="loadFromFavorite(${i}, '${fav.url.replace(/'/g, "\\'")}')" title="${fav.url}"> 
                        ${fav.name}
                    </button>
                    <button class="delete-favorite" onclick="deleteFavorite(${index})" title="Eliminar">
                        ✕
                    </button>
                </div>
            `).join('');
        }
    }
}

// Cargar video desde favorito al apretar
function loadFromFavorite(cellId, url) {
    const input = document.getElementById(`input-${cellId}`);
    input.value = url;
    currentVideos[cellId] = url;
    
    const videoId = getVideoId(url);
    if (videoId) {
        embedPlayer(cellId, videoId, 'video');
    }
}


// Eliminar favorito
function deleteFavorite(index) {
    if (!confirm('¿Esta seguro de eliminar este favorito?')) return;
    
    let favorites = JSON.parse(localStorage.getItem('ytFavorites') || '[]');
    favorites.splice(index, 1);
    localStorage.setItem('ytFavorites', JSON.stringify(favorites));
    
    loadFavorites();
}

