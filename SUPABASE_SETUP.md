# Configurazione Supabase - Career Guidance Platform

## 📋 Come Configurare Supabase

### Opzione 1: Configurazione Completa (Produzione)

#### 1. Crea un Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Clicca **"Start your project"** 
3. Crea un account o accedi
4. Clicca **"New Project"**
5. Scegli organizzazione e inserisci:
   - **Nome progetto**: career-guidance-app
   - **Password database**: Scegli una password sicura
   - **Regione**: Europe (per l'Italia)

#### 2. Ottieni le Credenziali
1. Vai nella dashboard del progetto
2. Clicca **"Settings"** (in basso a sinistra)
3. Seleziona **"API"**
4. Copia questi valori:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIs...`

#### 3. Configura le Variabili d'Ambiente

**Per sviluppo locale (VS Code):**
Crea file `.env` nella root del progetto:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Per Replit:**
1. Vai nelle "Secrets" (icona lucchetto)
2. Aggiungi:
   - `SUPABASE_URL`: il tuo project URL
   - `SUPABASE_ANON_KEY`: la tua anon key

**Per siti web (alternativa):**
Modifica `js/supabase-client.js` e sostituisci:
```javascript
// Configura direttamente nel codice (NON consigliato per produzione)
window.SUPABASE_URL = 'https://your-project-id.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Opzione 2: Modalità Demo (Sviluppo/Test)

Se non vuoi configurare Supabase subito, l'app funziona automaticamente in **modalità demo**:

✅ **Cosa funziona senza configurazione:**
- Login demo: `demo@careerguida.com` / `demo123`
- Registrazione con qualsiasi email/password
- Tutte le funzionalità AI mock
- Upload CV simulato
- Dashboard completa
- Matching opportunità

⚠️ **Limitazioni modalità demo:**
- Dati non persistenti (si perdono al refresh)
- Non sincronizzazione tra dispositivi
- Solo per test e sviluppo

## 🗄️ Setup Database (Automatico)

Quando configuri Supabase, l'app creerà automaticamente le tabelle necessarie. Se vuoi crearle manualmente:

### Tabelle Principali

```sql
-- Profili utente
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  cv_file_path TEXT,
  preferred_sectors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunità lavorative
CREATE TABLE job_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  skills_required JSONB DEFAULT '[]'::jsonb,
  salary_range TEXT,
  location TEXT,
  employment_type TEXT,
  sector TEXT,
  experience_level TEXT,
  remote_work BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Candidature
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  opportunity_id UUID REFERENCES job_opportunities(id),
  motivation_letter TEXT,
  match_score INTEGER,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Analisi AI
CREATE TABLE ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  analysis_type TEXT NOT NULL, -- 'cv_analysis', 'profile_match', etc.
  input_data JSONB,
  result JSONB,
  ai_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Buckets

```sql
-- Bucket per CV e documenti
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', false);

-- Policy per l'accesso ai file CV
CREATE POLICY "Users can upload own CV" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own CV" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own CV" ON storage.objects
FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own CV" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔧 Verifica Configurazione

Dopo la configurazione, verifica che tutto funzioni:

1. **Apri la console del browser** (F12)
2. **Ricarica la pagina**
3. **Cerca questi messaggi:**
   - ✅ `"Supabase connection verified"` = Configurazione corretta
   - ⚠️ `"Supabase not configured"` = Modalità demo attiva

4. **Testa il login:**
   - Con Supabase: Crea un account con email/password reali
   - Senza Supabase: Usa `demo@careerguida.com` / `demo123`

## 🚨 Risoluzione Problemi

### Errore: "Invalid API Key"
- Verifica che `SUPABASE_ANON_KEY` sia copiata correttamente
- Assicurati che non ci siano spazi prima/dopo la chiave

### Errore: "Project not found"
- Verifica che `SUPABASE_URL` corrisponda al tuo progetto
- Controlla che il progetto sia attivo su Supabase

### Errore: "Auth user not found"
- Verifica che l'autenticazione sia abilitata nel progetto
- Vai in Authentication > Settings > Auth providers

### L'app continua in modalità demo
- Controlla che le variabili d'ambiente siano impostate correttamente
- Riavvia il server/ricarica la pagina
- Verifica nei log della console per messaggi di errore

## 📱 Configurazione Email (Opzionale)

Per email di conferma e reset password:

1. **Vai in Authentication > Settings**
2. **Configura Email Templates**
3. **Aggiungi il tuo dominio** in Site URL
4. **Abilita email confirmation** se desiderato

## 🔐 Sicurezza (Produzione)

**Row Level Security (RLS):**
```sql
-- Abilita RLS su tutte le tabelle
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Policy di base: utenti possono vedere solo i propri dati
CREATE POLICY "Users can only see own profile" ON user_profiles
FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see own applications" ON applications
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own analyses" ON ai_analyses
FOR ALL USING (auth.uid() = user_id);
```

---

✅ **La configurazione è completa!** L'app ora è pronta per l'uso in produzione con database persistente e autenticazione reale.