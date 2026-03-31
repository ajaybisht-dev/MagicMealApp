import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { Icons, Images } from "../../theme/AssetsUrl";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp, DrawerScreenProps } from "@react-navigation/drawer";
import { DrawerParamList } from "../../navigation/DrawerNavigation";
import { getAllActiveSurpriseBoxesBySPId, getSurpriseBoxDetailsById, getSurpriseBoxRatingAndReviews } from "../../../helpers/Services/surprise_box";
import { IMG_URL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setMealDataList } from "../../store/Slices/mealQuantitySlice";
import { RootState } from "../../store/rootReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VendorListItemComponent from "../../component/VendorListItemComponent";
import StarRatingComponent from "../../component/StarRatingComponent";
import { insertUpdateCart } from "../../../helpers/Services/cart";
import CustomToast from '../../component/CustomToast';
import SurpriseBoxCart from "../../component/CommonComponent/SurpriseBoxCart";
import language_data_json from "../../JSON/language.json";
import LinearGradient from "react-native-linear-gradient";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { FONTS } from "../../theme/FontsLink";
import { addToCartReducer } from "../../store/Slices/addToCartSlice";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import OfferItemSkeleton from "../../component/Skeleton/OfferItemSkeleton";

type Props = DrawerScreenProps<DrawerParamList, "CheckoutScreen">;
type CheckoutNavigationProp = DrawerNavigationProp<DrawerParamList, "CheckoutScreen">;

interface SurpriseBoxData {
  sbImageURL: string;
  serviceProviderName: string;
  surpriseBoxName: string;
  actualPrice: number,
  discountedPrice: number,
  discountedPercent: number,
  noOfBoxRemaing: number,
  distanceInKm: number,
  collectionFromTime: number,
  collectionToTime: number,
  timeToAMPM: string,
  surpriseBoxRating: number,
  serviceProviderAddress: string,
  serviceProviderID: string,
  surpriseBoxID: string,
  quantity: number,
  surpriseBoxMealType: string,
  mealType: string
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
  Filter: string,
  CustomerReview: string,
  NoReview: string,
  Quality: string,
  Quantity: string,
  Taste: string,
  ViewAllReviews: string,
  Checkout: string
};

type OtherItems = {
  NoRestaurantFoundWithIn: string,
  KM: string,
  ChangeRadius: string
};

type LanguageMap = {
  en: { app_items: AppItems; other_items: OtherItems };
  ar: { app_items: AppItems; other_items: OtherItems };
};

type SupportedLang = keyof LanguageMap; // "en" | "ar"

const language_data = language_data_json as LanguageMap;

