class MainPage {
    constructor() {
        this.init();
    }

    init() {
        console.log('MainPage initialized');
        this.checkAuthentication();
        this.setupEventListeners();
        this.displayUserInfo();
    }

    checkAuthentication() {
        const username = localStorage.getItem('pib_username');
        console.log('MainPage checkAuth - username:', username);
        
        if (!username) {
            console.log('No username, redirecting to auth');
            router.navigateTo('/auth');
            return;
        }
        console.log('User authenticated');
    }

    setupEventListeners() {
        console.log('Setting up main page listeners');
        
        const arrangeMeetButtons = document.querySelectorAll('.primary-btn');
        arrangeMeetButtons.forEach((btn)=>{
            btn.addEventListener('click', () => {
                console.log('Arrange button clicked');
                router.navigateTo('/map');
            })
        })

        const unableButtons = document.querySelectorAll('.secondary-btn');
        unableButtons.forEach((btn)=>{
            btn.addEventListener('click', () => {
                console.log('Unable button clicked');
            })
        })
    }

    displayUserInfo() {
        const username = localStorage.getItem('pib_username');
        const userInfoElement = document.getElementById('userInfo');
        
        if (userInfoElement && username) {
            userInfoElement.textContent = `Добро пожаловать, ${username}`;
        }
    }
}