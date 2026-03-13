import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Badge } from '@/src/components/ui/Badge';
import { Defect, Severity } from '@/src/types/analysis';

interface DefectsListProps {
  defects: Defect[];
}

function severityVariant(severity: Severity): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'important':
      return 'error';
    case 'moyen':
      return 'warning';
    case 'léger':
      return 'info';
  }
}

function severityLabel(severity: Severity): string {
  switch (severity) {
    case 'important':
      return Strings.results.severityImportant;
    case 'moyen':
      return Strings.results.severityMedium;
    case 'léger':
      return Strings.results.severityLight;
  }
}

export function DefectsList({ defects }: DefectsListProps) {
  if (defects.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{Strings.results.defects}</Text>
      {defects.map((defect, index) => (
        <View key={index} style={styles.defectCard}>
          <View style={styles.defectHeader}>
            <Text style={styles.defectLabel}>{defect.label}</Text>
            <Badge
              label={severityLabel(defect.severity)}
              variant={severityVariant(defect.severity)}
            />
          </View>
          {defect.exercises.length > 0 && (
            <View style={styles.exercisesContainer}>
              {defect.exercises.map((exercise, i) => (
                <View key={i} style={styles.exerciseRow}>
                  <Text style={styles.exerciseIcon}>🏋️</Text>
                  <Text style={styles.exerciseText}>{exercise}</Text>
                </View>
              ))}
            </View>
          )}
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
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  defectCard: {
    backgroundColor: Colors.errorLight + '40',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  defectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  defectLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  exercisesContainer: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  exerciseIcon: {
    fontSize: 14,
    marginTop: 2,
  },
  exerciseText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
});
