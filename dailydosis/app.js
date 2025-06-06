import { config } from 'https://josevdr95new.github.io/sw/dailydosis/config.js';
import { contentGenerators } from 'https://josevdr95new.github.io/sw/dailydosis/contentGenerators.js';

// Data storage
let dailyData = {
    lastUpdated: null,
    joke: null,
    horoscope: null,
    fact: null,
    word: null,
    riddle: null,
    number: null,
    letter: null,
    color: null
};

// Favorites storage
let favorites = {
    joke: [],
    horoscope: [],
    fact: [],
    word: [],
    riddle: [],
    number: [],
    letter: [],
    color: []
};

// DOM Elements
const menuTrigger = document.getElementById('menu-trigger');
const closeMenu = document.getElementById('close-menu');
const sideMenu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const shareButton = document.getElementById('share-button');
const viewDeveloperButton = document.getElementById('view-developer-button');
const refreshAllButton = document.getElementById('refresh-all-button');
const showRiddleAnswerBtn = document.getElementById('show-riddle-answer');
const riddleAnswer = document.getElementById('riddle-answer');
const favoriteButtons = document.querySelectorAll('.favorite-btn');
const favoritesLink = document.getElementById('favorites-link');
const homeLink = document.getElementById('home-link');
const lastUpdatedElement = document.getElementById('last-updated');

// Countdown interval
let countdownInterval;
let autoRefreshInterval;

// Menu functionality
menuTrigger.addEventListener('click', () => {
    sideMenu.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
});

closeMenu.addEventListener('click', closeMenuFunction);
overlay.addEventListener('click', closeMenuFunction);

