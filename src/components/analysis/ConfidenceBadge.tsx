import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { Strings } from '@/src/constants/strings.fr';
import { Spacing } from '@/src/constants/theme';

interface ConfidenceBadgeProps {
  confidence: number;
  availableAngles: string[];
}

export function ConfidenceBadge({ confidence, availableAngles }: ConfidenceBadgeProps) {
  const isHigh = confidence >= 1.0;

  return (
    <View style={styles.container}>
      <Badge
        label={isHigh ? Strings.results.confidenceHigh : Strings.results.confidenceMedium}
        variant={isHigh ? 'success' : 'warning'}
      />
      {!isHigh && (
        <Badge
          label={Strings.results.partialAnalysis}
          variant="warning"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
});
