import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet,
    ScrollView,
    ImageBackground,
    Dimensions,
} from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { getVersion } from 'react-native-device-info';
import { Icons, Images } from "../theme/AssetsUrl";
import { getData, removeData } from "../utils/storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/MainTypes";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getUserProfile } from "../../helpers/Services/userProfile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMG_URL } from "../../config";
import { useDispatch, useSelector } from "react-redux";
import { languageReducer } from "../store/Slices/languageSlice";
import { RootState } from "../store/rootReducer";
import language_data_json from "../JSON/language.json";
import { setLogoutData } from "../store/Slices/logoutSlice";
import { fontPixel, heightPixel, widthPixel } from "../utils/responsive";
import LinearGradient from "react-native-linear-gradient";
import { FONTS } from "../theme/FontsLink";

interface UserDetails {
    userID: string;
    firstName: string;
    lastName: string;
    email?: string;
    userRole?: string;
    phoneNumber?: string;
    imageUrl: string
}

type DrawerItems = {

    PaymentMethods: string;
    Notifications: string;
    Language: string;
    Activity: string;
    MyOrders: string;
    MySavings: string;
    MyReviews: string;
    Support: string;
    "Help&Support": string;
    "Terms&Conditions": string;
    PrivacyPolicy: string;
    AboutMagicMeal: string;
    AppSettings: string;
    AppVersion: string;
    RateUs: string;
    ShareApp: string;
    Logout: string;
};

type LanguageMap = {
    en: { drawer_items: DrawerItems };
    ar: { drawer_items: DrawerItems };
};

type SupportedLang = keyof LanguageMap;

const language_data = language_data_json as LanguageMap;

const { height: windowHeight } = Dimensions.get("window");

const CustomDrawer: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
    const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const languageSelector = useSelector((state: RootState) => state?.languageSlice?.selected_language);


    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");

    const isFocused = useIsFocused();
    const dispatch = useDispatch();

    const drawerLabels = language_data[selectedLanguage].drawer_items;

    useEffect(() => {
        if (languageSelector === "en" || languageSelector === "ar") {
            setSelectedLanguage(languageSelector);
        }
    }, [languageSelector]);


    useEffect(() => {
        if (isFocused) {
            //   fetchUserData();
            getUserProfileFunction();
        }
    }, [isFocused]);

    const fetchUserData = async () => {
        const userData = await getData("userData");
        setUserDetails(userData);
    };

    const getUserProfileFunction = async () => {
        await getUserProfile().then(async (response) => {
            if (response) {
                await AsyncStorage.setItem("userProfileData", JSON.stringify(response));
                setUserDetails(response);
            }
        })
    }

    const navigateToTab = (tabName: string) => {
        navigation.closeDrawer();
        const tabRoute = navigation.getState().routes.find(r => r.name === "HomeScreen");
        if (tabRoute) {
            navigation.navigate({
                key: tabRoute.key,
                name: "HomeScreen",
                params: { screen: tabName },
            } as never);
        }
    };

    const handleImageData = (image_url: any) => {
        if (!image_url) return Icons.DummyImageIcon;
        const normalizedPath = image_url.replace(/\\/g, "/");
        return { uri: IMG_URL + normalizedPath };
    };

    const getInitials = (firstName?: string, lastName?: string): string => {
        const first = firstName?.trim() || "";
        const last = lastName?.trim() || "";

        if (first && last) {
            return `${first.charAt(0).toUpperCase()}${last.charAt(0).toUpperCase()}`;
        } else if (first) {
            return `${first.charAt(0).toUpperCase()}${first.charAt(1)?.toUpperCase() || ""}`;
        } else {
            return "";
        }
    };

    const handleLanguageSelection = (item: any) => {
        setSelectedLanguage(item);
        dispatch(languageReducer(item))
    }

    const DrawerItemsFunction = (icon: any, title: any, navigatePath: any) => {
        return (
            <Pressable
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: "#7E8389",
                }}
                onPress={() => {
                    if (navigatePath) {
                        navigation.navigate(navigatePath);
                    }
                }}
            >
                <Image
                    source={icon}
                    style={{ width: widthPixel(26), height: heightPixel(26) }}
                    // tintColor={"#6B727A"}
                    resizeMode="contain"
                />
                <Text style={{ marginLeft: 10, fontSize: fontPixel(16), fontFamily: FONTS.tenonRegularFont, color: "#6B727A" }}>{title}</Text>
            </Pressable>
        )
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient colors={['#264941', '#264941']} style={{ flex: 1 }}>
                <View>
                    <Image source={Images.LogoBg} style={{ width: "auto", height: heightPixel(450) }} resizeMode="contain" tintColor={"#23302A"} />
                    <View style={{ paddingHorizontal: 20, position : "absolute", width : "100%", paddingTop : 15 }}>
                        <View style={[styles.header, selectedLanguage == "ar" && { alignItems: "flex-start" }]}>
                            <Pressable onPress={() => navigation.closeDrawer()}>
                                <Image
                                    source={Icons.CloseIcon}
                                    style={{ height: 15, width: 15 }}
                                    resizeMode="contain"
                                    tintColor={"#fff"}
                                />
                            </Pressable>
                        </View>

                        <View style={[styles.profileSection, selectedLanguage == "ar" && { flexDirection: "row-reverse", alignItems: "flex-end" }]}>
                            <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
                                {/* <Image
                            source={userDetails?.imageUrl ? handleImageData(userDetails?.imageUrl) : Icons.DummyImageIcon}
                            style={styles.profileImage}
                            resizeMode="contain"
                        /> */}
                                <Text style={styles.nameText}>
                                    {getInitials(userDetails?.firstName, userDetails?.lastName)}
                                </Text>
                            </View>
                            <View style={selectedLanguage == "ar" && { alignItems: "flex-end", marginRight: 12 }}>
                                <Text style={styles.email}>{"Hello,"}</Text>
                                <Text style={styles.name}>{userDetails?.firstName} {userDetails?.lastName ? userDetails?.lastName : ""}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ position: "absolute", width: "100%", bottom: 0, height: heightPixel(500) }}>
                    <View style={{ backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 10, flex: 1, zIndex: 99 }}>
                        {DrawerItemsFunction(Icons.DrawerHomeIcon, "Home", "HomeScreen")}
                        {DrawerItemsFunction(Icons.DrawerProfileIcon, "My Profile", "ProfileScreen")}
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ color: "#B9B9B9", fontSize: fontPixel(12), fontFamily: FONTS.tenonMediumFont }}>ACTIVITY</Text>
                        </View>
                        {DrawerItemsFunction(Icons.DrawerOrderIcon, "My Orders", "OrdersScreen")}
                        {DrawerItemsFunction(Icons.DrawerSavingIcon, "My Savings", "SavingScreen")}
                        {DrawerItemsFunction(Icons.ReviewIcon, "My Reviews", null)}
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ color: "#B9B9B9", fontSize: fontPixel(12), fontFamily: FONTS.tenonMediumFont }}>USEFUL LINKS</Text>
                        </View>
                        {DrawerItemsFunction(Icons.SupportIcon, "Help & Support", null)}
                        {DrawerItemsFunction(Icons.NotificationIcon, "Notification Settings", null)}
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ color: "#B9B9B9", fontSize: fontPixel(12), fontFamily: FONTS.tenonMediumFont }}>APPLICATION</Text>
                        </View>
                        {DrawerItemsFunction(Icons.InfoIcon, "About Magic Meal", null)}
                        {DrawerItemsFunction(Icons.ShareIcon, "Share Application", null)}
                        {DrawerItemsFunction(Icons.RateIcon, "Rate Us", null)}
                        {/* <Pressable
                            style={styles.logoutButton}
                            onPress={async () => {
                                dispatch(setLogoutData("Logout Successfully"))
                                await removeData("userData");
                                await removeData("user_id");
                                await AsyncStorage.removeItem("userProfileData");
                                dispatch({ type: "UserData/logout" });
                                navigation.closeDrawer();
                                setTimeout(() => {
                                    rootNavigation.replace("AuthNavigation")
                                }, 600);
                            }}
                        >
                            <Text style={styles.logoutText}>{drawerLabels?.Logout}</Text>
                        </Pressable> */}
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", paddingHorizontal: 10, position : "absolute", bottom : 0 }}>
                            <Text style={{ color: "#7E8389", fontFamily: FONTS.tenonRegularFont, fontSize: fontPixel(11) }}>Copyright 2025</Text>
                            <Text style={{ color: "#7E8389", fontFamily: FONTS.tenonRegularFont, fontSize: fontPixel(11) }}>{`${getVersion() && `${drawerLabels?.AppVersion}: ${getVersion()}`}`}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
            <View style={{ backgroundColor: "#fff", flex: 1 }} />
        </ScrollView>
    );
};