function closeMenuFunction() {
    sideMenu.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

// Function to format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Function to calculate time remaining until next update
function calculateTimeRemaining() {
    if (!dailyData.lastUpdated) return null;
    
    const nextUpdate = dailyData.lastUpdated + config.refreshInterval;
    const now = new Date().getTime();
    return nextUpdate - now;
}

// Function to format countdown time
function formatCountdown(milliseconds) {
    if (milliseconds <= 0) return "00:00:00";
    
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to update countdown display
function updateCountdown() {
    const timeRemaining = calculateTimeRemaining();
    const countdownElement = document.getElementById('refresh-countdown');
    
    if (!timeRemaining || timeRemaining <= 0) {
        countdownElement.textContent = "¡Listo para actualizar!";
        // Trigger automatic refresh when countdown reaches zero
        updateAllContent(true);
        return;
    }
    
    countdownElement.textContent = `Próxima actualización en: ${formatCountdown(timeRemaining)}`;
}

// Start countdown timer
function startCountdown() {
    if (!countdownInterval) {
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }
}

// Function to check if content needs refresh
function shouldRefreshContent() {
    if (!dailyData.lastUpdated) return true;
    
    const now = new Date().getTime();
    const lastUpdate = dailyData.lastUpdated;
    return (now - lastUpdate) >= config.refreshInterval;
}

// Function to update all content
function updateAllContent(force = false) {
    if (force || shouldRefreshContent()) {
        // Clear existing countdown
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = null;
        
        // Generate new content while preserving existing data structure
        const newContent = {
            lastUpdated: new Date().getTime(),
            joke: contentGenerators.joke(),
            horoscope: contentGenerators.horoscope(),
            fact: contentGenerators.fact(),
            word: contentGenerators.word(),
            riddle: contentGenerators.riddle(),
            number: contentGenerators.number(),
            letter: contentGenerators.letter(),
            color: contentGenerators.color()
        };
        
        // Update dailyData without losing reference
        Object.assign(dailyData, newContent);
        
        // Save to localStorage
        localStorage.setItem('dailyData', JSON.stringify(dailyData));
        
        // Start new countdown
        startCountdown();
        
        // Update UI
        updateUI();
    }
}

// Function to update a specific content item
function updateSingleContent(contentType) {
    if (config.contentSources[contentType] && config.contentSources[contentType].refreshable) {
        dailyData[contentType] = contentGenerators[contentType]();
        dailyData.lastUpdated = new Date().getTime(); // Update timestamp
        localStorage.setItem('dailyData', JSON.stringify(dailyData));
        
        // Update only the relevant UI element
        updateContentUI(contentType);
        
        // Reset countdown
        if (countdownInterval) clearInterval(countdownInterval);
        startCountdown();
    }
}

// Function to update UI with current data
function updateUI() {
    // Update all UI elements with current data
    document.getElementById('joke-content').textContent = dailyData.joke;
    
    document.getElementById('horoscope-sign').textContent = dailyData.horoscope.sign;
    document.getElementById('horoscope-content').textContent = dailyData.horoscope.prediction;
    
    document.getElementById('fact-content').textContent = dailyData.fact;
    
    document.getElementById('word-title').textContent = dailyData.word.word;
    document.getElementById('word-definition').textContent = dailyData.word.definition;
    
    document.getElementById('riddle-question').textContent = dailyData.riddle.question;
    document.getElementById('riddle-answer').textContent = dailyData.riddle.answer;
    riddleAnswer.classList.add('hidden');
    showRiddleAnswerBtn.textContent = 'Ver respuesta';
    
    document.getElementById('lucky-number').textContent = dailyData.number;
    document.getElementById('lucky-letter').textContent = dailyData.letter;
    
    document.getElementById('color-name').textContent = dailyData.color.name;
    document.getElementById('color-hex').textContent = dailyData.color.hex;
    document.getElementById('color-sample').style.backgroundColor = dailyData.color.hex;
    
    // Update last updated date
    if (dailyData.lastUpdated) {
        lastUpdatedElement.textContent = 'Última actualización: ' + formatDate(dailyData.lastUpdated);
    }
    
    // Update favorite buttons
    updateFavoriteButtonsUI();
    
    // Update countdown
    updateCountdown();
}

// Function to update a specific UI element
function updateContentUI(contentType) {
    switch(contentType) {
        case 'joke':
            document.getElementById('joke-content').textContent = dailyData.joke;
            break;
        case 'horoscope':
            document.getElementById('horoscope-sign').textContent = dailyData.horoscope.sign;
            document.getElementById('horoscope-content').textContent = dailyData.horoscope.prediction;
            break;
        case 'fact':
            document.getElementById('fact-content').textContent = dailyData.fact;
            break;
        case 'word':
            document.getElementById('word-title').textContent = dailyData.word.word;
            document.getElementById('word-definition').textContent = dailyData.word.definition;
            break;
        case 'riddle':
            document.getElementById('riddle-question').textContent = dailyData.riddle.question;
            document.getElementById('riddle-answer').textContent = dailyData.riddle.answer;
            riddleAnswer.classList.add('hidden');
            showRiddleAnswerBtn.textContent = 'Ver respuesta';
            break;
        case 'number':
            document.getElementById('lucky-number').textContent = dailyData.number;
            break;
        case 'letter':
            document.getElementById('lucky-letter').textContent = dailyData.letter;
            break;
        case 'color':
            document.getElementById('color-name').textContent = dailyData.color.name;
            document.getElementById('color-hex').textContent = dailyData.color.hex;
            document.getElementById('color-sample').style.backgroundColor = dailyData.color.hex;
            break;
    }
    
    // Update favorite button for this content
    updateFavoriteButtonUI(contentType);
}

// Load data from localStorage if available
function loadSavedData() {
    const savedData = localStorage.getItem('dailyData');
    if (savedData) {
        dailyData = JSON.parse(savedData);
        
        // Check if data needs refresh
        if (shouldRefreshContent()) {
            updateAllContent(true); // Force refresh if data is stale
        } else {
            updateUI();
            startCountdown();
        }
    } else {
        // First load - generate all content
        updateAllContent();
    }
    
    // Load favorites
    loadFavorites();
    
    // Start auto-refresh checker
    startAutoRefreshChecker();
}

// Start interval to check for auto-refresh
function startAutoRefreshChecker() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
        if (shouldRefreshContent()) {
            updateAllContent(true);
        }
    }, 60000); // Check every minute
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Load favorites from localStorage
function loadFavorites() {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }
    updateFavoriteButtonsUI();
}

