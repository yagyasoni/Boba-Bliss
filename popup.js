document.addEventListener('DOMContentLoaded', function() {
    const themes = [
        {
            name: 'Matcha Latte',
            colors: {
                background: 'rgb(230, 245, 210)', // Light Matcha Green
                text: 'rgb(50, 90, 45)',          // Dark Matcha Green
                accent: 'rgb(120, 150, 100)'      // Pale Green
            },
            backgroundImage: 'images/matcha-latte.png'
        },
        {
            name: 'Taro Latte',
            colors: {
                background: 'rgb(235, 220, 240)', // Light Purple Taro
                text: 'rgb(90, 60, 110)',         // Deep Taro Purple
                accent: 'rgb(200, 150, 180)'      // Soft Pinkish-Purple
            },
            backgroundImage: 'images/taro-latte.png'
        },
        {
            name: 'Brown Sugar Boba',
            colors: {
                background: 'rgb(220, 200, 180)', // Warm Caramel Beige
                text: 'rgb(70, 40, 20)',          // Rich Brown Sugar
                accent: 'rgb(40, 20, 10)'         // Darker Brown
            },
            backgroundImage: 'images/brown-sugar-boba.png'
        },
     
    ];

    const themeContainer = document.getElementById('themeContainer');
    const statusElement = document.getElementById('status');

    function showStatus(message) {
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        setTimeout(() => statusElement.style.display = 'none', 2000);
    }

    function applyTheme(theme) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: applyThemeToPage,
                args: [theme]
            }, () => {
                if (chrome.runtime.lastError) {
                    showStatus('Error: Cannot apply theme to this page');
                } else {
                    showStatus(`${theme.name} applied!`);
                    chrome.storage.local.set({ selectedTheme: theme });

                    document.querySelectorAll('.theme-card').forEach(card => {
                        card.classList.remove('selected');
                        if (card.dataset.themeName === theme.name) {
                            card.classList.add('selected');
                        }
                    });
                }
            });
        });
    }

    function applyThemeToPage(theme) {
        // Reset all relevant styles to ensure a clean slate
        document.body.style.background = 'none'; // Clear previous background
        document.body.style.backgroundImage = 'none'; // Clear old image
        document.body.style.backgroundColor = ''; // Reset background color
        document.body.style.color = ''; // Reset text color

        // Reset link colors by removing inline styles
        document.querySelectorAll('a').forEach(link => {
            link.style.color = ''; // Clear previous accent color
        });

        // Ensure the html and body elements match Chrome's viewport
        document.documentElement.style.height = '200vh';
        document.documentElement.style.width = '100vw';
        document.body.style.height = '100%';
        document.body.style.width = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        // document.body.style.minHeight = '100vh';

        // Apply background color as a fallback and to fill empty space
        document.body.style.backgroundColor = theme.colors.background;

        // Apply new background image
        document.body.style.backgroundImage = `url('${chrome.runtime.getURL(theme.backgroundImage)}')`;
        document.body.style.backgroundSize = '100% 100%'; // Stretch to fit viewport
        document.body.style.backgroundPosition = 'center'; // Center the image
        document.body.style.backgroundRepeat = 'no-repeat'; // Prevent tiling
        document.body.style.backgroundAttachment = 'scroll'; // Match Chrome's scroll behavior

        // Apply text color to body and all text elements
        document.body.style.color = theme.colors.text;
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        textElements.forEach(element => {
            element.style.color = theme.colors.text; // Apply to all common text elements
        });

        // Apply accent color to links
        document.querySelectorAll('a').forEach(link => {
            link.style.color = theme.colors.accent;
        });

        // Force a reflow to ensure all changes take effect
        document.body.offsetHeight; // Trigger reflow
    }

    themes.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'theme-card';
        card.dataset.themeName = theme.name;
        card.textContent = theme.name;
    card.addEventListener('click', () => applyTheme(theme));
        themeContainer.appendChild(card);
    });

    chrome.storage.local.get('selectedTheme', (data) => {
        if (data.selectedTheme) {
            const selectedCard = document.querySelector(`.theme-card[data-theme-name="${data.selectedTheme.name}"]`);
            if (selectedCard) selectedCard.classList.add('selected');
        }
    });
});