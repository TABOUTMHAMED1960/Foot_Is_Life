import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { VideoAngle } from '@/src/types/video';

interface PlacementGuideProps {
  angle: VideoAngle;
}

export function PlacementGuide({ angle }: PlacementGuideProps) {
  const isFront = angle === 'front';

  return (
    <View style={[styles.container, { backgroundColor: isFront ? Colors.primaryLight + '15' : Colors.secondary + '15' }]}>
      <View style={styles.diagram}>
        {/* Représentation visuelle simplifiée */}
        <View style={styles.field}>
          <View style={styles.player}>
            <Text style={styles.playerIcon}>🧑</Text>
            <Text style={styles.playerLabel}>Joueur</Text>
          </View>

          <View style={styles.ball}>
            <Text style={styles.ballIcon}>⚽</Text>
          </View>

          <View style={[styles.phone, isFront ? styles.phoneFront : styles.phoneBack]}>
            <Text style={styles.phoneIcon}>📱</Text>
            <Text style={styles.phoneLabel}>
              {isFront ? 'Toi ici\n(devant)' : 'Toi ici\n(derrière)'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.distanceInfo}>
        <Text style={styles.distanceText}>📏 3 à 4 mètres du joueur</Text>
        <Text style={styles.distanceText}>📐 Hauteur de hanches</Text>
        <Text style={styles.distanceText}>🤳 Tiens le téléphone bien stable</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  diagram: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  field: {
    width: 200,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  player: {
    alignItems: 'center',
    position: 'absolute',
    top: 20,
  },
  playerIcon: {
    fontSize: 36,
  },
  playerLabel: {
    ...Typography.small,
    color: Colors.text,
  },
  ball: {
    position: 'absolute',
    top: 75,
  },
  ballIcon: {
    fontSize: 20,
  },
  phone: {
    alignItems: 'center',
    position: 'absolute',
  },
  phoneFront: {
    bottom: 0,
  },
  phoneBack: {
    top: -10,
    right: 10,
  },
  phoneIcon: {
    fontSize: 24,
  },
  phoneLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  distanceInfo: {
    gap: Spacing.xs,
  },
  distanceText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
