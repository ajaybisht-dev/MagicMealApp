import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
} from "react-native";
import { Icons, Images } from "../../theme/AssetsUrl";
import {
  CommonActions,
  DrawerActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UpdateUserNotification } from "../../../helpers/Services/userProfile";
import CustomToast from "../../component/CustomToast";
import LinearGradient from "react-native-linear-gradient";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { FONTS } from "../../theme/FontsLink";
import { DefaultStyle } from "../../theme/styles/DefaultStyle";
import AnimatedToggle from "./CommonScreen/AnimatedToggle";
import { getData } from "../../utils/storage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import { notficationDataReducer } from "../../store/Slices/userProfileSlice";

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [isSMSEnable, setIsSMSEnable] = useState(false);
  const [isEmailEnable, setIsEmailEnable] = useState(false);

  const notificationSelector = useSelector(
    (state: RootState) => state?.userProfileSlice?.notificationData
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (notificationSelector) {
      handleGetNotification();
    }
  }, [notificationSelector]);

  const handleGetNotification = async () => {
    setIsSMSEnable(notificationSelector?.isSMSUpdates ?? false);
    setIsEmailEnable(notificationSelector?.isEmailUpdates ?? false);
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleGoToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "DrawerNavigation",
            state: {
              index: 0,
              routes: [{ name: "HomeScreen" }],
            },
          },
        ],
      })
    );
  };

  const handleSMSEnable = async (value: boolean) => {
    setIsSMSEnable(value);

    const userData = await getData("userData");
    let payload = {
      userId: userData?.userID,
      isSMSUpdates: value,
      isEmailUpdates: isEmailEnable,
    };

    await UpdateUserNotification(payload).then(async () => {
      let obj = {
        isSMSUpdates: payload?.isSMSUpdates,
        isEmailUpdates: payload?.isEmailUpdates
      }
      dispatch(notficationDataReducer(obj));
      await AsyncStorage.setItem("NotificationData", JSON.stringify(payload));
    });
  };

  const handleEmailEnable = async (value: boolean) => {
    setIsEmailEnable(value);

    const userData = await getData("userData");
    let payload = {
      userId: userData?.userID,
      isSMSUpdates: isSMSEnable,
      isEmailUpdates: value,
    };

    await UpdateUserNotification(payload).then(async () => {
      let obj = {
        isSMSUpdates: payload?.isSMSUpdates,
        isEmailUpdates: payload?.isEmailUpdates
      }
      dispatch(notficationDataReducer(obj));
      await AsyncStorage.setItem("NotificationData", JSON.stringify(payload));
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        {showToast && (
          <CustomToast message={toastMessage} isSuccess={isSuccess} />
        )}

        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1 }}
          resizeMode="contain"
          imageStyle={{ tintColor: "#23302A" }}
        >
          <View style={styles.headerNav}>
            <Pressable style={styles.header} onPress={handleOpenDrawer}>
              <Image
                source={Icons.MenuIcon}
                resizeMode="contain"
                style={{
                  height: heightPixel(20),
                  width: widthPixel(20),
                  marginRight: 10,
                }}
              />
              <Text style={styles.headerTitle}>Notification Setting</Text>
            </Pressable>

            <Pressable onPress={handleGoToHome}>
              <Image
                source={Icons.HomeIcon}
                resizeMode="contain"
                style={{ height: heightPixel(27), width: widthPixel(27) }}
                tintColor={"#fff"}
              />
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              flex: 1,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              marginTop: 15,
            }}
          >
            <View
              style={{
                height: 185,
                width: 185,
                position: "absolute",
                bottom: -40,
                right: -40,
              }}
            >
              <Image
                source={Images.BottomCircle}
                style={DefaultStyle.imageSize}
                resizeMode="contain"
                tintColor={"#F4F4F4"}
              />
            </View>

            <View style={{ marginTop: 20, paddingLeft: 15, paddingRight: 15 }}>
              <View
                style={{
                  borderWidth: 1,
                  paddingVertical: 10,
                  marginTop: 10,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderColor: "#D6D6D6",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#15090A",
                      fontFamily: FONTS.tenonMediumFont,
                      fontSize: fontPixel(18),
                      width: "80%",
                    }}
                  >
                    Enable SMS updates for exclusive deals and offers.
                  </Text>

                  <AnimatedToggle
                    initial={notificationSelector?.isSMSUpdates}
                    onToggle={handleSMSEnable}
                  />
                </View>
              </View>

              <View
                style={{
                  borderWidth: 1,
                  paddingVertical: 10,
                  marginTop: 10,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  borderColor: "#D6D6D6",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#15090A",
                      fontFamily: FONTS.tenonMediumFont,
                      fontSize: fontPixel(18),
                      width: "80%",
                    }}
                  >
                    Enable email updates for exclusive deals and offers.
                  </Text>

                  <AnimatedToggle
                    initial={notificationSelector?.isEmailUpdates}
                    onToggle={handleEmailEnable}
                  />
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
  },
});