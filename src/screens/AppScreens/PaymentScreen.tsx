import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
} from "react-native";
import { Icons } from "../../theme/AssetsUrl";
import { useNavigation } from "@react-navigation/native";
import AddNewCardModal from "../../component/AddNewCardModal";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { DrawerParamList } from "../../navigation/DrawerNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkOut } from "../../../helpers/Services/cart";
import CustomToast from "../../component/CustomToast";

type Props = DrawerScreenProps<DrawerParamList, "PaymentScreen">;

const PaymentScreen: React.FC<Props> = ({ route }) => {
    const { cartId, totalAmount } = route.params;
    const navigation = useNavigation();
    const [showCardModal, setShowCardModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // useEffect(() => {
    //     const timer = setTimeout(() => navigation.navigate("OrderConfirmationScreen" as never), 3000);
    //     return () => clearTimeout(timer);
    // }, []);

    const handlePaymentProcess = async () => {
        const user_id = await AsyncStorage.getItem("user_id");
        let payload = {
            "cartID": cartId,
            "userID": user_id,
            // "taxAmount": totalAmount,
            "taxAmount": 0,
            "paymentMode": "",
            "paymentGatewayTxnId": ""
        }
        console.log(payload);

        await checkOut(payload).then((response) => {
            if (response?.succeeded) {
                setShowToast(true);
                setToastMessage(response?.messages[0]);
                setTimeout(() => {
                    setShowToast(false);
                    navigation.navigate("PaymentProcessingScreen" as never)
                }, 1000);
            } else {
                setShowToast(true);
                setToastMessage(response?.messages[0]);
                setTimeout(() => {
                    setShowToast(false);
                }, 1000);
            }
        })
    }

    return (
        <View style={styles.container}>
            {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess}/>}
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.header} onPress={() => navigation.goBack()}>
                    <Image source={Icons.ArrowIcon} resizeMode="contain" style={{ height: 18, width: 18, transform: [{ "rotate": "-90deg" }] }} />
                    <Text style={styles.headerTitle}>  Checkout</Text>
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Apple Pay */}
                <Pressable style={[styles.paymentButton, { backgroundColor: "#000" }]}>
                    <Text style={[styles.paymentButtonText, { color: "#fff" }]}>
                         Pay
                    </Text>
                </Pressable>

                {/* Link Pay */}
                <Pressable
                    style={[
                        styles.paymentButton,
                        { backgroundColor: "#E6E6E6", marginTop: 10 },
                    ]}
                >
                    <Text style={styles.linkPayText}>Pay with ▶ link</Text>
                </Pressable>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or pay using</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Saved Card */}
                <Text style={styles.sectionTitle}>Saved</Text>
                <View style={styles.savedCard}>
                    <View style={styles.cardLeft}>
                        <View style={styles.cardIcon} />
                        <Text style={styles.cardText}>•••• 7492</Text>
                    </View>
                    <Text style={styles.viewMoreText}>View more ›</Text>
                </View>

                {/* New Payment Methods */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                    New payment method
                </Text>

                <Pressable style={styles.newMethodCard} onPress={() => setShowCardModal(true)}>
                    <Image
                        source={Icons.DummyImageIcon}
                        style={styles.methodIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.methodText}>New card</Text>
                </Pressable>

                <Pressable style={styles.newMethodCard}>
                    <Image
                        source={Icons.DummyImageIcon}
                        style={styles.methodIcon}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.methodText}>Klarna</Text>
                        <Text style={styles.subText}>Buy now or pay later with Klarna</Text>
                    </View>
                </Pressable>

                <Pressable style={styles.newMethodCard}>
                    <Image
                        source={Icons.DummyImageIcon}
                        style={styles.methodIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.methodText}>Cash App Pay</Text>
                </Pressable>
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.bottomButtonContainer}>
                <Pressable
                    onPress={() => handlePaymentProcess()}
                    style={styles.payButton}
                >
                    <Text style={styles.payButtonText}>PAY AED {totalAmount}</Text>
                </Pressable>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>Powered By Stripe</Text>
            <AddNewCardModal
                visible={showCardModal}
                onClose={() => setShowCardModal(false)}
                totalAmount={27}
                onPay={(data) => handlePaymentProcess()}
            />
        </View>
    );
};

export default PaymentScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    backArrow: {
        fontSize: 24,
        color: "#333",
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    paymentButton: {
        marginHorizontal: 20,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
    },
    paymentButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    linkPayText: {
        fontSize: 16,
        color: "#000",
        fontWeight: "600",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#CCC",
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
        color: "#777",
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "500",
        color: "#333",
        marginLeft: 20,
        marginBottom: 8,
    },
    savedCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#F8F8F8",
        borderRadius: 10,
        padding: 14,
        marginHorizontal: 20,
        alignItems: "center",
    },
    cardLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardIcon: {
        width: 35,
        height: 25,
        backgroundColor: "#333",
        borderRadius: 5,
        marginRight: 10,
    },
    cardText: {
        fontSize: 14,
        color: "#333",
    },
    viewMoreText: {
        color: "#777",
        fontSize: 13,
    },
    newMethodCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F8F8",
        borderRadius: 10,
        padding: 14,
        marginHorizontal: 20,
        marginBottom: 10,
    },
    methodIcon: {
        width: 25,
        height: 25,
        marginRight: 15,
    },
    methodText: {
        fontSize: 15,
        color: "#333",
    },
    subText: {
        fontSize: 12,
        color: "#888",
    },
    bottomButtonContainer: {
        position: "absolute",
        bottom: 60,
        width: "100%",
        alignItems: "center",
    },
    payButton: {
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 25,
        paddingVertical: 10,
        width: "60%",
        alignItems: "center",
    },
    payButtonText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#000",
    },
    footerText: {
        position: "absolute",
        bottom: 10,
        alignSelf: "center",
        fontSize: 12,
        color: "#888",
    },
});