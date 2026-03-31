import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    TextInput,
    Modal,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    ImageBackground,
    ActivityIndicator
} from "react-native";
import { Icons, Images } from "../../theme/AssetsUrl";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DrawerParamList } from "../../navigation/DrawerNavigation";
import { DrawerNavigationProp, DrawerScreenProps } from "@react-navigation/drawer";
import { getSurpriseBoxDetailsById } from "../../../helpers/Services/surprise_box";
import { IMG_URL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import { setMealDataList } from "../../store/Slices/mealQuantitySlice";
import SurpriseBoxCart from "../../component/CommonComponent/SurpriseBoxCart";
import language_data_json from "../../JSON/language.json";
import LinearGradient from "react-native-linear-gradient";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { FONTS } from "../../theme/FontsLink";
import OrderPlaceCart from "../../component/CommonComponent/OrderPlaceCart";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { checkOut, getCartByUserId, insertUpdateCart } from "../../../helpers/Services/cart";
import { getData } from "../../utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomToast from "../../component/CustomToast";
import { DefaultStyle } from "../../theme/styles/DefaultStyle";

type Props = DrawerScreenProps<DrawerParamList, "OrderPlaceScreen">;
type CheckoutNavigationProp = DrawerNavigationProp<DrawerParamList, "OrderPlaceScreen">;

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
    decLoading: boolean;
    incLoading: boolean;
}

type AppItems = {
    Checkout: string;
    AvailOffers: string;
    Coupons: string;
    OriginalPrice: string;
    OfferPrice: string;
    PlatformFee: string;
    YouSave: string;
    TotalPay: string;
    TermsandCondition: string;
    PlaceOrder: string;
    YourCartIsEmpty: string;
    BrowseProducts: string;
    EnterCouponCode: string;
    Apply: string;
};

type LanguageMap = {
    en: { app_items: AppItems };
    ar: { app_items: AppItems };
};

type SupportedLang = keyof LanguageMap; // "en" | "ar"

const language_data = language_data_json as LanguageMap;

