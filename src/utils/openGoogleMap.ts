import { Platform, Linking, Alert } from "react-native";

export const openGoogleMap = async (
  latitude: number,
  longitude: number,
  label: string = ""
) => {
  try {
    const encodedLabel = encodeURIComponent(label);

    const appUrl = Platform.select({
      ios: `comgooglemaps://?q=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
    });

    const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    if (!appUrl) {
      await Linking.openURL(browserUrl);
      return;
    }

    const supported = await Linking.canOpenURL(appUrl);

    if (supported) {
      await Linking.openURL(appUrl);
    } else {
      await Linking.openURL(browserUrl);
    }
  } catch (error) {
    console.error("Error opening Google Maps:", error);
    Alert.alert("Error", "Unable to open Google Maps.");
  }
};