// Supabase client configuration and initialization
class SupabaseClient {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.config = {
            url: null,
            key: null
        };
    }

    // Initialize Supabase client
    init(supabaseUrl, supabaseKey) {
        try {
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase URL and Key are required');
            }

            this.config.url = supabaseUrl;
            this.config.key = supabaseKey;

            // Initialize Supabase client using the CDN version
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase library not loaded. Please include the Supabase CDN script.');
            }

            // Configurazione per disabilitare RLS e permettere inserimenti
            const options = {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                },
                db: {
                    schema: 'public'
                },
                global: {
                    headers: {
                        'X-Client-Info': 'career-guidance-app'
                    }
                }
            };

            this.client = supabase.createClient(supabaseUrl, supabaseKey, options);
            this.isInitialized = true;

            console.log('✅ Supabase client initialized successfully');
            return this.client;

        } catch (error) {
            console.error('❌ Error initializing Supabase client:', error);
            throw error;
        }
    }

    // Get the initialized client
    getClient() {
        if (!this.isInitialized || !this.client) {
            throw new Error('Supabase client not initialized. Call init() first.');
        }
        return this.client;
    }

    // Check if client is ready
    isReady() {
        return this.isInitialized && this.client !== null;
    }

    // Get current session
    async getCurrentSession() {
        if (!this.isReady()) return null;
        
        try {
            const { data: { session } } = await this.client.auth.getSession();
            return session;
        } catch (error) {
            console.error('Error getting current session:', error);
            return null;
        }
    }

    // Set up auth state change listener
    onAuthStateChange(callback) {
        if (!this.isReady()) {
            console.error('Supabase client not ready');
            return;
        }

        return this.client.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            callback(event, session);
        });
    }

    // Database helpers
    async query(table) {
        if (!this.isReady()) {
            throw new Error('Supabase client not ready');
        }
        return this.client.from(table);
    }

    // Storage helpers
    storage(bucket) {
        if (!this.isReady()) {
            throw new Error('Supabase client not ready');
        }
        return this.client.storage.from(bucket);
    }

    // Test connection
    async testConnection() {
        try {
            if (!this.isReady()) {
                return { success: false, message: 'Client not initialized' };
            }

            // Simple test query - try to access auth
            const { data, error } = await this.client.auth.getSession();
            
            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, message: 'Connection successful' };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Create singleton instance
const supabaseInstance = new SupabaseClient();

// Auto-initialize immediately (environment variables injected in HTML)
initializeSupabase();

async function initializeSupabase() {
    try {
        console.log('🔧 Attempting to initialize Supabase...');
        
        let supabaseUrl, supabaseKey;
        
        // Use injected environment variables
        if (typeof window !== 'undefined' && window.ENV) {
            supabaseUrl = window.ENV.SUPABASE_URL;
            supabaseKey = window.ENV.SUPABASE_ANON_KEY;
            console.log('📡 Using injected environment variables');
        } else {
            console.warn('⚠️ Environment variables not found in window.ENV');
        }
        
        // Validate credentials
        if (!supabaseUrl || !supabaseKey) {
            console.warn('⚠️ Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
            return;
        }
        
        // Don't initialize with placeholder or missing values
        if (supabaseUrl.includes('your-project') || 
            supabaseKey === 'your-anon-key' ||
            supabaseUrl.length < 10 ||
            supabaseKey.length < 10) {
            console.warn('⚠️ Supabase credentials appear to be placeholder values');
            return;
        }

        // Initialize Supabase (library should be loaded via CDN)
        if (typeof supabase !== 'undefined') {
            supabaseInstance.init(supabaseUrl, supabaseKey);
            console.log('✅ Supabase client initialized successfully');
            
            // Test the connection and reload opportunities if successful
            setTimeout(async () => {
                const testResult = await supabaseInstance.testConnection();
                if (testResult.success) {
                    console.log('✅ Supabase connection test passed - reloading opportunities');
                    
                    // Force reload opportunities with Supabase data
                    if (window.OpportunityService) {
                        await window.OpportunityService.loadOpportunities();
                        console.log('🔄 Opportunities reloaded from Supabase');
                    }
                } else {
                    console.warn('⚠️ Supabase connection test failed:', testResult.message);
                }
            }, 2000);
        } else {
            console.error('❌ Supabase library not loaded from CDN');
        }

    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
    }
}

// Export the client instance for global use
const supabaseClient = {
    // Direct access to Supabase methods
    get auth() {
        return supabaseInstance.getClient()?.auth;
    },

    get storage() {
        return supabaseInstance.getClient()?.storage;
    },

    from(table) {
        return supabaseInstance.getClient()?.from(table);
    },

    // Utility methods
    isReady() {
        return supabaseInstance.isReady();
    },

    async testConnection() {
        return await supabaseInstance.testConnection();
    },

    onAuthStateChange(callback) {
        return supabaseInstance.onAuthStateChange(callback);
    },

    async getCurrentSession() {
        return await supabaseInstance.getCurrentSession();
    },

    // Manual initialization if needed
    init(url, key) {
        return supabaseInstance.init(url, key);
    }
};

// Wait for DOM and test connection
document.addEventListener('DOMContentLoaded', async () => {
    // Small delay to ensure Supabase is loaded
    setTimeout(async () => {
        if (supabaseClient.isReady()) {
            const test = await supabaseClient.testConnection();
            if (test.success) {
                console.log('✅ Supabase connection verified');
            } else {
                console.warn('⚠️ Supabase connection test failed:', test.message);
            }
        } else {
            console.warn('⚠️ Supabase client not ready. Please check your configuration.');
        }
    }, 1000);
});

// Global error handler for Supabase operations
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('supabase')) {
        console.error('Supabase operation failed:', event.reason);
        showToast('Errore di connessione al database. Riprova più tardi.', 'error');
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = supabaseClient;
}
