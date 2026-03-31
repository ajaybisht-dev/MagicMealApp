import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/rootReducer'
import PickupConfirmationScreen from '../../../screens/AppScreens/PickupConfirmationScreen'
import OrdersScreen from '../../../screens/AppScreens/OrdersScreen'
import OrderCompleted from '../../../screens/AppScreens/CommonScreen/OrderCompleted'

export type PickStackParamList = {
    OrdersScreen: { fromTabPress?: boolean } | undefined;
    OrderCompleted: { orderID: string | null };
    PickupConfirmationScreen: { orderId: string | null, serviceProviderId: string | null, totalAmount: string | number, orderNumber: string | number, savedAmount: string | number, fromTabPress?: boolean, routeId : number, transactionID: string | null};
}

const Stack = createNativeStackNavigator<PickStackParamList>()

const OrdersStack: React.FC = () => {
    const languageData = useSelector((state: RootState) => state.languageSlice?.selected_language);
    return (
        <Stack.Navigator
            initialRouteName="OrdersScreen"
            screenOptions={{
                headerShown: false,
                animation:
                    languageData === "ar"
                        ? "slide_from_left"
                        : "slide_from_right",
            }}>
            <Stack.Screen
                name="OrdersScreen"
                component={OrdersScreen}
            />
            <Stack.Screen
                name="PickupConfirmationScreen"
                component={PickupConfirmationScreen}
            />
            <Stack.Screen
                name="OrderCompleted"
                component={OrderCompleted}
            />
        </Stack.Navigator>
    )
}

export default OrdersStack