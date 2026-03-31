import React from 'react'
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from '../../screens/AuthScreens/LoginScreen';
import RegistrationScreen from '../../screens/AuthScreens/RegistrationScreen';
import OtpScreen from '../../screens/AuthScreens/OtpScreen';
import ForgotPassword from '../../screens/AuthScreens/ForgotPassword';
import CreatePassword from '../../screens/AuthScreens/CreatePassword';

export type RootStackParamList = {
  LoginScreen: undefined,
  RegistrationScreen: undefined,
  OtpScreen: undefined,
  ForgotPassword: undefined,
  CreatePassword: { email: string; otp: string[] };
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const AuthNavigation: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
      />
      <Stack.Screen
        name="RegistrationScreen"
        component={RegistrationScreen}
      />
      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
      />
      <Stack.Screen
        name="CreatePassword"
        component={CreatePassword}
      />
    </Stack.Navigator>
  )
}

export default AuthNavigation