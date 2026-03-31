import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Alert,
  ImageBackground,
  Dimensions,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TextInputComponent from "../../component/TextInput";
import { Icons, Images } from "../../theme/AssetsUrl";
import { AuthStackParamList } from "../../types/AuthTypes";
import { getData, saveData } from "../../utils/storage";
import { useNetInfo } from '@react-native-community/netinfo';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordNConfirmPassword,
  validatePhone,
} from "../../utils/validation";
import { userRegistration } from "../../../helpers/Services/userAuth";
import CustomToast from "../../component/CustomToast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { DefaultStyle } from "../../theme/styles/DefaultStyle";
import { FONTS } from "../../theme/FontsLink";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";

const { height: windowHeight } = Dimensions.get("window");

type RegistrationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "RegistrationScreen"
>;

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<RegistrationScreenNavigationProp>();

  const netINFO = useNetInfo();

  const ipAddress =
    netINFO.type === "wifi" && netINFO.details && "ipAddress" in netINFO.details
      ? (netINFO.details as { ipAddress?: string }).ipAddress
      : undefined;


  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePromotions, setAgreePromotions] = useState(false);
  const [validationError, setValidationError] = useState<ValidationErrors>({});
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => { }, [netINFO]);

  const handleUserName = (name: string, type: number): string => {
    const splitName = name.trim().split(" ");
    if (type === 1) return splitName[0] || "";
    return splitName.length > 1 ? splitName.slice(1).join(" ") : "";
  };

  const handleCreateAccount = async () => {
    Keyboard.dismiss();
    const errors: Record<string, string> = {};

    const nameError = validateName(fullName);
    if (nameError) errors.fullName = nameError;

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhone(phone);
    if (phoneError) errors.phone = phoneError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    // const passwordError = validatePasswordNConfirmPassword(password, confirmPassword);
    // if (passwordError?.includes("Confirm Password")) {
    //   errors.confirmPassword = passwordError;
    // } else if (passwordError) {
    //   errors.password = passwordError;
    // }

    if (!agreeTerms) errors.terms = "Please accept Terms & Conditions";

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    setValidationError({});

    try {
      const fcmToken = await AsyncStorage.getItem("fcmToken");
      const userName = email.toLowerCase();

      const payload = {
        firstName: handleUserName(fullName, 1),
        lastName: handleUserName(fullName, 2),
        email: email.toLowerCase(),
        userName,
        password,
        confirmPassword: password,
        phoneNumber: phone,
        userRole: "Customer",
        // userDeviceToken: "cWNW1OJmRP-p_5K4Ejf0Gc:APA91bEP4D8e9k6mT89X-MiD3CM7Rkzm1JQRdrSLShtBpoOHtvywUKBZ3vzMI1_zUUVJM2eqvnYRvBo7xLddM1PTh8-g2HQeWxrpxdZWSYdfLvepj6UkmGY",
        userDeviceToken: fcmToken ?? "",
        userDeviceType: Platform.OS === "android" ? "Android" : "IOS",
        ipAddress,
        isAggredTnC: agreeTerms,
        isAggredPromotion: agreePromotions
      };

      const response = await userRegistration(payload);

      if (response?.succeeded) {
        saveData("user_id", response?.data);
        setShowToast(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
          navigation.navigate("OtpScreen", {
            // phoneNumber: phone,
            phoneNumber: email.toLowerCase(),
            routeId: 1,
            user_id: response?.data
          });
        }, 1000);
      } else {
        setShowToast(true);
        setToastMessage(response?.messages?.[0] || "Failed to create account");
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setShowToast(true);
      setToastMessage("Something went wrong. Please try again.");
      setTimeout(() => {
        setShowToast(false);
      }, 1000);
    }
  };

  const handleLogin = () => navigation.goBack();

  return (
    <View style={{ flex: 1 }}>
      {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess}/>}
      <LinearGradient colors={['#264941', '#264941']} style={styles.container}>
        <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(350), width: widthPixel(350), justifyContent: "center", alignItems: "center", alignSelf: "center" }} resizeMode="contain" tintColor={"#23302A"}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
          >
            <Image source={Icons.ArrowIcon} style={styles.backIcon} resizeMode="contain" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.logoContainer}>
            <Image source={Images.AppLogo} style={DefaultStyle.imageSize} resizeMode="contain" />
          </View>
        </ImageBackground>
        <View style={{ width: "100%", backgroundColor: "#fff", position: "absolute", bottom: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50, height: "88%" }}>
          <View style={{ paddingTop: 20, paddingLeft: 40, paddingRight: 40 }}>
            <Text style={styles.title}>Create Account</Text>
          </View>
          <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps={"handled"} showsVerticalScrollIndicator={false}>
            <View style={{ paddingLeft: 40, paddingRight: 40 }}>
              <View style={styles.inputGroup}>
                {/* Full Name */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInputComponent
                    placeholder="Full Name"
                    placeholderTextColor="#888"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (validationError.fullName)
                        setValidationError((prev) => ({ ...prev, fullName: "" }));
                    }}
                  />
                  {validationError.fullName && (
                    <Text style={styles.errorText}>{validationError.fullName}</Text>
                  )}
                </View>

                {/* Email */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInputComponent
                    placeholder="Email Address"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    value={email}
                    autoCapitalize="none"
                    onChangeText={(text) => {
                      setEmail(text);
                      if (validationError.email)
                        setValidationError((prev) => ({ ...prev, email: "" }));
                    }}
                  />
                  {validationError.email && (
                    <Text style={styles.errorText}>{validationError.email}</Text>
                  )}
                </View>

                {/* Phone */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInputComponent
                    placeholder="Phone Number"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    value={phone}
                    isPhone
                    onChangeText={(text) => {
                      setPhone(text);
                      if (validationError.phone)
                        setValidationError((prev) => ({ ...prev, phone: "" }));
                    }}
                  />
                  {validationError.phone && (
                    <Text style={styles.errorText}>{validationError.phone}</Text>
                  )}
                </View>

                {/* Password */}
                <Text style={styles.label}>Password</Text>
                <TextInputComponent
                  placeholder="Password"
                  placeholderTextColor="#888"
                  isPassword={true}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (validationError.password)
                      setValidationError((prev) => ({ ...prev, password: "" }));
                  }}
                />
                {validationError.password && (
                  <Text style={styles.errorText}>{validationError.password}</Text>
                )}
                {/* <TextInputComponent
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (validationError.password)
                    setValidationError((prev) => ({ ...prev, confirmPassword: "" }));
                }}
              />
              {validationError.confirmPassword && (
                <Text style={styles.errorText}>{validationError.confirmPassword}</Text>
              )} */}
              </View>

              {/* Terms Checkbox */}
              <View style={styles.termsContainer}>
                <Pressable
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  style={styles.checkboxWrapper}
                >
                  {
                    agreeTerms ?
                      <View style={styles.checkbox}>
                        <Image source={Icons.CheckIcon} style={{ height: "100%", width: "100%" }} resizeMode="contain" />
                      </View>
                      :
                      <View style={[styles.checkbox, { borderWidth: 1, borderRadius: 40, borderColor: "#666666" }]} />
                  }
                  <Text style={styles.termsText}>I agree to <Text style={[styles.termsText, { color: "#264941" }]}>Terms & Conditions</Text></Text>
                </Pressable>
                {
                  !agreeTerms && <Text style={styles.errorText}>Please accept Terms & Conditions</Text>
                }
                <Pressable
                  onPress={() => setAgreePromotions(!agreePromotions)}
                  style={[styles.checkboxWrapper, { alignItems: "flex-start", marginTop: 10 }]}
                >
                  {
                    agreePromotions ?
                      <View style={styles.checkbox}>
                        <Image source={Icons.CheckIcon} style={{ height: "100%", width: "100%" }} resizeMode="contain" />
                      </View>
                      :
                      <View style={[styles.checkbox, { borderWidth: 1, borderRadius: 40, borderColor: "#666666" }]} />
                  }
                  <Text style={[styles.termsText, { width: 200 }]}>I agree to <Text style={[styles.termsText, { color: "#264941" }]}>subscribe for newsletters & promotions</Text></Text>
                </Pressable>
              </View>

              {/* Create Account Button */}
              <Pressable
                onPress={(!fullName || !email || !phone || !password) ? undefined : handleCreateAccount}
                disabled={!fullName || !email || !phone || !password}
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                  (!fullName || !email || !phone || !password || !agreeTerms) && { opacity: 0.5, backgroundColor: "#666666" }
                ]}
              >
                <Text style={styles.createText}>CREATE ACCOUNT</Text>
              </Pressable>

              {/* Login Redirect */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Pressable onPress={handleLogin}>
                  <Text style={styles.loginLink}>Login</Text>
                </Pressable>
              </View>
              <View style={{ height: 185, width: 185, position: "absolute", bottom: -80, right: -55 }}>
                <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </LinearGradient>
    </View >
  );
};

