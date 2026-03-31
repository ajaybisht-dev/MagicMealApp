import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigation from "../DrawerNavigation";
import CheckoutScreen from "../../screens/AppScreens/CheckoutScreen";
import LocationScreen from "../../screens/AuthScreens/LocationScreen";
import OrderDetailScreen from "../../screens/AppScreens/OrderDetailScreen";
import OrderPlaceScreen from "../../screens/AppScreens/OrderPlaceScreen";
import PaymentScreen from "../../screens/AppScreens/PaymentScreen";
import PaymentProcessingScreen from "../../screens/AppScreens/PaymentProcessingScreen";
import OrderConfirmationScreen from "../../screens/AppScreens/OrderConfirmationScreen";
import ProfileScreen from "../../screens/AppScreens/ProfileScreen";
import { useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import AllReviews from "../../screens/AppScreens/CommonScreen/AllReviews";
import MyReviews from "../../screens/AppScreens/CommonScreen/MyReviews";
import MeStack from "./ProfileStack/MeStack";

export type RootStackParamList = {
  DrawerNavigation: undefined;
  CheckoutScreen: {
    surpriseBoxID: string | number;
    serviceProviderID: string | number;
  };
  LocationScreen: { routeId: number };
  OrderDetailScreen: undefined;
  OrderPlaceScreen: { cartId: string | null; payloadData: string | null };
  PaymentScreen: { cartId: string | null; totalAmount: string | number };
  PaymentProcessingScreen: {
    orderID: string | number;
    paymentStatus: string | number;
    gatewayTransactionID: string | number;
    paidAmount: string | number;
    remarks: string | null;
  };
  ProfileScreen: undefined;
  AllReviews: {
    serviceProviderId: string | number;
    serviceProviderName: string | null;
    latitude: number;
    longitude: number;
    serviceProviderAddress: string;
    collectionFromTime: string;
    collectionToTime: string;
    timeFromAMPM: "AM" | "PM";
    timeToAMPM: "AM" | "PM";
    distance : any
  };
  MyReviews: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation: React.FC = () => {
  const languageData = useSelector(
    (state: RootState) => state.languageSlice?.selected_language
  );
  return (
    <Stack.Navigator
      initialRouteName="DrawerNavigation"
      screenOptions={{
        headerShown: false,
        animation:
          languageData === "ar" ? "slide_from_left" : "slide_from_right",
      }}
    >
      <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="AllReviews" component={AllReviews} />
      <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
      <Stack.Screen name="LocationScreen" component={LocationScreen} />
      <Stack.Screen name="OrderPlaceScreen" component={OrderPlaceScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen
        name="PaymentProcessingScreen"
        component={PaymentProcessingScreen}
      />
      <Stack.Screen name="ProfileScreen" component={MeStack} />
      <Stack.Screen name="MyReviews" component={MyReviews} />
    </Stack.Navigator>
  );
};

export default AppNavigation;
