import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Defect } from '@/src/types/analysis';

interface ExercisesListProps {
  defects: Defect[];
}

export function ExercisesList({ defects }: ExercisesListProps) {
  const allExercises = defects.flatMap((d) => d.exercises);
  if (allExercises.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{Strings.results.exercises}</Text>
      {allExercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseRow}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <Text style={styles.exerciseText}>{exercise}</Text>
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
    color: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.warningLight + '40',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    ...Typography.small,
    color: Colors.textOnSecondary,
    fontWeight: '700',
  },
  exerciseText: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
  },
});
