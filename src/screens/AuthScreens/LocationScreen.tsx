import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
  AppState,
  BackHandler,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { AuthStackParamList } from "../../types/AuthTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Icons } from "../../theme/AssetsUrl";
import { MapFunction } from "../../utils/Map";
import CustomDropdown from "../../component/CustomDropdown";
import { userLocation } from "../../../helpers/Services/userAuth";
import { getData } from "../../utils/storage";
import GetLocation from 'react-native-get-location'
import { useDispatch, useSelector } from "react-redux";
import { setAddressData, setRadiusData } from "../../store/Slices/locationRadiusSlice";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { DrawerParamList } from "../../navigation/DrawerNavigation";
import language_data_json from "../../JSON/language.json";
import { RootState } from "../../store/rootReducer";
import MapModal from "../../component/CommonComponent/MapModal";
import { FONTS } from "../../theme/FontsLink";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { openSettings } from "react-native-permissions";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LocationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "LocationScreen"
>;

type Restaurant = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number
};

type LocationItems = {
  SetYourLocation: string,
  HelpUSToFindOffer: string,
  SearchArea: string,
  UseCurrentLocation: string,
  ShowResultWithIn: string,
  ConfirmLocation: string,
  SelectRadius: string,
}

type OtherItems = {
  Back: string
}

type LanguageMap = {
  en: { location_items: LocationItems; other_items: OtherItems };
  ar: { location_items: LocationItems; other_items: OtherItems };
};

type SupportedLang = keyof LanguageMap; // "en" | "ar"

const language_data = language_data_json as LanguageMap;

const GOOGLE_MAPS_KEY = "AIzaSyAz-86S4v56VHaobANWNxRxTyZ44aHtLYY";

type Props = DrawerScreenProps<DrawerParamList, "LocationScreen">;

