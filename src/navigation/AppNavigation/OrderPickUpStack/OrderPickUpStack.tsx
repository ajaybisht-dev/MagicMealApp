import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../../../screens/AppScreens/HomeScreen'
import MealsCategoryScreen from '../../../screens/AppScreens/MealsCategoryScreen'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/rootReducer'
import PickupConfirmationScreen from '../../../screens/AppScreens/PickupConfirmationScreen'
import AllReviews from '../../../screens/AppScreens/CommonScreen/AllReviews'
import OrderConfirmationScreen from '../../../screens/AppScreens/OrderConfirmationScreen'

export type PickStackParamList = {
    OrderConfirmationScreen: { orderID: string | number };
    PickupConfirmationScreen: { orderId: string | null, serviceProviderId: string | null, totalAmount: string | number, orderNumber: string | number, savedAmount: string | number, routeId: number, transactionID: string | null };
    AllReviews: {
        serviceProviderId: string | null;
        serviceProviderName?: string;
        latitude?: number;
        longitude?: number;
        serviceProviderAddress?: string;
        collectionFromTime?: string;
        collectionToTime?: string;
        timeFromAMPM?: string;
        timeToAMPM?: string;
        distance : any
    };
    DrawerNavigation: undefined
}

const Stack = createNativeStackNavigator<PickStackParamList>()

const OrderPickUpStack: React.FC = () => {
    const languageData = useSelector((state: RootState) => state.languageSlice?.selected_language);
    return (
        <Stack.Navigator
            initialRouteName="OrderConfirmationScreen"
            screenOptions={{
                headerShown: false,
                animation:
                    languageData === "ar"
                        ? "slide_from_left"
                        : "slide_from_right",
            }}>
            <Stack.Screen
                name="OrderConfirmationScreen"
                component={OrderConfirmationScreen}
            />
            <Stack.Screen
                name="PickupConfirmationScreen"
                component={PickupConfirmationScreen}
            />
            <Stack.Screen
                name="AllReviews"
                component={AllReviews}
            />
        </Stack.Navigator>
    )
}

export default OrderPickUpStack