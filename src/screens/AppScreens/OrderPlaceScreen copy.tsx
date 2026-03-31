// import React, { useEffect, useRef, useState } from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     Image,
//     Pressable,
//     ScrollView,
//     TextInput,
//     Modal,
//     Keyboard,
//     KeyboardAvoidingView,
//     Platform,
//     TouchableWithoutFeedback
// } from "react-native";
// import { Icons } from "../../theme/AssetsUrl";
// import { useNavigation } from "@react-navigation/native";
// import { DrawerParamList } from "../../navigation/DrawerNavigation";
// import { DrawerScreenProps } from "@react-navigation/drawer";
// import { getSurpriseBoxDetailsById } from "../../../helpers/Services/surprise_box";
// import { IMG_URL } from "../../../config";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../store/rootReducer";
// import { setActualPrice, setDiscountPrice, setMealDataList } from "../../store/Slices/mealQuantitySlice";
// import SurpriseBoxCart from "../../component/CommonComponent/SurpriseBoxCart";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { checkOut } from "../../../helpers/Services/cart";
// import CustomToast from "../../component/CustomToast";

// type Props = DrawerScreenProps<DrawerParamList, "OrderPlaceScreen">;

// interface SurpriseBoxData {
//     sbImageURL: string;
//     serviceProviderName: string;
//     surpriseBoxName: string;
//     actualPrice: number,
//     discountedPrice: number,
//     discountedPercent: number,
//     noOfBoxRemaing: number,
//     distanceInKm: number,
//     collectionFromTime: number,
//     collectionToTime: number,
//     timeToAMPM: string,
//     surpriseBoxRating: number,
//     serviceProviderAddress: string,
//     serviceProviderID: string,
//     surpriseBoxID: string,
//     quantity: number
// }

// const OrderPlaceScreen: React.FC<Props> = ({ route }) => {
//     const { surpriseBoxID, cartId } = route.params;

//     const quantitySelector = useSelector((state: RootState) => state?.mealQuantitySlice?.mealData);

//     const navigation = useNavigation();
//     const dispatch = useDispatch();

//     const totalAmountRef = useRef<any>(0);

//     const [instructions, setInstructions] = useState("");
//     const [agree, setAgree] = useState(false);
//     const [couponCode, setCouponCode] = useState("");
//     const [showCouponModal, setShowCouponModal] = useState(false);
//     const [surpriseBoxData, setSurpriseBoxData] = useState<SurpriseBoxData[]>([]);
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState("");

//     useEffect(() => {
//         if (quantitySelector.length > 0) {
//             setSurpriseBoxData(quantitySelector);
//         }
//     }, [quantitySelector])

//     const increaseQty = (item: any) => {
//         const updatedData = surpriseBoxData.map(i =>
//             i.surpriseBoxID === item.surpriseBoxID
//                 ? {
//                     ...i,
//                     quantity: i.quantity < i.noOfBoxRemaing ? i.quantity + 1 : i.quantity,
//                 }
//                 : i
//         );
//         dispatch(setMealDataList(updatedData));
//         setSurpriseBoxData(updatedData);
//     };

//     const decreaseQty = (item: any) => {
//         const updatedData = surpriseBoxData.map(i =>
//             i.surpriseBoxID === item.surpriseBoxID
//                 ? {
//                     ...i,
//                     quantity: i.quantity > 0 ? i.quantity - 1 : i.quantity,
//                 }
//                 : i
//         );
//         dispatch(setMealDataList(updatedData));
//         setSurpriseBoxData(updatedData);
//     };

//     const handlePriceCalculation = (key: string) => {
//         if (!Array.isArray(surpriseBoxData) || surpriseBoxData.length === 0) {
//             return "AED 0.00";
//         }

//         const actualTotal = surpriseBoxData.reduce(
//             (sum, item) => sum + (item.actualPrice || 0) * (item.quantity),
//             0
//         );

//         const discountedTotal = surpriseBoxData.reduce(
//             (sum, item) => sum + (item.discountedPrice || 0) * (item.quantity),
//             0
//         );

//         switch (key) {
//             case "actual":
//                 return `AED ${actualTotal.toFixed(2)}`;