const OrderPlaceScreen: React.FC<Props> = ({ route }) => {
    const { cartId, payloadData } = route.params;

    const quantitySelector = useSelector((state: RootState) => state?.mealQuantitySlice?.mealData);
    const languageSelector = useSelector((state: RootState) => state?.languageSlice?.selected_language);
    const platFormFeesSelector = useSelector((state: RootState) => state.ventorAndMealSlice?.platform_fees as any);

    const navigation = useNavigation<CheckoutNavigationProp>();
    const dispatch = useDispatch();

    const totalAmountRef = useRef<any>(0);
    const isSubmittingRef = useRef(false);
    const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cartIdRef = useRef("");
    const couponCodeRef = useRef("");

    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");
    const [instructions, setInstructions] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [surpriseBoxData, setSurpriseBoxData] = useState<SurpriseBoxData[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [showRemoveCoupon, setShowRemoveCoupon] = useState(false);
    const [couponCodeAmount, setCouponCodeAmount] = useState(0);
    const [errorCouponCode, setErrorCouponCode] = useState("");
    const [cartIdData, setCartIdData] = useState("");
    const [buttonDisable, setButtonDisable] = useState(false);
    const [couponPercentage, setCouponPercentage] = useState("");
    const [savingAmount, setSavingAmount] = useState("");
    const [finalAmount, setFinalAmount] = useState("");

    const AppLabels = language_data[selectedLanguage].app_items;

    useEffect(() => {
        if (languageSelector === "en" || languageSelector === "ar") {
            setSelectedLanguage(languageSelector);
        }
    }, [languageSelector]);

    useEffect(() => {
        if (cartId) {
            cartIdRef.current = cartId
        }
    }, [cartId])

    // useEffect(() => {
    //     AsyncStorage.getItem("cartIdData").then((response) => {
    //         if (response) {
    //             cartIdRef.current = response
    //         }
    //     })
    // }, [])

    useEffect(() => {
        return () => {
            clearNavigationTimeout();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (Array.isArray(quantitySelector) && quantitySelector.length > 0) {
                setSurpriseBoxData(quantitySelector);
                handleWithOutPayloadFunction();
            }
        }, [quantitySelector])
    );

    // const increaseQty = (item: SurpriseBoxData, index: any) => {
    //     const updatedData = surpriseBoxData.map(i =>
    //         i.surpriseBoxID === item.surpriseBoxID
    //             ? {
    //                 ...i,
    //                 quantity: i.quantity < i.noOfBoxRemaing ? i.quantity + 1 : i.quantity,
    //             }
    //             : i
    //     );
    //     dispatch(setMealDataList(updatedData));
    //     setSurpriseBoxData(updatedData);
    // };

    const increaseQty = (item: any, index: any) => {
        let isLimitReached = false;

        const updatedData = surpriseBoxData.map((i: any) => {
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

        dispatch(setMealDataList(updatedData));
        setSurpriseBoxData(updatedData);
    };


    const decreaseQty = (item: SurpriseBoxData, index: any) => {
        const updatedData = surpriseBoxData.map(i =>
            i.surpriseBoxID === item.surpriseBoxID
                ? {
                    ...i,
                    quantity: i.quantity > 0 ? i.quantity - 1 : i.quantity,
                }
                : i
        );
        dispatch(setMealDataList(updatedData));
        setSurpriseBoxData(updatedData);
    };

    useEffect(() => {
        if (couponCodeAmount) {
            const actualTotal = surpriseBoxData.reduce(
                (sum, item) => sum + (item.actualPrice || 0) * (item.quantity || 0),
                0
            );

            const discountedTotal = surpriseBoxData.reduce(
                (sum, item) => sum + (item.discountedPrice || 0) * (item.quantity || 0),
                0
            );

            const couponApplied = Math.min(
                couponCodeAmount || 0,
                discountedTotal
            );

            const savedAmount = actualTotal - discountedTotal + couponApplied;
            setSavingAmount(`AED ${savedAmount.toFixed(2)}`)
        }
    }, [couponCodeAmount])

    const priceSummary = useMemo(() => {
        if (!Array.isArray(surpriseBoxData) || surpriseBoxData.length === 0) {
            return {
                actual: "AED 0.00",
                offer: "AED 0.00",
                save: "AED 0.00",
                total: "AED 0.00",
            };
        }

        const actualTotal = surpriseBoxData.reduce(
            (sum, item) => sum + (item.actualPrice || 0) * (item.quantity || 0),
            0
        );

        const discountedTotal = surpriseBoxData.reduce(
            (sum, item) => sum + (item.discountedPrice || 0) * (item.quantity || 0),
            0
        );

        const couponApplied = Math.min(
            couponCodeAmount || 0,
            discountedTotal
        );

        const savedAmount = actualTotal - discountedTotal + couponApplied;
        totalAmountRef.current = discountedTotal + (platFormFeesSelector || 0);

        return {
            actual: `AED ${actualTotal.toFixed(2)}`,
            offer: `AED ${discountedTotal.toFixed(2)}`,
            save: `AED ${savedAmount.toFixed(2)}`,
            // total: `AED ${totalPayable.toFixed(2)}`,
        };
    }, [surpriseBoxData, couponCodeAmount, platFormFeesSelector]);


    // const handlePriceCalculation = (key: string) => {
    //     if (!Array.isArray(surpriseBoxData) || surpriseBoxData.length === 0) {
    //         return "AED 0.00";
    //     }

    //     const actualTotal = surpriseBoxData.reduce(
    //         (sum, item) => sum + (item.actualPrice || 0) * (item.quantity || 0),
    //         0
    //     );

    //     const discountedTotal = surpriseBoxData.reduce(
    //         (sum, item) => sum + (item.discountedPrice || 0) * (item.quantity || 0),
    //         0
    //     );

    //     switch (key) {
    //         case "actual":
    //             return `AED ${actualTotal.toFixed(2)}`;

    //         case "offer":
    //             return `AED ${discountedTotal.toFixed(2)}`;

    //         case "save": {
    //             const savedAmount = (actualTotal - discountedTotal) + couponCodeAmount;
    //             return `AED ${savedAmount.toFixed(2)}`;
    //         }

    //         case "total":
    //             let total = (discountedTotal + platFormFeesSelector) - couponCodeAmount;
    //             totalAmountRef.current = (discountedTotal + platFormFeesSelector);
    //             return `AED ${total.toFixed(2)}`;

    //         default:
    //             return "AED 0.00";
    //     }
    // };

    const insertUpdateCartDataApplyCoupon = async () => {
        handleWithOutPayloadFunction();
    };

    const handleWithOutPayloadFunction = async () => {
        const user_id = await AsyncStorage.getItem("user_id");
        const cartID = await AsyncStorage.getItem("cartIdData");
        const items = quantitySelector.map((box: any) => ({
            surpriseBoxID: box.surpriseBoxID,
            quantity: box.quantity,
            unitPrice: box.discountedPrice
        }));

        let payload: any = {
            "id": cartID ? cartID : cartIdRef.current,
            "userID": user_id,
            "appliedCouponCode": couponCodeRef.current,
            "isActive": true,
            "isCheckedOut": false,
            "items": items?.filter((item) => item?.quantity > 0)
        };
        if (!cartID || items?.length == 1 || !cartIdRef.current) {
            delete payload?.id
        }
        try {
            const response = await insertUpdateCart(payload);
            if (response?.succeeded) {
                setFinalAmount(`AED ${response?.data?.finalAmount}`);
                cartIdRef.current = response?.data?.cartID;
                await AsyncStorage.setItem("cartIdData", response?.data?.cartID);
                setErrorCouponCode("");
                setCouponCodeAmount(response?.data?.discountAmount);
                setCouponPercentage(response?.data?.couponDescription);
                if (response?.data?.discountAmount > 0) {
                    setShowCouponModal(false);
                    setShowRemoveCoupon(true);
                } else {
                    setSavingAmount("");
                    setShowCouponModal(couponCode ? true : false);
                    setShowRemoveCoupon(false);
                    setCouponCodeAmount(0);
                }
            } else {
                setSavingAmount("");
                setShowCouponModal(true);
                setShowRemoveCoupon(false);
                setErrorCouponCode(response?.messages[0]);
                setCouponCodeAmount(0);
            }
        } catch (error) {
            console.log("API error:", error);
        }
    }

    const handleCheckOutApi = async () => {
        await insertUpdateCartDataFromHome()
    }

    const clearNavigationTimeout = () => {
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
        }
    };


    const insertUpdateCartDataFromHome = async () => {
        setButtonDisable(true);

        try {
            const user_id = await AsyncStorage.getItem("user_id");

            const items = quantitySelector
                .map((box: any) => ({
                    surpriseBoxID: box.surpriseBoxID,
                    quantity: box.quantity,
                    unitPrice: box.discountedPrice,
                }))
                .filter(item => item.quantity > 0);

            const payload = {
                id: cartIdRef.current,
                userID: user_id,
                appliedCouponCode: couponCode,
                isActive: true,
                isCheckedOut: false,
                specialInstruction: instructions,
                items,
            };

            const response = await insertUpdateCart(payload);
            if (!response?.succeeded) {
                setIsSuccess(false);
                setToastMessage(response?.messages?.[0]);
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 2000)
                setShowCouponModal(true);
                setButtonDisable(false);
                return;
            }

            await handleOrderPlaceApi();

        } catch (error) {
            console.log("API error:", error);
            setIsSuccess(false);
            setToastMessage("Something went wrong");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 2000)
            setButtonDisable(false);
        }
    };


    const handleOrderPlaceApi = async () => {
        try {
            const user_id = await AsyncStorage.getItem("user_id");

            const payload = {
                cartID: cartIdRef.current,
                userID: user_id,
                taxAmount: 0,
                paymentMode: "UPI",
                platformFees: platFormFeesSelector,
                paymentGatewayTxnId: "10908789098",
            };
            console.log(JSON.stringify(payload));
            const response = await checkOut(payload);

            if (!response?.succeeded) {
                setIsSuccess(false);
                setToastMessage(response?.messages?.[0]);
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 2000);
                setButtonDisable(false);
                return;
            }
            setIsSuccess(true);
            setToastMessage(response?.messages?.[0]);
            setShowToast(true);

            setTimeout(() => {
                setShowToast(false);
            }, 2000);

            navigation.navigate("PaymentProcessingScreen", {
                orderID: response.data.orderID,
                paymentStatus: response.data.paymentStatus,
                gatewayTransactionID: response.data.transactionID,
                paidAmount: response.data.totalAmount,
                remarks: instructions,
            });

        } catch (error) {
            console.log("checkout error", error);

            setIsSuccess(false);
            setToastMessage("Cart already checked out");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 2000);
            setButtonDisable(false);
        }
    };


    const handleCouponCodeData = async () => {
        if (!couponCode) {
            setErrorCouponCode("Enter Coupon Code");
            return;
        }
        await insertUpdateCartDataApplyCoupon();
    }

    const handleRemoveCouponCode = async () => {
        setShowCouponModal(false);
        setShowRemoveCoupon(false);
        setCouponCodeAmount(0)
        couponCodeRef.current = "";
        setSavingAmount(couponCodeRef.current);
        setCouponCode(couponCodeRef.current);
        await handleWithOutPayloadFunctionData()
    }

    const handleWithOutPayloadFunctionData = async () => {
        const user_id = await AsyncStorage.getItem("user_id");
        const cartID = await AsyncStorage.getItem("cartIdData");
        const items = quantitySelector.map((box: any) => ({
            surpriseBoxID: box.surpriseBoxID,
            quantity: box.quantity,
            unitPrice: box.discountedPrice
        }));

        let payload: any = {
            "id": cartID ? cartID : cartIdRef.current,
            "userID": user_id,
            "appliedCouponCode": couponCodeRef.current,
            "isActive": true,
            "isCheckedOut": false,
            "items": items?.filter((item) => item?.quantity > 0)
        };
        if (!cartID || items?.length == 1 || !cartIdRef.current) {
            delete payload?.id
        }
        try {
            const response = await insertUpdateCart(payload);
            if (response?.succeeded) {
                setFinalAmount(`AED ${response?.data?.finalAmount}`);
                cartIdRef.current = response?.data?.cartID;
                await AsyncStorage.setItem("cartIdData", response?.data?.cartID);
                setErrorCouponCode("");
                setCouponCodeAmount(response?.data?.discountAmount);
                setCouponPercentage(response?.data?.couponDescription);
                setShowCouponModal(true);
                setShowRemoveCoupon(false);
            }
        } catch (error) {
            console.log("API error:", error);
        }
    }

    const handleOffPercentage = (
        couponCodeAmount: number,
        totalAmount: number
    ) => {
        if (!totalAmount || totalAmount <= 0) return '0%';

        const offPercentage = (couponCodeAmount / totalAmount) * 100;
        return `${Math.round(offPercentage)}%`;
    };

    const removeEmojis = (text: string) => {
        return text.replace(
            /[\u{1F300}-\u{1FAFF}]/gu,
            ''
        );
    };


    return (
        <View style={styles.container}>
            <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
                {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess} />}
                <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(350), flex: 1 }} resizeMode="contain" imageStyle={{ tintColor: "#23302A" }}>
                    <View style={{ marginTop: "5%" }}>
                        <Pressable style={styles.header} onPress={() => navigation.goBack()}>
                            <Image source={Icons.BackIcon} resizeMode="contain" style={{ height: heightPixel(18), width: widthPixel(18) }} />
                            <Text style={styles.headerTitle}>  {`${AppLabels?.Checkout}`}</Text>
                        </Pressable>
                    </View>

                    <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 50, borderTopRightRadius: 50, overflow: "hidden", paddingLeft: "4%", paddingRight: "4%", paddingTop: 25, flex: 1 }}>
                        <View style={{ height: 185, width: 185, position: "absolute", bottom: -40, right: -40 }}>
                            <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
                        </View>
                        {surpriseBoxData && surpriseBoxData?.filter(item => item?.quantity > 0)?.length > 0 ? (
                            <>
                                <KeyboardAwareScrollView
                                    enableOnAndroid={true}
                                    extraScrollHeight={50}
                                    extraHeight={Platform.OS === "ios" ? 120 : 80}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 140 }}
                                >
                                    <View style={{ marginBottom: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 2, borderBottomColor: "#264941", paddingBottom: 5 }}>
                                        <Text style={{ color: "#264941", fontSize: fontPixel(18), fontFamily: FONTS.tenonMediumFont, paddingLeft: 5 }}>Items</Text>
                                        <Text style={{ color: "#264941", fontSize: fontPixel(18), fontFamily: FONTS.tenonMediumFont, marginRight: 40 }}>QTY</Text>
                                    </View>

                                    {surpriseBoxData
                                        ?.filter(item => item?.quantity > 0)
                                        .map((surpriseBoxDataItem, index, filteredArray) => {
                                            const isLastItem = index === filteredArray.length - 1;

                                            return (
                                                <View
                                                    key={surpriseBoxDataItem.surpriseBoxID ?? index}
                                                    style={{
                                                        paddingVertical: '1%',
                                                        borderBottomWidth: isLastItem ? 0 : 1,
                                                        borderColor: isLastItem ? 'transparent' : '#ddd',
                                                    }}
                                                >
                                                    <OrderPlaceCart
                                                        surpriseBoxData={surpriseBoxDataItem}
                                                        onPressDelete={() => console.log('delete')}
                                                        onPressAddToCart={() => console.log('add')}
                                                        onPressIncreaseQty={() => increaseQty(surpriseBoxDataItem, index)}
                                                        onPressDecreaseQty={() => decreaseQty(surpriseBoxDataItem, index)}
                                                    />
                                                </View>
                                            );
                                        })}


                                    {/* Offers / Coupons */}
                                    <View style={{
                                        marginBottom: 15,
                                        backgroundColor: "#EAFFEB",
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        paddingTop: 10,
                                        borderRadius: 10,
                                        marginTop: 10,
                                    }}>
                                        {!showRemoveCoupon &&
                                            <Pressable style={[styles.offersSection, { paddingBottom: 10 }]} onPress={() => setShowCouponModal(!showCouponModal)}>
                                                <Text style={styles.offersText}>{`${AppLabels?.AvailOffers} / ${AppLabels?.Coupons}`}</Text>
                                                <View>
                                                    <Image source={Icons.ArrowGreenIcon} resizeMode="contain" style={{ height: heightPixel(16), width: widthPixel(16), transform: [{ "rotate": showCouponModal ? "90deg" : "0deg" }] }} />
                                                </View>
                                            </Pressable>
                                        }
                                        {
                                            showCouponModal &&
                                            <View>
                                                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                    <View style={{
                                                        width: "70%",
                                                        borderWidth: 1,
                                                        borderColor: "#D6D6D6",
                                                        borderRadius: 5,
                                                        backgroundColor: "#fff",
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        paddingRight: 5
                                                    }}>
                                                        <TextInput
                                                            style={styles.textArea}
                                                            placeholder={AppLabels?.EnterCouponCode}
                                                            placeholderTextColor="#9D9D9D"
                                                            autoCapitalize="characters"
                                                            value={couponCode}
                                                            onChangeText={(text: string) => {
                                                                const cleanText = text.replace(/[^A-Za-z0-9]/g, "")
                                                                couponCodeRef.current = cleanText;
                                                                setCouponCode(cleanText);
                                                                if (cleanText.length === 0) {
                                                                    setErrorCouponCode("Enter Coupon Code");
                                                                } else {
                                                                    setErrorCouponCode("");
                                                                }
                                                            }}
                                                        />
                                                        <Pressable onPress={() => [setCouponCode(""), setErrorCouponCode(""), couponCodeRef.current = ""]}>
                                                            <Image source={Icons.CloseIcon} resizeMode="contain" style={{ height: heightPixel(16), width: widthPixel(16) }} tintColor={"#000"} />
                                                        </Pressable>
                                                    </View>

                                                    <Pressable style={[styles.applyButton, { width: "25%" }]} onPress={() => handleCouponCodeData()}>
                                                        <Text style={styles.applyText}>{AppLabels?.Apply}</Text>
                                                    </Pressable>
                                                </View>
                                                <Text style={{ fontSize: fontPixel(15), color: "#BC4242", fontFamily: FONTS.tenonRegularFont, marginBottom: 5, marginTop: 5 }}>{errorCouponCode}</Text>
                                            </View>
                                        }
                                        {
                                            (showRemoveCoupon) && <View style={{ marginTop: 5, marginBottom: 0 }}>
                                                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", width : "95%" }}>
                                                    <Image source={Icons.CheckIconBig} resizeMode="contain" style={{ height: heightPixel(16), width: widthPixel(16) }} />
                                                    <Text style={[styles.applyText, { color: "#2E2E2E", marginLeft: 4 }]}>You will get {couponPercentage} with <Text style={[styles.applyText, { color: "#264941", marginLeft: 4, fontFamily: FONTS.poppinsSemiBoldFont }]}>{couponCode}</Text></Text>
                                                </View>
                                                <Pressable style={{ marginTop: 5, paddingBottom: 5, width: widthPixel(110) }} onPress={() => handleRemoveCouponCode()}>
                                                    <Text style={[styles.applyText, { color: "#BC4242", fontSize: fontPixel(13) }]}>Remove Coupon</Text>
                                                </Pressable>
                                            </View>
                                        }
                                    </View>

                                    {/* Price Summary */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>{`${AppLabels?.OriginalPrice}:`}</Text>
                                            <Text style={[styles.summaryValue, { textDecorationLine: "line-through" }]}>{priceSummary?.actual}</Text>
                                        </View>

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>{`${AppLabels?.OfferPrice}:`}</Text>
                                            <Text style={styles.summaryValue}>{priceSummary?.offer}</Text>
                                        </View>

                                        {
                                            couponCodeAmount > 0 && <View style={styles.summaryRow}>
                                                <Text style={styles.summaryLabel}>{`Coupon (${couponCode})`}</Text>
                                                <Text style={styles.summaryValue}>AED - {couponCodeAmount}</Text>
                                            </View>
                                        }

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>{`${AppLabels?.PlatformFee}:`}</Text>
                                            <Text style={styles.summaryValue}>AED {platFormFeesSelector}</Text>
                                        </View>

                                        <View style={styles.divider} />

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>{`${AppLabels?.YouSave}:`}</Text>
                                            <Text style={styles.summaryValue}>{savingAmount ? savingAmount : priceSummary?.save}</Text>
                                        </View>

                                        <View style={styles.summaryRow}>
                                            <Text style={[styles.summaryLabel, { fontFamily: FONTS.tenonBoldFont }]}>
                                                {`${AppLabels?.TotalPay}:`}
                                            </Text>
                                            <Text style={[styles.summaryValue, { fontFamily: FONTS.tenonBoldFont }]}>
                                                {finalAmount}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 15 }}>
                                        <View>
                                            <Text style={{ color: "#666666", fontFamily: FONTS.tenonRegularFont, fontSize: fontPixel(16), marginBottom: 3 }}>Special Instructions (Optional)</Text>
                                        </View>
                                        <TextInput
                                            placeholder="Add instructions..."
                                            placeholderTextColor="#555"
                                            multiline
                                            maxLength={500}
                                            onChangeText={setInstructions}
                                            style={{ minHeight: heightPixel(100), borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 6, textAlignVertical: "top", color: "#000", fontFamily: FONTS.muliSemiBoldFont }}
                                        />
                                    </View>

                                </KeyboardAwareScrollView>

                                <Pressable
                                    style={[
                                        styles.checkoutBar,
                                        buttonDisable && { opacity: 0.6 }
                                    ]}
                                    disabled={buttonDisable}
                                    pointerEvents={buttonDisable ? "none" : "auto"}
                                    onPress={() => handleCheckOutApi()}
                                >
                                    {
                                        buttonDisable ? (
                                            <ActivityIndicator size="small" />
                                        ) : (
                                            <View>
                                                <View style={styles.checkoutButton}>
                                                    <Text style={styles.checkoutText}>
                                                        {AppLabels?.PlaceOrder}
                                                    </Text>
                                                </View>
                                            </View>
                                        )
                                    }
                                </Pressable>
                            </>
                        ) : (
                            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                                <Text style={{ fontSize: fontPixel(16), color: "#000", marginBottom: 15, fontFamily: FONTS.poppinsSemiBoldFont }}>{AppLabels?.YourCartIsEmpty}</Text>
                                <Pressable
                                    onPress={() => navigation.navigate("DrawerNavigation" as never)}
                                    style={{ backgroundColor: "#264941", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "600" }}>{AppLabels?.BrowseProducts}</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </LinearGradient>
        </View>
    );
};

