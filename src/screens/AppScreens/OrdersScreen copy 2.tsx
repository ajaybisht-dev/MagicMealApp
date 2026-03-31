import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // ScrollView,
  ImageBackground,
  Pressable,
  Image,
  NativeScrollEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icons, Images } from '../../theme/AssetsUrl';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { DrawerActions, RouteProp, useFocusEffect, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { FONTS } from '../../theme/FontsLink';
import { getOrderListByUserid } from '../../../helpers/Services/order';
import { openGoogleMap } from '../../utils/openGoogleMap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMG_URL } from '../../../config';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import Skeleton from '../../component/Skeleton/Skeleton';
import TotalSaving from './CommonScreen/TotalSaving';
import { getData } from '../../utils/storage';
import { getUserTotalSavings } from '../../../helpers/Services/userProfile';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigation';
import { ScrollView } from 'react-native-gesture-handler';
import { PickStackParamList } from '../../navigation/AppNavigation/OrdersStack/OrdersStack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';

type UserTotalSaving = {
  savingPrice: number;
  totalOrders: number;
};

type OrdersScreenNavProp = DrawerNavigationProp<DrawerParamList>;

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loader, setLoader] = useState(true);
  const [orderListingData, setOrderListing] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>("Active Orders");
  const [userTotalSaving, setUserTotalSaving] = useState<UserTotalSaving | null>(null);
  const [totalPages, setTotalPages] = useState<any>(0);
  const [onScrollLoader, setOnScrollLoader] = useState(false);
  const [noOrderMessage, setNoOrderMessage] = useState("");

  const selectedItemRef = useRef("Active Orders");
  const pageNumberRef = useRef(1);
  const scrollRef = useRef(null);
  const pendingDataListref = useRef<any[]>([]);

  const totalSavingSelector = useSelector((state: RootState) => state?.totalSavingSlice?.totalSavingData);


  const route = useRoute<RouteProp<
    PickStackParamList,
    'PickupConfirmationScreen'
  >>();

  const clickCountRef = useRef(0);

  useEffect(() => {
    setUserTotalSaving(totalSavingSelector);
  }, [totalSavingSelector])


  useEffect(() => {
    if (route.params?.fromTabPress) {
      clickCountRef.current += 1;
      if (clickCountRef.current === 1) {
        resetMatchList();
      }
      navigation.setParams({ fromTabPress: undefined });
    }
  }, [route.params?.fromTabPress]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        clickCountRef.current = 0;
      };
    }, [])
  );

  const resetMatchList = async () => {
    setLoader(true);
    selectedItemRef.current = "Active Orders";
    setSelectedItem(selectedItemRef.current);
    pageNumberRef.current = 1;
    const emptArr = orderListingData.splice(0, orderListingData?.length);
    setOrderListing(emptArr);
    await getOrderListByUserIdFunction();
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const checkPayloadAndCallApi = async () => {
        try {
          const response = await AsyncStorage.getItem("payload");
          if (response && isActive) {
            getOrderListByUserIdFunctionBack();
          }
        } catch (error) {
          console.log("AsyncStorage error:", error);
        }
      };

      checkPayloadAndCallApi();
      return () => {
        isActive = false;
      };
    }, [])
  );


  const getOrderListByUserIdFunctionBack = async () => {
    const user_id = await AsyncStorage.getItem("user_id");
    const response = await AsyncStorage.getItem("payload");
    const parseRes = response && JSON.parse(response);
    let payload = {
      "userID": user_id,
      "orderStatus": "Pending",
      "pageNumber": 1,
      "pageSize": parseRes?.pageNumber * 10
    };
    await getOrderListByUserid(payload).then(async (response) => {
      await AsyncStorage.removeItem("payload");
      setLoader(false);
      if (response?.succeeded) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          const { totalPages } = response;

          const updatedOrders = response.data.map((order: any) => {
            const grouped: Record<string, any> = {};

            for (const item of order.items || []) {
              const key = item.serviceProviderId;

              if (!grouped[key]) {
                grouped[key] = {
                  serviceProviderId: key,
                  serviceProviderName: item.serviceProviderName,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  items: [],
                };
              }

              grouped[key].items.push(item);
            }

            return {
              ...order,
              groupedItems: Object.values(grouped),
            };
          });

          const filteredOldOrders = pendingDataListref.current.filter(
            (oldOrder: any) =>
              updatedOrders.some(
                (newOrder: any) => newOrder.id === oldOrder.id
              )
          );

          const mergedOrders = filteredOldOrders.map((oldOrder: any) => {
            const updated = updatedOrders.find(
              (newOrder: any) => newOrder.id === oldOrder.id
            );
            return updated ? updated : oldOrder;
          });
          const newOnlyOrders = updatedOrders.filter(
            (newOrder: any) =>
              !pendingDataListref.current.some(
                (oldOrder: any) => oldOrder.id === newOrder.id
              )
          );

          const finalOrders = [...mergedOrders, ...newOnlyOrders];

          pendingDataListref.current = finalOrders;
          setOrderListing(finalOrders);
          setTotalPages(totalPages);
        } else {
          pendingDataListref.current = [];
          setOrderListing(pendingDataListref.current);
          console.log("no data");
        }

        setOnScrollLoader(false);
      }
    })
      .catch(async () => {
        await AsyncStorage.removeItem("payload");
      });

  };

  useEffect(() => {
    pageNumberRef.current = 1;
    setLoader(true);
    getOrderListByUserIdFunction()
  }, [])

  const getOrderListByUserIdFunction = async () => {
    const user_id = await AsyncStorage.getItem("user_id");
    let orderStatus;
    if (selectedItemRef.current == "Active Orders") {
      orderStatus = "Pending"
    } else if (selectedItemRef.current == "Completed") {
      orderStatus = "Completed"
    } else {
      orderStatus = "Cancelled"
    }
    let payload = {
      "userID": user_id,
      "orderStatus": orderStatus,
      "pageNumber": pageNumberRef.current,
      "pageSize": 10
    };
    await getOrderListByUserid(payload)
      .then((response) => {
        setLoader(false);
        if (response?.succeeded && Array.isArray(response.data)) {
          const updatedOrders = response.data.map((order: any) => {
            const grouped: Record<string, any> = {};

            for (const item of order.items || []) {
              const key = item.serviceProviderId;

              if (!grouped[key]) {
                grouped[key] = {
                  serviceProviderId: key,
                  serviceProviderName: item.serviceProviderName,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  items: [],
                };
              }

              grouped[key].items.push(item);
            }

            return {
              ...order,
              groupedItems: Object.values(grouped),
            };
          });
          setTotalPages(response.totalPages);
          setOnScrollLoader(false);
          pendingDataListref.current = [...orderListingData, ...updatedOrders];
          setOrderListing([...orderListingData, ...updatedOrders]);
        } else {
          setNoOrderMessage("No Orders Found")
          setOnScrollLoader(false);
          setLoader(false);
        }
      })
      .catch(() => {
        setNoOrderMessage("No Orders Found");
        setLoader(false);
      });

  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const distanceFromEnd = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    return distanceFromEnd < 100;
  };

  const handleScrollEndDrag = () => {
    if (scrollRef.current) {
      if (pageNumberRef.current < totalPages) {
        setOnScrollLoader(true);
        pageNumberRef.current += 1;
        getOrderListByUserIdFunction()
      }
    }
  };

  const handleImageData = (image_url: any, deal: any) => {
    if (!image_url) {
      switch (deal) {
        case "Non Veg": return Icons.NonVegBoxIcon
        case "Veg": return Icons.VegBoxIcon
        case "Vegan": return Icons.VeganBoxIcon
        case "Sea Food": return Icons.SeaFoodBoxIcon
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

  const formatOrderDate = (dateString: string): string => {
    const date = new Date(dateString);

    const day = date.getDate();
    const year = date.getFullYear();

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = monthNames[date.getMonth()];

    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month}’${year}`;
  };

  const handleClickItem = async (item: any) => {
    const emptArr = orderListingData.splice(0, orderListingData?.length);
    setOrderListing(emptArr);
    pageNumberRef.current = 1;
    selectedItemRef.current = item;
    setSelectedItem(item);
    setLoader(true);
    await getOrderListByUserIdFunction()
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(350), flex: 1 }} resizeMode="contain" imageStyle={{ tintColor: "#23302A" }}>
          <View style={styles.headerNav}>
            <Pressable style={styles.header} onPress={() => handleOpenDrawer()}>
              <Image source={Icons.MenuIcon} resizeMode="contain" style={{ height: heightPixel(20), width: widthPixel(20), marginRight: 10 }} />
              <Text style={styles.headerTitle}>My Orders</Text>
            </Pressable>
          </View>
          <View style={styles.contentContainer}>
            <View style={{ height: 185, width: 185, position: "absolute", bottom: -40, right: -40 }}>
              <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
            </View>
            <View style={[styles.scrollContent, { paddingBottom: 10 }]}>
              <View style={{ marginBottom: userTotalSaving && userTotalSaving?.savingPrice > 0 ? 0 : 20 }}>
                {
                  userTotalSaving && userTotalSaving?.savingPrice > 0 &&
                  <TotalSaving userTotalSaving={userTotalSaving} />
                }
              </View>
              <View style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between" }}>
                {
                  ["Active Orders", "Completed", "Cancel"]?.map((item, index) => {
                    return (
                      <Pressable onPress={() => handleClickItem(item)} key={index} style={{ backgroundColor: item == selectedItem ? "#264941" : "transparent", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 50, borderWidth: 1, borderColor: "#264941" }}>
                        <Text style={{ color: item == selectedItem ? "#fff" : "#264941", fontSize: fontPixel(16), fontFamily: FONTS.tenonMediumFont }}>{item}</Text>
                      </Pressable>
                    )
                  })
                }
              </View>
            </View>
            {
              loader ?
                <View style={styles.contentContainer}>
                  <Skeleton />
                </View>
                : orderListingData?.length > 0 ?
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    ref={scrollRef}
                    onScroll={({ nativeEvent }) => {
                      if (onScrollLoader == false) {
                        if (isCloseToBottom(nativeEvent)) {
                          handleScrollEndDrag()
                        }
                      }
                    }}
                  >
                    {
                      selectedItem == "Active Orders" &&
                      orderListingData.map((item_data, index) => {
                        if (item_data?.items?.length > 0) {
                          return (
                            <View
                              key={index}
                              style={{
                                // borderWidth: 1,
                                // borderRadius: 20,
                                // borderTopLeftRadius: 0,
                                // marginBottom: 10,
                                // padding: 10,
                                // borderColor: "#DDDDDD",
                              }}
                            >
                              <Text style={styles.orderNumber}>Order #: {item_data?.orderID}</Text>
                              {item_data?.groupedItems?.map((provider: any, pIndex: number) => (
                                <View key={provider.serviceProviderId} style={{
                                  borderWidth: 1,
                                  borderRadius: 20,
                                  borderTopLeftRadius: 0,
                                  marginBottom: 10,
                                  padding: 10,
                                  borderColor: "#DDDDDD",
                                }}>
                                  {provider.items.map((item: any, index: number) => (
                                    <Pressable
                                      key={item.id}
                                      // style= {{borderBottomWidth : (pIndex + 1) < item_data?.groupedItems?.length ? 1: 0, marginBottom : (pIndex + 1) < item_data?.groupedItems?.length ? 5 : 0, borderBottomColor : "#DDDDDD", marginTop : (pIndex + 1) < item_data?.groupedItems?.length ? 5 : 0}}
                                      // style={{
                                      //   borderWidth: 1,
                                      //   borderRadius: 20,
                                      //   borderTopLeftRadius: 0,
                                      //   marginBottom: 10,
                                      //   padding: 10,
                                      //   borderColor: "#DDDDDD",
                                      // }}
                                      onPress={async () => {
                                        let obj = {
                                          isGoBack: true,
                                          pageNumber: pageNumberRef.current,
                                        }
                                        await AsyncStorage.setItem("payload", JSON.stringify(obj));
                                        navigation.navigate('OrderPickUpStack', {
                                          screen: 'PickupConfirmationScreen',
                                          params: {
                                            orderId: item?.orderId ?? null,
                                            totalAmount: item.unitPrice * item.quantity,
                                            serviceProviderId: provider.serviceProviderId ?? null,
                                            orderNumber: item_data?.orderID,
                                            savedAmount: 0,
                                          },
                                        });
                                      }}
                                    >
                                      {index === 0 && (
                                        <View style={styles.cardHeader}>
                                          <View style={styles.timeContainer}>
                                            <Text style={styles.timeText}>
                                              {formatOrderDate(item_data?.orderDate)}
                                            </Text>
                                          </View>
                                          <View style={{ flexDirection: "row" }}>
                                            <Image
                                              source={Icons.ArrowGreenIcon}
                                              style={{ height: heightPixel(15), width: widthPixel(10) }}
                                              tintColor="#9D9D9D"
                                            />
                                            <Image
                                              source={Icons.ArrowGreenIcon}
                                              style={{ height: heightPixel(15), width: widthPixel(10) }}
                                              tintColor="#9D9D9D"
                                            />
                                          </View>
                                        </View>
                                      )}
                                      <View
                                        style={[
                                          styles.itemRow,
                                          index < provider.items.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: "#DDDDDD",
                                            marginBottom: 8,
                                          },
                                        ]}
                                      >
                                        <View style={styles.boxWhiteInner}>
                                          {/* <Image
                                        source={Icons.NonVegBoxIcon}
                                        resizeMode="contain"
                                        style={{ height: 72, width: 72 }}
                                      /> */}
                                          <Image source={handleImageData(item?.sbImageURL, "Non Veg")} resizeMode="contain" style={{ height: heightPixel(72), width: widthPixel(72) }} />
                                        </View>

                                        <View style={styles.itemDetails}>
                                          <Text style={styles.itemTitle}>
                                            {item.surpriseBoxName?.length > 18
                                              ? item.surpriseBoxName.slice(0, 18) + "..."
                                              : item.surpriseBoxName}
                                          </Text>

                                          <View style={styles.priceRow}>
                                            <Text style={styles.oldPrice}>
                                              AED {item.actualPrice * item.quantity}
                                            </Text>
                                            <Text style={styles.newPrice}>
                                              AED {item.discountedPrice * item.quantity}
                                            </Text>
                                            <Text style={styles.discountText}>
                                              {item.discountedPercent}% OFF
                                            </Text>
                                          </View>

                                          <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                            <Text style={styles.qtyText}>{`QTY: ${item.quantity}`}</Text>
                                            <View style={styles.timeContainer}>
                                              <Image source={Icons.TimingIcon} resizeMode="contain" style={{ height: heightPixel(16), width: widthPixel(16) }} />
                                              <Text style={styles.timeText}>{`${item.collectionFromTime}`}</Text>
                                              {
                                                (item?.timeFromAMPM != item?.timeToAMPM) ?
                                                  <Text style={styles.timeText}>{`${item?.timeFromAMPM}`} -</Text>
                                                  :
                                                  <Text style={styles.timeText}>-</Text>
                                              }
                                              <Text style={styles.timeText}>{`${item.collectionToTime}`} {item.timeToAMPM}</Text>
                                            </View>
                                          </View>
                                        </View>
                                      </View>
                                      {index === provider.items.length - 1 && (
                                        <View style={{ width: "77%", alignSelf: "flex-end" }}>
                                          <View style={styles.cardFooter}>
                                            <Pressable
                                              style={styles.actionButton}
                                              onPress={() =>
                                                openGoogleMap(
                                                  item.latitude,
                                                  item.longitude
                                                )
                                              }
                                            >
                                              <Image
                                                source={Icons.DistanceIcon}
                                                style={{ height: heightPixel(21), width: widthPixel(21) }}
                                                tintColor="#264941"
                                                resizeMode='contain'
                                              />
                                              <Text style={styles.actionText}>Get Direction</Text>
                                            </Pressable>

                                            <View style={styles.statusContainer}>
                                              <Image
                                                source={
                                                  item.deliveryStatus === "Ready"
                                                    ? Icons.ReadyPickUpIcon
                                                    : Icons.PickedUpIcon
                                                }
                                                style={{ height: 14, width: 14 }}
                                                tintColor={
                                                  item.deliveryStatus === "Ready"
                                                    ? "#FF9D00"
                                                    : "#109D7D"
                                                }
                                              />
                                              <Text
                                                style={[
                                                  styles.statusPickedUp,
                                                  {
                                                    color:
                                                      item.deliveryStatus === "Ready"
                                                        ? "#FF9D00"
                                                        : "#109D7D",
                                                  },
                                                ]}
                                              >
                                                {item.deliveryStatus}
                                              </Text>
                                            </View>
                                          </View>
                                        </View>
                                      )}
                                    </Pressable>
                                  ))}
                                </View>
                              ))}
                            </View>
                          );
                        }
                      })
                    }
                    {
                      selectedItem === "Completed" &&
                      orderListingData?.map((item, index) => (
                        <View key={index}>
                          <Pressable
                            onPress={() =>
                              navigation.navigate("OrderCompleted", {
                                orderID: item?.id ?? null,
                              })
                            }
                            style={{
                              borderWidth: 1,
                              borderColor: "#DDDDDD",
                              borderRadius: 20,
                              borderTopLeftRadius: 0,
                              flex: 1,
                              marginBottom: 10,
                            }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <View style={{ flex: 1 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingTop: "2%",
                                    paddingLeft: "3%",
                                    paddingRight: "3%",
                                    marginBottom: 5,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#2E2E2E",
                                      fontFamily: FONTS.tenonMediumFont,
                                      fontSize: fontPixel(18),
                                    }}
                                  >
                                    Order #: {item?.orderID?.length > 15 ? item?.orderID?.slice(0, 15) + "..." : item?.orderID}
                                  </Text>

                                  <Text
                                    style={{
                                      color: "#109D7D",
                                      fontSize: fontPixel(16),
                                      fontFamily: FONTS.tenonBoldFont,
                                    }}
                                  >
                                    {item?.orderStatus}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingBottom: "3%",
                                    paddingLeft: "3%",
                                    paddingRight: "3%",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#666666",
                                      fontSize: fontPixel(14),
                                      fontFamily: FONTS.tenonMediumFont,
                                    }}
                                  >
                                    {formatOrderDate(item?.orderDate)}
                                  </Text>

                                  <Text
                                    style={{
                                      color: "#666666",
                                      fontSize: fontPixel(14),
                                      fontFamily: FONTS.tenonMediumFont,
                                    }}
                                  >
                                    AED {item?.totalAmount}
                                  </Text>
                                </View>
                              </View>

                              <View style={{ paddingRight: "3%" }}>
                                <Image
                                  source={Icons.ArrowGreenIcon}
                                  style={{
                                    height: heightPixel(16),
                                    width: widthPixel(8),
                                  }}
                                  tintColor={"#9D9D9D"}
                                />
                              </View>
                            </View>
                          </Pressable>
                        </View>
                      ))
                    }
                    <View style={{ height: 20 }} />
                  </ScrollView>
                  :
                  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <View style={{ borderRadius: 40, paddingHorizontal: 15, paddingVertical: 10, marginTop: "5%", borderWidth: 1, borderColor: "#264941" }}>
                      <Text style={{ color: "#264941", fontFamily: FONTS.tenonMediumFont, fontSize: fontPixel(16) }}>{"No Order Found"}</Text>
                    </View>
                  </View>
            }
          </View>
        </ImageBackground>
      </LinearGradient>
    </View >
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
    paddingRight: 15
  },
  headerTitle: {
    color: '#fff',
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonBoldFont,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 15,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 60,
    paddingLeft: 10,
    paddingRight: 10
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15
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
    paddingBottom: 5
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
    fontFamily: FONTS.tenonMediumFont
  },
  itemRow: {
    flexDirection: 'row',
    paddingBottom: 10
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
    marginBottom: 10
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
    fontSize: fontPixel(18)
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
    fontSize: fontPixel(16)
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
    borderRightColor: "#dddddd",
    paddingRight: 10
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
    includeFontPadding: false
  },
});

export default OrdersScreen;