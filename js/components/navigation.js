class Navigation {
    constructor(containerId = 'nav-container') {
        this.containerId = containerId;
        this.buttons = [
            { id: 'btn-stats', icon: '/media/images/icons/stats.png', text: 'Статистика', route: '/stats' },
            { id: 'btn-inspect', icon: '/media/images/icons/glass.png', text: 'Инспекция', route: '/inspect' },
            { id: 'btn-chat', icon: '/media/images/icons/chat.png', text: 'Чат', route: '/chat' },
            { id: 'btn-profile', icon: '/media/images/icons/profile.png', text: 'Аккаунт', route: '/profile' }
        ];
    }
    

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    getHTML() {
        return `
            <nav class="bottom-nav">
                ${this.buttons.map(btn => `
                    <button class="nav-btn" id="${btn.id}" data-route="${btn.route}">
                        <img class="nav-icon" src="${btn.icon}"></img>
                        <span class="nav-text">${btn.text}</span>
                    </button>
                `).join('')}
            </nav>
        `;
    }

    attachEventListeners() {
        this.buttons.forEach(btn => {
            const button = document.getElementById(btn.id);
            if (button) {
                button.addEventListener('click', () => {
                    this.handleNavigation(btn.route);
                });
            }
        });
    }

    handleNavigation(route) {
        // Обновляем активную кнопку
        this.setActiveButton(route);
        
        // Навигация через роутер
        if (window.router) {
            window.router.navigateTo(route);
        } else {
            window.location.href = route + '.html';
        }
    }

    setActiveButton(activeRoute) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-route') === activeRoute) {
                btn.classList.add('active');
            }
        });
    }

    // Автоматически устанавливаем активную кнопку при загрузке
    setCurrentActive() {
        const currentPath = window.location.pathname;
        this.buttons.forEach(btn => {
            if (currentPath.includes(btn.route.replace('/', ''))) {
                this.setActiveButton(btn.route);
            }
        });
    }
}