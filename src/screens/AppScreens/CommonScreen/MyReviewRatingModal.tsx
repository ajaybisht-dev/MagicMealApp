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
import { FONTS } from "../../../theme/FontsLink";
import { Icons } from "../../../theme/AssetsUrl";
import StarRating from "react-native-star-rating-widget";
import { widthPixel, fontPixel, heightPixel } from "../../../utils/responsive";

interface FeedbackModalProps {
    serviceProviderName: string;
    visible: boolean;
    ratingData?: any;
    onClose: () => void;
    onSubmit: (data: {
        ratings: Record<string, number>;
        comment: string;
    }) => void;
}

/* BACKEND KEY → LABEL MAP */
const labelMap: Record<string, string> = {
    qualityRating: "Quality",
    quantityRating: "Quantity",
    tasteRating: "Taste",
    freshnessRating: "Freshness",
    packagingRating: "Packing",
};

const MyReviewRatingModal: React.FC<FeedbackModalProps> = ({
    serviceProviderName,
    visible,
    ratingData = {},
    onClose,
    onSubmit,
}) => {

    // Identify available rating keys dynamically
    const getRatingKeys = () => {
        return Object.keys(labelMap).filter((key) => key in ratingData);
    };

    // Convert backend → UI rating values
    const mapIncomingRatings = () => {
        const keys = getRatingKeys();
        const normalized: Record<string, number> = {};

        keys.forEach((key) => {
            normalized[key] = ratingData[key] ?? 0; // KEEP ZERO
        });

        return normalized;
    };

    const [ratings, setRatings] = useState<Record<string, number>>(mapIncomingRatings());
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (ratingData?.userComments) {
            setComment(ratingData?.userComments);
        }
        setRatings(mapIncomingRatings());
    }, [ratingData]);

    const handleRatingChange = (backendKey: string, rating: number) => {
        setRatings((prev) => ({
            ...prev,
            [backendKey]: rating, // STORE ZERO IF SELECTED
        }));
    };

    const handleSubmit = () => {
        onSubmit({
            ratings,     // <-- SEND ALL RATINGS (including 0)
            comment,
        });

        // Reset field values
        setComment("");
        setRatings(mapIncomingRatings());
    };

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Share your feedback</Text>

                        <Pressable
                            onPress={() => {
                                onClose();
                                setRatings(mapIncomingRatings());
                                setComment("");
                            }}
                        >
                            <Image
                                source={Icons.CrossIcon}
                                style={{ width: widthPixel(27), height: heightPixel(27) }}
                                resizeMode="contain"
                                tintColor="#000"
                            />
                        </Pressable>
                    </View>

                    {/* SERVICE PROVIDER NAME */}
                    <Text style={styles.subTitle}>{serviceProviderName}</Text>

                    {/* Dynamic Rating Rows */}
                    {getRatingKeys().map((backendKey) => (
                        <RatingRow
                            key={backendKey}
                            label={labelMap[backendKey]}
                            rating={ratings[backendKey] ?? 0}
                            onChange={(value) => handleRatingChange(backendKey, value)}
                        />
                    ))}

                    <Text style={styles.label}>Share your experience</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Write here"
                        placeholderTextColor="#999"
                        multiline
                        value={comment}
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

export default MyReviewRatingModal;

/* Rating Row Component */
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

/* Styles */
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