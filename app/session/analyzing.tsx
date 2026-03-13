import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { Button } from '@/src/components/ui/Button';
import { useAnalysis } from '@/src/hooks/useAnalysis';
import { useVideoUpload } from '@/src/hooks/useVideoUpload';
import { useSession } from '@/src/hooks/useSession';
import { useSessionStore } from '@/src/stores/sessionStore';
import { useAuthStore } from '@/src/stores/authStore';
import { runAnalysisPipeline } from '@/src/services/analysis/pipeline';
import { saveSessionLocally } from '@/src/services/local/offlineStore';

/**
 * Étapes du flux d'analyse :
 *  0 — Upload des vidéos vers Firebase Storage (réel, avec progression)
 *  1 — Analyse heuristique de la frappe
 *  2 — Génération des conseils
 *  3 — Terminé
 */
const STEP_LABELS = [
  Strings.session.analyzingUpload,
  Strings.session.analyzingProcess,
  Strings.session.analyzingTips,
  Strings.session.analyzingDone,
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const { analyze } = useAnalysis();
  const { uploadVideos, progress: uploadProgress, errors: uploadErrors } = useVideoUpload();
  const { saveSession, saveAnalysis } = useSession();
  const { draft, resetDraft } = useSessionStore();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const analysisStarted = useRef(false);

  // Suivre la progression d'upload en temps réel
  useEffect(() => {
    if (step === 0) {
      setUploadPercent(uploadProgress.overall);
    }
  }, [uploadProgress.overall, step]);

  const runPipeline = useCallback(async () => {
    setPipelineError(null);
    setStep(0);
    setUploadPercent(0);
    setUploadWarning(null);

    const pipelineResult = await runAnalysisPipeline({
      userId: user?.uid ?? '',
      frontVideo: draft.frontVideo,
      backVideo: draft.backVideo,
      saveSession,
      uploadVideos,
      analyze,
      saveAnalysis,
      saveLocal: saveSessionLocally,
      onStep: (s) => setStep(s),
    });

    if (pipelineResult.warning) {
      setUploadWarning(pipelineResult.warning);
    }

    if (!pipelineResult.success) {
      setPipelineError(pipelineResult.error ?? Strings.session.analyzingErrorAnalysis);
      return;
    }

    // Petit délai pour que l'utilisateur voie "Terminé"
    await delay(400);

    router.replace({
      pathname: '/session/results',
      params: { analysisData: JSON.stringify(pipelineResult.result) },
    });
  }, [user, draft, analyze, saveSession, saveAnalysis, uploadVideos, router]);

  useEffect(() => {
    if (analysisStarted.current) return;
    analysisStarted.current = true;
    runPipeline();
  }, [runPipeline]);

  const handleRetry = () => {
    analysisStarted.current = false;
    setPipelineError(null);
    runPipeline();
  };

  const handleBackToHome = () => {
    resetDraft();
    router.replace('/(tabs)');
  };

  // ── Écran d'erreur ──
  if (pipelineError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>{Strings.common.error}</Text>
          <Text style={styles.errorMessage}>{pipelineError}</Text>
          <View style={styles.errorActions}>
            <Button
              title={Strings.common.retry}
              onPress={handleRetry}
              size="lg"
              fullWidth
            />
            <Button
              title={Strings.results.backToHome}
              variant="outline"
              onPress={handleBackToHome}
              fullWidth
              style={styles.homeButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Calcul de la progression globale ──
  const computeGlobalProgress = (): number => {
    if (step === 0) {
      return uploadPercent * 0.25;
    }
    return 0.25 + (step / (STEP_LABELS.length - 1)) * 0.75;
  };

  const globalProgress = computeGlobalProgress();

  // Message dynamique pendant l'upload
  const getStepMessage = (): string => {
    if (step !== 0) return STEP_LABELS[step];

    const hasFront = draft.frontVideo !== null;
    const hasBack = draft.backVideo !== null;

    if (hasFront && hasBack) {
      if (uploadProgress.front < 1 && uploadProgress.back < 1) {
        return Strings.session.analyzingUploadProgress;
      }
      if (uploadProgress.front >= 1 && uploadProgress.back < 1) {
        return Strings.session.analyzingUploadBack;
      }
      if (uploadProgress.front < 1 && uploadProgress.back >= 1) {
        return Strings.session.analyzingUploadFront;
      }
      return Strings.session.analyzingUploadDone;
    }

    if (hasFront) {
      return uploadProgress.front < 1
        ? Strings.session.analyzingUploadFront
        : Strings.session.analyzingUploadDone;
    }
    if (hasBack) {
      return uploadProgress.back < 1
        ? Strings.session.analyzingUploadBack
        : Strings.session.analyzingUploadDone;
    }

    return STEP_LABELS[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{Strings.session.analyzingTitle}</Text>

        <View style={styles.spinnerContainer}>
          <LoadingSpinner message={getStepMessage()} />

          {step === 0 && uploadPercent > 0 && (
            <Text style={styles.percentText}>
              {Math.round(uploadPercent * 100)} %
            </Text>
          )}
        </View>

        {uploadWarning && step > 0 && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>{uploadWarning}</Text>
          </View>
        )}

        <View style={styles.progressContainer}>
          <ProgressBar progress={globalProgress} />
          <Text style={styles.stepText}>
            {step + 1} / {STEP_LABELS.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  spinnerContainer: {
    minHeight: 120,
    alignItems: 'center',
  },
  percentText: {
    ...Typography.body,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: Colors.warningBackground ?? '#FFF3CD',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.warningText ?? '#856404',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  // ── Styles erreur ──
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorActions: {
    width: '100%',
  },
  homeButton: {
    marginTop: Spacing.sm,
  },
});
