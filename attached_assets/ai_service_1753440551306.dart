// lib/services/ai_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_profile.dart';
import '../models/job_opportunity.dart';
import '../services/supabase_service.dart';
import '../services/database_service.dart';
import '../utils/constants.dart';

class AIService {
  /// Analizza un profilo utente e genera suggerimenti di carriera
  static Future<CareerSuggestion> analyzeProfile(UserProfile profile) async {
    // Validazione input usando le costanti
    if (!_validateInput(profile)) {
      if (AppConstants.aiDebugMode) {
        print('⚠️ Input non valido, uso analisi locale');
      }
      return await _analyzeProfileLocally(profile);
    }

    try {
      // Controllo se usare analisi locale o OpenAI
      if (AppConstants.enableLocalFallback && 
          AppConstants.openaiApiKey == 'sk-your-actual-api-key-here') {
        if (AppConstants.aiDebugMode) {
          print('🏠 Uso analisi locale (API Key non configurata)');
        }
        return await _analyzeProfileLocally(profile);
      } else {
        if (AppConstants.aiDebugMode) {
          print('🤖 Chiamata OpenAI API');
        }
        return await _analyzeWithOpenAI(profile);
      }
    } catch (e) {
      // In caso di errore con OpenAI, usa analisi locale
      if (AppConstants.aiDebugMode) {
        print('❌ Errore nell\'analisi AI: $e');
      }
      
      if (AppConstants.enableLocalFallback) {
        return await _analyzeProfileLocally(profile);
      } else {
        throw Exception(AppConstants.errorGeneric);
      }
    }
  }

  /// Validazione input usando le costanti
  static bool _validateInput(UserProfile profile) {
    if (profile.biography.length < AppConstants.minBiographyLength) {
      return false;
    }
    if (profile.biography.length > AppConstants.maxBiographyLength) {
      return false;
    }
    return true;
  }

  /// Analisi locale del profilo (fallback quando OpenAI non è disponibile)
  static Future<CareerSuggestion> _analyzeProfileLocally(UserProfile profile) async {
    String text = '${profile.biography} ${profile.education} ${profile.experiences.map((e) => e.jobTitle).join(' ')}'.toLowerCase();
    
    String mainSector = 'Informatica'; // Default
    String description = 'Settore identificato attraverso l\'analisi delle tue competenze e aspirazioni.';
    
    // Usa le keywords parametrizzate dalle costanti
    int maxMatches = 0;
    for (String sector in AppConstants.sectors) {
      List<String> keywords = AppConstants.sectorKeywords[sector] ?? [];
      int matchCount = 0;
      
      for (String keyword in keywords) {
        if (text.contains(keyword)) {
          matchCount++;
        }
      }
      
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        mainSector = sector;
      }
    }

    List<CareerPath> paths = [
      CareerPath(
        title: 'Prosegui in $mainSector',
        description: 'Approfondisci le tue competenze attuali e cresci nel settore dove hai già esperienza.',
        type: 'continue',
      ),
      CareerPath(
        title: 'Esplora Nuove Opportunità',
        description: 'Scopri come le tue competenze possono essere applicate in settori complementari.',
        type: 'pivot',
      ),
    ];

    // CHIAMATA ASINCRONA AL DATABASE
    List<Opportunity> opportunities = await _generateOpportunities(mainSector);

