import React, { cache, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Image,
  Keyboard,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icons, Images } from '../../theme/AssetsUrl';
import { AuthStackParamList } from '../../types/AuthTypes';
import { confirmEmailOtp, resendOtp } from '../../../helpers/Services/userAuth';
import { getData } from '../../utils/storage';
import TextInputComponent from '../../component/TextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomToast from '../../component/CustomToast';
import LinearGradient from 'react-native-linear-gradient';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import { FONTS } from '../../theme/FontsLink';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';

type OtpScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'OtpScreen'
>;

const OtpScreen: React.FC = ({ route }: any) => {
  const { phoneNumber, routeId, email, user_id } = route.params;
  const navigation = useNavigation<OtpScreenNavigationProp>();

  const otpRef = useRef<string[]>([]);

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isOtpEmpty, setIsOtpEmpty] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1 && interval) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      otpRef.current = newOtp;
      setOtp(newOtp);

      if (text && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
      if (index === 3 && text) {
        Keyboard.dismiss();
        handleVerify();
      }
    }
  };

  // const handleKeyPress = (e: any, index: number) => {
  //   if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
  //     inputRefs.current[index - 1]?.focus();
  //   }
  // };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];

      if (newOtp[index] !== "") {
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    const code = otpRef.current.join('');
    if (!code) {
      setIsOtpEmpty(true);
      setErrorMessage("Enter OTP");
      return;
    }
    let payload = {
      userId: user_id,
      otp: code,
      isEmailSMS: true
    };

    await confirmEmailOtp(payload).then((response) => {
      if (response?.succeeded) {
        if (routeId == 2) {
          navigation.navigate("CreatePassword", {
            email: phoneNumber,
            otp: otpRef.current
          });
        } else {
          setShowConfirmationMessage(true);
        }
      } else {
        setIsOtpEmpty(true);
        setErrorMessage(response?.messages[0]);
      }
    }).catch((error) => {
      console.log("otp error", error)
    })
  };

  const handleResendOtp = async () => {
    if (isResending || timer > 0) return;

    setIsResending(true);
    try {
      const payload = {
        userId: user_id,
        isEmailSMS: true,
      };
      const response = await resendOtp(payload);
      console.log("Resent OTP:", response);
      setTimer(60);
    } catch (error) {
      console.error("Error resending OTP:", error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleConfirmationNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <LinearGradient colors={['#264941', '#264941']} style={styles.container}>
          {
            showConfirmationMessage == false &&
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
            >
              <Image source={Icons.ArrowIcon} style={styles.backIcon} resizeMode="contain" />
              <Text style={[styles.backText, {top : -1}]}>Back</Text>
            </Pressable>
          }
          <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(400), width: widthPixel(400), justifyContent: "center", alignItems: "center", alignSelf: "center" }} resizeMode="contain" tintColor={"#23302A"}>
            <View style={styles.logoContainer}>
              <Image source={Images.AppLogo} style={DefaultStyle.imageSize} resizeMode="contain" />
            </View>
          </ImageBackground>
          {
            showConfirmationMessage ?
              <View style={{ backgroundColor: "#fff", flex: 1, borderTopLeftRadius: 50, borderTopRightRadius: 50, alignItems: "center" }}>
                <View style={{ padding: "10%", alignItems: "center" }}>
                  <View style={styles.CheckIconBig}>
                    <Image source={Icons.CheckIconBig} style={DefaultStyle.imageSize} resizeMode="contain" />
                  </View>
                  <View>
                    <Text style={styles.title}>Congratulations</Text>
                  </View>
                  <View style={[styles.headerContainer, { marginTop: 20, marginBottom: 0 }]}>
                    <Text style={styles.subtitle}>Your account has been created</Text>
                    <Text style={styles.subtitle}>successfully.</Text>
                    {/* <Text style={styles.phoneText}>{phoneNumber}</Text> */}
                  </View>
                </View>
                <Pressable
                  onPress={handleConfirmationNavigation}
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.loginText}>Log In</Text>
                </Pressable>
                <View style={{ height: 185, width: 185, position: "absolute", bottom: -40, right: -40 }}>
                  <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
                </View>
              </View> :
              <View style={{ width: "100%", backgroundColor: "#fff", position: "absolute", bottom: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50, zIndex: 99 }}>
                <View>
                    <View style={{ marginTop: 5 }}>
                      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps={"handled"}>
                        <Text style={styles.title}>Verification</Text>

                        <View style={[styles.headerContainer, { marginTop: 20, marginBottom: isOtpEmpty ? 10 : 40 }]}>
                          <Text style={styles.subtitle}>We have send you code to verify</Text>
                          <Text style={styles.subtitle}>your Email</Text>
                          <Text style={styles.phoneText}>{phoneNumber}</Text>
                        </View>

                        {
                          isOtpEmpty &&
                          <View style={{ marginTop: 5 }}>
                            <Text style={[styles.errorText, { textAlign: "center" }]}>{errorMessage}</Text>
                          </View>
                        }

                        <View style={styles.otpContainer}>
                          {otp.map((digit, index) => (
                            <TextInput
                              key={index}
                              ref={(ref: TextInput | null) => {
                                inputRefs.current[index] = ref;
                              }}
                              style={[styles.otpInput, {}, digit ? styles.filledInput : undefined]}
                              value={digit}
                              keyboardType="number-pad"
                              maxLength={1}
                              textContentType="oneTimeCode"
                              onChangeText={(text) => handleChange(text, index)}
                              onKeyPress={(e) => handleKeyPress(e, index)}
                              autoFocus={index === 0}
                            />
                          ))}
                        </View>

                        <View style={styles.resendContainer}>
                          <Text style={styles.resendText}>Didn’t receive the code?</Text>
                          {timer > 0 ? (
                            <Text style={styles.timerText}>{formatTime(timer)}</Text>
                          ) : (
                            <Pressable
                              onPress={handleResendOtp}
                              disabled={isResending}
                              style={({ pressed }) => pressed && { opacity: 0.6 }}
                            >
                              <Text style={styles.resendLink}>
                                {isResending ? "Resending..." : "Resend Code"}
                              </Text>
                            </Pressable>
                          )}
                        </View>

                        <Pressable
                          onPress={handleVerify}
                          style={({ pressed }) => [
                            styles.verifyButton,
                            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                          ]}
                        >
                          <Text style={styles.verifyText}>Continue</Text>
                        </Pressable>
                        <View style={{ height: 185, width: 185, position: "absolute", bottom: -40, right: -40 }}>
                          <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
                        </View>
                      </ScrollView>
                    </View>
                </View>
              </View>

          }
        </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  logoContainer: {
    width: widthPixel(282),
    height: heightPixel(282),
  },
  CheckIconBig: {
    width: widthPixel(100),
    height: heightPixel(100),
    marginBottom: 30
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    position: "absolute",
    top: 27,
    left: 25,
    zIndex: 1
  },
  backIcon: { width: widthPixel(15), height: heightPixel(15), marginRight: 8 },
  backText: { fontSize: fontPixel(16), color: "#fff", fontFamily: FONTS.tenonMediumFont},
  errorText: { color: "red", fontSize: fontPixel(16), marginTop: 4, marginBottom: 6, fontFamily: FONTS.tenonMediumFont },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 28,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: { fontSize: fontPixel(24), fontFamily: FONTS.tenonMediumFont, color: "#264941", alignSelf: "center" },
  subtitle: {
    fontSize: fontPixel(16),
    color: '#666666',
    textAlign: 'center',
    fontFamily: FONTS.tenonMediumFont
  },
  phoneText: {
    fontSize: fontPixel(16),
    color: '#000000',
    fontFamily: FONTS.tenonRegularFont
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '83%',
    marginBottom: 30,
  },
  otpInput: {
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#D6D6D6',
    width: widthPixel(65),
    fontSize: fontPixel(24),
    textAlign: 'center',
    color: '#000',
    paddingVertical: 8,
    height: heightPixel(70),
    borderRadius: 10,
    fontFamily: FONTS.tenonMediumFont
  },
  filledInput: {
    borderColor: '#D6D6D6',
    backgroundColor: "#FAFAFA",
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: fontPixel(16),
    color: '#666666',
    fontFamily: FONTS.tenonRegularFont,
    marginBottom: 10
  },
  timerText: {
    fontSize: fontPixel(26),
    color: '#D34D40',
    marginTop: 4,
    fontFamily: FONTS.tenonMediumFont,
  },
  resendLink: {
    fontSize: fontPixel(16),
    color: '#D34D40',
    fontFamily: FONTS.tenonMediumFont,
    marginTop: 4,
  },
  verifyButton: {
    width: '85%',
    backgroundColor: '#264941',
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    alignSelf: "center",
    zIndex: 99
  },
  verifyText: {
    fontSize: fontPixel(16), fontFamily: FONTS.tenonMediumFont, color: "#fff"
  },
  loginButton: {
    width: '60%',
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
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    color: '#fff',
    // top: Platform.OS == "android" ? 2 : 0
  },
});