import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { Icons } from "../../theme/AssetsUrl";
import { DrawerActions, useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");


const OrdersScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const navigation = useNavigation();

  const orders = [
    {
      id: "1",
      orderId: "#MM123456",
      restaurant: "Restaurant A",
      item: "Non-Veg Combo Meal",
      rating: "4.6",
      status: "Ready for Pickup",
      pickupTime: "6:00 PM - 8:00 PM",
    },
    {
      id: "2",
      orderId: "#MM123457",
      restaurant: "Restaurant A",
      item: "Non-Veg Combo Meal",
      rating: "4.6",
      status: "Preparing",
      pickupTime: "6:00 PM - 8:00 PM",
    },
  ];

  const SwipeToConfirm = () => {
    const pan = React.useRef(new Animated.ValueXY()).current;
    const [confirmed, setConfirmed] = useState(false);

    const panResponder = React.useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 10,
        onPanResponderMove: Animated.event([null, { dx: pan.x }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 150) {
            // Confirm pickup
            Animated.timing(pan, {
              toValue: { x: width, y: 0 },
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              setConfirmed(true)
            });
          } else {
            // Reset
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
          }
        },
      })
    ).current;

    return (
      <View style={styles.swipeContainer}>
        {confirmed ? (
          <Text style={styles.confirmedText}>✅ Pickup Confirmed</Text>
        ) : (
          <>
            <Animated.View
              style={[styles.swipeButton, { transform: [{ translateX: pan.x }] }]}
              {...panResponder.panHandlers}
            >
              <Image source={Icons.ArrowIcon} style={{ height: 20, width: 20, transform: [{ rotate: "90deg" }] }} />
            </Animated.View>
            <Text style={styles.swipeText}>SWIPE TO CONFIRM PICKUP</Text>
          </>
        )}
      </View>
    );
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };


const openGoogleMap = async () => {
  const latitude = 28.6129;
  const longitude = 77.2295;
  const label = "India Gate, New Delhi";

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
      <View style={styles.header}>
        <Pressable onPress={() => handleOpenDrawer()} style={styles.menuButton}>
          <Image source={Icons.DummyImageIcon} style={styles.menuIcon} />
        </Pressable>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <View style={styles.tabContainer}>
        {["Active", "Completed", "Cancelled"].map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {orders.map((order, index) => (
          <View key={index} style={{ padding: 10 }}>
            <View style={{ borderWidth: 1, borderRadius: 10, borderColor: "#CCC" }}>
              <View style={styles.orderCard}>
                <Pressable onPress={() => navigation.navigate("OrderDetailScreen" as never)} disabled={activeTab == "Active" ? false : true}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>Order {order.orderId}</Text>
                    <Text style={styles.status}>{order.status}</Text>
                  </View>

                  <View style={styles.cardBody}>
                    <Image source={Icons.DummyImageIcon} style={styles.orderImage} />
                    <View style={styles.orderInfo}>
                      <View style={styles.orderTopRow}>
                        <Text style={styles.restaurantName}>{order.restaurant}</Text>
                        <Text style={styles.ratingText}>{order.rating} ★</Text>
                      </View>
                      <Text style={styles.itemName}>{order.item}</Text>
                      {
                        activeTab == "Active" && <Text style={styles.pickupText}>
                          Pickup: {order.pickupTime}
                        </Text>}
                    </View>
                  </View>

                  <View style={styles.linkRow}>
                    {
                      (activeTab == "Active" || activeTab == "Completed") &&
                      <Pressable onPress={() => {
                        if (activeTab == "Active") {
                           openGoogleMap()
                        } else {
                          navigation.navigate("OrderDetailScreen" as never)
                        }
                      }}>
                        <Text style={styles.linkText}>{activeTab == "Active" ? "[Get Directions]" : "[Rate This Order]"}</Text>
                      </Pressable>
                    }
                    <Pressable onPress={() => navigation.navigate("OrderDetailScreen" as never)}>
                      <Text style={styles.linkText}>[View Details]</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </View>
              {
                activeTab == "Active" && <SwipeToConfirm />
              }
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 10
  },
  menuButton: {
    marginRight: 5
  },
  menuIcon: {
    height: 25,
    width: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    marginBottom: 10,
  },
  tabText: {
    fontSize: 15,
    color: "#AAA",
    paddingVertical: 10,
  },
  tabTextActive: {
    color: "#333",
    fontWeight: "600",
  },
  tabIndicator: {
    height: 2,
    backgroundColor: "#333",
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },
  status: {
    fontSize: 14,
    color: "#555",
  },
  cardBody: {
    flexDirection: "row",
    marginBottom: 10,
  },
  orderImage: {
    width: 55,
    height: 55,
    resizeMode: "contain",
    marginRight: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  ratingText: {
    fontSize: 13,
    color: "#333",
  },
  itemName: {
    fontSize: 14,
    color: "#555",
  },
  pickupText: {
    fontSize: 13,
    color: "#333",
    marginTop: 3,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  linkText: {
    fontSize: 13,
    color: "#444",
  },
  swipeContainer: {
    backgroundColor: "#777",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  swipeButton: {
    position: "absolute",
    left: 5,
    backgroundColor: "#FFF",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeArrow: {
    color: "#444",
    fontSize: 18,
    fontWeight: "600",
  },
  swipeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  confirmedText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
});