const LocationScreen: React.FC<Props> = ({route}) => {

  const routeId = route?.params?.routeId || 1;

  const languageSelector = useSelector((state: RootState) => state?.languageSlice?.selected_language);
  const radiusSelector = useSelector((state: RootState) => state?.locationRadiusSlice?.radius);

  const navigation = useNavigation<LocationScreenNavigationProp>();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");
  const [searchText, setSearchText] = useState("");
  const [radius, setRadius] = useState(2);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [nearByAddress, setNearByAddress] = useState("");
  const [suggestionAddress, setSuggestionAddress] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [textBoxFocused, setTextBoxFocused] = useState(false);
  const [showRadiusTextBox, setShowRadiusTextBox] = useState(false);
  const [showAlertPopUp, setShowAlertPopUp] = useState(false);
  const [apiResponseLoader, setApiResponseLoader] = useState(false);
  const [autoFilled, setAutoFilled] = useState(true);
  const [milestones, setMilesStones] = useState([
    {
      radius: 2,
      isSelected: true
    },
    {
      radius: 5,
      isSelected: false
    },
    {
      radius: 10,
      isSelected: false
    },
    {
      radius: 20,
      isSelected: false
    }
  ]);

  const webRef = useRef<WebView>(null);
  const mapReady = useRef(false);
  const locationInputRef = useRef<TextInput>(null);

  const DEFAULT_LOCATION = { latitude: 20.5937, longitude: 78.9629 };

  const OtherLabels = language_data[selectedLanguage].other_items;
  const LocationLabels = language_data[selectedLanguage].location_items;

  useEffect(() => {
    if (languageSelector === "en" || languageSelector === "ar") {
      setSelectedLanguage(languageSelector);
    }
  }, [languageSelector]);

  useEffect(() => {
    AsyncStorage.getItem("Radius").then((response: any) => {
      if (response) {
        setRadius(JSON.parse(response));
        const updated = milestones?.map(item => ({
          ...item,
          isSelected: item.radius === JSON.parse(response),
        }));

        setMilesStones(updated);
      } else {
        setRadius(radiusSelector);
        const updated = milestones?.map(item => ({
          ...item,
          isSelected: item.radius === radiusSelector,
        }));

        setMilesStones(updated);
      }
    })
  }, [])

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    let appStateListener: any = null;

    if (isFocused) {
      requestPermission()
      appStateListener = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          // requestPermission();
        }
      });
    }

    return () => {
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, [isFocused]);

  const isRequesting = useRef(false);

  const requestPermission = async () => {
    if (isRequesting.current) return;
    isRequesting.current = true;

    try {
      if (Platform.OS === "android") {

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {

          try {
            await getAccurateLocation();
            setShowAlertPopUp(false);
          } catch (locErr) {
            console.log("Location error:", locErr);
            setShowAlertPopUp(true);
          }

        } else {
          setShowAlertPopUp(true);
        }

      } else {
        try {
          await getAccurateLocation();
          setShowAlertPopUp(false);
        } catch (err) {
          console.log("iOS location error:", err);
          setShowAlertPopUp(true);
        }
      }

    } catch (error) {
      console.log("Permission error:", error);
      setShowAlertPopUp(true);
    }

    isRequesting.current = false;
  };


  // const getAccurateLocation = async () => {
  //   setLoadingLocation(true);

  //   GetLocation.getCurrentPosition({
  //     enableHighAccuracy: true,
  //     timeout: 60000,
  //   })
  //     .then(async location => {
  //       const { latitude, longitude } = location;
  //       setLocation({ latitude, longitude });
  //       setLoadingLocation(false);
  //       try {
  //         const res = await fetch(
  //           `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
  //         );
  //         const data = await res.json();

  //         if (data.results?.length) {
  //           const formattedAddress = data.results[0].formatted_address;
  //           setNearByAddress(formattedAddress);
  //           setSearchText(formattedAddress);
  //           await fetchAllRestaurants(latitude, longitude);
  //           if (webRef.current) {
  //             const js = `
  //               const newCenter = { lat: ${latitude}, lng: ${longitude} };
  //               map.setCenter(newCenter);
  //               true;
  //             `;
  //             webRef.current.injectJavaScript(js);
  //           }
  //           console.log("Location Found", formattedAddress);
  //         }
  //       } catch (error) {
  //         console.error("Reverse geocode failed:", error);
  //         console.log("Error", "Could not fetch location name.");
  //       }
  //     })
  //     .catch(error => {
  //       const { code, message } = error;
  //       console.warn(code, message);
  //     })
  // };

  const getAccurateLocation = async () => {
    setLoadingLocation(true);

    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      });

      let latitude = location.latitude;
      let longitude = location.longitude;

      try {
        const stored = await AsyncStorage.getItem("locationCords");
        if (stored) {
          const parsed = JSON.parse(stored);

          // only use stored if valid
          if (parsed?.latitude && parsed?.longitude) {
            latitude = parsed.latitude;
            longitude = parsed.longitude;
          }
        }
      } catch (e) {
        console.warn("Failed to load stored location", e);
      }
      setLocation({ latitude, longitude });
      setLoadingLocation(false);

      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
        );
        const data = await res.json();

        if (data.results?.length) {
          const address = data.results[0].formatted_address;
          setNearByAddress(address);
          setSearchText(address);
        }
      } catch (err) {
        console.error("Reverse geocode failed:", err);
      }
      try {
        await fetchAllRestaurants(latitude, longitude);
      } catch (err) {
        // console.warn("fetchAllRestaurants failed:", err);
      }

      if (mapReady.current && webRef.current) {
        const js = `
        window.setMapCenter(${latitude}, ${longitude});
        true;
      `;
        webRef.current.injectJavaScript(js);
      }

      // console.log("Location updated:", latitude, longitude);

    } catch (error) {
      setLoadingLocation(false);
      // console.warn("GetLocation error:", error);
    }
  };


  const fetchAllRestaurants = async (lat: number, lng: number) => {
    try {
      let allResults: Restaurant[] = [];

      const activeMilestones = milestones.filter((m: any) => m?.radius <= radius);

      for (const radius of activeMilestones) {
        const radiusMeters = radius.radius * 1000;
        // console.log(`🔍 Fetching restaurants within ${radius} km radius...`);

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=restaurant&key=${GOOGLE_MAPS_KEY}`
        );
        const data = await response.json();

        if (data.results?.length) {
          const places: Restaurant[] = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            distance: getDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
          }));

          allResults = [...allResults, ...places];
        }
      }

      const uniqueRestaurants = allResults.filter(
        (r, index, self) => index === self.findIndex((t) => t.id === r.id)
      );

      const filteredRestaurants = uniqueRestaurants.filter(
        (r) => r.distance <= radius
      );

      filteredRestaurants.sort((a, b) => a.distance - b.distance);

      // console.log(`Showing restaurants within ${radius} km → ${filteredRestaurants.length} found`);
      setAllRestaurants(uniqueRestaurants);
      setRestaurants(filteredRestaurants);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleSearchLocation = async (text: string): Promise<void> => {
    if (!text.trim()) {
      // console.log("Enter a location", "Please type an area or city name.");
      return;
    }
    if (text?.length < 4) {
      setShowSuggestion(false);
      setSuggestionAddress([]);
      return;
    }
    setShowSuggestion(true);
    setSearchLoading(true);
    try {
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          text
        )}&key=${GOOGLE_MAPS_KEY}`
      );

      if (!geoRes.ok) throw new Error("Failed to fetch location data.");

      const geoData = await geoRes.json();
      if (!geoData.results?.length) {
        console.log("Not Found", "Couldn't find that location.");
        setSearchLoading(false);
        return;
      }
      const formatted = geoData.results[0].formatted_address;
      setSuggestionAddress(geoData.results);
      const { lat, lng } = geoData.results[0].geometry.location;
      setLocation({ latitude: lat, longitude: lng });
      // console.log("Location Updated", formatted);
    } catch (error) {
      // console.error("Search error:", error);
      // console.log("Error", "Unable to search this location.");
    } finally {
      setSearchLoading(false);
    }
  };

  const filterRestaurantsByRadius = () => {
    if (!location) return;
    const filtered = allRestaurants.filter(
      (r) => getDistance(location.latitude, location.longitude, r.latitude, r.longitude) <= radius
    );
    setRestaurants(filtered);
  };

  useEffect(() => {
    if (location) fetchAllRestaurants(location.latitude, location.longitude);
  }, [location, radius]);

  useEffect(() => {
    if (location) filterRestaurantsByRadius();
  }, [radius, allRestaurants, location]);

  useEffect(() => {
    if (mapReady.current && webRef.current && location) {
      const js = `
        window.updateRestaurants(${JSON.stringify(restaurants)}, ${JSON.stringify(selected)});
        true;
      `;
      webRef.current.injectJavaScript(js);
    }
  }, [restaurants, selected]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      console.log("Keyboard Shown");
      setTextBoxFocused(true);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      console.log("Keyboard Hidden");
      setTextBoxFocused(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "MAP_READY") {
        mapReady.current = true;
        const js = `
        window.updateRestaurants(${JSON.stringify(restaurants)}, ${JSON.stringify(selected)});
        true;
      `;
        webRef.current?.injectJavaScript(js);
      }

      else if (data.type === "MAP_TAP") {
        const { latitude, longitude } = data;
        setLocation({ latitude, longitude });

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
          );

          const geoData = await res.json();

          if (geoData.results && geoData.results.length > 0) {
            const formattedAddress = geoData.results[0].formatted_address;
            setNearByAddress(formattedAddress);
            setSuggestionAddress(geoData.results[0]);
            setSearchText(formattedAddress);
            // console.log("Address updated:", formattedAddress);
          } else {
            console.warn("No address found for this location");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
        }
      }
      else if (data.type === "map-scroll-end") {
        const { latitude, longitude } = data;
        setLocation({ latitude, longitude });

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
          );

          const geoData = await res.json();

          if (geoData.results && geoData.results.length > 0) {
            const formattedAddress = geoData.results[0].formatted_address;
            setNearByAddress(formattedAddress);
            setSuggestionAddress(geoData.results[0]);
            setSearchText(formattedAddress);
            // console.log("Address updated:", formattedAddress);
          } else {
            console.warn("No address found for this location");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
        }
      } else if (data.id) {
        setSelected(data);
      }

    } catch (e) {
      console.error("Parse error in handleMessage:", e);
    }
  };

  const handleUserLocationFunction = async () => {
    setApiResponseLoader(true);
    const userData = await getData("userData");
    const payload = {
      userId: userData?.userID,
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      nearByAddress: nearByAddress ?? "",
      distanceinMiles: radius,
    };

    await userLocation(payload).then(async (response) => {
      setApiResponseLoader(false);
      if (response?.succeeded) {
        dispatch(setRadiusData(radius));
        dispatch(setAddressData(nearByAddress));
        await AsyncStorage.setItem("locationData", nearByAddress);
        let obj = {
          latitude: payload?.latitude,
          longitude: payload?.longitude,
        }
        await AsyncStorage.setItem("locationCords", JSON.stringify(obj));
        await AsyncStorage.setItem("Radius", JSON.stringify(radius));
        navigation.navigate(routeId == 1 ? "TabNavigation" : "SavingScreen");
      }
    })
  };

  const handleSuggestionAddress = async (item_: any) => {
    Keyboard.dismiss();
    setSearchText(item_?.formatted_address);
    setNearByAddress(item_?.formatted_address);
    const { lat, lng } = item_.geometry.location;
    setLocation({ latitude: lat, longitude: lng });
    await fetchAllRestaurants(lat, lng);
    if (webRef.current) {
      const js = `
          const newCenter = { lat: ${lat}, lng: ${lng} };
          map.setCenter(newCenter);
          true;
        `;
      webRef.current.injectJavaScript(js);
    }
    setTextBoxFocused(false);
    setShowSuggestion(false);
  }

  const handleSelectRadius = (item: any) => {
    const updated = milestones.map((m) => {
      if (m.radius === item?.radius) {
        return { ...m, isSelected: item?.radius != 20 ? !m.isSelected : true };
      } else {
        return { ...m, isSelected: false };
      }
    });
    if (item?.radius != 20) {
      setRadius(item?.radius);
      setShowRadiusTextBox(false);
    } else {
      Keyboard.dismiss();
      setShowRadiusTextBox(!showRadiusTextBox);
    }
    setMilesStones(updated);
  };

  const html = useMemo(() => MapFunction({ GOOGLE_MAPS_KEY }), []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={handleMessage}
          style={{ flex: 1 }}
          javaScriptEnabled
          scrollEnabled={false}
        />
      </View>
      {/* <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      > */}
      <View style={{ position: "absolute", bottom: 0, width: "100%", height: textBoxFocused ? "80%" : "auto" }}>
        {
          !textBoxFocused &&
          <Pressable
            onPress={async () => {
              await AsyncStorage.removeItem("locationCords");
              await requestPermission();
            }}
            style={({ pressed }) => [styles.currentLocationButton, pressed && { opacity: 0.6 }]}
          >
            {loadingLocation ? (
              <View style={{ paddingVertical: 3 }}>
                <ActivityIndicator color="#000" />
              </View>
            ) : (
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center", paddingVertical: 3 }}>
                <View>
                  <Image source={Icons.CurrentLocationIcon} style={{ height: heightPixel(28), width: widthPixel(28) }} resizeMode="contain" />
                </View>
                <Text style={styles.currentLocationButtonText}>{LocationLabels?.UseCurrentLocation}</Text>
              </View>
            )}
          </Pressable>
        }
        <View style={{ backgroundColor: "#fff", flex: 1, borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingBottom: 50 }}>
          <View>
            <View style={{ height: 5, backgroundColor: "#E2E2E2", width: "30%", alignSelf: "center", borderRadius: 60, marginTop: 6, marginBottom: 20 }} />
            <View style={{ paddingLeft: 30, paddingRight: 30 }}>
              <Text style={styles.subtitle}>{LocationLabels?.HelpUSToFindOffer}</Text>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#D6D6D6",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  marginBottom: 20
                }}
              >
                <Image
                  source={Icons.SearchIcon}
                  style={{
                    height: heightPixel(20),
                    width: widthPixel(20),
                    marginRight: 10,
                  }}
                  resizeMode="contain"
                />

                <TextInput
                  ref={locationInputRef}
                  placeholder={LocationLabels?.SearchArea}
                  value={searchText}
                  onChangeText={(text) => {
                    setSearchText(text);
                    setAutoFilled(false);
                    handleSearchLocation(text);
                  }}
                  style={[styles.searchInput, { flex: 1, paddingVertical: 0 }]}
                  placeholderTextColor="#999"
                  returnKeyType="search"
                  onSubmitEditing={() => setTextBoxFocused(false)}
                  selection={
                    autoFilled
                      ? { start: 0, end: 0 }
                      : undefined
                  }
                  onSelectionChange={() => {
                    if (autoFilled) {
                      setAutoFilled(false);
                    }
                  }}
                />
                <Pressable onPress={() => setSearchText("")}>
                  <Image
                    source={Icons.CloseIcon}
                    style={{
                      height: heightPixel(20),
                      width: widthPixel(20),
                      marginRight: 0,
                    }}
                    tintColor={"black"}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
              <View style={(showSuggestion && suggestionAddress?.length > 0) && { paddingBottom: "15%" }}>
                {
                  showSuggestion && suggestionAddress?.length > 0 && suggestionAddress.map((item: any, index) => {
                    return (
                      <Pressable key={index} onPress={() => handleSuggestionAddress(item)} style={{ borderBottomWidth: 1, borderBottomColor: "#D6D6D6", paddingBottom: 5 }}>
                        <Text style={{ fontFamily: FONTS.tenonMediumFont, color: "#000", fontSize: fontPixel(14) }}>{item?.formatted_address}</Text>
                      </Pressable>
                    )
                  })
                }
              </View>
              <View>
                <Text style={{ color: "#666666", fontFamily: FONTS.tenonRegularFont, fontSize: fontPixel(16), marginBottom: 5 }}>{`${LocationLabels?.ShowResultWithIn}:`}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  {milestones?.map((item, index) => (
                    <Pressable onPress={() => handleSelectRadius(item)} key={index} style={{ borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7, width: "auto", borderRadius: 40, alignItems: "center", justifyContent: "center", backgroundColor: item?.isSelected ? "#264941" : "transparent", borderColor: "#264941" }}>
                      <Text style={{ fontFamily: FONTS.tenonMediumFont, fontSize: fontPixel(16), color: item?.isSelected ? "#ffffff" : "#264941" }}>{item?.radius !== 20 ? `${item?.radius} Kms` : "Others"}</Text>
                    </Pressable>
                  ))}
                </View>
                {
                  showRadiusTextBox &&
                  <TextInput
                    placeholder={LocationLabels?.SearchArea}
                    keyboardType="numeric"
                    onChangeText={(text: any) => setRadius(text)}
                    style={[styles.searchInput, { flex: 1, paddingVertical: 0, borderWidth: 1, borderColor: "#D6D6D6", borderRadius: 10, paddingLeft: 10 }]}
                    placeholderTextColor="#999"
                    returnKeyType="done"
                  />
                }
              </View>
              <Pressable style={styles.confirmButton} onPress={handleUserLocationFunction} disabled={loadingLocation}>
                <Text style={styles.confirmButtonText}>{apiResponseLoader ? "Please wait..." : LocationLabels?.ConfirmLocation}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      {/* </KeyboardAvoidingView> */}
      <MapModal visible={showAlertPopUp} onClose={() => setShowAlertPopUp(false)}>
        <View>
          <Text style={styles.title}>Location access denied</Text>

          <Text style={styles.message}>
            Please search manually to enter your location and find nearby offers.
          </Text>

          <View style={styles.buttonRow}>
            <Pressable style={styles.allowBtn} onPress={() => openSettings()}>
              <Text style={styles.allowText}>Allow Access</Text>
            </Pressable>

            <Pressable style={styles.searchBtn} onPress={() => {
              setShowAlertPopUp(false);
              setTimeout(() => {
                locationInputRef.current?.focus();
              }, 100);
            }}>
              <Text style={styles.searchText}>Search Now</Text>
            </Pressable>
          </View>
        </View>
      </MapModal>
    </View>
  );
};

