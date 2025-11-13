class PWAApp {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineDetection();
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('PWA: Service Worker зарегистрирован');
                })
                .catch(error => {
                    console.log('PWA: Ошибка регистрации', error);
                });
        }
    }
    
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
    }
    
    showInstallButton() {
        const installButton = document.getElementById('installButton');
        if (installButton) {
            installButton.style.display = 'block';
        }
    }
    
    installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('PWA установлено');
                }
                this.deferredPrompt = null;
            });
        }
    }
    
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.showStatus('Онлайн', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showStatus('Оффлайн', 'warning');
        });
    }
    
    showStatus(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Инициализация PWA
const pwaApp = new PWAApp();

function installPWA() {
    pwaApp.installPWA();
}

// Инициализация страниц ПОСЛЕ объявления всех классов
if (window.location.pathname.includes('auth.html')) {
    console.log('Initializing AuthPage for auth.html');
    const authPage = new AuthPage();
}

if (window.location.pathname.includes('main.html')) {
    console.log('Initializing MainPage for main.html');
    const mainPage = new MainPage();
}

if (window.location.pathname.includes('chat.html')) {
    console.log('Initializing ChatPage for chat.html');
    const chatPage = new ChatPage();
}


// Проверяем авторизацию при загрузке
document.addEventListener('DOMContentLoaded', () => {
    router.checkAuth();
});