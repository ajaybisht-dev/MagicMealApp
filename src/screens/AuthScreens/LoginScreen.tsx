import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ImageBackground,
  Keyboard,
} from 'react-native';
import TextInputComponent from '../../component/TextInput';
import { Images } from '../../theme/AssetsUrl';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/AuthTypes';
import { validateEmail } from '../../utils/validation';
import { getUserLoginToken } from '../../../helpers/Services/userAuth';
import { getData, saveData } from '../../utils/storage';
import CustomToast from '../../component/CustomToast';
import LinearGradient from 'react-native-linear-gradient';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import { FONTS } from '../../theme/FontsLink';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { setLogoutData } from '../../store/Slices/logoutSlice';
import { useDispatch } from 'react-redux';
import { updateDeviceToken } from '../../../helpers/Services/personal';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "LoginScreen"
>

interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginScreen: React.FC = () => {

  const navigation = useNavigation<LoginScreenNavigationProp>();

  const dispatch = useDispatch();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<ValidationErrors>({});
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async () => {
    dispatch(setLogoutData(null))
    Keyboard.dismiss();
    const errors: Record<string, string> = {};
    const emailError = validateEmail(emailOrPhone);
    if (emailError) errors.email = emailError;
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    setValidationError({});
    let payload = {
      "email": emailOrPhone.toLowerCase(),
      "password": password
    }
    await getUserLoginToken(payload).then(async (response) => {
      if (response) {
        await saveData("userData", JSON.stringify(response));
        await saveData("user_id", response?.userID);
        getFCMToken(response?.userID);
        setShowToast(true);
        setIsSuccess(true);
        setToastMessage("Login Successfully");
        setTimeout(() => {
          setShowToast(false);
          navigation.replace("AppNavigation");
        }, 1000);
      }
    }).catch((error) => {
      setIsSuccess(false);
      setShowToast(true);
      setToastMessage(error);
      setTimeout(() => {
        setShowToast(false);
      }, 1000);
    })
  };

  const getFCMToken = async (userId: any) => {
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    let payload = {
      userID: userId,
      userDeviceToken: fcmToken,
      userDeviceType: Platform.OS == 'android' ? 'Android' : 'IOS',
    };
    await updateDeviceToken(payload).then(response => {
      console.log("fcm call", response);
    });
  };

  const handleSignUp = () => {
    navigation.navigate("RegistrationScreen")
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess} />}
        <LinearGradient colors={['#264941', '#264941']} style={styles.container}>
          <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(400), width: widthPixel(400), justifyContent: "center", alignItems: "center", alignSelf: "center" }} resizeMode="contain" tintColor={"#23302A"}>
            <View style={styles.logoContainer}>
              <Image source={Images.AppLogo} style={DefaultStyle.imageSize} resizeMode="contain" />
            </View>
          </ImageBackground>
          <View style={{ width: "100%", backgroundColor: "#fff", position: "absolute", bottom: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
            <KeyboardAwareScrollView
              contentContainerStyle={{
                paddingBottom: 50,
                flexGrow: 1,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}

              enableOnAndroid={true}
              enableAutomaticScroll={true}
              enableResetScrollToCoords={false}

              extraScrollHeight={0}
              extraHeight={0}
              keyboardOpeningTime={0}
            >
              <View style={{ paddingTop: 40, paddingLeft: 40, paddingRight: 40 }}>
                <Text style={styles.title}>Welcome to Magic Meal</Text>

                <View style={styles.inputGroup}>
                  <View style={{ marginBottom: 15 }}>
                    <Text style={styles.label}>Email address</Text>
                    <TextInputComponent
                      placeholder="Enter your email"
                      placeholderTextColor="#888"
                      autoCapitalize="none"
                      // value={emailOrPhone}
                      keyboardType="email-address"
                      isPassword={false}
                      onChangeText={(text) => {
                        setEmailOrPhone(text);
                        if (validationError.email)
                          setValidationError((prev) => ({ ...prev, email: "" }));
                      }}
                    />

                    {validationError.email && (
                      <Text style={styles.errorText}>{validationError.email}</Text>
                    )}
                  </View>

                  <View style={{ marginBottom: 15 }}>
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={styles.label}>Password</Text>
                      <Pressable
                        onPress={handleForgotPassword}
                        style={({ pressed }) => [
                          pressed && { opacity: 0.6 },
                        ]}
                      >
                        <Text style={styles.forgotText}>Forgot password?</Text>
                      </Pressable>
                    </View>
                    <TextInputComponent
                      placeholder="Enter your password"
                      placeholderTextColor="#888"
                      secureTextEntry
                      // value={password}
                      autoCapitalize="none"
                      isPassword={true}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (validationError.password)
                          setValidationError((prev) => ({ ...prev, password: "" }));
                      }}
                    />
                    {validationError.password && (
                      <Text style={styles.errorText}>{validationError.password}</Text>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.loginText}>Login</Text>
                </Pressable>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don’t have account? </Text>
                  <Pressable
                    onPress={handleSignUp}
                    style={({ pressed }) => pressed && { opacity: 0.6 }}
                  >
                    <Text style={styles.signupLink}>Sign up</Text>
                  </Pressable>
                </View>
              </View>
              <View style={{ height: 185, width: 185, position: "absolute", bottom: -40, right: -40 }}>
                <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
              </View>
            </KeyboardAwareScrollView>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </View >
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  errorText: { color: "red", fontSize: fontPixel(16), marginTop: 4, fontFamily: FONTS.tenonRegularFont },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    // alignItems: 'center',
    // justifyContent: 'center',
    // paddingHorizontal: 24,
  },
  logoContainer: {
    width: widthPixel(280),
    height: heightPixel(280),
  },
  title: {
    fontSize: fontPixel(24),
    fontFamily: FONTS.tenonMediumFont,
    color: '#264941',
    marginBottom: 30,
    alignSelf: "flex-start"
  },
  inputGroup: {
    width: '100%'
  },
  label: {
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonRegularFont,
    color: '#666666',
    marginBottom: 5
  },
  forgotText: {
    fontSize: fontPixel(13),
    color: "#264941",
    fontFamily: FONTS.tenonMediumFont
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#264941',
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 15,
    alignSelf: "center",
    zIndex: 99
  },
  loginText: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    color: '#fff',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginBottom: 60,
    zIndex: 99
  },
  signupText: {
    color: '#666666',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonRegularFont
  },
  signupLink: {
    color: '#264941',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonRegularFont
  },
});