const DrawerItem = ({
    label,
    rightText,
    onPress,
}: {
    label: string;
    rightText?: string;
    onPress?: () => void;
}) => (
    <Pressable style={styles.drawerItem} onPress={onPress}>
        <Text style={styles.drawerLabel}>{label}</Text>
        {rightText && <Text style={styles.drawerRightText}>{rightText}</Text>}
    </Pressable>
);

/* 🔹 Drawer Section Header with Lines */
const DrawerSection = ({ title }: { title: string }) => (
    <View style={styles.section}>
        <View style={styles.lineContainer}>
            <View style={styles.line} />
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.line} />
        </View>
    </View>
);

export default CustomDrawer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        // paddingTop: 20,
        // paddingHorizontal: 20,
    },
    header: {
        alignItems: "flex-end",
        marginBottom: 10,
    },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
        position: "relative",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#fff",
        marginRight: 15,
        overflow: "hidden"
    },
    name: {
        fontSize: fontPixel(18),
        color: "#FFFFFF",
        fontFamily: FONTS.tenonMediumFont
    },
    email: {
        fontSize: fontPixel(18),
        color: "#FFFFFF",
        marginTop: 2,
        fontFamily: FONTS.tenonBoldFont
    },
    phone: {
        fontSize: 13,
        color: "#555",
        marginTop: 1,
    },
    editIcon: {
        alignSelf: "flex-end",
    },
    section: {
        marginTop: 8,
        marginBottom: 10,
    },
    lineContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#ccc",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginHorizontal: 8,
    },
    drawerItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    drawerLabel: {
        fontSize: 14,
        color: "#444",
    },
    drawerRightText: {
        fontSize: 14,
        color: "#444",
    },
    logoutButton: {
        marginTop: 15,
    },
    logoutText: {
        fontSize: 14,
        color: "#d00",
        fontWeight: "600",
    },
    profileImage: {
        width: 60,
        height: 60,
    },
    nameText: {
        fontSize: fontPixel(20),
        fontFamily: FONTS.muliBoldFont
    }
});