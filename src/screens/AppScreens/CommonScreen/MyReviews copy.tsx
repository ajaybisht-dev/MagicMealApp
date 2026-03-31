import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  Image,
  NativeScrollEvent,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  CommonActions,
  DrawerActions,
  useNavigation,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icons, Images } from "../../../theme/AssetsUrl";
import { IMG_URL } from "../../../../config";
import { fontPixel, heightPixel, widthPixel } from "../../../utils/responsive";
import Skeleton from "../../../component/Skeleton/Skeleton";
import { DefaultStyle } from "../../../theme/styles/DefaultStyle";
import { FONTS } from "../../../theme/FontsLink";
import StarRatingComponent from "../../../component/StarRatingComponent";
import { getAllVerifiedRatingByUserIdApi } from "../../../../helpers/Services/userProfile";
import { submitServiceProviderRating } from "../../../../helpers/Services/surprise_box";
import CustomToast from "../../../component/CustomToast";
import MyRatingModal from "../../../component/CommonComponent/MyRatingModal";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/rootReducer";
import MyReviewRatingModal from "./MyReviewRatingModal";

type RatingDataType = {
  serviceProviderName?: string;
};

const MyReviews: React.FC = () => {
  const navigation = useNavigation();
  const [loader, setLoader] = useState(true);
  const [reviewListingData, setReviewListingData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<any>(0);
  const [noReviewMessage, setNoReviewMessage] = useState<any>("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [onScrollLoader, setOnScrollLoader] = useState(false);

  const pageNumberRef = useRef(1);
  const ratingDataRef = useRef<RatingDataType>({});
  const serviceProviderIDRef = useRef<any>({});
  const scrollRef = useRef(null);

  const vendorTypeData = useSelector(
    (state: RootState) => state?.totalSavingSlice?.vendorTypeData
  );

  useEffect(() => { }, [vendorTypeData]);

  useEffect(() => {
    setLoader(true);
    getMyreviewsListByUserIdFunction();
  }, []);

  const getMyreviewsListByUserIdFunction = async () => {
    const user_id = await AsyncStorage.getItem("user_id");
    let payload = {
      userID: user_id,
      pageNumber: pageNumberRef.current,
      pageSize: 10,
    };

    await getAllVerifiedRatingByUserIdApi(payload)
      .then((response) => {
        console.log(JSON.stringify(response));
        
        setLoader(false);
        setOnScrollLoader(false);
        if (response?.succeeded) {
          if (response?.data?.length == 0) {
            setNoReviewMessage("No Revire Found");
            return;
          }
          setTotalPages(response.totalPages);
          setReviewListingData([...reviewListingData, ...response?.data]);
        } else {
          setLoader(false);
        }
      })
      .catch((error) => {
        setOnScrollLoader(false);
        setLoader(false);
      });
  };

  const handleImageData = (image_url: any, deal: any) => {
    if (!image_url) {
      switch (deal) {
        case "Non Veg":
          return Icons.NonVegBoxIcon;
        case "Veg":
          return Icons.VegBoxIcon;
        case "Vegan":
          return Icons.VeganBoxIcon;
        case "Sea Food":
          return Icons.SeaFoodBoxIcon;
        default:
          break;
      }
    } else {
      const normalizedPath = image_url.replace(/\\/g, "/");
      return { uri: IMG_URL + normalizedPath };
    }
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleGoToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "DrawerNavigation",
            state: {
              index: 0,
              routes: [{ name: "HomeScreen" }],
            },
          },
        ],
      })
    );
  };

  // const formatTimeAgo = (dateString: string) => {
  //   console.log(JSON.stringify(dateString));

  //   const date = new Date(dateString);
  //   const now = new Date();

  //   if (isNaN(date.getTime())) return "";

  //   const diffMs = now.getTime() - date.getTime();

  //   if (diffMs < 0) return "just now";

  //   const seconds = Math.floor(diffMs / 1000);
  //   const minutes = Math.floor(seconds / 60);
  //   const hours = Math.floor(minutes / 60);
  //   const days = Math.floor(hours / 24);

  //   if (seconds < 60) {
  //     return "just now";
  //   }

  //   if (minutes < 60) {
  //     return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  //   }

  //   if (hours < 24) {
  //     return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  //   }

  //   if (days === 1) {
  //     return "1 day ago";
  //   }

  //   return `${days} days ago`;
  // };

  const formatTimeAgo = (dateString: string) => {
    try {
      console.log("RAW DATE:", dateString);
      const normalized = dateString.replace(
        /\.(\d{3})\d*/,
        '.$1Z'
      );

      const date = new Date(normalized);
      const now = new Date();

      if (isNaN(date.getTime())) {
        console.log("Invalid date after normalization:", normalized);
        return "";
      }

      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return "just now";

      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return "just now";
      if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
      if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
      if (days === 1) return "1 day ago";

      return `${days} days ago`;
    } catch (error) {
      console.log("formatTimeAgo error:", error);
      return "";
    }
  };



  const handleNavigation = (item: any) => {
    let objData = {
      serviceProviderID: item?.serviceProviderID,
      orderID: item?.orderID,
    };
    serviceProviderIDRef.current = objData;
    let obj = {
      serviceProviderName: item?.serviceProviderName,
      quantityRating: item?.quantityRating,
      qualityRating: item?.qualityRating,
      tasteRating: item?.tasteRating,
      freshnessRating: item?.freshnessRating,
      packagingRating: item?.packagingRating,
    };
    (Object.keys(obj) as Array<keyof typeof obj>).forEach((key) => {
      if (key !== "serviceProviderName" && (obj[key] === 0 || obj[key] == null)) {
        delete obj[key];
      }
    });
    ratingDataRef.current = obj;
    setShowFeedbackModal(true);
  };

  const handleSubmitServiceProviderRatingFunction = async (data: any) => {    
    let user_id = await AsyncStorage.getItem("user_id");
    const ratings = data?.ratings ?? {};
    const keys = Object.keys(ratings);
    if (keys.length < 1) {
      setIsSuccess(false);
      setToastMessage("Please provide at least one rating.");
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
        setToastMessage("All ratings must be between 1 and 5.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
        return;
      }
    }
    let payload = {
      orderID: serviceProviderIDRef.current?.orderID,
      serviceProviderID: serviceProviderIDRef.current?.serviceProviderID,
      userID: user_id,
      quantityRating: ratings.quantityRating || 0,
      qualityRating: ratings.qualityRating || 0,
      tasteRating: ratings.tasteRating || 0,
      freshnessRating: ratings.freshnessRating || 0,
      packagingRating: ratings.packagingRating || 0,
      reviewComments: data?.comment,
    };
    console.log(JSON.stringify(payload));
    
    // await submitServiceProviderRating(payload).then(async (response) => {
    //   if (response?.succeeded) {
    //     setIsSuccess(true);
    //     setToastMessage(response?.messages?.[0]);
    //     setShowToast(true);

    //     setTimeout(() => {
    //       setShowToast(false);
    //     }, 2000);
    //     const emptArr = reviewListingData.splice(0, reviewListingData?.length);
    //     setReviewListingData(emptArr);
    //     pageNumberRef.current = 1;
    //     await getMyreviewsListByUserIdFunction();
    //   } else {
    //     setIsSuccess(false);
    //     setToastMessage(response?.messages?.[0]);
    //     setShowToast(true);

    //     setTimeout(() => {
    //       setShowToast(false);
    //     }, 2000);
    //   }
    // });
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
        getMyreviewsListByUserIdFunction();
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        {showToast && (
          <CustomToast message={toastMessage} isSuccess={isSuccess} />
        )}
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1 }}
          resizeMode="contain"
          imageStyle={{ tintColor: "#23302A" }}
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
              <Text style={styles.headerTitle}>My Review</Text>
            </Pressable>
            <Pressable onPress={() => handleGoToHome()}>
              <Image
                source={Icons.HomeIcon}
                resizeMode="contain"
                style={{ height: heightPixel(27), width: widthPixel(27) }}
                tintColor={"#fff"}
              />
            </Pressable>
          </View>
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
              {reviewListingData?.length > 0 ? (
                <ScrollView
                  ref={scrollRef}
                  onScroll={({ nativeEvent }) => {
                    if (onScrollLoader == false) {
                      if (isCloseToBottom(nativeEvent)) {
                        handleScrollEndDrag();
                      }
                    }
                  }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {reviewListingData?.map((item, index) => {
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
                          <Pressable onPress={() => handleNavigation(item)}>
                            <Image
                              source={Icons.EditIcon}
                              resizeMode="contain"
                              style={{
                                height: heightPixel(25),
                                width: widthPixel(25),
                                marginRight: 5,
                              }}
                            />
                          </Pressable>
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
                            rating={item?.averageTotalRating}
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
                            {item?.userComments}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  <View style={{ height: 20 }} />
                </ScrollView>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      borderRadius: 40,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      marginTop: "5%",
                      borderWidth: 1,
                      borderColor: "#264941",
                    }}
                  >
                    <Text
                      style={{
                        color: "#264941",
                        fontFamily: FONTS.tenonMediumFont,
                        fontSize: fontPixel(16),
                      }}
                    >
                      {"No Reviews Found"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ImageBackground>
      </LinearGradient>
      {/* <MyRatingModal
        visible={showFeedbackModal}
        serviceProviderName={ratingDataRef.current?.serviceProviderName ?? ""}
        ratingData={ratingDataRef.current}
        value={
          null
        }
        // value={'Restaurant'}
        onClose={() => [
          setShowFeedbackModal(false),
          (ratingDataRef.current = {}),
        ]}
        onSubmit={async (data) => {
          ratingDataRef.current = {};
          setShowFeedbackModal(false);
          handleSubmitServiceProviderRatingFunction(data);
        }}
      /> */}
      <MyReviewRatingModal
        visible={showFeedbackModal}
        serviceProviderName={ratingDataRef.current?.serviceProviderName ?? ""}
        ratingData={ratingDataRef.current}
        onClose={() => {
          setShowFeedbackModal(false);
          ratingDataRef.current = {};
        }}
        onSubmit={(data) => {          
          setShowFeedbackModal(false);
          handleSubmitServiceProviderRatingFunction(data);
          ratingDataRef.current = {};
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    // marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonBoldFont,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 15,
    overflow: "hidden",
  },
  scrollContent: {
    paddingBottom: 60,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 40,
  },
  successSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  successIconCircle: {
    backgroundColor: "#00a69c",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    marginBottom: 10,
  },
  successTitle: {
    fontSize: fontPixel(24),
    fontFamily: FONTS.tenonMediumFont,
    color: "#264941",
    marginBottom: 5,
  },
  transactionText: {
    color: "#109D7D",
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
    fontSize: fontPixel(20),
  },
  orderNumber: {
    // marginLeft: 20,
    color: "#666666",
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 15,
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: "#eee",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "#666666",
    marginLeft: 5,
    fontSize: fontPixel(14),
    fontFamily: FONTS.tenonMediumFont,
  },
  itemRow: {
    flexDirection: "row",
    paddingBottom: 10,
  },
  itemDetails: {
    marginLeft: 15,
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    includeFontPadding: false,
    color: "#2E2E2E",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 5,
    marginBottom: 5,
  },
  oldPrice: {
    textDecorationLine: "line-through",
    color: "#9D9D9D",
    marginRight: 13,
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  newPrice: {
    color: "#2E2E2E",
    marginRight: 8,
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  discountText: {
    color: "#666666",
    fontSize: fontPixel(14),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },
  qtyText: {
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
    color: "#2E2E2E",
    fontSize: fontPixel(18),
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: "#264941",
    fontFamily: FONTS.tenonMediumFont,
    marginLeft: 5,
    fontSize: fontPixel(16),
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPickedUp: {
    color: "#109D7D",
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonBoldFont,
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
    marginBottom: 10,
  },
  savingsText: {
    color: "#264941",
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    includeFontPadding: false,
  },

  // Styling for the Custom Box Icon (Simulating the image)
  boxImageContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  boxOutline: {
    width: 50,
    height: 40,
    borderWidth: 2,
    borderRadius: 4,
    marginTop: 10,
    position: "relative",
  },
  boxFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 15,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  boxWhiteInner: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    borderRightWidth: 1,
    borderRightColor: "#dddddd",
    paddingRight: 10,
  },
  boxLid: {
    position: "absolute",
    top: 5,
    left: -4,
    right: -4,
    height: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: "transparent",
    // The visual trick for the open lid look is complex in pure CSS/RN views,
    // this is a simplified approximation.
  },
  boxHandle: {
    position: "absolute",
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
    flexDirection: "row",
    alignItems: "center",
    // paddingTop: 10,
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
});

export default MyReviews;
