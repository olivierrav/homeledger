Je te propose une stratégie progressive, faisable en craft “maison”, sans partir tout de suite sur un gros modèle ML.

Je découpe en 4 étapes, chacune exploitable en prod, en améliorant la suivante.

Étape 0 – Préparer les données côté modèle / DB
Tu as déjà: operations, tiers, budgets (catégories). Il faut juste préparer le terrain pour l’auto-apprentissage. 1. Ajouter de quoi tracer les décisions
• Sur operations, ajouter quelques champs:
• suggested_tier_id (UUID, nullable)
• suggested_budget_id (UUID, nullable)
• suggestion_confidence (NUMERIC, 0–1)
• suggestion_accepted (BOOLEAN, nullable)
• Ça te permet:
• de ne pas écraser le tier/budget choisi par l’utilisateur
• de mesurer si la suggestion était acceptée ou corrigée 2. Normer les libellés en base
• Stocker systématiquement:
• raw_label: libellé banque brut
• normalized_label: libellé nettoyé (sans date, sans numéro de carte, sans montants, etc.)
• Normalisation à faire dans ton backend au moment de l’import:
• mettre en majuscules
• supprimer accents
• virer les dates type 05/12, 2024-11-02
• virer les numéros de cartes XXXX XXXX
• compresser les espaces
Ça facilite énormément toutes les heuristiques.

Étape 1 – Règles déterministes simples (tier d’abord)
Objectif: avoir rapidement des résultats “magiques” basés sur ce que l’utilisateur a déjà classé, sans ML. 1. Construire un index des libellés → tiers
• À partir des opérations déjà annotées:
• Grouper par (normalized_label, tier_id)
• Compter les occurrences
• Idée: “pour ce libellé, quel tiers a été le plus souvent choisi ?”
• Tu peux matérialiser ça:
• soit dans une table helper: operation_label_stats
• normalized_label, tier_id, count
• soit dans une vue + requêtes agrégées 2. Fuzzy matching de libellés
• Pour les libellés “proches”, tu peux:
• extraire des “tokens significatifs”: exemple INTERMARCHE, CARREFOUR, AMAZON, BOULANGER, SNCF…
• créer une table tier_aliases:
• id, tier_id, alias_text (ex: “INTERMARCHE BROONS”, “INTERMARCHE”, “INTM BROONS”)
• À l’insertion d’une nouvelle opération:
• chercher d’abord un alias exact ou “starts with” / “contains”
• sinon, fallback sur une similarité (distance de Levenshtein avec pg_trgm par exemple, mais tu peux commencer sans ça) 3. Règle principale pour suggérer le tiers
• Algo simple:
• normaliser le libellé
• si match exact sur normalized_label connu → proposer le tier majoritaire
• sinon, si match sur un alias de tier → proposer ce tier
• sinon → pas de suggestion
• Confidence:
• si match exact et un seul tier utilisé 90% du temps pour ce label → confiance élevée (0.9)
• sinon si alias ou plusieurs tiers pour ce libellé → confiance moyenne (0.5)
• sinon → pas de suggestion

Étape 2 – Déduire la catégorie (budget) à partir du tiers
Une fois le tiers proposé, la catégorie devient facile. 1. Construire un mapping tiers → budget dominant
• Sur toutes les opérations annotées:
• pour chaque tier_id, compter les budgets utilisés
• budget dominant = celui qui est utilisé le plus souvent avec ce tiers (ex: Intermarché → Courses) 2. Règle catégorie
• Si tiers identifié (par l’algorithme précédent):
• regarder s’il a un budget dominant avec un ratio suffisant (ex: >70% des opérations du tiers)
• si oui → suggested_budget_id = ce budget, avec une confiance proportionnelle au ratio
• Si tiers non trouvé:
• éventuellement un fallback simple sur le libellé (ex: “IMPOTS”, “URSSAF”, “IMPOT SUR LE REVENU” → catégorie Impôts)

