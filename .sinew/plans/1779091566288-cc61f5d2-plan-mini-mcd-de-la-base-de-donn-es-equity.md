# Plan — Mini MCD de la base de données EQUITY

## Objectif

Produire un Modèle Conceptuel de Données de niveau "vue d'ensemble" aligné sur les fonctionnalités déjà codées dans le frontend EQUITY, prêt à servir d'annexe documentaire et de socle pour la phase backend. Le livrable reste au niveau conceptuel : entités, associations, cardinalités, identifiants — sans descendre dans le détail exhaustif des attributs ni dans le modèle relationnel.

## Portée fonctionnelle couverte

Le MCD couvrira huit domaines fonctionnels identifiés dans le front :

1. **Comptes & profil bailleur** — inscription, connexion, fiche personnelle, profil patrimonial issu de l'onboarding et du panneau "Mon Compte".
2. **Patrimoine immobilier** — biens détenus, leurs caractéristiques, leur acquisition et leur fiscalité.
3. **Locataires & garants** — fiches d'identité, situation professionnelle, dossier numérique, lien éventuel avec un ou plusieurs garants.
4. **Documents & extractions IA** — pièces uploadées (CNI, justificatifs de revenus, justificatifs de domicile, acte, fonds, diagnostics, photos…) et résultat des analyses OCR/Claude associées.
5. **Bail / contrat de location** — type de bail (mobilité, vide, meublé), durée, parties, équipements, conditions financières signées.
6. **Comptabilité locative** — échéances de loyer attendues et encaissements réels, charges, dépôt de garantie, quittances.
7. **Workflow de gestion locative** — suivi d'étapes (validation candidature, génération du bail, premier paiement, état des lieux…).
8. **Simulations financières et fiscales** — scénarios sauvegardés par bien et par utilisateur.

## Hypothèses structurantes (choix tranchés)

- **Isolation multi-bailleurs** : toutes les entités métier (bien, locataire, document, bail, simulation…) sont rattachées directement ou indirectement à un compte bailleur, garantissant l'étanchéité SaaS.
- **Adresse mutualisée** : on isole une entité "Adresse" autonome reliée par association aux entités qui en ont besoin (bien, bailleur, locataire, garant). Justification : le frontend utilise un composant d'adresse unique avec autocomplétion ; mutualiser évite la duplication d'attributs (rue, ville, code postal, région, pays) sur quatre entités différentes et facilite plus tard un enrichissement (géolocalisation, données INSEE).
- **Documents génériques polymorphes** : une seule entité "Document" reliée à son entité de rattachement (bien, locataire, garant ou bail), avec un attribut discriminant de contexte et un attribut de catégorie (CNI, revenus, acte, diagnostic, photo…). Justification : le frontend traite déjà tous les fichiers de manière uniforme (drop-zone, conversion base64, analyse IA), et cela évite de multiplier des tables quasi identiques. Le résultat de l'extraction IA est isolé dans une entité associée "Extraction IA" (un document a zéro ou une extraction, avec score de confiance).
- **Comptabilité en deux temps** : on sépare l'**échéance de loyer** (montant attendu, période, statut prévisionnel) du **paiement encaissé** (montant réel, date, moyen). Justification : c'est la pratique comptable standard, ça permet de gérer les impayés, paiements partiels, retards et rapprochements ; un paiement peut couvrir une ou plusieurs échéances. La **quittance** est une entité dérivée émise une fois une ou plusieurs échéances soldées.
- **Workflow modélisé comme entité dédiée** : chaque bail porte une suite d'étapes typées (validation, bail, paiement initial, état des lieux), chacune avec son statut et son horodatage. Cela colle au composant de gestion locative présent dans le front.
- **Simulations versionnées** : chaque simulation est une instance autonome rattachée à un bien et à un bailleur, conservant ses paramètres d'entrée et ses indicateurs de sortie (TRI, VAN, cash-flow…), pour permettre la comparaison de scénarios.

## Entités proposées

