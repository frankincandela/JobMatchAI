// lib/utils/validators.dart
class Validators {
  // Regex email più completa e standard RFC 5322
  static final RegExp _emailRegex = RegExp(
    r'^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
  );

  /// Valida email
  static String? validateEmail(String? value) {
    if (value?.isEmpty ?? true) return 'Email obbligatoria';
    if (!_emailRegex.hasMatch(value!.trim())) {
      return 'Email non valida';
    }
    return null;
  }

  /// Valida password
  static String? validatePassword(String? value, {int minLength = 6}) {
    if (value?.isEmpty ?? true) return 'Password obbligatoria';
    if (value!.length < minLength) {
      return 'Password deve essere di almeno $minLength caratteri';
    }
    return null;
  }

  /// Valida conferma password
  static String? validateConfirmPassword(String? value, String? originalPassword) {
    if (value?.isEmpty ?? true) return 'Conferma password obbligatoria';
    if (value != originalPassword) {
      return 'Le password non coincidono';
    }
    return null;
  }

  /// Valida nome
  static String? validateName(String? value, String fieldName) {
    if (value?.isEmpty ?? true) return '$fieldName obbligatorio';
    if (value!.trim().length < 2) {
      return '$fieldName deve contenere almeno 2 caratteri';
    }
    return null;
  }

  /// Valida biografia (per il profiling)
  static String? validateBiography(String? value, {int minLength = 50}) {
    if (value?.isEmpty ?? true) return 'Biografia obbligatoria';
    if (value!.trim().length < minLength) {
      return 'Biografia deve contenere almeno $minLength caratteri per un\'analisi accurata';
    }
    return null;
  }

  /// Controlla se email è valida (bool)
  static bool isValidEmail(String email) {
    return _emailRegex.hasMatch(email.trim());
  }

  /// Validazione avanzata email con suggerimenti
  static String? validateEmailAdvanced(String? value) {
    if (value?.isEmpty ?? true) return 'Email obbligatoria';
    
    final email = value!.trim().toLowerCase();
    
    // Controlli di base
    if (!_emailRegex.hasMatch(email)) {
      return 'Email non valida';
    }
    
    // Controlli aggiuntivi
    if (email.startsWith('.') || email.endsWith('.')) {
      return 'Email non può iniziare o finire con un punto';
    }
    
    if (email.contains('..')) {
      return 'Email non può contenere punti consecutivi';
    }
    
    // Domini comuni - suggerimenti
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    final domain = email.split('@').last;
    
    // Controllo per errori di battitura comuni
    if (domain == 'gmai.com') return 'Forse intendevi gmail.com?';
    if (domain == 'yhoo.com') return 'Forse intendevi yahoo.com?';
    
    return null;
  }
}