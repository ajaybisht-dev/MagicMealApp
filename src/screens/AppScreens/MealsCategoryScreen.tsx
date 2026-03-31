import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    NativeScrollEvent,
    ActivityIndicator,
    FlatList,
    Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CommonHeader from "../../component/CommonHeader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import { DrawerNavigationProp, DrawerScreenProps } from "@react-navigation/drawer";
import { DrawerParamList } from "../../navigation/DrawerNavigation";
import { getData } from "../../utils/storage";
import { getAllActiveSurpriseBoxesByCustomerId, getAllHotDealSurpriseBoxes } from "../../../helpers/Services/surprise_box";
import AllOffersComponent from "../../component/AllOffersComponent";
import CommonModal from "../../component/CommonComponent/CommonModal";
import { setFilterData } from "../../store/Slices/filterSlice";
import language_data_json from "../../JSON/language.json";

type Props = DrawerScreenProps<DrawerParamList, "MealsCategoryScreen">;
type MealsCategoryNavProp = DrawerNavigationProp<DrawerParamList, "MealsCategoryScreen">;

interface UserDetails {
    userID: string;
    fullName: string;
    userEmail?: string;
    userRole?: string;
    userPhone?: string;
}

interface FilterData {
    selectedVendorsIds: any;
    selectedMealsIds: any;
    price: any;
}

type AppItems = {
    SearchPlaceHolder: string;
    Filter: string;
    BrowseByCategory: string;
    HotDealsNearYou: string;
    AllOffers: string;
    Sort: string;
    Available: string;
};

type FilterItems = {
    VendorType: string,
    MealType: string,
    PriceRange: string,
    Distance: string,
    Rating: string,
    SortBy: string,
    Apply: string,
    Clear: string
}

type OtherItems = {
    NoRestaurantFoundWithIn: string;
    KM: string,
    ChangeRadius: string
};

type LanguageMap = {
    en: { app_items: AppItems; other_items: OtherItems, filter_items: FilterItems };
    ar: { app_items: AppItems; other_items: OtherItems, filter_items: FilterItems };
};

type SupportedLang = keyof LanguageMap
const language_data = language_data_json as LanguageMap;

