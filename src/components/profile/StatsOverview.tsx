import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow , getScoreColor } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';

interface StatsOverviewProps {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  trend: 'up' | 'down' | 'stable';
}

const trendIcons: Record<string, string> = {
  up: '📈',
  down: '📉',
  stable: '➡️',
};

export function StatsOverview({
  totalSessions,
  averageScore,
  bestScore,
  trend,
}: StatsOverviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{totalSessions}</Text>
        <Text style={styles.statLabel}>{Strings.home.totalSessions}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={[styles.statValue, averageScore > 0 && { color: getScoreColor(averageScore) }]}>
          {averageScore > 0 ? averageScore : '-'}
        </Text>
        <Text style={styles.statLabel}>{Strings.home.averageScore}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={[styles.statValue, bestScore > 0 && { color: getScoreColor(bestScore) }]}>
          {bestScore > 0 ? bestScore : '-'}
        </Text>
        <Text style={styles.statLabel}>{Strings.home.bestScore}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.trendIcon}>{trendIcons[trend]}</Text>
        <Text style={styles.statLabel}>Tendance</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
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
  trendIcon: {
    fontSize: 24,
  },
});
