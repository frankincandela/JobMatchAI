// Authentication service
class AuthService {
    static currentUser = null;
    
    static async login(email, password) {
        try {
            console.log('🚀 [LOGIN] Starting login for:', email);
            
            // Validate input
            if (!email || !password) {
                return {
                    success: false,
                    message: 'Email e password sono obbligatori'
                };
            }

            // Check if Supabase is available
            if (typeof supabaseClient === 'undefined' || !supabaseClient || !supabaseClient.isReady || !supabaseClient.isReady()) {
                console.log('🧪 [LOGIN] Supabase not available, using demo login');
                return await this.demoLogin(email, password);
            }

            // Call Supabase auth
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password
            });

            if (error) {
                console.error('❌ [LOGIN] Auth error:', error);
                return {
                    success: false,
                    message: this.getErrorMessage(error)
                };
            }

            if (!data.user) {
                return {
                    success: false,
                    message: 'Login fallito. Verifica le credenziali.'
                };
            }

            console.log('✅ [LOGIN] Auth successful:', data.user.id);

            // Get user profile from database
            let userProfile = await this.getUserProfile(data.user.id);
            
            // If no profile exists, create one
            if (!userProfile) {
                console.log('⚠️ [LOGIN] User profile not found, creating...');
                userProfile = await this.createUserProfile(data.user);
            }

            this.currentUser = userProfile;
            
            // Store in localStorage for persistence
            localStorage.setItem('career_guidance_user', JSON.stringify(userProfile));