// Toggle favorite status for an item
function toggleFavorite(contentType, content) {
    if (config.contentSources[contentType] && 
        config.contentSources[contentType].favoritable === false) {
        return;
    }
    
    const contentArray = favorites[contentType];
    const index = contentArray.findIndex(item => {
        if (typeof content === 'object') {
            return JSON.stringify(item) === JSON.stringify(content);
        } else {
            return item === content;
        }
    });
    
    if (index === -1) {
        contentArray.push(content);
    } else {
        contentArray.splice(index, 1);
    }
    
    saveFavorites();
    updateFavoriteButtonUI(contentType);
}

// Check if an item is favorited
function isFavorited(contentType, content) {
    const contentArray = favorites[contentType];
    return contentArray.some(item => {
        if (typeof content === 'object') {
            return JSON.stringify(item) === JSON.stringify(content);
        } else {
            return item === content;
        }
    });
}

// Update UI for all favorite buttons
function updateFavoriteButtonsUI() {
    Object.keys(dailyData).forEach(key => {
        if (key !== 'lastUpdated') {
            updateFavoriteButtonUI(key);
        }
    });
}

// Update UI for a specific favorite button
function updateFavoriteButtonUI(contentType) {
    const button = document.querySelector(`.favorite-btn[data-card="${contentType}"]`);
    if (!button || (config.contentSources[contentType] && 
                  config.contentSources[contentType].favoritable === false)) {
        return;
    }
    
    const content = dailyData[contentType];
    const isFav = isFavorited(contentType, content);
    
    if (isFav) {
        button.classList.add('favorited');
        button.querySelector('svg path').setAttribute('fill', '#FFD700');
    } else {
        button.classList.remove('favorited');
        button.querySelector('svg path').setAttribute('fill', 'currentColor');
    }
}

