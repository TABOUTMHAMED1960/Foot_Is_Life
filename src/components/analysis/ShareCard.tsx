import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { AnalysisResult } from '@/src/types/analysis';
import { getScoreColor } from '@/src/constants/theme';

interface ShareCardProps {
  analysis: AnalysisResult;
}

/**
 * Carte visuelle des résultats, conçue pour être capturée en image
 * via react-native-view-shot puis partagée.
 *
 * Dimensions fixes pour un rendu cohérent sur tous les appareils.
 */
export function ShareCard({ analysis }: ShareCardProps) {
  const strengths = analysis.strengths.slice(0, 3);
  const defects = analysis.defects.slice(0, 3);
  const scoreColor = getScoreColor(analysis.globalScore);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>{Strings.app.name}</Text>
        <Text style={styles.subtitle}>{Strings.results.shareTitle}</Text>
      </View>

      {/* Score */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {Math.round(analysis.globalScore)}
          </Text>
        </View>
        <Text style={styles.scoreLabel}>
          {Strings.results.shareScore} {Strings.common.outOf100}
        </Text>
      </View>

      {/* Points forts */}
      {strengths.length > 0 && (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>{Strings.results.shareStrengths}</Text>
          {strengths.map((s, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.listIconGood}>+</Text>
              <Text style={styles.listText} numberOfLines={1}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Défauts */}
      {defects.length > 0 && (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>{Strings.results.shareDefects}</Text>
          {defects.map((d, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.listIconBad}>-</Text>
              <Text style={styles.listText} numberOfLines={1}>{d.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.motivation}>{Strings.results.shareMotivation}</Text>
        <Text style={styles.footerBrand}>{Strings.results.shareFooter}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Score
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  // Lists
  listSection: {
    marginBottom: Spacing.sm,
  },
  listTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  listIconGood: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
    width: 16,
    textAlign: 'center',
  },
  listIconBad: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
    width: 16,
    textAlign: 'center',
  },
  listText: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
  },
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  motivation: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footerBrand: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
});
