import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageBackground,
  Platform,
} from "react-native";
import { useNavigation, DrawerActions, useIsFocused } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import type { DrawerParamList } from "../../navigation/DrawerNavigation";
import { Icons, Images } from "../../theme/AssetsUrl";
import { useDispatch, useSelector } from "react-redux";
import { setAddressData, setRadiusData } from "../../store/Slices/locationRadiusSlice";
import { RootState } from "../../store/rootReducer";
import { getData } from "../../utils/storage";
import AllOffersComponent from "../../component/AllOffersComponent";
import { getAllActiveSurpriseBoxesByCustomerId, getAllHotDealSurpriseBoxes } from "../../../helpers/Services/surprise_box";
import { IMG_URL } from "../../../config";
import CommonHeader from "../../component/CommonHeader";
import language_data_json from "../../JSON/language.json";
import LinearGradient from "react-native-linear-gradient";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { DefaultStyle } from "../../theme/styles/DefaultStyle";
import { FONTS } from "../../theme/FontsLink";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StarRatingComponent from "../../component/StarRatingComponent";
import CustomToast from "../../component/CustomToast";
import Skeleton from "../../component/Skeleton/Skeleton";
import { getCartByUserId } from "../../../helpers/Services/cart";
import { userLocation } from "../../../helpers/Services/userAuth";
import { addApiCartReducer, completeDataCartReducer } from "../../store/Slices/addToCartSlice";
import { setMealDataList } from "../../store/Slices/mealQuantitySlice";

const { width } = Dimensions.get("window");

interface UserDetails {
  userID: string;
  fullName: string;
  userEmail?: string;
  userRole?: string;
  userPhone?: string;
}

type AppItems = {
  SearchPlaceHolder: string;
  Filter: string;
  BrowseByCategory: string;
  HotDealsNearYou: string;
  AllOffers: string;
  Offers: string;
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
  NoRestaurantFoundWithIn: string,
  Increaseradius: string,
  KM: string,
  ChangeRadius: string
};

type LanguageMap = {
  en: { app_items: AppItems; other_items: OtherItems, filter_items: FilterItems };
  ar: { app_items: AppItems; other_items: OtherItems, filter_items: FilterItems };
};

type SupportedLang = keyof LanguageMap; // "en" | "ar"

const language_data = language_data_json as LanguageMap;

type HomeScreenNavigationProp = DrawerNavigationProp<DrawerParamList, "HomeScreen">;

