import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import language_data_json from "../../../JSON/language.json";
import { fontPixel, heightPixel, widthPixel } from "../../../utils/responsive";
import { Icons, Images } from "../../../theme/AssetsUrl";
import StarRatingComponent from "../../../component/StarRatingComponent";
import { FONTS } from "../../../theme/FontsLink";
import { openGoogleMap } from "../../../utils/openGoogleMap";
import { DefaultStyle } from "../../../theme/styles/DefaultStyle";
import Skeleton from "../../../component/Skeleton/Skeleton";
import { getServiceProviderRatingAndReviews } from "../../../../helpers/Services/surprise_box";
import { addApiCartReducer } from "../../../store/Slices/addToCartSlice";
import { setMealDataList } from "../../../store/Slices/mealQuantitySlice";
import { useDispatch } from "react-redux";
import { PickStackParamList } from "../../../navigation/AppNavigation/OrderPickUpStack/OrderPickUpStack";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../navigation/AppNavigation/AppNavigation";

export type AllReviewsProps = NativeStackScreenProps<
  RootStackParamList,
  "AllReviews"
>;
type AllReviewsNavigationProp = NativeStackNavigationProp<
  PickStackParamList,
  "AllReviews"
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

const { width: windowWidth } = Dimensions.get("window");

const AllReviews: React.FC<AllReviewsProps> = ({ route }) => {
  const serviceProviderID = route?.params?.serviceProviderId;
  const serviceProviderName = route?.params?.serviceProviderName;
  const serviceProviderLatitude = route?.params?.latitude;
  const serviceProviderLongitude = route?.params?.longitude;
  const serviceProviderAddress = route?.params?.serviceProviderAddress;
  const collectionFromTime = route?.params?.collectionFromTime;
  const collectionToTime = route?.params?.collectionToTime;
  const timeFromAMPM = route?.params?.timeFromAMPM;
  const timeToAMPM = route?.params?.timeToAMPM;
  const distance = route?.params?.distance;

  const navigation = useNavigation<AllReviewsNavigationProp>();
  const dispatch = useDispatch();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");
  const [ratingAndReviewData, setRatingAndReviewsData] = useState<any>(null);
  const [loader, setLoader] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [onScrollLoader, setOnScrollLoader] = useState(false);

  const pageNumberRef = useRef(1);
  const scrollRef = useRef(null);

  const AppLabels = language_data[selectedLanguage].app_items;
  const OtherLabels = language_data[selectedLanguage].other_items;

  useEffect(() => {
    setLoader(false);
    getAllRatingAndReviews();
  }, []);

  const getAllRatingAndReviews = async () => {
    let payload = {
      serviceProviderID: serviceProviderID,
      pageNumber: pageNumberRef.current,
      pageSize: 10,
    };
    await getServiceProviderRatingAndReviews(payload).then((response) => {
      if (response?.succeeded) {
        setOnScrollLoader(false);
        setTotalPages(response?.totalPages);
        setRatingAndReviewsData(response?.data);
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
          name: "DrawerNavigation",
          state: {
            index: 0,
            routes: [
              {
                name: "HomeScreen",
                params: { screen: "Orders" },
              },
            ],
          },
        },
      ],
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    if (isNaN(date.getTime())) return "";

    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return "just now";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "just now";
    }

    if (minutes < 60) {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    }

    if (hours < 24) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }

    if (days === 1) {
      return "1 day ago";
    }

    return `${days} days ago`;
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeScrollEvent) => {
    const distanceFromEnd =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    return distanceFromEnd < 100;
  };

  const handleScrollEndDrag = () => {
    if (scrollRef.current) {
      if (pageNumberRef.current < totalPages) {
        setOnScrollLoader(true);
        pageNumberRef.current += 1;
        getAllRatingAndReviews();
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        {/* {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess} />} */}
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1, marginTop: "5%" }}
          resizeMode="contain"
          tintColor={"#23302A"}
        >
          <View style={{ paddingLeft: "3%", paddingRight: "3%" }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
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
                  {serviceProviderName && serviceProviderName?.length > 20
                    ? serviceProviderName.slice(0, 20)
                    : serviceProviderName}
                </Text>
              </Pressable>
              <Pressable onPress={() => handleGoToOrders()}>
                <Image
                  source={Icons.HomeIcon}
                  style={styles.CartIcon}
                  resizeMode="contain"
                  tintColor={"#fff"}
                />
              </Pressable>
            </View>
            <View style={styles.reviewSection}>
              <View style={styles.rowBetween}>
                <StarRatingComponent
                  rating={ratingAndReviewData?.overallAverageRating}
                  // onChange={(newRating) => console.log(newRating)}
                  color="#FFB800"
                  size={18}
                  readOnly={true}
                  showText={false}
                />
                <Pressable>
                  <Text style={styles.reviewRating}>
                    {`${ratingAndReviewData?.totalReviews
                      ? `${ratingAndReviewData?.totalReviews} ${ratingAndReviewData?.totalReviews > 1
                        ? "reviews"
                        : "review"
                      }`
                      : ``
                      }`}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.reviewRow}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
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
                      color: "#fff",
                      fontSize: fontPixel(15),
                      fontFamily: FONTS.tenonMediumFont,
                    }}
                  >
                    {serviceProviderAddress &&
                      serviceProviderAddress?.length > 13
                      ? serviceProviderAddress.slice(0, 13) + "..."
                      : serviceProviderAddress}
                  </Text>
                  <Text style={{ marginLeft: 10, color: "#fff", fontSize: fontPixel(15), fontFamily: FONTS.tenonMediumFont }}>({distance} km far)</Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (
                      serviceProviderLatitude !== undefined &&
                      serviceProviderLongitude !== undefined
                    ) {
                      openGoogleMap(
                        serviceProviderLatitude,
                        serviceProviderLongitude,
                        serviceProviderAddress ?? ""
                      );
                    }
                  }}
                >
                  <Text style={styles.directionStyle}>{"Get Direction"}</Text>
                  <View style={styles.underline} />
                </Pressable>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: "3%",
                  marginLeft: 3,
                }}
              >
                <Image
                  source={Icons.TimingIcon}
                  style={styles.LocationIcon}
                  resizeMode="contain"
                  tintColor={"#fff"}
                />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 10,
                  }}
                >
                  <Text style={styles.timeStyle}>{collectionFromTime}</Text>
                  {timeFromAMPM != timeToAMPM ? (
                    <Text style={styles.timeStyle}>{timeFromAMPM}-</Text>
                  ) : (
                    <Text style={styles.timeStyle}>-</Text>
                  )}
                  <Text style={styles.timeStyle}>
                    {" "}
                    {collectionToTime} {timeToAMPM}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              overflow: "hidden",
              paddingLeft: "3%",
              paddingRight: "3%",
              paddingTop: 30,
              flex: 1,
            }}
          >
            <View
              style={{
                height: 185,
                width: 185,
                position: "absolute",
                bottom: -40,
                right: -40,
              }}
            >
              <Image
                source={Images.BottomCircle}
                style={DefaultStyle.imageSize}
                resizeMode="contain"
                tintColor={"#F4F4F4"}
              />
            </View>
            {loader ? (
              <Skeleton />
            ) : (
              <View style = {{flex : 1}}>
                {
                  ratingAndReviewData?.reviews ?
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      onScroll={({ nativeEvent }) => {
                        if (onScrollLoader == false) {
                          if (isCloseToBottom(nativeEvent)) {
                            handleScrollEndDrag();
                          }
                        }
                      }}
                      ref={scrollRef}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={
                        {
                          // paddingBottom: 160,
                        }
                      }
                    >
                      <View>
                        {ratingAndReviewData?.reviews?.data?.map(
                          (item: any, index: any) => {
                            return (
                              <View
                                key={index}
                                style={{
                                  borderWidth: 1,
                                  borderRadius: 15,
                                  borderTopLeftRadius: 0,
                                  borderColor: "#eee",
                                  backgroundColor: "#fff",
                                  marginBottom: 15,
                                  padding: 10,
                                }}
                              >
                                <View
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 10,
                                  }}
                                >
                                  <View>
                                    <Text
                                      style={{
                                        fontFamily: FONTS.tenonMediumFont,
                                        fontSize: fontPixel(16),
                                        color: "#1C1939",
                                      }}
                                    >
                                      {item?.userName}
                                    </Text>
                                  </View>
                                  <Text
                                    style={{
                                      fontFamily: FONTS.tenonMediumFont,
                                      fontSize: fontPixel(16),
                                      color: "#2F7C32",
                                    }}
                                  >
                                    Verified
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    alignSelf: "flex-start",
                                    marginBottom: 20,
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <StarRatingComponent
                                    rating={item?.averageRating}
                                    color="#FFB800"
                                    size={18}
                                    readOnly={true}
                                    showText={false}
                                  />
                                  <View style={{ marginLeft: 10 }}>
                                    <Text
                                      style={{
                                        fontFamily: FONTS.tenonRegularFont,
                                        fontSize: fontPixel(14),
                                        color: "#7E8389",
                                      }}
                                    >
                                      {formatTimeAgo(item?.createdOn)}
                                    </Text>
                                  </View>
                                </View>
                                <View>
                                  <Text
                                    style={{
                                      fontFamily: FONTS.tenonRegularFont,
                                      fontSize: fontPixel(16),
                                      color: "#1C1939",
                                    }}
                                  >
                                    {/* The quality of the food was impressive, especially the spices and aroma—real restaurant-style taste. The quantity was worth the price. Pickup was quick, and the staff had the order packed neatly. Would definitely order again! */}
                                    {item?.reviewComments}
                                  </Text>
                                </View>
                              </View>
                            );
                          }
                        )}
                      </View>
                    </ScrollView>
                    :
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: "#264941", fontFamily: FONTS.tenonMediumFont, fontSize: fontPixel(20) }}>No review found</Text>
                    </View>
                }
              </View>
            )}
          </View>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default AllReviews;

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
  headerTitle: {
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonBoldFont,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginLeft: 2,
  },
  reviewSection: {
    marginLeft: 25,
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: fontPixel(16),
    color: "#FFF400",
    marginLeft: 10,
    fontFamily: FONTS.tenonMediumFont,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    color: "#FFF400",
    fontSize: fontPixel(15),
    fontFamily: FONTS.tenonMediumFont,
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
    fontFamily: FONTS.tenonMediumFont,
  },
  swipeContainer: {
    position: "absolute",
    bottom: 20,
    borderRadius: 50,
    backgroundColor: "#264941",
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    width: "90%",
    alignSelf: "center",
  },
  swipeButton: {
    position: "absolute",
    width: widthPixel(55),
    height: heightPixel(60),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 100,
    left: 5,
  },
  swipeText: {
    color: "#FFF",
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
  },
  confirmedText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  orderNumber: {
    color: "#666666",
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPickedUp: {
    color: "#109D7D",
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    marginLeft: 5,
  },
  statusReady: {
    color: "#FFA726",
    fontWeight: "bold",
    marginLeft: 5,
  },
  savingsBanner: {
    backgroundColor: "#EBFFFB",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  savingsText: {
    color: "#264941",
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  cardAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  paidText: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
    color: "#2E2E2E",
  },

  methodText: {
    fontSize: fontPixel(12),
    color: "#666666",
    fontFamily: FONTS.tenonRegularFont,
    // includeFontPadding : false,
    marginLeft: 4,
  },

  amountText: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    color: "#1A1A2E",
    // textAlignVertical: "center",
    includeFontPadding: false,
  },
  important: {
    height: heightPixel(29),
    width: widthPixel(29),
    marginRight: 15,
  },
});
