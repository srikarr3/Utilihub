// Theme functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

// Function to make a call to our backend API
async function callMcpApi(endpoint, data) {
    try {
        // Show loading indicator in the appropriate result container
        const resultId = getResultContainerId(endpoint);
        if (resultId) {
            showLoadingIndicator(resultId);
        }
        
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return { error: error.message };
    }
}

// Helper to map endpoints to result container IDs
function getResultContainerId(endpoint) {
    const mapping = {
        'ask': 'gemini-result',
        'creative': 'creative-result',
        'analyze': 'analysis-result',
        'calculate': 'calc-result',
        'define': 'dict-result',
        'shorten': 'url-result',
        'createNote': 'note-result',
        'stats': 'stats-result'
    };
    return mapping[endpoint];
}

// Display a loading indicator in the result container
function showLoadingIndicator(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

// Function to trigger confetti effect
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Display results in the appropriate container
function displayResult(containerId, result) {
    const container = document.getElementById(containerId);
    
    // Add the copy button back
    const copyButton = `<button class="copy-btn" onclick="copyToClipboard('${containerId}')">
                            <i class="fas fa-copy"></i>
                        </button>`;
    
    if (result.error) {
        container.innerHTML = `${copyButton}<div class="text-danger"><i class="fas fa-exclamation-circle me-2"></i> Error: ${result.error}</div>`;
        return;
    }
    
    container.innerHTML = `${copyButton}${result.text || JSON.stringify(result, null, 2)}`;
    
    // Add animation for new content
    container.classList.add('new-content');
    setTimeout(() => {
        container.classList.remove('new-content');
    }, 1000);

    // Trigger confetti for successful calculations
    if (containerId === 'calc-result' && !result.error) {
        triggerConfetti();
    }
}

// Input validation functions
function validateNonEmptyInput(inputId, resultId, errorMessage) {
    const value = document.getElementById(inputId).value.trim();
    if (!value) {
        displayResult(resultId, { error: errorMessage || 'This field is required' });
        return false;
    }
    return value;
}

// Update temperature value display
document.getElementById('gemini-temperature').addEventListener('input', function() {
    document.getElementById('temperature-value').textContent = this.value;
});

// Add visual feedback for form inputs
document.querySelectorAll('.form-control, .form-select').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('input-active');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('input-active');
    });
});

// Gemini Ask tool
async function askGemini() {
    const prompt = validateNonEmptyInput('gemini-prompt', 'gemini-result', 'Please enter a question or prompt');
    if (!prompt) return;
    
    const temperature = parseFloat(document.getElementById('gemini-temperature').value);
    const maxTokens = parseInt(document.getElementById('gemini-max-tokens').value);
    
    const result = await callMcpApi('ask', { 
        prompt,
        temperature,
        maxTokens
    });
    
    displayResult('gemini-result', result);
}

// Gemini Creative Content tool
async function generateCreativeContent() {
    const topic = validateNonEmptyInput('creative-topic', 'creative-result', 'Please enter a topic or title');
    if (!topic) return;
    
    const type = document.getElementById('creative-type').value;
    const style = document.getElementById('creative-style').value;
    
    // Add style indicator to result container
    const styleText = style ? `Style: <span class="badge bg-primary">${style}</span> ` : '';
    showLoadingIndicator('creative-result');
    
    const result = await callMcpApi('creative', { 
        topic,
        type,
        style
    });
    
    // Add style indicator to the result if a style was selected
    if (result.text && style) {
        result.text = `<div class="style-indicator mb-3">${styleText}</div>${result.text}`;
    }
    
    displayResult('creative-result', result);
}

