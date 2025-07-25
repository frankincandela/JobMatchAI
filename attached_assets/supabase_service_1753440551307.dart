// supabase_service.dart - aggiornato
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import '../models/job_opportunity.dart';
import '../models/application_model.dart';

class SupabaseDatabaseService {
  static final SupabaseDatabaseService instance = SupabaseDatabaseService._();
  SupabaseClient client = Supabase.instance.client;

  SupabaseDatabaseService._();

  Future<void> saveUserProfile(UserProfile profile) async {
    await client.from('user_profiles').upsert(profile.toJson());
  }

  Future<UserProfile?> getUserProfile(String userId) async {
    final data = await client.from('user_profiles').select().eq('id', userId).single();
    if (data != null) return UserProfile.fromJson(data);
    return null;
  }

  Future<void> saveUserApplication(String userId, String jobId) async {
    await client.from('applications').insert({
      'user_id': userId,
      'job_id': jobId,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<ApplicationModel>> fetchUserApplications(String userId) async {
    final data = await client.from('applications').select().eq('user_id', userId);
    return (data as List).map((e) => ApplicationModel.fromJson(e)).toList();
  }

  Future<String?> getApplicationStatus(String userId, String jobId) async {
    final result = await client.from('applications')
        .select('status')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .maybeSingle();
    return result?['status'];
  }

  Future<void> loadSampleData() async {
    // già presente, mantenuto se serve per sviluppo
  }
}

// File pulito da metodi legacy e da riferimenti a ApplicationService o DatabaseService
