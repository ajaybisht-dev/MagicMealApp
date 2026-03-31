import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
} from "react-native";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { FONTS } from "../../theme/FontsLink";
import { Icons } from "../../theme/AssetsUrl";

interface PickupConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const PickupConfirmationModal: React.FC<PickupConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
}) => {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Pickup Confirmation</Text>
                        <Pressable onPress={onClose}>
                            <Image
                                source={Icons.CrossIcon}
                                style={{
                                    width: widthPixel(27),
                                    height: heightPixel(27),
                                }}
                                resizeMode="contain"
                                tintColor="#000"
                            />
                        </Pressable>
                    </View>

                    {/* Message */}
                    <Text style={styles.message}>
                        Are you sure you want to confirm this order pickup?
                    </Text>

                    {/* Actions */}
                    <View style={styles.buttonRow}>
                        <Pressable style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>

                        <Pressable style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmText}>Confirm Pickup</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default PickupConfirmationModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },

    container: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        fontSize: fontPixel(20),
        fontFamily: FONTS.tenonBoldFont,
        color: "#000",
    },

    message: {
        marginTop: 20,
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonRegularFont,
        color: "#333",
        textAlign: "center",
    },

    buttonRow: {
        marginTop: 28,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    cancelButton: {
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#264941",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },

    confirmButton: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: "#264941",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },

    cancelText: {
        color: "#264941",
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonMediumFont,
    },

    confirmText: {
        color: "#fff",
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonMediumFont,
    },
});
