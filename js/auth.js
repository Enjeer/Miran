class AuthPage {
    constructor() {
        this.init();
    }

    init() {
        console.log('AuthPage initialized');
        this.fillRememberedUsername();
        this.setupInputListeners();
    }

    fillRememberedUsername() {
        const remembered = localStorage.getItem('pib_remember');
        const username = localStorage.getItem('pib_username');
        
        console.log('fillRememberedUsername - remembered:', remembered, 'username:', username);
        
        if (remembered === 'true' && username) {
            const usernameInput = document.getElementById('username');
            if (usernameInput) {
                usernameInput.value = username;
                console.log('Username filled from localStorage');
            }
        }
    }

    setupInputListeners() {
        console.log('Setting up input listeners');
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
        console.log('Found inputs:', inputs.length);
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const errorMessage = document.querySelector('.form-message--error');
                if (errorMessage) {
                    errorMessage.remove();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (input.type === 'text' && document.activeElement === input) {
                        e.preventDefault();
                        const passwordInput = document.getElementById('password');
                        if (passwordInput) {
                            passwordInput.focus();
                        }
                    }
                }
            });
        });

        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Forgot password clicked');
                router.showMessage('Функция восстановления пароля в разработке', 'info');
            });
        }
    }
}