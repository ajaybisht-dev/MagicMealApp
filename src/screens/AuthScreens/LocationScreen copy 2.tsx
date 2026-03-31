import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { AuthStackParamList } from "../../types/AuthTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
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

const GOOGLE_MAPS_KEY = "AIzaSyBwIAMX7VpWwt52mKTc0h-9boxwtCdlm5s";
const milestones = [2, 5, 10, 15, 20]; // Radius options (in km)

type Props = DrawerScreenProps<DrawerParamList, "LocationScreen">;

const LocationScreen: React.FC<Props> = ({ route }) => {

  // const { routeData } = route.params;

  const languageSelector = useSelector((state: RootState) => state?.languageSlice?.selected_language);

  const navigation = useNavigation<LocationScreenNavigationProp>();
  const dispatch = useDispatch();

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

  const webRef = useRef<WebView>(null);
  const mapReady = useRef(false);

  const DEFAULT_LOCATION = { latitude: 20.5937, longitude: 78.9629 };

  const OtherLabels = language_data[selectedLanguage].other_items;
  const LocationLabels = language_data[selectedLanguage].location_items;

  useEffect(() => {
    if (languageSelector === "en" || languageSelector === "ar") {
      setSelectedLanguage(languageSelector);
    }
  }, [languageSelector]);

  useEffect(() => {
    requestPermission()
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

  const requestPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "We need access to your location to show nearby offers.",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) getAccurateLocation();
        else Alert.alert("Permission Denied", "Please allow location access to continue.");
      } else getAccurateLocation();
    } catch (error) {
      console.error("Permission error:", error);
    }
  };

  const getAccurateLocation = async () => {
    setLoadingLocation(true);

    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(async location => {
        const { latitude, longitude } = location;
        setLocation({ latitude, longitude });
        setLoadingLocation(false);
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
          );
          const data = await res.json();

          if (data.results?.length) {
            const formattedAddress = data.results[0].formatted_address;
            setNearByAddress(formattedAddress);
            await fetchAllRestaurants(latitude, longitude);
            if (webRef.current) {
              const js = `
                const newCenter = { lat: ${latitude}, lng: ${longitude} };
                map.setCenter(newCenter);
                true;
              `;
              webRef.current.injectJavaScript(js);
            }
            console.log("Location Found", formattedAddress);
          }
        } catch (error) {
          console.error("Reverse geocode failed:", error);
          console.log("Error", "Could not fetch location name.");
        }
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      })
  };

  const fetchAllRestaurants = async (lat: number, lng: number) => {
    try {
      let allResults: Restaurant[] = [];

      const activeMilestones = milestones.filter((m) => m <= radius);

      for (const radius of activeMilestones) {
        const radiusMeters = radius * 1000;
        console.log(`🔍 Fetching restaurants within ${radius} km radius...`);

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

      console.log(`Showing restaurants within ${radius} km → ${filteredRestaurants.length} found`);
      setAllRestaurants(uniqueRestaurants);
      setRestaurants(filteredRestaurants);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleSearchLocation = async (text: string): Promise<void> => {
    if (!text.trim()) {
      console.log("Enter a location", "Please type an area or city name.");
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
      console.log("Location Updated", formatted);
    } catch (error) {
      console.error("Search error:", error);
      console.log("Error", "Unable to search this location.");
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

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "MAP_READY") {
        mapReady.current = true;

        // send restaurant data to map once ready
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
            console.log("Address updated:", formattedAddress);
          } else {
            console.warn("No address found for this location");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
        }
      }
      else if (data.id) {
        setSelected(data);
      }

    } catch (e) {
      console.error("Parse error in handleMessage:", e);
    }
  };

  const handleUserLocationFunction = async () => {
    const userData = await getData("userData");
    const payload = {
      userId: userData?.userID,
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      nearByAddress: nearByAddress ?? "",
      distanceinMiles: radius,
    };
    await userLocation(payload).then((response) => {
      if (response?.succeeded) {
        dispatch(setRadiusData(radius));
        dispatch(setAddressData(nearByAddress));
        // navigation.replace("AppNavigation");
        // if (routeData == "login") {
        //   navigation.reset({
        //     index: 0,
        //     routes: [{ name: "LoginScreen" }],
        //   });
        // } else {
        //   navigation.goBack()
        // }
        navigation.goBack()
      }
    })
  };

  const handleSuggestionAddress = async (item_: any) => {
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
    setShowSuggestion(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        scrollEnabled={false}
      >
        <View style={styles.container}>
          {/* <Pressable
            onPress={() => {
              // if (routeData == "login") {
              //   navigation.reset({
              //     index: 0,
              //     routes: [{ name: "LoginScreen" }],F
              //   });
              // } else {
              //   navigation.goBack()
              // }
              navigation.goBack()
            }}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Image source={Icons.ArrowIcon} style={styles.backIcon} resizeMode="contain" />
            <Text style={styles.backText}>{OtherLabels?.Back}</Text>
          </Pressable> */}

          <Text style={styles.title}>{LocationLabels?.SetYourLocation}</Text>
          <Text style={styles.subtitle}>{LocationLabels?.HelpUSToFindOffer}</Text>

          <TextInput
            placeholder={LocationLabels?.SearchArea}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              handleSearchLocation(text)
            }}
            style={styles.searchInput}
            placeholderTextColor="#999"
            returnKeyType="search"
          />
          {
            showSuggestion && suggestionAddress.map((item: any, index) => {
              return (
                <Pressable key={index} onPress={() => handleSuggestionAddress(item)}>
                  <Text>{item?.formatted_address}</Text>
                </Pressable>
              )
            })
          }

          <Text style={styles.sectionLabel}>Interactive Map View</Text>
          <View style={{ height: 220, borderRadius: 10, overflow: "hidden" }}>
            <WebView
              ref={webRef}
              originWhitelist={["*"]}
              source={{
                html: MapFunction({
                  GOOGLE_MAPS_KEY,
                  location: location || DEFAULT_LOCATION,
                }),
              }}
              onMessage={handleMessage}
              style={{ flex: 1 }}
              javaScriptEnabled
              scrollEnabled={false}
            />
          </View>

          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [styles.currentLocationButton, pressed && { opacity: 0.6 }]}
          >
            {loadingLocation ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.currentLocationButtonText}>{LocationLabels?.UseCurrentLocation}</Text>
            )}
          </Pressable>

          <CustomDropdown
            label={`${LocationLabels?.ShowResultWithIn}:`}
            options={milestones}
            selectedValue={radius}
            onSelect={async (value) => {
              setRadius(value);
              // await fetchAllRestaurants(location.latitude, location.longitude)
            }}
            selectRadiusText={LocationLabels?.SelectRadius}
          />

          <Pressable style={styles.confirmButton} onPress={handleUserLocationFunction}>
            <Text style={styles.confirmButtonText}>{LocationLabels?.ConfirmLocation}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LocationScreen;

const BORDER = {
  borderWidth: 1.2,
  borderColor: "#ccc",
  borderRadius: 10,
};

const styles = StyleSheet.create({
  flexContainer: { flex: 1, backgroundColor: "#fff" },
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
  title: { fontSize: 24, fontWeight: "600", textAlign: "center", marginBottom: 50, color: "#222" },
  subtitle: { color: "#666", fontSize: 14, marginBottom: 10 },
  searchInput: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
    ...BORDER,
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 13, color: "#666", marginTop: 12, marginBottom: 8 },
  currentLocationButton: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 7,
    paddingHorizontal: 26,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: "#bbb",
    backgroundColor: "#fff",
    elevation: 2,
  },
  currentLocationButtonText: { fontWeight: "600", color: "#333" },
  confirmButton: {
    marginTop: 28,
    alignSelf: "center",
    paddingVertical: 7,
    paddingHorizontal: 48,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#bbb",
    backgroundColor: "#fff",
  },
  confirmButtonText: { fontWeight: "700", color: "#333" },
});