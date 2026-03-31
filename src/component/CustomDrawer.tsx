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
  Linking,
} from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { getVersion } from "react-native-device-info";
import { Icons, Images } from "../theme/AssetsUrl";
import { getData, removeData } from "../utils/storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/MainTypes";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
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
import { notficationDataReducer, userDataReducer } from "../store/Slices/userProfileSlice";

interface UserDetails {
  userID: string;
  firstName: string;
  lastName: string;
  email?: string;
  userRole?: string;
  phoneNumber?: string;
  imageUrl: string;
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

type TabName = "Home" | "Orders" | "Savings" | "Me";

type LanguageMap = {
  en: { drawer_items: DrawerItems };
  ar: { drawer_items: DrawerItems };
};

type SupportedLang = keyof LanguageMap;

const language_data = language_data_json as LanguageMap;

const { height: windowHeight } = Dimensions.get("window");

const CustomDrawer: React.FC<DrawerContentComponentProps> = ({
  navigation,
}) => {
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const languageSelector = useSelector(
    (state: RootState) => state?.languageSlice?.selected_language
  );

  const userDataSelector = useSelector(
    (state: RootState) => state?.userProfileSlice?.userProfileData
  );



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

  useEffect(() => {
    if (userDataSelector?.firstName) {
      const firstNameOnly = userDataSelector.firstName.trim().split(" ")[0];

      setUserDetails({
        ...userDataSelector,
        firstName: firstNameOnly
      });
    }
  }, [userDataSelector]);


  const fetchUserData = async () => {
    const userData = await getData("userData");
    setUserDetails(userData);
  };

  const getUserProfileFunction = async () => {
    await getUserProfile().then(async (response) => {
      if (response) {
        const obj = {
          isSMSUpdates: response?.isSMSUpdates,
          isEmailUpdates: response?.isEmailUpdates
        };

        dispatch(notficationDataReducer(obj));
        if (response?.firstName) {
          const newData = response.firstName.trim().split(" ");
          response = { ...response, firstName: newData[0] };
        }
        await AsyncStorage.setItem("userProfileData", JSON.stringify(response));
        dispatch(userDataReducer(response));
        setUserDetails(response);
      }

    });
  };

  // const navigateToTab = (tab: TabName) => {
  //     navigation.closeDrawer();
  //     navigation.navigate("HomeScreen", {
  //         screen: "TabNavigation",
  //         params: { screen: tab },
  //     });
  // };

  const navigateToTab = (tab: TabName) => {
    navigation.closeDrawer();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            state: {
              routes: [
                {
                  name: "TabNavigation",
                  state: {
                    routes: [
                      { name: "Home" },
                      { name: "Orders" },
                      { name: "Savings" },
                      { name: "Me" },
                    ],
                    index:
                      tab === "Home"
                        ? 0
                        : tab === "Orders"
                          ? 1
                          : tab === "Savings"
                            ? 2
                            : 3,
                  },
                },
              ],
            },
          },
        ],
      })
    );
  };

  const DrawerItem = (icon: any, label: string, onPress: () => void) => (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
      }}
      onPress={onPress}
    >
      <Image
        source={icon}
        style={{ width: widthPixel(26), height: heightPixel(26) }}
        // tintColor={"#6B727A"}
        resizeMode="contain"
      />
      <Text
        style={{
          marginLeft: 10,
          fontSize: fontPixel(16),
          fontFamily: FONTS.tenonRegularFont,
          color: "#6B727A",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

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
      return `${first.charAt(0).toUpperCase()}${first.charAt(1)?.toUpperCase() || ""
        }`;
    } else {
      return "";
    }
  };

  const handleLanguageSelection = (item: any) => {
    setSelectedLanguage(item);
    dispatch(languageReducer(item));
  };

  const DrawerItemsFunction = (
    icon: any,
    title: string,
    navigatePath: string | (() => void) | null
  ) => {
    return (
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          borderBottomWidth: title !== "Rate Us" ? 1 : 0,
          borderBottomColor: "#E8E8E8",
        }}
        onPress={() => {
          if (typeof navigatePath === "function") {
            navigatePath();
          } else {
            navigation.navigate(navigatePath);
          }
        }}
      >
        <Image
          source={icon}
          style={{ width: widthPixel(26), height: heightPixel(26) }}
          resizeMode="contain"
        />
        <Text
          style={{
            marginLeft: 10,
            fontSize: fontPixel(16),
            fontFamily: FONTS.tenonRegularFont,
            color: "#6B727A",
          }}
        >
          {title}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        <View style={{ height: heightPixel(145) }}>
          <Image
            source={Images.LogoBg}
            style={{ width: "auto" }}
            resizeMode="cover"
            tintColor={"#23302A"}
          />
          <View
            style={{
              paddingHorizontal: 20,
              position: "absolute",
              width: "100%",
              paddingTop: 15,
            }}
          >
            <View
              style={[
                styles.header,
                selectedLanguage == "ar" && { alignItems: "flex-start" },
              ]}
            >
              <Pressable onPress={() => navigation.closeDrawer()} style={{ height: heightPixel(30), width: widthPixel(40), alignItems: "center", justifyContent: "center" }}>
                <Image
                  source={Icons.CrossIcon}
                  style={{ height: heightPixel(20), width: widthPixel(20) }}
                  resizeMode="contain"
                  tintColor={"#FFFFFF"}
                />
              </Pressable>
            </View>

            <View
              style={[
                styles.profileSection,
                selectedLanguage == "ar" && {
                  flexDirection: "row-reverse",
                  alignItems: "flex-end",
                },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { alignItems: "center", justifyContent: "center" },
                ]}
              >
                {
                  userDetails?.imageUrl ?
                    <Image
                      source={userDetails?.imageUrl ? handleImageData(userDetails?.imageUrl) : Icons.DummyImageIcon}
                      style={styles.profileImage}
                      resizeMode="contain"
                    /> :
                    <Text style={styles.nameText}>
                      {getInitials(userDetails?.firstName, userDetails?.lastName)}
                    </Text>
                }
              </View>
              <View
                style={
                  selectedLanguage == "ar" && {
                    alignItems: "flex-end",
                    marginRight: 12,
                  }
                }
              >
                <Text style={styles.email}>{"Hello,"}</Text>
                <Text style={styles.name}>
                  {userDetails && userDetails?.firstName?.length > 15 ? userDetails?.firstName.slice(0, 15) + "..." : userDetails?.firstName}{" "}
                  {/* {userDetails?.lastName ? userDetails?.lastName : ""} */}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ position: "relative", width: "100%", flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              backgroundColor: "#fff",
              paddingHorizontal: 20,
              paddingTop: 10,
              flex: 1,
            }}
          >
            {/* {DrawerItemsFunction(Icons.DrawerHomeIcon, "Home", "HomeScreen")} */}
            {DrawerItem(Icons.DrawerHomeIcon, "Home", () =>
              navigateToTab("Home")
            )}
            {/* {DrawerItemsFunction(Icons.DrawerProfileIcon, "My Profile", "ProfileScreen")} */}
            {/* {DrawerItem(Icons.DrawerProfileIcon, "My Profile", () =>
                            navigateToTab("Me")
                        )} */}
            {DrawerItem(Icons.DrawerProfileIcon, "My Profile", () => {
              navigation.closeDrawer();
              navigation.navigate("ProfileScreen");
            })}
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  color: "#B9B9B9",
                  fontSize: fontPixel(12),
                  fontFamily: FONTS.tenonMediumFont,
                }}
              >
                ACTIVITY
              </Text>
            </View>
            {/* {DrawerItemsFunction(Icons.DrawerOrderIcon, "My Orders", "OrdersStack")} */}
            {DrawerItem(Icons.DrawerOrderIcon, "My Orders", () =>
              navigateToTab("Orders")
            )}
            {/* {DrawerItemsFunction(Icons.DrawerSavingIcon, "My Savings", "SavingScreen")} */}
            {DrawerItem(Icons.DrawerSavingIcon, "My Savings", () =>
              navigateToTab("Savings")
            )}
            {DrawerItemsFunction(Icons.ReviewIcon, "My Reviews", "MyReviews")}
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  color: "#B9B9B9",
                  fontSize: fontPixel(12),
                  fontFamily: FONTS.tenonMediumFont,
                }}
              >
                USEFUL LINKS
              </Text>
            </View>
            {DrawerItemsFunction(
              Icons.SupportIcon,
              "Help & Support",
              "HelpAndSupportScreen"
            )}
            {DrawerItemsFunction(
              Icons.NotificationIcon,
              "Notification Settings",
              "NotificationScreen"
            )}
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  color: "#B9B9B9",
                  fontSize: fontPixel(12),
                  fontFamily: FONTS.tenonMediumFont,
                }}
              >
                APPLICATION
              </Text>
            </View>
            {DrawerItemsFunction(Icons.InfoIcon, "About Magic Meal", "AboutMagicMeal")}
            {DrawerItemsFunction(Icons.RateIcon, "Share Application", () => Linking.openURL("https://play.google.com/store/games?hl=en"))}
            {DrawerItemsFunction(Icons.RateIcon, "Rate Us", null)}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fff",
              paddingHorizontal: 20,
              paddingBottom: 10,
            }}
          >
            <Text
              style={{
                color: "#7E8389",
                fontFamily: FONTS.tenonRegularFont,
                fontSize: fontPixel(11),
              }}
            >
              Copyright 2025
            </Text>
            <Text
              style={{
                color: "#7E8389",
                fontFamily: FONTS.tenonRegularFont,
                fontSize: fontPixel(11),
              }}
            >{`${getVersion() && `${drawerLabels?.AppVersion}: ${getVersion()}`
              }`}</Text>
          </View>
        </View>
      </LinearGradient>
      {/* <View style={{ backgroundColor: "#fff", flex: 1 }} /> */}
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
    overflow: "hidden",
  },
  name: {
    fontSize: fontPixel(18),
    color: "#FFFFFF",
    fontFamily: FONTS.tenonMediumFont,
  },
  email: {
    fontSize: fontPixel(18),
    color: "#FFFFFF",
    marginTop: 2,
    fontFamily: FONTS.tenonBoldFont,
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
    fontFamily: FONTS.muliBoldFont,
  },
});
