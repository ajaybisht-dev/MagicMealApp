import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/rootReducer';
import TabNavigation from '../../TabNavigation';
import LocationScreen from '../../../screens/AuthScreens/LocationScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HomeStackParamList = {
  HomeWrapper: undefined;
  LocationScreen: undefined;
  TabNavigation: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

// ------------------------------------------------------
// HOME WRAPPER — DECIDE WHICH SCREEN TO LOAD
// ------------------------------------------------------
const HomeWrapper: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const value = await AsyncStorage.getItem("locationData");
        setHasPermission(!!value);
      } catch (error) {
        console.log("AsyncStorage error:", error);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, []);

  // Loader / blank screen
  if (hasPermission === null) return null;

  // Redirect based on permission
  if (hasPermission) {
    return <TabNavigation />;
  } else {
    return <LocationScreen/>;
  }
};

// ------------------------------------------------------
// MAIN STACK
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
          languageData === 'ar' ? 'slide_from_left' : 'slide_from_right',
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