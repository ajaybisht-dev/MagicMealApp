import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageBackground,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Linking,
} from 'react-native';
import { Icons, Images } from '../../theme/AssetsUrl';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  DrawerNavigationProp,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigation';
import { useDispatch, useSelector } from 'react-redux';
import StarRatingComponent from '../../component/StarRatingComponent';
import language_data_json from '../../JSON/language.json';
import LinearGradient from 'react-native-linear-gradient';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { FONTS } from '../../theme/FontsLink';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import { openGoogleMap } from '../../utils/openGoogleMap';
import OrderDetailsCart from '../../component/CommonComponent/OrderDetailsCart';
import FeedbackModal from '../../component/CommonComponent/FeedbackModal';
import {
  getServiceProviderOrderItems,
  updateOrderPickStatus,
} from '../../../helpers/Services/order';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Skeleton from '../../component/Skeleton/Skeleton';
import PickupConfirmationModal from '../../component/CommonComponent/ConfimationModal';
import { addApiCartReducer } from '../../store/Slices/addToCartSlice';
import { setMealDataList } from '../../store/Slices/mealQuantitySlice';
import { submitServiceProviderRating } from '../../../helpers/Services/surprise_box';
import CustomToast from '../../component/CustomToast';
import { RootState } from '../../store/rootReducer';

type Props = DrawerScreenProps<DrawerParamList, 'PickupConfirmationScreen'>;
type PickUpNavigationProp = DrawerNavigationProp<
  DrawerParamList,
  'OrderPickUpStack'
>;

type AppItems = {
  Filter: string;
  CustomerReview: string;
  NoReview: string;
  Quality: string;
  Quantity: string;
  Taste: string;
  ViewAllReviews: string;
  Checkout: string;
};

type OtherItems = {
  NoRestaurantFoundWithIn: string;
  KM: string;
  ChangeRadius: string;
};

type LanguageMap = {
  en: { app_items: AppItems; other_items: OtherItems };
  ar: { app_items: AppItems; other_items: OtherItems };
};

type SupportedLang = keyof LanguageMap; // "en" | "ar"

const language_data = language_data_json as LanguageMap;

const { width: windowWidth } = Dimensions.get('window');

type SwipeProps = {
  onConfirm: () => void;
  disabled?: boolean;
  resetTrigger: number;
};

const SwipeToConfirm: React.FC<SwipeProps> = ({
  onConfirm,
  disabled,
  resetTrigger,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [confirmed, setConfirmed] = useState(false);

  const MAX_X = Dimensions.get('window').width - 100;

  const textOpacity = pan.interpolate({
    inputRange: [0, MAX_X],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.timing(pan, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setConfirmed(false);
    });
  }, [resetTrigger]);

  useEffect(() => {
    if (disabled && !confirmed) {
      Animated.timing(pan, {
        toValue: MAX_X,
        duration: 150,
        useNativeDriver: false,
      }).start(() => setConfirmed(true));
    }
  }, [disabled]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !confirmed && !disabled,

      onPanResponderMove: (_, g) => {
        if (confirmed || disabled) return;
        const x = Math.max(0, Math.min(g.dx, MAX_X));
        pan.setValue(x);
      },

      onPanResponderRelease: () => {
        pan.stopAnimation(x => {
          if (x >= MAX_X * 0.9) {
            Animated.timing(pan, {
              toValue: MAX_X,
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              setConfirmed(true);
              onConfirm();
            });
          } else {
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          }
        });
      },
    }),
  ).current;

  return (
    <View style={[styles.swipeContainer, disabled && { opacity: 0.7 }]}>
      <Animated.View
        style={[styles.swipeButton, { transform: [{ translateX: pan }] }]}
        {...(!confirmed && !disabled ? panResponder.panHandlers : {})}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={Icons.ArrowGreenIcon}
            style={{ width: 11, height: 20 }}
          />
          <Image
            source={Icons.ArrowGreenIcon}
            style={{ width: 11, height: 20 }}
          />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.swipeText, { opacity: textOpacity }]}>
        {'Swipe To Confirm Pickup'}
      </Animated.Text>
    </View>
  );
};

