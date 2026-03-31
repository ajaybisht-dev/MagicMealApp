import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Icons } from "../../theme/AssetsUrl";
import { IMG_URL } from "../../../config";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { FONTS } from "../../theme/FontsLink";

interface SurpriseBox {
    serviceProviderName: string;
    surpriseBoxName: string;
    discountedPercent: number;
    actualPrice: number;
    discountedPrice: number;
    surpriseBoxRating: number;
    distanceInKm: number;
    noOfBoxRemaing: number;
    collectionFromTime: number,
    collectionToTime: number,
    timeToAMPM: string,
    sbImageURL: string,
    quantity: number,
    serviceProviderAddress: string,
    surpriseBoxMealType: any,
    mealType: string,
    decLoading: boolean,
    incLoading: boolean,
    serviceProviderVendorType: any
}

interface Props {
    serviceProviderData: SurpriseBox;
}

const OrderDetailsCart: React.FC<Props> = ({ serviceProviderData }) => {
    

    // const handleImageData = (image_url: any) => {
    //     if (!image_url) {
    //         return Icons.NonVegBoxIcon
    //         // switch (deal) {
    //         //     case "Non Veg": return Icons.NonVegBoxIcon
    //         //     case "Veg": return Icons.VegBoxIcon
    //         //     case "Vegan": return Icons.VeganBoxIcon
    //         //     case "Sea Food": return Icons.SeaFoodBoxIcon
    //         //     default: break;
    //         // }
    //     } else {
    //         const normalizedPath = image_url.replace(/\\/g, "/");
    //         return { uri: IMG_URL + normalizedPath };
    //     }
    // };

    const handleImageData = (image_url: any, deal: any, serviceProviderVendorType: any) => {
        if (!image_url) {
            if (deal == "Others") {
                switch (serviceProviderVendorType) {
                    case "Bakery": return Icons.BakeryIcon
                    case "Grocery": return Icons.GroceryIcon
                    case "Butcher": return Icons.ButcherIcon
                    default: break;
                }
            } else {
                switch (deal) {
                    case "Non Veg": return Icons.NonVegBoxIcon
                    case "Veg": return Icons.VegBoxIcon
                    case "Vegan": return Icons.VeganBoxIcon
                    case "Sea Food": return Icons.SeaFoodBoxIcon
                    default:
                        break;
                }
            }
        } else {
            const normalizedPath = image_url.replace(/\\/g, "/");
            return { uri: IMG_URL + normalizedPath };
        }
    };

    // const handleImageData = (
    //       image_url: any,
    //       deal: any,
    //       serviceProviderVendorType: any,
    //       surpriseBoxName: any,
    //     ) => {
    //       if (image_url) {
    //         const normalizedPath = image_url.replace(/\\/g, '/');
    //         return { uri: IMG_URL + normalizedPath };
    //       }
      
    //       switch (serviceProviderVendorType) {
    //         case 'Restaurant':
    //           if (surpriseBoxName?.includes('Non Veg')) return Icons.NonVegBoxIcon;
    //           if (surpriseBoxName?.includes('Vegan')) return Icons.VeganBoxIcon;
    //           if (surpriseBoxName?.includes('Veg')) return Icons.VegBoxIcon;
    //           if (surpriseBoxName?.includes('Sea Food')) return Icons.SeaFoodBoxIcon;
    //           return Icons.SeaFoodBoxIcon;
      
    //         case 'Bakery':
    //           return Icons.BakeryIcon;
      
    //         case 'Grocery':
    //           return Icons.GroceryIcon;
      
    //         case 'Butcher':
    //           return Icons.ButcherIcon;
      
    //         default:
    //           return Icons.SeaFoodBoxIcon;
    //       }
    //     };

    return (
        <View style={styles.card}>
            <View style={{ display: "flex", flexDirection: "row" }}>
                <View style={styles.boxWhiteInner}>
                    <Image source={handleImageData(serviceProviderData?.sbImageURL, serviceProviderData?.surpriseBoxMealType[0]?.mealType, serviceProviderData?.serviceProviderVendorType)} style={styles.productImage} />
                </View>
                <View style={{ marginLeft: 15 }}>
                    <View style={styles.productDetails}>
                        <Text style={styles.mealName}>{serviceProviderData?.surpriseBoxName?.length > 25 ? serviceProviderData?.surpriseBoxName?.slice(0, 25) + "..." : serviceProviderData?.surpriseBoxName}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.oldPrice}>{`AED ${serviceProviderData?.actualPrice * serviceProviderData?.quantity}`}</Text>
                        <Text style={styles.newPrice}>{`AED ${serviceProviderData?.discountedPrice * serviceProviderData?.quantity}`}</Text>
                        <Text style={styles.discountText}>{`${serviceProviderData?.discountedPercent}%`}</Text>
                    </View>
                    <Text style={styles.qtyText}>{`QTY: ${serviceProviderData?.quantity}`}</Text>
                </View>
            </View>
        </View>
    );
};

