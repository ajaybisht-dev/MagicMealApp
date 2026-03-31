import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState } from '../../../store/rootReducer';
import TabNavigation from '../../TabNavigation';
import LocationScreen from '../../../screens/AuthScreens/LocationScreen';

export type HomeStackParamList = {
  HomeWrapper: undefined;
  LocationScreen: undefined;
  TabNavigation: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

// ------------------------------------------------------
// ✅ HOME WRAPPER — NAVIGATION-BASED REDIRECT (CORRECT)
// ------------------------------------------------------
const HomeWrapper: React.FC<any> = ({ navigation }) => {
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const value = await AsyncStorage.getItem('locationData');

        if (value) {
          // ✅ User already allowed location → go to Tabs
          navigation.replace('TabNavigation');
        } else {
          // ✅ Ask for location permission
          navigation.replace('LocationScreen');
        }
      } catch (error) {
        // ✅ Fallback safety
        navigation.replace('LocationScreen');
      }
    };

    checkPermission();
  }, [navigation]);

  // ✅ Important: render NOTHING here
  return null;
};

// ------------------------------------------------------
// ✅ LOCATION STACK
// ------------------------------------------------------
const LocationStack: React.FC = () => {
  const languageData = useSelector(
    (state: RootState) => state.languageSlice?.selected_language
  );

  return (
    <Stack.Navigator
      initialRouteName="HomeWrapper"
      screenOptions={{
        headerShown: false,
        animation:
          languageData === 'ar'
            ? 'slide_from_left'
            : 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="HomeWrapper"
        component={HomeWrapper}
      />

      <Stack.Screen
        name="LocationScreen"
        component={LocationScreen}
      />

      <Stack.Screen
        name="TabNavigation"
        component={TabNavigation}
      />
    </Stack.Navigator>
  );
};

export default LocationStack;