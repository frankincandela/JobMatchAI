// lib/models/opportunity_type.dart

enum OpportunityType {
  job,
  training,
  internship,
  all
}

extension OpportunityTypeExtension on OpportunityType {
  String get displayName {
    switch (this) {
      case OpportunityType.job:
        return 'Lavoro';
      case OpportunityType.training:
        return 'Formazione';
      case OpportunityType.internship:
        return 'Stage';
      case OpportunityType.all:
        return 'Tutte';
    }
  }

  String get value {
    switch (this) {
      case OpportunityType.job:
        return 'job';
      case OpportunityType.training:
        return 'training';
      case OpportunityType.internship:
        return 'internship';
      case OpportunityType.all:
        return 'all';
    }
  }

  static OpportunityType fromString(String value) {
    switch (value.toLowerCase()) {
      case 'job':
        return OpportunityType.job;
      case 'training':
        return OpportunityType.training;
      case 'internship':
        return OpportunityType.internship;
      case 'all':
      default:
        return OpportunityType.all;
    }
  }
}