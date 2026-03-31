import React from "react";
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    ImageSourcePropType,
} from "react-native";
import { Icons } from "../../../theme/AssetsUrl";
import { fontPixel } from "../../../utils/responsive";
import { FONTS } from "../../../theme/FontsLink";

type TotalSavingProps = {
    userTotalSaving: any;
    accountDate: any
};

const TotalSaving: React.FC<TotalSavingProps> = ({
    userTotalSaving,
    accountDate,
}) => {
    return (
        <View style={styles.wrapper}>
            <View style={styles.savingsCard}>
                <ImageBackground
                    source={Icons.BannerIcon as ImageSourcePropType}
                    style={styles.savingsCardImg}
                    resizeMode="stretch"
                >
                    <Text style={styles.titleText}>
                        You’ve Saved so far!
                    </Text>

                    <Text style={styles.amountText}>
                        AED {userTotalSaving?.savingPrice}
                    </Text>

                    <Text style={styles.subText}>
                        {accountDate ? accountDate : userTotalSaving?.totalOrders + " Orders"}
                    </Text>
                </ImageBackground>
            </View>
        </View>
    );
};

export default TotalSaving;

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        alignItems: "center",
    },
    savingsCard: {
        width: "100%",
        borderWidth: 1,
        borderColor: "transparent",
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        // overflow: "hidden",
        paddingVertical: 10,
    },
    savingsCardImg: {
        width: "100%",
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        // borderTopLeftRadius: 60,
        // borderTopRightRadius: 60,
    },
    titleText: {
        fontSize: fontPixel(18),
        fontFamily: FONTS.tenonMediumFont,
        color: "#ffffff",
    },
    amountText: {
        fontSize: fontPixel(28),
        fontFamily: FONTS.tenonBoldFont,
        color: "#ffffff",
        marginVertical: 6,
    },
    subText: {
        fontSize: fontPixel(16),
        fontFamily: FONTS.tenonMediumFont,
        color: "#ffffff",
    },
});