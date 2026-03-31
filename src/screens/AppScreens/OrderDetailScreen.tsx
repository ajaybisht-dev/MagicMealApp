import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Dimensions,
    Animated,
    PanResponder,
    Image,
    Alert,
    Linking,
} from "react-native";
import { Icons } from "../../theme/AssetsUrl";
import { useNavigation } from "@react-navigation/native";
import RateAndReviewModal from "../../component/RateAndReviewModalProps";

const { width } = Dimensions.get("window");

const OrderDetailScreen: React.FC = () => {

    const navigation = useNavigation();

    const [showModal, setShowModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("+917466978195");

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

    const handleCallManager = (phoneNumber: string) => {
        if (!phoneNumber) {
            Alert.alert("Invalid Number", "Manager phone number is missing.");
            return;
        }

        const phoneUrl = `tel:${phoneNumber}`;

        Linking.canOpenURL(phoneUrl)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(phoneUrl);
                } else {
                    Alert.alert("Error", "Unable to open phone dialer on this device.");
                }
            })
            .catch((err) => console.error("Error opening dialer:", err));
    };

    const handlePhoneNumber = (phoneNumber: string) => {
        if (!phoneNumber) return "";

        const visible = phoneNumber.slice(0, 7);
        return `${visible}XXXXXX`;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Header */}
                <View>
                    <Pressable style={styles.header} onPress={() => navigation.goBack()}>
                        <Image source={Icons.ArrowIcon} resizeMode="contain" style={{ height: 18, width: 18, transform: [{ "rotate": "-90deg" }] }} />
                        <Text style={styles.headerTitle}>  Order #MM123456</Text>
                    </Pressable>
                </View>

                {/* Status and Item Info */}
                <View style={styles.section}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>Ready for Pickup</Text>

                    <Text style={[styles.label, { marginTop: 12 }]}>Item:</Text>
                    <Text style={styles.value}>Veg Meal Combo Box</Text>

                    <Text style={[styles.label, { marginTop: 12 }]}>QTY:</Text>
                    <Text style={styles.value}>1</Text>
                </View>

                {/* Pickup Details */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitle}>Pickup Details</Text>
                        <View style={styles.line} />
                    </View>

                    <Text style={styles.text}>Restaurant A, Marina Mall, Shop 12</Text>
                    <Text style={styles.linkText}>[Get Directions]</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.text}>{handlePhoneNumber(phoneNumber)}</Text>
                        <Pressable onPress={() => handleCallManager(phoneNumber)}>
                            <Text style={styles.callNow}>Call Now</Text>
                        </Pressable>
                    </View>

                    <Text style={[styles.text, { marginTop: 10 }]}>
                        Today, 6:00 PM - 8:00 PM
                    </Text>
                </View>

                {/* Important Section */}
                <View style={styles.importantSection}>
                    <Text style={styles.importantHeader}>⚠ Important</Text>
                    <Text style={styles.bullet}>• Arrive during pickup window</Text>
                    <Text style={styles.bullet}>• Swipe to confirm pickup in app</Text>
                </View>

                {/* Payment Info */}
                <View style={styles.section}>
                    <Text style={styles.text}>Amount Paid: AED 22</Text>
                    <Text style={styles.text}>You Saved: AED 40</Text>

                    <Text style={[styles.text, { marginTop: 12 }]}>
                        Pay Via: Card 9087********67
                    </Text>
                </View>

                {/* Cancel Button */}
                <Pressable style={styles.cancelButton} onPress={() => setShowModal(true)}>
                    <Text style={styles.cancelButtonText}>CANCEL ORDER</Text>
                </Pressable>
            </ScrollView>

            {/* Swipe to Confirm */}
            <SwipeToConfirm />
            <RateAndReviewModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={(data) => console.log("Review submitted:", data)}
            />
        </View>
    );
};

export default OrderDetailScreen;

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
        fontSize: 17,
        fontWeight: "600",
        color: "#333",
    },

    section: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 14,
        color: "#555",
    },
    value: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginTop: 3,
    },
    text: {
        fontSize: 14,
        color: "#333",
        marginTop: 6,
    },
    linkText: {
        fontSize: 14,
        color: "#4A3AFF",
        marginTop: 4,
    },
    callNow: {
        fontSize: 14,
        color: "#4A3AFF",
        fontWeight: "500",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
    },

    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#ccc",
        marginLeft: 10,
        marginTop: 2,
    },

    importantSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    importantHeader: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
    },
    bullet: {
        fontSize: 14,
        color: "#333",
        marginLeft: 8,
    },

    cancelButton: {
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        marginTop: 30,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
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
    confirmedText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 14,
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
    swipeText: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
});  