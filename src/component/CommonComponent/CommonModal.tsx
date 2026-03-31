import { View, Text, Modal, Pressable, Image, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Icons } from '../../theme/AssetsUrl'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { setRadiusData } from '../../store/Slices/locationRadiusSlice';
// import Slider from '@react-native-community/slider';
import { setFilterData } from '../../store/Slices/filterSlice';

const { width } = Dimensions.get("window");

interface CommonModalProps {
    showModal: boolean;
    closeModal: () => void;
    categoryMealTypeId: string | number
}

const CommonModal: React.FC<CommonModalProps> = ({ showModal, closeModal, categoryMealTypeId }) => {

    const dispatch = useDispatch();

    const addressSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.address);
    const radiusSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.radius);
    const vendor_type_Selector = useSelector((state: RootState) => state?.ventorAndMealSlice?.vendor_types);
    const meal_type_Selector = useSelector((state: RootState) => state?.ventorAndMealSlice?.meals_types);

    const [defaultSelectedMealsIds, setDefaultSelectedMealsIds] = useState<string[]>([]);
    const [defaultSelectedVendorsIds, setDefaultSelectedVendorsIds] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [vendorsType, setVendorsType] = useState<string[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [selectedMealsIds, setSelectedMealsIds] = useState<string[]>([]);
    const [selectedVendorsIds, setSelectedVendorsIds] = useState<string[]>([]);
    const [price, setPrice] = useState(30);
    const [distance, setDistance] = useState("2km");
    const [rating, setRating] = useState("all");
    const [sort, setSort] = useState("");

    useEffect(() => {
        if (categoryMealTypeId && categories?.length > 0) {
            const matchedMeal = categories.find(
                (meal: any) => String(meal?.id) === String(categoryMealTypeId)
            );

            if (matchedMeal) {
                setSelectedMeals((prev) =>
                    prev.includes(matchedMeal.mealTypeName)
                        ? prev
                        : [...prev, matchedMeal.mealTypeName]
                );
                setSelectedMealsIds((prev) =>
                    prev.includes(String(matchedMeal.id))
                        ? prev
                        : [...prev, String(matchedMeal.id)]
                );
            }
        }
    }, [categoryMealTypeId, categories, showModal]);


    useEffect(() => {
        if (meal_type_Selector) {
            let mealType_ids = meal_type_Selector.map((item: any) => item?.id);
            setDefaultSelectedMealsIds(mealType_ids);
            setCategories(meal_type_Selector);
        }
        if (vendor_type_Selector) {
            let vendorType_ids = vendor_type_Selector.map((item: any) => item?.id);
            setDefaultSelectedVendorsIds(vendorType_ids);
            setVendorsType(vendor_type_Selector);
        }
    }, [meal_type_Selector, vendor_type_Selector]);


    const toggleSelection = (item: string, id: string, list: string[], setList: Function, idList: string[], setIdList: Function) => {
        if (list.includes(item)) {
            setList(list.filter((i) => i !== item));
        } else {
            setList([...list, item]);
        }

        // Handle IDs
        if (idList.includes(id)) {
            setIdList(idList.filter((i) => i !== id));
        } else {
            setIdList([...idList, id]);
        }
    };

    const clearFilters = () => {
        setSelectedVendors([]);
        setSelectedMeals([]);
        setSelectedVendorsIds([]);
        setSelectedMealsIds([]);
        setPrice(30);
        setDistance("2km");
        setRating("all");
        setSort("");
        dispatch(setFilterData(null));
        dispatch(setRadiusData(2));
    };

    const handleApplyFilters = () => {
        const filterData = {
            selectedVendors,
            selectedVendorsIds,
            selectedMeals,
            selectedMealsIds,
            price,
            distance,
            rating,
            sort,
        };

        dispatch(setFilterData(filterData));
        if (typeof closeModal === "function") {
            closeModal();
        }
    };



    return (
        <Modal
            visible={showModal}
            animationType="slide"
            transparent
            onRequestClose={closeModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View>
                        <Pressable style={styles.header} onPress={closeModal}>
                            <Image source={Icons.DummyImageIcon} style={{ height: 15, width: 15 }} resizeMode="contain" />
                            <Text style={styles.headerTitle}>Filters</Text>
                        </Pressable>
                    </View>

                    {/* Scrollable Filter Content */}
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Vendor Type */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Vendor Type:</Text>
                                <View style={styles.line} />
                            </View>
                            {Array.from({ length: Math.ceil(vendorsType.length / 2) }).map((_, rowIndex) => (
                                <View key={rowIndex} style={styles.row}>
                                    {vendorsType
                                        .slice(rowIndex * 2, rowIndex * 2 + 2)
                                        .map((vendor: any, index) => (
                                            <Pressable
                                                key={vendor?.vendorTypeName ?? index}
                                                style={[styles.optionRow, { flex: 1 }]}
                                                onPress={() => {
                                                    toggleSelection(vendor?.vendorTypeName, vendor?.id, selectedVendors, setSelectedVendors, selectedVendorsIds, setSelectedVendorsIds)
                                                }}
                                            >
                                                <View style={styles.checkbox}>
                                                    {selectedVendors.includes(vendor?.vendorTypeName) && (
                                                        <Image
                                                            source={Icons.CheckIcon}
                                                            resizeMode="contain"
                                                            style={{ height: 15, width: 15 }}
                                                        />
                                                    )}
                                                </View>
                                                <Text style={styles.optionText}>{vendor?.vendorTypeName}</Text>
                                            </Pressable>
                                        ))}
                                </View>
                            ))}
                        </View>

                        {/* Meal Type */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Meal Type:</Text>
                                <View style={styles.line} />
                            </View>

                            {/* Two per row layout */}
                            {Array.from({ length: Math.ceil(categories.length / 2) }).map((_, rowIndex) => (
                                <View key={rowIndex} style={styles.row}>
                                    {categories
                                        .slice(rowIndex * 2, rowIndex * 2 + 2)
                                        .map((meal: any, index) => (
                                            <Pressable
                                                key={meal?.mealTypeName ?? index}
                                                style={[styles.optionRow, { flex: 1 }]}
                                                onPress={() => {
                                                    toggleSelection(meal?.mealTypeName, meal?.id, selectedMeals, setSelectedMeals, selectedMealsIds, setSelectedMealsIds)
                                                }}
                                            >
                                                <View style={styles.checkbox}>
                                                    {selectedMeals.includes(meal?.mealTypeName) && (
                                                        <Image
                                                            source={Icons.CheckIcon}
                                                            resizeMode="contain"
                                                            style={{ height: 15, width: 15 }}
                                                        />
                                                    )}
                                                </View>
                                                <Text style={styles.optionText}>{meal?.mealTypeName}</Text>
                                            </Pressable>
                                        ))}
                                </View>
                            ))}
                        </View>

                        {/* Price Range */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Price Range:</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.sliderContainer}>
                                <Text style={styles.sliderLabel}>[</Text>
                                <Text style={styles.sliderLabel}>]</Text>
                            </View>
                            <Text style={styles.priceText}>AED 0 - {price}</Text>
                        </View>

                        {/* Distance */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Distance:</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.distanceGrid}>
                                {["2", "5", "10", "15", "20"].map((d, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => {
                                            setDistance(d);
                                            dispatch(setRadiusData(d));
                                        }}
                                        style={styles.distanceOption}
                                    >
                                        <View
                                            style={[
                                                styles.radioOuter,
                                                distance === d && styles.radioOuterSelected,
                                            ]}
                                        >
                                            {distance === d && <View style={styles.radioInner} />}
                                        </View>
                                        <Text
                                            style={[
                                                styles.optionText,
                                                distance === d && { color: "#4A3AFF", fontWeight: "600" },
                                            ]}
                                        >
                                            Within {d} km
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Rating */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Rating:</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.ratingContainer}>
                                {["4+", "All"].map((r) => (
                                    <Pressable key={r} onPress={() => setRating(r)} style={styles.optionRow}>
                                        <View
                                            style={[
                                                styles.radioOuter,
                                                rating === r && styles.radioOuterSelected,
                                            ]}
                                        >
                                            {rating === r && <View style={styles.radioInner} />}
                                        </View>
                                        <Text
                                            style={[
                                                styles.optionText,
                                                rating === r && { color: "#4A3AFF", fontWeight: "600" },
                                            ]}
                                        >
                                            {r === "4+" ? "4+ Stars" : "All Ratings"}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Sort By */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Sort By:</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.distanceGrid}>
                                {[
                                    { id: "distance", label: "Distance (Near to Far)" },
                                    { id: "discount", label: "Discount % (High to Low)" },
                                    { id: "price", label: "Price (Low to High)" },
                                    { id: "rating", label: "Rating (High to Low)" },
                                ].map((s) => (
                                    <Pressable key={s.id} onPress={() => setSort(s.id)} style={styles.distanceOption}>
                                        <View
                                            style={[
                                                styles.radioOuter,
                                                sort === s.id && styles.radioOuterSelected,
                                            ]}
                                        >
                                            {sort === s.id && <View style={styles.radioInner} />}
                                        </View>
                                        <Text
                                            style={[
                                                styles.optionText,
                                                sort === s.id && { color: "#4A3AFF", fontWeight: "600" },
                                            ]}
                                        >
                                            {s.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Bottom Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                            <Text style={styles.clearText}>CLEAR FILTERS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {
                                handleApplyFilters();
                            }}
                        >
                            <Text style={styles.applyText}>APPLY FILTERS</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default CommonModal

const CARD_WIDTH = (width - 60) / 2;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", paddingTop: 14 },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 0,
        paddingHorizontal: 16,
        marginTop: 10
    },
    menuButton: { marginRight: 12 },
    menuIcon: { width: 22, height: 22 },
    headerTitle: { fontSize: 17, fontWeight: "600", color: "#333" },
    locationText: {
        fontSize: 14,
        color: "#4A3AFF",
        textDecorationLine: "underline",
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
        paddingHorizontal: 16,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        height: 42,
        paddingHorizontal: 14,
    },
    filterButton: { marginLeft: 8 },
    filterText: { color: "#333", fontWeight: "500" },
    savingsCard: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingVertical: 18,
        alignItems: "center",
        marginHorizontal: 16,
    },
    savingsText: { fontSize: 15, fontWeight: "600", color: "#333" },
    subText: { fontSize: 14, color: "#555", marginTop: 5 },
    browseTitle: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 14,
    },
    categoryPage: {
        width,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    categoryCard: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        width: width * 0.26,
    },
    categoryImage: { width: 40, height: 40, resizeMode: "contain", marginBottom: 6 },
    categoryName: { fontSize: 13, fontWeight: "500", color: "#333" },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4A3AFF", marginHorizontal: 3 },

    // ALL OFFERS
    allOffersSection: { marginTop: 30, paddingHorizontal: 16 },
    allOffersHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    allOffersTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
    filterSortText: { fontSize: 14, color: "#4A3AFF", fontWeight: "500" },
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
    offerLeft: { flexDirection: "row", alignItems: "center" },
    offerImage: { width: 45, height: 45, resizeMode: "contain", marginRight: 10 },
    offerRestaurant: { fontSize: 14, fontWeight: "600", color: "#333" },
    offerItem: { fontSize: 13, color: "#555" },
    offerRating: { fontSize: 13, color: "#333", fontWeight: "500" },
    offerPrice: { fontSize: 14, color: "#111", fontWeight: "600", marginTop: 4 },
    oldPrice: { textDecorationLine: "line-through", color: "#888" },
    offerBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    offerDetail: { fontSize: 13, color: "#555" },
    offerStock: { fontSize: 13, color: "#4A3AFF", fontWeight: "600", marginTop: 6 },
    allOffersLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    lineRight: {
        flex: 1,
        height: 1,
        backgroundColor: "#ccc",
        marginLeft: 10,
        marginTop: 2,
    },

    // HOT DEALS
    hotDealsSection: { marginTop: 10 },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        marginTop: 10,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#ccc",
        marginHorizontal: 10,
    },

    hotDealsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
    },

    dealPage: {
        width,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    dealCard: {
        width: CARD_WIDTH,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        padding: 10,
        backgroundColor: "#fff",
    },
    dealHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dealRestaurant: { fontSize: 14, fontWeight: "600", color: "#333" },
    discountBadge: {
        backgroundColor: "#4A3AFF",
        borderRadius: 20,
        height: 38,
        width: 38,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: 30,
        right: 5,
        zIndex: 99
    },
    discountText: { color: "#fff", fontSize: 12 },
    dealImage: {
        width: "100%",
        height: 70,
        borderRadius: 8,
        marginTop: 6,
        resizeMode: "contain",
    },
    dealItem: { fontSize: 13, fontWeight: "500", color: "#333", marginTop: 6 },
    dealPrice: { fontSize: 14, color: "#111", fontWeight: "600", marginTop: 4 },
    dealRating: { fontSize: 12, color: "#555", marginTop: 2 },
    dealInfoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
    dealInfo: { fontSize: 12, color: "#444" },
    dealStock: { fontSize: 12, color: "#4A3AFF", fontWeight: "600", marginTop: 6 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#fff",
        maxHeight: "100%",
        paddingTop: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    backArrow: { fontSize: 24, color: "#333", marginRight: 10 },
    scroll: { paddingHorizontal: 16 },
    section: { marginTop: 20 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    sectionTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
    optionRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        borderColor: "#999",
        borderRadius: 3,
        marginRight: 8,
    },
    checkboxSelected: { backgroundColor: "#4A3AFF", borderColor: "#4A3AFF" },
    ratingContainer: { display: "flex", flexDirection: "row", justifyContent: "space-between" },
    optionText: { fontSize: 14, color: "#333" },
    sliderContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 10 },
    sliderLabel: { fontSize: 20, color: "#888", paddingHorizontal: 6 },
    priceText: { textAlign: "center", fontSize: 14, marginTop: 5, color: "#333" },

    distanceGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 10,
        marginTop: 4,
    },

    distanceOption: {
        flexDirection: "row",
        alignItems: "center",
        width: "48%",
    },

    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: "#999",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    radioOuterSelected: { borderColor: "#4A3AFF" },
    radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#4A3AFF" },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    clearButton: {
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 30,
        paddingVertical: 10,
        width: "47%",
        alignItems: "center",
    },
    applyButton: {
        backgroundColor: "#4A3AFF",
        borderRadius: 30,
        paddingVertical: 10,
        width: "47%",
        alignItems: "center",
    },
    clearText: { color: "#333", fontWeight: "500" },
    applyText: { color: "#fff", fontWeight: "600" },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
});