const CheckoutScreen: React.FC<Props> = ({ route }) => {
  const { surpriseBoxID } = route.params;

  const navigation = useNavigation<CheckoutNavigationProp>();
  const dispatch = useDispatch();

  const pageNumber = useRef(1);
  const scrollRef = useRef(null);
  const cartIdRef = useRef<string | null>(null);
  const selectedItemArrayRef = useRef<any[]>([]);

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");
  const [vendorItemsData, setVendorItemsData] = useState<SurpriseBoxData[]>([]);
  const [listLoader, setListLoader] = useState(false);
  const [onScrollLoader, setOnScrollLoader] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [ratingAndReviewsData, setRatingAndReviewsData] = useState<RatingData | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addToCart, setAddToCart] = useState<SurpriseBoxData[]>([]);
  const [serviceProviderData, setServiceProviderData] = useState<any>(null);

  const quantitySelector = useSelector((state: RootState) => state?.mealQuantitySlice?.mealData);
  const radiusSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.radius);
  const languageSelector = useSelector((state: RootState) => state?.languageSlice?.selected_language);
  const addToCartSelector = useSelector((state: RootState) => state.addToCartSlice?.add_to_cart as any);

  const AppLabels = language_data[selectedLanguage].app_items;
  const OtherLabels = language_data[selectedLanguage].other_items;

  useEffect(() => {
    if (languageSelector === "en" || languageSelector === "ar") {
      setSelectedLanguage(languageSelector);
    }
    if (addToCartSelector) {
      setAddToCart(addToCartSelector)
    }
  }, [languageSelector, addToCartSelector]);

  useEffect(() => {
    if (quantitySelector.length > 0) {
      setVendorItemsData(quantitySelector);
    }
  }, [quantitySelector])

  useEffect(() => {
    getSurpriseBoxDetailsByIdFunction();
  }, [radiusSelector])

  const getSurpriseBoxDetailsByIdFunction = async () => {
    setListLoader(true);
    let payload = {
      "surpriseBoxID": surpriseBoxID
    }
    await getSurpriseBoxDetailsById(payload).then(async (response) => {
      if (response?.succeeded) {
        await handleVendorItemsFunction(response?.data?.serviceProviderID);
      }
    })
  }

  const increaseQty = (item: any) => {
    const vendorsUpdatedData = vendorItemsData.map((i: any) => {
      if (i.surpriseBoxID === item.surpriseBoxID) {
        const updatedItem = {
          ...i,
          quantity:
            i.quantity < i.noOfBoxRemaing
              ? i.quantity + 1
              : i.quantity,
        };
        let payload = {
          surpriseBoxID: updatedItem?.surpriseBoxID,
          quantity: updatedItem?.quantity,
          unitPrice: updatedItem?.quantity * updatedItem?.discountedPrice,
          surpriseBoxName: updatedItem.surpriseBoxName,
          discountedPrice: updatedItem?.discountedPrice,
          actualPrice: updatedItem?.actualPrice
        }
        dispatch(addToCartReducer(payload));

        return updatedItem;
      }

      return i;
    });

    setVendorItemsData(vendorsUpdatedData);
  };

  const decreaseQty = (item: any) => {
    const vendorsUpdatedData = vendorItemsData.map((i: any) => {
      if (i.surpriseBoxID === item.surpriseBoxID) {
        const updatedItem = {
          ...i,
          quantity: i.quantity > 0 ? i.quantity - 1 : i.quantity,
        };
        let payload = {
          surpriseBoxID: updatedItem?.surpriseBoxID,
          quantity: updatedItem?.quantity,
          unitPrice: updatedItem?.quantity * updatedItem?.discountedPrice,
          surpriseBoxName: updatedItem.surpriseBoxName,
          discountedPrice: updatedItem?.discountedPrice,
          actualPrice: updatedItem?.actualPrice
        }
        dispatch(addToCartReducer(payload));
        return updatedItem;
      }

      return i;
    });

    setVendorItemsData(vendorsUpdatedData);
  };


  const handleVendorItemsFunction = async (serviceProviderID: any) => {
    let user_id = await AsyncStorage.getItem("user_id")
    let payload = {
      "userID": user_id,
      "serviceProviderID": serviceProviderID,
      "pageNumber": pageNumber.current,
      "pageSize": 10,
      "maxDistanceKm": radiusSelector,
      "minPrice": 0,
      "maxPrice": 20000
    }

    await getAllActiveSurpriseBoxesBySPId(payload).then((response) => {
      setListLoader(false);
      if (response?.data) {
        const serviceProvider = response.data.serviceProvider;
        const surpriseBoxes = response.data.surpriseBoxes?.data ?? [];
        const updatedData = surpriseBoxes.map((item: any) => ({
          ...item,
          quantity: item.surpriseBoxID === surpriseBoxID ? 1 : 0,
        }));
        const selectedBox = updatedData.find(
          (item: any) => item.surpriseBoxID === surpriseBoxID
        );

        if (selectedBox) {
          dispatch(
            addToCartReducer({
              surpriseBoxID: selectedBox.surpriseBoxID,
              quantity: selectedBox.quantity,
              unitPrice: selectedBox.quantity * selectedBox.discountedPrice,
              surpriseBoxName: selectedBox.surpriseBoxName,
              discountedPrice: selectedBox?.discountedPrice,
              actualPrice: selectedBox?.actualPrice
            })
          );
        }

        const finalList = updatedData.map((item: any) => {
          const matched = addToCartSelector?.find(
            (cart: any) => cart.surpriseBoxID === item.surpriseBoxID
          );

          return {
            ...item,
            quantity: matched ? matched.quantity : item.quantity,
          };
        });
        setServiceProviderData(serviceProvider);
        setVendorItemsData(finalList);
      }

    }).catch((error) => {
      setListLoader(false);
    })
  }

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const distanceFromEnd = contentSize.height - (contentOffset.y + layoutMeasurement.height);
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
        : i
    );

    setVendorItemsData(vendorItemsUpdatedData);
    const updatedItem = vendorItemsUpdatedData.filter(
      i => i.surpriseBoxID === item.surpriseBoxID
    );
    if (updatedItem) {
      let payload = {
        surpriseBoxID: updatedItem[0]?.surpriseBoxID,
        quantity: updatedItem[0]?.quantity,
        unitPrice: updatedItem[0]?.quantity * updatedItem[0]?.discountedPrice,
        surpriseBoxName: updatedItem[0].surpriseBoxName,
        discountedPrice: updatedItem[0]?.discountedPrice,
        actualPrice: updatedItem[0]?.actualPrice
      }
      dispatch(addToCartReducer(payload));
    }
    selectedItemArrayRef.current = vendorItemsUpdatedData.filter(
      i => i.quantity > 0
    );
  };


  const handleAddToCartApiFunction = async () => {
    const user_id = await AsyncStorage.getItem("user_id");
    const items: CheckoutItem[] = addToCart.map((box: any) => ({
      surpriseBoxID: box.surpriseBoxID,
      quantity: box.quantity,
      unitPrice: box.unitPrice,
    }));
    const payload = {
      "userID": user_id,
      "appliedCouponCode": "",
      "isActive": true,
      "isCheckedOut": false,
      "items": items
    };
    await insertUpdateCart(payload).then(async (response) => {
      if (response?.succeeded) {
        cartIdRef.current = response?.data?.cartID;
        await handleCheckOutNavigation();
      }
    })
  }

  const handleCheckOutNavigation = async () => {
    if (addToCart?.length == 0) return;
    const user_id = await AsyncStorage.getItem("user_id");
    const items: CheckoutItem[] = addToCart.map((box: any) => ({
      surpriseBoxID: box.surpriseBoxID,
      quantity: box.quantity,
      unitPrice: box.unitPrice
    }));

    let payload: any = {
      "id": cartIdRef.current,
      "userID": user_id,
      "appliedCouponCode": "",
      "isActive": true,
      "isCheckedOut": false,
      "items": items
    };

    if (items?.length == 1) {
      delete payload.id
    }
    await insertUpdateCart(payload).then((response) => {
      if (response?.succeeded) {
        setShowToast(true);
        setIsSuccess(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
          dispatch(setMealDataList(vendorItemsData));
          navigation.navigate("OrderPlaceScreen", {
            surpriseBoxID: surpriseBoxID,
            cartId: cartIdRef.current || response?.data?.cartID
          })
        }, 1000);
      } else {
        setShowToast(true);
        setIsSuccess(false);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }
    }).catch((err: any) => console.log(err))
  }

  const openGoogleMap = async (latitude: any, longitude: any, label: any) => {

    try {
      const appUrl = Platform.select({
        ios: `comgooglemaps://?q=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(label)})`,
      });

      const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      const supported = await Linking.canOpenURL(appUrl!);

      if (supported) {
        await Linking.openURL(appUrl!);
      } else {
        await Linking.openURL(browserUrl);
      }
    } catch (error) {
      console.error("Error opening Google Maps:", error);
      Alert.alert("Error", "Unable to open Google Maps.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#264941', '#264941']} style={{ flex: 1 }}>
        {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess} />}
        <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(350), flex: 1, marginTop: "5%" }} resizeMode="contain" tintColor={"#23302A"}>
          <View style={{ paddingLeft: "3%", paddingRight: "3%", }}>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Pressable style={styles.header} onPress={() => navigation.goBack()}>
                <Image source={Icons.BackIcon} resizeMode="contain" style={{ height: heightPixel(20), width: widthPixel(20) }} />
                <Text style={styles.headerTitle}>{serviceProviderData?.serviceProviderName}</Text>
              </Pressable>
              <Pressable onPress={() => console.log("data")} disabled>
                {
                  addToCart.length > 0 ?
                    <ImageBackground source={Icons.CartIcon} style={styles.CartIcon} resizeMode='contain'>
                      <View style={{ backgroundColor: "#FFF500", borderRadius: 50, height: heightPixel(22), width: widthPixel(22), position: "absolute", bottom: 0, right: 0, justifyContent: "center", alignItems: "center", borderWidth: 0 }}>
                        <Text style={{ fontSize: fontPixel(13), fontFamily: FONTS.muliBoldFont }}>{addToCart.length}</Text>
                      </View>
                    </ImageBackground> :
                    <Image source={Icons.CartIcon} style={styles.CartIcon} resizeMode='contain' />
                }
              </Pressable>
            </View>
            <View style={styles.reviewSection}>
              <View style={styles.rowBetween}>
                <StarRatingComponent
                  rating={serviceProviderData?.rating}
                  onChange={(newRating) => console.log(newRating)}
                  color="#FFB800"
                  size={20}
                  readOnly={true}
                  showText={false}
                />
                <Text style={styles.reviewRating}>
                  {`${ratingAndReviewsData?.totalReviews
                    ? `${ratingAndReviewsData.totalReviews} ${ratingAndReviewsData.totalReviews > 1 ? "reviews" : "review"}`
                    : `${AppLabels?.NoReview}`
                    }`}
                </Text>
              </View>

              <View style={styles.reviewRow}>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <Image source={Icons.LocationIcon} style={styles.LocationIcon} resizeMode='contain' />
                  <Text style={{ marginLeft: 10, color: "#fff", fontSize: fontPixel(15), fontFamily: FONTS.muliBoldFont }}>{serviceProviderData?.address?.length > 13 ? (serviceProviderData?.address.slice(0, 13) + "...") : serviceProviderData?.address} ({vendorItemsData[0]?.distanceInKm} km far)</Text>
                </View>
                <Pressable onPress={() => openGoogleMap(serviceProviderData?.latitude, serviceProviderData?.longitude, serviceProviderData?.address)}>
                  <Text style={styles.directionStyle}>{"Get Direction"}</Text>
                  <View style={styles.underline} />
                </Pressable>
              </View>
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: "3%" }}>
                <Image source={Icons.TimingIcon} style={styles.LocationIcon} resizeMode='contain' tintColor={"#fff"} />
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                  <Text style={styles.timeStyle}>{serviceProviderData?.collectionFromTime} {(serviceProviderData?.timeFromAMPM != serviceProviderData?.timeToAMPM) && serviceProviderData?.timeFromAMPM} - </Text>
                  <Text style={styles.timeStyle}>{serviceProviderData?.collectionToTime} {serviceProviderData?.timeToAMPM}</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
        <View style={{ backgroundColor: "#fff", height: "79%", position: "absolute", width: "100%", bottom: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50, overflow: "hidden", paddingLeft: "2%", paddingRight: "2%", paddingTop: 30 }}>
          {
            listLoader ?
              <View style={{ flex: 1 }}>
                <OfferItemSkeleton />
              </View>
              : vendorItemsData?.length > 0 ?
                <KeyboardAwareScrollView style={{ flexGrow: 1 }}>
                  <View>
                    <View style={{ marginBottom: 2 }}>
                      <Text style={{ color: "#264941", fontSize: fontPixel(18), fontFamily: FONTS.poppinsMediumFont }}> Offers</Text>
                    </View>
                    {
                      vendorItemsData?.map((item, index) => {
                        return (
                          <View key={index} style={{ marginBottom: 8, paddingLeft: 5, paddingRight: 5 }}>
                            <SurpriseBoxCart
                              surpriseBoxData={item}
                              onPressDelete={() => console.log("")}
                              onPressAddToCart={() => handleAddToCart(item)}
                              onPressIncreaseQty={() => increaseQty(item)}
                              onPressDecreaseQty={() => decreaseQty(item)}
                            />
                          </View>
                        )
                      })
                    }
                  </View>
                </KeyboardAwareScrollView>
                :
                // <View style={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
                //   <Text>{OtherLabels?.NoRestaurantFoundWithIn} {radiusSelector}{OtherLabels?.KM}</Text>
                //   <Pressable
                //     onPress={() => navigation.navigate("LocationScreen")} style={{ backgroundColor: "blue", borderRadius: 8, padding: 8, marginTop: 5 }}>
                //     <Text style={{ color: "#fff" }}>{OtherLabels?.ChangeRadius}</Text>
                //   </Pressable>
                // </View>
                null
          }
        </View>

        <Pressable style={styles.checkoutBar} onPress={() => handleAddToCartApiFunction()}>
          <View style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>{AppLabels?.Checkout}</Text>
          </View>
        </Pressable>
      </LinearGradient>
    </View >
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    // paddingTop: 10,
  },
  backArrow: {
    fontSize: 20,
    color: "#333",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.poppinsSemiBoldFont,
    color: "#FFFFFF",
    top: Platform.OS == "android" ? 1 : 0,
    marginLeft: 10
  },

  productSection: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  productImage: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginRight: 14,
  },
  productDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  priceText: {
    fontSize: 14,
    marginTop: 2,
    color: "#111",
  },
  oldPrice: {
    textDecorationLine: "line-through",
    color: "#777",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: 10
  },
  discountText: {
    fontSize: 13,
    color: "#333",
  },
  savingText: {
    fontSize: 13,
    color: "#333",
  },
  stockText: {
    fontSize: 13,
    color: "#4A3AFF",
    fontWeight: "600",
    marginTop: 6,
  },

  quantitySection: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    alignSelf: 'center',
    marginTop: 10
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 20,
    color: "#333",
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 20,
    color: "#333",
  },

  locationSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: "#333",
  },
  timeText: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },

  reviewSection: {
    marginLeft: 25,
    marginBottom: 10
  },
  reviewHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  reviewRating: {
    fontSize: fontPixel(16),
    color: "#FFF400",
    marginLeft: 10,
    fontFamily: FONTS.muliBoldFont
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  reviewLabel: {
    fontSize: 14,
    color: "#555",
  },
  reviewValue: {
    fontSize: 14,
    color: "#333",
  },
  viewAllButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 10
  },
  viewAllText: {
    fontSize: 14,
    color: "#4A3AFF",
  },

  vendorButton: {
    alignSelf: "center",
    marginTop: 40,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginBottom: 10
  },
  vendorButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },

  checkoutBar: {
    position: "absolute",
    bottom: 10,
    width: "90%",
    backgroundColor: "#264941",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 50,
    alignSelf: "center"
  },
  checkoutButton: {},
  checkoutText: {
    fontSize: fontPixel(16),
    fontFamily: FONTS.muliBoldFont,
    color: "#FFFFFF",
  },
  CartIcon: {
    width: widthPixel(39),
    height: heightPixel(39)
  },
  LocationIcon: {
    width: widthPixel(18),
    height: heightPixel(18)
  },
  directionStyle: {
    color: "#FFF400",
    fontSize: fontPixel(14),
    fontFamily: FONTS.muliBoldFont,
  },
  underline: {
    height: 1,
    backgroundColor: "#FFF400",
    width: "100%",
    borderRadius: 2,
  },
  timeStyle: {
    color: "#fff",
    fontSize: fontPixel(15),
    fontFamily: FONTS.muliBoldFont
  }
});