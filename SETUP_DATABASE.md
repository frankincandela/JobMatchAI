# 🚀 Setup Database Supabase

## Problema Identificato

L'autenticazione Supabase funziona correttamente (utente `41cce3cb-95fb-42a3-9731-be31b774afb8` creato), ma la tabella `users` nel database non ha lo schema corretto.

**Errore specifico:**
```
Could not find the 'auth_user_id' column of 'users' in the schema cache
```

## ✅ Soluzione Rapida

### Passo 1: Accedi alla Console Supabase
1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto `gfvslfufxecbqwicrixm`
3. Clicca su **"SQL Editor"** nel menu laterale

### Passo 2: Esegui lo Script SQL
Copia e incolla il contenuto completo del file `supabase_setup.sql` nell'editor SQL e clicca **"Run"**.

### Passo 3: Verifica Funzionamento
Dopo aver eseguito lo script, torna all'app e prova la registrazione - dovrebbe funzionare immediatamente.

## 🔧 Cosa Risolve lo Script

✅ **Crea tabella `users` con schema corretto**
- Colonna `auth_user_id` collegata a `auth.users`
- Tutte le colonne richieste dall'app

✅ **Configura RLS (Row Level Security)**
- Politiche per registrazione utenti
- Politiche per accesso sicuro ai profili

✅ **Crea utente demo**
- Email: `demo@careerguida.com`
- Password: `demo123`

✅ **Trigger automatico**
- Crea automaticamente profilo utente alla registrazione

## 🎯 Risultato Atteso

Dopo l'esecuzione dello script:
- ✅ Registrazione nuovi utenti funzionante
- ✅ Login con credenziali demo funzionante  
- ✅ Creazione automatica profili utente
- ✅ Sicurezza RLS attiva

## 🚨 Alternativa Rapida (Solo per Test)

Se non riesci ad accedere alla console SQL, posso creare una versione semplificata che disabilita temporaneamente RLS per permettere i test.