export default OrderDetailsCart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    boxWhiteInner: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
        borderRightWidth: 1,
        borderRightColor: "#dddddd",
        paddingRight: 10
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
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },

    productSection: {
        flexDirection: "row",
        marginTop: 5,
        marginRight: 10,
        // borderRightWidth: 1,
        // borderRightColor: "#DDDDDD",
        paddingLeft: 5,
    },
    productImage: {
        width: widthPixel(74),
        height: heightPixel(74),
        resizeMode: "contain",
    },
    productDetails: {
        marginTop: 5,
    },
    mealName: {
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonBoldFont,
        color: "#2E2E2E",
    },
    priceText: {
        fontSize: fontPixel(16),
        color: "#2E2E2E",
        fontFamily: FONTS.tenonMediumFont
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 5,
        marginBottom: 5
    },
    oldPrice: {
        textDecorationLine: 'line-through',
        color: '#9D9D9D',
        marginRight: 13,
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonMediumFont,
        includeFontPadding: false,
    },
    newPrice: {
        color: '#2E2E2E',
        marginRight: 8,
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonMediumFont,
        includeFontPadding: false,
    },
    discountText: {
        color: '#666666',
        fontSize: fontPixel(14),
        fontFamily: FONTS.tenonMediumFont,
        includeFontPadding: false,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
    },
    savingText: {
        fontSize: 13,
        color: "#333",
    },
    stockText: {
        fontSize: fontPixel(13),
        fontFamily: FONTS.muliBoldFont,
        top: 5,
        marginLeft: 15
    },

    quantitySection: {
        marginTop: 0
    },
    quantityLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    qtyControls: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D8D8D8",
        borderRadius: 6
    },
    qtyButton: {
        width: widthPixel(28),
        height: heightPixel(24),
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#264941",
    },
    qtyText: {
        fontSize: fontPixel(18),
        color: "#2E2E2E",
        fontFamily: FONTS.tenonBoldFont
    },
    qtyBox: {
        width: widthPixel(50),
        alignItems: "center"
    },
    qtyValue: {
        fontSize: fontPixel(14),
        color: "#15090A",
        fontFamily: FONTS.tenonBoldFont,
    },

    locationSection: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 10,
    },
    locationText: {
        fontSize: 14,
        color: "#333",
    },
    timeText: {
        fontSize: 13,
        color: "#555",
        marginTop: 4,
    },

    reviewSection: {
        paddingHorizontal: 20,
    },
    reviewHeader: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    reviewRating: {
        fontSize: 14,
        color: "#333",
    },
    reviewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    reviewLabel: {
        fontSize: 14,
        color: "#555",
    },
    reviewValue: {
        fontSize: 14,
        color: "#333",
    },
    viewAllButton: {
        alignSelf: "flex-end",
        marginTop: 10,
    },
    viewAllText: {
        fontSize: 14,
        color: "#4A3AFF",
    },

    vendorButton: {
        alignSelf: "center",
        marginTop: 40,
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    vendorButtonText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#333",
    },

    checkoutBar: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        borderTopWidth: 1,
        borderColor: "#DDD",
        backgroundColor: "#FAFAFA",
        paddingVertical: 15,
        alignItems: "center",
    },
    checkoutButton: {},
    checkoutText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    card: {
        marginBottom: 10,
        borderRadius: 15,
        paddingTop: 5,
    },
});