import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useSessionStore } from '@/src/stores/sessionStore';

export default function ChooseModeScreen() {
  const router = useRouter();
  const { setCaptureMode, resetDraft } = useSessionStore();

  const handleChoice = (mode: 'camera' | 'import') => {
    resetDraft();
    setCaptureMode(mode);
    router.push('/session/instructions-front');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>{Strings.session.chooseMode}</Text>

        <Card style={styles.optionCard}>
          <Text style={styles.optionTitle}>{Strings.session.filmNow}</Text>
          <Text style={styles.optionDesc}>{Strings.session.filmNowDesc}</Text>
          <Button
            title={Strings.session.filmNow}
            onPress={() => handleChoice('camera')}
            fullWidth
            style={styles.optionButton}
          />
        </Card>

        <Card style={styles.optionCard}>
          <Text style={styles.optionTitle}>{Strings.session.importVideo}</Text>
          <Text style={styles.optionDesc}>{Strings.session.importDesc}</Text>
          <Button
            title={Strings.session.importVideo}
            variant="outline"
            onPress={() => handleChoice('import')}
            fullWidth
            style={styles.optionButton}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  optionCard: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  optionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  optionDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  optionButton: {
    marginTop: Spacing.sm,
  },
});
