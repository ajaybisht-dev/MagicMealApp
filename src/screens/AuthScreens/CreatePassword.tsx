import React, { useState } from "react";
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
} from "react-native";
import TextInputComponent from "../../component/TextInput";
import { Icons, Images } from "../../theme/AssetsUrl";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/AuthTypes";
import { RootStackParamList } from "../../navigation/AuthNavigation/AuthNavigation";
import { validatePasswordNConfirmPassword } from "../../utils/validation";
import { userResetPassword } from "../../../helpers/Services/userAuth";
import CustomToast from "../../component/CustomToast";
import LinearGradient from "react-native-linear-gradient";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { DefaultStyle } from "../../theme/styles/DefaultStyle";
import { FONTS } from "../../theme/FontsLink";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type CreatePasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "CreatePassword"
>;

type Props = NativeStackScreenProps<RootStackParamList, "CreatePassword">;


interface ValidationErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const CreatePassword: React.FC<Props> = ({ route }) => {
  const { email, otp } = route?.params
  const navigation = useNavigation<CreatePasswordNavigationProp>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = async () => {
    Keyboard.dismiss();
    const errors: Record<string, string> = {};
    const passwordError = validatePasswordNConfirmPassword(newPassword, confirmPassword);
    if (passwordError?.includes("Confirm Password")) {
      errors.confirmPassword = passwordError;
    } else if (passwordError) {
      errors.newPassword = passwordError;
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    setValidationError({});
    let payload = {
      "email": email,
      "password": confirmPassword,
      "otp": otp.join('')
    }

    console.log(payload);


    await userResetPassword(payload).then((response) => {
      if (response?.succeeded) {
        setShowToast(true);
        setIsSuccess(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "LoginScreen" }],
          });
        }, 1000);
      } else {
        setIsSuccess(false);
        setShowToast(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }
    })
  };

  return (
    <View style={{ flex: 1 }}>
      {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess} />}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <LinearGradient colors={['#264941', '#264941']} style={styles.container}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
          >
            <Image source={Icons.ArrowIcon} style={styles.backIcon} resizeMode="contain" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(400), width: widthPixel(400), justifyContent: "center", alignItems: "center", alignSelf: "center" }} resizeMode="contain" tintColor={"#23302A"}>
            <View style={styles.logoContainer}>
              <Image source={Images.AppLogo} style={DefaultStyle.imageSize} resizeMode="contain" />
            </View>
          </ImageBackground>
          <View style={{ width: "100%", backgroundColor: "#fff", position: "absolute", bottom: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50, zIndex: 99 }}>
            <View>
              <View style={{ marginTop: 5 }}>
                <View style={{ paddingLeft: 10, paddingRight: 10, alignItems: "center", paddingBottom: 5 }}>
                  <Text style={styles.title}>Reset Password</Text>
                </View>
                <KeyboardAwareScrollView
                  contentContainerStyle={styles.scrollContainer}
                  keyboardShouldPersistTaps={"handled"}
                  showsVerticalScrollIndicator={false}

                  enableOnAndroid={true}
                  enableAutomaticScroll={true}
                  enableResetScrollToCoords={false}

                  extraScrollHeight={0}
                  extraHeight={0}
                  keyboardOpeningTime={0}
                >
                  <View style={{ paddingLeft: 10, paddingRight: 10, alignItems: "center" }}>
                    <View style={[styles.headerContainer, { marginTop: 20 }]}>
                      <Text style={styles.subtitle}>Please enter your new password to</Text>
                      <Text style={styles.subtitle}>continue.</Text>
                      {/* <Text style={styles.phoneText}>{phoneNumber}</Text> */}
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password</Text>
                      <TextInputComponent
                        placeholder="Enter new password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={newPassword}
                        autoCapitalize="none"
                        isPassword={true}
                        onChangeText={(text) => {
                          setNewPassword(text);
                          if (validationError.newPassword)
                            setValidationError((prev) => ({ ...prev, password: "" }));
                        }}
                      />
                      {validationError.newPassword && (
                        <Text style={styles.errorText}>{validationError.newPassword}</Text>
                      )}
                      <Text style={[styles.label, { marginTop: 20 }]}>Confirm Password</Text>
                      <TextInputComponent
                        placeholder="Re-enter password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={confirmPassword}
                        autoCapitalize="none"
                        isPassword={true}
                        onChangeText={(text) => {
                          setConfirmPassword(text);
                          if (validationError.confirmPassword)
                            setValidationError((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                      />
                      {validationError.confirmPassword && (
                        <Text style={styles.errorText}>{validationError.confirmPassword}</Text>
                      )}
                    </View>
                  </View>
                  {/* Save Button */}
                  <Pressable
                    onPress={handleSave}
                    style={({ pressed }) => [
                      styles.verifyButton,
                      pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                    ]}
                  >
                    <Text style={styles.verifyText}>Reset Password</Text>
                  </Pressable>
                  <View style={{ height: 185, width: 185, position: "absolute", bottom: -40, right: -40 }}>
                    <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
                  </View>
                </KeyboardAwareScrollView>
              </View>
              {/* </KeyboardAvoidingView> */}
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    width: widthPixel(282),
    height: heightPixel(282),
  },
  scrollContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    flexGrow: 1,
    paddingBottom : 50,
  },
  logo: {
    width: 140,
    height: 140,
    marginTop: 80,
    marginBottom: 30,
  },
  title: { fontSize: fontPixel(24), fontFamily: FONTS.tenonBoldFont, color: "#264941", alignSelf: "center", marginTop: 10 },
  inputGroup: {
    width: "100%",
    marginBottom: 40,
    zIndex: 1
  },
  saveButton: {
    width: "60%",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  errorText: { color: "red", fontSize: fontPixel(16), marginTop: 4, marginBottom: 6, fontFamily: FONTS.tenonMediumFont },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    position: "absolute",
    top: 27,
    left: 25,
    zIndex: 1
  },
  backIcon: { width: 15, height: 15, marginRight: 8 },
  backText: { fontSize: fontPixel(16), color: "#fff", fontFamily: FONTS.tenonMediumFont, top: -1 },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: fontPixel(16),
    color: '#666666',
    textAlign: 'center',
    fontFamily: FONTS.tenonMediumFont
  },
  label: {
    fontSize: fontPixel(16),
    color: '#666666',
    fontFamily: FONTS.tenonRegularFont,
    marginBottom: 5
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#264941',
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: "center",
    zIndex: 99
  },
  verifyText: {
    fontSize: fontPixel(16), fontFamily: FONTS.tenonMediumFont, color: "#fff"
  },
});