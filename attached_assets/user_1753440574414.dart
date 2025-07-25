// lib/models/user.dart
class User {
  String? id;
  String email;
  String? firstName;
  String? lastName;
  String? dateOfBirth; // YYYY-MM-DD format
  String? profileImagePath;
  String? profileId; // Link al UserProfile per CV
  List<String> savedOpportunities; // IDs delle opportunità salvate
  DateTime createdAt;
  DateTime updatedAt;
  bool isActive;

  User({
    this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.dateOfBirth,
    this.profileImagePath,
    this.profileId,
    this.savedOpportunities = const [],
    DateTime? createdAt,
    DateTime? updatedAt,
    this.isActive = true,
  }) : createdAt = createdAt ?? DateTime.now(),
       updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'date_of_birth': dateOfBirth,
      'profile_image_path': profileImagePath,
      'profile_id': profileId,
      'saved_opportunities': savedOpportunities,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'is_active': isActive,
    };
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map['id'],
      email: map['email'] ?? '',
      firstName: map['first_name'],
      lastName: map['last_name'],
      dateOfBirth: map['date_of_birth'],
      profileImagePath: map['profile_image_path'],
      profileId: map['profile_id'],
      savedOpportunities: List<String>.from(map['saved_opportunities'] ?? []),
      createdAt: DateTime.parse(map['created_at']),
      updatedAt: DateTime.parse(map['updated_at']),
      isActive: map['is_active'] ?? true,
    );
  }

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
  
  bool get hasCompleteProfile => 
      firstName != null && 
      lastName != null && 
      dateOfBirth != null;

  int? get age {
    if (dateOfBirth == null) return null;
    final birthDate = DateTime.parse(dateOfBirth!);
    final today = DateTime.now();
    int age = today.year - birthDate.year;
    if (today.month < birthDate.month || 
        (today.month == birthDate.month && today.day < birthDate.day)) {
      age--;
    }
    return age;
  }
}

