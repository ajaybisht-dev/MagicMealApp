import { NavigationContainer } from '@react-navigation/native';
import {
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MainNavigation from './src/navigation/MainNavigation';
import { useEffect } from 'react';
import { onMessage, getMessaging } from '@react-native-firebase/messaging';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // createChannelFunction();
    const unsubscribe = onMessage(getMessaging(), async remoteMessage => {
      console.log('remoteMessage', remoteMessage);

      // await notifee.displayNotification({
      //   title: remoteMessage.notification.title,
      //   body: remoteMessage.notification.body,
      //   android: { channelId: 'default', smallIcon: 'ic_launcher' },
      // });
    });

    return unsubscribe;
  }, []);

  // async function createChannelFunction() {
  //   if (Platform.Version >= 33) {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       await notifee.createChannel({
  //         id: 'default',
  //         name: 'Default Channel',
  //         importance: AndroidImportance.HIGH,
  //       });
  //     }
  //   }
  // }

  return (
    <SafeAreaProvider>
      {/* 1. Android Status Bar Control */}
      <StatusBar barStyle="light-content" backgroundColor="#264941" />

      {/* 2. Top "Color Filler" for iOS Notch */}
      <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: '#264941' }} />

      {/* 3. Main Content Area */}
      <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <NavigationContainer>
          <MainNavigation />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
