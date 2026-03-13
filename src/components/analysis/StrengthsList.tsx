import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';

interface StrengthsListProps {
  strengths: string[];
}

export function StrengthsList({ strengths }: StrengthsListProps) {
  if (strengths.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{Strings.results.strengths}</Text>
      {strengths.map((strength, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.icon}>💪</Text>
          <Text style={styles.text}>{strength}</Text>
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
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 16,
    marginTop: 2,
  },
  text: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
});