//             case "offer":
//                 return `AED ${discountedTotal.toFixed(2)}`;

//             case "save":
//                 const savedAmount = actualTotal - discountedTotal;
//                 return `AED ${savedAmount.toFixed(2)}`;

//             case "total":
//                 totalAmountRef.current = discountedTotal.toFixed(2);
//                 return `AED ${discountedTotal.toFixed(2)}`;

//             default:
//                 return "AED 0.00";
//         }
//     };

//     const handleCheckOutApi = async () => {
//         const user_id = await AsyncStorage.getItem("user_id");
//         let payload = {
//             "cartID": cartId,
//             "userID": user_id,
//             // "taxAmount": totalAmountRef.current,
//             "taxAmount": 0,
//             "paymentMode": "",
//             "paymentGatewayTxnId": ""
//         }
//         console.log(payload);
        
//         await checkOut(payload).then((response) => {
//             if (response?.succeeded) {
//                 setShowToast(true);
//                 setToastMessage(response?.messages[0]);
//                 setTimeout(() => {
//                     setShowToast(false);
//                     navigation.navigate("PaymentScreen" as never)
//                 }, 1000);
//             } else {
//                 setShowToast(true);
//                 setToastMessage(response?.messages[0]);
//                 setTimeout(() => {
//                     setShowToast(false);
//                 }, 1000);
//             }
//         })
//     }


//     return (
//         <View style={styles.container}>
//             {showToast && <CustomToast message={toastMessage} />}
//             {/* Header */}
//             <View>
//                 <Pressable style={styles.header} onPress={() => navigation.goBack()}>
//                     <Image source={Icons.ArrowIcon} resizeMode="contain" style={{ height: 18, width: 18, transform: [{ "rotate": "-90deg" }] }} />
//                     <Text style={styles.headerTitle}>  Checkout</Text>
//                 </Pressable>
//             </View>

//             {
//                 surpriseBoxData?.some((item: any) => item?.quantity > 0) ?
//                     <>
//                         <ScrollView
//                             showsVerticalScrollIndicator={false}
//                             contentContainerStyle={{ paddingBottom: 120 }}
//                         >
//                             {
//                                 surpriseBoxData?.filter((item: any) => item?.quantity > 0)?.map((surpriseBoxData, index) => {
//                                     return (
//                                         <View key={index} style={{ padding: "2%" }}>
//                                             <SurpriseBoxCart
//                                                 surpriseBoxData={surpriseBoxData}
//                                                 onPressDelete={() => console.log(surpriseBoxData, 2)}
//                                                 onPressAddToCart={() => console.log(surpriseBoxData)}
//                                                 onPressIncreaseQty={() => increaseQty(surpriseBoxData)}
//                                                 onPressDecreaseQty={() => decreaseQty(surpriseBoxData)}
//                                             />
//                                         </View>
//                                     )
//                                 })
//                             }

//                             {/* Offers / Coupons */}
//                             <Pressable style={styles.offersSection} onPress={() => setShowCouponModal(true)}>
//                                 <Text style={styles.offersText}>Avail Offers / Coupons</Text>
//                                 <Text style={styles.arrow}>›</Text>
//                             </Pressable>

//                             {/* Price Summary */}
//                             <View style={styles.summaryCard}>
//                                 <View style={styles.summaryRow}>
//                                     <Text style={styles.summaryLabel}>Original Price:</Text>
//                                     <Text style={styles.summaryValue}>{handlePriceCalculation("actual")}</Text>
//                                 </View>
//                                 <View style={styles.summaryRow}>
//                                     <Text style={styles.summaryLabel}>Offer Price:</Text>
//                                     <Text style={styles.summaryValue}>{handlePriceCalculation("offer")}</Text>
//                                 </View>
//                                 <View style={styles.summaryRow}>
//                                     <Text style={styles.summaryLabel}>Platform Fee:</Text>
//                                     <Text style={styles.summaryValue}>AED 2.00</Text>
//                                 </View>

//                                 <View style={styles.divider} />