Résultat: dès que l’utilisateur a un peu bossé, 80% des nouvelles opérations Intermarché, Carrefour, Boulanger, etc. seront pré-remplies.

Étape 3 – Boucle de feedback et amélioration continue
L’idée: l’utilisateur t’entraîne son propre modèle. 1. UX des suggestions
• Dans ton UI:
• pré-remplir le champ tiers + catégorie avec la suggestion (visuellement marquée comme “suggestion” : par ex. un petit badge)
• Quand l’utilisateur valide tel quel → tu notes suggestion_accepted = true
• Quand il change le tiers ou la catégorie → suggestion_accepted = false 2. Utiliser les corrections
• Si suggestion_accepted = false:
• tu enregistres un nouvel exemple:
• normalized_label → nouveau tier
• tier → nouveau budget
• éventuellement, tu incrémentes les compteurs dans operation_label_stats et les stats tiers → budget
• Tu peux mettre un process batch (cron / job) qui:
• recalculera régulièrement les agrégats (labels/tier mapping, tiers/budget mapping)
• mettra à jour les alias s’il y a des variantes évidentes 3. Gestion de la “confiance”
• Tu peux ajuster dynamiquement tes seuils de proposition:
• si ta base est encore pauvre → ne suggérer que pour les cas “ultra sûrs”
• quand tu as de plus en plus de données → baisser un peu le seuil pour suggérer plus souvent

Étape 4 – Aller vers du vrai ML plus tard (optionnel mais ready)
Une fois que tu as quelques centaines/milliers d’ops catégorisées, tu peux introduire une couche ML si tu veux monter en puissance. 1. Features possibles
• Pour chaque opération:
• normalized_label tokenisé (bag-of-words simple)
• présence de certains mots-clés (CARTE, PRLV, VIREMENT, CB, AMAZON, SNCF…)
• montant (log | signe)
• fréquence du tiers
• Label 1: tier_id
• Label 2: budget_id 2. Modèle simple
• Tu peux rester très sobre:
• modèle de type Naive Bayes / logistic regression ou petite forêt aléatoire
• entraîné offline en Python, exposé via un micro-service ou un modèle embarqué
• Ce modèle apprend à mapper libellé → catégorie directement, même si le tiers n’est pas encore bien connu. 3. Intégration
• Ordre de priorité:
• si les règles heuristiques (label + alias + tiers) donnent une réponse très sûre → utiliser ça
• sinon, appeler le modèle ML pour une suggestion fallback
• Toujours loguer: score du modèle, choix utilisateur, etc., pour réentrainer plus tard.

Étape 5 – Décision par compte / par utilisateur
Tu peux raffiner: 1. Segmentation par compte
• Les “pattern” ne sont pas forcément les mêmes selon le compte:
• compte perso vs compte pro
• Tu peux garder les stats par (user_id, normalized_label) ou (account_id, normalized_label) plutôt que globales 2. Mutualisation optionnelle
• Plus tard, tu peux décider:
• d’avoir une “connaissance globale” (un modèle/tables partagés)
• plus un surcouche spécifique par utilisateur (si Intermarché est “Courses” pour tout le monde, mais il y a des cas particuliers…)

Conclusion pratique pour toi, maintenant
Si tu veux un plan d’action concret: 1. Ajouter les champs suggestion\_\* et raw_label / normalized_label dans ta base 2. Coder le pipeline de normalisation de libellé dans ton backend Node 3. Coder un premier service “SuggestionService” qui:
• prend une operation (libellé, montant, compte)
• renvoie { tierSuggestion?, budgetSuggestion?, confidence } selon les règles heuristiques des étapes 1 et 2 4. Brancher ce service dans ton flow d’import d’opérations 5. Ajuster ton UI pour pré-remplir + marquer les suggestions + remonter les feedbacks

Si tu veux, au prochain message je peux t’écrire un pseudo-code ou carrément un module Node.js SuggestionService avec les premières règles (structure des fonctions, requêtes SQL génériques, etc.).
