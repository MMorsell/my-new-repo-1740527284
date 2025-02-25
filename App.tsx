import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, TouchableOpacity, Platform, Image, ViewStyle, TextStyle } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

type ViewName = 'main' | 'instructions' | 'camera';
type PlatformType = 'ios' | 'android';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

export default function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<ViewName>('main');
  const [platform, setPlatform] = useState<PlatformType>('ios');
  const [image, setImage] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';
  const photoButtonText = isWeb ? 'Upload Photo' : 'Take Photo';

  const openCamera = async (): Promise<void> => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        alert('Camera permission is required');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setCurrentView('camera');
      }
    } catch (error) {
      console.error(error);
      alert('Error accessing camera');
    }
  };

  const renderButton = ({ text, onPress, style }: ButtonProps): JSX.Element => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );

  const views: Record<ViewName, JSX.Element> = {
    main: (
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Natively!</Text>
        {renderButton({ text: 'View Instructions', onPress: () => setCurrentView('instructions') })}
        {renderButton({ text: photoButtonText, onPress: openCamera, style: styles.cameraButton })}
        <View style={styles.section}>
          <Text style={styles.heading}>About This App</Text>
          <Text style={styles.text}>Click the View Instructions button above to see instructions for your platform.</Text>
        </View>
      </View>
    ),
    instructions: (
      <View style={styles.content}>
        <Text style={styles.title}>{platform === 'ios' ? 'iOS' : 'Android'} Instructions</Text>
        <View style={styles.section}>
          {platform === 'ios' ? (
            <>
              <Text style={styles.text}>1. Open your iPhone's camera</Text>
              <Text style={styles.text}>2. Scan the QR code</Text>
            </>
          ) : (
            <>
              <Text style={styles.text}>1. Download Expo Go from the Play Store</Text>
              <Text style={styles.text}>2. Open Expo Go on your device</Text>
              <Text style={styles.text}>3. Tap "Scan QR Code" in Expo Go</Text>
              <Text style={styles.text}>4. Scan the QR code</Text>
            </>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {renderButton({
            text: `Switch to ${platform === 'ios' ? 'Android' : 'iOS'}`,
            onPress: () => setPlatform(p => p === 'ios' ? 'android' : 'ios'),
            style: styles.platformButton
          })}
          {renderButton({
            text: 'Back to Main',
            onPress: () => setCurrentView('main'),
            style: styles.backButton
          })}
        </View>
      </View>
    ),
    camera: (
      <View style={styles.cameraContainer}>
        {image ? (
          <>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <View style={styles.cameraControls}>
              {renderButton({
                text: 'Back',
                onPress: () => {
                  setCurrentView('main');
                  setImage(null);
                },
                style: [styles.backButton, styles.cameraBackButton]
              })}
              {renderButton({
                text: isWeb ? 'Upload New Photo' : 'Take New Photo',
                onPress: openCamera,
                style: [styles.cameraButton, styles.cameraBackButton]
              })}
            </View>
          </>
        ) : (
          <View style={styles.content}>
            <Text style={styles.text}>No photo taken yet</Text>
            {renderButton({ text: photoButtonText, onPress: openCamera })}
          </View>
        )}
      </View>
    )
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {views[currentView]}
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  title: TextStyle;
  section: ViewStyle;
  heading: TextStyle;
  text: TextStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  platformButton: ViewStyle;
  backButton: ViewStyle;
  spacing: ViewStyle;
  shadow: ViewStyle;
  flexColumn: ViewStyle;
  cameraButton: ViewStyle;
  cameraContainer: ViewStyle;
  previewImage: ViewStyle;
  cameraControls: ViewStyle;
  cameraBackButton: ViewStyle;
  message: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2196F3',
  },
  section: {
    marginBottom: 25,
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Arial',
      android: 'Roboto'
    }),
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  platformButton: {
    backgroundColor: '#4CAF50',
  },
  backButton: {
    backgroundColor: '#666',
  },
  spacing: {
    marginVertical: 20,
    marginHorizontal: 10,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  flexColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  cameraButton: {
    backgroundColor: '#E91E63',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'transparent',
  },
  cameraBackButton: {
    width: '40%',
    marginBottom: 0,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
}); 