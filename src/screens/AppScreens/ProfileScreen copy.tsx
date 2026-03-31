import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Icons } from "../../theme/AssetsUrl";
import TextInputComponent from "../../component/TextInput";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageLibraryOptions, launchImageLibrary, MediaType } from "react-native-image-picker";
import { request, PERMISSIONS, openSettings } from "react-native-permissions";
import { IMG_URL } from "../../../config";
import { validatePassword, validatePasswordNConfirmPassword } from "../../utils/validation";
import { changeProfilePassword } from "../../../helpers/Services/userProfile";
import CustomToast from "../../component/CustomToast";

interface ValidationErrors {
  oldPassword?: string,
  newPassword?: string;
  confirmPassword?: string;
}


const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [imagePath, setImagePath] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [onChangeFlag, setOnChangeFlag] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [validationError, setValidationError] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  const fetchUserData = async () => {
    const userData = JSON.parse(await AsyncStorage.getItem("userProfileData") || "{}");
    let name = `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim();
    setFullName(name);
    setEmail(userData?.email);
    setPhone(userData?.phoneNumber);
    setImagePath(userData?.imageUrl)
  };

  const handleDevicePermission = () => {
    if (Platform.OS === 'android') {
      const sdkInt = Platform.Version;
      if (sdkInt >= 33) {
        request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
          .then((result) => {
            if (result === "granted") {
              openImagePicker();
            }
          })
          .catch((error) => console.error('Permission Request Error:', error));
      } else {
        request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
          .then((result) => {
            if (result === "granted") {
              openImagePicker();
            }
          })
          .catch((error) => console.error('Permission Request Error:', error));
      }
    } else if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.MEDIA_LIBRARY)
        .then((result) => {
          if (result === "granted") {
            openImagePicker();
          }
        })
        .catch((error: any) => console.error('Permission Request Error:', error));
    }
  };

  const openImagePicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        setOnChangeFlag(false);
        setImageLoadError(false)
      } else if (response.error) {
        setOnChangeFlag(false);
        setImageLoadError(false);
      } else {
        if (response.assets[0]["fileSize"] < 1000000) {
          setImagePath(response.assets[0].uri);
          setOnChangeFlag(true);
          setImageLoadError(false);
        }
      }
    });
  };

  const handleSave = async () => {
    // console.log({
    //   fullName,
    //   email,
    //   phone,
    //   oldPassword,
    //   newPassword,
    //   confirmPassword,
    //   imagePath,
    // });
    const errors: Record<string, string> = {};
    const passwordError = validatePasswordNConfirmPassword(newPassword, confirmPassword);
    const oldPasswordError = validatePassword(oldPassword);
    if (oldPasswordError) {
      errors.oldPassword = oldPasswordError;
    } else if (passwordError?.includes("Confirm Password")) {
      errors.confirmPassword = passwordError;
    } else if (passwordError) {
      errors.newPassword = passwordError;
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    setValidationError({});
    let payload = {
      "password": oldPassword,
      "newPassword": newPassword,
      "confirmNewPassword": confirmPassword
    }

    await changeProfilePassword(payload).then((response) => {
      if (response?.succeeded) {
        setShowToast(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      } else {
        setShowToast(true);
        setToastMessage(response?.messages[0]);
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }
    })
  };

  return (
    <View style={styles.container}>
      {showToast && <CustomToast message={toastMessage} isSuccess={isSuccess} />}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image source={Icons.ArrowIcon} style={styles.backIcon} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps={"always"}
      >
        {/* Profile Image */}
        {/* <View style={styles.imageContainer}>
          <Image
            source={imagePath ? handleImageData(imagePath) : Icons.DummyImageIcon}
            style={styles.profileImage}
            resizeMode="contain"
          />
          <Pressable style={styles.editIconContainer} onPress={handleDevicePermission}>
            <Image source={Icons.DummyImageIcon} style={styles.editIcon} />
          </Pressable>
        </View> */}

        <Pressable>
          <Text style={styles.sectionTitle}>Profile</Text>
        </Pressable>

        <Text style={styles.label}>Full Name</Text>
        <TextInputComponent
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          editable={false}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInputComponent
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={false}
        />

        <Text style={styles.label}>Email</Text>
        <TextInputComponent
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          editable={false}
        />

        <View style={styles.divider} />

        <Pressable onPress={() => setShowChangePassword(!showChangePassword)}>
          <Text style={styles.sectionTitle}>Change Password</Text>
        </Pressable>

        {
          showChangePassword &&
          <View>
            <Text style={styles.label}>Old Password</Text>
            <TextInputComponent
              placeholder="Enter your old password"
              value={oldPassword}
              onChangeText={(text) => {
                setOldPassword(text);
                if (validationError.oldPassword)
                  setValidationError((prev) => ({ ...prev, oldPassword: "" }));
              }}
              secureTextEntry
              isPassword
            />

            {validationError.oldPassword && (
              <Text style={styles.errorText}>{validationError.oldPassword}</Text>
            )}
            <Text style={styles.label}>New Password</Text>
            <TextInputComponent
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (validationError.newPassword)
                  setValidationError((prev) => ({ ...prev, password: "" }));
              }}
              secureTextEntry
              isPassword
            />
            {validationError.newPassword && (
              <Text style={styles.errorText}>{validationError.newPassword}</Text>
            )}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInputComponent
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (validationError.newPassword)
                  setValidationError((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              secureTextEntry
              isPassword
            />
            {validationError.confirmPassword && (
              <Text style={styles.errorText}>{validationError.confirmPassword}</Text>
            )}
          </View>
        }

        {/* Save Button */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>SAVE CHANGES</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "#333",
    transform: [{ "rotate": "-90deg" }]
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 5,
    right: "35%",
    backgroundColor: "#4A3AFF",
    padding: 6,
    borderRadius: 20,
  },
  editIcon: {
    width: 14,
    height: 14,
    tintColor: "#fff",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#4A3AFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 6
  },
});
