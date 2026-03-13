import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { ScoreGauge } from '@/src/components/ui/ScoreGauge';
import { Strings } from '@/src/constants/strings.fr';

interface ScoreCardProps {
  score: number;
}

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <View style={styles.container}>
      <ScoreGauge score={score} size={160} strokeWidth={12} />
      <Text style={styles.label}>{Strings.results.globalScore}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    ...Typography.h3,
    color: Colors.text,
  },
});