export default LocationScreen;

const BORDER = {
  borderWidth: 1.2,
  borderColor: "#ccc",
  borderRadius: 10,
};

const styles = StyleSheet.create({
  flexContainer: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 15,
    paddingBottom: 30,
  },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  backIcon: { width: 16, height: 16, marginRight: 6, transform: [{ rotate: "-90deg" }] },
  backText: { fontSize: 16, color: "#000" },
  subtitle: { color: "#666666", fontSize: fontPixel(16), marginBottom: 10, fontFamily: FONTS.tenonRegularFont },
  searchInput: {
    height: 44,
    fontSize: fontPixel(16),
    color: "#000",
    fontFamily: FONTS.tenonRegularFont
  },
  sectionLabel: { fontSize: 13, color: "#666", marginTop: 12, marginBottom: 8 },
  currentLocationButton: {
    alignSelf: "center",
    marginBottom: 20,
    paddingVertical: 5,
    paddingHorizontal: 26,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#3274E0",
    backgroundColor: "#fff",
  },
  currentLocationButtonText: { fontFamily: FONTS.tenonMediumFont, fontSize: fontPixel(18), color: "#3274E0", paddingLeft: 5 },
  confirmButton: {
    marginTop: 28,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#264941",
    backgroundColor: "#264941",
    width: "100%"
  },
  confirmButtonText: { fontSize: fontPixel(16), fontFamily: FONTS.tenonBoldFont, color: "#fff" },

  title: {
    fontSize: fontPixel(24),
    fontFamily: FONTS.tenonBoldFont,
    color: "#BC4242",
    marginBottom: 10,
  },

  message: {
    fontSize: fontPixel(16),
    color: "#666666",
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: FONTS.tenonMediumFont
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  allowBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 25,
    borderColor: "#264941",
    justifyContent: "center",
    alignItems: "center",
  },
  allowText: {
    color: "#264941",
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont
  },

  searchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#264941",
    justifyContent: "center",
    alignItems: "center",
  },
  searchText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont
  },
});