// Initialize creative content style dropdown with visual indicators
document.addEventListener('DOMContentLoaded', function() {
    const styleDropdown = document.getElementById('creative-style');
    if (styleDropdown) {
        // Add event listener for style selection
        styleDropdown.addEventListener('change', function() {
            const selectedStyle = this.value;
            const resultContainer = document.getElementById('creative-result');
            
            // Update the UI to reflect the selected style
            if (selectedStyle) {
                resultContainer.setAttribute('data-style', selectedStyle);
            } else {
                resultContainer.removeAttribute('data-style');
            }
        });
    }
});

// Gemini Text Analysis tool
async function analyzeText() {
    const text = validateNonEmptyInput('analysis-text', 'analysis-result', 'Please enter text to analyze');
    if (!text) return;
    
    const analysisType = document.getElementById('analysis-type').value;
    
    const result = await callMcpApi('analyze', { 
        text,
        analysisType
    });
    
    displayResult('analysis-result', result);
}

// Dictionary tool
async function defineWord() {
    const word = validateNonEmptyInput('dict-word', 'dict-result', 'Please enter a word');
    if (!word) return;
    
    const result = await callMcpApi('define', { word });
    displayResult('dict-result', result);
}

// URL shortener tool
async function shortenURL() {
    const url = validateNonEmptyInput('url-input', 'url-result', 'Please enter a URL');
    if (!url) return;
    
    // URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        displayResult('url-result', { error: 'URL must start with http:// or https://' });
        return;
    }
    
    const result = await callMcpApi('shorten', { url });
    displayResult('url-result', result);
}

// Note creation tool
async function createNote() {
    const title = validateNonEmptyInput('note-title', 'note-result', 'Please enter a title');
    if (!title) return;
    
    const content = validateNonEmptyInput('note-content', 'note-result', 'Please enter content');
    if (!content) return;
    
    const result = await callMcpApi('createNote', { title, content });
    displayResult('note-result', result);
}

// Statistics tool
async function calculateStats() {
    const numbersInput = validateNonEmptyInput('stats-numbers', 'stats-result', 'Please enter numbers');
    if (!numbersInput) return;
    
    // Parse numbers from comma-separated string
    const numbersArray = numbersInput.split(',')
        .map(n => n.trim())
        .filter(n => n)
        .map(n => parseFloat(n));
    
    if (numbersArray.length === 0 || numbersArray.some(isNaN)) {
        displayResult('stats-result', { error: 'Please enter valid numbers separated by commas' });
        return;
    }
    
    const result = await callMcpApi('stats', { numbers: numbersArray });
    displayResult('stats-result', result);
}

// Add enter key press event handlers for text inputs
document.addEventListener('DOMContentLoaded', function() {
    // Gemini prompt
    const geminiPrompt = document.getElementById('gemini-prompt');
    if (geminiPrompt) {
        geminiPrompt.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                askGemini();
            }
        });
    }
    
    // Dictionary
    const dictWord = document.getElementById('dict-word');
    if (dictWord) {
        dictWord.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                defineWord();
            }
        });
    }
    
    // URL shortener
    const urlInput = document.getElementById('url-input');
    if (urlInput) {
        urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                shortenURL();
            }
        });
    }
    
    // Statistics
    const statsNumbers = document.getElementById('stats-numbers');
    if (statsNumbers) {
        statsNumbers.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateStats();
            }
        });
    }
    
    // Add tooltip hints
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.setAttribute('title', 'Press Ctrl+Enter to submit');
    });
});