    return CareerSuggestion(
      mainSector: mainSector,
      description: 'Basandoci sulla tua esperienza e competenze, abbiamo identificato $mainSector come il tuo settore di maggiore affinità.',
      paths: paths,
      opportunities: opportunities,
    );
  }
  
  /// Analisi usando OpenAI API
  static Future<CareerSuggestion> _analyzeWithOpenAI(UserProfile profile) async {
    int retryCount = 0;
    
    while (retryCount < AppConstants.openaiMaxRetries) {
      try {
        // Costruisci il prompt usando il template delle costanti
        final userPrompt = _buildUserPrompt(profile);
        
        final response = await http.post(
          Uri.parse('${AppConstants.openaiBaseUrl}/chat/completions'),
          headers: {
            'Authorization': 'Bearer ${AppConstants.openaiApiKey}',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({
            'model': AppConstants.openaiModel,
            'messages': [
              {
                'role': 'system',
                'content': AppConstants.openaiSystemPrompt
              },
              {
                'role': 'user',
                'content': userPrompt
              }
            ],
            'max_tokens': AppConstants.openaiMaxTokens,
            'temperature': AppConstants.openaiTemperature,
          }),
        ).timeout(Duration(seconds: AppConstants.openaiTimeoutSeconds));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final aiResponse = data['choices'][0]['message']['content'];
          
          if (AppConstants.saveAiResponses) {
            print('🤖 Risposta AI: $aiResponse');
          }
          
          return await _parseAIResponse(aiResponse);
          
        } else if (response.statusCode == 429) {
          throw Exception(AppConstants.errorQuotaExceeded);
        } else if (response.statusCode == 401) {
          throw Exception(AppConstants.errorApiKeyMissing);
        } else {
          throw Exception('HTTP ${response.statusCode}: ${response.body}');
        }
        
      } catch (e) {
        retryCount++;
        if (retryCount >= AppConstants.openaiMaxRetries) {
          throw e;
        }
        
        if (AppConstants.aiDebugMode) {
          print('🔄 Retry $retryCount/${AppConstants.openaiMaxRetries}: $e');
        }
        
        // Attesa progressiva tra i retry
        await Future.delayed(
          Duration(milliseconds: AppConstants.openaiRetryDelayMs * retryCount)
        );
      }
    }
    
    throw Exception(AppConstants.errorGeneric);
  }

  /// Costruisce il prompt utente usando il template delle costanti
  static String _buildUserPrompt(UserProfile profile) {
    return AppConstants.openaiUserPromptTemplate
        .replaceAll('{biography}', profile.biography)
        .replaceAll('{education}', profile.education)
        .replaceAll('{experiences}', _formatExperiences(profile.experiences))
        .replaceAll('{softSkills}', profile.softSkills)
        .replaceAll('{certifications}', profile.certifications)
        .replaceAll('{hobbies}', profile.hobbies);
  }

  /// Formatta le esperienze per il prompt
  static String _formatExperiences(List<WorkExperience> experiences) {
    if (experiences.isEmpty) return 'Nessuna esperienza lavorativa specificata';
    
    return experiences.map((exp) => 
      '• ${exp.jobTitle} (${exp.duration}): ${exp.description}'
    ).join('\n');
  }

  /// Parsing della risposta AI usando le validazioni delle costanti
  static Future<CareerSuggestion> _parseAIResponse(String aiResponse) async {
    try {
      // Pulisci la risposta da eventuali caratteri extra
      String cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.substring(7);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
      }
      
      final analysisData = jsonDecode(cleanedResponse);
      
      String mainSector = analysisData['mainSector'] ?? 'Informatica';
      
      // Validazione che il settore sia tra quelli supportati
      if (!AppConstants.sectors.contains(mainSector)) {
        mainSector = 'Informatica'; // Fallback a settore default
      }
      
      // Genera opportunità in modo asincrono
      List<Opportunity> opportunities = await _generateOpportunities(mainSector);
      
      return CareerSuggestion(
        mainSector: mainSector,
        description: analysisData['description'] ?? 'Analisi non disponibile',
        paths: [
          CareerPath(
            title: 'Prosegui in $mainSector',
            description: analysisData['careerPaths']?[0]?['description'] ?? 
                        'Approfondisci le competenze nel tuo settore',
            type: 'continue',
          ),
          CareerPath(
            title: 'Esplora nuove opportunità',
            description: analysisData['careerPaths']?[1]?['description'] ?? 
                        'Applica le tue competenze in settori complementari',
            type: 'pivot',
          ),
        ],
        opportunities: opportunities,
      );
      
    } catch (e) {
      if (AppConstants.aiDebugMode) {
        print('❌ Errore parsing AI response: $e');
        print('📄 Raw response: $aiResponse');
      }
      throw Exception(AppConstants.errorInvalidResponse);
    }
  }

  /// Genera opportunità dal database o fallback hardcoded
  static Future<List<Opportunity>> _generateOpportunities(String sector) async {
    try {
      if (AppConstants.aiDebugMode) {
        print('🔍 Cercando opportunità per settore: $sector');
      }
      
      // Ottieni opportunità dal database
      List<JobOpportunity> dbOpportunities = await SupabaseService.instance
          .getOpportunitiesBySector(sector, limit: 10);
      
      if (dbOpportunities.isEmpty) {
        if (AppConstants.aiDebugMode) {
          print('⚠️ Nessuna opportunità nel DB, uso fallback hardcoded');
        }
        return DatabaseService.generateHardcodedOpportunities(sector);
      }
      
      // Converti in formato Opportunity
      List<Opportunity> opportunities = [];
      
      for (var dbOpp in dbOpportunities) {
        Company? company = await SupabaseService.instance.getCompany(dbOpp.companyId);
        
        opportunities.add(Opportunity(
          title: dbOpp.title,
          type: DatabaseService.mapJobTypeToOpportunityType(dbOpp.jobType),
          description: dbOpp.description,
          requirements: dbOpp.requirements,
          company: company?.name ?? 'Azienda',
          location: dbOpp.location,
          salary: DatabaseService.formatSalary(dbOpp.salaryMin, dbOpp.salaryMax),
          isRemote: dbOpp.isRemote,
          applicationDeadline: dbOpp.applicationDeadline,
          requiredSkills: dbOpp.requiredSkills,
          benefits: dbOpp.benefits,
          contactEmail: dbOpp.contactEmail,
          opportunityId: dbOpp.id,
          matchScore: 0.75, // Score di default
        ));
      }
      
      if (AppConstants.aiDebugMode) {
        print('✅ Trovate ${opportunities.length} opportunità dal database');
      }
      
      return opportunities;
      
    } catch (e) {
      if (AppConstants.aiDebugMode) {
        print('❌ Errore accesso database: $e');
      }
      
      // Fallback a opportunità hardcoded
      return DatabaseService.generateHardcodedOpportunities(sector);
    }
  }

  /// Ottieni opportunità dal database con match score personalizzato
  static Future<List<Opportunity>> getOpportunitiesFromDB(String sector, String profileId) async {
    try {
      // 1. Ottieni opportunità dal database filtrate per settore
      List<JobOpportunity> dbOpportunities = await SupabaseService.instance
          .getOpportunitiesBySector(sector, limit: 20);

      // 2. Calcola match scores per il profilo specifico
      List<OpportunityMatch> matches = await SupabaseService.instance
          .calculateMatches(profileId, limit: 15);

      // 3. Combina opportunità con match scores
      Map<String, double> matchScores = {};
      for (var match in matches) {
        matchScores[match.opportunityId] = match.matchScore;
      }

      // 4. Converti in formato Opportunity per compatibilità
      List<Opportunity> opportunities = [];
      
      for (var dbOpp in dbOpportunities) {
        // Ottieni informazioni azienda
        Company? company = await DatabaseService.instance.getCompany(dbOpp.companyId);
        
        opportunities.add(Opportunity(
          title: dbOpp.title,
          type: DatabaseService.mapJobTypeToOpportunityType(dbOpp.jobType),
          description: dbOpp.description,
          requirements: dbOpp.requirements,
          company: company?.name ?? 'Azienda',
          // Aggiungi match score se disponibile
          matchScore: matchScores[dbOpp.id] ?? 0.0,
          // Aggiungi dati aggiuntivi
          location: dbOpp.location,
          salary: DatabaseService.formatSalary(dbOpp.salaryMin, dbOpp.salaryMax),
          isRemote: dbOpp.isRemote,
          applicationDeadline: dbOpp.applicationDeadline,
          requiredSkills: dbOpp.requiredSkills,
          benefits: dbOpp.benefits,
          contactEmail: dbOpp.contactEmail,
          opportunityId: dbOpp.id,
        ));
      }

      // 5. Ordina per match score decrescente
      opportunities.sort((a, b) => b.matchScore.compareTo(a.matchScore));

      if (AppConstants.aiDebugMode) {
        print('🎯 Trovate ${opportunities.length} opportunità per settore $sector');
      }

      return opportunities;

    } catch (e) {
      if (AppConstants.aiDebugMode) {
        print('❌ Errore recupero opportunità DB: $e');
      }
      
      // Fallback a opportunità hardcoded
      return DatabaseService.generateHardcodedOpportunities(sector);
    }
  }

  /// Ottieni opportunità filtrate per tipo
  static Future<List<Opportunity>> getOpportunitiesByType(String sector, String type, {String? profileId}) async {
    try {
      List<Opportunity> allOpportunities;
      
      if (profileId != null) {
        allOpportunities = await getOpportunitiesFromDB(sector, profileId);
      } else {
        allOpportunities = await _generateOpportunities(sector);
      }
      
      switch (type.toLowerCase()) {
        case 'work':
        case 'job':
          return allOpportunities
              .where((opp) => opp.type == 'job' || opp.type == 'internship')
              .toList();
        case 'training':
        case 'formative':
          return allOpportunities
              .where((opp) => opp.type == 'training')
              .toList();
        case 'internship':
        case 'stage':
          return allOpportunities
              .where((opp) => opp.type == 'internship')
              .toList();
        case 'all':
        default:
          return allOpportunities;
      }
    } catch (e) {
      if (AppConstants.aiDebugMode) {
        print('❌ Errore filtro opportunità per tipo $type: $e');
      }
      return [];
    }
  }

  /// Analizza compatibilità tra profilo e opportunità
  static double calculateProfileOpportunityMatch(UserProfile profile, Opportunity opportunity) {
    double score = 0.0;
    
    // 1. Match skills (peso 50%)
    if (opportunity.requiredSkills != null) {
      List<String> profileSkills = _extractSkillsFromProfile(profile);
      double skillsMatch = _calculateSkillsMatch(profileSkills, opportunity.requiredSkills!);
      score += skillsMatch * 0.5;
    }
    
    // 2. Match tipo di opportunità con aspirazioni (peso 30%)
    String profileText = profile.biography.toLowerCase();
    if (opportunity.type == 'job' && (profileText.contains('lavoro') || profileText.contains('carriera'))) {
      score += 0.3;
    } else if (opportunity.type == 'training' && (profileText.contains('imparare') || profileText.contains('corso'))) {
      score += 0.3;
    }
    
    // 3. Match location/remote preference (peso 20%)
    if (opportunity.isRemote == true && profileText.contains('remoto')) {
      score += 0.2;
    } else if (opportunity.location != null) {
      // Assume match geografico base
      score += 0.1;
    }
    
    return score.clamp(0.0, 1.0);
  }

  /// Estrai skills dal profilo utente
  static List<String> _extractSkillsFromProfile(UserProfile profile) {
    List<String> skills = [];
    
    String allText = '${profile.biography} ${profile.softSkills} ${profile.experiences.map((e) => e.description).join(' ')}'.toLowerCase();
    
    // Lista di skills comuni da cercare
    List<String> commonSkills = [
      'javascript', 'python', 'java', 'react', 'flutter', 'node.js',
      'leadership', 'teamwork', 'communication', 'problem solving',
      'photoshop', 'illustrator', 'figma', 'sketch',
      'excel', 'powerpoint', 'word', 'project management',
      'cucina', 'servizio', 'accoglienza', 'inglese', 'marketing'
    ];
    
    for (String skill in commonSkills) {
      if (allText.contains(skill)) {
        skills.add(skill);
      }
    }
    
    return skills;
  }

  /// Calcola match tra skills
  static double _calculateSkillsMatch(List<String> profileSkills, List<String> requiredSkills) {
    if (requiredSkills.isEmpty) return 0.5;
    
    int matchingSkills = 0;
    for (String required in requiredSkills) {
      for (String profile in profileSkills) {
        if (profile.toLowerCase().contains(required.toLowerCase()) || 
            required.toLowerCase().contains(profile.toLowerCase())) {
          matchingSkills++;
          break;
        }
      }
    }
    
    return matchingSkills / requiredSkills.length;
  }

  /// Genera suggerimenti di miglioramento per il profilo
  static List<String> generateProfileImprovements(UserProfile profile, String targetSector) {
    List<String> improvements = [];
    
    // Analizza completezza profilo
    if (profile.education.isEmpty) {
      improvements.add('Aggiungi informazioni sulla tua formazione ed educazione');
    }
    
    if (profile.experiences.length < 2) {
      improvements.add('Inserisci più dettagli sulle tue esperienze lavorative');
    }
    
    if (profile.softSkills.isEmpty) {
      improvements.add('Descrivi le tue competenze trasversali (soft skills)');
    }
    
    if (profile.certifications.isEmpty) {
      improvements.add('Elenca eventuali certificazioni o corsi completati');
    }
    
    // Suggerimenti specifici per settore
    Map<String, List<String>> sectorSuggestions = {
      'Informatica': [
        'Considera di aggiungere progetti GitHub o portfolio online',
        'Specifica i linguaggi di programmazione che conosci',
        'Includi framework e tecnologie utilizzate'
      ],
      'Ristorazione': [
        'Aggiungi dettagli su cucine internazionali che conosci',
        'Specifica se hai certificazioni HACCP',
        'Includi esperienza con eventi o catering'
      ],
      'Accoglienza': [
        'Specifica le lingue straniere che parli',
        'Aggiungi esperienza con sistemi di prenotazione',
        'Includi formazione nel customer service'
      ],
    };
    
    if (sectorSuggestions.containsKey(targetSector)) {
      improvements.addAll(sectorSuggestions[targetSector]!);
    }
    
    return improvements;
  }

  /// Valuta qualità generale del profilo
  static Map<String, dynamic> evaluateProfileQuality(UserProfile profile) {
    double completeness = 0.0;
    List<String> missingFields = [];
    
    // Valuta completezza campi (peso diverso per importanza)
    if (profile.biography.length >= 100) {
      completeness += 0.3;
    } else {
      missingFields.add('Biografia troppo breve (minimo 100 caratteri)');
    }
    
    if (profile.experiences.isNotEmpty) {
      completeness += 0.25;
    } else {
      missingFields.add('Nessuna esperienza lavorativa');
    }
    
    if (profile.education.isNotEmpty) {
      completeness += 0.2;
    } else {
      missingFields.add('Informazioni educazione mancanti');
    }
    
    if (profile.softSkills.isNotEmpty) {
      completeness += 0.15;
    } else {
      missingFields.add('Soft skills non specificate');
    }
    
    if (profile.certifications.isNotEmpty) {
      completeness += 0.1;
    }
    
    String qualityLevel;
    if (completeness >= 0.8) {
      qualityLevel = 'Eccellente';
    } else if (completeness >= 0.6) {
      qualityLevel = 'Buono';
    } else if (completeness >= 0.4) {
      qualityLevel = 'Medio';
    } else {
      qualityLevel = 'Da migliorare';
    }
    
    return {
      'completeness_percentage': (completeness * 100).round(),
      'quality_level': qualityLevel,
      'missing_fields': missingFields,
      'score': completeness,
    };
  }
}