import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ImageBackground,
} from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  requestPermission,
} from '@react-native-firebase/messaging';
import { Images } from '../theme/AssetsUrl';
import { DefaultStyle } from '../theme/styles/DefaultStyle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/MainTypes';
import { getData, saveData } from '../utils/storage';
import { getVendorandMealTypes } from '../../helpers/Services/mater';
import { useDispatch } from 'react-redux';
import {
  setMealData,
  setPlatFormFeesData,
  setVendorData,
} from '../store/Slices/ventorAndMealSlice';
import { FONTS } from '../theme/FontsLink';
import LinearGradient from 'react-native-linear-gradient';
import { fontPixel, heightPixel, widthPixel } from '../utils/responsive';
import { getUserTotalSavings } from '../../helpers/Services/userProfile';
import { totalSavingReducer } from '../store/Slices/totalSavingSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDeviceToken } from '../../helpers/Services/personal';

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SplashScreen'
>;

const SplashScreen: React.FC = () => {
  const progress = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const messaging = getMessaging();

  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(async () => {
      const userToken = await getData('userData');
      navigation.replace(userToken ? 'AppNavigation' : 'AuthNavigation');
    });
  }, [progress, navigation]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  useEffect(() => {
    getUserTotalSavingsFunction();
    getVendorandMealTypesFunction();
    handleFcmTokenFunction();
  }, []);

  const getUserTotalSavingsFunction = async () => {
    await AsyncStorage.removeItem('CartDataArray');
    await AsyncStorage.setItem('vendorType', 'Restaurant');
    const userData = await getData('userData');
    if (!userData) return;
    let payload = {
      userId: userData?.userID,
    };
    await getUserTotalSavings(payload).then(response => {
      if (response?.succeeded) {
        dispatch(totalSavingReducer(response?.data));
      }
    });
  };

  async function getVendorandMealTypesFunction() {
    await getVendorandMealTypes().then(response => {
      if (response?.succeeded) {
        const { vendorTypes, mealTypes, platformFee } = response?.data;
        dispatch(setVendorData(vendorTypes));
        dispatch(setMealData(mealTypes));
        dispatch(setPlatFormFeesData(platformFee));
      }
    });
  }

  function handleFcmTokenFunction() {
    if (Platform.OS == 'android') {
      getFCMToken();
    } else {
      requestUserPermission();
    }
  }

  const requestUserPermission = async () => {
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFCMToken();
    }
  };

  const getFCMToken = async () => {
    const fcmToken = await getToken(messaging);
    const userData = await getData('userData');
    // console.log(fcmToken);
    saveData('fcmToken', fcmToken);
    if (userData) {
      let payload = {
        userID: userData?.userID,
        userDeviceToken: fcmToken,
        userDeviceType: Platform.OS == 'android' ? 'Android' : 'IOS',
      };
      await updateDeviceToken(payload).then(response => {
        console.log("fcm call",response);
      });
    }
  };

  return (
    <LinearGradient colors={['#264941', '#264941']} style={styles.container}>
      <ImageBackground
        source={Images.LogoBg}
        style={{
          height: heightPixel(450),
          width: widthPixel(450),
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '15%',
        }}
        resizeMode="contain"
        tintColor={'#23302A'}
      >
        <View style={styles.logoContainer}>
          <Image
            source={Images.AppLogo}
            style={DefaultStyle.imageSize}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>Don't Waste It — Taste It!</Text>
        <Text style={styles.subtitleText}>Save up to 70% on meals</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </View>
      <View
        style={{
          height: heightPixel(200),
          width: widthPixel(200),
          position: 'absolute',
          bottom: -40,
          right: -40,
        }}
      >
        <Image
          source={Images.BottomCircle}
          style={DefaultStyle.imageSize}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    width: heightPixel(335),
    height: widthPixel(335),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleText: {
    fontSize: fontPixel(26),
    fontFamily: FONTS.tenonMediumFont,
    color: '#fff',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonRegularFont,
    color: '#fff',
  },
  progressContainer: {
    alignItems: 'center',
    width: '80%',
  },
  progressBackground: {
    width: '100%',
    height: 10,
    borderRadius: 10,
    backgroundColor: '#23302A',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#20715E',
  },
  loadingText: {
    color: '#777777',
    fontSize: 14,
  },
});
