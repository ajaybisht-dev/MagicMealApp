import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from "react-native";
import { Icons } from "../../theme/AssetsUrl"; // Replace with your actual icon path
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { FONTS } from "../../theme/FontsLink";
import { fontPixel, heightPixel } from "../../utils/responsive";
import { DrawerParamList } from "../../navigation/DrawerNavigation";
import { DrawerNavigationProp, DrawerScreenProps } from "@react-navigation/drawer";
import { confirmPaymentApi } from "../../../helpers/Services/order";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PaymentNavigationProp = DrawerNavigationProp<DrawerParamList, "PaymentProcessingScreen">;
type Props = DrawerScreenProps<DrawerParamList, "PaymentProcessingScreen">;

const PaymentProcessingScreen: React.FC<Props> = ({ route }) => {
  const { orderID, paymentStatus, gatewayTransactionID, paidAmount, remarks } = route?.params
  const spinValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<PaymentNavigationProp>();

  useEffect(() => {
    handleConfirmPaymentAPI()
  }, []);

  const handleConfirmPaymentAPI = async () => {
    let payload = {
      "orderID": orderID,
      "paymentStatus": "Success",
      "gatewayTransactionID": gatewayTransactionID,
      "paidAmount": paidAmount,
      "remarks": remarks
    }
    console.log(JSON.stringify(payload));
    
    await confirmPaymentApi(payload).then(async (response) => {
      if (response?.succeeded) {
        navigation.navigate(
          "DrawerNavigation" as any,
          {
            screen: "OrderPickUpStack",
            params: {
              screen: "OrderConfirmationScreen",
              params: {
                orderID: orderID,
              },
            },
          }
        );
      }
    })
    // setTimeout(() => {
    //   navigation.navigate("DrawerNavigation" as any, { screen: "OrderConfirmationScreen" } as any);
    // }, 2000);
    // Animated.loop(
    //   Animated.timing(spinValue, {
    //     toValue: 1,
    //     duration: 1500,
    //     easing: Easing.linear,
    //     useNativeDriver: true,
    //   })
    // ).start();
  }

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient colors={['#264941', '#264941']} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Rotating Loader Icon */}
        {/* <Animated.Image
          source={Icons.DummyImageIcon}
          style={[styles.icon, { transform: [{ rotate: spin }] }]}
          resizeMode="contain"
        /> */}

        {/* Text */}
        <Text style={styles.text}>PAYMENT</Text>
        <Text style={styles.subText}>PROCESS</Text>
      </View>
    </LinearGradient>
  );
};

export default PaymentProcessingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: "#777", // gives that light gray tone from your design
  },
  text: {
    fontSize: fontPixel(54),
    color: "#fff",
    fontFamily: FONTS.tenonMediumFont,
  },
  subText: {
    fontSize: fontPixel(54),
    color: "#fff",
    fontFamily: FONTS.tenonMediumFont,
  },
});