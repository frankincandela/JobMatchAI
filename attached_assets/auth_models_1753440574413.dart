// lib/models/auth_models.dart
import 'package:skilly/models/user.dart';

class LoginRequest {
  String email;
  String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'password': password,
    };
  }
}

class RegisterRequest {
  String email;
  String password;
  String confirmPassword;
  String? firstName;
  String? lastName;

  RegisterRequest({
    required this.email,
    required this.password,
    required this.confirmPassword,
    this.firstName,
    this.lastName,
  });

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'password': password,
      'confirm_password': confirmPassword,
      'first_name': firstName,
      'last_name': lastName,
    };
  }

  bool get isValid => 
      email.isNotEmpty && 
      password.isNotEmpty && 
      password == confirmPassword &&
      password.length >= 6;

  String? get validationError {
    if (email.isEmpty) return 'Email è obbligatoria';
    if (!_isValidEmail(email)) return 'Email non valida';
    if (password.isEmpty) return 'Password è obbligatoria';
    if (password.length < 6) return 'Password deve essere di almeno 6 caratteri';
    if (password != confirmPassword) return 'Le password non coincidono';
    return null;
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }
}

class AuthResponse {
  bool success;
  String? message;
  User? user;
  String? token; // Per future implementazioni JWT

  AuthResponse({
    required this.success,
    this.message,
    this.user,
    this.token,
  });

  factory AuthResponse.success(User user, {String? message}) {
    return AuthResponse(
      success: true,
      user: user,
      message: message,
    );
  }

  factory AuthResponse.error(String message) {
    return AuthResponse(
      success: false,
      message: message,
    );
  }
}