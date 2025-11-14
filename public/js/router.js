class PIBRouter {
    constructor() {
        this.routes = {
            '/': 'loader',
            '/auth': 'auth', 
            '/main': 'main',
            '/chat': 'chat',
            '/map': 'map',
            '/inspection': 'inspection',
            '/stats': 'stats'
        };
        
        this.init();
    }
    
    init() {
        console.log('Router initialized');
        
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded');
            
            const startButton = document.getElementById('startButton');
            if (startButton) {
                console.log('Start button found');
                startButton.addEventListener('click', () => {
                    console.log('Start button clicked');
                    this.navigateTo('/main');
                });
            } else {
                console.log('Start button NOT found');
            }

            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                console.log('Login form found');
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log('Login form submitted');
                    this.handleLogin();
                });
            } else {
                console.log('Login form NOT found');
            }

            const cancelBtn = document.getElementById('cancelBtn');
            if (cancelBtn) {
                console.log('Cancel button found');
                cancelBtn.addEventListener('click', () => {
                    console.log('Cancel button clicked');
                    this.navigateTo('/');
                });
            }
        });
    }
    
    handleLogin() {
        console.log('handleLogin called');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        console.log('Username:', username, 'Password:', password, 'Remember:', remember);

        if (!username || !password) {
            console.log('Validation failed');
            this.showMessage('Заполните все поля', 'error');
            return;
        }

        console.log('Validation passed, showing loading message');
        this.showMessage('Авторизация...', 'loading');
        
        setTimeout(() => {
            console.log('Timeout completed, saving data');
            
            if (remember) {
                localStorage.setItem('pib_username', username);
                localStorage.setItem('pib_remember', 'true');
                console.log('Data saved to localStorage');
            } else {
                localStorage.removeItem('pib_username');
                localStorage.removeItem('pib_remember');
            }

            console.log('Navigating to main...');
            this.navigateTo('/main');
        }, 1500);
    }

    showMessage(text, type = 'info') {
        console.log('Showing message:', text, type);
        
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const message = document.createElement('div');
        message.className = `form-message form-message--${type}`;
        message.textContent = text;

        const form = document.getElementById('loginForm');
        if (form) {
            form.insertBefore(message, form.firstChild);
        }

        if (type === 'info' || type === 'success') {
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        }
    }

    checkAuth() {
        console.log('checkAuth called');
        const remembered = localStorage.getItem('pib_remember');
        const username = localStorage.getItem('pib_username');
        
        console.log('Remembered:', remembered, 'Username:', username);
        
        if (remembered === 'true' && username) {
            console.log('User is remembered, checking current page');
            if (window.location.pathname.includes('auth.html') || 
                window.location.pathname === '/') {
                console.log('Redirecting to main from checkAuth');
                this.navigateTo('/main');
            }
        }
    }

    arrangeMeeting() {
        console.log('meeting arrange -> routing to map');
        if (window.location.pathname.includes('main.html') || 
                window.location.pathname === '/') {
                console.log('Redirecting to map from main');
                this.navigateTo('/main');
            }
    }
    
    navigateTo(path) {
        console.log('navigateTo called with path:', path);

        if (path === '/auth') {
            window.location.href = 'auth.html';
        } else if (path === '/main') {
            window.location.href = 'main.html';
        } else if (path === '/chat') {
            window.location.href = 'chat.html';
        } else if (path === '/map') {
            window.location.href = 'map.html';
        } else if (path === '/inspection') {
            window.location.href = 'inspection.html';
        } else if (path === '/stats') {
            window.location.href = 'stats.html';
        } else {
            window.location.href = 'index.html';
        }
    }
    
    getCurrentPath() {
        return window.location.pathname;
    }

    logout() {
        console.log('Logout called');
        localStorage.removeItem('pib_username');
        localStorage.removeItem('pib_remember');
        this.navigateTo('/');
    }
}

// Создаем глобальный роутер СРАЗУ после объявления класса
const router = new PIBRouter();