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
            console.log('🔍 [DEBUG] Input userData:', JSON.stringify(userData, null, 2));
            
            // Validate input
            console.log('🔍 [DEBUG] Validating registration data...');
            const validation = this.validateRegistrationData(userData);
            console.log('🔍 [DEBUG] Validation result:', validation);
            
            if (!validation.valid) {
                console.log('❌ [DEBUG] Validation failed:', validation.message);
                return {
                    success: false,
                    message: validation.message
                };
            }

            // Check if Supabase is available
            console.log('🔍 [DEBUG] Checking Supabase availability...');
            console.log('🔍 [DEBUG] supabaseClient type:', typeof supabaseClient);
            console.log('🔍 [DEBUG] supabaseClient exists:', !!supabaseClient);
            console.log('🔍 [DEBUG] supabaseClient.isReady exists:', !!(supabaseClient && supabaseClient.isReady));
            
            if (typeof supabaseClient === 'undefined' || !supabaseClient || !supabaseClient.isReady || !supabaseClient.isReady()) {
                console.log('🧪 [REGISTER] Supabase not available, using demo registration');
                return await this.demoRegister(userData);
            }
            
            console.log('✅ [DEBUG] Supabase is available, proceeding with auth...');

            // Register with Supabase Auth
            console.log('🔍 [DEBUG] Preparing auth signup request...');
            const authRequest = {
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName
                    }
                }
            };
            console.log('🔍 [DEBUG] Auth request data:', JSON.stringify(authRequest, null, 2));
            
            console.log('🔍 [DEBUG] Calling supabaseClient.auth.signUp...');
            const { data, error } = await supabaseClient.auth.signUp(authRequest);

            console.log('🔍 [DEBUG] Auth signup response received');
            console.log('🔍 [DEBUG] Auth data:', JSON.stringify(data, null, 2));
            console.log('🔍 [DEBUG] Auth error:', error);

            if (error) {
                console.error('❌ [REGISTER] Auth error:', error);
                console.log('🔍 [DEBUG] Error details:', {
                    code: error.code,
                    message: error.message,
                    status: error.status,
                    name: error.name
                });
                return {
                    success: false,
                    message: this.getErrorMessage(error)
                };
            }

            if (!data.user) {
                console.log('❌ [DEBUG] No user data returned from auth');
                return {
                    success: false,
                    message: 'Registrazione fallita. Riprova più tardi.'
                };
            }

            console.log('✅ [REGISTER] Auth user created:', data.user.id);
            console.log('🔍 [DEBUG] Full auth user object:', JSON.stringify(data.user, null, 2));
            console.log('🔍 [DEBUG] User session data:', JSON.stringify(data.session, null, 2));
            console.log('🔍 [DEBUG] About to create user profile...');
            console.log('🔍 [DEBUG] User data for profile creation:', JSON.stringify(userData, null, 2));

            try {
                console.log('🔍 [DEBUG] Calling createUserProfile function...');
                const userProfile = await this.createUserProfile(data.user, userData);
                console.log('✅ [DEBUG] User profile created successfully:', JSON.stringify(userProfile, null, 2));
            } catch (profileError) {
                console.error('❌ [DEBUG] Profile creation failed:', profileError);
                console.log('🔍 [DEBUG] Profile error details:', {
                    message: profileError.message,
                    code: profileError.code,
                    stack: profileError.stack
                });
                throw profileError;
            }
            
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
            console.log('🔍 [DEBUG] Full error object:', JSON.stringify(error, null, 2));
            console.log('🔍 [DEBUG] Error stack trace:', error.stack);
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

    static async getUserProfile(authUserId) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('auth_user_id', authUserId)
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
                authUserId: data.auth_user_id,
                email: data.email,
                fullName: data.full_name,
                firstName: data.full_name ? data.full_name.split(' ')[0] : '',
                lastName: data.full_name ? data.full_name.split(' ').slice(1).join(' ') : '',
                dateOfBirth: data.date_of_birth,
                phone: data.phone,
                location: data.location,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };

        } catch (error) {
            console.error('Unexpected error fetching user profile:', error);
            return null;
        }
    }

    static async createUserProfile(authUser, additionalData = {}) {
        try {
            console.log('🔍 [CREATE_PROFILE] === STARTING PROFILE CREATION ===');
            console.log('🔍 [CREATE_PROFILE] Auth user ID:', authUser.id);
            console.log('🔍 [CREATE_PROFILE] Full auth user data:', JSON.stringify(authUser, null, 2));
            console.log('🔍 [CREATE_PROFILE] Additional data:', JSON.stringify(additionalData, null, 2));
            
            const userProfile = {
                auth_user_id: authUser.id,
                email: authUser.email,
                full_name: `${additionalData.firstName || ''} ${additionalData.lastName || ''}`.trim(),
                date_of_birth: additionalData.dateOfBirth || null,
                phone: additionalData.phone || null,
                location: additionalData.location || null
            };

            console.log('🔍 [CREATE_PROFILE] Profile data to insert:', JSON.stringify(userProfile, null, 2));
            console.log('🔍 [CREATE_PROFILE] Checking Supabase client state...');
            console.log('🔍 [CREATE_PROFILE] Supabase client type:', typeof supabaseClient);
            console.log('🔍 [CREATE_PROFILE] Supabase client exists:', !!supabaseClient);
            console.log('🔍 [CREATE_PROFILE] Supabase client ready:', supabaseClient && supabaseClient.isReady && supabaseClient.isReady());
            console.log('🔍 [CREATE_PROFILE] About to attempt database insert...');

            // Prima tentativo: inserimento con RLS
            console.log('🔍 [CREATE_PROFILE] Attempting insert with RLS policies...');
            
            let { data, error } = await supabaseClient
                .from('users')
                .insert([userProfile])
                .select()
                .single();
            
            // Se fallisce per problemi di schema, prova con service_role o creare via auth trigger
            if (error && error.code === 'PGRST204') {
                console.log('🔍 [CREATE_PROFILE] Schema error detected, trying alternative approach...');
                
                // Alternativa: usa la tabella users con schema diverso o crea profilo minimo
                const minimalProfile = {
                    id: authUser.id, // Usa l'ID auth come primary key
                    email: authUser.email,
                    full_name: userProfile.full_name,
                    created_at: new Date().toISOString()
                };
                
                console.log('🔍 [CREATE_PROFILE] Trying minimal profile insert:', minimalProfile);
                
                const result = await supabaseClient
                    .from('users')
                    .upsert([minimalProfile], { onConflict: 'id,email' })
                    .select()
                    .single();
                
                data = result.data;
                error = result.error;
            }
            
            console.log('🔍 [CREATE_PROFILE] === DATABASE RESPONSE ===');
            console.log('🔍 [CREATE_PROFILE] Response data:', JSON.stringify(data, null, 2));
            console.log('🔍 [CREATE_PROFILE] Response error:', error);
            console.log('🔍 [CREATE_PROFILE] Error type:', typeof error);
            
            if (error) {
                console.log('🔍 [CREATE_PROFILE] === ERROR ANALYSIS ===');
                console.log('🔍 [CREATE_PROFILE] Error code:', error.code);
                console.log('🔍 [CREATE_PROFILE] Error message:', error.message);
                console.log('🔍 [CREATE_PROFILE] Error details:', error.details);
                console.log('🔍 [CREATE_PROFILE] Error hint:', error.hint);
                console.log('🔍 [CREATE_PROFILE] Full error object:', JSON.stringify(error, null, 2));
            }
            
            if (error) {
                console.error('🔍 [CREATE_PROFILE] Error details:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
            }

            if (error) {
                console.error('Error creating user profile:', error);
                throw error;
            }

            // Dati dal database - adatta ai diversi schemi possibili
            const userData = data;
            
            return {
                id: userData.id,
                authUserId: userData.auth_user_id || userData.id, // Fallback per schemi diversi
                email: userData.email,
                fullName: userData.full_name || `${additionalData.firstName || ''} ${additionalData.lastName || ''}`.trim(),
                firstName: userData.full_name ? userData.full_name.split(' ')[0] : additionalData.firstName || '',
                lastName: userData.full_name ? userData.full_name.split(' ').slice(1).join(' ') : additionalData.lastName || '',
                dateOfBirth: userData.date_of_birth,
                phone: userData.phone,
                location: userData.location,
                createdAt: userData.created_at,
                updatedAt: userData.updated_at
            };

        } catch (error) {
            console.error('❌ [CREATE_PROFILE] === EXCEPTION CAUGHT ===');
            console.error('🔍 [CREATE_PROFILE] Exception message:', error.message);
            console.error('🔍 [CREATE_PROFILE] Exception code:', error.code);
            console.error('🔍 [CREATE_PROFILE] Exception stack:', error.stack);
            console.error('🔍 [CREATE_PROFILE] Full exception:', JSON.stringify(error, null, 2));
            throw error;
        }
    }

    static validateRegistrationData(userData) {
        console.log('🔍 [VALIDATION] === STARTING VALIDATION ===');
        console.log('🔍 [VALIDATION] User data received:', JSON.stringify(userData, null, 2));
        
        if (!userData.email || !userData.password) {
            console.log('🔍 [VALIDATION] Missing email or password');
            return {
                valid: false,
                message: 'Email e password sono obbligatori'
            };
        }

        if (!this.isValidEmail(userData.email)) {
            console.log('🔍 [VALIDATION] Invalid email format');
            return {
                valid: false,
                message: 'Email non valida'
            };
        }

        if (userData.password.length < 6) {
            console.log('🔍 [VALIDATION] Password too short');
            return {
                valid: false,
                message: 'La password deve essere di almeno 6 caratteri'
            };
        }

        if (userData.password !== userData.confirmPassword) {
            console.log('🔍 [VALIDATION] Passwords do not match');
            return {
                valid: false,
                message: 'Le password non coincidono'
            };
        }

        console.log('🔍 [VALIDATION] Validation passed');
        return { valid: true };
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static getErrorMessage(error) {
        console.log('🔍 [ERROR_MESSAGE] Processing error:', JSON.stringify(error, null, 2));
        console.log('🔍 [ERROR_MESSAGE] Error code:', error.code);
        console.log('🔍 [ERROR_MESSAGE] Error message:', error.message);
        
        if (error.code) {
            switch (error.code) {
                case 'invalid_credentials':
                    return 'Credenziali non valide';
                case 'email_already_exists':
                    return 'Questo indirizzo email è già registrato';
                case 'weak_password':
                    return 'La password è troppo debole';
                case 'invalid_email':
                    return 'Indirizzo email non valido';
                case 'over_email_send_rate_limit':
                    return 'Troppi tentativi di invio email. Riprova più tardi.';
                default:
                    console.log('🔍 [ERROR_MESSAGE] Unknown error code, checking message');
            }
        }
        
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
                console.log('🔍 [ERROR_MESSAGE] Using default error message');
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