const PickupConfirmationScreen: React.FC<Props> = ({ route }) => {
  const orderId = route?.params?.orderId ?? null;
  const routeId = route?.params?.routeId ?? null;
  const serviceProviderId = route?.params?.serviceProviderId ?? null;
  const orderNumber = route?.params?.orderNumber ?? null;
  const transactionID = route?.params?.transactionID ?? null;
  const navigation = useNavigation<PickUpNavigationProp>();

  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>('en');
  const [serviceProviderData, setServiceProviderData] = useState<any>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [loader, setLoader] = useState(true);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [savedAmount, setSavedAmount] = useState<any>('');
  const [showConfirmationToast, setShowConfimationToast] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetSwipeCounter, setResetSwipeCounter] = useState(0);

  const AppLabels = language_data[selectedLanguage].app_items;
  const OtherLabels = language_data[selectedLanguage].other_items;
  const vendorImageSelector = useSelector(
    (state: RootState) => state?.mealQuantitySlice?.surpriseBoxIdImage,
  );

  useEffect(() => {
    if (isFocused) {
      setLoader(true);
      getOrderPickedUpStatusFunction();
    }
  }, [isFocused]);

  const getOrderPickedUpStatusFunction = async () => {
    let user_id = await AsyncStorage.getItem('user_id');
    let payload = {
      orderID: orderId,
      serviceProviderID: serviceProviderId,
      userID: user_id,
    };
    await getServiceProviderOrderItems(payload).then(response => {
      setLoader(false);
      if (response?.succeeded) {
        const updatedItems = response?.data.items.map((item: any) => ({
          ...item,
          totalPrice: +(item.unitPrice * item.quantity).toFixed(2),
        }));
        const itemsTotalPrice = +updatedItems
          .reduce((sum: any, item: any) => sum + item.totalPrice, 0)
          .toFixed(2);

        const actualTotal = response?.data?.items.reduce(
          (sum: any, item: any) =>
            sum + (item.actualPrice || 0) * (item.quantity || 0),
          0,
        );

        const discountedTotal = response?.data?.items.reduce(
          (sum: any, item: any) =>
            sum + (item.discountedPrice || 0) * (item.quantity || 0),
          0,
        );
        const savedAmount = actualTotal - discountedTotal;
        setSavedAmount(
          `Woohoo! AED ${savedAmount.toFixed(2)} saved — smart shopping!`,
        );
        const updatedItemsData = response?.data?.items.map((item: any) => {
          const matched = vendorImageSelector.find(
            (v: any) => v.surpriseBoxID === item.surpriseBoxID,
          );

          return {
            ...item,
            // serviceProviderVendorType: matched?.serviceProviderVendorType ?? '',
          };
        });
        const updatedData = {
          ...response.data,
          items: updatedItemsData,
        };

        setTotalAmount(itemsTotalPrice);
        setServiceProviderData(updatedData);
      }
    });
  };

  const handleGoToOrders = () => {
    if (routeId == 2) {
      dispatch(addApiCartReducer([]));
      dispatch(setMealDataList([]));
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'DrawerNavigation',
          state: {
            index: 0,
            routes: [
              {
                name: 'HomeScreen',
                params: { screen: 'Orders' },
              },
            ],
          },
        },
      ],
    });
  };

  const confirmPickupApi = async () => {
    let payload = {
      orderID: orderId,
      serviceProviderID: serviceProviderId,
      pickStatus: 'Picked Up',
    };
    await updateOrderPickStatus(payload).then(async response => {
      if (response?.succeeded) {
        await getOrderPickedUpStatusFunction();
      }
    });
  };

  const handleSubmitServiceProviderRatingFunction = async (data: any) => {
    let user_id = await AsyncStorage.getItem('user_id');
    const ratings = data?.ratings ?? {};

    const keys = Object.keys(ratings);
    if (keys.length < 1) {
      setIsSuccess(false);
      setToastMessage('Please provide at least one rating.');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return;
    }

    for (const key of keys) {
      const value = ratings[key];

      if (!value || value < 1 || value > 5) {
        setIsSuccess(false);
        setToastMessage('All ratings must be between 1 and 5.');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
        return;
      }
    }
    let payload = {
      orderID: orderId,
      serviceProviderID: serviceProviderId,
      userID: user_id,
      quantityRating: ratings.quantityRating || 0,
      qualityRating: ratings.qualityRating || 0,
      tasteRating: ratings.tasteRating || 0,
      freshnessRating: ratings.freshnessRating || 0,
      packagingRating: ratings.packagingRating || 0,
      reviewComments: data?.comment,
    };
    await submitServiceProviderRating(payload).then(async response => {
      if (response?.succeeded) {
        await AsyncStorage.removeItem('vendorType');
        setIsSuccess(true);
        setToastMessage(response?.messages?.[0]);
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      } else {
        setIsSuccess(false);
        setToastMessage(response?.messages?.[0]);
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      }
    });
  };

  const helperFunction = (
    fromTime?: string,
    fromAMPM?: 'AM' | 'PM',
    toTime?: string,
    toAMPM?: 'AM' | 'PM',
  ) => {
    if (!fromTime || !fromAMPM || !toTime || !toAMPM) {
      return false;
    }

    const now = new Date();

    const parseTime = (time: string, ampm: 'AM' | 'PM') => {
      const [h, m] = time.split(':').map(Number);
      let hour = h;

      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;

      const d = new Date();
      d.setHours(hour, m, 0, 0);
      return d;
    };

    const fromDate = parseTime(fromTime, fromAMPM);
    const toDate = parseTime(toTime, toAMPM);

    return now >= fromDate && now <= toDate ? true : false;
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#264941', '#264941']} style={{ flex: 1 }}>
        {showToast && (
          <CustomToast message={toastMessage} isSuccess={isSuccess} />
        )}
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1, marginTop: '5%' }}
          resizeMode="contain"
          tintColor={'#23302A'}
        >
          <View style={{ paddingLeft: '3%', paddingRight: '3%' }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Pressable
                style={styles.header}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={Icons.BackIcon}
                  resizeMode="contain"
                  style={{ height: heightPixel(20), width: widthPixel(20) }}
                />
                {loader ? null : (
                  <Text style={styles.headerTitle}>
                    {serviceProviderData?.serviceProviderName?.length > 20
                      ? serviceProviderData?.serviceProviderName.slice(0, 20)
                      : serviceProviderData?.serviceProviderName}
                  </Text>
                )}
              </Pressable>
              <Pressable onPress={() => handleGoToOrders()}>
                <Image
                  source={Icons.HomeIcon}
                  style={styles.CartIcon}
                  resizeMode="contain"
                  tintColor={'#fff'}
                />
              </Pressable>
            </View>
            {loader ? null : (
              <View style={styles.reviewSection}>
                <Pressable
                  style={styles.rowBetween}
                  onPress={() =>
                    navigation.navigate('OrderPickUpStack', {
                      screen: 'AllReviews',
                      params: {
                        serviceProviderId: serviceProviderId,
                        serviceProviderName:
                          serviceProviderData?.serviceProviderName,
                        latitude: serviceProviderData?.latitude,
                        longitude: serviceProviderData?.longitude,
                        serviceProviderAddress:
                          serviceProviderData?.serviceProviderAddress,
                        collectionFromTime:
                          serviceProviderData?.items?.[0]?.collectionFromTime,
                        collectionToTime:
                          serviceProviderData?.items?.[0]?.collectionToTime,
                        timeFromAMPM:
                          serviceProviderData?.items?.[0]?.timeFromAMPM,
                        timeToAMPM: serviceProviderData?.items?.[0]?.timeToAMPM,
                        distance: serviceProviderData?.distanceInKm,
                      },
                    })
                  }
                >
                  <StarRatingComponent
                    rating={serviceProviderData?.rating}
                    onChange={newRating => console.log(newRating)}
                    color="#FFB800"
                    size={18}
                    readOnly={true}
                    showText={false}
                  />
                  <View>
                    <Text style={styles.reviewRating}>
                      {`${serviceProviderData?.reviewCount
                          ? `${serviceProviderData?.reviewCount} ${serviceProviderData?.reviewCount > 1
                            ? 'reviews'
                            : 'review'
                          }`
                          : ``
                        }`}
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.reviewRow}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={Icons.LocationIcon}
                      style={styles.LocationIcon}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: '#fff',
                        fontSize: fontPixel(15),
                        fontFamily: FONTS.tenonMediumFont,
                      }}
                    >
                      {serviceProviderData?.serviceProviderAddress?.length > 13
                        ? serviceProviderData?.serviceProviderAddress.slice(
                          0,
                          13,
                        ) + '...'
                        : serviceProviderData?.serviceProviderAddress}
                    </Text>
                    <Text
                      style={{
                        marginLeft: 5,
                        color: '#fff',
                        fontSize: fontPixel(15),
                        fontFamily: FONTS.tenonMediumFont,
                      }}
                    >
                      ({serviceProviderData?.distanceInKm} km far)
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      openGoogleMap(
                        serviceProviderData?.latitude,
                        serviceProviderData?.longitude,
                        serviceProviderData?.serviceProviderAddress,
                      )
                    }
                  >
                    <Text style={styles.directionStyle}>{'Get Direction'}</Text>
                    <View style={styles.underline} />
                  </Pressable>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: '3%',
                    marginLeft: 3,
                  }}
                >
                  <Image
                    source={Icons.TimingIcon}
                    style={styles.LocationIcon}
                    resizeMode="contain"
                    tintColor={'#fff'}
                  />
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 10,
                    }}
                  >
                    <Text style={styles.timeStyle}>
                      {serviceProviderData?.items[0]?.collectionFromTime}
                    </Text>
                    {serviceProviderData?.items[0]?.timeFromAMPM !=
                      serviceProviderData?.items[0]?.timeToAMPM ? (
                      <Text style={styles.timeStyle}>
                        {' '}
                        {serviceProviderData?.items[0]?.timeFromAMPM} -
                      </Text>
                    ) : (
                      <Text style={styles.timeStyle}> -</Text>
                    )}
                    <Text style={styles.timeStyle}>
                      {' '}
                      {serviceProviderData?.items[0]?.collectionToTime}{' '}
                      {serviceProviderData?.items[0]?.timeToAMPM}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              overflow: 'hidden',
              paddingLeft: '3%',
              paddingRight: '3%',
              paddingTop: 30,
              flex: 1,
            }}
          >
            <View
              style={{
                height: 185,
                width: 185,
                position: 'absolute',
                bottom: -40,
                right: -40,
              }}
            >
              <Image
                source={Images.BottomCircle}
                style={DefaultStyle.imageSize}
                resizeMode="contain"
                tintColor={'#F4F4F4'}
              />
            </View>
            {transactionID && (
              <Text
                style={[
                  styles.orderNumber,
                  { alignSelf: 'center', marginBottom: 10, color: '#109D7D' },
                ]}
              >
                Transaction ID: {transactionID}
              </Text>
            )}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <Text style={styles.orderNumber}>Order #: {orderNumber}</Text>
              {serviceProviderData?.items[0]?.deliveryStatus == 'Pending' ? (
                <Text
                  style={[
                    styles.statusPickedUp,
                    {
                      color: '#D34D40',
                    },
                  ]}
                >
                  {serviceProviderData?.items[0]?.deliveryStatus}
                </Text>
              ) : (
                <View style={styles.statusContainer}>
                  <Image
                    source={
                      serviceProviderData?.items[0]?.deliveryStatus == 'Ready'
                        ? Icons.ReadyPickUpIcon
                        : Icons.PickedUpIcon
                    }
                    resizeMode="contain"
                    style={{ height: heightPixel(19), width: widthPixel(19) }}
                    tintColor={
                      serviceProviderData?.items[0]?.deliveryStatus == 'Ready'
                        ? '#FF9D00'
                        : '#109D7D'
                    }
                  />
                  <Text
                    style={[
                      styles.statusPickedUp,
                      {
                        color:
                          serviceProviderData?.items[0]?.deliveryStatus ==
                            'Ready'
                            ? '#FF9D00'
                            : '#109D7D',
                      },
                    ]}
                  >
                    {serviceProviderData?.items[0]?.deliveryStatus}
                  </Text>
                </View>
              )}
            </View>
            {loader ? (
              <Skeleton />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingBottom: 160,
                }}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 15,
                    borderTopLeftRadius: 0,
                    borderColor: '#eee',
                    backgroundColor: '#fff',
                    marginBottom: 15,
                    paddingBottom: 10,
                  }}
                >
                  {serviceProviderData?.items?.map((item: any, index: any) => {
                    return (
                      <View
                        key={index}
                        style={{
                          borderBottomWidth:
                            index == serviceProviderData?.items?.length - 1
                              ? 0
                              : 1,
                          borderColor: '#eee',
                          width: '90%',
                          alignSelf: 'center',
                        }}
                      >
                        <OrderDetailsCart serviceProviderData={item} />
                      </View>
                    );
                  })}
                  {/* <Pressable style={styles.statusContainer}>
                    <Image source={serviceProviderData?.items[0]?.deliveryStatus == "Ready" ? Icons.ReadyPickUpIcon : Icons.PickedUpIcon} resizeMode="contain" style={{ height: heightPixel(19), width: widthPixel(19) }} tintColor={serviceProviderData?.items[0]?.deliveryStatus == "Ready" ? "#FF9D00" : "#109D7D"} />
                    <Text style={[styles.statusPickedUp, { color: serviceProviderData?.items[0]?.deliveryStatus == "Ready" ? "#FF9D00" : "#109D7D" }]}>{serviceProviderData?.items[0]?.deliveryStatus}</Text>
                  </Pressable> */}
                </View>
                {/* <View style={styles.savingsBanner}>
                  <Text style={styles.savingsText}> {savedAmount}</Text>
                </View> */}
                {/* <View style={styles.cardAmount}>
                  <View style={styles.leftRow}>
                    <Text style={styles.paidText}>{"Paid"}</Text>
                    <Text style={styles.methodText}>({serviceProviderData?.paymentMode})</Text>
                  </View>
                  <Text style={styles.amountText}>{`AED ${totalAmount}`}</Text>
                </View> */}
                <Pressable
                  onPress={() =>
                    handleCall(serviceProviderData?.items[0]?.vendorContactNo)
                  }
                  style={{
                    borderWidth: 2,
                    borderColor: '#2F7C32',
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={Icons.CallIcon}
                    style={{ height: heightPixel(34), width: widthPixel(34) }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: '#2F7C32',
                      fontSize: fontPixel(22),
                      fontFamily: FONTS.tenonMediumFont,
                      marginLeft: 15,
                    }}
                  >
                    Call Restaurants
                  </Text>
                </Pressable>
                {serviceProviderData?.splIns && (
                  <View style={{ marginLeft: 10, marginTop: 20 }}>
                    <Text
                      style={{
                        color: '#264941',
                        fontSize: fontPixel(20),
                        fontFamily: FONTS.tenonMediumFont,
                        marginBottom: 10,
                      }}
                    >
                      Special Instruction
                    </Text>
                    <Text
                      style={{
                        color: '#666666',
                        fontSize: fontPixel(16),
                        fontFamily: FONTS.tenonMediumFont,
                        marginBottom: 0,
                      }}
                    >
                      {serviceProviderData?.splIns}
                    </Text>
                  </View>
                )}
                <View>
                  <View
                    style={{
                      marginTop: 20,
                      marginLeft: 10,
                      marginBottom: 40,
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Image
                        source={Icons.ImportantIcon}
                        style={styles.important}
                        resizeMode="contain"
                        tintColor={'#264941'}
                      />
                      <View>
                        <Text
                          style={{
                            color: '#264941',
                            fontSize: fontPixel(20),
                            fontFamily: FONTS.tenonMediumFont,
                            marginBottom: 10,
                          }}
                        >
                          Important
                        </Text>
                        <Text
                          style={{
                            color: '#666666',
                            fontSize: fontPixel(16),
                            fontFamily: FONTS.tenonMediumFont,
                            marginBottom: 10,
                          }}
                        >
                          • Arrive during pickup window
                        </Text>
                        <Text
                          style={{
                            color: '#666666',
                            fontSize: fontPixel(16),
                            fontFamily: FONTS.tenonMediumFont,
                          }}
                        >
                          • Swipe to confirm pickup in app
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* <Pressable style={{ alignSelf: "center", borderWidth: 1, paddingVertical: 10, paddingHorizontal: 30, borderRadius: 50 }}>
                      <Text style={{ color: "#264941", fontSize: fontPixel(18), fontFamily: FONTS.tenonMediumFont }}>Cancel Order</Text>
                    </Pressable> */}
                </View>
                {serviceProviderData?.items[0]?.deliveryStatus ==
                  'Pending' ? null : serviceProviderData?.items[0]
                    ?.deliveryStatus == 'Ready' ? (
                  null
                ) : (
                  <View>
                    <Pressable
                      onPress={() => setShowFeedbackModal(true)}
                      style={{
                        alignSelf: 'center',
                        borderWidth: 0,
                        paddingVertical: 10,
                        paddingHorizontal: 30,
                        borderRadius: 50,
                        backgroundColor: '#264941',
                        marginTop: '20%',
                      }}
                    >
                      <Text
                        style={{
                          color: '#ffffff',
                          fontSize: fontPixel(18),
                          fontFamily: FONTS.tenonMediumFont,
                        }}
                      >
                        Share Your Feedback
                      </Text>
                    </Pressable>
                    {/* {routeId == 1 && serviceProviderData?.items[0]
                      ?.deliveryStatus != 'Picked Up' && (
                        <Pressable
                          onPress={() =>
                            navigation.navigate('CheckoutScreen', {
                              surpriseBoxID: '',
                              serviceProviderID: serviceProviderId,
                              routeId: 2,
                            })
                          }
                          style={{
                            alignSelf: 'center',
                            borderWidth: 1,
                            paddingVertical: 5,
                            paddingHorizontal: 30,
                            borderRadius: 50,
                            borderColor: '#264941',
                            marginTop: '8%',
                          }}
                        >
                          <Text
                            style={{
                              color: '#264941',
                              fontSize: fontPixel(18),
                              fontFamily: FONTS.tenonMediumFont,
                            }}
                          >{`View Offer From ${serviceProviderData?.serviceProviderName}`}</Text>
                        </Pressable>
                      )} */}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </ImageBackground>
      </LinearGradient>
      {serviceProviderData?.items[0]?.deliveryStatus === 'Ready' && (
        <SwipeToConfirm
          disabled={serviceProviderData?.items[0]?.deliveryStatus !== 'Ready'}
          resetTrigger={resetSwipeCounter}
          onConfirm={() => setShowConfimationToast(true)}
        />
      )}
      <FeedbackModal
        visible={showFeedbackModal}
        serviceProviderName={serviceProviderData?.serviceProviderName}
        value={
          serviceProviderData?.items[0]?.serviceProviderVendorType as
          | 'Restaurant'
          | 'Bakery'
          | 'Grocery'
          | 'Butcher'
        }
        ratingData={null}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={data => {
          setShowFeedbackModal(false);
          handleSubmitServiceProviderRatingFunction(data);
        }}
      />
      <PickupConfirmationModal
        visible={showConfirmationToast}
        onClose={() => {
          setShowConfimationToast(false);
          setResetSwipeCounter(v => v + 1);
        }}
        onConfirm={async () => {
          const status = helperFunction(
            serviceProviderData?.items?.[0]?.collectionFromTime,
            serviceProviderData?.items?.[0]?.timeFromAMPM,
            serviceProviderData?.items?.[0]?.collectionToTime,
            serviceProviderData?.items?.[0]?.timeToAMPM,
          );
          if (status === false) {
            setResetSwipeCounter(v => v + 1);
            setShowConfimationToast(false);
            setIsSuccess(false);
            let message = `You will not be able to pick up your meal at this time, as your scheduled pickup window is between ${serviceProviderData?.items?.[0]?.collectionFromTime} ${serviceProviderData?.items?.[0]?.timeFromAMPM} and ${serviceProviderData?.items?.[0]?.collectionToTime} ${serviceProviderData?.items?.[0]?.timeToAMPM}.`;
            setToastMessage(message);
            setShowToast(true);

            setTimeout(() => {
              setShowToast(false);
            }, 2000);

            return;
          }
          setShowConfimationToast(false);
          await confirmPickupApi();
        }}
      />
    </View>
  );
};

export default PickupConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 10,
  },
  headerTitle: {
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonBoldFont,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 2,
  },
  reviewSection: {
    marginLeft: 25,
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: fontPixel(16),
    color: '#FFF400',
    marginLeft: 10,
    fontFamily: FONTS.tenonMediumFont,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginLeft: 2,
  },
  CartIcon: {
    width: widthPixel(27),
    height: heightPixel(27),
  },
  LocationIcon: {
    width: widthPixel(18),
    height: heightPixel(18),
  },
  directionStyle: {
    color: '#FFF400',
    fontSize: fontPixel(15),
    fontFamily: FONTS.tenonMediumFont,
  },
  underline: {
    height: 1,
    backgroundColor: '#FFF400',
    width: '100%',
    borderRadius: 2,
  },
  timeStyle: {
    color: '#fff',
    fontSize: fontPixel(15),
    fontFamily: FONTS.tenonMediumFont,
  },
  swipeContainer: {
    position: 'absolute',
    bottom: 20,
    borderRadius: 50,
    backgroundColor: '#264941',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: windowWidth - 37,
    alignSelf: 'center',
  },
  swipeButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 100,
    left: 1,
  },
  swipeText: {
    color: '#FFF',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
  },
  confirmedText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  orderNumber: {
    color: '#666666',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  statusPickedUp: {
    color: '#109D7D',
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    marginLeft: 5,
  },
  statusReady: {
    color: '#FFA726',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  savingsBanner: {
    backgroundColor: '#EBFFFB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  savingsText: {
    color: '#264941',
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  cardAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  paidText: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
    color: '#2E2E2E',
  },

  methodText: {
    fontSize: fontPixel(12),
    color: '#666666',
    fontFamily: FONTS.tenonRegularFont,
    // includeFontPadding : false,
    marginLeft: 4,
  },

  amountText: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    color: '#1A1A2E',
    // textAlignVertical: "center",
    includeFontPadding: false,
  },
  important: {
    height: heightPixel(29),
    width: widthPixel(29),
    marginRight: 5,
  },
});
