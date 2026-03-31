import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
    Switch,
} from "react-native";
import { Icons } from "../theme/AssetsUrl";

interface AddNewCardModalProps {
    visible: boolean;
    onClose: () => void;
    onPay: (cardData: any) => void;
    totalAmount: number;
}

const AddNewCardModal: React.FC<AddNewCardModalProps> = ({
    visible,
    onClose,
    onPay,
    totalAmount,
}) => {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [country, setCountry] = useState("United Arab Emirates");
    const [zip, setZip] = useState("");
    const [saveCard, setSaveCard] = useState(true);

    const handlePay = () => {
        const cardData = { cardNumber, expiry, cvc, country, zip, saveCard };
        onPay(cardData);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* Background overlay */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            {/* Modal container */}
            <View style={styles.modalContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Pressable onPress={onClose} style={{ marginBottom: 10 }}>
                        <Image
                            source={Icons.ArrowIcon}
                            style={{ height: 18, width: 18, transform: [{ "rotate": "-90deg" }] }}
                            resizeMode="contain"
                        />
                    </Pressable>
                    <Text style={styles.headerTitle}>Add new card</Text>

                    {/* Card Info Section */}
                    <Text style={styles.sectionLabel}>Card information</Text>
                    <View style={styles.cardInfoContainer}>
                        <View style={styles.cardNumberRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Card number"
                                placeholderTextColor={"#ddd"}
                                keyboardType="number-pad"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                            />
                            <Image
                                source={Icons.DummyImageIcon}
                                style={{ height: 20, width: 20, marginHorizontal: 10 }}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                placeholder="MM / YY"
                                placeholderTextColor={"#ddd"}
                                keyboardType="number-pad"
                                value={expiry}
                                onChangeText={setExpiry}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="CVC"
                                placeholderTextColor={"#ddd"}
                                keyboardType="number-pad"
                                value={cvc}
                                onChangeText={setCvc}
                            />
                        </View>
                    </View>

                    {/* Billing Address Section */}
                    <Text style={styles.sectionLabel}>Billing address</Text>
                    <View style={styles.billingContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Country or region"
                            value={country}
                            onChangeText={setCountry}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="ZIP"
                            keyboardType="numeric"
                            value={zip}
                            onChangeText={setZip}
                        />
                    </View>

                    {/* Save card toggle */}
                    <View style={styles.saveCardContainer}>
                        <Switch
                            value={saveCard}
                            onValueChange={setSaveCard}
                            thumbColor={saveCard ? "#333" : "#888"}
                            trackColor={{ true: "#ccc", false: "#ddd" }}
                        />
                        <Text style={styles.saveCardText}>
                            Save this card for future payments
                        </Text>
                    </View>

                    {/* Pay button */}
                    <Pressable style={styles.payButton} onPress={handlePay}>
                        <Text style={styles.payText}>PAY AED {totalAmount}</Text>
                    </Pressable>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default AddNewCardModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 30,
        maxHeight: "85%",
    },
    scrollContainer: {
        flexGrow: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#555",
        marginBottom: 8,
    },
    cardInfoContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    cardNumberRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    billingContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 25,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        color: "#333",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
    },
    saveCardContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 25,
    },
    saveCardText: {
        marginLeft: 10,
        color: "#444",
        fontSize: 13,
    },
    payButton: {
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        alignSelf: "center",
        width: "70%",
    },
    payText: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
    },
});