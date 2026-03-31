import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import { Icons } from "../theme/AssetsUrl";
import { FONTS } from "../theme/FontsLink";
import { fontPixel } from "../utils/responsive";

interface TextInputComponentProps extends TextInputProps {
  placeholder?: string;
  placeholderTextColor?: string;
  isPassword?: boolean; // 👈 Add this prop to show icon conditionally
  isPhone?: boolean
}

const TextInputComponent: React.FC<TextInputComponentProps> = ({
  placeholder,
  placeholderTextColor,
  isPassword = false,
  isPhone = false,
  secureTextEntry,
  ...rest
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      {isPhone && (
        <View style={styles.phoneContainer}>
          <Text style={styles.label}>+971</Text>
        </View>
      )}
      <TextInput
        style={[styles.input, isPassword && { paddingRight: 40 }, isPhone && { paddingLeft: 55 }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || "#999"}
        secureTextEntry={isPassword ? isSecure : false}
        {...rest}
      />

      {/* 👁️ Show local icon only for password */}
      {isPassword && (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setIsSecure(!isSecure)}
        >
          <Image
            source={isSecure ? Icons.EyeHideIcon :Icons.EyeShowIcon}
            style={[
              styles.icon,
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TextInputComponent;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fontPixel(16),
    color: "#000000",
    fontFamily: Platform.select({
      ios: FONTS.tenonRegularFont,
      android: FONTS.tenonRegularFont,
    }),
  },
  iconContainer: {
    position: "absolute",
    right: 12,
    padding: 5,
  },
  phoneContainer: {
    position: "absolute",
    left: 5,
    padding: 5,
    borderRightWidth: 2,
    borderRightColor: "#C3C3C3"
  },
  icon: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonRegularFont,
    color: '#666666',
  },
});