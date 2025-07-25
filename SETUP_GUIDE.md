# Guida Setup Completo - Piattaforma Career Guidance

## 📋 Panoramica Progetto

Questo è il codice completo per la piattaforma di orientamento professionale che hai sviluppato. Include:

- ✅ **Servizio AI Mock** per test senza costi OpenAI
- ✅ **Interfaccia web completa** con dashboard e pannello test  
- ✅ **Sistema di autenticazione** Supabase
- ✅ **Gestione opportunità lavorative** con matching AI
- ✅ **Upload e analisi CV** automatica

## 🚀 Come Scaricare e Importare in VS Code

### Opzione 1: Download Manuale dei File

1. **Scarica tutti i file** dal progetto Replit:
   - Clicca sui tre puntini (⋯) in alto a destra
   - Seleziona "Download as ZIP"
   - Estrai lo ZIP sul tuo computer

2. **Apri in VS Code**:
   ```bash
   code career-guidance-platform
   ```

### Opzione 2: Download Selettivo

Se preferisci scaricare solo i file essenziali, copia questi file dal tuo progetto Replit:

#### File HTML:
- `index.html` (pagina principale)

#### Cartella `components/`:
- `components/landing.html`
- `components/login.html` 
- `components/registration.html`
- `components/dashboard.html`
- `components/profile.html`
- `components/opportunities.html`
- `components/test-panel.html`

#### Cartella `js/`:
- `js/app.js` (controller principale)
- `js/auth.js` (autenticazione)
- `js/profile.js` (gestione profilo)
- `js/opportunities.js` (opportunità lavoro)
- `js/ai-analysis.js` (analisi AI)
- `js/mock-ai-service.js` (servizio test)
- `js/supabase-client.js` (client database)
- `js/utils.js` (funzioni utility)

#### Cartella `css/`:
- `css/styles.css` (stili personalizzati)

#### File configurazione:
- `package.json` (dipendenze Node.js)
- `replit.md` (documentazione completa)
- `SETUP_GUIDE.md` (questa guida)

## ⚙️ Setup Ambiente Locale

### 1. Installa Dipendenze

```bash
# Installa Node.js se non presente
npm install

# Oppure installa manualmente OpenAI
npm install openai
```

### 2. Configura Variabili d'Ambiente

Crea un file `.env` nella root del progetto:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration (opzionale per test)
OPENAI_API_KEY=your-openai-api-key
```

### 3. Avvia Server Locale

```bash
# Opzione 1: Python (semplice)
python -m http.server 8000

# Opzione 2: Node.js con live-server
npx live-server --port=8000

# Opzione 3: VS Code Live Server extension
# Installa estensione "Live Server" e clicca "Go Live"
```

Apri: `http://localhost:8000`

## 🧪 Modalità Test (Senza Costi API)

Il progetto include un **servizio AI mock completo** che ti permette di testare tutte le funzionalità senza costi:

### Funzionalità Mock Incluse:
- ✅ Analisi CV automatica  
- ✅ Matching opportunità lavorative
- ✅ Generazione lettere motivazionali
- ✅ Raccomandazioni carriera personalizzate
- ✅ 5 settori professionali simulati
- ✅ Oltre 10 opportunità lavorative realistiche

### Come Usarlo:
1. **Automatico**: Se non hai configurato OpenAI API key, il sistema usa automaticamente il mock
2. **Manuale**: Usa il pannello di controllo test nell'app per passare da modalità test a live
3. **Realistico**: Include ritardi simulati e dati verosimili per test completi

## 🗄️ Setup Database Supabase

### 1. Crea Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea nuovo progetto
3. Copia URL e Anon Key

### 2. Schema Database (Opzionale)
Il codice funziona anche senza database configurato in modalità test. Per la versione completa:

```sql
-- Tabelle principali richieste
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  bio TEXT,
  skills JSONB,
  experience JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  company TEXT,
  description TEXT,
  requirements JSONB,
  salary_range TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Personalizzazione

### Modifica Settori Professionali:
Editta `js/mock-ai-service.js` per aggiungere nuovi settori o modificare i dati esistenti.

### Personalizza Stili:
Modifica `css/styles.css` per cambiare l'aspetto dell'interfaccia.

### Aggiungi Funzionalità:
- Ogni componente è modulare in `components/`
- Ogni servizio è separato in `js/`
- Facile estendere e modificare

## 🚨 Risoluzione Problemi

### Errori Comuni:

1. **"Supabase not configured"**: 
   - È normale in modalità test
   - Configura `.env` per modalità produzione

2. **"OpenAI API key missing"**:
   - È normale - l'app usa automaticamente il mock
   - Configura solo se vuoi usare OpenAI reale

3. **Console errors**:
   - Ignora errori Supabase in modalità test
   - L'app funziona completamente offline

### Test Funzionalità:
- ✅ Carica CV (usa file PDF qualsiasi)
- ✅ Completa registrazione con dati fittizi  
- ✅ Naviga dashboard e opportunità
- ✅ Testa pannello controllo test

## 📝 Note di Sviluppo

- **Compatibilità**: Funziona su qualsiasi server web
- **No Build**: Nessuna compilazione richiesta
- **Responsive**: Ottimizzato per mobile e desktop
- **Offline**: Modalità test funziona completamente offline
- **Scalabile**: Architettura modulare per facili estensioni

## 🎯 Prossimi Passi

1. **Testa localmente** con modalità mock
2. **Personalizza** settori e dati per le tue esigenze
3. **Configura Supabase** quando sei pronto per la produzione
4. **Deploy** su Netlify, Vercel o qualsiasi hosting statico

---

**Buon lavoro con la tua piattaforma di orientamento professionale! 🚀**