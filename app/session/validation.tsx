import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { VideoPreview, VideoPreviewPlaceholder } from '@/src/components/video/VideoPreview';
import { useSessionStore } from '@/src/stores/sessionStore';

export default function ValidationScreen() {
  const router = useRouter();
  const { draft } = useSessionStore();
  const hasFront = draft.frontVideo !== null;
  const hasBack = draft.backVideo !== null;
  const canAnalyze = hasFront || hasBack;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{Strings.session.validationTitle}</Text>

        <Card style={styles.videoCard}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoLabel}>{Strings.session.frontVideo}</Text>
            <Badge
              label={hasFront ? 'OK' : 'Manquante'}
              variant={hasFront ? 'success' : 'warning'}
            />
          </View>
          {hasFront && draft.frontVideo ? (
            <VideoPreview uri={draft.frontVideo.uri} height={150} />
          ) : (
            <VideoPreviewPlaceholder label="Pas de vidéo de face" />
          )}
        </Card>

        <Card style={styles.videoCard}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoLabel}>{Strings.session.backVideo}</Text>
            <Badge
              label={hasBack ? 'OK' : Strings.session.noBackVideo}
              variant={hasBack ? 'success' : 'neutral'}
            />
          </View>
          {hasBack && draft.backVideo ? (
            <VideoPreview uri={draft.backVideo.uri} height={150} />
          ) : (
            <VideoPreviewPlaceholder label={Strings.session.noBackVideo} />
          )}
        </Card>

        {!hasBack && hasFront && (
          <Text style={styles.partialWarning}>
            {Strings.results.partialAnalysisDesc}
          </Text>
        )}

        <View style={styles.footer}>
          <Button
            title={Strings.session.launchAnalysis}
            onPress={() => router.push('/session/analyzing')}
            size="lg"
            fullWidth
            disabled={!canAnalyze}
          />
          <Button
            title={Strings.session.redo}
            variant="outline"
            onPress={() => router.replace('/session/choose-mode')}
            fullWidth
            style={styles.redoButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  videoCard: {
    marginBottom: Spacing.md,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  videoLabel: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  partialWarning: {
    ...Typography.caption,
    color: Colors.warning,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  footer: {
    marginTop: Spacing.lg,
  },
  redoButton: {
    marginTop: Spacing.sm,
  },
});
