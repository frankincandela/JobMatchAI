// Main application controller
class CareerGuidanceApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'welcome';
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Career Guidance App');
        
        // Check if user is already logged in
        await this.checkAuthState();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load initial view
        if (this.currentUser) {
            this.showDashboard();
        } else {
            this.showWelcome();
        }
    }

    async checkAuthState() {
        try {
            this.currentUser = await AuthService.getCurrentUser();
            if (this.currentUser) {
                this.updateUIForLoggedInUser();
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        }
    }

    initEventListeners() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            showToast('Si è verificato un errore. Riprova più tardi.', 'error');
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.view) {
                this.loadView(event.state.view);
            }
        });
    }

    updateUIForLoggedInUser() {
        document.getElementById('loginNav').style.display = 'none';
        document.getElementById('userNav').style.display = 'block';
        document.getElementById('userNameNav').textContent = 
            this.currentUser.fullName || this.currentUser.email.split('@')[0];
    }

    updateUIForLoggedOutUser() {
        document.getElementById('loginNav').style.display = 'block';
        document.getElementById('userNav').style.display = 'none';
    }

    showWelcome() {
        this.currentView = 'welcome';
        document.getElementById('welcomeSection').style.display = 'block';
        document.getElementById('dynamicContent').style.display = 'none';
        this.updateHistory('welcome');
    }

    async showLogin() {
        await this.loadView('login');
    }

    async showRegister() {
        await this.loadView('register');
    }

    async showDashboard() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        await this.loadView('dashboard');
    }

    async showProfile() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        await this.loadView('profile-form');
    }

    async showOpportunities() {
        if (!this.currentUser) {
            this.showLogin();
            return;
        }
        await this.loadView('opportunities-list');
    }

    async loadView(viewName) {
        try {
            showLoading();
            
            const response = await fetch(`components/${viewName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load view: ${viewName}`);
            }
            
            const html = await response.text();
            
            // Hide welcome section and show dynamic content
            document.getElementById('welcomeSection').style.display = 'none';
            const dynamicContent = document.getElementById('dynamicContent');
            dynamicContent.innerHTML = html;
            dynamicContent.style.display = 'block';
            
            // Execute any scripts in the loaded HTML
            const scripts = dynamicContent.querySelectorAll('script');
            scripts.forEach(script => {
                try {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
                    document.body.removeChild(newScript);
                } catch (e) {
                    console.warn('Error executing script from loaded view:', e);
                }
            });
            
            // Add fade-in animation
            dynamicContent.classList.add('fade-in');
            
            this.currentView = viewName;
            this.updateHistory(viewName);
            
            // Initialize view-specific functionality
            await this.initViewSpecificFeatures(viewName);
            
        } catch (error) {
            console.error('Error loading view:', error);
            showToast('Errore nel caricamento della pagina', 'error');
        } finally {
            hideLoading();
        }
    }

    async initViewSpecificFeatures(viewName) {
        switch (viewName) {
            case 'login':
                this.initLoginForm();
                break;
            case 'register':
                this.initRegisterForm();
                break;
            case 'dashboard':
                await this.initDashboard();
                break;
            case 'profile-form':
                await this.initProfileForm();
                break;
            case 'opportunities-list':
                await this.initOpportunitiesList();
                break;
            case 'cv-upload':
                this.initCVUpload();
                // Use the global initialization function
                setTimeout(() => {
                    if (typeof window.initCVUploadComponent === 'function') {
                        window.initCVUploadComponent();
                    }
                }, 100);
                break;
            case 'application-form':
                this.initApplicationForm();
                break;
        }
    }

    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e.target);
            });
        }

        // Add link to register
        const registerLink = document.getElementById('registerLink');
        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegister();
            });
        }
    }

    initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister(e.target);
            });
        }

        // Add link to login
        const loginLink = document.getElementById('loginLink');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogin();
            });
        }
    }

    async initDashboard() {
        if (!this.currentUser) return;

        try {
            // Load user profile to check completeness
            const profile = await ProfileService.getUserProfile(this.currentUser.id);
            
            // Load opportunities
            const opportunities = await OpportunityService.getMatchedOpportunities(this.currentUser.id);
            
            // Update dashboard with data
            this.updateDashboardContent(profile, opportunities);
            
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            showToast('Errore nel caricamento del dashboard', 'error');
        }
    }

    async initProfileForm() {
        if (!this.currentUser) return;

        try {
            // Load existing profile if available
            const profile = await ProfileService.getUserProfile(this.currentUser.id);
            if (profile) {
                ProfileService.populateProfileForm(profile);
            }

            // Initialize profile form handlers
            ProfileService.initProfileForm();
            
        } catch (error) {
            console.error('Error initializing profile form:', error);
            showToast('Errore nel caricamento del profilo', 'error');
        }
    }

    async initOpportunitiesList() {
        if (!this.currentUser) return;

        try {
            // Load opportunities
            await OpportunityService.loadOpportunities();
            
            // Initialize filters
            OpportunityService.initFilters();
            
        } catch (error) {
            console.error('Error initializing opportunities list:', error);
            showToast('Errore nel caricamento delle opportunità', 'error');
        }
    }

    initCVUpload() {
        // Initialize CV upload component if it exists
        if (typeof CVUploadComponent !== 'undefined') {
            new CVUploadComponent();
        }
    }

    initApplicationForm() {
        ApplicationService.initApplicationForm();
    }

    async handleLogin(form) {
        try {
            showLoading();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');

            const result = await AuthService.login(email, password);
            
            if (result.success) {
                this.currentUser = result.user;
                this.updateUIForLoggedInUser();
                showToast('Login effettuato con successo!', 'success');
                this.showDashboard();
            } else {
                showToast(result.message || 'Errore durante il login', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showToast('Errore durante il login. Riprova più tardi.', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleRegister(form) {
        try {
            showLoading();
            
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');

            if (password !== confirmPassword) {
                showToast('Le password non coincidono', 'error');
                return;
            }

            const result = await AuthService.register({
                email,
                password,
                confirmPassword,
                firstName,
                lastName
            });
            
            if (result.success) {
                this.currentUser = result.user;
                this.updateUIForLoggedInUser();
                showToast('Registrazione completata con successo!', 'success');
                this.showDashboard();
            } else {
                showToast(result.message || 'Errore durante la registrazione', 'error');
            }
            
        } catch (error) {
            console.error('Register error:', error);
            showToast('Errore durante la registrazione. Riprova più tardi.', 'error');
        } finally {
            hideLoading();
        }
    }

    updateDashboardContent(profile, opportunities) {
        // Update profile completeness
        const completeness = this.calculateProfileCompleteness(profile);
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${completeness}%`;
            progressBar.textContent = `${completeness}%`;
        }

        // Update opportunities count
        const opportunitiesCount = document.getElementById('opportunitiesCount');
        if (opportunitiesCount) {
            opportunitiesCount.textContent = opportunities.length;
        }

        // Show recent opportunities
        const recentOpportunities = document.getElementById('recentOpportunities');
        if (recentOpportunities && opportunities.length > 0) {
            recentOpportunities.innerHTML = opportunities.slice(0, 3).map(opp => `
                <div class="opportunity-preview mb-2">
                    <strong>${opp.title}</strong>
                    <small class="text-muted d-block">${opp.company}</small>
                </div>
            `).join('');
        }
    }

    calculateProfileCompleteness(profile) {
        if (!profile) return 0;
        
        let completeness = 0;
        const fields = ['biography', 'education', 'experiences'];
        
        fields.forEach(field => {
            if (profile[field] && profile[field].length > 0) {
                completeness += 33.33;
            }
        });
        
        return Math.round(completeness);
    }

    async logout() {
        try {
            await AuthService.logout();
            this.currentUser = null;
            this.updateUIForLoggedOutUser();
            showToast('Logout effettuato con successo', 'success');
            this.showWelcome();
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Errore durante il logout', 'error');
        }
    }

    updateHistory(viewName) {
        const state = { view: viewName };
        const url = `#${viewName}`;
        history.pushState(state, '', url);
    }
}

// Global functions for inline event handlers
async function startCareerJourney() {
    await app.loadView('cv-upload');
}

async function showLogin() {
    await app.showLogin();
}

async function showRegister() {
    await app.showRegister();
}

async function showDashboard() {
    await app.showDashboard();
}

async function showProfile() {
    await app.showProfile();
}

async function showOpportunities() {
    await app.showOpportunities();
}

async function logout() {
    await app.logout();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CareerGuidanceApp();
});
