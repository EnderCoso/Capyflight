# Flight Booking System – TAW Project 2024/2025

Questo repository contiene il progetto per il corso di **Tecnologie e Applicazioni Web (A.Y. 2024/2025)**. 
L'obiettivo è lo sviluppo di un'applicazione web completa per la ricerca e l'acquisto di voli aerei, composta da un backend RESTful e un frontend Single-Page Application (SPA).

---

## 🚀 Architettura del Sistema

Il sistema è basato su un'architettura a microservizi containerizzata con **Docker**, suddivisa in tre componenti principali:

* **Backend**: Web service REST implementato in **Node.js** con TypeScript/JavaScript utilizzando il framework **Express.js**.
* **Frontend**: SPA sviluppata con il framework **Angular**.
* **Database**: Persistenza dei dati gestita tramite **MongoDB** (o database relazionale).

---

## 🛠 Funzionalità Principali

### ✈️ Per i Passeggeri (Utenti e Anonimi)
* **Ricerca Voli**: Ricerca tra diverse località con supporto a viaggi diretti o con massimo 1 scalo (minimo 2 ore di attesa).
* **Filtri e Ordinamento**: Possibilità di ordinare i risultati per costo, durata e numero di scali.
* **Acquisto Ticket**: Selezione del posto in tempo reale, scelta della classe (*Economy, Business, First Class*) e servizi extra (*bagagli, legroom*).

### 🏢 Per le Compagnie Aeree
* **Gestione Rotte**: Creazione e gestione di aeromobili, tratte e singoli voli con relativi costi.
* **Statistiche**: Dashboard per monitorare il numero di passeggeri, i ricavi totali e le rotte più richieste.

### 🛡 Amministrazione e Sicurezza
* **Gestione Utenti**: Registrazione passeggeri e invito di nuove compagnie aeree da parte dell'Admin.
* **Autenticazione**: Accesso richiesto per tutte le operazioni eccetto la ricerca voli.
* **Sincronizzazione**: Aggiornamento automatico e real-time della disponibilità dei posti al momento dell'acquisto.
