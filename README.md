# Foot Is Life

Application mobile de coaching football pour analyser la technique de frappe d'un joueur.

## Description

Foot Is Life permet aux joueurs de filmer leur frappe depuis deux angles (devant et derrière le joueur), puis analyse le geste et fournit un feedback personnalisé avec des conseils d'amélioration.

**Public cible** : jeunes joueurs, amateurs, coachs individuels, académies de football.

## Stack technique

- **Mobile** : React Native + Expo + TypeScript
- **Navigation** : Expo Router
- **State** : Zustand
- **Backend** : Firebase (Auth, Firestore, Storage)
- **Vidéo** : expo-camera, expo-image-picker, expo-video

## Prérequis

- Node.js >= 18
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Un projet Firebase configuré
- iOS Simulator (Mac) ou Android Emulator

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd Foot_Is_Life

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir les valeurs Firebase dans .env
```

## Configuration Firebase

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activer Authentication (Email/Password)
3. Créer une base Firestore
4. Activer Firebase Storage
5. Copier les credentials dans `.env`

## Lancement

```bash
# Démarrage du serveur de développement
npx expo start

# iOS uniquement
npx expo start --ios

# Android uniquement
npx expo start --android
```

## Tests

```bash
npx jest
```

## Architecture

```
app/          → Écrans (Expo Router, file-based routing)
  (auth)/     → Écrans d'authentification
  (tabs)/     → Onglets principaux (accueil, historique, profil)
  session/    → Flux de séance (capture, analyse, résultats)
src/
  components/ → Composants réutilisables (UI, vidéo, analyse, profil)
  services/   → Services Firebase et moteur d'analyse
  hooks/      → Hooks React personnalisés
  stores/     → État global (Zustand)
  constants/  → Thème, strings françaises, config analyse
  types/      → Types TypeScript
  utils/      → Utilitaires (formatage, validation)
```

## Moteur d'analyse

Le MVP utilise un moteur heuristique basé sur les métadonnées vidéo avec un scoring déterministe. L'architecture utilise un **pattern Adapter** permettant de remplacer le moteur heuristique par un vrai module de computer vision (MediaPipe, TFLite) sans modifier l'UI.

**Important** : l'analyse du MVP est une estimation simplifiée. Elle ne remplace pas l'avis d'un coach professionnel.

## Licence

Projet privé - Tous droits réservés.
