// MeStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../../screens/AppScreens/ProfileScreen";

// Define stack params for type safety
export type MeStackParamList = {
  ProfileScreen: undefined;
};

const Stack = createNativeStackNavigator<MeStackParamList>();

const MeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MeStack;