export default RegistrationScreen;

/* ---------------------- STYLES ---------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: {},
  logoContainer: {
    width: 200,
    height: 200,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    position: "absolute",
    top: 20,
    left: 10
  },
  backIcon: { width: 15, height: 15, marginRight: 8 },
  backText: { fontSize: 16, color: "#fff", fontFamily: FONTS.poppinsSemiBoldFont, top: 1 },
  title: { fontSize: 22, fontFamily: FONTS.muliBoldFont, color: "#264941", marginBottom: 20 },
  inputGroup: { width: "100%" },
  errorText: { color: "red", fontSize: 14, marginTop: 4, fontFamily: FONTS.muliSemiBoldFont },
  termsContainer: { width: "100%", marginVertical: 15, marginBottom: 23 },
  checkboxWrapper: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 3,
  },
  termsText: { fontSize: fontPixel(16), fontFamily: FONTS.poppinsRegularFont, top: 1 },
  createButton: {
    width: '100%',
    backgroundColor: '#264941',
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: "center",
    zIndex: 99
  },
  createText: { fontSize: fontPixel(16), fontFamily: FONTS.muliSemiBoldFont, color: "#fff" },
  loginContainer: { flexDirection: "row", justifyContent: "center", zIndex: 99, paddingBottom: 20 },
  loginText: { color: "#666666", fontSize: 16, fontFamily: FONTS.poppinsMediumFont },
  loginLink: { color: "#264941", fontSize: 16, fontFamily: FONTS.poppinsMediumFont },
  label: {
    fontSize: fontPixel(16),
    fontFamily: FONTS.poppinsRegularFont,
    color: '#666666',
  },
});