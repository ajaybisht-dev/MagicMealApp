import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    Pressable,
    Platform,
    ImageSourcePropType,
} from 'react-native';
import { DefaultStyle } from '../theme/styles/DefaultStyle';
import { Icons } from '../theme/AssetsUrl';
import { NavigationHelpers } from '@react-navigation/native';
import {
    BottomTabBarProps,
    BottomTabNavigationEventMap,
} from '@react-navigation/bottom-tabs';
import { fontPixel, heightPixel, widthPixel } from '../utils/responsive';
import { FONTS } from '../theme/FontsLink';

const { width: windowWidth } = Dimensions.get('window');

interface CustomTabComponentProps extends BottomTabBarProps {
    navigation: NavigationHelpers<Record<string, object | undefined>, BottomTabNavigationEventMap>;
}

const CustomBottomTabComponent: React.FC<CustomTabComponentProps> = ({
    state,
    descriptors,
    navigation,
}) => {
    const [tabIndex, setTabIndex] = useState(state.index);

    const hideTabsFor = ["Me"];  
    const activeRoute = state.routes[state.index].name;

    if (hideTabsFor.includes(activeRoute)) {
        return null;
    }

    const handleTabBarIcon = (routeName: string): ImageSourcePropType => {        
        switch (routeName) {
            case 'Home':
                return Icons.HomeIcon;
            case 'Orders':
                return Icons.OrdersIcon;
            case 'Savings':
                return Icons.SavingsIcon;
            case 'Me':
                return Icons.ProfileIcon;
            default:
                return Icons.DummyImageIcon;
        }
    };

    return (
        <View style={styles.floatingWrapper}>
            <View style={styles.container}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const { options } = descriptors[route.key];

                    const onPress = () => {
                        setTabIndex(index);
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name as never);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            style={[styles.tab, isFocused ? styles.iconCircleActive : styles.iconNotCircleActive]}
                        >
                            <Image
                                source={handleTabBarIcon(route.name)}
                                style={[
                                    { height: 22, width: 22 },
                                    { tintColor: isFocused ? "#264941" : "#fff" }
                                ]}
                                resizeMode="contain"
                            />
                            <Text
                                style={[
                                    styles.label,
                                    { opacity: isFocused ? 1 : 0.6, color: isFocused ? "#264941" : "#fff" }
                                ]}
                            >
                                {options.tabBarLabel !== undefined
                                    ? (options.tabBarLabel as string)
                                    : route.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingWrapper: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        alignItems: "center",
    },

    container: {
        flexDirection: 'row',
        backgroundColor: '#264941',
        borderRadius: 50,
        padding : 6,
        width: "75%",
        justifyContent: "space-between",
    },

    tab: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconCircleActive: {
        backgroundColor: "#fff",
        height: 50,
        width: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },

    iconNotCircleActive: {
        backgroundColor: "transparent",
        height: 50,
        width: 50,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },

    label: {
        color: "#264941",
        fontSize: 10,
        fontFamily: FONTS.muliSemiBoldFont,
    },
});

export default CustomBottomTabComponent;