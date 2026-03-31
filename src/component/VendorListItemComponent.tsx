import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Icons } from "../theme/AssetsUrl";
import { IMG_URL } from "../../config";

interface Offer {
    id: string;
    serviceProviderName: string;
    image: any;
    surpriseBoxName: string;
    discountedPercent: string;
    actualPrice: string;
    discountedPrice: string;
    surpriseBoxRating: string;
    distanceInKm: string;
    noOfBoxes: string;
    collectionFromTime: string,
    collectionToTime: string,
    timeToAMPM: string,
    sbImageURL: string
}

interface Props {
    offer: Offer;
    onPress?: () => void;
}

const VendorListItemComponent: React.FC<Props> = ({ offer, onPress }) => {

    const handleImageData = (image_url: any) => {
        if (!image_url) return Icons.DummyImageIcon;
        const normalizedPath = image_url.replace(/\\/g, "/");
        return { uri: IMG_URL + normalizedPath };
    };

    const handleDiscountPrice = (offer: any) => {
        if (!offer?.actualPrice || !offer?.discountedPrice) return "0% OFF";

        const discountPercentage = (
            ((offer.actualPrice - offer.discountedPrice) / offer.actualPrice) * 100
        ).toFixed(0);

        return `${discountPercentage}% OFF`;
    };


    return (
        <Pressable onPress={onPress} style={styles.offerCard}>
            <View style={styles.offerTopRow}>
                <View style={styles.offerLeft}>
                    <Image
                        source={handleImageData(offer?.sbImageURL)}
                        style={styles.offerImage}
                        resizeMode={"contain"}
                    />
                    <View>
                        <Text style={styles.offerItem}>{offer.surpriseBoxName}</Text>
                    </View>
                </View>
                <Text style={styles.offerRating}>{offer.surpriseBoxRating} ★</Text>
            </View>

            <Text style={styles.offerPrice}>
                <Text style={styles.oldPrice}>AED {offer.actualPrice}</Text> AED {offer.discountedPrice} ({offer.discountedPercent}% OFF)
            </Text>

            <View style={styles.offerBottomRow}>
                <Text style={styles.offerDetail}>{offer.distanceInKm} Km</Text>
                <Text style={styles.offerDetail}>{offer.collectionFromTime}-{offer.collectionToTime} {offer.timeToAMPM}</Text>
            </View>
            <Text style={styles.offerStock}>{offer.noOfBoxes} Available</Text>
        </Pressable>
    );
};

export default VendorListItemComponent;

const styles = StyleSheet.create({
    offerCard: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    offerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    offerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    offerImage: {
        width: 45,
        height: 45,
        resizeMode: "contain",
        marginRight: 10,
    },
    offerRestaurant: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    offerItem: {
        fontSize: 13,
        color: "#555",
    },
    offerRating: {
        fontSize: 13,
        color: "#333",
        fontWeight: "500",
    },
    offerPrice: {
        fontSize: 14,
        color: "#111",
        fontWeight: "600",
        marginTop: 4,
    },
    oldPrice: {
        textDecorationLine: "line-through",
        color: "#888",
    },
    offerBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    offerDetail: {
        fontSize: 13,
        color: "#555",
    },
    offerStock: {
        fontSize: 13,
        color: "#4A3AFF",
        fontWeight: "600",
        marginTop: 6,
    },
});