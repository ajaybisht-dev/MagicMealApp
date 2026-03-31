import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    Image,
} from "react-native";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { FONTS } from "../../theme/FontsLink";
import { Icons } from "../../theme/AssetsUrl";
import StarRating from "react-native-star-rating-widget";

interface FeedbackModalProps {
    serviceProviderName: string;
    visible: boolean;
    value: "Restaurant" | "Bakery" | "Grocery" | "Butcher";
    ratingData?: any;
    onClose: () => void;
    onSubmit: (data: {
        ratings: Record<string, number>;
        comment: string;
    }) => void;
}

const MyRatingModal: React.FC<FeedbackModalProps> = ({
    serviceProviderName,
    visible,
    value,
    ratingData = {},
    onClose,
    onSubmit,
}) => {
    const ratingObject: Record<string, string[]> = {
        Restaurant: ["Quality", "Quantity", "Taste"],
        Bakery: ["Quality", "Freshness", "Taste"],
        Grocery: ["Quality", "Quantity", "Packing"],
        Butcher: ["Quality", "Quantity", "Packing"],
    };
    const keyMap: Record<string, string> = {
        Quality: "qualityRating",
        Quantity: "quantityRating",
        Taste: "tasteRating",
        Freshness: "freshnessRating",
        Packing: "packagingRating",
    };

    const mapIncomingRatings = () => {
        const labels = ratingObject[value] ?? [];
        const normalized: Record<string, number> = {};

        labels.forEach(label => {
            const backendKey = keyMap[label];
            normalized[label] = ratingData?.[backendKey] ?? 0;
        });

        return normalized;
    };

    const [ratings, setRatings] = useState<Record<string, number>>(
        mapIncomingRatings()
    );
    const [comment, setComment] = useState("");
    const [serviceProviderNameData, setServiceProviderNamedata] = useState("");

    useEffect(() => {
        setRatings(mapIncomingRatings());
    }, [ratingData, value]);

    useEffect(() => {
        setServiceProviderNamedata(serviceProviderName);
    }, [serviceProviderName]);

    const handleRatingChange = (label: string, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [label]: rating,
        }));
    };

    const handleSubmit = () => {
        onSubmit({
            ratings,
            comment,
        });
        setRatings({});
        setComment("");
    };

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Share your feedback</Text>
                        <Pressable onPress={() => [onClose(), setRatings({}), setComment("")]}>
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

                    <Text style={styles.subTitle}>{serviceProviderNameData}</Text>

                    {(ratingObject[value] ?? [])?.map(label => (
                        <RatingRow
                            key={label}
                            label={label}
                            rating={ratings[label] || 0}
                            onChange={rating => handleRatingChange(label, rating)}
                        />
                    ))}

                    <Text style={styles.label}>Share your experience</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Write here"
                        placeholderTextColor="#999"
                        multiline
                        onChangeText={setComment}
                    />

                    <Pressable style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Submit</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default MyRatingModal;

const RatingRow = ({
    label,
    rating,
    onChange,
}: {
    label: string;
    rating: number;
    onChange: (value: number) => void;
}) => (
    <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>{label}</Text>

        <StarRating
            rating={rating}
            onChange={onChange}
            starSize={35}
            color="#FFB800"
            animationConfig={{ scale: 1 }}
            style={{ paddingVertical: 4 }}
            step="full"
        />
    </View>
);


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
        fontSize: fontPixel(22),
        fontFamily: FONTS.tenonBoldFont,
        color: "#000",
    },
    subTitle: {
        marginTop: 12,
        marginBottom: 12,
        fontSize: fontPixel(20),
        fontFamily: FONTS.tenonMediumFont,
        color: "#000",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 6,
    },
    ratingLabel: {
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonRegularFont,
        color: "#1C1939",
    },
    label: {
        marginTop: 16,
        marginBottom: 6,
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonMediumFont,
        color: "#000",
    },
    input: {
        height: 90,
        borderWidth: 1,
        borderColor: "#DADADA",
        borderRadius: 10,
        padding: 12,
        textAlignVertical: "top",
        fontFamily: FONTS.tenonRegularFont,
        color: "#000",
    },
    submitButton: {
        marginTop: 22,
        backgroundColor: "#264941",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonMediumFont,
    },
});