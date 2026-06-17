# PharmaGO Mobile

Application mobile React Native (Expo Router, SDK 56) pour PharmaGO. Couvre les 4 rôles (Client, Pharmacie, Livreur, Admin) avec la même API backend que l'application web (`/backend`).

## Lancer en développement

```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```

Scannez le QR code avec l'app **Expo Go** (iOS/Android) pour tester instantanément sur votre téléphone, sans passer par l'App Store/Play Store.

### Important : `EXPO_PUBLIC_API_URL`

Sur un téléphone physique, `localhost` ne désigne pas votre ordinateur. Remplacez la valeur dans `.env` par l'adresse IP locale de votre machine sur le même réseau Wi-Fi, par exemple :

```
EXPO_PUBLIC_API_URL=http://192.168.1.42:4000/api
```

(trouvez votre IP avec `ipconfig getifaddr en0` sur Mac, ou `ip addr` sur Linux). Une fois l'API déployée en ligne (voir `/README.md` à la racine), pointez plutôt vers son URL publique.

## Build pour les stores (App Store / Play Store)

Cette app utilise [EAS Build](https://docs.expo.dev/eas/) — pas besoin de Mac pour compiler l'iOS.

1. Créer un compte Expo (gratuit) : `npx eas login`
2. Créer un compte Apple Developer Program (99$/an) et un compte Google Play Console (25$ une fois) — ce sont des comptes personnels/business, à créer vous-même.
3. Mettre à jour `app.json` → `ios.bundleIdentifier` et `android.package` si besoin (actuellement `com.pharmago.app`, libre de changer avant la première soumission).
4. Builder :
   ```bash
   npx eas build --platform ios --profile production
   npx eas build --platform android --profile production
   ```
5. Soumettre aux stores :
   ```bash
   npx eas submit --platform ios
   npx eas submit --platform android
   ```

## Structure

- `src/lib/` — client API, contexte d'authentification, contexte panier, types, formatage (port du `frontend/src/lib/`).
- `src/components/` — composants partagés (OrderCard, OrderDetail, StatusBadge, primitives UI).
- `src/app/` — routes Expo Router, groupées par rôle : `(client)`, `(pharmacy)`, `(courier)`, `(admin)`, plus `login`/`register`/`index` (redirection selon le rôle).
