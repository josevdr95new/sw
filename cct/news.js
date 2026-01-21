// news.js
const loadNews = async (forceRefresh = false) => {
  const newsContainer = document.getElementById('newsContainer');
  newsContainer.innerHTML = '<p>Cargando noticias...</p>';

  try {
    // Crear contenedor del botón
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.innerHTML = `
      <button class="refresh-button" id="refreshNewsButton" onclick="forceRefreshNews()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Actualizar
      </button>
    `;

    const rssUrl = 'https://es.cointelegraph.com/rss';
    let proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
    
    // Añadir timestamp solo si es una actualización forzada
    if (forceRefresh) {
      proxyUrl += `&timestamp=${new Date().getTime()}`;
    }

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
    }

    const rssText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, "text/xml");

    const errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
      throw new Error('El contenido del RSS no es un XML válido.');
    }

    const items = xmlDoc.querySelectorAll("item");
    newsContainer.innerHTML = '';
    
    // Añadir botón antes de las noticias
    newsContainer.appendChild(buttonContainer);

    items.forEach(item => {
      const title = item.querySelector("title").textContent;
      const link = item.querySelector("link").textContent;
      const description = item.querySelector("description").textContent;
      const pubDate = item.querySelector("pubDate").textContent;

      const date = new Date(pubDate);
      const formattedDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';
      newsItem.innerHTML = `
        <div class="news-title">${title}</div>
        <div class="news-date">${formattedDate}</div>
        <div class="news-description">${description}</div>
        <a class="news-link" href="intent://${link.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end" target="_blank">Leer más...</a>
      `;
      newsContainer.appendChild(newsItem);
    });
  } catch (error) {
    console.error('Error cargando noticias:', error);
    newsContainer.innerHTML = `
      <div class="error-container">
        <p class="error-message">Error al cargar las noticias. Inténtalo de nuevo.</p>
        <button class="retry-button" onclick="forceRefreshNews()"> <!-- Cambiado a forceRefreshNews() -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Reintentar
        </button>
      </div>
    `;
  }
};

// Función para forzar la actualización ignorando la caché
const forceRefreshNews = async () => {
  const refreshButton = document.getElementById('refreshNewsButton');
  const newsContainer = document.getElementById('newsContainer');
  
  try {
    // Mostrar estado de carga
    if (refreshButton) {
      refreshButton.classList.add('loading');
      refreshButton.disabled = true;
    }
    
    // Cambiar mensaje durante actualización
    newsContainer.innerHTML = '<p>Actualizando noticias...</p>';
    
    // Forzar recarga ignorando caché
    await loadNews(true);
  } catch (error) {
    console.error('Error al actualizar:', error);
    newsContainer.innerHTML = `
      <div class="error-container">
        <p class="error-message">Error al actualizar las noticias.</p>
        <button class="retry-button" onclick="forceRefreshNews()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Reintentar
        </button>
      </div>
    `;
  } finally {
    if (refreshButton) {
      refreshButton.classList.remove('loading');
      refreshButton.disabled = false;
    }
  }
};

const showNewsModal = () => {
  showModal('news');
  // Carga inicial usa caché
  loadNews(false);
};

const loadAppNews = async () => {
  const appNewsContainer = document.getElementById('appNewsContainer');
  appNewsContainer.innerHTML = '<p>Cargando noticias...</p>';

  try {
    const response = await fetch('https://josevdr95new.github.io/sw/cct/msgserver.json');
    const text = await response.text();
    const messages = JSON.parse(text);

    messages.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const recentMessages = messages.slice(0, 5);
    appNewsContainer.innerHTML = '';

    recentMessages.forEach((item, index) => {
      const newsItem = document.createElement('div');
      newsItem.className = 'app-news-item';
      newsItem.innerHTML = `
        ${item.img ? `<img src="${item.img}" alt="Noticia">` : ''}
        <div class="app-news-content">
          <div class="news-date">${item.fecha}</div>
          <h4>${item.titulo || 'Noticia'}</h4>
          <p>${item.descripcion}</p>
          ${item.enlace && item.enlace.trim() !== '' ? `<a href="intent://${item.enlace.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end" target="_blank">Clic para descargar...</a>` : ''}
        </div>
      `;
      appNewsContainer.appendChild(newsItem);

      if (index < recentMessages.length - 1) {
        const separator = document.createElement('hr');
        separator.className = 'news-separator';
        appNewsContainer.appendChild(separator);
      }
    });
  } catch (error) {
    console.error('Error cargando noticias de la app:', error);
    appNewsContainer.innerHTML = `
      <div class="error-container">
        <p class="error-message">Error al cargar las noticias de la app.</p>
        <button class="retry-button" onclick="loadAppNews()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Reintentar
        </button>
      </div>
    `;
  }
};

// Exportar funciones al ámbito global
window.loadNews = loadNews;
window.showNewsModal = showNewsModal;
window.loadAppNews = loadAppNews;
window.forceRefreshNews = forceRefreshNews;