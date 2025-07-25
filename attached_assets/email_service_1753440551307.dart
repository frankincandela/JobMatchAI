// lib/services/email_service.dart
import '../models/application_model.dart';

class EmailService {
  static const String _fromEmail = 'noreply@careerguida.com';
  static const String _fromName = 'Career Guidance';

  /// Invia email di conferma candidatura all'utente
  static Future<bool> sendApplicationConfirmation(JobApplication application) async {
    try {
      print('📧 =================================');
      print('📧 INVIO EMAIL DI CONFERMA CANDIDATURA');
      print('📧 =================================');
      
      final emailContent = _buildApplicationConfirmationEmail(application);
      
      // Simula invio email (in produzione useresti un servizio reale)
      await _simulateEmailSending(
        to: application.email,
        subject: 'Conferma candidatura - ${application.opportunityTitle}',
        content: emailContent,
      );
      
      print('✅ Email di conferma inviata con successo a: ${application.email}');
      return true;
      
    } catch (e) {
      print('❌ Errore invio email di conferma: $e');
      return false;
    }
  }

  /// Invia email di candidatura all'azienda
  static Future<bool> sendApplicationToCompany(JobApplication application, String companyEmail) async {
    try {
      print('📧 =================================');
      print('📧 INVIO CANDIDATURA ALL\'AZIENDA');
      print('📧 =================================');
      
      final emailContent = _buildApplicationEmailForCompany(application);
      
      await _simulateEmailSending(
        to: companyEmail,
        subject: 'Nuova candidatura - ${application.opportunityTitle}',
        content: emailContent,
      );
      
      print('✅ Candidatura inviata con successo a: $companyEmail');
      return true;
      
    } catch (e) {
      print('❌ Errore invio candidatura: $e');
      return false;
    }
  }

  /// Simula l'invio di una email
  static Future<void> _simulateEmailSending({
    required String to,
    required String subject,
    required String content,
  }) async {
    print('📧 From: $_fromName <$_fromEmail>');
    print('📧 To: $to');
    print('📧 Subject: $subject');
    print('📧 --------------------------------');
    print(content);
    print('📧 --------------------------------');
    
    // Simula il tempo di invio
    await Future.delayed(Duration(milliseconds: 500));
  }

  /// Costruisce il contenuto email di conferma per l'utente
  static String _buildApplicationConfirmationEmail(JobApplication application) {
    return '''
Ciao ${application.fullName}!

🎉 La tua candidatura è stata inviata con successo! 🎉

📋 RIEPILOGO CANDIDATURA
━━━━━━━━━━━━━━━━━━━━━━━━━
💼 Posizione: ${application.opportunityTitle}
🏢 Azienda: ${application.companyName}
📅 Data invio: ${application.formattedSubmissionDate}

👤 I TUOI DATI INVIATI
━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Nome: ${application.fullName}
📧 Email: ${application.email}
🎂 Data di nascita: ${_formatDate(application.dateOfBirth)}
🏠 Residenza: ${application.address}
🎓 Formazione: ${application.educationLevel}
🏫 Istituto: ${application.institution}

📋 CONSENSI FORNITI
━━━━━━━━━━━━━━━━━━━━━━━━━
${application.dataProcessingConsent ? '✅' : '❌'} Trattamento dati personali
${application.commercialConsent ? '✅' : '❌'} Comunicazioni commerciali
${application.newsletterConsent ? '✅' : '❌'} Newsletter

🔔 PROSSIMI PASSI
━━━━━━━━━━━━━━━━━━━━━━━━━
L'azienda riceverà la tua candidatura e ti contatterà direttamente se il tuo profilo risulta compatibile con la posizione.

Nel frattempo, continua a esplorare altre opportunità sulla piattaforma Career Guidance!

Ti ringraziamo per aver scelto Career Guidance per il tuo percorso professionale.

Buona fortuna! 🚀

---
Team Career Guidance
Questa è una email automatica, non rispondere a questo messaggio.
''';
  }

  /// Costruisce il contenuto email per l'azienda
  static String _buildApplicationEmailForCompany(JobApplication application) {
    return '''
📋 NUOVA CANDIDATURA RICEVUTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 POSIZIONE: ${application.opportunityTitle}
📅 Data candidatura: ${application.formattedSubmissionDate}

👤 INFORMAZIONI CANDIDATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Nome completo: ${application.fullName}
📧 Email: ${application.email}
🎂 Data di nascita: ${_formatDate(application.dateOfBirth)}
🏠 Residenza: ${application.address}

🎓 FORMAZIONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 Livello di istruzione: ${application.educationLevel}
🏫 Istituto: ${application.institution}

📋 CONSENSI PRIVACY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${application.dataProcessingConsent ? '✅ Accettato' : '❌ Non accettato'} - Trattamento dati personali
${application.commercialConsent ? '✅ Accettato' : '❌ Non accettato'} - Comunicazioni commerciali
${application.newsletterConsent ? '✅ Accettato' : '❌ Non accettato'} - Newsletter

📞 CONTATTA IL CANDIDATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Puoi contattare direttamente il candidato all'indirizzo: ${application.email}

Il candidato ha fornito il consenso al trattamento dei dati personali per finalità legate alla selezione.

---
Candidatura inviata tramite Career Guidance Platform
Per supporto: support@careerguida.com
''';
  }

  /// Formatta una data per la visualizzazione
  static String _formatDate(String? dateString) {
    if (dateString == null || dateString.isEmpty) return 'Non specificato';
    
    try {
      final date = DateTime.parse(dateString);
      final months = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ];
      return '${date.day} ${months[date.month - 1]} ${date.year}';
    } catch (e) {
      return dateString;
    }
  }

  /// Validatore email
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  /// Invia email di benvenuto (per nuovi utenti)
  static Future<bool> sendWelcomeEmail(String userEmail, String userName) async {
    try {
      final emailContent = '''
Ciao $userName!

🎉 Benvenuto/a in Career Guidance! 🎉

Siamo felici di averti con noi. La nostra piattaforma ti aiuterà a:
- 🎯 Scoprire il tuo percorso professionale ideale
- 💼 Trovare opportunità di lavoro personalizzate
- 📈 Crescere professionalmente con consigli AI

Inizia subito creando il tuo profilo professionale!

Buona fortuna nel tuo percorso! 🚀

Team Career Guidance
''';

      await _simulateEmailSending(
        to: userEmail,
        subject: 'Benvenuto in Career Guidance! 🎉',
        content: emailContent,
      );
      
      return true;
    } catch (e) {
      print('❌ Errore invio email di benvenuto: $e');
      return false;
    }
  }
}