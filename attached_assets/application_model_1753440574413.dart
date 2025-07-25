// lib/models/application_model.dart
class JobApplication {
  String? id;
  String opportunityId;
  String opportunityTitle;
  String companyName;
  String firstName;
  String lastName;
  String email;
  String? dateOfBirth;
  String address;
  String educationLevel;
  String institution;
  bool dataProcessingConsent;
  bool commercialConsent;
  bool newsletterConsent;
  DateTime submittedAt;
  String status; // submitted, reviewed, accepted, rejected

  JobApplication({
    this.id,
    required this.opportunityId,
    required this.opportunityTitle,
    required this.companyName,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.dateOfBirth,
    required this.address,
    required this.educationLevel,
    required this.institution,
    required this.dataProcessingConsent,
    required this.commercialConsent,
    required this.newsletterConsent,
    DateTime? submittedAt,
    this.status = 'submitted',
  }) : submittedAt = submittedAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'opportunity_id': opportunityId,
      'opportunity_title': opportunityTitle,
      'company_name': companyName,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'date_of_birth': dateOfBirth,
      'address': address,
      'education_level': educationLevel,
      'institution': institution,
      'data_processing_consent': dataProcessingConsent,
      'commercial_consent': commercialConsent,
      'newsletter_consent': newsletterConsent,
      'submitted_at': submittedAt.toIso8601String(),
      'status': status,
    };
  }

  factory JobApplication.fromMap(Map<String, dynamic> map) {
    return JobApplication(
      id: map['id'],
      opportunityId: map['opportunity_id'] ?? '',
      opportunityTitle: map['opportunity_title'] ?? '',
      companyName: map['company_name'] ?? '',
      firstName: map['first_name'] ?? '',
      lastName: map['last_name'] ?? '',
      email: map['email'] ?? '',
      dateOfBirth: map['date_of_birth'],
      address: map['address'] ?? '',
      educationLevel: map['education_level'] ?? '',
      institution: map['institution'] ?? '',
      dataProcessingConsent: map['data_processing_consent'] ?? false,
      commercialConsent: map['commercial_consent'] ?? false,
      newsletterConsent: map['newsletter_consent'] ?? false,
      submittedAt: DateTime.parse(map['submitted_at']),
      status: map['status'] ?? 'submitted',
    );
  }

  String get fullName => '$firstName $lastName';

  String get formattedSubmissionDate {
    return '${submittedAt.day}/${submittedAt.month}/${submittedAt.year} alle ${submittedAt.hour}:${submittedAt.minute.toString().padLeft(2, '0')}';
  }
}

// Enum per i livelli di istruzione
enum EducationLevel {
  licenzaMedia('Licenza Media'),
  diploma('Diploma'),
  laureaTriennale('Laurea Triennale'),
  laureaSpecialistica('Laurea Specialistica/Magistrale'),
  dottorato('Dottorato di Ricerca');

  const EducationLevel(this.displayName);
  final String displayName;

  static List<String> get allLevels => EducationLevel.values.map((e) => e.displayName).toList();
}