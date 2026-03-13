import { useState, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { VideoData, VideoAngle } from '@/src/types/video';
import { Strings } from '@/src/constants/strings.fr';

export function useVideoCapture(angle: VideoAngle) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<VideoData | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ensurePermissions = useCallback(async (): Promise<boolean> => {
    if (permission?.granted) return true;

    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        Strings.common.error,
        Strings.permissions.cameraRequired,
        [{ text: Strings.common.ok }]
      );
      return false;
    }
    return true;
  }, [permission, requestPermission]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    const hasPermission = await ensurePermissions();
    if (!hasPermission) return;

    setIsRecording(true);
    setRecordingDuration(0);

    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 30,
      });
      if (video) {
        setRecordedVideo({
          uri: video.uri,
          localUri: video.uri,
          duration: recordingDuration,
          source: 'camera',
          angle,
        });
      }
    } catch (err) {
      console.error('Recording error:', err);
    } finally {
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [angle, ensurePermissions, recordingDuration]);

  const stopRecording = useCallback(() => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isRecording]);

  const pickVideo = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        Strings.common.error,
        Strings.permissions.galleryRequired,
        [{ text: Strings.common.ok }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setRecordedVideo({
        uri: asset.uri,
        localUri: asset.uri,
        duration: (asset.duration ?? 0) / 1000,
        source: 'import',
        angle,
      });
    }
  }, [angle]);

  const resetVideo = useCallback(() => {
    setRecordedVideo(null);
    setRecordingDuration(0);
  }, []);

  return {
    cameraRef,
    permission,
    isRecording,
    recordedVideo,
    recordingDuration,
    startRecording,
    stopRecording,
    pickVideo,
    resetVideo,
    ensurePermissions,
  };
}
