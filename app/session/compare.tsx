import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, getScoreColor } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { AnalysisResult } from '@/src/types/analysis';
import { compareAnalyses, ComparisonResult, ScoreDelta, Trend } from '@/src/utils/comparison';
import { formatShortDate } from '@/src/utils/formatters';

export default function CompareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    beforeData?: string;
    afterData?: string;
    beforeDate?: string;
    afterDate?: string;
  }>();

  const comparison: ComparisonResult | null = useMemo(() => {
    if (!params.beforeData || !params.afterData) return null;
    try {
      const before: AnalysisResult = JSON.parse(params.beforeData);
      const after: AnalysisResult = JSON.parse(params.afterData);
      before.analyzedAt = new Date(before.analyzedAt);
      after.analyzedAt = new Date(after.analyzedAt);
      return compareAnalyses(before, after);
    } catch {
      return null;
    }
  }, [params.beforeData, params.afterData]);

  const beforeDate = params.beforeDate
    ? formatShortDate(new Date(params.beforeDate))
    : Strings.compare.before;
  const afterDate = params.afterDate
    ? formatShortDate(new Date(params.afterDate))
    : Strings.compare.after;

  if (!comparison) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Aucune donnée de comparaison.</Text>
          <Button
            title={Strings.compare.back}
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre */}
        <Text style={styles.title}>{Strings.compare.title}</Text>

        {/* Tendance globale */}
        <Card style={styles.trendCard}>
          <Text style={[styles.trendLabel, { color: trendColor(comparison.overallTrend) }]}>
            {trendIcon(comparison.overallTrend)} {comparison.overallTrendLabel}
          </Text>
        </Card>

        {/* Score global */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{Strings.results.globalScore}</Text>
          <ScoreCompareRow
            before={comparison.globalScore.before}
            after={comparison.globalScore.after}
            delta={comparison.globalScore.delta}
            beforeLabel={beforeDate}
            afterLabel={afterDate}
          />
        </Card>

        {/* Sous-scores communs */}
        {comparison.commonScores.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{Strings.results.commonScores}</Text>
            {comparison.commonScores.map((s) => (
              <DeltaRow key={s.label} item={s} />
            ))}
          </Card>
        )}

        {/* Sous-scores face */}
        {comparison.frontScores.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{Strings.results.frontScores}</Text>
            {comparison.frontScores.map((s) => (
              <DeltaRow key={s.label} item={s} />
            ))}
          </Card>
        )}
        {comparison.frontScores.length === 0 && (
          <Card style={styles.section}>
            <Text style={styles.noDataText}>{Strings.compare.noCommonFront}</Text>
          </Card>
        )}

        {/* Sous-scores dos */}
        {comparison.backScores.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{Strings.results.backScores}</Text>
            {comparison.backScores.map((s) => (
              <DeltaRow key={s.label} item={s} />
            ))}
          </Card>
        )}
        {comparison.backScores.length === 0 && (
          <Card style={styles.section}>
            <Text style={styles.noDataText}>{Strings.compare.noCommonBack}</Text>
          </Card>
        )}

        {/* Points forts & défauts */}
        <ChangeSection
          title={Strings.compare.defectsFixed}
          items={comparison.defectsFixed}
          color={Colors.success}
          icon="+"
        />
        <ChangeSection
          title={Strings.compare.strengthsGained}
          items={comparison.strengthsGained}
          color={Colors.success}
          icon="+"
        />
        <ChangeSection
          title={Strings.compare.defectsNew}
          items={comparison.defectsNew}
          color={Colors.error}
          icon="-"
        />
        <ChangeSection
          title={Strings.compare.strengthsLost}
          items={comparison.strengthsLost}
          color={Colors.warning}
          icon="-"
        />

        {/* Retour */}
        <Button
          title={Strings.compare.back}
          variant="outline"
          onPress={() => router.back()}
          fullWidth
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ──

function ScoreCompareRow({
  before,
  after,
  delta,
  beforeLabel,
  afterLabel,
}: {
  before: number;
  after: number;
  delta: number;
  beforeLabel: string;
  afterLabel: string;
}) {
  const trend = delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable';
  return (
    <View style={styles.scoreCompareRow}>
      <View style={styles.scoreColumn}>
        <Text style={styles.scoreColumnLabel}>{beforeLabel}</Text>
        <View style={[styles.scoreBadge, { borderColor: getScoreColor(before) }]}>
          <Text style={[styles.scoreBadgeText, { color: getScoreColor(before) }]}>
            {Math.round(before)}
          </Text>
        </View>
      </View>
      <View style={styles.deltaColumn}>
        <Text style={[styles.deltaText, { color: trendColor(trend) }]}>
          {delta > 0 ? `+${Math.round(delta)}` : Math.round(delta)}
        </Text>
      </View>
      <View style={styles.scoreColumn}>
        <Text style={styles.scoreColumnLabel}>{afterLabel}</Text>
        <View style={[styles.scoreBadge, { borderColor: getScoreColor(after) }]}>
          <Text style={[styles.scoreBadgeText, { color: getScoreColor(after) }]}>
            {Math.round(after)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function DeltaRow({ item }: { item: ScoreDelta }) {
  return (
    <View style={styles.deltaRow}>
      <Text style={styles.deltaRowLabel} numberOfLines={1}>
        {item.label}
      </Text>
      <View style={styles.deltaRowValues}>
        <Text style={styles.deltaRowScore}>{Math.round(item.before)}</Text>
        <Text style={styles.deltaRowArrow}>→</Text>
        <Text style={styles.deltaRowScore}>{Math.round(item.after)}</Text>
        <Text
          style={[
            styles.deltaRowDelta,
            { color: trendColor(item.trend) },
          ]}
        >
          {item.delta > 0 ? `+${Math.round(item.delta)}` : Math.round(item.delta)}
        </Text>
      </View>
    </View>
  );
}

function ChangeSection({
  title,
  items,
  color,
  icon,
}: {
  title: string;
  items: string[];
  color: string;
  icon: string;
}) {
  if (items.length === 0) return null;
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={[styles.changeItem, { color }]}>
          {icon} {item}
        </Text>
      ))}
    </Card>
  );
}

// ── Helpers ──

function trendColor(trend: Trend): string {
  if (trend === 'up') return Colors.success;
  if (trend === 'down') return Colors.error;
  return Colors.textSecondary;
}

function trendIcon(trend: Trend): string {
  if (trend === 'up') return '↗';
  if (trend === 'down') return '↘';
  return '→';
}

// ── Styles ──

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
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  trendCard: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
  },
  trendLabel: {
    ...Typography.h3,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  noDataText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // Score compare
  scoreCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  scoreColumn: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.xs,
  },
  scoreColumnLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  scoreBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    ...Typography.h3,
    fontWeight: '700',
  },
  deltaColumn: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  deltaText: {
    ...Typography.h3,
    fontWeight: '700',
  },
  // Delta row
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  deltaRowLabel: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  deltaRowValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  deltaRowScore: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 28,
    textAlign: 'center',
  },
  deltaRowArrow: {
    ...Typography.small,
    color: Colors.textLight,
  },
  deltaRowDelta: {
    ...Typography.caption,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  // Changes
  changeItem: {
    ...Typography.body,
    paddingVertical: Spacing.xs,
  },
  // Actions
  backButton: {
    marginTop: Spacing.lg,
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
});