// Add custom CSS for animations
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .new-content {
            animation: highlight 1s ease-out;
        }
        
        @keyframes highlight {
            0% { background-color: rgba(99, 102, 241, 0.2); }
            100% { background-color: #f1f5f9; }
        }
        
        .input-active {
            transition: all 0.3s ease;
            transform: translateY(-2px);
        }
        
        .copy-btn {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .result-container:hover .copy-btn {
            opacity: 1;
        }

        /* Dark mode specific styles */
        body.dark-mode {
            background-color: #121212;
            color: #e0e0e0;
        }
        
        body.dark-mode .navbar {
            background-color: #1e1e1e;
        }
        
        body.dark-mode .tool-card {
            background-color: #1e1e1e;
            border-color: #333;
        }
        
        body.dark-mode .card {
            background-color: #1e1e1e;
            border-color: #333;
        }
        
        body.dark-mode .card-header {
            background-color: #2a2a2a;
            border-color: #333;
        }
        
        body.dark-mode .form-control, 
        body.dark-mode .form-select {
            background-color: #2a2a2a;
            border-color: #444;
            color: #e0e0e0;
        }
        
        body.dark-mode .btn-outline-secondary {
            color: #e0e0e0;
            border-color: #555;
        }
        
        body.dark-mode .btn-outline-secondary:hover {
            background-color: #333;
        }
        
        body.dark-mode .alert-info {
            background-color: #1a3a4a;
            color: #9ee7ff;
            border-color: #194a5d;
        }
        
        body.dark-mode footer {
            background-color: #1a1a1a;
        }
        
        /* Animation for theme toggle */
        #theme-toggle {
            transition: transform 0.3s ease;
        }
        
        #theme-toggle:hover {
            transform: rotate(15deg);
        }
    `;
    document.head.appendChild(style);
});

// Function to copy text to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    
    // Create a temporary textarea to hold the text
    const textarea = document.createElement('textarea');
    textarea.value = element.innerText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Show a brief confirmation
    const copyBtn = element.querySelector('.copy-btn');
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
    }, 2000);
}

// Toggle high contrast mode
function toggleHighContrast() {
    const body = document.body;
    const isHighContrast = body.classList.toggle('high-contrast-mode');
    localStorage.setItem('highContrast', isHighContrast);
    
    // Update high contrast toggle button
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    if (highContrastToggle) {
        highContrastToggle.setAttribute('aria-pressed', isHighContrast);
    }
    
    // Announce mode change to screen readers
    const announcement = document.createElement('div');
    announcement.className = 'visually-hidden';
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = `High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`;
    document.body.appendChild(announcement);
    
    // Remove the announcement after it's been read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 3000);
}

// Function to initialize accessibility features
function initAccessibility() {
    // Add high contrast toggle to theme dropdown
    const themeDropdown = document.querySelector('.navbar-nav .dropdown-menu');
    if (themeDropdown) {
        const highContrastItem = document.createElement('li');
        highContrastItem.innerHTML = `
            <a class="dropdown-item" href="#" id="high-contrast-toggle" role="button" aria-pressed="false">
                <i class="fas fa-adjust me-2" aria-hidden="true"></i> High Contrast Mode
            </a>
        `;
        themeDropdown.appendChild(highContrastItem);
        
        // Add event listener
        document.getElementById('high-contrast-toggle').addEventListener('click', function(e) {
            e.preventDefault();
            toggleHighContrast();
        });
    }
    
    // Add focus styles for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
        .high-contrast-mode {
            --hc-bg-color: #000000;
            --hc-text-color: #ffffff;
            --hc-link-color: #ffff00;
            --hc-border-color: #ffffff;
            --hc-button-bg: #ffffff;
            --hc-button-text: #000000;
            --hc-focus-outline: 3px solid #ffff00;
        }
        
        .high-contrast-mode {
            background-color: var(--hc-bg-color);
            color: var(--hc-text-color);
        }
        
        .high-contrast-mode a {
            color: var(--hc-link-color);
        }
        
        .high-contrast-mode .navbar,
        .high-contrast-mode .card,
        .high-contrast-mode .card-header,
        .high-contrast-mode footer {
            background-color: var(--hc-bg-color);
            border-color: var(--hc-border-color);
        }
        
        .high-contrast-mode .form-control,
        .high-contrast-mode .form-select {
            background-color: var(--hc-bg-color);
            color: var(--hc-text-color);
            border: 2px solid var(--hc-border-color);
        }
        
        .high-contrast-mode .btn {
            border: 2px solid var(--hc-border-color);
        }
        
        .high-contrast-mode .btn-primary {
            background-color: var(--hc-button-bg);
            color: var(--hc-button-text);
        }
        
        .high-contrast-mode *:focus {
            outline: var(--hc-focus-outline);
        }
        
        .high-contrast-mode *:focus-visible {
            outline: var(--hc-focus-outline);
        }
    `;
    document.head.appendChild(style);
    
    // Initialize high contrast mode if previously enabled
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast-mode');
        const highContrastToggle = document.getElementById('high-contrast-toggle');
        if (highContrastToggle) {
            highContrastToggle.setAttribute('aria-pressed', 'true');
        }
    }
}

