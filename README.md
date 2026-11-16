# Le Votomètre (levotometre.fr) 🗳️📊

> **L'Observatoire citoyen & analytique de précision des sondages électoraux en France (2002–2024 & prospective 2027)**

---

## 🎯 Objectif du Produit
**Le Votomètre** confronte systématiquement les sondages d'opinion aux résultats officiels proclamés par le Conseil constitutionnel et le Ministère de l'Intérieur lors de toutes les grandes élections en France sur les 20 dernières années :
- **Élections Présidentielles** (2002, 2007, 2012, 2017, 2022 + prospective 2027)
- **Élections Législatives & Assemblée nationale** (2002, 2007, 2012, 2017, 2022, 2024 dissolution)
- **Élections Européennes** (2004, 2009, 2014, 2019, 2024)
- **Audit des 12 Instituts de Sondage** (Ipsos, Ifop, Elabe, Harris, BVA, OpinionWay, Cluster 17, Odoxa, CSA, etc.)

Le site ne fait pas de politique : il mesure scientifiquement la marge d'erreur, la précision des instituts et les récurrences de sous-estimations ou de sur-estimations de candidats ou de formations politiques.

---

## 🛠️ Stack Technique
- **Framework** : Next.js 15 (App Router, Server Components & Client Components)
- **Langage** : TypeScript (mode strict)
- **Styling** : Tailwind CSS + Thème moderne Dark/Light automatique + Palette politique normalisée
- **Visualisations de Données** :
  - **The Scatter Truth** (Nuage de corrélation interactif avec diagonale $y = x$, marge de confiance à 95%, tooltips)
  - **Diverging Shock Bar** (Baromètre d'écart centré à 0,0 pt, sur-estimations vs sous-estimations)
  - **Podium & Leaderboard** (Classement des 12 instituts par MAE, jauge de biais et sparklines)
  - **L'Hémicycle Réactif** (577 sièges de l'Assemblée nationale, projection sondages vs hémicycle réel, ligne de majorité à 289 sièges)
- **Base de Données & ORM** : SQLite local (`prisma/dev.db`) avec Prisma ORM
- **Ingestion & Parsing** : Script TypeScript `prisma/seed.ts` exploitant `xlsx` (SheetJS) pour ingérer les 6 fichiers Excel sources certifiés.

---

## 📐 Moteur Statistique & Mathématique
Tous les calculs s'appuient sur les métriques scientifiques standard du datajournalisme international :
1. **Écart simple en points (Signed Error)** :
   $$\Delta = \text{Score Réel (\%)} - \text{Score Sondé (\%)} $$
   - $\Delta > 0$ : Candidat sous-estimé (effet "vote caché" ou dynamique finale)
   - $\Delta < 0$ : Candidat sur-estimé (effet "bulle médiatique" ou déperdition)
   - $|\Delta| \le 1.5$ : Dans la marge d'erreur statistique usuelle
2. **Erreur Absolue Moyenne (MAE — Mean Absolute Error)** :
   $$\text{MAE}_k = \frac{1}{N} \sum_{i=1}^N |\text{Score Réel}_i - \text{Score Sondé}_{i,k}|$$
   Sert à établir le **Leaderboard de précision des instituts**.
3. **Taux de Succès d'Encadrement (Sièges Législatives/Européennes)** :
   $$\text{Encadré} = (\text{Sièges Réels} \ge \text{Sièges Min}) \land (\text{Sièges Réels} \le \text{Sièges Max})$$

---

## 🚀 Installation & Démarrage

### 1. Cloner le dépôt et installer les dépendances
```bash
git clone https://github.com/fremjulio-gif/votometre.git
cd votometre
npm install
```

### 2. Initialiser la base de données et ingérer les données
```bash
npx prisma db push
npm run db:seed
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🏛️ Sources Officielles Certifiées
- **Conseil constitutionnel** : Décisions de proclamation des résultats des élections présidentielles.
- **Ministère de l'Intérieur** : Données électorales certifiées par circonscription et bureau de vote.
- **Assemblée nationale** : Composition des groupes parlementaires (Législatures XIIe à XVIIe).
- **Commission des sondages** : Notices méthodologiques officielles des enquêtes d'opinion.

---

## 📄 Licence
Projet open-source à vocation citoyenne et analytique.
