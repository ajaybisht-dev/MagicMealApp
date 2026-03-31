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
} from "react-native";
import { Icons } from "../../theme/AssetsUrl";
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
  quantity: number
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

const CheckoutScreen: React.FC<Props> = ({ route }) => {
  const { surpriseBoxID } = route.params;

  const navigation = useNavigation<CheckoutNavigationProp>();
  const dispatch = useDispatch();

  const pageNumber = useRef(1);
  const scrollRef = useRef(null);
  const selectedItemsRef = useRef<any[]>([]);
  const cartIdRef = useRef<string | null>(null);
  const selectedItemArrayRef = useRef<any[]>([]);

  const [surpriseBoxData, setSurpriseBoxData] = useState<SurpriseBoxData[]>([]);
  const [vendorItemsData, setVendorItemsData] = useState<SurpriseBoxData[]>([]);
  const [selectedItemArray, setSelectedItemArray] = useState<SurpriseBoxData[]>([]);
  const [listLoader, setListLoader] = useState(false);
  const [onScrollLoader, setOnScrollLoader] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [ratingAndReviewsData, setRatingAndReviewsData] = useState<RatingData | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const quantitySelector = useSelector((state: RootState) => state?.mealQuantitySlice?.mealData);
  const radiusSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.radius);

  useEffect(() => {
    if (quantitySelector.length > 0) {
      setSurpriseBoxData(quantitySelector);
    }
  }, [quantitySelector])

  useEffect(() => {
    getSurpriseBoxDetailsByIdFunction();
    getSurpriseBoxRatingAndReviewsFunction();
  }, [])

  const getSurpriseBoxDetailsByIdFunction = async () => {
    let payload = {
      "surpriseBoxID": surpriseBoxID
    }
    await getSurpriseBoxDetailsById(payload).then(async (response) => {
      if (response?.succeeded) {
        response.data["quantity"] = 0;
        selectedItemsRef.current = [...selectedItemsRef.current, response.data];
        setSurpriseBoxData(selectedItemsRef.current);
        await handleVendorItemsFunction();
      }
    })
  }

  const getSurpriseBoxRatingAndReviewsFunction = async () => {
    let payload = {
      "serviceProviderID": selectedItemsRef.current[0]?.serviceProviderID,
      "pageNumber": 1,
      "pageSize": 10
    }
    await getSurpriseBoxRatingAndReviews(payload).then((response) => {
      if (response?.succeeded) {
        setRatingAndReviewsData(response?.data)
      }
    })
  }

  const increaseQty = (item: any) => {
    const surpriseBoxUpdatedData = surpriseBoxData.map((i: any) =>
      i.surpriseBoxID === item.surpriseBoxID
        ? {
          ...i,
          quantity: i.quantity < i.noOfBoxRemaing ? i.quantity + 1 : i.quantity,
        }
        : i
    );
    const vendorsUpdatedData = vendorItemsData.map((i: any) =>
      i.surpriseBoxID === item.surpriseBoxID
        ? {
          ...i,
          quantity: i.quantity < i.noOfBoxRemaing ? i.quantity + 1 : i.quantity,
        }
        : i
    );
    setSurpriseBoxData(surpriseBoxUpdatedData);
    setVendorItemsData(vendorsUpdatedData);
  };

  const decreaseQty = (item: any) => {
    const surpriseBoxUpdatedData = surpriseBoxData.map((i: any) =>
      i.surpriseBoxID === item.surpriseBoxID
        ? {
          ...i,
          quantity: i.quantity > 0 ? i.quantity - 1 : i.quantity,
        }
        : i
    );
    const vendorsUpdatedData = surpriseBoxData.map((i: any) =>
      i.surpriseBoxID === item.surpriseBoxID
        ? {
          ...i,
          quantity: i.quantity > 0 ? i.quantity - 1 : i.quantity,
        }
        : i
    );
    setSurpriseBoxData(surpriseBoxUpdatedData);
    setVendorItemsData(vendorsUpdatedData);
  };

  const handleVendorItemsFunction = async () => {
    setListLoader(true);
    let user_id = await AsyncStorage.getItem("user_id")
    let payload = {
      "userID": user_id,
      "serviceProviderID": selectedItemsRef.current[0]?.serviceProviderID,
      "pageNumber": pageNumber.current,
      "pageSize": 10,
      "maxDistanceKm": radiusSelector,
      "minPrice": 0,
      "maxPrice": 20000
    }

    await getAllActiveSurpriseBoxesBySPId(payload).then((response) => {
      setListLoader(false);
      if (response?.succeeded) {
        const updatedData = response?.data?.map((item: any) => ({
          ...item,
          quantity: 0,
        }));
        let data = updatedData.filter((item: any) => item?.surpriseBoxID != surpriseBoxID)
        setVendorItemsData(data)
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
        handleVendorItemsFunction();
      }
    }
  };

  const handleSelectedItem = (item: any) => {
    const exists = surpriseBoxData.some(i => i.surpriseBoxID === item.surpriseBoxID);
    if (!exists) {
      let data = [...surpriseBoxData, item];
      setSurpriseBoxData(data);
    }
  };

  const handleDeleteData = (item: any, type: any) => {
    // if (type == 1) {
    //   const updatedData = surpriseBoxData.filter(i => i.surpriseBoxID != item.surpriseBoxID);
    //   setSurpriseBoxData(updatedData);
    // }
    // if (type == 2) {
    //   const updatedData = vendorItemsData.filter(i => i.surpriseBoxID != item.surpriseBoxID);
    //   setVendorItemsData(updatedData);
    // }
  }

  const handleAddToCart = async (item: any) => {
    let surpriseBoxUpdatedData = surpriseBoxData.map(i =>
      i.surpriseBoxID === item.surpriseBoxID ? { ...item, quantity: item.quantity + 1 } : i
    );

    let vendorItemsUpdatedData = vendorItemsData.map(i =>
      i.surpriseBoxID === item.surpriseBoxID ? { ...item, quantity: item.quantity + 1 } : i
    );

    setSurpriseBoxData(surpriseBoxUpdatedData);
    setVendorItemsData(vendorItemsUpdatedData);
    const concatArray = [...surpriseBoxUpdatedData, ...vendorItemsUpdatedData];
    const uniqueArray = concatArray.filter((item, index, self) => index == self.findIndex(i => i.surpriseBoxID == item.surpriseBoxID));
    const updateArray = uniqueArray.filter((item) => item?.quantity > 0);
    selectedItemArrayRef.current = updateArray;
    await handleAddToCartApiFunction(selectedItemArrayRef.current);
  }

  const handleAddToCartApiFunction = async (updatedData: any) => {
    const user_id = await AsyncStorage.getItem("user_id");
    const items: CheckoutItem[] = updatedData.map((box: any) => ({
      surpriseBoxID: box.surpriseBoxID,
      quantity: box.quantity,
      unitPrice: box.discountedPrice * box.quantity,
    }));
    const payload = {
      "userID": user_id,
      "appliedCouponCode": "",
      "isActive": true,
      "isCheckedOut": false,
      "items": items
    };

    await insertUpdateCart(payload).then((response) => {
      if (response?.succeeded) {
        cartIdRef.current = response?.data?.cartID
      }
    })
  }

  const handleCheckOutNavigation = async () => {
    if (selectedItemArrayRef.current?.length == 0) return;
    const user_id = await AsyncStorage.getItem("user_id");
    const items: CheckoutItem[] = selectedItemArrayRef.current.map((box: any) => ({
      surpriseBoxID: box.surpriseBoxID,
      quantity: box.quantity,
      unitPrice: box.discountedPrice * box.quantity,
    }));

    const payload = {
      "id": cartIdRef.current,
      "userID": user_id,
      "appliedCouponCode": "",
      "isActive": true,
      "isCheckedOut": false,
      "items": items
    };

    await insertUpdateCart(payload).then((response) => {
      if (response?.succeeded) {
        setShowToast(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
          dispatch(setMealDataList(surpriseBoxData));
          navigation.navigate("OrderPlaceScreen", {
            surpriseBoxID: surpriseBoxID
          })
        }, 1000);
      } else {
        setShowToast(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }
    }).catch((err: any) => console.log(err))
  }

  return (
    <View style={styles.container}>
      {showToast && <CustomToast message={toastMessage} />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View>
          <Pressable style={styles.header} onPress={() => navigation.goBack()}>
            <Image source={Icons.ArrowIcon} resizeMode="contain" style={{ height: 18, width: 18, transform: [{ "rotate": "-90deg" }] }} />
            <Text style={styles.headerTitle}>  {selectedItemsRef.current[0]?.serviceProviderName}</Text>
          </Pressable>
        </View>
        <View style={styles.reviewSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.reviewHeader}>Customer Reviews:</Text>
            <Text style={styles.reviewRating}>
              {`${ratingAndReviewsData?.overallAverageRating ?? 0}/5 (${ratingAndReviewsData?.totalReviews
                ? `${ratingAndReviewsData.totalReviews} ${ratingAndReviewsData.totalReviews > 1 ? "reviews" : "review"}`
                : "No reviews"
                })`}
            </Text>

          </View>

          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Quality:</Text>
            <StarRatingComponent
              rating={ratingAndReviewsData?.averageQualityRating ?? 0}
              onChange={(newRating) => console.log(newRating)}
              color="#FFB800"
              size={20}
              readOnly={true}
              showText={false}
            />
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Quantity:</Text>
            <StarRatingComponent
              rating={ratingAndReviewsData?.averageQuantityRating ?? 0}
              onChange={(newRating) => console.log(newRating)}
              color="#FFB800"
              size={20}
              readOnly={true}
              showText={false}
            />
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Taste:</Text>
            <StarRatingComponent
              rating={ratingAndReviewsData?.averageTasteRating ?? 0}
              onChange={(newRating) => console.log(newRating)}
              color="#FFB800"
              size={20}
              readOnly={true}
              showText={false}
            />
          </View>

          <Pressable style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Reviews →</Text>
          </Pressable>
        </View>
        <View>
          {
            surpriseBoxData?.map((item: any, index) => {
              return (
                <View key={index} style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 5 }}>
                  <SurpriseBoxCart
                    surpriseBoxData={item}
                    onPressDelete={() => handleDeleteData(item, 1)}
                    onPressAddToCart={() => handleAddToCart(item)}
                    onPressIncreaseQty={() => increaseQty(item)}
                    onPressDecreaseQty={() => decreaseQty(item)}
                  />
                </View>
              )
            })
          }
        </View>
        {
          listLoader ?
            <View style={{ display: "flex", alignItems: 'center', justifyContent: "center", flex: 1, marginTop: 50 }}>
              <ActivityIndicator size={"large"} />
            </View>
            : vendorItemsData?.length > 0 ?
              <View>
                {
                  vendorItemsData?.map((item, index) => {
                    return (
                      <View key={index} style={{ marginBottom: 5, paddingLeft: 5, paddingRight: 5 }}>
                        <SurpriseBoxCart
                          surpriseBoxData={item}
                          onPressDelete={() => handleDeleteData(item, 2)}
                          onPressAddToCart={() => handleAddToCart(item)}
                          onPressIncreaseQty={() => increaseQty(item)}
                          onPressDecreaseQty={() => decreaseQty(item)}
                        />
                      </View>
                    )
                  })
                }
              </View>
              :
              <Pressable
                onPress={() => navigation.navigate("LocationScreen")} style={{ display: "flex", alignItems: 'center', justifyContent: "center", flex: 1 }}>
                <Text>No Offer Available</Text>
              </Pressable>
        }
      </ScrollView>

      <View style={styles.checkoutBar}>
        <Pressable style={styles.checkoutButton} onPress={() => handleCheckOutNavigation()}>
          <Text style={styles.checkoutText}>CHECKOUT</Text>
        </Pressable>
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backArrow: {
    fontSize: 20,
    color: "#333",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
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
    justifyContent: "space-between",
    marginTop: 6,
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
    paddingHorizontal: 20,
  },
  reviewHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  reviewRating: {
    fontSize: 14,
    color: "#333",
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
    bottom: 0,
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FAFAFA",
    paddingVertical: 15,
    alignItems: "center",
  },
  checkoutButton: {},
  checkoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
});