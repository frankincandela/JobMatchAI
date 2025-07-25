class JobOpportunity {
  String? id;
  String title;
  String companyId;
  String sector;
  String jobType; // full-time, part-time, contract, internship
  String experienceLevel; // entry, mid, senior
  String location;
  bool isRemote;
  String description;
  String requirements;
  List<String> responsibilities;
  List<String> requiredSkills;
  List<String> preferredSkills;
  int? salaryMin;
  int? salaryMax;
  List<String> benefits;
  DateTime? applicationDeadline;
  String contactEmail;
  bool isActive;
  DateTime createdAt;
  DateTime updatedAt;
  DateTime? expiryDate;

  JobOpportunity({
    this.id,
    required this.title,
    required this.companyId,
    required this.sector,
    required this.jobType,
    required this.experienceLevel,
    required this.location,
    this.isRemote = false,
    required this.description,
    required this.requirements,
    this.responsibilities = const [],
    this.requiredSkills = const [],
    this.preferredSkills = const [],
    this.salaryMin,
    this.salaryMax,
    this.benefits = const [],
    this.applicationDeadline,
    required this.contactEmail,
    this.isActive = true,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.expiryDate,
  }) : createdAt = createdAt ?? DateTime.now(),
       updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'company_id': companyId,
      'sector': sector,
      'job_type': jobType,
      'experience_level': experienceLevel,
      'location': location,
      'is_remote': isRemote,
      'description': description,
      'requirements': requirements,
      'responsibilities': responsibilities,
      'required_skills': requiredSkills,
      'preferred_skills': preferredSkills,
      'salary_min': salaryMin,
      'salary_max': salaryMax,
      'benefits': benefits,
      'application_deadline': applicationDeadline?.toIso8601String(),
      'contact_email': contactEmail,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'expiry_date': expiryDate?.toIso8601String(),
    };
  }

  factory JobOpportunity.fromMap(Map<String, dynamic> map) {
    return JobOpportunity(
      id: map['id'],
      title: map['title'] ?? '',
      companyId: map['company_id'] ?? '',
      sector: map['sector'] ?? '',
      jobType: map['job_type'] ?? '',
      experienceLevel: map['experience_level'] ?? '',
      location: map['location'] ?? '',
      isRemote: map['is_remote'] ?? false,
      description: map['description'] ?? '',
      requirements: map['requirements'] ?? '',
      responsibilities: List<String>.from(map['responsibilities'] ?? []),
      requiredSkills: List<String>.from(map['required_skills'] ?? []),
      preferredSkills: List<String>.from(map['preferred_skills'] ?? []),
      salaryMin: map['salary_min'],
      salaryMax: map['salary_max'],
      benefits: List<String>.from(map['benefits'] ?? []),
      applicationDeadline: map['application_deadline'] != null 
          ? DateTime.parse(map['application_deadline']) 
          : null,
      contactEmail: map['contact_email'] ?? '',
      isActive: map['is_active'] ?? true,
      createdAt: DateTime.parse(map['created_at']),
      updatedAt: DateTime.parse(map['updated_at']),
      expiryDate: map['expiry_date'] != null 
          ? DateTime.parse(map['expiry_date']) 
          : null,
    );
  }
}

class Company {
  String? id;
  String name;
  String sector;
  String size; // 1-10, 11-50, 51-200, 201-500, 500+
  String location;
  String description;
  String? website;
  String? logoUrl;
  String? contactEmail; // ← AGGIUNGI QUESTO CAMPO
  bool isActive;
  DateTime createdAt;
  DateTime updatedAt;

  Company({
    this.id,
    required this.name,
    required this.sector,
    required this.size,
    required this.location,
    required this.description,
    this.website,
    this.logoUrl,
    this.contactEmail, // ← AGGIUNGI QUESTO
    this.isActive = true,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) : createdAt = createdAt ?? DateTime.now(),
       updatedAt = updatedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'sector': sector,
      'size': size,
      'location': location,
      'description': description,
      'website': website,
      'logo_url': logoUrl,
      'contact_email': contactEmail, // ← AGGIUNGI QUESTO
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory Company.fromMap(Map<String, dynamic> map) {
    return Company(
      id: map['id'],
      name: map['name'] ?? '',
      sector: map['sector'] ?? '',
      size: map['size'] ?? '',
      location: map['location'] ?? '',
      description: map['description'] ?? '',
      website: map['website'],
      logoUrl: map['logo_url'],
      contactEmail: map['contact_email'], // ← AGGIUNGI QUESTO
      isActive: map['is_active'] ?? true,
      createdAt: DateTime.parse(map['created_at']),
      updatedAt: DateTime.parse(map['updated_at']),
    );
  }
}


class OpportunityMatch {
  String profileId;
  String opportunityId;
  double matchScore;
  Map<String, dynamic> matchDetails;
  DateTime createdAt;
  String? userAction; // viewed, applied, dismissed, saved

  OpportunityMatch({
    required this.profileId,
    required this.opportunityId,
    required this.matchScore,
    required this.matchDetails,
    required this.createdAt,
    this.userAction,
  });

  Map<String, dynamic> toMap() {
    return {
      'profile_id': profileId,
      'opportunity_id': opportunityId,
      'match_score': matchScore,
      'match_details': matchDetails,
      'created_at': createdAt.toIso8601String(),
      'user_action': userAction,
    };
  }

factory OpportunityMatch.fromMap(Map<String, dynamic> map) {
   return OpportunityMatch(
     profileId: map['profile_id'] ?? '',
     opportunityId: map['opportunity_id'] ?? '',
     matchScore: map['match_score']?.toDouble() ?? 0.0,
     matchDetails: Map<String, dynamic>.from(map['match_details'] ?? {}),
     createdAt: DateTime.parse(map['created_at']),
     userAction: map['user_action'],
   );
 }
}