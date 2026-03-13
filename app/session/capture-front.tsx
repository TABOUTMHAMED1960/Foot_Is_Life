import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { VideoRecorder } from '@/src/components/video/VideoRecorder';
import { VideoImporter } from '@/src/components/video/VideoImporter';
import { VideoPreview } from '@/src/components/video/VideoPreview';
import { useVideoCapture } from '@/src/hooks/useVideoCapture';
import { useSessionStore } from '@/src/stores/sessionStore';

export default function CaptureFrontScreen() {
  const router = useRouter();
  const { draft, setVideo } = useSessionStore();
  const isImportMode = draft.captureMode === 'import';

  const {
    cameraRef,
    permission,
    isRecording,
    recordedVideo,
    recordingDuration,
    startRecording,
    stopRecording,
    pickVideo,
    resetVideo,
  } = useVideoCapture('front');

  const handleUseVideo = () => {
    if (recordedVideo) {
      setVideo('front', recordedVideo);
      router.push('/session/instructions-back');
    }
  };

  if (recordedVideo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContent}>
          <VideoPreview uri={recordedVideo.uri} height={400} />
          <View style={styles.previewControls}>
            <Button
              title={Strings.session.useVideo}
              onPress={handleUseVideo}
              fullWidth
            />
            <Button
              title={Strings.session.retake}
              variant="outline"
              onPress={resetVideo}
              fullWidth
              style={styles.retakeButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isImportMode ? (
        <VideoImporter
          onPickVideo={pickVideo}
          angleLabel={Strings.session.instructionsFrontTitle}
        />
      ) : (
        <VideoRecorder
          cameraRef={cameraRef}
          isRecording={isRecording}
          duration={recordingDuration}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          hasPermission={permission?.granted ?? false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  previewControls: {
    marginTop: Spacing.lg,
  },
  retakeButton: {
    marginTop: Spacing.sm,
  },
});
