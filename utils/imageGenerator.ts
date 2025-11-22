
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const captureAndShareView = async (
  viewRef: any,
  fileName: string = 'RunReady-Schedule.png'
): Promise<void> => {
  try {
    if (!viewRef || !viewRef.current) {
      console.error('View ref is not available');
      Alert.alert('Error', 'Unable to capture schedule. Please try again.');
      return;
    }

    console.log('Capturing view as image...');
    
    // Capture the view as an image
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    console.log('Image captured successfully:', uri);

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Schedule',
        UTI: 'public.png',
      });
      console.log('Image shared successfully');
    } else {
      Alert.alert('Success', 'Schedule image created successfully!');
    }
  } catch (error) {
    console.error('Error capturing and sharing view:', error);
    Alert.alert('Error', 'Failed to create shareable image. Please try again.');
  }
};
