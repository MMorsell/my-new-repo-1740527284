import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  useSharedValue,
  withTiming 
} from 'react-native-reanimated';

const FOCUS_MODES = {
  DEEP_WORK: { name: 'Deep Work', icon: 'brain', color: '#2C3E50' },
  LIGHT_STUDY: { name: 'Light Study', icon: 'book-open-variant', color: '#7FB069' },
  CREATIVE_FLOW: { name: 'Creative Flow', icon: 'palette', color: '#E67E22' },
};

const TIME_PRESETS = [
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedMode, setSelectedMode] = useState(FOCUS_MODES.DEEP_WORK);
  const pulseAnim = useSharedValue(1);

  const startTimer = useCallback((minutes: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeLeft(minutes * 60);
    setIsRunning(true);
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const stopTimer = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsRunning(false);
    pulseAnim.value = withSpring(1);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.modeSelector}>
        {Object.values(FOCUS_MODES).map((mode) => (
          <TouchableOpacity
            key={mode.name}
            style={[
              styles.modeButton,
              selectedMode.name === mode.name && { backgroundColor: mode.color },
            ]}
            onPress={() => {
              setSelectedMode(mode);
              Haptics.selectionAsync();
            }}
          >
            <MaterialCommunityIcons
              name={mode.icon as any}
              size={24}
              color={selectedMode.name === mode.name ? '#FFF' : '#2C3E50'}
            />
            <Text style={[
              styles.modeText,
              selectedMode.name === mode.name && { color: '#FFF' }
            ]}>
              {mode.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[styles.timerContainer, animatedStyle]}>
        <BlurView intensity={20} style={styles.timerBlur}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </BlurView>
      </Animated.View>

      <View style={styles.presetContainer}>
        {!isRunning && TIME_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            style={styles.presetButton}
            onPress={() => startTimer(preset.minutes)}
          >
            <Text style={styles.presetText}>{preset.label}</Text>
          </TouchableOpacity>
        ))}
        {isRunning && (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopTimer}
          >
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 50,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  modeButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: Dimensions.get('window').width / 3.5,
  },
  modeText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  timerContainer: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
    borderRadius: Dimensions.get('window').width * 0.4,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  timerBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#2C3E50',
    fontVariant: ['tabular-nums'],
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
  },
  presetButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: '#2C3E50',
    minWidth: 100,
    alignItems: 'center',
  },
  presetText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
    minWidth: 100,
    alignItems: 'center',
  },
  stopText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});