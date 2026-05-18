# MCD — Modèle Conceptuel de Données EQUITY

> Version : v1.0 — Niveau "vue d'ensemble"
> Statut : socle pour la phase backend, prêt à servir d'annexe au dossier projet
> Périmètre : aligné sur les fonctionnalités codées dans le frontend React (`src/`)

---

## 1. Introduction

EQUITY est une SPA française de **gestion patrimoniale immobilière** (React 18 + Vite 5) destinée à des bailleurs particuliers. Le frontend, actuellement entièrement piloté côté client, va être adossé à une base de données serveur. Ce document fixe le **Modèle Conceptuel de Données** qui servira de point de départ à la conception du modèle logique relationnel (MLD) puis physique (MPD).

### 1.1 Domaines fonctionnels couverts

Le MCD couvre huit domaines identifiés dans le code frontend :

1. **Comptes & profil bailleur** — inscription, connexion, fiche personnelle, profil patrimonial (onboarding + panneau "Mon Compte").
2. **Patrimoine immobilier** — biens détenus, caractéristiques, acquisition, fiscalité.
3. **Locataires & garants** — fiches d'identité, situation pro, dossier numérique.
4. **Documents & extractions IA** — pièces uploadées et résultat des analyses OCR/Claude.
5. **Bail / contrat de location** — type (mobilité, vide, meublé), durée, parties, équipements, conditions.
6. **Comptabilité locative** — échéances de loyer, paiements, charges, dépôt de garantie, quittances.
7. **Workflow de gestion locative** — étapes (validation, bail, paiement, état des lieux).
8. **Simulations financières et fiscales** — scénarios sauvegardés par bien.

### 1.2 Hypothèses structurantes

| Choix | Décision retenue | Justification |
|---|---|---|
| **Multi-utilisateurs** | SaaS multi-bailleurs avec isolation stricte par compte | Toutes les entités métier sont rattachées (directement ou transitivement) à un `Bailleur` |
| **Adresse** | Entité mutualisée et normalisée | Le composant `NbFieldAddress` est partagé bien/personne ; mutualiser évite la duplication d'attributs et prépare l'enrichissement géo/INSEE |
| **Documents** | Entité unique polymorphe + entité `Extraction IA` associée 1–1 optionnelle | Le front traite tous les fichiers uniformément (drop-zone, base64, analyse Claude) ; isole la donnée IA (score de confiance, JSON brut) |
| **Comptabilité** | Séparation `Échéance de loyer` (dû) ↔ `Paiement` (encaissé), association N–N porteuse | Pratique comptable standard : gestion des impayés, paiements partiels, rapprochements |
| **Workflow** | Entité `Étape de workflow` rattachée au bail | Reflète le composant `GestionTab` (étapes : validation, bail, paiement initial, état des lieux) |
| **Simulations** | Entités autonomes versionnées par bien | Permet la comparaison de scénarios fiscaux/financiers dans le temps |

### 1.3 Conventions de lecture

