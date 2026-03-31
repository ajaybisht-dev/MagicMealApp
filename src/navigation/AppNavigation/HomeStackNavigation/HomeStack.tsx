// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { useSelector } from "react-redux";
// import { RootState } from "../Store/rootReducer";

// import LocationWithRestaurants from "../screens/LocationWithRestaurants";
// import RestaurantDetails from "../screens/RestaurantDetails";
// import ProfileScreen from "../screens/ProfileScreen";

// export type RootStackParamList = {
//   Location: undefined;
//   RestaurantDetails: undefined;
//   ProfileScreen: undefined;
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();

// const AppNavigation: React.FC = () => {
//   const languageData = useSelector((state: RootState) => state.languageSlice?.selected_language);

//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: true,
//         animation:
//           languageData === "ar"
//             ? "slide_from_left"
//             : "slide_from_right",
//       }}
//       initialRouteName="RestaurantDetails"
//     >
//       <Stack.Screen
//         name="Location"
//         component={LocationWithRestaurants}
//         options={{ title: "Nearby Restaurants" }}
//       />
//       <Stack.Screen
//         name="RestaurantDetails"
//         component={RestaurantDetails}
//         options={{ title: "Restaurant Details" }}
//       />
//       <Stack.Screen
//         name="ProfileScreen"
//         component={ProfileScreen}
//         options={{ title: "Profile" }}
//       />
//     </Stack.Navigator>
//   );
// };

// export default AppNavigation;

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../../../screens/AppScreens/HomeScreen'
import MealsCategoryScreen from '../../../screens/AppScreens/MealsCategoryScreen'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/rootReducer'

export type HomeStackParamList = {
    HomeScreen: undefined
    MealsCategoryScreen: { categoryMealTypeId: string | number, categoryMealTypeName?: string };
}

const Stack = createNativeStackNavigator<HomeStackParamList>()

const HomeStack: React.FC = () => {
    const languageData = useSelector((state: RootState) => state.languageSlice?.selected_language);
    return (
        <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
                headerShown: false,
                animation:
                    languageData === "ar"
                        ? "slide_from_left"
                        : "slide_from_right",
            }}>
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
            />
            <Stack.Screen
                name="MealsCategoryScreen"
                component={MealsCategoryScreen}
            />
        </Stack.Navigator>
    )
}

export default HomeStack