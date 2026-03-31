import { View, Text, StyleSheet, Pressable, Image, ImageBackground } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Icons } from '../theme/AssetsUrl'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { getData } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { fontPixel, heightPixel, widthPixel } from '../utils/responsive';
import { FONTS } from '../theme/FontsLink';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setRadiusData } from '../store/Slices/locationRadiusSlice';

interface UserDetails {
    userID: string;
    fullName: string;
    userEmail?: string;
    userRole?: string;
    userPhone?: string;
    firstName?: string;
}

interface Props {
    onPressNavigation?: () => void;
    onPress?: () => void;
    navigateToCartList?: () => void;
    currentLocation: any;
}

const CommonHeader: React.FC<Props> = ({ onPressNavigation, currentLocation, onPress, navigateToCartList }) => {

    const dispatch = useDispatch();


    const addressSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.address);
    const radiusSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.radius);
    const apiCartSelector = useSelector((state: RootState) => state.addToCartSlice?.api_cart_data as any);
    const userDataSelector = useSelector((state: RootState) => state?.userProfileSlice?.userProfileData);

    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [totalCartItem, setTotalCartItem] = useState<string[]>([]);
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        if (userDataSelector) {
            const data: any = { ...userDataSelector };

            if (data?.firstName) {
                const newData = data.firstName.split(" ");
                data.firstName = newData[0];
            }

            setUserDetails(data);
        }
    }, [userDataSelector]);




    useEffect(() => {
        if (apiCartSelector?.length > 0) {
            let filterData = apiCartSelector?.filter((item: any) => item?.quantity > 0);
            setTotalCartItem(filterData);
        }
    }, [apiCartSelector])

    useEffect(() => {
        const fetchRadius = async () => {
            try {
                const Radius = await AsyncStorage.getItem("Radius");
                const parsedRadius = Radius ? JSON.parse(Radius) : radiusSelector;
                dispatch(setRadiusData(parsedRadius));
                setDistance(parsedRadius);
            } catch (error) {
                console.error("Error fetching Radius:", error);
            }
        };

        fetchRadius();
    }, [radiusSelector]);

    const totalCartCount = useMemo(() => {
        return totalCartItem?.reduce(
          (sum: number, item: any) => sum + (item?.quantity || 0),
          0
        );
      }, [totalCartItem]);

    return (
        <View style={[styles.headerContainer, { justifyContent: "space-between", marginTop: 10 }]}>
            <View style={styles.headerContainer}>
                <Pressable onPress={onPress} style={styles.menuButton}>
                    <Image source={Icons.MenuIcon} style={styles.menuIcon} />
                </Pressable>
                <View>
                    <Text style={styles.headerTitle}>{`Hello, ${userDetails?.firstName && userDetails?.firstName?.length > 15 ? userDetails?.firstName.slice(0, 15) + "..." : userDetails?.firstName}`}</Text>
                    <Pressable onPress={onPressNavigation} style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                        <View>
                            <Image source={Icons.LocationIcon} style={{ height: heightPixel(18), width: widthPixel(18) }} resizeMode="contain" />
                        </View>
                        <View>
                            {
                                addressSelector ?
                                    <Text style={styles.locationText}> {addressSelector?.length > 20 ? addressSelector.slice(0, 20) + "..." : addressSelector} - {distance} Kms</Text>
                                    :
                                    <Text style={styles.locationText}> {currentLocation?.length > 20 ? currentLocation.slice(0, 20) + "..." : currentLocation} - {distance} Kms</Text>
                            }
                        </View>
                    </Pressable>
                </View>
            </View>
            {/* <Pressable
                onPress={navigateToCartList}
                style={styles.menuButton} disabled={totalCartItem.length > 0 ? false : true}>
                {
                    totalCartItem.length > 0 ?
                        <ImageBackground source={Icons.CartIcon} style={styles.CartIcon} resizeMode='contain'>
                            <View style={{ backgroundColor: "#FFF500", borderRadius: 50, height: heightPixel(22), width: widthPixel(22), position: "absolute", bottom: 0, right: 0, justifyContent: "center", alignItems: "center", borderWidth: 0 }}>
                                <Text style={{ fontSize: fontPixel(13), fontFamily: FONTS.muliBoldFont }}>{totalCartItem.length}</Text>
                            </View>
                        </ImageBackground> :
                        <Image source={Icons.CartIcon} style={styles.CartIcon} resizeMode='contain' />
                }
            </Pressable> */}
            {
                totalCartItem.length > 0 &&
                <Pressable
                    onPress={navigateToCartList}
                    style={styles.menuButton}>
                    <ImageBackground source={Icons.CartIcon} style={styles.CartIcon} resizeMode='contain'>
                        <View style={{ backgroundColor: "#FFF500", borderRadius: 50, height: heightPixel(22), width: widthPixel(22), position: "absolute", bottom: 0, right: 0, justifyContent: "center", alignItems: "center", borderWidth: 0 }}>
                            <Text style={{ fontSize: fontPixel(13), fontFamily: FONTS.muliBoldFont }}>{totalCartCount}</Text>
                        </View>
                    </ImageBackground>
                </Pressable>
            }
        </View>
    )
}

export default CommonHeader

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 0,
        // paddingHorizontal: 8,
        // marginTop: 10
    },
    menuButton: { marginRight: 12 },
    menuIcon: { width: widthPixel(22), height: heightPixel(22) },
    CartIcon: { width: widthPixel(39), height: heightPixel(39) },
    headerTitle: { fontSize: fontPixel(20), fontFamily: FONTS.tenonBoldFont, color: "#fff" },
    locationText: {
        fontSize: fontPixel(14),
        color: "#fff",
        fontFamily: FONTS.tenonRegularFont
    }
})