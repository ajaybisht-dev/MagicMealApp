import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
} from "react-native";
import { Icons } from "../../theme/AssetsUrl";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/MainTypes";

const { width } = Dimensions.get("window");

const OrderConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [confirmed, setConfirmed] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 150) {
          Animated.timing(pan, {
            toValue: { x: width, y: 0 },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setConfirmed(true);
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleGoToOrders = () => {
    navigation.navigate("DrawerNavigation", {
      screen: "HomeScreen",
      params: { screen: "Orders" },
    });
  };


  return (
    <View style={styles.container}>
      {/* Header */}

      <Pressable style={styles.header} onPress={() => handleGoToOrders()}>
        <Image source={Icons.ArrowIcon} resizeMode="contain" style={{ height: 18, width: 18, transform: [{ "rotate": "-90deg" }] }} />
        <Text style={styles.headerTitle}>  Order Confirmation</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Success Icon */}
        <Image
          source={Icons.DummyImageIcon}
          style={styles.successIcon}
          resizeMode="contain"
        />
        <Text style={styles.successText}>Order Placed Successfully</Text>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.transactionId}>
            Transaction ID: <Text style={styles.bold}>10908789098</Text>
          </Text>
          <Text style={styles.infoText}>Order #MM123456</Text>
          <Text style={styles.infoText}>Item: Veg Meal Combo Box</Text>
          <Text style={styles.infoText}>QTY: 1</Text>

          {/* Pickup Details */}
          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
            Pickup Details
          </Text>
          <View style={styles.line} />

          <Text style={styles.pickupText}>
            Restaurant A ,Marina Mall, Shop 12
          </Text>
          <Text style={styles.linkText}>[Get Directions]</Text>
          <Text style={styles.pickupTime}>Today, 6:00 PM - 8:00 PM</Text>

          {/* Important Section */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
            ⚠ Important
          </Text>
          <Text style={styles.bulletText}>• Arrive during pickup window</Text>
          <Text style={styles.bulletText}>
            • Swipe to confirm pickup in app
          </Text>

          {/* Payment Summary */}
          <View style={{ marginTop: 20 }}>
            <Text style={styles.infoText}>Amount Paid: AED 22</Text>
            <Text style={styles.infoText}>You Saved: AED 40</Text>
          </View>
        </View>
      </ScrollView>

      {/* Swipe To Confirm Section */}
      <View style={styles.swipeContainer}>
        {confirmed ? (
          <Text style={styles.confirmedText}>✅ Pickup Confirmed</Text>
        ) : (
          <>
            <Animated.View
              style={[styles.swipeButton, { transform: [{ translateX: pan.x }] }]}
              {...panResponder.panHandlers}
            >
              <Image
                source={Icons.ArrowIcon}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </Animated.View>
            <Text style={styles.swipeText}>SWIPE TO CONFIRM PICKUP</Text>
          </>
        )}
      </View>
    </View>
  );
};

export default OrderConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backArrow: {
    fontSize: 24,
    color: "#333",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  successIcon: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginTop: 20,
  },
  successText: {
    textAlign: "center",
    fontSize: 18,
    color: "#444",
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 20,
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  transactionId: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "700",
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  line: {
    height: 1,
    backgroundColor: "#999",
    marginVertical: 4,
    width: 120,
  },
  pickupText: {
    fontSize: 14,
    color: "#444",
    marginTop: 6,
  },
  linkText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 5,
  },
  pickupTime: {
    fontSize: 14,
    color: "#444",
    marginTop: 5,
  },
  bulletText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 8,
    marginTop: 4,
  },
  swipeContainer: {
    backgroundColor: "#666",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  swipeButton: {
    position: "absolute",
    left: 5,
    backgroundColor: "#FFF",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  arrowIcon: {
    width: 22,
    height: 22,
    transform: [{ "rotate": "90deg" }]
  },
  swipeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  confirmedText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
});