import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { PlacementGuide } from '@/src/components/video/PlacementGuide';

export default function InstructionsBackScreen() {
  const router = useRouter();

  const handleSkip = () => {
    Alert.alert(
      Strings.session.skipBackView,
      Strings.session.skipBackViewConfirm,
      [
        { text: Strings.common.cancel, style: 'cancel' },
        {
          text: Strings.common.continue,
          onPress: () => router.push('/session/validation'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <PlacementGuide angle="back" />

        <Text style={styles.title}>{Strings.session.instructionsBackTitle}</Text>
        <Text style={styles.description}>{Strings.session.instructionsBackDesc}</Text>

        <Card style={styles.tipsCard}>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>1</Text>
            <Text style={styles.tipText}>{Strings.session.instructionsBackTip1}</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>2</Text>
            <Text style={styles.tipText}>{Strings.session.instructionsBackTip2}</Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>3</Text>
            <Text style={styles.tipText}>{Strings.session.instructionsBackTip3}</Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            title={Strings.session.instructionsBackStart}
            onPress={() => router.push('/session/capture-back')}
            size="lg"
            fullWidth
          />
          <Button
            title={Strings.session.skipBackView}
            variant="ghost"
            onPress={handleSkip}
            fullWidth
            style={styles.skipButton}
          />
        </View>
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
  illustration: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.secondary + '15',
    borderRadius: BorderRadius.xl,
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  illustrationLabel: {
    ...Typography.bodyBold,
    color: Colors.secondary,
    marginTop: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  tipsCard: {
    gap: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  tipBullet: {
    ...Typography.bodyBold,
    color: Colors.textOnSecondary,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    overflow: 'hidden',
  },
  tipText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: Spacing.lg,
  },
  skipButton: {
    marginTop: Spacing.sm,
  },
});
