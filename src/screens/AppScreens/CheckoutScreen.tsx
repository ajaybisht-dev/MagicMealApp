import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  NativeScrollEvent,
  ImageBackground,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Icons, Images } from '../../theme/AssetsUrl';
import { useNavigation } from '@react-navigation/native';
import {
  DrawerNavigationProp,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigation';
import {
  getAllActiveSurpriseBoxesBySPId,
  getSurpriseBoxDetailsById,
  getSurpriseBoxRatingAndReviews,
} from '../../../helpers/Services/surprise_box';
import { IMG_URL } from '../../../config';
import { useDispatch, useSelector } from 'react-redux';
import { setMealDataList } from '../../store/Slices/mealQuantitySlice';
import { RootState } from '../../store/rootReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VendorListItemComponent from '../../component/VendorListItemComponent';
import StarRatingComponent from '../../component/StarRatingComponent';
import {
  getCartByUserId,
  insertUpdateCart,
} from '../../../helpers/Services/cart';
import CustomToast from '../../component/CustomToast';
import SurpriseBoxCart from '../../component/CommonComponent/SurpriseBoxCart';
import language_data_json from '../../JSON/language.json';
import LinearGradient from 'react-native-linear-gradient';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { FONTS } from '../../theme/FontsLink';
import {
  addApiCartReducer,
  addToCartReducer,
} from '../../store/Slices/addToCartSlice';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import OfferItemSkeleton from '../../component/Skeleton/OfferItemSkeleton';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import { getData } from '../../utils/storage';
import { openGoogleMap } from '../../utils/openGoogleMap';

type Props = DrawerScreenProps<DrawerParamList, 'CheckoutScreen'>;
type CheckoutNavigationProp = DrawerNavigationProp<
  DrawerParamList,
  'CheckoutScreen'
>;

interface SurpriseBoxData {
  sbImageURL: string;
  serviceProviderName: string;
  surpriseBoxName: string;
  actualPrice: number;
  discountedPrice: number;
  discountedPercent: number;
  noOfBoxRemaing: number;
  distanceInKm: number;
  collectionFromTime: number;
  collectionToTime: number;
  timeToAMPM: string;
  surpriseBoxRating: number;
  serviceProviderAddress: string;
  serviceProviderID: string;
  surpriseBoxID: string;
  quantity: number;
  surpriseBoxMealType: string;
  mealType: string;
  serviceProviderVendorType: any;
}

interface RatingData {
  overallAverageRating: number;
  totalReviews: number;
  averageQuantityRating: number;
  averageQualityRating: number;
  averageTasteRating: number;
}

interface CheckoutItem {
  surpriseBoxID: string;
  quantity: number;
  unitPrice: number;
}

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

const CheckoutScreen: React.FC<Props> = ({ route }) => {
  const { surpriseBoxID, serviceProviderID, routeId } = route.params;

  const navigation = useNavigation<CheckoutNavigationProp>();
  const dispatch = useDispatch();

  const pageNumber = useRef(1);
  const scrollRef = useRef(null);
  const cartIdRef = useRef<string | null>(null);
  const selectedItemArrayRef = useRef<any[]>([]);

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>('en');
  const [vendorItemsData, setVendorItemsData] = useState<SurpriseBoxData[]>([]);
  const [listLoader, setListLoader] = useState(false);
  const [onScrollLoader, setOnScrollLoader] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [ratingAndReviewsData, setRatingAndReviewsData] =
    useState<RatingData | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addToCart, setAddToCart] = useState<SurpriseBoxData[]>([]);
  const [serviceProviderData, setServiceProviderData] = useState<any>(null);
  const [totalCartItem, setTotalCartItem] = useState<any>([]);

  const quantitySelector = useSelector(
    (state: RootState) => state?.mealQuantitySlice?.mealData,
  );
  const vendorImageSelector = useSelector(
    (state: RootState) => state?.mealQuantitySlice?.surpriseBoxIdImage,
  );
  const radiusSelector = useSelector(
    (state: RootState) => state?.locationRadiusSlice?.radius,
  );
  const languageSelector = useSelector(
    (state: RootState) => state?.languageSlice?.selected_language,
  );
  const addToCartSelector = useSelector(
    (state: RootState) => state.addToCartSlice?.add_to_cart as any,
  );
  const apiCartSelector = useSelector(
    (state: RootState) => state.addToCartSlice?.api_cart_data as any,
  );

  const AppLabels = language_data[selectedLanguage].app_items;
  const OtherLabels = language_data[selectedLanguage].other_items;

  useEffect(() => {
    if (languageSelector === 'en' || languageSelector === 'ar') {
      setSelectedLanguage(languageSelector);
    }
    if (addToCartSelector) {
      setAddToCart(addToCartSelector);
    }
  }, [languageSelector, addToCartSelector]);

  useEffect(() => {
    // if (vendorImageSelector?.length > 0) {
    //   setVendorImageDataSet(vendorImageSelector)
    // }
  }, [vendorImageSelector]);

  useEffect(() => {}, [apiCartSelector]);

  useEffect(() => {
    if (quantitySelector.length > 0) {
      let filterData = quantitySelector?.filter(
        (item: any) => item?.quantity > 0,
      );
      let serviceProviderData = quantitySelector?.filter(
        (item: any) => item?.serviceProviderID == serviceProviderID,
      );
      const otherData = serviceProviderData.filter(
        (item: any) => item.surpriseBoxID !== surpriseBoxID,
      );
      const topData = serviceProviderData.filter(
        (item: any) => item.surpriseBoxID == surpriseBoxID,
      );
      const finalData = [...topData, ...otherData];
      setTotalCartItem(filterData);
      setVendorItemsData(finalData);
    }
  }, [quantitySelector]);

  useEffect(() => {
    setListLoader(true);
    if (serviceProviderID) {
      handleVendorItemsFunction(serviceProviderID);
    } else {
      getSurpriseBoxDetailsByIdFunction();
    }
  }, [radiusSelector]);

  const getSurpriseBoxDetailsByIdFunction = async () => {
    let payload = {
      surpriseBoxID: surpriseBoxID,
    };
    await getSurpriseBoxDetailsById(payload).then(async response => {
      if (response?.succeeded) {
        await handleVendorItemsFunction(response?.data?.serviceProviderID);
      }
    });
  };

  const increaseQty = (item: any) => {
    let isLimitReached = false;

    const vendorsUpdatedData = vendorItemsData.map((i: any) => {
      if (i.surpriseBoxID === item.surpriseBoxID) {
        if (i.quantity < i.noOfBoxRemaing) {
          return {
            ...i,
            quantity: i.quantity + 1,
          };
        } else {
          isLimitReached = true;
        }
      }
      return i;
    });

    if (isLimitReached) {
      setShowToast(true);
      setIsSuccess(false);
      setToastMessage(
        `Only ${item?.noOfBoxRemaing} Surprise Boxes are available. You cannot add more`,
      );

      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }

    dispatch(setMealDataList(vendorsUpdatedData));
    setVendorItemsData(vendorsUpdatedData);
  };

  const decreaseQty = (item: any) => {
    const vendorsUpdatedData = vendorItemsData.map((i: any) => {
      if (i.surpriseBoxID === item.surpriseBoxID) {
        const updatedItem = {
          ...i,
          quantity: i.quantity > 0 ? i.quantity - 1 : i.quantity,
        };
        return updatedItem;
      }

      return i;
    });
    dispatch(setMealDataList(vendorsUpdatedData));
    setVendorItemsData(vendorsUpdatedData);
  };

  const handleVendorItemsFunction = async (serviceProviderID: any) => {
    let user_id = await AsyncStorage.getItem('user_id');
    let payload = {
      userID: user_id,
      serviceProviderID: serviceProviderID,
      pageNumber: pageNumber.current,
      pageSize: 50,
      maxDistanceKm: radiusSelector,
      minPrice: 0,
      maxPrice: 20000,
    };
    console.log(JSON.stringify(payload));
    
    await getAllActiveSurpriseBoxesBySPId(payload)
      .then(async response => {
        setListLoader(false);
        if (response?.data) {
          const { serviceProvider, surpriseBoxes } = response.data;
          const boxList = surpriseBoxes?.data ?? [];
          let updatedData = boxList.map((item: any) => {
            const isSelected = item.surpriseBoxID == surpriseBoxID;
            return {
              ...item,
              quantity: isSelected ? 1 : 0,
            };
          });

          if (apiCartSelector?.length > 0) {
            updatedData = boxList.map((item: any) => {
              const qty = item.surpriseBoxID == surpriseBoxID ? 1 : 0;
              const match = apiCartSelector.find(
                (c: any) => c.surpriseBoxID === item.surpriseBoxID,
              );

              return {
                ...item,
                quantity: match ? match.quantity : qty,
              };
            });
          }

          const mergedData = updatedData.map((item: any) => {
            const cartItem = addToCartSelector?.find(
              (cart: any) => cart.surpriseBoxID === item.surpriseBoxID,
            );

            return {
              ...item,
              quantity: cartItem ? cartItem.quantity : item.quantity,
            };
          });

          const topData = mergedData
            .filter((item: any) => item.surpriseBoxID === surpriseBoxID)
            .map((item: any) => ({
              ...item,
              quantity:
                item.quantity === 0 ? 1 : routeId == 1 ? item.quantity : 0,
            }));

          const otherData = mergedData.filter(
            (item: any) => item.surpriseBoxID !== surpriseBoxID,
          );
          const finalData = [...topData, ...otherData];
          const updatedList = finalData.map(item => {
            const matched = vendorImageSelector.find(
              (sp: any) => sp.surpriseBoxID === item.surpriseBoxID,
            );
            return {
              ...item,
              serviceProviderVendorType:
                matched?.serviceProviderVendorType ?? '',
            };
          });

          setServiceProviderData(serviceProvider);
          dispatch(setMealDataList(updatedList));
          setVendorItemsData(updatedList);
        }
      })
      .catch(error => {
        setListLoader(false);
      });
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const distanceFromEnd =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    return distanceFromEnd < 4000;
  };

  const handleScrollEndDrag = () => {
    if (scrollRef.current) {
      if (pageNumber.current < totalPages) {
        setOnScrollLoader(true);
        pageNumber.current += 1;
        // handleVendorItemsFunction();
      }
    }
  };

  const handleAddToCart = async (item: any) => {
    const vendorItemsUpdatedData = vendorItemsData.map(i =>
      i.surpriseBoxID === item.surpriseBoxID
        ? { ...i, quantity: i.quantity + 1 }
        : i,
    );

    setVendorItemsData(vendorItemsUpdatedData);
    dispatch(setMealDataList(vendorItemsUpdatedData));
    selectedItemArrayRef.current = vendorItemsUpdatedData.filter(
      i => i.quantity > 0,
    );
  };

  useEffect(() => {
    handleCartLengthFromAPI();
  }, []);

  const handleCartLengthFromAPI = async () => {
    const userData = await getData('userData');
    const cartData = await AsyncStorage.getItem('CartDataArray');
    const parseData = cartData ? JSON.parse(cartData) : [];
    dispatch(addApiCartReducer(parseData));
    dispatch(setMealDataList(parseData));
    let payload = {
      userID: userData?.userID,
    };
    if (!cartIdRef.current) {
      await getCartByUserId(payload).then(response => {
        if (response?.succeeded) {
          cartIdRef.current = response?.data?.cartID;
        }
      });
    }
  };

  const handleAddToCartApiFunction = async () => {
    await handleCheckOutNavigation();
  };

  const handleCheckOutNavigation = async () => {
    if (quantitySelector?.length == 0) return;
    const user_id = await AsyncStorage.getItem('user_id');
    const items: CheckoutItem[] = quantitySelector.map((box: any) => ({
      surpriseBoxID: box.surpriseBoxID,
      quantity: box.quantity,
      unitPrice: box.discountedPrice,
    }));

    let payload: any = {
      id: cartIdRef.current,
      userID: user_id,
      appliedCouponCode: '',
      isActive: true,
      isCheckedOut: false,
      specialInstruction: '',
      items: items?.filter(item => item?.quantity > 0),
    };

    if (items?.length == 1) {
      delete payload.id;
    }
    dispatch(setMealDataList(vendorItemsData));
    navigation.navigate('OrderPlaceScreen', {
      cartId: cartIdRef.current,
      payloadData: JSON.stringify(payload),
    });
  };

  const totalCartCount = useMemo(() => {
    return totalCartItem?.reduce(
      (sum: number, item: any) => sum + (item?.quantity || 0),
      0,
    );
  }, [totalCartItem]);

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
                <Text style={styles.headerTitle}>
                  {serviceProviderData?.serviceProviderName?.length > 25
                    ? serviceProviderData?.serviceProviderName?.slice(0, 25) +
                      '...'
                    : serviceProviderData?.serviceProviderName}
                </Text>
              </Pressable>
              {/* <Pressable onPress={() => navigation.navigate("OrderPlaceScreen", {
                cartId: "",
                payloadData: null
              })} disabled={totalCartItem.length > 0 ? false : true}>
                {
                  totalCartItem.length > 0 ?
                    <ImageBackground source={Icons.CartIcon} style={styles.CartIcon} resizeMode='contain'>
                      <View style={{ backgroundColor: "#FFF500", borderRadius: 50, height: heightPixel(22), width: widthPixel(22), position: "absolute", bottom: 0, right: 0, justifyContent: "center", alignItems: "center", borderWidth: 0 }}>
                        <Text style={{ fontSize: fontPixel(13), fontFamily: FONTS.tenonMediumFont }}>{totalCartItem.length}</Text>
                      </View>
                    </ImageBackground> :
                    <Image source={Icons.CartIcon} style={styles.CartIcon} resizeMode='contain' />
                }
              </Pressable> */}
              {totalCartItem.length > 0 && (
                <Pressable
                  onPress={() =>
                    navigation.navigate('OrderPlaceScreen', {
                      cartId: '',
                      payloadData: null,
                    })
                  }
                >
                  <ImageBackground
                    source={Icons.CartIcon}
                    style={styles.CartIcon}
                    resizeMode="contain"
                  >
                    <View
                      style={{
                        backgroundColor: '#FFF500',
                        borderRadius: 50,
                        height: heightPixel(22),
                        width: widthPixel(22),
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: fontPixel(13),
                          fontFamily: FONTS.tenonMediumFont,
                        }}
                      >
                        {totalCartCount}
                      </Text>
                    </View>
                  </ImageBackground>
                </Pressable>
              )}
            </View>
            <View style={styles.reviewSection}>
              <Pressable
                style={styles.rowBetween}
                onPress={() =>
                  navigation.navigate('AllReviews', {
                    serviceProviderId: serviceProviderData?.id,
                    serviceProviderName:
                      serviceProviderData?.serviceProviderName,
                    latitude: serviceProviderData?.latitude,
                    longitude: serviceProviderData?.longitude,
                    serviceProviderAddress: serviceProviderData?.address,
                    collectionFromTime: serviceProviderData?.collectionFromTime,
                    collectionToTime: serviceProviderData?.collectionToTime,
                    timeFromAMPM: serviceProviderData?.timeFromAMPM,
                    timeToAMPM: serviceProviderData?.timeToAMPM,
                    distance: vendorItemsData[0]?.distanceInKm,
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
                <Text style={styles.reviewRating}>
                  {`${
                    serviceProviderData?.userReviewCount
                      ? `${serviceProviderData?.userReviewCount} ${
                          serviceProviderData?.userReviewCount > 1
                            ? 'reviews'
                            : 'review'
                        }`
                      : ``
                  }`}
                </Text>
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
                    {serviceProviderData?.address?.length > 13
                      ? serviceProviderData?.address.slice(0, 13) + '...'
                      : serviceProviderData?.address}{' '}
                    ({vendorItemsData[0]?.distanceInKm} km far)
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    openGoogleMap(
                      serviceProviderData?.latitude,
                      serviceProviderData?.longitude,
                      serviceProviderData?.address,
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
                    {serviceProviderData?.collectionFromTime}{' '}
                  </Text>
                  {serviceProviderData?.timeFromAMPM !=
                  serviceProviderData?.timeToAMPM ? (
                    <Text style={styles.timeStyle}>
                      {serviceProviderData?.timeFromAMPM}-
                    </Text>
                  ) : (
                    <Text style={styles.timeStyle}>- </Text>
                  )}
                  <Text style={styles.timeStyle}>
                    {serviceProviderData?.collectionToTime}{' '}
                    {serviceProviderData?.timeToAMPM}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              overflow: 'hidden',
              paddingLeft: '2%',
              paddingRight: '2%',
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
            {listLoader ? (
              <View style={{ flex: 1 }}>
                <OfferItemSkeleton />
              </View>
            ) : vendorItemsData?.length > 0 ? (
              <KeyboardAwareScrollView
                style={{ flexGrow: 1 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
              >
                <View>
                  <View style={{ marginBottom: 2 }}>
                    <Text
                      style={{
                        color: '#264941',
                        fontSize: fontPixel(20),
                        fontFamily: FONTS.tenonBoldFont,
                      }}
                    >
                      {' '}
                      Offers
                    </Text>
                  </View>
                  {vendorItemsData?.map((item, index) => {
                    return (
                      <View
                        key={index}
                        style={{
                          marginBottom: 8,
                          paddingLeft: 5,
                          paddingRight: 5,
                        }}
                      >
                        <SurpriseBoxCart
                          surpriseBoxData={item}
                          onPressDelete={() => console.log('')}
                          onPressAddToCart={() =>
                            item?.noOfBoxRemaing > 0 && handleAddToCart(item)
                          }
                          onPressIncreaseQty={() => increaseQty(item)}
                          onPressDecreaseQty={() => decreaseQty(item)}
                          serviceProviderName={
                            serviceProviderData?.vendorTypeName
                          }
                        />
                      </View>
                    );
                  })}
                </View>
              </KeyboardAwareScrollView>
            ) : // <View style={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
            //   <Text>{OtherLabels?.NoRestaurantFoundWithIn} {radiusSelector}{OtherLabels?.KM}</Text>
            //   <Pressable
            //     onPress={() => navigation.navigate("LocationScreen")} style={{ backgroundColor: "blue", borderRadius: 8, padding: 8, marginTop: 5 }}>
            //     <Text style={{ color: "#fff" }}>{OtherLabels?.ChangeRadius}</Text>
            //   </Pressable>
            // </View>
            null}
          </View>

          <Pressable
            style={[
              styles.checkoutBar,
              totalCartItem?.length == 0 && {
                opacity: 0.7,
                backgroundColor: '#666666',
              },
            ]}
            onPress={() => handleAddToCartApiFunction()}
            disabled={totalCartItem?.length == 0}
          >
            <View style={styles.checkoutButton}>
              <Text style={styles.checkoutText}>{AppLabels?.Checkout}</Text>
            </View>
          </Pressable>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default CheckoutScreen;

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
  viewAllButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A3AFF',
  },

  vendorButton: {
    alignSelf: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  vendorButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  checkoutBar: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    backgroundColor: '#264941',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 50,
    alignSelf: 'center',
  },
  checkoutButton: {},
  checkoutText: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    color: '#FFFFFF',
  },
  CartIcon: {
    width: widthPixel(39),
    height: heightPixel(39),
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
});
