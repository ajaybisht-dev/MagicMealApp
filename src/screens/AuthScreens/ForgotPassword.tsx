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
    ImageBackground,
    Alert,
    Keyboard,
} from 'react-native';
import TextInputComponent from '../../component/TextInput';
import { Icons, Images } from '../../theme/AssetsUrl';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/AuthTypes';
import { validateEmail, validateEmailOrPhone } from '../../utils/validation';
import { userForgotPassword } from '../../../helpers/Services/userAuth';
import CustomToast from '../../component/CustomToast';
import LinearGradient from 'react-native-linear-gradient';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import { FONTS } from '../../theme/FontsLink';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
    AuthStackParamList,
    "ForgotPassword"
>

interface ValidationErrors {
    email?: string;
}

const ForgotPassword: React.FC = () => {

    const navigation = useNavigation<ForgotPasswordNavigationProp>();

    const [validationError, setValidationError] = useState<ValidationErrors>({});
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleForgotPasswordFunction = async () => {
        Keyboard.dismiss();
        const errors: Record<string, string> = {};
        const emailError = validateEmail(emailOrPhone);
        if (emailError) errors.email = emailError;
        if (Object.keys(errors).length > 0) {
            setValidationError(errors);
            return;
        }

        setValidationError({});
        let payload = {
            "email": emailOrPhone
        }
        await userForgotPassword(payload).then((response) => {
            if (response?.succeeded) {
                setShowToast(true);
                setIsSuccess(true);
                setToastMessage(response?.messages[0]);
                setTimeout(() => {
                    setShowToast(false);
                    navigation.navigate("OtpScreen", { phoneNumber: emailOrPhone, routeId: 2, user_id: response?.data })
                }, 1000);
            } else {
                setShowToast(true);
                setIsSuccess(false);
                setToastMessage(response?.messages[0]);
                setTimeout(() => {
                    setShowToast(false);
                }, 1000);
            }
        }).catch((error) => {
            setShowToast(false);
            setIsSuccess(false);
            console.log(error)
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
                                <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps={"handled"}>
                                    <View style={{ paddingLeft: 10, paddingRight: 10, alignItems: "center" }}>
                                        <Text style={styles.title}>Forgot Password?</Text>
                                        <View style={[styles.headerContainer, { marginTop: 10 }]}>
                                            <Text style={styles.subtitle}>Please enter Email so we can send</Text>
                                            <Text style={styles.subtitle}>you a verification code</Text>
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Email Address</Text>
                                            <TextInputComponent
                                                placeholder="Enter your email"
                                                placeholderTextColor="#888"
                                                keyboardType="email-address"
                                                autoCapitalize={"none"}
                                                value={emailOrPhone}
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
                                    </View>
                                    <Pressable
                                        onPress={handleForgotPasswordFunction}
                                        style={({ pressed }) => [
                                            styles.loginButton,
                                            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                                        ]}
                                    >
                                        <Text style={styles.loginText}>Send Reset Code</Text>
                                    </Pressable>
                                    <View style={{ height: 185, width: 185, position: "absolute", bottom: -60, right: -60 }}>
                                        <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
                                    </View>
                                </KeyboardAwareScrollView>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ForgotPassword;

const styles = StyleSheet.create({
    subtitle: {
        fontSize: fontPixel(16),
        color: '#666666',
        textAlign: 'center',
        fontFamily: FONTS.tenonMediumFont
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 20,
        alignItems: 'center',
    },
    errorText: { color: "red", fontSize: fontPixel(14), marginTop: 4, marginBottom: 6, fontFamily: FONTS.muliSemiBoldFont },
    logoContainer: {
        width: widthPixel(282),
        height: heightPixel(282),
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: fontPixel(24),
        fontFamily: FONTS.tenonMediumFont,
        color: '#264941',
        marginBottom: 10,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 40
    },
    label: {
        fontSize: fontPixel(16),
        color: '#666666',
        fontFamily: FONTS.tenonRegularFont,
        marginBottom: 5
    },
    loginButton: {
        width: '95%',
        backgroundColor: '#264941',
        borderRadius: 30,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 90,
        alignSelf: "center",
        zIndex: 99
    },
    loginText: {
        fontSize: fontPixel(16), fontFamily: FONTS.tenonBoldFont, color: "#fff"
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        position: "absolute",
        top: 27,
        left: 35,
        zIndex: 1
    },
    backIcon: { width: 15, height: 15, marginRight: 8 },
    backText: { fontSize: fontPixel(16), color: "#fff", fontFamily: FONTS.tenonBoldFont, top: -1 },
});