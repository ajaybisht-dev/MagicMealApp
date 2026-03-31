import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SplashScreen from '../screens/SplashScreen'
import AuthNavigation from './AuthNavigation/AuthNavigation'
import AppNavigation from './AppNavigation/AppNavigation'
import { useSelector } from 'react-redux'
import { RootState } from '../store/rootReducer'

export type RootStackParamList = {
  SplashScreen: undefined,
  AuthNavigation: undefined,
  AppNavigation: undefined,
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const MainNavigation: React.FC = () => {
  
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
      />
      <Stack.Screen
        name="AuthNavigation"
        component={AuthNavigation}
      />
      <Stack.Screen
        name="AppNavigation"
        component={AppNavigation}
      />
    </Stack.Navigator>
  )
}

export default MainNavigation