import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Pressable,
  Image,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icons, Images } from '../../theme/AssetsUrl';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import {
  DrawerActions,
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { FONTS } from '../../theme/FontsLink';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/MainTypes';
import {
  DrawerNavigationProp,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigation';
import { getOrderByOrderIdApi } from '../../../helpers/Services/order';
import { useDispatch, useSelector } from 'react-redux';
import { setMealDataList } from '../../store/Slices/mealQuantitySlice';
import { openGoogleMap } from '../../utils/openGoogleMap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addApiCartReducer } from '../../store/Slices/addToCartSlice';
import { RootState } from '../../store/rootReducer';
import { IMG_URL } from '../../../config';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import Skeleton from '../../component/Skeleton/Skeleton';
import { getData } from '../../utils/storage';
import { getUserTotalSavings } from '../../../helpers/Services/userProfile';
import { totalSavingReducer } from '../../store/Slices/totalSavingSlice';

type CheckoutNavigationProp = DrawerNavigationProp<
  DrawerParamList,
  'OrderConfirmationScreen'
>;
type Props = DrawerScreenProps<DrawerParamList, 'OrderConfirmationScreen'>;

const OrderConfirmationScreen: React.FC<Props> = ({ route }) => {
  const { orderID } = route?.params;
  const navigation = useNavigation<CheckoutNavigationProp>();
  const dispatch = useDispatch();
  const savedAmountRef = useRef('');
  const grouped: Record<string, any[]> = {};

  const isFocused = useIsFocused();

  const addToCartSelector = useSelector(
    (state: RootState) => state?.mealQuantitySlice?.mealData,
  );
  const vendorTypeData = useSelector(
    (state: RootState) => state?.totalSavingSlice?.vendorTypeData,
  );
  const vendorImageSelector = useSelector(
    (state: RootState) => state?.mealQuantitySlice?.surpriseBoxIdImage,
  );

  const [orderConfirmationDetails, setOrderConfirmationDetails] = useState<any>(
    {},
  );
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    if (isFocused) {
      setLoader(true);
      getOrdersConfirmDetailsByOrderID();
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
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
        dispatch(addApiCartReducer([]));
        dispatch(setMealDataList([]));
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const getOrdersConfirmDetailsByOrderID = async () => {
    await AsyncStorage.removeItem('CartDataArray');
    await AsyncStorage.removeItem('cartIdData');
    let payload = {
      orderID: orderID,
    };
    console.log("order confirm",JSON.stringify(payload));
    
    await getOrderByOrderIdApi(payload)
      .then(async response => {
        setLoader(false);
        if (response?.succeeded) {
          const updatedItems = response?.data?.items.map((item: any) => {
            const matched = vendorImageSelector.find(
              (v: any) => v.surpriseBoxID === item.surpriseBoxID,
            );

            return {
              ...item,
              serviceProviderVendorType:
                matched?.serviceProviderVendorType ?? '',
            };
          });

          for (const item of updatedItems) {
            const surpriseBox = addToCartSelector.find(
              sb => sb.surpriseBoxID === item.surpriseBoxID,
            );
            const newItem = {
              ...item,
              surpriseBoxMealType: surpriseBox?.surpriseBoxMealType || [],
              sbImageURL: surpriseBox?.sbImageURL,
            };
            const key = item.serviceProviderId;
            grouped[key] = grouped[key] || [];
            grouped[key].push(newItem);
          }

          const updatedData = {
            ...response.data,
            groupedItems: grouped,
          };
          setOrderConfirmationDetails(updatedData);
          await getUserTotalSavingsFunction();
        }
      })
      .catch(error => {
        setLoader(false);
      });
  };

  const getUserTotalSavingsFunction = async () => {
    const userData = await getData('userData');
    let payload = {
      userId: userData?.userID,
    };
    await getUserTotalSavings(payload).then(response => {
      if (response?.succeeded) {
        dispatch(totalSavingReducer(response?.data));
      }
    });
  };

  const handleGoToOrders = () => {
    dispatch(addApiCartReducer([]));
    dispatch(setMealDataList([]));
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

  // const handleImageData = (image_url: any, deal: any, vendorTypeData: any) => {
  //   if (!image_url) {
  //     switch (deal) {
  //       case "Non Veg": return Icons.NonVegBoxIcon
  //       case "Veg": return Icons.VegBoxIcon
  //       case "Vegan": return Icons.VeganBoxIcon
  //       case "Sea Food": return Icons.SeaFoodBoxIcon
  //       default:
  //         break;
  //     }
  //   } else {
  //     const normalizedPath = image_url.replace(/\\/g, "/");
  //     return { uri: IMG_URL + normalizedPath };
  //   }
  // };

  const handleImageData = (image_url: any, deal: any, serviceProviderVendorType: any) => {
    if (!image_url) {
      if (deal == "Others") {
        switch (serviceProviderVendorType) {
          case "Bakery": return Icons.BakeryIcon
          case "Grocery": return Icons.GroceryIcon
          case "Butcher": return Icons.ButcherIcon
          default: break;
        }
      } else {
        switch (deal) {
          case "Non Veg": return Icons.NonVegBoxIcon
          case "Veg": return Icons.VegBoxIcon
          case "Vegan": return Icons.VeganBoxIcon
          case "Sea Food": return Icons.SeaFoodBoxIcon
          default:
            break;
        }
      }
    } else {
      const normalizedPath = image_url.replace(/\\/g, "/");
      return { uri: IMG_URL + normalizedPath };
    }
  };

  // const handleImageData = (
  //   image_url: any,
  //   deal: any,
  //   serviceProviderVendorType: any,
  //   surpriseBoxName: any,
  // ) => {
  //   if (image_url) {
  //     const normalizedPath = image_url.replace(/\\/g, '/');
  //     return { uri: IMG_URL + normalizedPath };
  //   }

  //   switch (serviceProviderVendorType) {
  //     case 'Restaurant':
  //       if (surpriseBoxName?.includes('Non Veg')) return Icons.NonVegBoxIcon;
  //       if (surpriseBoxName?.includes('Vegan')) return Icons.VeganBoxIcon;
  //       if (surpriseBoxName?.includes('Veg')) return Icons.VegBoxIcon;
  //       if (surpriseBoxName?.includes('Sea Food')) return Icons.SeaFoodBoxIcon;
  //       return Icons.SeaFoodBoxIcon;

  //     case 'Bakery':
  //       return Icons.BakeryIcon;

  //     case 'Grocery':
  //       return Icons.GroceryIcon;

  //     case 'Butcher':
  //       return Icons.ButcherIcon;

  //     default:
  //       return Icons.SeaFoodBoxIcon;
  //   }
  // };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
    // navigation.navigate("DrawerNavigation", {
    //   screen: "HomeScreen",
    //   params: { screen: "Orders" },
    // });
  };

  const handlePriceCalculation = (key: string) => {
    if (
      !Array.isArray(orderConfirmationDetails?.items) ||
      orderConfirmationDetails?.items.length === 0
    ) {
      return 'AED 0.00';
    }

    const actualTotal = orderConfirmationDetails?.items.reduce(
      (sum: any, item: any) =>
        sum + (item.actualPrice || 0) * (item.quantity || 0),
      0,
    );

    const discountedTotal = orderConfirmationDetails?.items.reduce(
      (sum: any, item: any) =>
        sum + (item.discountedPrice || 0) * (item.quantity || 0),
      0,
    );

    switch (key) {
      case 'offer': {
        const savedAmount =
          actualTotal -
          discountedTotal +
          orderConfirmationDetails?.discountAmount;
        savedAmountRef.current = savedAmount.toFixed(2);
        return `Woohoo! AED ${savedAmount.toFixed(2)} saved — smart shopping!`;
      }

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#264941', '#264941']} style={{ flex: 1 }}>
        {/* <StatusBar barStyle="light-content" backgroundColor="#264941" /> */}
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1 }}
          resizeMode="contain"
          imageStyle={{ tintColor: '#23302A' }}
        >
          <View style={styles.headerNav}>
            <Pressable style={styles.header} onPress={() => handleOpenDrawer()}>
              <Image
                source={Icons.MenuIcon}
                resizeMode="contain"
                style={{
                  height: heightPixel(20),
                  width: widthPixel(20),
                  marginRight: 10,
                }}
              />
              <Text style={styles.headerTitle}>Order Confirmation</Text>
            </Pressable>
            <Pressable onPress={() => handleGoToOrders()}>
              <Image
                source={Icons.HomeIcon}
                resizeMode="contain"
                style={{ height: heightPixel(27), width: widthPixel(27) }}
                tintColor={'#fff'}
              />
            </Pressable>
          </View>
          {/* Main Content Overlay */}
          {loader ? (
            <View style={styles.contentContainer}>
              <Skeleton />
            </View>
          ) : (
            <View style={styles.contentContainer}>
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
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Success Icon & Text */}
                <View style={styles.successSection}>
                  <View>
                    <Image
                      source={Icons.SelectedLargeIcon}
                      resizeMode="contain"
                      style={{ height: heightPixel(70), width: widthPixel(70) }}
                    />
                  </View>
                  <View style={{ marginTop: 10, alignItems: 'center' }}>
                    <Text style={styles.successTitle}>
                      Order Placed Successfully
                    </Text>
                    <Text style={styles.transactionText}>
                      Transaction ID: {orderConfirmationDetails?.transactionID}
                    </Text>
                  </View>
                </View>

                <Text style={styles.orderNumber}>
                  Order #: {orderConfirmationDetails?.orderID}
                </Text>

                {/* Card 1: Veg & Vegan */}
                <View>
                  {Object.entries(
                    orderConfirmationDetails?.groupedItems || {},
                  ).map(entry => {
                    const providerName = entry[0];
                    const items = entry[1] as any[];
                    return (
                      <View key={providerName} style={styles.card}>
                        {items.map((item: any, index: number) => {
                          return (
                            <Pressable
                              key={index}
                              onPress={() =>
                                navigation.navigate(
                                  'PickupConfirmationScreen',
                                  {
                                    orderId: orderConfirmationDetails?.id,
                                    totalAmount:
                                      item?.unitPrice * item?.quantity,
                                    serviceProviderId: item?.serviceProviderId,
                                    orderNumber:
                                      orderConfirmationDetails?.orderID,
                                    savedAmount: savedAmountRef.current,
                                    transactionID: null,
                                    routeId: 2,
                                  },
                                )
                              }
                            >
                              {index == 0 && (
                                <View style={styles.cardHeader}>
                                  <View style={styles.timeContainer}>
                                    <Image
                                      source={Icons.TimingIcon}
                                      resizeMode="contain"
                                      style={{
                                        height: heightPixel(16),
                                        width: widthPixel(16),
                                      }}
                                    />
                                    <Text
                                      style={styles.timeText}
                                    >{`${item.collectionFromTime}`}</Text>
                                    {item?.timeFromAMPM != item?.timeToAMPM ? (
                                      <Text style={styles.timeText}>
                                        {`${item?.timeFromAMPM}`} -
                                      </Text>
                                    ) : (
                                      <Text style={styles.timeText}>-</Text>
                                    )}
                                    <Text style={styles.timeText}>
                                      {`${item.collectionToTime}`}{' '}
                                      {item.timeToAMPM}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Image
                                      source={Icons.ArrowGreenIcon}
                                      resizeMode="contain"
                                      style={{
                                        height: heightPixel(15),
                                        width: widthPixel(10),
                                      }}
                                      tintColor={'#9D9D9D'}
                                    />
                                    <Image
                                      source={Icons.ArrowGreenIcon}
                                      resizeMode="contain"
                                      style={{
                                        height: heightPixel(15),
                                        width: widthPixel(10),
                                      }}
                                      tintColor={'#9D9D9D'}
                                    />
                                  </View>
                                </View>
                              )}
                              {/* Item Row */}
                              <View
                                style={[
                                  styles.itemRow,
                                  index < items.length - 1 && {
                                    borderBottomWidth: 1,
                                    marginBottom: 8,
                                    borderBottomColor: '#DDDDDD',
                                  },
                                ]}
                              >
                                <View style={styles.boxWhiteInner}>
                                  <Image
                                    source={handleImageData(
                                      item?.sbImageURL,
                                      item?.surpriseBoxMealType[0]?.mealType,
                                      item?.serviceProviderVendorType,
                                      // item?.surpriseBoxName,
                                    )}
                                    resizeMode="contain"
                                    style={{
                                      height: heightPixel(72),
                                      width: widthPixel(72),
                                    }}
                                  />
                                  {/* <Image source={Icons.NonVegBoxIcon} resizeMode="contain" style={{ height: heightPixel(72), width: widthPixel(72) }} /> */}
                                </View>
                                <View style={styles.itemDetails}>
                                  <Text style={styles.itemTitle}>
                                    {item?.surpriseBoxName?.length > 18
                                      ? item?.surpriseBoxName?.slice(0, 18) +
                                        '...'
                                      : item?.surpriseBoxName}
                                  </Text>

                                  <View style={styles.priceRow}>
                                    <Text style={styles.oldPrice}>
                                      AED {item?.actualPrice * item?.quantity}
                                    </Text>
                                    <Text style={styles.newPrice}>
                                      AED{' '}
                                      {item?.discountedPrice * item?.quantity}
                                    </Text>
                                    <Text style={styles.discountText}>
                                      {item?.discountedPercent}% OFF
                                    </Text>
                                  </View>

                                  <Text
                                    style={styles.qtyText}
                                  >{`QTY: ${item?.quantity}`}</Text>
                                </View>
                              </View>

                              {/* Footer for last item only */}
                              {index === items.length - 1 && (
                                <View
                                  style={{
                                    width: '77%',
                                    alignSelf: 'flex-end',
                                    marginBottom: 5,
                                  }}
                                >
                                  <View style={styles.cardFooter}>
                                    <Pressable
                                      style={styles.actionButton}
                                      onPress={() =>
                                        openGoogleMap(
                                          item?.latitude,
                                          item?.longitude,
                                        )
                                      }
                                    >
                                      <Image
                                        source={Icons.DistanceIcon}
                                        resizeMode="contain"
                                        style={{
                                          height: heightPixel(21),
                                          width: widthPixel(21),
                                        }}
                                        tintColor={'#264941'}
                                      />
                                      <Text style={styles.actionText}>
                                        Get Direction
                                      </Text>
                                    </Pressable>
                                    {item?.deliveryStatus == 'Pending' ? (
                                      <Text
                                        style={[
                                          styles.statusPickedUp,
                                          {
                                            color: '#D34D40',
                                          },
                                        ]}
                                      >
                                        {item?.deliveryStatus}
                                      </Text>
                                    ) : (
                                      <View style={styles.statusContainer}>
                                        <Image
                                          source={
                                            item?.deliveryStatus == 'Ready'
                                              ? Icons.ReadyPickUpIcon
                                              : Icons.PickedUpIcon
                                          }
                                          resizeMode="contain"
                                          style={{
                                            height: heightPixel(14),
                                            width: widthPixel(14),
                                          }}
                                          tintColor={
                                            item?.deliveryStatus == 'Ready'
                                              ? '#FF9D00'
                                              : '#109D7D'
                                          }
                                        />
                                        <Text
                                          style={[
                                            styles.statusPickedUp,
                                            {
                                              color:
                                                item?.deliveryStatus == 'Ready'
                                                  ? '#FF9D00'
                                                  : '#109D7D',
                                            },
                                          ]}
                                        >
                                          {item?.deliveryStatus}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>

                {/* Savings Banner */}
                {/* <View style={styles.savingsBanner}>
                    <Text style={styles.savingsText}>
                      {handlePriceCalculation("offer")}
                    </Text>
                  </View> */}
                <View style={styles.cardAmount}>
                  <View style={styles.leftRow}>
                    <Text style={styles.paidText}>
                      {orderConfirmationDetails?.paymentStatus}
                    </Text>
                    <Text style={styles.methodText}>
                      ({orderConfirmationDetails?.paymentMode})
                    </Text>
                  </View>

                  <Text
                    style={styles.amountText}
                  >{`AED ${orderConfirmationDetails?.totalAmount}`}</Text>
                </View>
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          )}
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    // marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 15,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 30,
    paddingLeft: 10,
    paddingRight: 10,
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  successIconCircle: {
    backgroundColor: '#00a69c',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: fontPixel(24),
    fontFamily: FONTS.tenonMediumFont,
    color: '#264941',
    marginBottom: 5,
  },
  transactionText: {
    color: '#109D7D',
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
    fontSize: fontPixel(20),
  },
  orderNumber: {
    // marginLeft: 20,
    color: '#666666',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 15,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#eee',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#666666',
    marginLeft: 5,
    fontSize: fontPixel(14),
    fontFamily: FONTS.tenonMediumFont,
  },
  itemRow: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  itemDetails: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
    color: '#2E2E2E',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 5,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#9D9D9D',
    marginRight: 13,
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  newPrice: {
    color: '#2E2E2E',
    marginRight: 8,
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  discountText: {
    color: '#666666',
    fontSize: fontPixel(14),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  qtyText: {
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
    color: '#2E2E2E',
    fontSize: fontPixel(18),
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#264941',
    fontFamily: FONTS.tenonMediumFont,
    marginLeft: 5,
    fontSize: fontPixel(16),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPickedUp: {
    color: '#109D7D',
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonBoldFont,
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
    marginBottom: 10,
  },
  savingsText: {
    color: '#264941',
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },

  // Styling for the Custom Box Icon (Simulating the image)
  boxImageContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxOutline: {
    width: 50,
    height: 40,
    borderWidth: 2,
    borderRadius: 4,
    marginTop: 10,
    position: 'relative',
  },
  boxFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 15,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxWhiteInner: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    borderRightWidth: 1,
    borderRightColor: '#dddddd',
    paddingRight: 10,
  },
  boxLid: {
    position: 'absolute',
    top: 5,
    left: -4,
    right: -4,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: 'transparent',
    // The visual trick for the open lid look is complex in pure CSS/RN views,
    // this is a simplified approximation.
  },
  boxHandle: {
    position: 'absolute',
    top: -6,
    left: 12,
    right: 12,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 10,
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
});

export default OrderConfirmationScreen;
