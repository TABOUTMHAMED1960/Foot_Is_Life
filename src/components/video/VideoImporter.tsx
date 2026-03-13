import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';

interface VideoImporterProps {
  onPickVideo: () => void;
  angleLabel: string;
}

export function VideoImporter({ onPickVideo, angleLabel }: VideoImporterProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.importArea} onPress={onPickVideo} activeOpacity={0.7}>
        <Text style={styles.icon}>📁</Text>
        <Text style={styles.title}>{Strings.session.importVideo}</Text>
        <Text style={styles.subtitle}>{angleLabel}</Text>
        <Text style={styles.hint}>Appuie pour choisir une vidéo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  importArea: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...Typography.h3,
    color: Colors.textOnPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textLight,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
});
