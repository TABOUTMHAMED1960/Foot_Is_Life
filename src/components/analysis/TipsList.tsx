import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';

interface TipsListProps {
  tips: string[];
}

export function TipsList({ tips }: TipsListProps) {
  if (tips.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{Strings.results.tips}</Text>
      {tips.map((tip, index) => (
        <View key={index} style={styles.tipRow}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{tip}</Text>
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
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.infoLight + '40',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  tipText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
});
