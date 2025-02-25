import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
  withRepeat,
  withTiming 
} from 'react-native-reanimated';

export default function VideoRecorder() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const [duration, setDuration] = useState(0);
  const cameraRef = useRef<Camera>(null);
  const recordingAnimation = useSharedValue(1);
  
  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRecording(true);
    recordingAnimation.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
        quality: '1080p',
      });
      console.log('Video recorded:', video);
    } catch (error) {
      console.error('Failed to record:', error);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsRecording(false);
    recordingAnimation.value = withSpring(1);
    setDuration(0);
    
    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const toggleCameraType = () => {
    setType(current => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
    Haptics.selectionAsync();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingAnimation.value }],
  }));

  if (!permission) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
      >
        <BlurView intensity={20} style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
          </TouchableOpacity>

          <Animated.View style={[styles.recordButtonContainer, animatedStyle]}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordingButton
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording && (
                <View style={styles.stopIcon} />
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.spacer} />
        </BlurView>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    width: '100%',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  spacer: {
    width: 44,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    margin: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});