const ITEMS_PER_PAGE = 4;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const addressSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.address);
  const radiusSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.radius);
  const vendor_type_Selector = useSelector((state: RootState) => state?.ventorAndMealSlice?.vendor_types);
  const meal_type_Selector = useSelector((state: RootState) => state?.ventorAndMealSlice?.meals_types);
  const languageSelector = useSelector((state: RootState) => state?.languageSlice?.selected_language);
  const logoutSelector = useSelector((state: RootState) => state?.logoutSlice?.logoutMessage);
  // const addToCartSelector = useSelector((state: RootState) => state.addToCartSlice?.add_to_cart as any);
  const addToCartSelector = useSelector((state: RootState) => state?.mealQuantitySlice?.mealData);

  const [activePage, setActivePage] = useState(0);
  const [activeDealPage, setActiveDealPage] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");

  const [price, setPrice] = useState(30);
  const [distance, setDistance] = useState("2km");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedVendorsIds, setSelectedVendorsIds] = useState<string[]>([]);
  const [defaultSelectedVendorsIds, setDefaultSelectedVendorsIds] = useState<string[]>([]);
  const [selectedMealsIds, setSelectedMealsIds] = useState<string[]>([]);
  const [defaultSelectedMealsIds, setDefaultSelectedMealsIds] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string | null>("");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [vendorsType, setVendorsType] = useState<string[]>([]);
  const [hotDeals, setHotDeals] = useState<string[]>([]);
  const [offers, setOffers] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [hotDealLoader, setHotDealLoader] = useState(true);
  const [offersLoader, setOffersLoader] = useState(true);
  const [onScrollLoader, setOnScrollLoader] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // const [addToCart, setAddToCart] = useState<string[]>([]);
  const [noDataMessage1, setNodataMessage1] = useState<String>("");
  const [noDataMessage2, setNodataMessage2] = useState<String>("");
  const [noDataMessage3, setNodataMessage3] = useState<String>("");

  const flatListRef = useRef<FlatList>(null);
  const hotDealRef = useRef<FlatList>(null);
  const pageNumber = useRef(1);
  const scrollRef = useRef(null);
  const cartIdRef = useRef(null);

  const totalCategoryPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const totalDealPages = Math.ceil(hotDeals.length / 2);
  const HomeLabels = language_data[selectedLanguage].app_items;
  const OtherLabels = language_data[selectedLanguage].other_items;
  const FilterLabels = language_data[selectedLanguage].filter_items;

  useEffect(() => {

  }, [addToCartSelector])

  useEffect(() => {
    const updateValues = async () => {
      if (languageSelector === "en" || languageSelector === "ar") {
        setSelectedLanguage(languageSelector);
      }
      if (addressSelector) {
        setCurrentLocation(addressSelector);
      } else {
        const data = await AsyncStorage.getItem("locationData");
        if (data) {
          setCurrentLocation(data);
        }
      }
    };

    updateValues();
  }, [languageSelector, addressSelector]);

  useEffect(() => {
    if (isFocused) {
      handleCartLengthFromAPI()
    }
  }, [isFocused])

  useEffect(() => {
    if (logoutSelector) {
      setShowToast(true);
      setToastMessage(logoutSelector);
    }
  }, [logoutSelector])

  const handleCartLengthFromAPI = async () => {
    const userData = await getData("userData");
    const cartData = await AsyncStorage.getItem("CartDataArray");
    const parseData = cartData ? JSON.parse(cartData) : [];
    dispatch(addApiCartReducer(parseData));
    dispatch(setMealDataList(parseData));
    let payload = {
      "userID": userData?.userID
    }
    if (!cartIdRef.current) {
      await getCartByUserId(payload).then((response) => {
        if (response?.succeeded) {
          cartIdRef.current = response?.data?.cartID;
          // dispatch(addApiCartReducer(response?.data?.items));
        }
      })
    }
  }


  // useEffect(() => {
  //   if (isFocused) {
  //     setHotDealLoader(true);
  //     fetchUserData();
  //     getAllHotDealSurpriseBoxesFunction();
  //   }
  // }, [isFocused]);

  useEffect(() => {
    handleUserLocationFunction();
    fetchUserData();
  }, [])

  useEffect(() => {
    setOffersLoader(true);
    getAllActiveSurpriseBoxesByCustomerIdFunction(50);
    getAllActiveSurpriseBoxesByCustomerIdFunctionData(500);
  }, [userDetails])

  useEffect(() => {
    handleApplyFilters();
    setActiveDealPage(0);
  }, [selectedVendorsIds, selectedMealsIds, price, distance, rating, sort]);


  useEffect(() => {
    if (meal_type_Selector) {
      let mealType_ids = meal_type_Selector.map((item: any) => item?.id);
      setDefaultSelectedMealsIds(mealType_ids);
      setCategories(meal_type_Selector);
    }
    if (vendor_type_Selector) {
      let vendorType_ids = vendor_type_Selector.map((item: any) => item?.id);
      setDefaultSelectedVendorsIds(vendorType_ids);
      const updateVendorData = vendor_type_Selector.map((item: any) => ({
        ...item,
        isSelected: false,
      }));
      setVendorsType(updateVendorData);
    }
  }, [meal_type_Selector, vendor_type_Selector]);

  const fetchUserData = async () => {
    const userData = await getData("userData");
    setUserDetails(userData);
  };

  const toggleSelectionCategory = (item: string, id: string, list: string[], setList: Function, idList: string[], setIdList: Function) => {
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

  // const toggleSelection = (item: string, id: string, list: string[], setList: Function, idList: string[], setIdList: Function) => {
  //   if (list.includes(item)) {
  //     setList(list.filter((i) => i !== item));
  //   } else {
  //     setList([...list, item]);
  //   }

  //   // Handle IDs
  //   if (idList.includes(id)) {
  //     setIdList(idList.filter((i) => i !== id));
  //   } else {
  //     setIdList([...idList, id]);
  //   }
  // };

  const toggleSelection = (item: string, id: string, list: string[], setList: (v: string[]) => void, idList: string[],
    setIdList: (v: string[]) => void
  ) => {
    if (list.length === 1 && list[0] === item) {
      setList([]);
      setIdList([]);
    } else {
      setList([item]);
      setIdList([id]);
    }
  };


  async function getAllHotDealSurpriseBoxesFunction() {
    const userData = await getData("userData");
    let payload = {
      "userID": userData?.userID,
      "pageNumber": 1,
      "pageSize": 10
    }

    await getAllHotDealSurpriseBoxes(payload).then((response) => {
      if (response?.succeeded) {
        setHotDealLoader(false);
        setHotDeals(response?.data);
      }
    })
  }

  const clearFilters = () => {
    setSelectedVendors([]);
    setSelectedMeals([]);
    setSelectedVendorsIds([]);
    setSelectedMealsIds([]);
    setPrice(30);
    setDistance("2km");
    dispatch(setRadiusData(2));
    setRating("all");
    setSort("");
  };

  const handleApplyFilters = async () => {
    setOffersLoader(true);
    await getAllActiveSurpriseBoxesByCustomerIdFunction(price);
  };

  const handleUserLocationFunction = async () => {
    const userData = await getData("userData");
    const getCords = await AsyncStorage.getItem("locationCords");
    const nearByAddress = await AsyncStorage.getItem("locationData");
    const parsedCords = getCords ? JSON.parse(getCords) : null;
    const Radius = await AsyncStorage.getItem("Radius");
    const parsedRadius = Radius ? JSON.parse(Radius) : radiusSelector;
    const payload = {
      userId: userData?.userID ?? "",
      latitude: parsedCords?.latitude ?? 0,
      longitude: parsedCords?.longitude ?? 0,
      nearByAddress: nearByAddress ?? "",
      distanceInMiles: parsedRadius,
    };
    await userLocation(payload).then(async (response) => {
      if (response?.succeeded) {

      }
    })
  };

  async function getAllActiveSurpriseBoxesByCustomerIdFunctionData(price: any) {
    // console.log("userDetails" ,JSON.stringify(userDetails));    
    let payload = {
      "userID": userDetails?.userID,
      "pageNumber": pageNumber.current,
      "pageSize": 50,
      "vendorTypeIDs": defaultSelectedVendorsIds,
      "mealTypeIDs": defaultSelectedMealsIds,
      "maxDistanceKm": 200,
      "minPrice": 0,
      "maxPrice": price * 10
    }
    await getAllActiveSurpriseBoxesByCustomerId(payload).then((response) => {
      if (response?.succeeded) {
        dispatch(completeDataCartReducer(response?.data))
      }
    })
  }

  async function getAllActiveSurpriseBoxesByCustomerIdFunction(price: any) {
    let payload = {
      "userID": userDetails?.userID,
      "pageNumber": pageNumber.current,
      "pageSize": 10,
      "vendorTypeIDs": selectedVendorsIds?.length > 0 ? selectedVendorsIds : defaultSelectedVendorsIds,
      "mealTypeIDs": selectedMealsIds?.length > 0 ? selectedMealsIds : defaultSelectedMealsIds,
      "maxDistanceKm": Number(radiusSelector),
      "minPrice": 0,
      "maxPrice": price * 10
    }
    await getAllActiveSurpriseBoxesByCustomerId(payload).then((response) => {
      if (response?.succeeded) {
        setOffersLoader(false);
        setOnScrollLoader(false);
        setTotalPages(response?.totalPages);
        setOffers(response?.data);
        if (response?.data?.length == 0) {
          setNodataMessage1(OtherLabels?.NoRestaurantFoundWithIn);
          setNodataMessage2(OtherLabels?.Increaseradius);
          setNodataMessage3(OtherLabels?.ChangeRadius);
        }
      } else {
        setOffersLoader(false);
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
        getAllActiveSurpriseBoxesByCustomerIdFunction(price)
      }
    }
  };

  const handleCategoryScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentPage = Math.round(offsetX / width);
    setActivePage(currentPage);
  };

  const handleDealScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentPage = Math.round(offsetX / width);
    setActiveDealPage(currentPage);
  };

  const groupedCategories = [];
  for (let i = 0; i < categories.length; i += ITEMS_PER_PAGE) {
    groupedCategories.push(categories.slice(i, i + ITEMS_PER_PAGE));
  }

  const groupedDeals = [];
  // for (let i = 0; i < hotDeals.length; i += 2) {
  //   groupedDeals.push(hotDeals.slice(i, i + 2));
  // }
  for (let i = 0; i < offers.length; i += 2) {
    groupedDeals.push(offers.slice(i, i + 2));
  }

  const handleImageData = (image_url: any, deal: any) => {
    if (!image_url) {
      switch (deal) {
        case "Non Veg": return Icons.NonVegBoxIcon
        case "Veg": return Icons.VegBoxIcon
        case "Vegan": return Icons.VeganBoxIcon
        case "Sea Food": return Icons.SeaFoodBoxIcon
        default:
          break;
      }
    } else {
      const normalizedPath = image_url.replace(/\\/g, "/");
      return { uri: IMG_URL + normalizedPath };
    }
  };

  const handleNavigation = (deal: any) => {
    navigation.navigate("CheckoutScreen", {
      surpriseBoxID: deal?.surpriseBoxID,
      serviceProviderID: deal?.serviceProviderID
    })
  }

  const handleImageType = (mealType: any) => {
    switch (mealType) {
      case "Non Veg": return Icons.NonVegIcon
      case "Vegan": return Icons.VeganIcon
      case "Sea Food": return Icons.SeaFoodIcon
      case "Veg": return Icons.VegIcon
      default: return Icons.VegIcon;
    }
  }

  const handleImageBackgroundType = (mealType: any) => {
    switch (mealType) {
      case "Non Veg":
        return selectedMeals.includes(mealType) ? "#FFFFFF" : "#D34D40";

      case "Vegan":
        return selectedMeals.includes(mealType) ? "#FFFFFF" : "#2F7C32";

      case "Sea Food":
        return selectedMeals.includes(mealType) ? "#FFFFFF" : "#00BFD8";

      case "Veg":
        return selectedMeals.includes(mealType) ? "#FFFFFF" : "#59B14D";

      default:
        return "#59B14D";
    }
  }

  const handleBackGroundColor = (mealType: any) => {
    const name = mealType?.mealTypeName || mealType;

    switch (name) {
      case "Non Veg":
        return selectedMeals.includes(name) ? "#D34D40" : "transparent";

      case "Vegan":
        return selectedMeals.includes(name) ? "#2F7C32" : "transparent";

      case "Sea Food":
        return selectedMeals.includes(name) ? "#00BFD8" : "transparent";

      case "Veg":
        return selectedMeals.includes(name) ? "#59B14D" : "transparent";

      default:
        return "transparent";
    }
  };

  const handleTintColor = (mealType: any) => {
    const name = mealType?.mealTypeName || mealType;

    switch (name) {
      case "Non Veg":
        return selectedMeals.includes(name) ? "#D34D40" : "#FFFFFF";

      case "Vegan":
        return selectedMeals.includes(name) ? "#2F7C32" : "#FFFFFF";

      case "Sea Food":
        return selectedMeals.includes(name) ? "#00BFD8" : "#FFFFFF";

      case "Veg":
        return selectedMeals.includes(name) ? "#59B14D" : "#FFFFFF";

      default:
        return "transparent";
    }
  };

  const handleMealCategory = (mealType: any) => {
    const name = mealType?.mealTypeName || mealType;

    switch (name) {
      case "Non Veg":
        return selectedMeals.includes(name) ? "#ffffff" : "#666666";

      case "Vegan":
        return selectedMeals.includes(name) ? "#ffffff" : "#666666";

      case "Sea Food":
        return selectedMeals.includes(name) ? "#ffffff" : "#666666";

      case "Veg":
        return selectedMeals.includes(name) ? "#ffffff" : "#666666";

      default:
        return "#59B14D";
    }
  };

  const renderCategoryPage = ({ item }: any) => {
    return (
      <View style={styles.categoryPage}>
        {item.map((cat: any) => (
          <Pressable key={cat.id} style={[styles.categoryCard, { backgroundColor: handleBackGroundColor(cat) }]}
            onPress={() => toggleSelectionCategory(cat?.mealTypeName, cat?.id, selectedMeals, setSelectedMeals, selectedMealsIds, setSelectedMealsIds)}
          >
            <View style={{ backgroundColor: handleImageBackgroundType(cat.mealTypeName), borderTopLeftRadius: 0, borderTopRightRadius: 40, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, height: heightPixel(80), width: widthPixel(75), alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
              <Image source={handleImageType(cat.mealTypeName)} style={styles.categoryImage} resizeMode="contain" tintColor={handleTintColor(cat.mealTypeName)} />
            </View>
            <Text style={[styles.categoryName, { color: handleMealCategory(cat) }]}>{cat.mealTypeName}</Text>
          </Pressable>
        ))}
      </View>
    )
  };

  // Render Hot Deals
  const renderDealPage = ({ item, ind }: any) => {
    return (
      <View style={styles.dealPage}>
        {item.map((deal: any, index: any) => (
          <Pressable key={index} style={styles.dealCard} onPress={() => handleNavigation(deal)}>
            <View style={styles.dealHeader}>
              <View style={{ height: "auto" }}>
                <Text style={styles.dealRestaurant} numberOfLines={2}>{deal.serviceProviderName}</Text>
              </View>
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <StarRatingComponent
                  rating={parseFloat(deal.spRating) ?? 0}
                  onChange={(newRating) => console.log(newRating)}
                  color="#FFB800"
                  size={12}
                  readOnly={true}
                  showText={false}
                />
                <Text style={styles.dealRating}> {deal.spReviewCount ? deal.spReviewCount > 1 ? deal.spReviewCount + " Reviews" : deal.spReviewCount + " Review" : ""}</Text>
              </View>
            </View>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Image
                source={handleImageData(deal?.sbImageURL, deal?.surpriseBoxMealType[0]?.mealType)}
                style={styles.dealImage}
                resizeMode={"contain"}
              />
              <ImageBackground source={Icons.DiscountIcon} style={{ height: heightPixel(50), width: widthPixel(50), justifyContent: "center", alignItems: "center", position: "absolute", right: -5, top: 0, paddingTop: 5 }} resizeMode="contain">
                <Text style={[styles.discountText, { textAlign: "center" }]}>{`${deal.discountedPercent}`}<Text style={{ fontSize: fontPixel(10) }}>%</Text></Text>
                <Text style={[styles.discountText, { textAlign: "center" }]}>OFF</Text>
              </ImageBackground>
            </View>
            <View style={{ alignItems: "center" }}>
              <View style={{ height: "auto" }}>
                <Text style={styles.dealItem}>{deal.surpriseBoxName}</Text>
              </View>
              <Text style={styles.dealPrice}>
                <Text style={styles.oldPrice}>AED {deal.actualPrice}</Text> AED {deal.discountedPrice}
              </Text>
            </View>
            <View style={styles.dealInfoRow}>
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <View>
                  <Image source={Icons.DistanceIcon} style={{ height: heightPixel(18), width: widthPixel(18) }} resizeMode="contain" />
                </View>
                <Text style={styles.dealInfo}> {deal.distanceInKm} KM</Text>
              </View>
            </View>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
              <View>
                <Image source={Icons.TimingIcon} style={{ height: heightPixel(15), width: widthPixel(15) }} resizeMode="contain" />
              </View>
              <Text style={styles.dealInfo}> {`${deal.collectionToTime}`} {`${(deal?.timeFromAMPM != deal?.timeToAMPM) && deal?.timeFromAMPM}`} -</Text>
              <Text style={styles.dealInfo}> {`${deal.collectionToTime}`} {deal.timeToAMPM}</Text>
            </View>
            {/* <Text style={styles.dealStock}>{deal.noOfBoxes} Available</Text> */}
          </Pressable>
        ))}
      </View>
    )
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };


  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#264941', '#264941']} style={{ flex: 1 }}>
        {showToast && <CustomToast message={toastMessage} isSuccess={true} />}
        <ImageBackground source={Images.LogoBg} style={{ height: heightPixel(350), flex: 1 }} resizeMode="contain" tintColor={"#23302A"}>
          <View style={{ paddingLeft: 10, paddingRight: 10 }}>
            <View>
              <CommonHeader
                onPress={handleOpenDrawer}
                onPressNavigation={() => navigation.navigate("LocationScreen")}
                currentLocation={currentLocation}
                // addToCart={addToCart}
                navigateToCartList={() => navigation.navigate("OrderPlaceScreen", {
                  cartId: cartIdRef.current,
                  payloadData: null
                })}
              />
            </View>
            <View style={styles.searchContainer}>
              <View>
                <Image source={Icons.SearchIcon} style={{ height: heightPixel(18), width: widthPixel(18) }} resizeMode="contain" />
              </View>
              <TextInput
                placeholder={HomeLabels?.SearchPlaceHolder}
                placeholderTextColor="#888"
                autoCapitalize="none"
                style={styles.searchInput}
                value={searchText}
                onChangeText={(text: string) => setSearchText(text)}
              />
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingLeft: 8, paddingRight: 8, overflow: "hidden" }}>
            <View style={{ height: 185, width: 185, position: "absolute", bottom: -40, right: -40 }}>
              <Image source={Images.BottomCircle} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#F4F4F4"} />
            </View>
            {/* SAVINGS */}
            <View style={[styles.savingsCard, { paddingVertical: 10, overflow: "hidden" }]}>
              <ImageBackground source={Icons.BannerIcon} style={styles.savingsCardImg} resizeMode="cover">
                <Text style={styles.savingsText}>You’ve Saved so far!</Text>
                <Text style={[styles.savingsText, { fontSize: fontPixel(28), fontFamily: FONTS.tenonBoldFont }]}>AED 350</Text>
                <Text style={styles.subText}>15 Orders</Text>
              </ImageBackground>
            </View>
            <View style={{ flex: 1 }}>
              <ScrollView
                ref={scrollRef}
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 25 }}
                showsVerticalScrollIndicator={false}
                onScroll={({ nativeEvent }) => {
                  if (onScrollLoader == false) {
                    if (isCloseToBottom(nativeEvent)) {
                      handleScrollEndDrag()
                    }
                  }
                }}
              >
                {/* Vendor Type */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  {
                    vendorsType?.map((vendor: any, index) => (
                      <Pressable
                        onPress={() => toggleSelection(vendor?.vendorTypeName, vendor?.id, selectedVendors, setSelectedVendors, selectedVendorsIds, setSelectedVendorsIds)}
                        key={index}
                        style={{ borderWidth: 2, paddingHorizontal: 10, paddingVertical: 7, width: "auto", borderRadius: 40, alignItems: "center", justifyContent: "center", backgroundColor: selectedVendors.includes(vendor?.vendorTypeName) ? "#264941" : "transparent", borderColor: "#264941" }}>
                        <Text style={{ fontFamily: FONTS.tenonMediumFont, fontSize: fontPixel(16), color: selectedVendors.includes(vendor?.vendorTypeName) ? "#ffffff" : "#264941" }}>{vendor?.vendorTypeName}</Text>
                      </Pressable>
                    ))}
                </View>


                {/* CATEGORY SECTION */}
                {
                  selectedVendors.includes("Restaurant") &&
                  <View>
                    <View>
                      <Text style={styles.hotDealsTitle}>{HomeLabels.BrowseByCategory}</Text>
                    </View>
                    <View style={{ marginTop: 10 }}>
                      <FlatList
                        ref={flatListRef}
                        data={groupedCategories}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={renderCategoryPage}
                        onScroll={handleCategoryScroll}
                        scrollEventThrottle={16}
                      />
                    </View>
                  </View>
                }
                {/* HOT DEALS SECTION */}
                {
                  offersLoader ?
                    <Skeleton />
                    :
                    offers?.length > 0 ?
                      <View>
                        <View style={styles.hotDealsSection}>
                          <View style={styles.sectionTitleContainer}>
                            <Text style={styles.hotDealsTitle}>{HomeLabels?.HotDealsNearYou}</Text>
                            <View style={styles.dotsContainer}>
                              {groupedDeals.map((_, index) => (
                                <View
                                  key={index}
                                  style={[
                                    styles.dot,
                                    { opacity: activeDealPage === index ? 1 : 0.2 },
                                  ]}
                                />
                              ))}
                            </View>
                          </View>
                          <FlatList
                            ref={hotDealRef}
                            data={groupedDeals}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderDealPage}
                            onScroll={handleDealScroll}
                            scrollEventThrottle={16}
                          />
                        </View>
                        <View style={styles.allOffersSection}>
                          <View style={styles.allOffersHeader}>
                            <View style={styles.allOffersLeft}>
                              <Text style={styles.allOffersTitle}>{(selectedVendorsIds?.length > 0 || selectedMealsIds?.length > 0) ? HomeLabels?.Offers : HomeLabels?.AllOffers}</Text>
                              {(selectedVendorsIds?.length > 0 || selectedMealsIds?.length > 0) && <Text style={styles.allOffersTitle1}> {offers?.length > 1 ? `(${offers?.length}) Offers` : `(${offers?.length}) Offer`}</Text>}
                            </View>
                          </View>

                          <View style={{ paddingBottom: "18%" }}>
                            {offers.map((item: any, index: number) => (
                              <AllOffersComponent
                                key={item?.surpriseBoxID ?? index.toString()}
                                offer={item}
                                onPress={() => handleNavigation(item)}
                              />
                            ))}
                          </View>
                        </View>
                      </View> :
                      <View style={{ justifyContent: "center", alignItems: "center", marginTop: "12%" }}>
                        <Text style={{ color: "#2E2E2E", fontFamily: FONTS.tenonMediumFont, fontSize: fontPixel(28) }}>{noDataMessage1}</Text>
                        <Text style={{ color: "#7E8389", fontFamily: FONTS.tenonRegularFont, fontSize: fontPixel(18) }}>{noDataMessage2}</Text>
                        <Pressable
                          onPress={() => navigation.navigate("LocationScreen")} style={{ borderRadius: 40, paddingHorizontal: 15, paddingVertical: 10, marginTop: "5%", borderWidth: noDataMessage3 ? 1 : 0, borderColor: "#264941" }}>
                          <Text style={{ color: "#264941", fontFamily: FONTS.tenonMediumFont, fontSize: fontPixel(16) }}>{noDataMessage3}</Text>
                        </Pressable>
                      </View>
                }

                {/* ALL OFFERS SECTION */}
                {/* {
                  offersLoader ?
                    <ActivityIndicator size={"large"} />
                    :
                    <View style={styles.allOffersSection}>
                      <View style={styles.allOffersHeader}>
                        <View style={styles.allOffersLeft}>
                          <Text style={styles.allOffersTitle}>{(selectedVendorsIds?.length > 0 || selectedMealsIds?.length > 0) ? HomeLabels?.Offers : HomeLabels?.AllOffers}</Text>
                          {(selectedVendorsIds?.length > 0 || selectedMealsIds?.length > 0) && <Text style={styles.allOffersTitle1}> {offers?.length > 1 ? `(${offers?.length}) Offers` : `(${offers?.length}) Offer`}</Text>}
                        </View>
                      </View>

                      {
                        offers?.length > 0 ?
                          <View style={{ paddingBottom: "18%" }}>
                            {offers.map((item: any, index: number) => (
                              <AllOffersComponent
                                key={item?.surpriseBoxID ?? index.toString()}
                                offer={item}
                                onPress={() => handleNavigation(item)}
                              />
                            ))}
                          </View>
                          :
                          <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 100 }}>
                            <Text style={{ color: "#666666", fontFamily: FONTS.poppinsRegularFont, fontSize: fontPixel(14) }}>{OtherLabels?.NoRestaurantFoundWithIn} {radiusSelector}{OtherLabels?.KM}</Text>
                            <Pressable
                              onPress={() => navigation.navigate("LocationScreen")} style={{ backgroundColor: "#264941", borderRadius: 40, paddingHorizontal: 15, paddingVertical: 10, marginTop: 5 }}>
                              <Text style={{ color: "#fff", fontFamily: FONTS.muliSemiBoldFont, fontSize: fontPixel(14) }}>{OtherLabels?.ChangeRadius}</Text>
                            </Pressable>
                          </View>
                      }
                    </View>
                } */}
              </ScrollView>
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>
    </View >
  );
};