//                                 <View style={styles.summaryRow}>
//                                     <Text style={styles.summaryLabel}>You Save:</Text>
//                                     <Text style={styles.summaryValue}>{handlePriceCalculation("save")}</Text>
//                                 </View>
//                                 <View style={styles.summaryRow}>
//                                     <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>
//                                         Total to Pay:
//                                     </Text>
//                                     <Text style={[styles.summaryValue, { fontWeight: "700" }]}>
//                                         {handlePriceCalculation("total")}
//                                     </Text>
//                                 </View>
//                             </View>

//                             {/* Terms & Conditions */}
//                             <Pressable
//                                 onPress={() => setAgree(!agree)}
//                                 style={styles.checkboxWrapper}
//                             >
//                                 <View style={styles.checkbox}>
//                                     {
//                                         agree &&
//                                         <View>
//                                             <Image source={Icons.CheckIcon} style={{ height: "100%", width: "100%" }} resizeMode="contain" />
//                                         </View>
//                                     }
//                                 </View>
//                                 <Text style={styles.termsText}>I agree to Terms & Conditions</Text>
//                             </Pressable>
//                         </ScrollView>

//                         {/* Bottom Button */}
//                         <View style={styles.bottomButtonContainer}>
//                             <Pressable
//                                 disabled={!agree}
//                                 style={[
//                                     styles.placeOrderButton,
//                                     !agree && { opacity: 0.6 },
//                                 ]}
//                                 onPress={() => handleCheckOutApi()}
//                             >
//                                 <Text style={styles.placeOrderText}>PLACE ORDER</Text>
//                             </Pressable>
//                         </View>
//                     </> :
//                     <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
//                         <Text style={{ fontSize: 16, color: "#555", marginBottom: 15 }}>
//                             Your cart is empty
//                         </Text>

//                         <Pressable
//                             onPress={() => navigation.navigate("DrawerNavigation" as never)}
//                             style={{
//                                 backgroundColor: "blue",
//                                 paddingVertical: 10,
//                                 paddingHorizontal: 20,
//                                 borderRadius: 8,
//                             }}
//                         >
//                             <Text style={{ color: "#fff", fontWeight: "600" }}>Browse Products</Text>
//                         </Pressable>
//                     </View>
//             }
//             <Modal
//                 animationType="slide"
//                 transparent
//                 visible={showCouponModal}
//                 onRequestClose={() => setShowCouponModal(false)}
//             >
//                 <TouchableWithoutFeedback onPress={() => {
//                     Keyboard.dismiss();
//                     setShowCouponModal(false);
//                 }}>
//                     <View style={styles.overlay}>
//                         <KeyboardAvoidingView
//                             behavior={Platform.OS === "ios" ? "padding" : "height"}
//                             style={styles.keyboardView}
//                         >
//                             <View style={styles.bottomSheet}>
//                                 <View style={styles.header1}>
//                                     <Text style={styles.title}>Enter Coupon Code</Text>
//                                 </View>

//                                 <TextInput
//                                     style={styles.textArea}
//                                     placeholder="Enter Coupon Code"
//                                     placeholderTextColor="#888"
//                                     value={couponCode}
//                                     onChangeText={setCouponCode}
//                                 />

//                                 <Pressable style={styles.applyButton} onPress={() => setShowCouponModal(false)}>
//                                     <Text style={styles.applyText}>Apply</Text>
//                                 </Pressable>
//                             </View>
//                         </KeyboardAvoidingView>
//                     </View>
//                 </TouchableWithoutFeedback>
//             </Modal>
//         </View>
//     );
// };