- Les cardinalités sont notées en style **min..max** (`0..N`, `1..1`, `0..1`).
- Les entités d'extension 1–1 (`Profil patrimonial`, `Acquisition`) partagent l'identifiant de leur entité mère.
- Les associations N–N portent leurs attributs propres (montant imputé, type d'usage…).
- Les identifiants conceptuels sont préfixés par `#` dans les dictionnaires.

---

## 2. Dictionnaire des entités

### 2.1 Bailleur

Compte utilisateur authentifiable, propriétaire de toutes les données métier du périmètre SaaS.

- **Identifiant** : `#idBailleur`
- **Attributs principaux** : prénom, nom, e-mail, téléphone, mot de passe (hash), date de création, statut du compte.

### 2.2 Profil patrimonial

Extension 1–1 du bailleur, regroupant les données KYC issues de l'onboarding.

- **Identifiant** : `#idBailleur` (partagé)
- **Attributs principaux** : objectif d'investissement, régime fiscal cible, nombre de biens déclarés, tranche de patrimoine, situation matrimoniale.

### 2.3 Adresse

Entité normalisée réutilisable pour localiser biens et personnes.

- **Identifiant** : `#idAdresse`
- **Attributs principaux** : ligne 1, ligne 2, bâtiment, escalier, étage, porte/lot, ville, code postal, région, pays, latitude, longitude.

### 2.4 Bien immobilier

Propriété détenue par un bailleur, cœur du patrimoine géré.

- **Identifiant** : `#idBien`
- **Attributs principaux** : nom, type (appartement, maison, parking…), identifiant cadastral, couleur d'affichage, surface, nombre de pièces, chambres, salles de bain, année de construction, description, DPE, GES, dépenses énergie min/max, état locatif, type de location, mode (nu/meublé), loyer indicatif, charges locatives.

### 2.5 Acquisition

Extension 1–1 du bien décrivant les conditions d'achat et la fiscalité associée.

- **Identifiant** : `#idBien` (partagé)
- **Attributs principaux** : prix du bien, frais de notaire, frais d'agence, ameublement, date d'acquisition, vendeur, notaire, taxe foncière, charges de copropriété, régime fiscal du bien.

### 2.6 Locataire

Personne physique candidate ou en place dans un bien du bailleur.

- **Identifiant** : `#idLocataire`
- **Attributs principaux** : prénom, nom, date de naissance, nationalité, situation professionnelle, employeur, revenus mensuels, type de contrat de travail, e-mail, téléphone.

### 2.7 Garant

Personne physique se portant caution d'un locataire.

- **Identifiant** : `#idGarant`
- **Attributs principaux** : prénom, nom, lien avec le locataire, situation pro, revenus, e-mail, téléphone.

### 2.8 Document

Fichier uploadé rattaché à une entité métier de contexte.

- **Identifiant** : `#idDocument`
- **Attributs principaux** : nom de fichier, type MIME, taille, contenu (référence stockage), catégorie (CNI, revenus, domicile, acte, fonds, diagnostic, photo, autre), contexte de rattachement (bien / locataire / garant / bail), identifiant de l'entité rattachée, date d'upload.

### 2.9 Extraction IA

Résultat de l'analyse OCR/Claude d'un document. Optionnelle, au plus une par document.

- **Identifiant** : `#idDocument` (partagé)
- **Attributs principaux** : données extraites (JSON structuré), score de confiance global, modèle utilisé, date d'extraction, statut (succès / erreur), message d'erreur éventuel.

### 2.10 Bail

Contrat de location liant un bailleur, un bien et un locataire.

- **Identifiant** : `#idBail`
- **Attributs principaux** : type de bail (mobilité, vide, meublé), motif (pour bail mobilité), date d'effet, durée, équipements, chauffage, eau chaude, loyer hors charges, provisions sur charges, dépôt de garantie, fréquence de paiement, statut (brouillon, signé, actif, terminé).

### 2.11 Étape de workflow

Jalon de gestion locative attaché à un bail.

- **Identifiant** : `#idEtape`
- **Attributs principaux** : type d'étape (validation candidature, génération bail, paiement initial, état des lieux), statut (à faire / en cours / fait), date prévue, date réalisée, données associées (JSON).

### 2.12 Échéance de loyer

Montant attendu pour une période donnée au titre d'un bail.

- **Identifiant** : `#idEcheance`
- **Attributs principaux** : période (mois/année), date d'exigibilité, montant loyer HC dû, montant charges dû, montant total dû, statut prévisionnel (à venir, due, partiellement réglée, soldée, en retard).

### 2.13 Paiement

Encaissement réel reçu d'un locataire. Peut couvrir une ou plusieurs échéances.

- **Identifiant** : `#idPaiement`
- **Attributs principaux** : date de réception, montant total, moyen de paiement (virement, chèque, espèces…), référence bancaire, statut (reçu, en attente, rejeté).

### 2.14 Quittance

Document libératoire émis pour une ou plusieurs échéances soldées d'un bail.

- **Identifiant** : `#idQuittance`
- **Attributs principaux** : numéro, date d'émission, période couverte, montant total, fichier PDF généré (référence stockage).

### 2.15 Simulation

Scénario financier et fiscal sauvegardé pour un bien.

- **Identifiant** : `#idSimulation`
- **Attributs principaux** : nom du scénario, date de création, paramètres d'entrée (JSON : taux actualisation, durée, hypothèses…), indicateurs de sortie (TRI, VAN, cash-flow, rentabilité brute/nette), régime fiscal simulé.

---

## 3. Dictionnaire des associations

| # | Nom | Entités | Cardinalités | Sens de lecture | Attributs portés |
|---|---|---|---|---|---|
| A1 | **possède_profil** | Bailleur ↔ Profil patrimonial | 1..1 ↔ 1..1 | Un bailleur possède un profil patrimonial | — |
| A2 | **détient** | Bailleur ↔ Bien | 1..1 ↔ 0..N | Un bailleur détient des biens ; un bien appartient à un seul bailleur | date de prise en gestion |
| A3 | **est_localisé_à** | Bien ↔ Adresse | 1..N ↔ 1..1 | Un bien est localisé à une adresse | — |
| A4 | **réside_à** | Locataire ↔ Adresse | 0..N ↔ 0..1 | Un locataire réside à une adresse (adresse précédente / hors logement loué) | — |
| A5 | **domicilié_à** | Bailleur ↔ Adresse | 0..N ↔ 0..1 | Un bailleur a une adresse de domicile | — |
| A6 | **domicilié_à_g** | Garant ↔ Adresse | 0..N ↔ 0..1 | Un garant a une adresse de domicile | — |
| A7 | **a_acquis** | Bien ↔ Acquisition | 1..1 ↔ 1..1 | Un bien possède une fiche d'acquisition | — |
| A8 | **gère_locataire** | Bailleur ↔ Locataire | 1..1 ↔ 0..N | Un bailleur gère des locataires | — |
| A9 | **est_garanti_par** | Locataire ↔ Garant | 1..1 ↔ 0..N | Un locataire peut être garanti par plusieurs garants | — |
| A10 | **conclut** | Bailleur, Bien, Locataire ↔ Bail | (1..1, 1..1, 1..1) ↔ 0..N (côté chacun) | Un bail relie un bailleur, un bien et un locataire ; un bien peut avoir plusieurs baux dans le temps | date de signature |
| A11 | **est_jalonné_par** | Bail ↔ Étape de workflow | 1..1 ↔ 0..N | Un bail est jalonné par plusieurs étapes | — |
| A12 | **génère** | Bail ↔ Échéance de loyer | 1..1 ↔ 0..N | Un bail génère des échéances mensuelles | — |
| A13 | **règle** | Paiement ↔ Échéance de loyer | 0..N ↔ 0..N | Un paiement règle une ou plusieurs échéances ; une échéance peut être réglée par plusieurs paiements | **montant imputé**, date d'imputation |
| A14 | **émet_quittance** | Bail ↔ Quittance | 1..1 ↔ 0..N | Un bail produit des quittances | — |
| A15 | **couvre** | Quittance ↔ Échéance de loyer | 1..1 ↔ 1..N | Une quittance couvre une ou plusieurs échéances soldées | — |
| A16 | **est_rattaché_à** | Document ↔ {Bien \| Locataire \| Garant \| Bail} | 1..1 ↔ 0..N | Un document est rattaché polymorphiquement à une seule entité de contexte | type de contexte (discriminant) |
| A17 | **a_extraction** | Document ↔ Extraction IA | 1..1 ↔ 0..1 | Un document a au plus une extraction IA associée | — |
| A18 | **simule** | Bailleur ↔ Simulation | 1..1 ↔ 0..N | Un bailleur sauvegarde des simulations | — |
| A19 | **cible** | Simulation ↔ Bien | 1..N ↔ 1..1 | Une simulation cible un seul bien ; un bien peut avoir plusieurs simulations | — |

---

## 4. Diagramme MCD (Mermaid)

```mermaid
erDiagram
    BAILLEUR ||--|| PROFIL_PATRIMONIAL : "A1 possède"
    BAILLEUR ||--o{ BIEN              : "A2 détient"
    BIEN     }o--|| ADRESSE           : "A3 localisé à"
    LOCATAIRE}o--o| ADRESSE           : "A4 réside à"
    BAILLEUR }o--o| ADRESSE           : "A5 domicilié à"
    GARANT   }o--o| ADRESSE           : "A6 domicilié à"
    BIEN     ||--|| ACQUISITION       : "A7 a acquis"
    BAILLEUR ||--o{ LOCATAIRE         : "A8 gère"
    LOCATAIRE||--o{ GARANT            : "A9 garanti par"

    BAILLEUR ||--o{ BAIL              : "A10 (bailleur)"
    BIEN     ||--o{ BAIL              : "A10 (bien)"
    LOCATAIRE||--o{ BAIL              : "A10 (locataire)"

    BAIL     ||--o{ ETAPE_WORKFLOW    : "A11 jalonné par"
    BAIL     ||--o{ ECHEANCE_LOYER    : "A12 génère"
    PAIEMENT }o--o{ ECHEANCE_LOYER    : "A13 règle (N-N)"
    BAIL     ||--o{ QUITTANCE         : "A14 émet"
    QUITTANCE||--|{ ECHEANCE_LOYER    : "A15 couvre"

    BIEN     ||--o{ DOCUMENT          : "A16 contexte=bien"
    LOCATAIRE||--o{ DOCUMENT          : "A16 contexte=locataire"
    GARANT   ||--o{ DOCUMENT          : "A16 contexte=garant"
    BAIL     ||--o{ DOCUMENT          : "A16 contexte=bail"
    DOCUMENT ||--o| EXTRACTION_IA     : "A17 a extraction"

    BAILLEUR ||--o{ SIMULATION        : "A18 simule"
    BIEN     ||--o{ SIMULATION        : "A19 cible"

    BAILLEUR {
        int  idBailleur PK
        string prenom
        string nom
        string email
        string telephone
        string motDePasseHash
        date   dateCreation
    }
    PROFIL_PATRIMONIAL {
        int  idBailleur PK_FK
        string objectifInvestissement
        string regimeFiscalCible
        int    nbBiensDeclares
        string situationMatrimoniale
    }
    ADRESSE {
        int  idAdresse PK
        string ligne1
        string ligne2
        string ville
        string codePostal
        string region
        string pays
        float  latitude
        float  longitude
    }
    BIEN {
        int  idBien PK
        string nom
        string type
        float  surface
        int    pieces
        int    chambres
        string dpe
        string ges
        string etatLocatif
        string typeLocation
    }
    ACQUISITION {
        int  idBien PK_FK
        float prixBien
        float fraisNotaire
        float fraisAgence
        date  dateAcquisition
        string vendeur
        string notaire
        float taxeFonciere
        string regimeFiscal
    }
    LOCATAIRE {
        int  idLocataire PK
        string prenom
        string nom
        date   dateNaissance
        string situationPro
        float  revenusMensuels
        string email
        string telephone
    }
    GARANT {
        int  idGarant PK
        string prenom
        string nom
        string lienLocataire
        float  revenus
    }
    DOCUMENT {
        int  idDocument PK
        string nomFichier
        string typeMime
        int    taille
        string categorie
        string contexteType
        int    contexteId
        date   dateUpload
    }
    EXTRACTION_IA {
        int  idDocument PK_FK
        json donneesExtraites
        float scoreConfiance
        string modele
        date   dateExtraction
        string statut
    }
    BAIL {
        int  idBail PK
        string typeBail
        date   dateEffet
        int    dureeMois
        float  loyerHC
        float  chargesProv
        float  depotGarantie
        string fequencePaiement
        string statut
    }
    ETAPE_WORKFLOW {
        int  idEtape PK
        string typeEtape
        string statut
        date   datePrevue
        date   dateRealisee
    }
    ECHEANCE_LOYER {
        int  idEcheance PK
        string periode
        date   dateExigibilite
        float  montantLoyerDu
        float  montantChargesDu
        string statutPrevisionnel
    }
    PAIEMENT {
        int  idPaiement PK
        date   dateReception
        float  montantTotal
        string moyenPaiement
        string referenceBancaire
        string statut
    }
    QUITTANCE {
        int  idQuittance PK
        string numero
        date   dateEmission
        string periodeCouverte
        float  montantTotal
    }
    SIMULATION {
        int  idSimulation PK
        string nomScenario
        date   dateCreation
        json   parametres
        float  tri
        float  van
        float  cashFlow
        string regimeFiscalSimule
    }
```

> 💡 Le diagramme ci-dessus utilise la syntaxe `erDiagram` de Mermaid. Il est rendu nativement par GitHub, GitLab, Notion et la plupart des viewers Markdown modernes.
> Notation des cardinalités Mermaid : `||` = exactement 1, `o|` = 0 ou 1, `}o` = 0 ou plusieurs, `}|` = 1 ou plusieurs.

---

## 5. Règles de gestion implicites

Quelques règles métier que le MCD encode mais qu'il est utile d'expliciter pour la suite (MLD + contraintes applicatives) :

1. **Étanchéité SaaS** : tout accès à un bien, locataire, document, bail ou simulation doit passer par la vérification de l'appartenance au `Bailleur` connecté.
2. **Un seul bail actif par bien** : à un instant T, au plus un bail au statut "actif" peut exister pour un bien donné (contrainte applicative, non visible dans les cardinalités MCD).
3. **Une échéance ne peut être marquée "soldée"** que si la somme des montants imputés (association A13) couvre le montant dû.
4. **Quittance** : ne peut être émise que sur des échéances dont le statut est "soldée".
5. **Document polymorphe** : le couple (`contexteType`, `contexteId`) doit pointer vers une entité existante du bon type — contrainte applicative.
6. **Extraction IA** : ne peut exister sans son document parent (suppression en cascade).
7. **Adresse partagée** : une adresse peut être référencée par plusieurs entités sans duplication ; sa suppression doit être bloquée tant qu'au moins une référence existe.

---

## 6. Hors périmètre de cette version

Volontairement non modélisés à ce stade :

- **Modèle logique (MLD)** : tables, clés étrangères, types SQL, contraintes d'unicité, index → étape suivante.
- **Historique des conversations IA** avec l'assistant Claude.
- **Multi-rôles** (gestionnaire, comptable, locataire connecté…) : restera mono-rôle bailleur.
- **Notifications, audit log, événements** : pas de table d'audit dans ce premier jet.
- **Partage entre bailleurs** (co-détention, SCI multi-associés) : un bien appartient à un seul bailleur.
- **Versionnement / soft delete** : à introduire au MLD si besoin.

---

## 7. Évolutions anticipées

Pistes d'extension à prévoir lors des prochaines itérations :

| Évolution | Entités impactées | Effort estimé |
|---|---|---|
| Multi-rôles (gestionnaire, locataire connecté) | Nouveau `Rôle` + `Utilisateur` générique, refacto `Bailleur` | Élevé |
| Co-détention (SCI, indivision) | Association N–N `Bailleur ↔ Bien` avec quote-part | Moyen |
| Historique conversations Claude | Nouvelles entités `Conversation`, `Message` rattachées au bailleur | Faible |
| Notifications & alertes | Nouvelle entité `Notification` + canal (email, push) | Faible |
| Audit log | Table d'événements génériques (qui, quoi, quand) | Moyen |
| Travaux & interventions | Nouvelle entité `Travaux` rattachée au bien, avec devis/factures (documents) | Moyen |
| Banques & rapprochement | Entité `CompteBancaire` + `OperationBancaire` pour automatiser l'imputation des paiements | Élevé |
| Plus-value à la revente | Extension `Cession` du bien (date, prix de vente, frais, calcul fiscal) | Faible |

---

## 8. Étape suivante

Une fois ce MCD validé, l'étape logique est de produire :

1. Le **MLD relationnel** (tables, clés primaires/étrangères, types, contraintes, index).
2. Le **choix de stack** de persistance (PostgreSQL hébergé sur Supabase / Neon / Vercel Postgres) cohérent avec le déploiement Vercel actuel.
3. La **stratégie de stockage des fichiers** (S3, Supabase Storage, Vercel Blob…) référencés par l'entité `Document`.
4. Les **migrations initiales** et le **seed de développement**.

---

*Document généré pour le projet EQUITY — v1.0*
