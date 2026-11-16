# Le Votomètre (levotometre.fr) 🗳️

> **Édition Minimaliste & Grand Public — L'Observatoire citoyen de précision des sondages électoraux en France (2002–2024 & prospective 2027)**

Inspiré du datajournalisme sobre et épuré (*Le Monde Les Décodeurs*, *FiveThirtyEight*, *The Upshot / NYT*), **Le Votomètre** confronte systématiquement les enquêtes d'opinion aux résultats officiels certifiés par le Conseil constitutionnel et le Ministère de l'Intérieur.

---

## 🎯 Directives Visuelles & Éditoriales
1. **Zéro fioriture inutile (Data-to-Ink Ratio élevé)** :
   - Fond neutre reposant (blanc cassé `#FAFAFA` en mode clair, slate sobre `#0B1120` en mode sombre).
   - Typographie éditoriale claire et espacements généreux (*whitespace*).
2. **Vulgarisation immédiate (compréhensible de 15 à 80 ans)** :
   - Bannissement du jargon brut d'ingénieur en première lecture.
   - *"Marge d'erreur moyenne : ± 1,8 pt"* au lieu de "MAE = 1.84".
   - *"Sous-estimé de +3,8 points (A fait mieux que prévu)"* au lieu de "Δ = +3.8".
   - *"Sur-estimé de -2,1 points (A fait moins bien que prévu)"* au lieu de "Δ = -2.1".
   - *"Prévision réussie (dans la marge de tolérance)"* au lieu de "Intervalle de confiance respecté".
3. **Mobile-First & Lisibilité sans effort** :
   - Cartes empilées et barres horizontales naturelles à faire défiler au pouce sur smartphone.
   - Étiquettes de texte 100% horizontales (jamais inclinées).

---

## 🧭 Les 4 Vues de l'Application

1. **Accueil : "Le Flash Électoral"** (`/`)
   - *"Depuis 20 ans, les sondages voient-ils juste le jour du vote ?"*
   - 3 cartes synthétiques grand format : le plus grand écart historique (2002), l'élection la plus fidèle (2017), le séisme le plus inattendu (2024).
   - Le Baromètre d'Écart Récent (Dernier scrutin 2024).

2. **Par Élection : "L'Urne contre le Sondage"** (`/presidentielles`, `/legislatives`, `/europeennes`)
   - Sélecteur d'année sobre.
   - **"Qui a créé la surprise ?"** : Baromètre horizontal d'écart avec bande grise de tolérance habituelle (±1,5 pt).
   - **"La Confrontation Directe"** : Nuage de corrélation allégé avec la *Ligne de vérité* en pointillés.
   - *Législatives* : Visualisation vulgarisée de l'hémicycle (577 députés) avec mise en évidence du seuil de majorité absolue (289 sièges).

3. **Le Podium des Instituts : "Qui est le plus précis ?"** (`/instituts`)
   - Les 3 instituts sur le podium (1ère, 2ème et 3ème place).
   - Tableau comparatif épuré avec précision moyenne en langage humain et tendance observée.

4. **Comprendre la Méthode : "Les Règles du Jeu"** (`/methodologie`)
   - Article pédagogique : pourquoi un sondage n'est pas magique, qu'est-ce qu'une marge d'erreur, pourquoi 1 point d'écart n'est pas une erreur mais 4 points changent l'Histoire.

---

## 🛠️ Stack Technique
- **Framework** : Next.js 15 (App Router, SSG & ISR)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + Thème automatique Dark / Light sobre
- **Dataviz** : SVG vectoriel pur interactif + Lucide React
- **Base de données & ORM** : SQLite local (`prisma/dev.db`) + Prisma ORM
- **Cache embarqué** : `lib/data-cache.json` pour déploiement Vercel garanti 100% sans faille.

---

## 🚀 Démarrage en local
```bash
git clone https://github.com/fremjulio-gif/votometre.git
cd votometre
npm install
npm run dev
# Ouvrir http://localhost:3000
```
