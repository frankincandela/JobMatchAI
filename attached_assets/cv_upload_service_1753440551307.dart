// lib/services/cv_upload_service.dart
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class CVUploadService {
  static final CVUploadService instance = CVUploadService._internal();
  CVUploadService._internal();
  
  final SupabaseClient _supabase = Supabase.instance.client;
  
  /// Seleziona e carica un CV
  Future<Map<String, dynamic>?> pickAndUploadCV({String? userId}) async {
    try {
      // 1. Seleziona file
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx'],
        withData: true, // Importante per web
      );

      if (result == null || result.files.isEmpty) {
        return null;
      }

      final file = result.files.first;
      
      // Validazione
      if (file.bytes == null) {
        throw Exception('Impossibile leggere il file');
      }
      
      // Limite dimensione file (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw Exception('Il file è troppo grande. Massimo 10MB.');
      }
      
      // 2. Prepara il percorso
      final currentUser = _supabase.auth.currentUser;
      final userIdToUse = userId ?? currentUser?.id ?? 'anonymous';
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final fileName = '${timestamp}_${file.name}';
      final filePath = '$userIdToUse/$fileName';
      
      print('📤 Caricamento CV: $filePath');
      
      // 3. Upload su Supabase Storage
      final response = await _supabase.storage
          .from('cvs')
          .uploadBinary(
            filePath,
            file.bytes!,
            fileOptions: FileOptions(
              contentType: _getContentType(file.extension),
              upsert: true,
            ),
          );
      
      // 4. Ottieni URL pubblico
      final publicUrl = _supabase.storage
          .from('cvs')
          .getPublicUrl(filePath);
      
      print('✅ CV caricato con successo: $publicUrl');
      
      return {
        'fileName': file.name,
        'filePath': filePath,
        'publicUrl': publicUrl,
        'size': file.size,
        'uploadedAt': DateTime.now().toIso8601String(),
      };
      
    } catch (e) {
      print('❌ Errore upload CV: $e');
      throw Exception('Errore durante il caricamento del CV: $e');
    }
  }
  
  /// Elimina un CV dallo storage
  Future<bool> deleteCV(String filePath) async {
    try {
      await _supabase.storage
          .from('cvs')
          .remove([filePath]);
      
      print('✅ CV eliminato: $filePath');
      return true;
    } catch (e) {
      print('❌ Errore eliminazione CV: $e');
      return false;
    }
  }
  
  /// Scarica un CV
  Future<Uint8List?> downloadCV(String filePath) async {
    try {
      final response = await _supabase.storage
          .from('cvs')
          .download(filePath);
      
      print('✅ CV scaricato: $filePath');
      return response;
    } catch (e) {
      print('❌ Errore download CV: $e');
      return null;
    }
  }
  
  /// Lista tutti i CV di un utente
  Future<List<FileObject>> listUserCVs(String userId) async {
    try {
      final response = await _supabase.storage
          .from('cvs')
          .list(path: userId);
      
      return response;
    } catch (e) {
      print('❌ Errore lista CV: $e');
      return [];
    }
  }
  
  /// Ottieni URL temporaneo per download privato
  Future<String?> getSignedUrl(String filePath, {int expiresIn = 3600}) async {
    try {
      final response = await _supabase.storage
          .from('cvs')
          .createSignedUrl(filePath, expiresIn);
      
      return response;
    } catch (e) {
      print('❌ Errore generazione URL firmato: $e');
      return null;
    }
  }
  
  /// Determina content type dal file extension
  String _getContentType(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }
  
  /// Valida se un file è un CV valido
  bool isValidCVFile(String fileName) {
    final validExtensions = ['pdf', 'doc', 'docx'];
    final extension = fileName.split('.').last.toLowerCase();
    return validExtensions.contains(extension);
  }
  
  /// Formatta dimensione file in modo leggibile
  String formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}

// Widget helper per mostrare lo stato dell'upload
class CVUploadWidget extends StatefulWidget {
  final Function(Map<String, dynamic>?) onUploadComplete;
  final String? initialCvPath;
  
  const CVUploadWidget({
    Key? key,
    required this.onUploadComplete,
    this.initialCvPath,
  }) : super(key: key);
  
  @override
  _CVUploadWidgetState createState() => _CVUploadWidgetState();
}

class _CVUploadWidgetState extends State<CVUploadWidget> {
  bool _isUploading = false;
  String? _fileName;
  String? _error;
  
  @override
  void initState() {
    super.initState();
    if (widget.initialCvPath != null) {
      _fileName = widget.initialCvPath!.split('/').last;
    }
  }
  
  Future<void> _handleUpload() async {
    setState(() {
      _isUploading = true;
      _error = null;
    });
    
    try {
      final result = await CVUploadService.instance.pickAndUploadCV();
      
      if (result != null) {
        setState(() {
          _fileName = result['fileName'];
        });
        widget.onUploadComplete(result);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(
          color: _error != null ? Colors.red : Color(0xFF667eea),
          width: 2,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          if (_isUploading)
            CircularProgressIndicator()
          else
            InkWell(
              onTap: _handleUpload,
              child: Column(
                children: [
                  Icon(
                    Icons.upload_file,
                    size: 48,
                    color: Color(0xFF667eea),
                  ),
                  SizedBox(height: 8),
                  Text(
                    _fileName ?? 'Carica il tuo CV',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF667eea),
                    ),
                  ),
                  Text(
                    'PDF, DOC o DOCX (max 10MB)',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          
          if (_error != null)
            Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(
                _error!,
                style: TextStyle(
                  color: Colors.red,
                  fontSize: 12,
                ),
              ),
            ),
            
          if (_fileName != null && !_isUploading)
            Padding(
              padding: EdgeInsets.only(top: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle, color: Colors.green, size: 16),
                  SizedBox(width: 4),
                  Text(
                    'CV caricato',
                    style: TextStyle(
                      color: Colors.green,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}