// export default OrderPlaceScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#fff",
//     },
//     header: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//     },
//     backArrow: {
//         fontSize: 24,
//         color: "#333",
//         marginRight: 10,
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: "600",
//         color: "#333",
//     },
//     restaurantCard: {
//         flexDirection: "row",
//         alignItems: "flex-start",
//         margin: 16,
//     },
//     restaurantImage: {
//         width: 60,
//         height: 60,
//         marginRight: 12,
//     },
//     restaurantName: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: "#333",
//     },
//     itemName: {
//         fontSize: 14,
//         color: "#444",
//         marginBottom: 4,
//     },
//     row: {
//         flexDirection: "row",
//         alignItems: "center",
//     },
//     label: {
//         fontSize: 14,
//         color: "#444",
//     },
//     dropdown: {
//         borderWidth: 1,
//         borderColor: "#999",
//         borderRadius: 4,
//         paddingHorizontal: 8,
//         paddingVertical: 2,
//     },
//     dropdownText: {
//         fontSize: 14,
//         color: "#333",
//     },
//     price: {
//         fontSize: 14,
//         color: "#000",
//         marginTop: 4,
//     },
//     textArea: {
//         borderWidth: 1,
//         borderColor: "#999",
//         borderRadius: 8,
//         padding: 10,
//         textAlignVertical: "top",
//         marginHorizontal: 16,
//         marginBottom: 20,
//     },
//     offersSection: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         marginHorizontal: 16,
//         marginBottom: 20,
//     },
//     offersText: {
//         fontSize: 15,
//         fontWeight: "600",
//         color: "#333",
//     },
//     arrow: {
//         fontSize: 20,
//         color: "#333",
//     },
//     summaryCard: {
//         backgroundColor: "#F5F5F5",
//         borderRadius: 10,
//         marginHorizontal: 16,
//         padding: 16,
//     },
//     summaryRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 8,
//     },
//     summaryLabel: {
//         fontSize: 14,
//         color: "#555",
//     },
//     summaryValue: {
//         fontSize: 14,
//         color: "#333",
//     },
//     divider: {
//         height: 1,
//         backgroundColor: "#CCC",
//         marginVertical: 8,
//     },
//     checkboxRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         marginHorizontal: 16,
//         marginTop: 16,
//     },
//     checkboxLabel: {
//         fontSize: 14,
//         color: "#444",
//         marginLeft: 8,
//     },
//     bottomButtonContainer: {
//         position: "absolute",
//         bottom: 0,
//         width: "100%",
//         backgroundColor: "#F9F9F9",
//         paddingVertical: 14,
//     },
//     placeOrderButton: {
//         alignItems: "center",
//     },
//     placeOrderText: {
//         fontSize: 15,
//         fontWeight: "500",
//         color: "#333",
//     },
//     checkboxWrapper: { flexDirection: "row", alignItems: "center", marginLeft: 15, marginTop: 15 },
//     checkbox: {
//         width: 18,
//         height: 18,
//         borderWidth: 1,
//         borderColor: "#666",
//         marginRight: 8,
//         borderRadius: 3,
//     },
//     termsText: { fontSize: 13, color: "#444" },
//     overlay: {
//         flex: 1,
//         backgroundColor: "rgba(0,0,0,0.3)",
//         justifyContent: "flex-end",
//     },
//     keyboardView: {
//         flex: 1,
//         justifyContent: "flex-end",
//     },
//     bottomSheet: {
//         backgroundColor: "#fff",
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//         padding: 20,
//         // height: "45%", // ✅ half screen height
//     },
//     header1: {
//         alignItems: "center",
//         marginBottom: 10,
//     },
//     title: {
//         fontSize: 16,
//         fontWeight: "600",
//         color: "#333",
//     },
//     applyButton: {
//         backgroundColor: "#4A3AFF",
//         borderRadius: 10,
//         paddingVertical: 12,
//         alignItems: "center",
//         marginTop: 10,
//     },
//     applyText: {
//         color: "#fff",
//         fontWeight: "600",
//         fontSize: 16,
//     },
//     quantitySection: {
//         alignItems: "center",
//     },
//     quantityLabel: {
//         fontSize: 15,
//         fontWeight: "600",
//         color: "#333",
//     },
//     qtyControls: {
//         flexDirection: "row",
//         alignItems: "center",
//     },
//     qtyButton: {
//         width: 32,
//         height: 32,
//         borderWidth: 1,
//         borderColor: "#999",
//         borderRadius: 6,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     qtyText: {
//         fontSize: 20,
//         color: "#333",
//     },
//     qtyValue: {
//         fontSize: 16,
//         fontWeight: "600",
//         marginHorizontal: 20,
//         color: "#333",
//     },
// });