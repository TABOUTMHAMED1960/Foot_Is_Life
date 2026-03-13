import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';

interface VideoPreviewProps {
  uri: string;
  height?: number;
}

export function VideoPreview({ uri, height = 200 }: VideoPreviewProps) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  return (
    <View style={[styles.container, { height }]}>
      <VideoView
        style={styles.video}
        player={player}
      />
    </View>
  );
}

export function VideoPreviewPlaceholder({ label }: { label: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderIcon}>🎬</Text>
      <Text style={styles.placeholderText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  placeholder: {
    height: 120,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  placeholderText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
});
