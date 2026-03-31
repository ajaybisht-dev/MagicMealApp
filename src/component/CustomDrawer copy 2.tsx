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
import { useIsFocused } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { getVersion } from "react-native-device-info";

import { RootState } from "../store/rootReducer";
import { Icons, Images } from "../theme/AssetsUrl";
import { fontPixel, heightPixel, widthPixel } from "../utils/responsive";
import { FONTS } from "../theme/FontsLink";
import language_data_json from "../JSON/language.json";
import { languageReducer } from "../store/Slices/languageSlice";
import { getUserProfile } from "../../helpers/Services/userProfile";

type SupportedLang = "en" | "ar";

interface UserDetails {
    userID: string;
    firstName: string;
    lastName: string;
    email?: string;
    userRole?: string;
    phoneNumber?: string;
    imageUrl: string
}

type TabName = "Home" | "Orders" | "Savings" | "Me";

const CustomDrawer: React.FC<DrawerContentComponentProps> = ({
    navigation,
}) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const language = useSelector(
        (state: RootState) => state.languageSlice.selected_language
    ) as SupportedLang;

    const [user, setUser] = useState<UserDetails | null>(null);

    const labels = language_data_json[language].drawer_items;

    /* ---------------- USER PROFILE ---------------- */
    useEffect(() => {
        if (isFocused) {
            getUserProfile().then(setUser).catch(() => { });
        }
    }, [isFocused]);

    /* ---------------- TAB NAVIGATION (✅ FIXED) ---------------- */
    const navigateToTab = (tab: TabName) => {
        navigation.closeDrawer();
        navigation.navigate("HomeScreen", {
            screen: "TabNavigation",
            params: { screen: tab },
        });
    };

    /* ---------------- DRAWER ITEM ---------------- */
    const DrawerItem = (
        icon: any,
        label: string,
        onPress: () => void
    ) => (
        <Pressable style={styles.item} onPress={onPress}>
            <Image source={icon} style={styles.icon} />
            <Text style={styles.text}>{label}</Text>
        </Pressable>
    );

    return (
        <ScrollView style={styles.container}>
            <LinearGradient colors={["#264941", "#264941"]}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Image source={Images.LogoBg} style={styles.bg} />

                    <Pressable
                        style={styles.close}
                        onPress={() => navigation.closeDrawer()}
                    >
                        <Image source={Icons.CrossIcon} style={styles.closeIcon} />
                    </Pressable>

                    <View style={styles.profile}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.welcome}>Hello,</Text>
                            <Text style={styles.name}>
                                {user?.firstName} {user?.lastName}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CONTENT */}
                <View style={styles.content}>
                    {DrawerItem(Icons.DrawerHomeIcon, "Home", () =>
                        navigateToTab("Home")
                    )}
                    {DrawerItem(Icons.DrawerProfileIcon, "My Profile", () =>
                        navigateToTab("Me")
                    )}

                    <Section title="ACTIVITY" />
                    {DrawerItem(Icons.DrawerOrderIcon, "My Orders", () =>
                        navigateToTab("Orders")
                    )}
                    {DrawerItem(Icons.DrawerSavingIcon, "My Savings", () =>
                        navigateToTab("Savings")
                    )}
                    {DrawerItem(Icons.ReviewIcon, "My Reviews", () =>
                        navigation.navigate("MyReviews")
                    )}

                    <Section title="APPLICATION" />
                    {DrawerItem(Icons.InfoIcon, "About Magic Meal", () => { })}
                    {DrawerItem(Icons.RateIcon, "Rate Us", () => { })}

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>© 2025</Text>
                        <Text style={styles.footerText}>
                            {labels.AppVersion}: {getVersion()}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </ScrollView>
    );
};

export default CustomDrawer;

/* ---------------- UI HELPERS ---------------- */

const Section = ({ title }: { title: string }) => (
    <Text style={styles.section}>{title}</Text>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: { height: heightPixel(160), padding: 20 },
    bg: { width: "100%", resizeMode: "cover" },

    close: { position: "absolute", top: 20, right: 20 },
    closeIcon: { width: 16, height: 16, tintColor: "#fff" },

    profile: { flexDirection: "row", alignItems: "center", marginTop: 40 },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    avatarText: { fontSize: 20, fontFamily: FONTS.muliBoldFont },

    welcome: { color: "#fff" },
    name: { color: "#fff", fontSize: 18, fontFamily: FONTS.tenonBoldFont },

    content: { backgroundColor: "#fff", padding: 20 },

    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    icon: { width: widthPixel(24), height: heightPixel(24) },
    text: {
        marginLeft: 12,
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonRegularFont,
        color: "#6B727A",
    },

    section: {
        marginTop: 20,
        marginBottom: 8,
        fontSize: 12,
        color: "#999",
    },

    footer: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: { fontSize: 11, color: "#7E8389" },
});
