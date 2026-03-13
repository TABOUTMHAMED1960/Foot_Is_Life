import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { formatDuration } from '@/src/utils/formatters';

interface VideoRecorderProps {
  cameraRef: React.RefObject<CameraView | null>;
  isRecording: boolean;
  duration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  hasPermission: boolean;
}

export function VideoRecorder({
  cameraRef,
  isRecording,
  duration,
  onStartRecording,
  onStopRecording,
  hasPermission,
}: VideoRecorderProps) {
  if (!hasPermission) {
    return (
      <View style={styles.noPermission}>
        <Text style={styles.noPermissionText}>
          {Strings.permissions.cameraRequired}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode="video"
        facing="back"
      >
        {isRecording && (
          <View style={styles.durationBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          </View>
        )}
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? onStopRecording : onStartRecording}
          activeOpacity={0.7}
        >
          <View style={[styles.recordInner, isRecording && styles.recordInnerActive]} />
        </TouchableOpacity>
        <Text style={styles.hint}>
          {isRecording ? Strings.session.stopRecording : 'Appuie pour filmer'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  noPermission: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  noPermissionText: {
    ...Typography.body,
    color: Colors.textOnPrimary,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  durationBadge: {
    position: 'absolute',
    top: Spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  durationText: {
    ...Typography.bodyBold,
    color: Colors.textOnPrimary,
  },
  controls: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: '#000',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.textOnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    borderColor: Colors.error,
  },
  recordInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.error,
  },
  recordInnerActive: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
});
