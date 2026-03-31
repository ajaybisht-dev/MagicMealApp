import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
  Modal,
  Alert,
} from "react-native";

import {
  useNavigation,
  DrawerActions,
  useIsFocused,
} from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import type { DrawerParamList } from "../../navigation/DrawerNavigation";

import { Icons, Images } from "../../theme/AssetsUrl";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";

import { getData } from "../../utils/storage";
import CommonHeader from "../../component/CommonHeader";
import LinearGradient from "react-native-linear-gradient";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { DefaultStyle } from "../../theme/styles/DefaultStyle";
import { FONTS } from "../../theme/FontsLink";

import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomToast from "../../component/CustomToast";

import { getCartByUserId } from "../../../helpers/Services/cart";
import { userLocation } from "../../../helpers/Services/userAuth";

import { addApiCartReducer } from "../../store/Slices/addToCartSlice";
import { setMealDataList } from "../../store/Slices/mealQuantitySlice";

import TotalSaving from "./CommonScreen/TotalSaving";

import {
  GetCategoryWiseSaving,
  GetVendorWiseSaving,
} from "../../../helpers/Services/userProfile";

import { setVendorData } from "../../store/Slices/ventorAndMealSlice";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");

type HomeScreenNavigationProp = DrawerNavigationProp<
  DrawerParamList,
  "Home"
>;

const SavingScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const addressSelector = useSelector(
    (state: RootState) => state?.locationRadiusSlice?.address
  );
  const radiusSelector = useSelector(
    (state: RootState) => state?.locationRadiusSlice?.radius
  );
  const languageSelector = useSelector(
    (state: RootState) => state?.languageSlice?.selected_language
  );
  const logoutSelector = useSelector(
    (state: RootState) => state?.logoutSlice?.logoutMessage
  );
  const addToCartSelector = useSelector(
    (state: RootState) => state?.mealQuantitySlice?.mealData
  );
  const totalSavingSelector = useSelector(
    (state: RootState) => state?.totalSavingSlice?.totalSavingData
  );

  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar">("en");
  const [openDateTimeModal, setOpenDateTimeModal] = useState(false);

  const [openSelectDateTypeModal, setOpenSelectDateTypeModal] = useState(false);
  const [openRangeModal, setOpenRangeModal] = useState(false);
  const [thisMonthModal, setThisMonthModal] = useState(false);

  const [currentLocation, setCurrentLocation] = useState<string | null>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [userTotalSaving, setUserTotalSaving] = useState<any>(null);
  const [savingData, setSavingData] = useState<any>(null);
  const [userAccountDate, setUserAccountDate] = useState<any>(null);
  const [range, setRange] = useState({ start: "", end: "" });
  const [isValid, setIsValid] = useState(false);

  const [selectedSection, setSelectedSection] = useState<String>("Vendor Wise");

  const cartIdRef = useRef(null);

  // const getFirstDayOfMonth = () => {
  //   const now = new Date();
  //   return new Date(now.getFullYear(), now.getMonth(), 1);
  // };

  const getFirstDayOfMonth = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return yesterday;
  };

  const [currentDate, setCurrentDate] = useState(getFirstDayOfMonth());

  useEffect(() => {
    setUserTotalSaving(totalSavingSelector);
  }, [totalSavingSelector]);

  useEffect(() => { }, [addToCartSelector]);

  useEffect(() => {
    const updateValues = async () => {
      if (languageSelector === "en" || languageSelector === "ar") {
        setSelectedLanguage(languageSelector);
      }
      if (addressSelector) {
        setCurrentLocation(addressSelector);
      } else {
        const data = await AsyncStorage.getItem("locationData");
        if (data) {
          setCurrentLocation(data);
        }
      }
    };

    updateValues();
  }, [languageSelector, addressSelector]);

  useEffect(() => {
    setThisMonthRange();
    setVendorData(null);
    setCurrentDate(getFirstDayOfMonth());
    setSelectedSection("Vendor Wise");
    handleCartLengthFromAPI();
    handleUserAccountCreatedDate();
  }, [isFocused]);

  useEffect(() => {
    if (range.end) {
      handleSelection(selectedSection);
    }
  }, [range]);

  useEffect(() => {
    if (range.end) {
      handleSelection(selectedSection);
    }
  }, [selectedSection]);

  useEffect(() => {
    if (logoutSelector) {
      setShowToast(true);
      setToastMessage(logoutSelector);
    }
  }, [logoutSelector]);


  const handleUserAccountCreatedDate = async () => {
    const storedData = await AsyncStorage.getItem("userProfileData");
    if (!storedData) return;

    const userData = JSON.parse(storedData);

    if (!userData?.createdOn) {
      setUserAccountDate("Member Since: -");
      return;
    }

    const date = new Date(userData.createdOn);

    if (isNaN(date.getTime())) {
      setUserAccountDate("Member Since: -");
      return;
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    setUserAccountDate(`Member Since: ${month} ${year}`);
  };

  const handleCartLengthFromAPI = async () => {
    const userData = await getData("userData");
    const cartData = await AsyncStorage.getItem("CartDataArray");
    const parseData = cartData ? JSON.parse(cartData) : [];
    dispatch(addApiCartReducer(parseData));
    dispatch(setMealDataList(parseData));
    let payload = {
      userID: userData?.userID,
    };
    if (!cartIdRef.current) {
      await getCartByUserId(payload).then((response) => {
        if (response?.succeeded) {
          cartIdRef.current = response?.data?.cartID;
        }
      });
    }
  };

  useEffect(() => {
    handleUserLocationFunction();
  }, []);

  const handleUserLocationFunction = async () => {
    const userData = await getData("userData");
    const getCords = await AsyncStorage.getItem("locationCords");
    const nearByAddress = await AsyncStorage.getItem("locationData");
    const parsedCords = getCords ? JSON.parse(getCords) : null;
    const Radius = await AsyncStorage.getItem("Radius");
    const parsedRadius = Radius ? JSON.parse(Radius) : radiusSelector;
    const payload = {
      userId: userData?.userID ?? "",
      latitude: parsedCords?.latitude ?? 0,
      longitude: parsedCords?.longitude ?? 0,
      nearByAddress: nearByAddress ?? "",
      distanceInMiles: parsedRadius,
    };
    await userLocation(payload);
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleSelection = (item: any) => {
    setSelectedSection(item);
    if (item == "Vendor Wise") {
      handleVendorApiFunction();
    }
    if (item == "Category Wise") {
      handleCategoryApiFunction();
    }
  };

  const handleVendorApiFunction = async () => {
    let user_id = await AsyncStorage.getItem("user_id");
    let startDateISO = new Date(range.start).toISOString().split("T")[0];
    let endDateISO = new Date(range.end).toISOString().split("T")[0];

    let startDate = startDateISO + "T00:00:00.000Z";
    let endDate = endDateISO + "T23:59:59.999Z";
    let payload = {
      userID: user_id,
      fromDate: startDate,
      toDate: endDate,
    };
    console.log("data1", JSON.stringify(payload));

    await GetVendorWiseSaving(payload).then((response) => {
      if (response?.succeeded) {
        setSavingData(response?.data);
      }
    });
  };

  const toISO = (date: any) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const handleCategoryApiFunction = async () => {
    let user_id = await AsyncStorage.getItem("user_id");
    let startDateISO = new Date(range.start).toISOString().split("T")[0];
    let endDateISO = new Date(range.end).toISOString().split("T")[0];

    let startDate = startDateISO + "T00:00:00.000Z";
    let endDate = endDateISO + "T23:59:59.999Z";
    let payload = {
      userID: user_id,
      fromDate: startDate,
      toDate: endDate,
    };
    console.log("data2", JSON.stringify(payload));

    await GetCategoryWiseSaving(payload).then((response) => {
      if (response?.succeeded) {
        setSavingData(response?.data);
      }
    });
  };

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  const handleDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  // const onDayPress = (day: any) => {
  //   if (!range.start || (range.start && range.end)) {
  //     setRange({ start: day.dateString, end: "" });
  //   } else {
  //     setRange({ start: range.start, end: day.dateString });
  //   }
  // };

  const onDayPress = (day: any) => {
    const selected = day.dateString;
    if (!range.start || range.end) {
      setRange({ start: selected, end: "" });
      return;
    }
    if (new Date(selected) < new Date(range.start)) {
      setRange({ start: selected, end: "" });
      return;
    }
    setRange({ start: range.start, end: selected });
  };


  const getMarkedDates = () => {
    let marked: any = {};

    if (range.start) {
      marked[range.start] = { startingDay: true, color: "#264941", textColor: "white" };
    }

    if (range.start && range.end) {
      let start = new Date(range.start);
      let end = new Date(range.end);

      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        let date = d.toISOString().split("T")[0];

        marked[date] = {
          color: "#264941",
          textColor: "white",
        };
      }

      marked[range.end] = { endingDay: true, color: "#264941", textColor: "white" };
    }
    return marked;
  };


  // const handleSubmitRange = () => {
  //   if (range.start && range.end) {
  //     console.log(range?.start, range?.end);
  //     setOpenRangeModal(false);
  //     handleSelection(selectedSection);
  //   }
  // };

  const handleSubmitRange = () => {
    if (!range.start || !range.end) {
      Alert.alert("Please select both start and end dates");
      return;
    }

    const start = new Date(range.start);
    const end = new Date(range.end);
    if (start >= end) {
      Alert.alert("Start date must be earlier than end date");
      return;
    }
    setIsValid(true);
    setOpenRangeModal(false);
    handleSelection(selectedSection);
  };


  // const handleSubmitThisMonthRange = () => {
  //   if (range.start && range.end) {
  //     console.log(range?.start, range?.end);
  //     setThisMonthModal(false);
  //     handleSelection(selectedSection);
  //   }
  // };

  const handleSubmitThisMonthRange = () => {
    if (!range.start || !range.end) {
      Alert.alert("Please select both start and end dates");
      return;
    }

    const start = new Date(range.start);
    const end = new Date(range.end);

    if (start >= end) {
      Alert.alert("Start date must be earlier than end date");
      return;
    }

    setIsValid(true);
    setThisMonthModal(false);
    handleSelection(selectedSection);
  };


  const setThisMonthRange = () => {
    const today = new Date();

    const firstDay = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    const startISO = firstDay.toISOString();
    const endISO = todayUTC.toISOString();

    setRange({ start: startISO, end: endISO });
  };


  const toISODateOnly = (date: Date) => date.toISOString().split("T")[0];

  const getFirstDayOfMonthISO = () => {
    const now = new Date();
    const first = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    return toISODateOnly(first);
  };

  const getTodayISO = () => {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    return toISODateOnly(todayUTC);
  };


  const formatDate = (date: string) => {
    return new Date(date).toISOString().split("T")[0];
  };



  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        {showToast && <CustomToast message={toastMessage} isSuccess={true} />}
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1 }}
          resizeMode="contain"
          tintColor={"#23302A"}
        >
          <View style={{ paddingLeft: 10, paddingRight: 10, marginBottom: 10 }}>
            <CommonHeader
              onPress={handleOpenDrawer}
              onPressNavigation={() => navigation.navigate("LocationScreen", {
                routeId: 2
              })}
              currentLocation={currentLocation}
              navigateToCartList={() =>
                navigation.navigate("OrderPlaceScreen", {
                  cartId: cartIdRef.current,
                  payloadData: null,
                })
              }
            />
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              paddingLeft: 8,
              paddingRight: 8,
              overflow: "hidden",
            }}
          >
            {/* TOTAL SAVING */}
            {userTotalSaving?.savingPrice > 0 && (
              <TotalSaving userTotalSaving={userTotalSaving} accountDate={userAccountDate} />
            )}

            <View style={{ flex: 1, marginTop: userTotalSaving?.savingPrice > 0 ? 0 : 30 }}>
              <Pressable
                onPress={() => setOpenSelectDateTypeModal(true)}
                style={{
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: "#D8D8D8",
                  paddingVertical: 15,
                  paddingHorizontal: 10,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#1C1939",
                      fontSize: fontPixel(18),
                      fontFamily: FONTS.tenonMediumFont,
                    }}
                  >
                    {isValid ? range.start && range.end
                      ? `${formatDate(range.start)} - ${formatDate(range.end)}`
                      : "This Month" : "Select Date"}
                  </Text>

                  <Image
                    source={Icons.ArrowGreenIcon}
                    style={{
                      transform: [{ rotate: "90deg" }],
                      height: heightPixel(18),
                      width: widthPixel(18),
                    }}
                    resizeMode="contain"
                    tintColor={"#2E2E2E"}
                  />
                </View>
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.cartStyle}>
                  <Text style={styles.fontStyle}>
                    {savingData?.ordersCompleted}
                  </Text>
                  <Text style={styles.fontStyle1}>Order Completed</Text>
                </View>

                <View style={styles.cartStyle}>
                  <Text style={styles.fontStyle}>
                    AED {savingData?.totalSaved}
                  </Text>
                  <Text style={styles.fontStyle1}>Money Saved</Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 15,
                }}
              >
                {["Vendor Wise", "Category Wise"].map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSelection(item)}
                    style={{
                      borderWidth: 1,
                      borderColor: "#264941",
                      borderRadius: 50,
                      // paddingHorizontal: 45,
                      width: "49%",
                      paddingVertical: 10,
                      justifyContent: "center",
                      alignItems: 'center',
                      backgroundColor:
                        selectedSection === item ? "#264941" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: selectedSection === item ? "#fff" : "#264941",
                        fontSize: fontPixel(16),
                        fontFamily: FONTS.tenonMediumFont,
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {savingData?.categories?.length == 0 ? (
                <View
                  style={{
                    flex: 1,
                    // justifyContent: "center",
                    marginTop: "30%",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      borderRadius: 40,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
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
                      {"No Data Found"}
                    </Text>
                  </View>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 25, marginTop: 15 }}
                >
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#DDDDDD",
                      borderRadius: 20,
                      borderTopLeftRadius: 0,
                    }}
                  >
                    {savingData?.categories?.map((item: any, index: any) => (
                      <View
                        key={index}
                        style={{
                          borderBottomWidth:
                            index === savingData?.categories?.length - 1
                              ? 0
                              : 1,
                          borderBottomColor: "#DDDDDD",
                          paddingVertical: 10,
                          paddingHorizontal: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#2E2E2E",
                              fontFamily: FONTS.tenonMediumFont,
                              fontSize: fontPixel(18),
                            }}
                          >
                            {item?.vendorName || item?.categoryName}
                          </Text>

                          <View style={{ flexDirection: "row" }}>
                            <Text
                              style={{
                                color: "#2E2E2E",
                                fontFamily: FONTS.tenonMediumFont,
                                fontSize: fontPixel(18),
                              }}
                            >
                              AED {item?.moneySaved}
                            </Text>
                            <Text
                              style={{
                                color: "#2E2E2E",
                                fontFamily: FONTS.tenonMediumFont,
                                fontSize: fontPixel(18),
                              }}
                            >
                              {" "}
                              | {item?.percentage}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>

      <Modal transparent visible={openSelectDateTypeModal} animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={() => setOpenSelectDateTypeModal(false)}
        />
        <View
          style={{
            backgroundColor: "#fff",
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <View>
            <Pressable
              onPress={() => {
                setOpenSelectDateTypeModal(false);
                setThisMonthModal(true);
                setIsValid(false)
              }}
              style={{
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderColor: "#eee",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: fontPixel(18), color: "#000", fontFamily: FONTS.tenonMediumFont }}>This Month</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOpenRangeModal(true);
                setOpenSelectDateTypeModal(false);
              }}
              style={{
                paddingVertical: 20,
                marginTop: 0,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: fontPixel(18), color: "#000", fontFamily: FONTS.tenonMediumFont }}>Custom Date</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* this month modal */}
      <Modal
        transparent
        visible={thisMonthModal}
        animationType="slide"
        onRequestClose={() => setThisMonthModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#000000aa" }}>
          <View style={{ width: "80%", alignSelf: "center", backgroundColor: "#fff" }}>
            <Calendar
              markingType="period"
              markedDates={getMarkedDates()}
              onDayPress={onDayPress}
              minDate={getFirstDayOfMonthISO()}
              maxDate={getTodayISO()}
              disableMonthChange={true}
              hideArrows={true}
              enableSwipeMonths={false}
              disableAllTouchEventsForDisabledDays={true}
            />

            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "50%", alignSelf: "flex-end", marginBottom: 20, marginTop: 20, paddingRight: 15 }}>
              <Pressable onPress={() => [setThisMonthModal(false), setThisMonthRange(), setIsValid(false)]}>
                <Text style={{ color: "#000", fontSize: fontPixel(18), fontFamily: FONTS.tenonRegularFont }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={handleSubmitThisMonthRange}>
                <Text style={{ color: "#000", fontSize: fontPixel(18), fontFamily: FONTS.tenonRegularFont }}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={openRangeModal}
        animationType="slide"
        onRequestClose={() => setOpenRangeModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#000000aa" }}>
          <View style={{ width: "80%", alignSelf: "center", backgroundColor: "#fff" }}>
            <Calendar
              markingType="period"
              markedDates={getMarkedDates()}
              onDayPress={onDayPress}
              maxDate={new Date().toISOString().split("T")[0]}
            />
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "50%", alignSelf: "flex-end", marginBottom: 20, marginTop: 20, paddingRight: 15 }}>
              <Pressable onPress={() => [setOpenRangeModal(false), setThisMonthRange()]}>
                <Text style={{ color: "#000", fontSize: fontPixel(18), fontFamily: FONTS.tenonRegularFont }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={handleSubmitRange}>
                <Text style={{ color: "#000", fontSize: fontPixel(18), fontFamily: FONTS.tenonRegularFont }}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SavingScreen;

const styles = StyleSheet.create({
  cartStyle: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 20,
    borderTopLeftRadius: 0,
    paddingVertical: 20,
    width: "49%",
    marginTop: 10,
  },
  fontStyle: {
    color: "#264941",
    fontSize: fontPixel(30),
    fontFamily: FONTS.tenonMediumFont,
  },
  fontStyle1: {
    color: "#264941",
    fontSize: fontPixel(15),
    fontFamily: FONTS.tenonMediumFont,
  },
});
