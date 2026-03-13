import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, getScoreColor } from '@/src/constants/theme';
import { ProgressBar } from '@/src/components/ui/ProgressBar';

interface SubScoreItem {
  label: string;
  score: number;
}

interface SubScoreListProps {
  title: string;
  scores: SubScoreItem[];
}

export function SubScoreList({ title, scores }: SubScoreListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {scores.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
            <Text style={[styles.score, { color: getScoreColor(item.score) }]}>
              {item.score}
            </Text>
          </View>
          <ProgressBar
            progress={item.score / 100}
            color={getScoreColor(item.score)}
            height={6}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  row: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  score: {
    ...Typography.bodyBold,
  },
});
