import 'package:flutter/material.dart';

class AppConstants {
  static const String appName = 'Career Guidance';
  static const String appVersion = '1.0.0';
  
  // =================
  // OPENAI CONFIGURATION
  // =================
  
  /// URL base dell'API OpenAI
  static const String openaiBaseUrl = 'https://api.openai.com/v1';
  
  /// API Key OpenAI - IMPORTANTE: Sostituisci con la tua chiave reale
  static const String openaiApiKey = 'sk-your-actual-api-key-here';
  
  /// Modello da utilizzare per l'analisi
  static const String openaiModel = 'gpt-4';  // Opzioni: 'gpt-4', 'gpt-3.5-turbo'
  
  /// Numero massimo di token nella risposta
  static const int openaiMaxTokens = 1000;
  
  /// Temperatura per la creatività (0.0 = deterministico, 1.0 = molto creativo)
  static const double openaiTemperature = 0.7;
  
  /// Timeout per le chiamate API (in secondi)
  static const int openaiTimeoutSeconds = 30;
  
  /// Numero massimo di retry in caso di errore
  static const int openaiMaxRetries = 3;
  
  /// Ritardo tra i retry (in millisecondi)
  static const int openaiRetryDelayMs = 1000;
  
  // =================
  // PROMPT TEMPLATES
  // =================
  
  /// Prompt di sistema per ChatGPT
  static const String openaiSystemPrompt = '''
Sei un esperto career counselor con 20 anni di esperienza nell'orientamento professionale.
Analizza il profilo professionale fornito e restituisci SEMPRE una risposta in formato JSON valido seguendo ESATTAMENTE questa struttura:

{
  "mainSector": "uno tra: Informatica, Ristorazione, Accoglienza, Agricoltura, Imprenditoria",
  "description": "spiegazione dettagliata del perché questo settore è il più adatto",
  "confidence": 0.85,
  "strengths": ["punto di forza 1", "punto di forza 2", "punto di forza 3"],
  "recommendations": ["raccomandazione 1", "raccomandazione 2", "raccomandazione 3"],
  "skillGaps": ["skill mancante 1", "skill mancante 2"],
  "careerPaths": [
    {
      "title": "Percorso principale",
      "description": "descrizione del percorso",
      "timeframe": "6-12 mesi",
      "difficulty": "medio"
    },
    {
      "title": "Percorso alternativo", 
      "description": "descrizione percorso alternativo",
      "timeframe": "12-18 mesi",
      "difficulty": "alto"
    }
  ]
}

IMPORTANTE: Rispondi SOLO con il JSON, nessun altro testo.
''';

  /// Template per il prompt utente
  static const String openaiUserPromptTemplate = '''
Analizza questo profilo professionale:

BIOGRAFIA E ASPIRAZIONI:
{biography}

EDUCAZIONE:
{education}

ESPERIENZE LAVORATIVE:
{experiences}

COMPETENZE TRASVERSALI:
{softSkills}

CERTIFICAZIONI:
{certifications}

HOBBY E INTERESSI:
{hobbies}

Fornisci un'analisi completa in formato JSON seguendo la struttura richiesta.
''';

  // =================
  // AI FALLBACK SETTINGS
  // =================
  
  /// Usa analisi locale se OpenAI fallisce
  static const bool enableLocalFallback = true;
  
  /// Salva le risposte AI per debug
  static const bool saveAiResponses = true;
  
  /// Modalità debug per l'AI
  static const bool aiDebugMode = true;
  
  // =================
  // SECTORAL DATA
  // =================
  
  static const List<String> sectors = [
    'Informatica',
    'Ristorazione', 
    'Accoglienza',
    'Agricoltura',
    'Imprenditoria',
  ];
  
  static const Map<String, List<String>> sectorKeywords = {
    'Informatica': ['programma', 'sviluppo', 'web', 'computer', 'software', 'app', 'javascript', 'python', 'java', 'react', 'flutter'],
    'Ristorazione': ['cuoco', 'ristorazione', 'chef', 'cucina', 'ristorante', 'food', 'beverage', 'servizio'],
    'Accoglienza': ['hotel', 'turismo', 'accoglienza', 'reception', 'ospitalità', 'travel', 'eventi'],
    'Agricoltura': ['agricoltura', 'agricolo', 'campagna', 'coltivazione', 'terra', 'biologico', 'sostenibile'],
    'Imprenditoria': ['impresa', 'business', 'startup', 'manager', 'azienda', 'leadership', 'vendite'],
  };
  
  static const Map<String, Color> sectorColors = {
    'Informatica': Color(0xFF2196F3),
    'Ristorazione': Color(0xFFFF9800), 
    'Accoglienza': Color(0xFF4CAF50),
    'Agricoltura': Color(0xFF8BC34A),
    'Imprenditoria': Color(0xFF9C27B0),
  };
  
  // =================
  // ERROR MESSAGES
  // =================
  
  static const String errorApiKeyMissing = 'API Key OpenAI non configurata. Controlla le impostazioni.';
  static const String errorNetworkTimeout = 'Timeout nella connessione. Verifica la connessione internet.';
  static const String errorInvalidResponse = 'Risposta AI non valida. Riprova tra qualche minuto.';
  static const String errorQuotaExceeded = 'Quota API superata. Controlla il tuo piano OpenAI.';
  static const String errorGeneric = 'Errore durante l\'analisi AI. Utilizzando analisi locale.';
  
  // =================
  // VALIDATION RULES
  // =================
  
  /// Lunghezza minima biografia per analisi AI
  static const int minBiographyLength = 50;
  
  /// Lunghezza massima biografia per analisi AI
  static const int maxBiographyLength = 2000;
  
  /// Numero minimo di esperienze per analisi completa
  static const int minExperiencesForFullAnalysis = 1;
}