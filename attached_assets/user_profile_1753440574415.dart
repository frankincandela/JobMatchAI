// lib/models/user_profile.dart
class UserProfile {
  String? id;
  String biography;
  List<WorkExperience> experiences;
  String education;
  String certifications;
  String professionalReferences; // Rinominato da "references"
  String hobbies;
  String softSkills;
  String? cvFilePath;
  DateTime createdAt;
  DateTime updatedAt;

  UserProfile({
    this.id,
    required this.biography,
    required this.experiences,
    required this.education,
    required this.certifications,
    required this.professionalReferences, // Aggiornato
    required this.hobbies,
    required this.softSkills,
    this.cvFilePath,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'biography': biography,
      'experiences': experiences.map((e) => e.toMap()).toList(),
      'education': education,
      'certifications': certifications,
      'professional_references': professionalReferences, // Aggiornato per DB
      'hobbies': hobbies,
      'soft_skills': softSkills,
      'cv_file_path': cvFilePath,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory UserProfile.fromMap(Map<String, dynamic> map) {
    return UserProfile(
      id: map['id'],
      biography: map['biography'] ?? '',
      experiences: (map['experiences'] as List<dynamic>?)
          ?.map((e) => WorkExperience.fromMap(e))
          .toList() ?? [],
      education: map['education'] ?? '',
      certifications: map['certifications'] ?? '',
      professionalReferences: map['professional_references'] ?? '', // Aggiornato
      hobbies: map['hobbies'] ?? '',
      softSkills: map['soft_skills'] ?? '',
      cvFilePath: map['cv_file_path'],
      createdAt: DateTime.parse(map['created_at']),
      updatedAt: DateTime.parse(map['updated_at']),
    );
  }
}

class WorkExperience {
  String jobTitle;
  String description;
  String duration;

  WorkExperience({
    required this.jobTitle,
    required this.description,
    required this.duration,
  });

  Map<String, dynamic> toMap() {
    return {
      'job_title': jobTitle,
      'description': description,
      'duration': duration,
    };
  }

  factory WorkExperience.fromMap(Map<String, dynamic> map) {
    return WorkExperience(
      jobTitle: map['job_title'] ?? '',
      description: map['description'] ?? '',
      duration: map['duration'] ?? '',
    );
  }
}

class CareerSuggestion {
  String mainSector;
  String description;
  List<CareerPath> paths;
  List<Opportunity> opportunities;

  CareerSuggestion({
    required this.mainSector,
    required this.description,
    required this.paths,
    required this.opportunities,
  });
}

class CareerPath {
  String title;
  String description;
  String type;

  CareerPath({
    required this.title,
    required this.description,
    required this.type,
  });
}

class Opportunity {
  String title;
  String type;
  String description;
  String requirements;
  String company;
  double matchScore;
  String? location;
  String? salary;
  bool? isRemote;
  DateTime? applicationDeadline;
  List<String>? requiredSkills;
  List<String>? benefits;
  String? contactEmail;
  String? opportunityId; // Link al DB

  Opportunity({
    required this.title,
    required this.type,
    required this.description,
    required this.requirements,
    required this.company,
    this.matchScore = 0.0,
    this.location,
    this.salary,
    this.isRemote,
    this.applicationDeadline,
    this.requiredSkills,
    this.benefits,
    this.contactEmail,
    this.opportunityId,
  });
}