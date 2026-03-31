import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../component/CustomDrawer';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import LocationStack from './AppNavigation/LocationStack/LocationStack';
import SavingScreen from '../screens/AppScreens/SavingScreen';
import OrderPickUpStack, { PickStackParamList } from './AppNavigation/OrderPickUpStack/OrderPickUpStack';
import { NavigatorScreenParams } from '@react-navigation/native';
import MyReviews from '../screens/AppScreens/CommonScreen/MyReviews';
import OrdersStack from './AppNavigation/OrdersStack/OrdersStack';
import HelpAndSupportScreen from '../screens/AppScreens/HelpAndSupportScreen';
import NotificationScreen from '../screens/AppScreens/NotificationScreen';
import MeStack from './AppNavigation/ProfileStack/MeStack';
import AboutMagicMeal from '../screens/AppScreens/AboutMagicMeal';

export type DrawerParamList = {
  Home: undefined;
  MealsCategoryScreen: { categoryMealTypeId: string | number, categoryMealTypeName?: string };
  CheckoutScreen: { surpriseBoxID: any, serviceProviderID: any, routeId: number };
  OrderPlaceScreen: { cartId: string | null, payloadData: string | null };
  LocationScreen: { routeId: number };
  PaymentScreen: { cartId: string | null, totalAmount: string | number };
  OrderConfirmationScreen: { orderID: string | number };
  DrawerNavigation: undefined,
  PaymentProcessingScreen: { orderID: string | number, paymentStatus: string | number, gatewayTransactionID: string | number, paidAmount: string | number, remarks: string | null };
  OrdersStack: undefined,
  SavingScreen: undefined,
  MyReviews: undefined,
  PickupConfirmationScreen: { orderId: string | null, serviceProviderId: string | null, totalAmount: string | number, orderNumber: string | number, savedAmount: string | number, routeId: number, transactionID: string | null };
  OrderPickUpStack: NavigatorScreenParams<PickStackParamList>;
  ProfileScreen: undefined,
  HelpAndSupportScreen: undefined,
  NotificationScreen: undefined,
  AboutMagicMeal: undefined,
  AllReviews: {
    serviceProviderId: any;
    serviceProviderName: any;
    latitude: any;
    longitude: any;
    serviceProviderAddress: any;
    collectionFromTime: any;
    collectionToTime: any;
    timeFromAMPM: any;
    timeToAMPM: any;
    distance : any
  };
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigation: React.FC = () => {
  const languageData = useSelector((state: RootState) => state.languageSlice?.selected_language);
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerPosition: languageData === "ar" ? "right" : "left",
        drawerStyle: {
          width: "75%",
          borderTopRightRadius: languageData === "ar" ? 0 : 30,
          borderTopLeftRadius: languageData === "ar" ? 30 : 0,
          overflow: "hidden",
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="Home" component={LocationStack} />
      <Drawer.Screen
        name="OrderPickUpStack"
        component={OrderPickUpStack}
      />
      <Drawer.Screen
        name="OrdersStack"
        component={OrdersStack}
      />
      <Drawer.Screen
        name="SavingScreen"
        component={SavingScreen}
      />
      <Drawer.Screen
        name="MyReviews"
        component={MyReviews}
      />
      <Drawer.Screen
        name="HelpAndSupportScreen"
        component={HelpAndSupportScreen}
      />
      <Drawer.Screen
        name="ProfileScreen"
        component={MeStack}
      />
      <Drawer.Screen
        name="NotificationScreen"
        component={NotificationScreen}
      />
      <Drawer.Screen
        name="AboutMagicMeal"
        component={AboutMagicMeal}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;