# Guide de déploiement PharmaGO

Ce guide explique comment mettre PharmaGO en ligne (backend + frontend web) et publier
l'app mobile sur l'App Store / Play Store. Aucune de ces étapes n'est automatisable depuis
cet environnement : elles nécessitent vos propres comptes (Render, Apple, Google), donc
suivez-les vous-même en vous aidant de ce guide.

## 1. Backend (API) sur Render

Render héberge à la fois le service Node et une base PostgreSQL managée, en gardant
Prisma/PostgreSQL tels qu'ils sont déjà configurés dans le projet (pas de changement de
base de données nécessaire).

1. Créez un compte sur [render.com](https://render.com).
2. **Nouvelle base de données** : `New +` → `PostgreSQL`. Notez l'**Internal Database URL**
   une fois créée.
3. **Nouveau service web** : `New +` → `Web Service`, connectez votre dépôt GitHub
   `dacariecorie/pharmago`.
   - **Root Directory** : `backend`
   - **Runtime** : `Docker` (le `backend/Dockerfile` est déjà prêt — il lance
     `prisma migrate deploy` automatiquement au démarrage, puis le serveur)
   - **Variables d'environnement** :
     - `DATABASE_URL` → l'Internal Database URL notée à l'étape 2
     - `JWT_SECRET` → une chaîne aléatoire longue et secrète (ex: générée avec
       `openssl rand -base64 32`). **Obligatoire** : sans elle, le serveur refuse de
       démarrer en production.
     - `PORT` → laissez Render gérer cette variable automatiquement (il l'injecte déjà)
4. Déployez. Une fois en ligne, notez l'URL publique, ex. `https://pharmago-api.onrender.com`.
5. (Optionnel) Pour peupler des données de démo en production, ouvrez un shell Render sur
   le service et lancez `npm run seed` — à éviter sur une vraie base client, c'est surtout
   utile pour une démo.

## 2. Frontend web sur Vercel

Le frontend est une app Next.js : [Vercel](https://vercel.com) est le déploiement le plus
simple (créé par les auteurs de Next.js, gratuit pour démarrer).

1. Créez un compte Vercel, importez le dépôt `dacariecorie/pharmago`.
2. **Root Directory** : `frontend`
3. **Variable d'environnement** : `NEXT_PUBLIC_API_URL` → l'URL Render de l'étape 1, suivie
   de `/api` (ex. `https://pharmago-api.onrender.com/api`)
4. Déployez. Vercel vous donne une URL publique (ex. `https://pharmago.vercel.app`), et un
   nom de domaine personnalisé peut être branché plus tard depuis les réglages du projet.

## 3. App mobile (App Store / Play Store)

Toutes les instructions détaillées sont déjà dans `mobile/README.md`. En résumé :

1. Une fois le backend en ligne (étape 1), mettez à jour `mobile/.env` (ou la variable
   d'environnement EAS) avec `EXPO_PUBLIC_API_URL=https://pharmago-api.onrender.com/api`.
2. Créez un compte [Expo](https://expo.dev) (gratuit) : `npx eas login`.
3. Créez un compte Apple Developer Program (99$/an) et un compte Google Play Console
   (25$ une fois) — ce sont des comptes personnels que vous devez créer vous-même, aucun
   outil ne peut le faire à votre place.
4. Lancez les builds : `npx eas build --platform ios --profile production` et
   `npx eas build --platform android --profile production`.
5. Soumettez aux stores : `npx eas submit --platform ios` et `npx eas submit --platform android`.

## 4. Tester en attendant (sans frais)

Pendant que vous configurez Render/Vercel/Apple/Google, vous pouvez déjà tester l'app
mobile gratuitement sur votre téléphone via **Expo Go**, en pointant `EXPO_PUBLIC_API_URL`
vers l'adresse IP locale de votre ordinateur sur le même Wi-Fi (détails dans
`mobile/README.md`).

## Ordre recommandé

1. Déployer le backend sur Render (étape 1) — c'est le socle dont tout le reste dépend.
2. Déployer le frontend web sur Vercel (étape 2).
3. Mettre à jour `EXPO_PUBLIC_API_URL` dans l'app mobile vers l'URL Render.
4. Créer les comptes Apple/Google et lancer les builds EAS (étape 3) quand vous êtes prêt
   à publier sur les stores.
