import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ScoreCard } from '@/src/components/analysis/ScoreCard';
import { ConfidenceBadge } from '@/src/components/analysis/ConfidenceBadge';
import { SubScoreList } from '@/src/components/analysis/SubScoreList';
import { StrengthsList } from '@/src/components/analysis/StrengthsList';
import { DefectsList } from '@/src/components/analysis/DefectsList';
import { ExercisesList } from '@/src/components/analysis/ExercisesList';
import { TipsList } from '@/src/components/analysis/TipsList';
import { ShareCard } from '@/src/components/analysis/ShareCard';
import { AnalysisResult } from '@/src/types/analysis';
import { useSessionStore } from '@/src/stores/sessionStore';
import { buildShareText } from '@/src/utils/formatters';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ analysisData?: string }>();
  const { resetDraft } = useSessionStore();
  const shareCardRef = useRef<ViewShot>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const analysis: AnalysisResult | null = useMemo(() => {
    if (params.analysisData) {
      try {
        const parsed = JSON.parse(params.analysisData);
        return { ...parsed, analyzedAt: new Date(parsed.analyzedAt) };
      } catch {
        return null;
      }
    }
    return null;
  }, [params.analysisData]);

  const handleShareText = useCallback(async () => {
    if (!analysis) return;
    try {
      const text = buildShareText(analysis);
      await Share.share({ message: text });
    } catch {
      // Partage annulé ou échoué — rien à faire
    }
  }, [analysis]);

  const handleShareImage = useCallback(async () => {
    if (isCapturing || !analysis) return;
    setIsCapturing(true);
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: Strings.results.shareTitle,
        });
      } else {
        await handleShareText();
      }
    } catch {
      // Capture ou partage échoué — fallback silencieux
    } finally {
      setIsCapturing(false);
    }
  }, [analysis, isCapturing, handleShareText]);

  const handleNewSession = useCallback(() => {
    resetDraft();
    router.replace('/session/choose-mode');
  }, [resetDraft, router]);

  const handleBackToHome = useCallback(() => {
    resetDraft();
    router.replace('/(tabs)');
  }, [resetDraft, router]);

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Aucune analyse disponible.</Text>
          <Button
            title={Strings.results.backToHome}
            onPress={handleBackToHome}
          />
        </View>
      </SafeAreaView>
    );
  }

  const frontScoreItems = analysis.subScores.front
    ? [
        { label: Strings.scores.upperBodyAlignment, score: analysis.subScores.front.upperBodyAlignment },
        { label: Strings.scores.stability, score: analysis.subScores.front.stability },
        { label: Strings.scores.torsoOpenness, score: analysis.subScores.front.torsoOpenness },
        { label: Strings.scores.gestureSymmetry, score: analysis.subScores.front.gestureSymmetry },
        { label: Strings.scores.posturalQuality, score: analysis.subScores.front.posturalQuality },
      ]
    : [];

  const backScoreItems = analysis.subScores.back
    ? [
        { label: Strings.scores.approachTrajectory, score: analysis.subScores.back.approachTrajectory },
        { label: Strings.scores.supportFootPlacement, score: analysis.subScores.back.supportFootPlacement },
        { label: Strings.scores.strikingLegTrajectory, score: analysis.subScores.back.strikingLegTrajectory },
        { label: Strings.scores.globalGestureAxis, score: analysis.subScores.back.globalGestureAxis },
        { label: Strings.scores.postImpactBalance, score: analysis.subScores.back.postImpactBalance },
      ]
    : [];

  const commonScoreItems = [
    { label: Strings.scores.approachAngle, score: analysis.subScores.common.approachAngle },
    { label: Strings.scores.supportFootPosition, score: analysis.subScores.common.supportFootPosition },
    { label: Strings.scores.torsoOrientation, score: analysis.subScores.common.torsoOrientation },
    { label: Strings.scores.strikingLegMovement, score: analysis.subScores.common.strikingLegMovement },
    { label: Strings.scores.estimatedContactPoint, score: analysis.subScores.common.estimatedContactPoint },
    { label: Strings.scores.postStrikeBalance, score: analysis.subScores.common.postStrikeBalance },
    { label: Strings.scores.overallTiming, score: analysis.subScores.common.overallTiming },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Carte de partage hors-écran pour capture */}
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 1 }}>
          <View style={styles.captureWrapper}>
            <ShareCard analysis={analysis} />
          </View>
        </ViewShot>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score global */}
        <View style={styles.scoreSection}>
          <ScoreCard score={analysis.globalScore} />
          <ConfidenceBadge
            confidence={analysis.confidence}
            availableAngles={analysis.availableAngles}
          />
        </View>

        {/* Disclaimer MVP */}
        <Card style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>{analysis.disclaimer}</Text>
        </Card>

        {/* Analyse partielle */}
        {analysis.confidence < 1.0 && (
          <Card style={styles.partialCard}>
            <Text style={styles.partialText}>
              {Strings.results.partialAnalysisDesc}
            </Text>
          </Card>
        )}

        {/* Points forts */}
        <Card style={styles.section}>
          <StrengthsList strengths={analysis.strengths} />
        </Card>

        {/* Défauts */}
        <Card style={styles.section}>
          <DefectsList defects={analysis.defects} />
        </Card>

        {/* Exercices */}
        <Card style={styles.section}>
          <ExercisesList defects={analysis.defects} />
        </Card>

        {/* Sous-scores vue de face */}
        {frontScoreItems.length > 0 && (
          <Card style={styles.section}>
            <SubScoreList
              title={Strings.results.frontScores}
              scores={frontScoreItems}
            />
          </Card>
        )}

        {/* Sous-scores vue de dos */}
        {backScoreItems.length > 0 && (
          <Card style={styles.section}>
            <SubScoreList
              title={Strings.results.backScores}
              scores={backScoreItems}
            />
          </Card>
        )}

        {/* Sous-scores communs */}
        <Card style={styles.section}>
          <SubScoreList
            title={Strings.results.commonScores}
            scores={commonScoreItems}
          />
        </Card>

        {/* Conseils */}
        <Card style={styles.section}>
          <TipsList tips={analysis.tips} />
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={Strings.results.shareImage}
            variant="secondary"
            onPress={handleShareImage}
            loading={isCapturing}
            fullWidth
          />
          <Button
            title={Strings.results.shareText}
            variant="outline"
            onPress={handleShareText}
            fullWidth
            style={styles.actionSpacing}
          />
          <Button
            title={Strings.results.newSession}
            onPress={handleNewSession}
            fullWidth
            style={styles.actionSpacing}
          />
          <Button
            title={Strings.results.backToHome}
            variant="ghost"
            onPress={handleBackToHome}
            fullWidth
            style={styles.actionSpacing}
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
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  disclaimerCard: {
    backgroundColor: Colors.warningLight,
    marginBottom: Spacing.md,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.warning,
    textAlign: 'center',
  },
  partialCard: {
    backgroundColor: Colors.infoLight,
    marginBottom: Spacing.md,
  },
  partialText: {
    ...Typography.caption,
    color: Colors.info,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.md,
  },
  actions: {
    marginTop: Spacing.lg,
  },
  actionSpacing: {
    marginTop: Spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  captureWrapper: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
});
