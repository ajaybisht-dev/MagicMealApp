import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomBottomTab from '../component/CustomBottomTab';
import OrdersScreen from '../screens/AppScreens/OrdersScreen';
import SavingScreen from '../screens/AppScreens/SavingScreen';
import HomeStack from './AppNavigation/HomeStackNavigation/HomeStack';
import ProfileScreen from '../screens/AppScreens/ProfileScreen';
import OrdersStack, { PickStackParamList } from './AppNavigation/OrdersStack/OrdersStack';
import MeStack from './AppNavigation/ProfileStack/MeStack';
import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: { screen?: string } | undefined;
  Orders: NavigatorScreenParams<PickStackParamList>;
  Savings: undefined;
  Me: undefined
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigation: React.FC = () => {
  const profileTabPressCount = useRef(0);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // profileTabPressCount.current += 1;
            // if (profileTabPressCount.current === 1) {
            //   navigation.navigate('Home', { screen: 'HomeScreen' });
            // }
            navigation.navigate('Home', { screen: 'HomeScreen' });
          },
          blur: () => {
            profileTabPressCount.current = 0;
          },
        })}
      />
      {/* <Tab.Screen name="Orders" component={OrdersStack} /> */}
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();

            navigation.navigate('Orders', {
              screen: 'OrdersScreen',
              params: {
                fromTabPress: true,
              },
            });
          },
        })}
      />
      <Tab.Screen name="Savings" component={SavingScreen} />
      <Tab.Screen name="Me" component={MeStack} />
    </Tab.Navigator>
  );
};

export default TabNavigation;