const MealsCategoryScreen: React.FC<Props> = ({ route }) => {

    const { categoryMealTypeId, categoryMealTypeName } = route.params;

    const navigation = useNavigation<MealsCategoryNavProp>();
    const dispatch = useDispatch();

    const addressSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.address);
    const radiusSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.radius);
    const vendor_type_Selector = useSelector((state: RootState) => state?.ventorAndMealSlice?.vendor_types);
    const filter_data = useSelector((state: RootState) => state?.filterSlice?.filterData);
    const languageSelector = useSelector((state: RootState) => state?.languageSlice?.selected_language);

    const [currentLocation, setCurrentLocation] = useState("");
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [vendorList, setVendorList] = useState<string[]>([]);
    const [listLoader, setListLoader] = useState(true);
    const [onScrollLoader, setOnScrollLoader] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [listData, setListData] = useState<string[]>([]);
    const [showFilterModal, setShowFilterModel] = useState(false);
    const [filter_data_Selector, setFilterDataSelector] = useState<FilterData | null>(null)
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");

    const pageNumber = useRef(1);
    const scrollRef = useRef(null);

    const AppLabels = language_data[selectedLanguage].app_items;
    const OtherLabels = language_data[selectedLanguage].other_items;
    const FilterLabels = language_data[selectedLanguage].filter_items;

    useEffect(() => {
        if (languageSelector === "en" || languageSelector === "ar") {
            setSelectedLanguage(languageSelector);
        }
    }, [languageSelector]);

    useEffect(() => {
        const init = async () => {
            setListLoader(true);
            await fetchUserData();
            dispatch(setFilterData(null));
        };
        init();
    }, []);

    useEffect(() => {
        setCurrentLocation(addressSelector);
        setFilterDataSelector(filter_data);
        getAllHotDealSurpriseBoxesFunction();
    }, [addressSelector, filter_data, userDetails]);

    const fetchUserData = async () => {
        const userData = await getData("userData");
        setUserDetails(userData);
    };

    async function getAllHotDealSurpriseBoxesFunction() {

        let payload = {
            "userID": userDetails?.userID,
            "pageNumber": pageNumber.current,
            "pageSize": 10,
            "vendorTypeIDs": filter_data_Selector?.selectedVendorsIds?.length > 0 ? filter_data_Selector?.selectedVendorsIds : vendor_type_Selector.map((item: any) => item?.id),
            "mealTypeIDs": filter_data_Selector?.selectedMealsIds?.length > 0 ? filter_data_Selector?.selectedMealsIds : [categoryMealTypeId],
            "maxDistanceKm": Number(radiusSelector),
            "minPrice": 0,
            "maxPrice": filter_data_Selector?.price ? (filter_data_Selector?.price * 10) : 300
        }

        await getAllActiveSurpriseBoxesByCustomerId(payload).then((response) => {
            if (response?.succeeded) {
                setListLoader(false);
                setOnScrollLoader(false);
                setTotalPages(response?.totalPages);
                setListData(response?.data);
            }
        })
    }

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
        const distanceFromEnd = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        return distanceFromEnd < 4000;
    };

    const handleScrollEndDrag = () => {
        if (scrollRef.current) {
            if (pageNumber.current < totalPages) {
                setOnScrollLoader(true);
                pageNumber.current += 1;
                getAllHotDealSurpriseBoxesFunction();
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={{ marginBottom: 10 }}>
                <CommonHeader
                    onPressNavigation={() => navigation.navigate("LocationScreen")}
                    currentLocation={currentLocation}
                    onPress={() => navigation.goBack()}
                />
            </View>
            <View style={styles.filterRow}>
                <View style={styles.lineWrapper}>
                    <Text style={styles.categoryTitle}>{`${categoryMealTypeName} Meals`}</Text>
                    <View style={styles.line} />
                </View>
                <Pressable onPress={() => setShowFilterModel(true)}>
                    <Text style={styles.filterText}>{AppLabels?.Filter}/{AppLabels?.Sort}</Text>
                </Pressable>
            </View>
            {
                listLoader ?
                    <View style={{ display: "flex", alignItems: 'center', justifyContent: "center", flex: 1 }}>
                        <ActivityIndicator size={"large"} />
                    </View>
                    : listData?.length > 0 ?
                        <View>
                            <FlatList
                                ref={scrollRef}
                                data={listData}
                                keyExtractor={(item: any, index) => item.surpriseBoxID ?? index.toString()}
                                renderItem={({ item }) => (
                                    <AllOffersComponent
                                        offer={item}
                                        onPress={() => {
                                            navigation.navigate("CheckoutScreen", {
                                                surpriseBoxID: item?.surpriseBoxID,
                                                serviceProviderID: item?.serviceProviderID,
                                            })
                                        }}
                                    />
                                )}
                                onScroll={({ nativeEvent }) => {
                                    if (onScrollLoader == false) {
                                        if (isCloseToBottom(nativeEvent)) {
                                            handleScrollEndDrag()
                                        }
                                    }
                                }}
                                contentContainerStyle={[styles.allOffersSection, { marginTop: 0 }]}
                            />
                        </View>
                        :
                        <View style={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <Text>{OtherLabels?.NoRestaurantFoundWithIn} {radiusSelector}{OtherLabels?.KM}</Text>
                            <Pressable
                                onPress={() => navigation.navigate("LocationScreen")} style={{ backgroundColor: "blue", borderRadius: 8, padding: 8, marginTop: 5 }}>
                                <Text style={{ color: "#fff" }}>{OtherLabels?.ChangeRadius}</Text>
                            </Pressable>
                        </View>
            }
            <CommonModal
                showModal={showFilterModal}
                closeModal={() => setShowFilterModel(false)}
                categoryMealTypeId={categoryMealTypeId}
            />
        </View>
    );
};

export default MealsCategoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    allOffersSection: { marginTop: 30, paddingHorizontal: 16 },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 12,
    },
    lineWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    line: {
        width: 100,
        height: 1,
        backgroundColor: "#AAA",
        marginLeft: 10,
    },
    filterText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    offerCard: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 18,
        backgroundColor: "#FFF",
    },
    cardTop: {
        flexDirection: "row",
    },
    offerImage: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        marginRight: 10,
    },
    cardInfo: {
        flex: 1,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    restaurantName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    ratingText: {
        fontSize: 13,
        color: "#333",
    },
    itemName: {
        fontSize: 13,
        color: "#444",
    },
    priceText: {
        fontSize: 13,
        color: "#111",
        fontWeight: "600",
        marginTop: 4,
    },
    oldPrice: {
        textDecorationLine: "line-through",
        color: "#888",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    detailText: {
        fontSize: 13,
        color: "#444",
    },
    stockText: {
        fontSize: 13,
        color: "#4A3AFF",
        fontWeight: "600",
        marginTop: 6,
    },
});


