class Navigation {
    constructor() {
        this.navItems = [
            { id: 'nav-home', path: '/stats', icon: 'stats', label: 'Статистика' },
            { id: 'nav-map', path: '/map', icon: 'glass', label: 'Инспекция' },
            { id: 'nav-chat', path: '/chat', icon: 'chat', label: 'Чат' },
            { id: 'nav-profile', path: '/profile', icon: 'profile', label: 'Профиль' }
        ];
    }

    render() {
        const navContainer = document.getElementById('nav-container');
        if (!navContainer) return;

        navContainer.innerHTML = `
            <nav class="bottom-nav">
                ${this.navItems.map(item => `
                    <div class="nav-item" id="${item.id}">
                        <img class="nav-icon" src="/media/images/icons/${item.icon}.png" alt="${item.label}">
                        <span>${item.label}</span>
                    </div>
                `).join('')}
            </nav>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        this.navItems.forEach(item => {
            const navElement = document.getElementById(item.id);
            if (navElement) {
                navElement.addEventListener('click', () => {
                    this.navigateTo(item.path);
                });
            }
        });
    }

    navigateTo(path) {
        if (path === '/stats') {
            window.location.href = 'stats.html';
        } else if (path === '/chat') {
            window.location.href = 'chat.html';
        } else if (path === '/map') {
            window.location.href = 'map.html';
        } else if (path === '/profile') {
            window.location.href = 'profile.html';
        }
    }

    setCurrentActive() {
        const currentPath = window.location.pathname;
        this.navItems.forEach(item => {
            const navElement = document.getElementById(item.id);
            if (navElement) {
                if (currentPath.includes(item.path.replace('/', ''))) {
                    navElement.classList.add('active');
                } else {
                    navElement.classList.remove('active');
                }
            }
        });
    }
}