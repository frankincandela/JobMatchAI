// lib/main.dart - VERSIONE COMPLETA SUPABASE
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/home_screen.dart';
import 'screens/profile_form_screen.dart';
import 'screens/results_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/login_screen.dart';
import 'screens/user_profile_screen.dart';
import 'screens/user_opportunity_screen.dart';
import 'providers/app_provider.dart';
import 'services/supabase_service.dart';
// import 'config/supabase_config.dart'; // Decommentare dopo aver creato il file

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // IMPORTANTE: Sostituisci con le tue credenziali Supabase
    await Supabase.initialize(
      url: 'https://YOUR_PROJECT_ID.supabase.co', // <-- SOSTITUISCI
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // <-- SOSTITUISCI
      authFlowType: AuthFlowType.pkce,
    );
    
    print('✅ Supabase inizializzato con successo');
    
    // Inizializza il database service
    await SupabaseService.instance.init();
    
    // Carica dati di esempio in modalità sviluppo
    if (const bool.fromEnvironment('dart.vm.product') == false) {
      await _checkAndLoadSampleData();
    }
    
  } catch (e) {
    print('❌ Errore inizializzazione Supabase: $e');
  }
  
  runApp(MyApp());
}

/// Controlla e carica dati di esempio se necessario
Future<void> _checkAndLoadSampleData() async {
  try {
    final companies = await Supabase.instance.client
        .from('companies')
        .select()
        .limit(1);
    
    if ((companies as List).isEmpty) {
      print('📦 Database vuoto, carico dati di esempio...');
      await SupabaseService.instance.loadSampleData();
      print('✅ Dati di esempio caricati');
    } else {
      print('✅ Database già popolato');
    }
  } catch (e) {
    print('⚠️ Errore controllo dati: $e');
  }
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AppProvider()..init(),
        ),
      ],
      child: MaterialApp(
        title: 'Career Guidance',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          primaryColor: Color(0xFF667eea),
          fontFamily: 'Roboto',
          appBarTheme: AppBarTheme(
            elevation: 0,
            backgroundColor: Color(0xFF667eea),
            foregroundColor: Colors.white,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        initialRoute: '/',
        routes: {
          '/': (context) => AuthWrapper(),
          '/home': (context) => HomeScreen(),
          '/profile-form': (context) => ProfileFormScreen(),
          '/results': (context) => ResultsScreen(),
          '/auth': (context) => AuthScreen(),
          '/login': (context) => LoginScreen(),
          '/user-profile': (context) => UserProfileScreen(),
          '/user-opportunities': (context) => UserOpportunitiesScreen(),
        },
        onGenerateRoute: (settings) {
          // Gestione route con parametri
          if (settings.name == '/auth') {
            final profileId = settings.arguments as String?;
            return MaterialPageRoute(
              builder: (context) => AuthScreen(profileId: profileId),
            );
          }
          return null;
        },
        // Error handling
        builder: (context, child) {
          return ScrollConfiguration(
            behavior: _CustomScrollBehavior(),
            child: child!,
          );
        },
      ),
    );
  }
}

/// Widget wrapper per gestire lo stato di autenticazione
class AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        // Durante il caricamento
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildLoadingScreen();
        }
        
        // Controlla errori
        if (snapshot.hasError) {
          return _buildErrorScreen(snapshot.error.toString());
        }
        
        final session = Supabase.instance.client.auth.currentSession;
        
        if (session != null) {
          // Utente autenticato
          return Consumer<AppProvider>(
            builder: (context, appProvider, child) {
              // Se sta caricando dati utente
              if (appProvider.isLoading) {
                return _buildLoadingScreen();
              }
              
              // Se ha un profilo completo, vai alle opportunità
              if (appProvider.currentProfile != null) {
                return UserOpportunitiesScreen();
              } else {
                // Non ha profilo, mostra home con opzioni
                return HomeScreen();
              }
            },
          );
        } else {
          // Non autenticato, mostra home
          return HomeScreen();
        }
      },
    );
  }
  
  Widget _buildLoadingScreen() {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF667eea), Color(0xFF764ba2)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  strokeWidth: 3,
                ),
              ),
              SizedBox(height: 24),
              Text(
                'Caricamento...',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Preparazione del tuo percorso professionale',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildErrorScreen(String error) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF667eea), Color(0xFF764ba2)],
          ),
        ),
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 80,
                  color: Colors.white,
                ),
                SizedBox(height: 24),
                Text(
                  'Oops! Qualcosa è andato storto',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 16),
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    error,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 14,
                    ),
                  ),
                ),
                SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: () {
                    // Riprova a inizializzare
                    Navigator.pushReplacementNamed(context, '/');
                  },
                  icon: Icon(Icons.refresh),
                  label: Text('Riprova'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Color(0xFF667eea),
                    padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Custom scroll behavior per web
class _CustomScrollBehavior extends ScrollBehavior {
  @override
  Widget buildScrollbar(BuildContext context, Widget child, ScrollableDetails details) {
    return child;
  }

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) {
    return const BouncingScrollPhysics();
  }
}