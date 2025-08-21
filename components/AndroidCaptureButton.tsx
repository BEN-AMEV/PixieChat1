// CameraCaptureButton.tsx
import React from 'react';
import { Alert, Button, Image, StyleSheet, View } from 'react-native';
import { CameraOptions, ImagePickerResponse, launchCamera } from 'react-native-image-picker';

const CameraCaptureButton: React.FC = () => {
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);

  const handleCameraLaunch = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Unknown error');
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setPhotoUri(asset.uri || null);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Capture Photo" onPress={handleCameraLaunch} />
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.imagePreview} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    resizeMode: 'cover',
  },
});

export default CameraCaptureButton;