export default HomeScreen;

const CARD_WIDTH = (width - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "100%",
    alignSelf: "center"
  },
  searchInput: {
    height: 42,
    paddingHorizontal: 14,
    color: "#000",
    fontFamily: FONTS.tenonMediumFont,
    fontSize: fontPixel(16)
  },
  savingsCard: {
    borderWidth: 1,
    borderColor: "transparent",
    borderTopLeftRadius: 59,
    borderTopRightRadius: 59,
  },
  savingsCardImg: {
    paddingVertical: 8,
    alignItems: "center",
  },
  savingsText: { fontSize: fontPixel(18), fontFamily: FONTS.tenonMediumFont, color: "#ffffff" },
  subText: { fontSize: fontPixel(18), color: "#ffffff", fontFamily: FONTS.tenonMediumFont },
  categoryPage: {
    width,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 20,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingVertical: 5,
    alignItems: "center",
    // justifyContent: "center",
    width: widthPixel(86),
    height: heightPixel(135)
  },
  categoryImage: { width: widthPixel(45), height: heightPixel(45), resizeMode: "contain", marginBottom: 6 },
  categoryName: {
    fontSize: fontPixel(13),
    fontFamily: FONTS.tenonRegularFont,
    color: "#666666",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#264941", marginHorizontal: 3 },

  // ALL OFFERS
  allOffersSection: { marginTop: 0 },
  allOffersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  allOffersTitle: { fontSize: fontPixel(18), fontFamily: FONTS.tenonMediumFont, color: "#264941" },
  allOffersTitle1: { fontSize: fontPixel(14), fontFamily: FONTS.tenonMediumFont, color: "#9D9D9D" },
  filterSortText: { fontSize: 14, color: "#4A3AFF", fontWeight: "500" },
  oldPrice: { textDecorationLine: "line-through", color: "#9D9D9D", fontSize: fontPixel(18), fontFamily: FONTS.tenonMediumFont },
  allOffersLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  // HOT DEALS
  hotDealsSection: {
    marginTop: 10,
    marginBottom: 20
  },
  sectionTitleContainer: {
    marginBottom: 12,
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 10,
  },

  hotDealsTitle: {
    fontFamily: FONTS.tenonMediumFont,
    fontSize: fontPixel(18),
    color: "#264941"
  },

  dealPage: {
    width: (width - 16),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dealCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 10
  },
  dealHeader: {
    alignItems: "center",
    marginBottom: 5
  },
  dealRestaurant: { fontSize: fontPixel(16), fontFamily: FONTS.tenonMediumFont, color: "#2E2E2E", textAlign: "center" },
  discountText: { color: "#fff", fontSize: fontPixel(14), fontFamily: FONTS.tenonMediumFont },
  dealImage: {
    width: widthPixel(70),
    height: heightPixel(70),
    borderRadius: 8,
    marginTop: 6,
    resizeMode: "contain",
  },
  dealItem: { fontSize: fontPixel(14), fontFamily: FONTS.poppinsMediumFont, color: "#666666", marginTop: 6, textAlign: "center" },
  dealPrice: { color: "#2E2E2E", fontSize: fontPixel(18), fontFamily: FONTS.tenonMediumFont, marginTop: 4 },
  dealRating: { fontSize: fontPixel(12), color: "#D34D40", fontFamily: FONTS.tenonMediumFont },
  dealInfoRow: { alignItems: "center", marginTop: 6, marginBottom: 6 },
  dealInfo: { fontSize: fontPixel(14), color: "#666666", alignSelf: "center", fontFamily: FONTS.tenonMediumFont },
  dealStock: { fontSize: 12, color: "#4A3AFF", fontWeight: "600", marginTop: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  }
});