- **Bailleur** — compte utilisateur connectable.
- **Profil patrimonial** — extension 1–1 du bailleur, regroupant les données KYC issues de l'onboarding (objectifs d'investissement, régime fiscal, nombre de biens déclarés, situation patrimoniale globale).
- **Adresse** — entité normalisée réutilisable.
- **Bien immobilier** — propriété détenue par un bailleur.
- **Acquisition** — extension 1–1 du bien (prix d'achat, frais de notaire, frais d'agence, date d'acquisition, vendeur, notaire). Séparée pour clarté conceptuelle, fusionnable au stade MLD si pertinent.
- **Locataire** — personne physique candidate ou en place.
- **Garant** — personne physique caution d'un locataire.
- **Document** — fichier rattaché à un objet métier.
- **Extraction IA** — résultat d'analyse OCR/Claude d'un document, avec score de confiance.
- **Bail** — contrat liant un bailleur, un bien et un locataire.
- **Étape de workflow** — jalon de gestion locative attaché à un bail.
- **Échéance de loyer** — montant attendu à une période donnée.
- **Paiement** — encaissement effectif.
- **Quittance** — document libératoire émis pour une ou plusieurs échéances réglées.
- **Simulation** — scénario financier/fiscal sauvegardé.

## Associations et cardinalités (récit lisible)

- Un bailleur possède exactement un profil patrimonial, et un profil patrimonial appartient à un seul bailleur (1–1).
- Un bailleur peut détenir zéro à plusieurs biens ; un bien appartient à un seul bailleur (1–N).
- Un bien est localisé à exactement une adresse ; une adresse peut être référencée par plusieurs entités (bien, bailleur, locataire, garant) via une association typée portant la nature de l'usage.
- Un bien possède exactement une acquisition (1–1).
- Un bailleur gère zéro à plusieurs locataires ; un locataire est rattaché à un seul bailleur dans la base (1–N) — l'isolation SaaS s'applique aussi côté locataires.
- Un locataire peut être associé à zéro ou plusieurs garants ; un garant est lié à un seul locataire (1–N).
- Un bail relie un bien, un locataire et un bailleur ; un bien peut avoir plusieurs baux dans le temps mais un seul actif simultanément ; un locataire peut signer plusieurs baux (historique).
- Un bail génère zéro à plusieurs échéances de loyer ; chaque échéance appartient à un seul bail (1–N).
- Une échéance est soldée par un ou plusieurs paiements ; un paiement peut couvrir une ou plusieurs échéances (association N–N portant le montant imputé).
- Une quittance regroupe une ou plusieurs échéances soldées et appartient à un seul bail (1–N).
- Un bail est jalonné par zéro à plusieurs étapes de workflow ; une étape appartient à un seul bail (1–N), avec un type d'étape contraint à une liste fermée (validation, bail, paiement initial, état des lieux).
- Un document est rattaché à exactement une entité de contexte (bien, locataire, garant ou bail) via une association polymorphe ; une entité peut porter plusieurs documents (1–N).
- Un document a au plus une extraction IA ; une extraction appartient à un seul document (1–1 optionnelle).
- Un bailleur peut sauvegarder zéro à plusieurs simulations ; chaque simulation cible un seul bien et appartient à un seul bailleur (1–N).

## Identifiants conceptuels

Chaque entité dispose d'un identifiant unique propre. Les entités d'extension 1–1 (profil patrimonial, acquisition) partagent l'identifiant de leur entité mère. Les associations N–N (paiement ↔ échéance, adresse ↔ entités) sont matérialisées par des associations porteuses d'attributs (montant imputé, type d'usage de l'adresse).

## Livrable attendu

Le rendu final prendra la forme d'un document unique comportant :

1. **Une introduction** rappelant le périmètre fonctionnel et les hypothèses structurantes.
2. **Un dictionnaire d'entités** : pour chaque entité, son rôle métier, son identifiant et une courte liste indicative des attributs principaux (sans exhaustivité).
3. **Un dictionnaire d'associations** : nom de l'association, entités reliées, cardinalités, sens de lecture, attributs portés éventuels.
4. **Une représentation visuelle** sous forme d'un diagramme Mermaid (compatible GitHub, Notion, exports PDF) montrant entités et cardinalités, suffisamment lisible pour servir d'annexe à un dossier projet.
5. **Une section "évolutions anticipées"** listant ce qui n'est pas dans ce premier jet mais devra entrer plus tard (historique des conversations IA, notifications, multi-rôles, partage entre bailleurs, audit log, etc.) — afin que le MCD reste extensible.

## Hors périmètre (assumé)

- Pas de passage au MLD (modèle logique relationnel) ni au MPD (modèle physique) dans ce livrable : pas de typage SQL, pas de clés étrangères, pas de contraintes techniques.
- Pas de modélisation de l'historique des conversations avec l'assistant Claude (non retenu dans les réponses).
- Pas de gestion fine des rôles (multi-bailleurs simples, pas de gestionnaire / comptable / locataire connecté).
- Pas de notifications, audit log, ou pistes d'événements — à ajouter ultérieurement.

## Étape suivante (après validation)

Une fois ce MCD validé, l'étape logique sera de produire le **MLD relationnel** (tables, clés primaires et étrangères, types, contraintes d'unicité, index pressentis) puis de choisir la stack de persistance cohérente avec le déploiement Vercel actuel.