// Add initialization on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    initAccessibility();
});

// Weather API integration
async function getWeatherData(city) {
    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return {
            temperature: data.main.temp,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Function to display weather data
function displayWeatherData(weatherData) {
    const weatherContainer = document.getElementById('weather-container');
    if (!weatherContainer) return;

    weatherContainer.innerHTML = `
        <div class="weather-card">
            <h3>Weather Information</h3>
            <p>Temperature: ${weatherData.temperature}°C</p>
            <p>Description: ${weatherData.description}</p>
            <p>Humidity: ${weatherData.humidity}%</p>
            <p>Wind Speed: ${weatherData.windSpeed} m/s</p>
        </div>
    `;
}

// Weather functionality
document.addEventListener('DOMContentLoaded', () => {
    const weatherSearch = document.querySelector('.weather-search');
    const weatherData = document.querySelector('.weather-data');
    const errorMessage = document.querySelector('.error-message');
    const cityInput = document.querySelector('.weather-search input');
    const getWeatherBtn = document.querySelector('.weather-search button');

    getWeatherBtn.addEventListener('click', getWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            getWeather();
        }
    });

    async function getWeather() {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name');
            return;
        }

        try {
            const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch weather data');
            }

            displayWeather(data);
        } catch (error) {
            showError(error.message);
        }
    }

    function displayWeather(data) {
        const weatherCard = document.querySelector('.weather-card');
        const weatherDetails = document.querySelector('.weather-details');

        // Update city name
        weatherCard.querySelector('h2').textContent = data.city;

        // Update weather details
        const details = [
            { icon: '🌡️', label: 'Temperature', value: `${data.temperature}°C` },
            { icon: '💧', label: 'Humidity', value: `${data.humidity}%` },
            { icon: '💨', label: 'Wind Speed', value: `${data.windSpeed} km/h` },
            { icon: '☁️', label: 'Description', value: data.description }
        ];

        weatherDetails.innerHTML = details.map(detail => `
            <div class="weather-detail">
                <span>${detail.icon}</span>
                <div>
                    <div class="label">${detail.label}</div>
                    <div class="value">${detail.value}</div>
                </div>
            </div>
        `).join('');

        // Show weather data and hide error message
        weatherData.style.display = 'block';
        errorMessage.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'flex';
        weatherData.style.display = 'none';
    }
});

function updateAvailableTools(tools) {
    const toolsList = document.getElementById('tools-list');
    toolsList.innerHTML = '';

    const toolLinks = {
        'addTwoNumbers': '/pages/calculator.html',
        'defineWord': '/pages/dictionary.html',
        'shortenURL': '/pages/shorturl.html',
        'createNote': '/pages/notes.html',
        'calculateStats': '/pages/stats.html',
        'getWeather': '/pages/weather.html',
        'convertCurrency': '/pages/currency.html',
        'askGemini': '/pages/ai.html',
        'createContent': '/pages/ai.html',
        'analyzeText': '/pages/ai.html'
    };

    tools.forEach(tool => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = toolLinks[tool.name] || '#';
        link.className = 'dropdown-item';
        link.textContent = tool.description;
        listItem.appendChild(link);
        toolsList.appendChild(listItem);
    });
}