// Show favorites page
function showFavorites() {
    document.querySelector('main').style.display = 'none';
    let favoritesContainer = document.getElementById('favorites-container');
    
    if (!favoritesContainer) {
        favoritesContainer = document.createElement('div');
        favoritesContainer.id = 'favorites-container';
        favoritesContainer.className = 'favorites-container';
        document.body.insertBefore(favoritesContainer, document.querySelector('footer'));
    }
    
    window.scrollTo(0, 0);
    favoritesContainer.innerHTML = '';
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" fill="currentColor"></path>
        </svg>
        Volver
    `;
    backButton.addEventListener('click', () => {
        document.querySelector('main').style.display = 'block';
        favoritesContainer.style.display = 'none';
    });
    
    favoritesContainer.appendChild(backButton);
    
    const title = document.createElement('h2');
    title.className = 'favorites-title';
    title.textContent = 'Mis Favoritos';
    favoritesContainer.appendChild(title);
    
    Object.keys(favorites).forEach(type => {
        if (favorites[type].length > 0) {
            const sectionTitle = document.createElement('h3');
            sectionTitle.className = 'favorites-section-title';
            
            switch(type) {
                case 'joke': sectionTitle.textContent = 'Chistes'; break;
                case 'horoscope': sectionTitle.textContent = 'Horóscopos'; break;
                case 'fact': sectionTitle.textContent = 'Datos Curiosos'; break;
                case 'word': sectionTitle.textContent = 'Palabras'; break;
                case 'riddle': sectionTitle.textContent = 'Adivinanzas'; break;
                case 'number': sectionTitle.textContent = 'Números'; break;
                case 'letter': sectionTitle.textContent = 'Letras'; break;
                case 'color': sectionTitle.textContent = 'Colores'; break;
                default: sectionTitle.textContent = type;
            }
            
            favoritesContainer.appendChild(sectionTitle);
            
            favorites[type].forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'card favorite-card';
                
                let cardContent = '';
                
                switch(type) {
                    case 'joke':
                    case 'fact':
                        cardContent = `<p>${item}</p>`;
                        break;
                    case 'horoscope':
                        cardContent = `<p><strong>${item.sign}</strong></p><p>${item.prediction}</p>`;
                        break;
                    case 'word':
                        cardContent = `<h3>${item.word}</h3><p>${item.definition}</p>`;
                        break;
                    case 'riddle':
                        cardContent = `<p>${item.question}</p><p><strong>Respuesta:</strong> ${item.answer}</p>`;
                        break;
                    case 'number':
                        cardContent = `<div class="number-display"><h3>${item}</h3></div>`;
                        break;
                    case 'letter':
                        cardContent = `<div class="letter-display"><h3>${item}</h3></div>`;
                        break;
                    case 'color':
                        cardContent = `<h3>${item.name}</h3><p>Hex: ${item.hex}</p><div class="color-sample" style="background-color: ${item.hex}"></div>`;
                        break;
                }
                
                cardContent += `
                    <button class="remove-favorite-btn" data-type="${type}" data-index="${index}">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" fill="currentColor"></path>
                        </svg>
                        Eliminar
                    </button>
                `;
                
                card.innerHTML = cardContent;
                favoritesContainer.appendChild(card);
            });
        }
    });
    
    if (Object.values(favorites).every(arr => arr.length === 0)) {
        const noFavorites = document.createElement('p');
        noFavorites.className = 'no-favorites';
        noFavorites.textContent = 'No tienes favoritos guardados. Añade favoritos haciendo clic en la estrella en cualquier tarjeta.';
        favoritesContainer.appendChild(noFavorites);
    }
    
    document.querySelectorAll('.remove-favorite-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.currentTarget.getAttribute('data-type');
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            
            favorites[type].splice(index, 1);
            saveFavorites();
            updateFavoriteButtonsUI();
            showFavorites();
        });
    });
    
    favoritesContainer.style.display = 'block';
    closeMenuFunction();
}

// Event Listeners
showRiddleAnswerBtn.addEventListener('click', () => {
    riddleAnswer.classList.toggle('hidden');
    showRiddleAnswerBtn.textContent = riddleAnswer.classList.contains('hidden') ? 'Ver respuesta' : 'Ocultar respuesta';
});
/*
refreshAllButton.addEventListener('click', () => {
    refreshAllButton.querySelector('svg').style.animation = 'none';
    void refreshAllButton.offsetWidth;
    refreshAllButton.querySelector('svg').style.animation = 'rotate 0.7s ease-in-out';
    updateAllContent(true);
});
*/
shareButton.addEventListener('click', () => {
    const text = encodeURIComponent(config.shareText);
    const whatsappIntentUrl = `intent://send?text=${text}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
    window.location.href = whatsappIntentUrl;
});

viewDeveloperButton.addEventListener('click', () => {
    const developerUrl = config.developerUrl;
    const chromeIntent = `intent://${developerUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = chromeIntent;
});

favoriteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const contentType = e.currentTarget.getAttribute('data-card');
        toggleFavorite(contentType, dailyData[contentType]);
    });
});

homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeMenuFunction();
    
    const favoritesContainer = document.getElementById('favorites-container');
    if (favoritesContainer) {
        favoritesContainer.style.display = 'none';
    }
    
    document.querySelector('main').style.display = 'block';
    window.scrollTo(0, 0);
    
    document.querySelectorAll('#side-menu a').forEach(link => {
        link.classList.remove('active');
    });
    homeLink.classList.add('active');
});

favoritesLink.addEventListener('click', (e) => {
    e.preventDefault();
    showFavorites();
    
    document.querySelectorAll('#side-menu a').forEach(link => {
        link.classList.remove('active');
    });
    favoritesLink.classList.add('active');
});

// CSS animation for rotate
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
`);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
});