export default OrderPlaceScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: fontPixel(20),
        fontFamily: FONTS.tenonBoldFont,
        color: "#fff",
    },
    restaurantCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        margin: 16,
    },
    restaurantImage: {
        width: 60,
        height: 60,
        marginRight: 12,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    itemName: {
        fontSize: 14,
        color: "#444",
        marginBottom: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        color: "#444",
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    dropdownText: {
        fontSize: 14,
        color: "#333",
    },
    price: {
        fontSize: 14,
        color: "#000",
        marginTop: 4,
    },
    textArea: {
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonRegularFont,
        includeFontPadding: false,
        paddingLeft: 10,
        color: "#000",
        textTransform: "uppercase"
    },
    offersSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    offersText: {
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonBoldFont,
        color: "#264941",
    },
    arrow: {
        fontSize: 20,
        color: "#333",
    },
    summaryCard: {
        backgroundColor: "#F4F4F4",
        borderRadius: 10,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 5
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: fontPixel(18),
        color: "#264941",
        fontFamily: FONTS.tenonMediumFont,
    },
    summaryValue: {
        fontSize: fontPixel(18),
        color: "#264941",
        fontFamily: FONTS.tenonMediumFont,
    },
    divider: {
        height: 1,
        backgroundColor: "#CCC",
        marginVertical: 8,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginTop: 16,
    },
    checkboxLabel: {
        fontSize: 14,
        color: "#444",
        marginLeft: 8,
    },
    bottomButtonContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#F9F9F9",
        paddingVertical: 14,
    },
    checkboxWrapper: { flexDirection: "row", alignItems: "center", marginLeft: 15, marginTop: 15 },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: "#666",
        marginRight: 8,
        borderRadius: 3,
    },
    termsText: { fontSize: 13, color: "#444" },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-end",
    },
    keyboardView: {
        flex: 1,
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header1: {
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    applyButton: {
        backgroundColor: "#264941",
        borderRadius: 5,
        paddingVertical: 11,
        alignItems: "center",
    },
    applyText: {
        color: "#fff",
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonMediumFont,
        includeFontPadding: false,
    },
    quantitySection: {
        alignItems: "center",
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
    checkoutBar: {
        position: "absolute",
        bottom: 20,
        width: "90%",
        backgroundColor: "#264941",
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 50,
        alignSelf: "center"
    },
    checkoutButton: {},
    checkoutText: {
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonMediumFont,
        color: "#FFFFFF",
    },
});
