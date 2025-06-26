/**
 * utility.js
 * * Contains shared functions used across the entire site,
 * such as dynamic component loading and navbar initialization.
 */

/**
 * Fetches HTML content from a file and injects it into a placeholder element.
 * @param {string} url - The URL of the HTML component to fetch.
 * @param {string} placeholderId - The ID of the element to inject the HTML into.
 * @returns {Promise} A promise that resolves when the component is loaded.
 */
export async function loadComponent(url, placeholderId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Could not load ${url}: ${response.statusText}`);
        }
        const text = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = text;
        } else {
            console.error(`Placeholder with ID #${placeholderId} not found.`);
        }
    } catch (error) {
        console.error(`Error loading component: ${error}`);
    }
}

/**
 * Attaches event listeners for the mobile navbar, including the hamburger
 * button and logic to close the menu when clicking outside of it.
 */
export function initializeNavbar() {
    const hamburgerButton = document.getElementById('hamburger-button');
    const menu = document.getElementById('menu');
    const body = document.body;

    if (hamburgerButton && menu) {
        // Listener to toggle the menu
        hamburgerButton.addEventListener('click', () => {
            menu.classList.toggle('hidden');
            body.classList.toggle('menu-is-open');
        });

        // Add a listener to the whole document to close the menu
        document.addEventListener('click', (e) => {
            // Check if the menu is open
            const isMenuOpen = !menu.classList.contains('hidden');
            
            // Check if the click was inside the menu or on the hamburger button
            const isClickInsideMenu = menu.contains(e.target);
            const isClickOnButton = hamburgerButton.contains(e.target);

            // If the menu is open and the click was outside of both the menu and the button, close it
            if (isMenuOpen && !isClickInsideMenu && !isClickOnButton) {
                menu.classList.add('hidden');
                body.classList.remove('menu-is-open');
            }
        });
    }
}