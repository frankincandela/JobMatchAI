// lib/services/auth_service.dart - VERSIONE SUPABASE
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user.dart' as app_models;
import '../models/auth_models.dart';
import 'supabase_service.dart';

class AuthService {
  static const String _currentUserKey = 'current_user_id';
  static const String _isLoggedInKey = 'is_logged_in';
  
  static AuthService? _instance;
  static AuthService get instance => _instance ??= AuthService._internal();
  
  final SupabaseClient _supabase = Supabase.instance.client;
  final SupabaseService _dbService = SupabaseService.instance;

  AuthService._internal();

  /// Registra un nuovo utente
  Future<AuthResponse> register(RegisterRequest request) async {
    try {
      print('🚀 [REGISTER] Starting registration for: ${request.email}');
      
      // Validazione
      if (!request.isValid) {
        return AuthResponse.error(request.validationError ?? 'Dati non validi');
      }

      // Registra con Supabase Auth
      final authResponse = await _supabase.auth.signUp(
        email: request.email,
        password: request.password,
        data: {
          'first_name': request.firstName,
          'last_name': request.lastName,
        }
      );

      if (authResponse.user == null) {
        return AuthResponse.error('Errore durante la registrazione');
      }

      print('✅ [REGISTER] Auth user created: ${authResponse.user!.id}');

      // Crea record nella tabella users
      await _dbService.createUserRecord(
        authResponse.user!.id,
        request.email,
        firstName: request.firstName,
        lastName: request.lastName,
      );

      // Recupera l'utente completo
      final user = await _dbService.getUser(authResponse.user!.id);
      
      if (user != null) {
        print('✅ [REGISTER] User record created successfully');
        return AuthResponse.success(user, message: 'Registrazione completata con successo');
      } else {
        return AuthResponse.error('Errore creazione profilo utente');
      }

    } catch (e) {
      print('❌ [REGISTER] Error: $e');
      if (e.toString().contains('already registered')) {
        return AuthResponse.error('Email già registrata');
      }
      return AuthResponse.error('Errore durante la registrazione: $e');
    }
  }

  /// Login utente
  Future<AuthResponse> login(LoginRequest request) async {
    try {
      print('🚀 [LOGIN] Starting login for: ${request.email}');
      
      // Login con Supabase Auth
      final authResponse = await _supabase.auth.signInWithPassword(
        email: request.email,
        password: request.password,
      );

      if (authResponse.user == null) {
        print('❌ [LOGIN] Invalid credentials');
        return AuthResponse.error('Email o password non corretti');
      }

      print('✅ [LOGIN] Auth successful: ${authResponse.user!.id}');

      // Recupera dati utente dal database
      app_models.User? user = await _dbService.getUser(authResponse.user!.id);
      
      // Se non esiste il record utente, crealo (per utenti migrati)
      if (user == null) {
        print('⚠️ [LOGIN] User record not found, creating...');
        await _dbService.createUserRecord(
          authResponse.user!.id,
          authResponse.user!.email!,
        );
        user = await _dbService.getUser(authResponse.user!.id);
      }

      if (user != null) {
        print('✅ [LOGIN] Login completed successfully');
        return AuthResponse.success(user, message: 'Login effettuato con successo');
      } else {
        return AuthResponse.error('Errore recupero dati utente');
      }

    } catch (e) {
      print('❌ [LOGIN] Error: $e');
      if (e.toString().contains('Invalid login')) {
        return AuthResponse.error('Email o password non corretti');
      }
      return AuthResponse.error('Errore durante il login: $e');
    }
  }

  /// Logout utente
  Future<void> logout() async {
    try {
      await _supabase.auth.signOut();
      print('✅ [AUTH] Logout completed');
    } catch (e) {
      print('❌ [AUTH] Logout error: $e');
    }
  }

  /// Controlla se utente è loggato
  Future<bool> isLoggedIn() async {
    final session = _supabase.auth.currentSession;
    final isLogged = session != null;
    print('🔍 [AUTH] Is logged in: $isLogged');
    return isLogged;
  }

  /// Ottieni utente corrente
  Future<app_models.User?> getCurrentUser() async {
    try {
      final authUser = _supabase.auth.currentUser;
      if (authUser == null) {
        print('👤 [AUTH] No authenticated user');
        return null;
      }

      final user = await _dbService.getUser(authUser.id);
      print('👤 [AUTH] Current user: ${user?.email}');
      return user;
    } catch (e) {
      print('❌ [AUTH] Error getting current user: $e');
      return null;
    }
  }

