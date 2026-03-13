import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, getScoreColor } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useAuthStore } from '@/src/stores/authStore';
import { useSession } from '@/src/hooks/useSession';
import { usePlayerStats } from '@/src/hooks/usePlayerStats';
import { formatScore } from '@/src/utils/formatters';
import { getPendingCount } from '@/src/services/local/offlineStore';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { sessions, isLoading } = useSession();
  const stats = usePlayerStats(sessions);

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getPendingCount().then(setPendingCount);
  }, [sessions]);

  const hasSessions = stats.totalSessions > 0;
  const lastScore = sessions.length > 0 && sessions[0].analysis
    ? sessions[0].analysis.globalScore
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Salutation */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {Strings.home.greeting} {user?.displayName || ''} !
          </Text>
          <Text style={styles.subtitle}>{Strings.app.tagline}</Text>
        </View>

        {/* Bannière hors-ligne */}
        {pendingCount > 0 && (
          <Card style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              {pendingCount} {Strings.offline.pendingBanner}
            </Text>
          </Card>
        )}

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {hasSessions ? stats.totalSessions : '0'}
            </Text>
            <Text style={styles.statLabel}>{Strings.home.totalSessions}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {hasSessions ? formatScore(stats.averageScore) : '-'}
            </Text>
            <Text style={styles.statLabel}>{Strings.home.averageScore}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {hasSessions ? formatScore(stats.bestScore) : '-'}
            </Text>
            <Text style={styles.statLabel}>{Strings.home.bestScore}</Text>
          </Card>
        </View>

        {/* Dernier score ou CTA première séance */}
        {hasSessions && lastScore !== null ? (
          <Card style={styles.lastScoreCard}>
            <Text style={styles.lastScoreLabel}>{Strings.home.lastScore}</Text>
            <View style={styles.lastScoreRow}>
              <View style={[styles.lastScoreBadge, { borderColor: getScoreColor(lastScore) }]}>
                <Text style={[styles.lastScoreValue, { color: getScoreColor(lastScore) }]}>
                  {lastScore}
                </Text>
              </View>
              <View style={styles.lastScoreInfo}>
                <Text style={styles.trendText}>
                  {stats.trend === 'up' && '📈 En progression !'}
                  {stats.trend === 'down' && '📉 Continue tes efforts !'}
                  {stats.trend === 'stable' && '➡️ Score stable'}
                </Text>
                {stats.mostFrequentDefects.length > 0 && (
                  <Text style={styles.focusText}>
                    🎯 Focus : {stats.mostFrequentDefects[0]}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.ctaCard}>
            <Text style={styles.ctaText}>{Strings.home.noSessionsYet}</Text>
            <Text style={styles.ctaSubtext}>{Strings.home.firstSessionCta}</Text>
          </Card>
        )}

        {/* Bouton principal */}
        <Button
          title={Strings.home.startSession}
          onPress={() => router.push('/session/choose-mode')}
          size="lg"
          fullWidth
          style={styles.startButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  greeting: {
    marginBottom: Spacing.lg,
  },
  greetingText: {
    ...Typography.h1,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  lastScoreCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  lastScoreLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  lastScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  lastScoreBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastScoreValue: {
    ...Typography.h2,
    fontSize: 22,
  },
  lastScoreInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  trendText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  focusText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  ctaCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  ctaText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ctaSubtext: {
    ...Typography.bodyBold,
    color: Colors.primary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  offlineBanner: {
    backgroundColor: Colors.warningLight,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  offlineBannerText: {
    ...Typography.caption,
    color: Colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  startButton: {
    marginBottom: Spacing.xl,
  },
});