            return {
                success: true,
                user: userProfile,
                message: 'Login effettuato con successo'
            };

        } catch (error) {
            console.error('❌ [LOGIN] Unexpected error:', error);
            return {
                success: false,
                message: 'Errore durante il login. Riprova più tardi.'
            };
        }
    }

    static async demoLogin(email, password) {
        console.log('🧪 [DEMO LOGIN] Using demo authentication');
        
        // Demo credentials
        const demoCredentials = [
            { email: 'demo@careerguida.com', password: 'demo123', name: 'Utente Demo' },
            { email: 'test@example.com', password: 'test123', name: 'Test User' },
            { email: 'mario.rossi@example.com', password: 'password', name: 'Mario Rossi' }
        ];

        // Check credentials
        const user = demoCredentials.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            return {
                success: false,
                message: 'Credenziali non valide. Usa: demo@careerguida.com / demo123'
            };
        }

        // Create demo user profile
        const userProfile = {
            id: 'demo-user-' + Date.now(),
            email: user.email,
            name: user.name,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ')[1] || '',
            created_at: new Date().toISOString(),
            isDemo: true
        };

        this.currentUser = userProfile;
        
        // Store in localStorage for persistence
        localStorage.setItem('career_guidance_user', JSON.stringify(userProfile));

        console.log('✅ [DEMO LOGIN] Demo login successful');
        
        return {
            success: true,
            user: userProfile,
            message: 'Login demo effettuato con successo'
        };
    }

    static async register(userData) {
        try {
            console.log('🚀 [REGISTER] Starting registration for:', userData.email);
            
            // Validate input
            const validation = this.validateRegistrationData(userData);
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message
                };
            }

            // Check if Supabase is available
            if (typeof supabaseClient === 'undefined' || !supabaseClient || !supabaseClient.isReady || !supabaseClient.isReady()) {
                console.log('🧪 [REGISTER] Supabase not available, using demo registration');
                return await this.demoRegister(userData);
            }

            // Register with Supabase Auth
            const { data, error } = await supabaseClient.auth.signUp({
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName
                    }
                }
            });

            if (error) {
                console.error('❌ [REGISTER] Auth error:', error);
                return {
                    success: false,
                    message: this.getErrorMessage(error)
                };
            }

            if (!data.user) {
                return {
                    success: false,
                    message: 'Registrazione fallita. Riprova più tardi.'
                };
            }

            console.log('✅ [REGISTER] Auth user created:', data.user.id);

            // Create user profile in database
            const userProfile = await this.createUserProfile(data.user, userData);
            
            this.currentUser = userProfile;
            
            // Store in localStorage for persistence
            localStorage.setItem('career_guidance_user', JSON.stringify(userProfile));

            return {
                success: true,
                user: userProfile,
                message: 'Registrazione completata con successo'
            };

        } catch (error) {
            console.error('❌ [REGISTER] Unexpected error:', error);
            return {
                success: false,
                message: 'Errore durante la registrazione. Riprova più tardi.'
            };
        }
    }

    static async demoRegister(userData) {
        console.log('🧪 [DEMO REGISTER] Using demo registration');
        
        // Create demo user profile
        const userProfile = {
            id: 'demo-user-' + Date.now(),
            email: userData.email.toLowerCase(),
            name: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            created_at: new Date().toISOString(),
            isDemo: true
        };

        this.currentUser = userProfile;
        
        // Store in localStorage for persistence
        localStorage.setItem('career_guidance_user', JSON.stringify(userProfile));

        console.log('✅ [DEMO REGISTER] Demo registration successful');
        
        return {
            success: true,
            user: userProfile,
            message: 'Registrazione demo completata con successo'
        };
    }

    static async logout() {
        try {
            console.log('🚪 [LOGOUT] Starting logout process');
            
            // Clear user data regardless of mode
            this.currentUser = null;
            localStorage.removeItem('career_guidance_user');
            
            // Clear all demo profiles
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('demo_profile_')) {
                    localStorage.removeItem(key);
                }
            });

            // Try Supabase logout if available
            if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.auth) {
                try {
                    const { error } = await supabaseClient.auth.signOut();
                    if (error) {
                        console.warn('Supabase logout warning:', error);
                    }
                } catch (supabaseError) {
                    console.log('🧪 [LOGOUT] Supabase logout not available, using local logout');
                }
            }
            
            console.log('✅ [LOGOUT] Logout successful');

        } catch (error) {
            console.error('❌ [LOGOUT] Unexpected error:', error);
            
            // Ensure cleanup even on error
            this.currentUser = null;
            localStorage.removeItem('career_guidance_user');
        }
    }

    static async getCurrentUser() {
        // Check if user is already loaded
        if (this.currentUser) {
            return this.currentUser;
        }

        // Check localStorage first
        const storedUser = localStorage.getItem('career_guidance_user');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                return this.currentUser;
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('career_guidance_user');
            }
        }

        // Check Supabase session
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (session && session.user) {
                const userProfile = await this.getUserProfile(session.user.id);
                if (userProfile) {
                    this.currentUser = userProfile;
                    localStorage.setItem('career_guidance_user', JSON.stringify(userProfile));
                    return userProfile;
                }
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }

        return null;
    }

    static async getUserProfile(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null;
                }
                console.error('Error fetching user profile:', error);
                return null;
            }

            return {
                id: data.id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                dateOfBirth: data.date_of_birth,
                profileImagePath: data.profile_image_path,
                profileId: data.profile_id,
                savedOpportunities: data.saved_opportunities || [],
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                isActive: data.is_active,
                get fullName() {
                    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
                }
            };

        } catch (error) {
            console.error('Unexpected error fetching user profile:', error);
            return null;
        }
    }

    static async createUserProfile(authUser, additionalData = {}) {
        try {
            const userProfile = {
                id: authUser.id,
                email: authUser.email,
                first_name: additionalData.firstName || authUser.user_metadata?.first_name || null,
                last_name: additionalData.lastName || authUser.user_metadata?.last_name || null,
                date_of_birth: null,
                profile_image_path: null,
                profile_id: null,
                saved_opportunities: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true
            };

            const { data, error } = await supabaseClient
                .from('users')
                .insert([userProfile])
                .select()
                .single();

            if (error) {
                console.error('Error creating user profile:', error);
                throw error;
            }

            return {
                id: data.id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                dateOfBirth: data.date_of_birth,
                profileImagePath: data.profile_image_path,
                profileId: data.profile_id,
                savedOpportunities: data.saved_opportunities || [],
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                isActive: data.is_active,
                get fullName() {
                    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
                }
            };

        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    static validateRegistrationData(userData) {
        if (!userData.email || !userData.password) {
            return {
                valid: false,
                message: 'Email e password sono obbligatori'
            };
        }

        if (!this.isValidEmail(userData.email)) {
            return {
                valid: false,
                message: 'Email non valida'
            };
        }

        if (userData.password.length < 6) {
            return {
                valid: false,
                message: 'La password deve essere di almeno 6 caratteri'
            };
        }

        if (userData.password !== userData.confirmPassword) {
            return {
                valid: false,
                message: 'Le password non coincidono'
            };
        }

        return { valid: true };
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static getErrorMessage(error) {
        switch (error.message) {
            case 'Invalid login credentials':
                return 'Email o password non corretti';
            case 'User already registered':
                return 'Email già registrata';
            case 'Email not confirmed':
                return 'Conferma la tua email prima di effettuare il login';
            case 'Too many requests':
                return 'Troppi tentativi. Riprova tra qualche minuto.';
            default:
                return error.message || 'Errore durante l\'operazione';
        }
    }

    static async updateProfile(profileData) {
        try {
            if (!this.currentUser) {
                throw new Error('Utente non autenticato');
            }

            const { data, error } = await supabaseClient
                .from('users')
                .update({
                    first_name: profileData.firstName,
                    last_name: profileData.lastName,
                    date_of_birth: profileData.dateOfBirth,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating profile:', error);
                throw error;
            }

            // Update current user
            this.currentUser = {
                ...this.currentUser,
                firstName: data.first_name,
                lastName: data.last_name,
                dateOfBirth: data.date_of_birth,
                updatedAt: data.updated_at
            };

            // Update localStorage
            localStorage.setItem('career_guidance_user', JSON.stringify(this.currentUser));

            return {
                success: true,
                user: this.currentUser,
                message: 'Profilo aggiornato con successo'
            };

        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                message: 'Errore durante l\'aggiornamento del profilo'
            };
        }
    }

    static async saveOpportunity(opportunityId) {
        try {
            if (!this.currentUser) {
                return false;
            }

            const savedOpportunities = [...(this.currentUser.savedOpportunities || [])];
            
            if (!savedOpportunities.includes(opportunityId)) {
                savedOpportunities.push(opportunityId);

                const { error } = await supabaseClient
                    .from('users')
                    .update({
                        saved_opportunities: savedOpportunities,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.currentUser.id);

                if (error) {
                    console.error('Error saving opportunity:', error);
                    return false;
                }

                this.currentUser.savedOpportunities = savedOpportunities;
                localStorage.setItem('career_guidance_user', JSON.stringify(this.currentUser));
            }

            return true;

        } catch (error) {
            console.error('Error saving opportunity:', error);
            return false;
        }
    }

    static async removeSavedOpportunity(opportunityId) {
        try {
            if (!this.currentUser) {
                return false;
            }

            const savedOpportunities = (this.currentUser.savedOpportunities || [])
                .filter(id => id !== opportunityId);

            const { error } = await supabaseClient
                .from('users')
                .update({
                    saved_opportunities: savedOpportunities,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id);

            if (error) {
                console.error('Error removing saved opportunity:', error);
                return false;
            }

            this.currentUser.savedOpportunities = savedOpportunities;
            localStorage.setItem('career_guidance_user', JSON.stringify(this.currentUser));

            return true;

        } catch (error) {
            console.error('Error removing saved opportunity:', error);
            return false;
        }
    }
}