  /// Aggiorna profilo utente
  Future<AuthResponse> updateProfile(app_models.User user) async {
    try {
      user.updatedAt = DateTime.now();
      await _dbService.updateUser(user);
      
      // Aggiorna anche i metadati in Supabase Auth se necessario
      if (user.firstName != null || user.lastName != null) {
        await _supabase.auth.updateUser(
          UserAttributes(
            data: {
              'first_name': user.firstName,
              'last_name': user.lastName,
            }
          )
        );
      }
      
      return AuthResponse.success(user, message: 'Profilo aggiornato con successo');
    } catch (e) {
      print('❌ [AUTH] Update profile error: $e');
      return AuthResponse.error('Errore aggiornamento profilo: $e');
    }
  }

  /// Salva opportunità
  Future<bool> saveOpportunity(String opportunityId) async {
    try {
      final user = await getCurrentUser();
      if (user == null) return false;

      if (!user.savedOpportunities.contains(opportunityId)) {
        user.savedOpportunities.add(opportunityId);
        await updateProfile(user);
      }
      
      return true;
    } catch (e) {
      print('❌ [AUTH] Save opportunity error: $e');
      return false;
    }
  }

  /// Rimuovi opportunità salvata
  Future<bool> removeSavedOpportunity(String opportunityId) async {
    try {
      final user = await getCurrentUser();
      if (user == null) return false;

      user.savedOpportunities.remove(opportunityId);
      await updateProfile(user);
      
      return true;
    } catch (e) {
      print('❌ [AUTH] Remove opportunity error: $e');
      return false;
    }
  }

  /// Ottieni opportunità salvate
  Future<List<String>> getSavedOpportunities() async {
    final user = await getCurrentUser();
    return user?.savedOpportunities ?? [];
  }

  /// Cambia password
  Future<AuthResponse> changePassword(String currentPassword, String newPassword) async {
    try {
      final user = await getCurrentUser();
      if (user == null) {
        return AuthResponse.error('Utente non autenticato');
      }

      // Verifica password corrente facendo un login temporaneo
      final verifyResponse = await _supabase.auth.signInWithPassword(
        email: user.email,
        password: currentPassword,
      );

      if (verifyResponse.user == null) {
        return AuthResponse.error('Password corrente non corretta');
      }

      if (newPassword.length < 6) {
        return AuthResponse.error('La nuova password deve essere di almeno 6 caratteri');
      }

      // Aggiorna password
      await _supabase.auth.updateUser(
        UserAttributes(password: newPassword)
      );

      return AuthResponse.success(user, message: 'Password cambiata con successo');

    } catch (e) {
      print('❌ [AUTH] Change password error: $e');
      return AuthResponse.error('Errore cambio password: $e');
    }
  }

  /// Reset password (invia email)
  Future<AuthResponse> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email);
      return AuthResponse.success(
        null, 
        message: 'Email di reset password inviata. Controlla la tua casella di posta.'
      );
    } catch (e) {
      print('❌ [AUTH] Reset password error: $e');
      return AuthResponse.error('Errore invio email reset: $e');
    }
  }

  /// Elimina account
  Future<AuthResponse> deleteAccount() async {
    try {
      final user = await getCurrentUser();
      if (user == null) {
        return AuthResponse.error('Utente non autenticato');
      }

      // Soft delete nel database
      await _dbService.deleteUser(user.id!);
      
      // Logout
      await logout();

      return AuthResponse.success(user, message: 'Account eliminato con successo');
    } catch (e) {
      print('❌ [AUTH] Delete account error: $e');
      return AuthResponse.error('Errore eliminazione account: $e');
    }
  }

  /// Listener per cambiamenti stato autenticazione
  Stream<AuthState> get onAuthStateChange => _supabase.auth.onAuthStateChange;
  
  /// Sessione corrente
  Session? get currentSession => _supabase.auth.currentSession;
  
  /// Refresh token se necessario
  Future<void> refreshSession() async {
    try {
      await _supabase.auth.refreshSession();
    } catch (e) {
      print('❌ [AUTH] Refresh session error: $e');
    }
  }
}