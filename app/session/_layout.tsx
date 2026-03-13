import { Stack } from 'expo-router';
import { Colors, Typography } from '@/src/constants/theme';

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { ...Typography.h3 },
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen
        name="choose-mode"
        options={{ title: 'Nouvelle séance' }}
      />
      <Stack.Screen
        name="instructions-front"
        options={{ title: 'Vue de face' }}
      />
      <Stack.Screen
        name="capture-front"
        options={{ title: 'Enregistrement', headerShown: false }}
      />
      <Stack.Screen
        name="instructions-back"
        options={{ title: 'Vue de dos' }}
      />
      <Stack.Screen
        name="capture-back"
        options={{ title: 'Enregistrement', headerShown: false }}
      />
      <Stack.Screen
        name="validation"
        options={{ title: 'Validation' }}
      />
      <Stack.Screen
        name="analyzing"
        options={{ title: 'Analyse', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="results"
        options={{ title: 'Résultats', headerBackVisible: false }}
      />
    </Stack>
  );
}
