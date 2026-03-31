import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
  ImageBackground,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Icons, Images } from "../../theme/AssetsUrl";
import {
  CommonActions,
  DrawerActions,
  useNavigation,
} from "@react-navigation/native";
import {
  ImageLibraryOptions,
  launchImageLibrary,
  launchCamera,
  MediaType,
  CameraOptions,
} from "react-native-image-picker";
import { request, PERMISSIONS, openSettings } from "react-native-permissions";
import CustomToast from "../../component/CustomToast";
import LinearGradient from "react-native-linear-gradient";
import { fontPixel, heightPixel, widthPixel } from "../../utils/responsive";
import { FONTS } from "../../theme/FontsLink";
import { DefaultStyle } from "../../theme/styles/DefaultStyle";
import { getData } from "../../utils/storage";
import axios from "axios";
import { API_URL } from "../../../config";

const HelpAndSupportScreen: React.FC = () => {
  const navigation = useNavigation();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [openSelectDateTypeModal, setOpenSelectDateTypeModal] = useState(false);
  const [selectedSubjectType, setSelectedSubjectType] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [extension, setExtension] = useState("");
  const [description, setDescription] = useState("");
  const [submitLoader, setSubmitLoader] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [openImageSelectModal, setOpenImageSelectModal] = useState(false);

  const [dropDownList, setDropDownList] = useState(["General Inquiry", "Technical Issue", "Account/Billing Support", "Feedback/Suggestion", "Request a Feature", "Report a Bug", "Other"])

  const [imagePath, setImagePath] = useState<any>(null);
  const [imagePathUri, setImagePathUri] = useState<any>(null);

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleGoToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "DrawerNavigation",
            state: {
              index: 0,
              routes: [{ name: "HomeScreen" }],
            },
          },
        ],
      })
    );
  };

  const handleDevicePermission = () => {
    if (Platform.OS === "android") {
      const sdkInt = Platform.Version;
      if (sdkInt >= 33) {
        request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
          .then((result) => {
            if (result === "granted") {
              setOpenImageSelectModal(true);
              // openImagePicker();
            } else {
              openSettings()
            }
          })
          .catch((error) => console.error("Permission Request Error:", error));
      } else {
        request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
          .then((result) => {
            if (result === "granted") {
              setOpenImageSelectModal(true);
              // openImagePicker();
            } else {
              openSettings()
            }
          })
          .catch((error) => console.error("Permission Request Error:", error));
      }
    } else if (Platform.OS === "ios") {
      request(PERMISSIONS.IOS.PHOTO_LIBRARY)
        .then((result) => {
          if (result === "granted") {
            setOpenImageSelectModal(true);
            // openImagePicker();
          } else {
            openSettings()
          }
        })
        .catch((error: any) =>
          console.error("Permission Request Error:", error)
        );
    }
  };

  const openImagePicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo" as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        setOpenImageSelectModal(true);
        console.log("user cancelled");
      } else {
        // if (response.assets[0]["fileSize"] < 1000000) {
        setSelectedImageName(response?.assets[0]?.fileName);
        // setImagePath(response.assets[0].uri);
        let ex1 = /.png/;
        let ex2 = /.jpg/;
        let ex3 = /.jpeg/;
        let ex4 = /.JPG/;
        let ex5 = /.webp/;
        let data = response.assets[0].uri && {
          uri: response.assets[0]?.uri,
          type: response.assets[0]?.type,
          name: response.assets[0]?.fileName,
        }
        setImagePath(data);
        setImagePathUri(response?.assets[0].uri);
        let extensionData = (ex1.test(response.assets[0].fileName) ? "png" : "") ||
          (ex2.test(response.assets[0].fileName) ? "jpg" : "") ||
          (ex3.test(response.assets[0].fileName) ? "jpeg" : "") ||
          (ex4.test(response.assets[0].fileName) ? "JPG" : "") ||
          (ex5.test(response.assets[0].fileName) ? "webp" : "")

        setExtension(extensionData);
        setImageError(false);
        setOpenImageSelectModal(false);
      }
      // }
    });
  };

  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: "photo",
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      saveToPhotos: true,
    };

    launchCamera(options, (response: any) => {
      if (response.didCancel) {
        setOpenImageSelectModal(true);
        console.log("User cancelled");
      } else if (response.errorCode) {
        console.log("Camera Error: ", response.errorMessage);
      } else {
        const asset = response.assets?.[0];
        if (!asset) return;

        // if (asset.fileSize < 1000000) {
        setSelectedImageName(asset.fileName);

        const data = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
        };

        setImagePath(data);
        setImagePathUri(asset.uri);

        // Detect extension
        const fileName = asset.fileName || "";

        let extensionData =
          (/.png$/i.test(fileName) && "png") ||
          (/.jpg$/i.test(fileName) && "jpg") ||
          (/.jpeg$/i.test(fileName) && "jpeg") ||
          (/.webp$/i.test(fileName) && "webp") ||
          "";

        setExtension(extensionData);
        setImageError(false);
        setOpenImageSelectModal(false);
      }
      // }
    });
  };


  const handleSubmitHelpndSupport = async () => {
    const userData = await getData("userData");

    if (selectedSubjectType && imagePath && description) {
      setSubjectError(false);
      setDescriptionError(false);
      setImageError(false);
      let formData = new FormData();
      formData.append("UserID", userData?.userID);
      formData.append("Subject", selectedSubjectType ?? "");
      formData.append("Description", description ?? "");
      formData.append("FormFiles", imagePath ?? "");
      formData.append("UploadType", 3);
      formData.append("Extension", extension);

      setSubmitLoader(true);
      await axios.post(API_URL + 'support/inserthelpsupport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userData?.token}`,
        },
      })
        .then(async (response: any) => {
          if (response?.succeeded) {
            setSelectedSubjectType("");
            setSelectedImageName("");
            setImagePath(null);
            setImagePathUri(null);
            setDescription("");
            setSubmitLoader(false);
            setShowToast(true);
            setIsSuccess(true);
            setToastMessage(response?.messages[0]);
            setTimeout(() => {
              setShowToast(false);
            }, 2000);
          } else {
            setShowToast(true);
            setIsSuccess(false);
            setToastMessage(response?.messages[0]);
            setTimeout(() => {
              setShowToast(false);
            }, 2000);
          }
        })
        .catch(error => {
          setSubmitLoader(false);
          console.error("Error updating profile:", error);
        });
    } else {
      setSubjectError(selectedSubjectType ? false : true);
      setDescriptionError(description ? false : true);
      setImageError(imagePath ? false : true);
    }
  };

  const handleRemoveImage = () => {
    setImagePath(null);
    setImagePathUri(null);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        {showToast && (
          <CustomToast message={toastMessage} isSuccess={isSuccess} />
        )}
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1 }}
          resizeMode="contain"
          imageStyle={{ tintColor: "#23302A" }}
        >
          <View style={styles.headerNav}>
            <Pressable style={styles.header} onPress={() => handleOpenDrawer()}>
              <Image
                source={Icons.MenuIcon}
                resizeMode="contain"
                style={{
                  height: heightPixel(20),
                  width: widthPixel(20),
                  marginRight: 10,
                }}
              />
              <Text style={styles.headerTitle}>Help & Support</Text>
            </Pressable>
            <Pressable onPress={() => handleGoToHome()}>
              <Image
                source={Icons.HomeIcon}
                resizeMode="contain"
                style={{ height: heightPixel(27), width: widthPixel(27) }}
                tintColor={"#fff"}
              />
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              flex: 1,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              marginTop: 15,
            }}
          >
            <View
              style={{
                height: 185,
                width: 185,
                position: "absolute",
                bottom: -40,
                right: -40,
              }}
            >
              <Image
                source={Images.BottomCircle}
                style={DefaultStyle.imageSize}
                resizeMode="contain"
                tintColor={"#F4F4F4"}
              />
            </View>
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 60 }}
              keyboardShouldPersistTaps={"always"}
            >
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    color: "#15090A",
                    fontFamily: FONTS.tenonBoldFont,
                    fontSize: fontPixel(18),
                  }}
                >
                  Fill out the form below
                </Text>
                <View style={{ marginTop: 15 }}>
                  <View>
                    <Text
                      style={{
                        color: "#666666",
                        fontFamily: FONTS.tenonRegularFont,
                        fontSize: fontPixel(16),
                      }}
                    >
                      {" "}
                      Subject
                    </Text>
                    <View
                      style={{
                        borderWidth: 1,
                        paddingVertical: 10,
                        marginTop: 10,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        borderColor: "#D6D6D6",
                      }}
                    >
                      <Pressable
                        onPress={() => setOpenSelectDateTypeModal(true)}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            color: selectedSubjectType ? "#000" : "#B9B9B9",
                            fontFamily: FONTS.tenonRegularFont,
                            fontSize: fontPixel(18),
                          }}
                        >
                          {selectedSubjectType ? selectedSubjectType : "Please Select"}
                        </Text>
                        <View>
                          <Image
                            source={Icons.ArrowGreenIcon}
                            style={{
                              height: heightPixel(14),
                              width: widthPixel(14),
                              transform: [{ rotate: "90deg" }],
                            }}
                            resizeMode="contain"
                            tintColor={"#2E2E2E"}
                          />
                        </View>
                      </Pressable>
                    </View>
                    {subjectError && <Text style={styles.errorText}>{"Please Select Subject Type"}</Text>}
                  </View>
                  <View style={{ marginTop: 20 }}>
                    <Text
                      style={{
                        color: "#666666",
                        fontFamily: FONTS.tenonRegularFont,
                        fontSize: fontPixel(16),
                      }}
                    >
                      {" "}
                      Description
                    </Text>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <TextInput
                      placeholder="Write here"
                      placeholderTextColor="#B9B9B9"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      style={{
                        height: heightPixel(150),
                        borderWidth: 1,
                        borderColor: "#D6D6D6",
                        borderRadius: 10,
                        paddingLeft: 10,
                        paddingTop: 10,
                        color: "#000",
                        textAlignVertical: "top",
                      }}
                    />
                    {descriptionError && <Text style={styles.errorText}>{"Please Enter Description"}</Text>}
                  </View>
                </View>
                <View style={{ marginTop: 20 }}>
                  <Text
                    style={{
                      color: "#666666",
                      fontFamily: FONTS.tenonRegularFont,
                      fontSize: fontPixel(16),
                    }}
                  >
                    {" "}
                    Upload Image
                  </Text>
                  {imageError && <Text style={styles.errorText}>{"Upload a Image"}</Text>}
                  <View style={{ display: "flex" }}>
                    <Pressable
                      style={[
                        styles.saveButton,
                        { paddingVertical: 10, marginTop: 5 },
                      ]}
                      onPress={handleDevicePermission}
                    >
                      <Text style={[styles.saveText, { color: "#264941" }]}>
                        Click here to upload
                      </Text>
                    </Pressable>
                  </View>
                  {
                    imagePathUri &&
                    <View style={{ marginTop: 10, height: 120, width: 120 }}>
                      <Pressable style={{ position: "absolute", zIndex: 99, backgroundColor: "#DDD", right: 0 }} onPress={() => handleRemoveImage()}>
                        <Image source={Icons.CrossIcon} style={{ height: 18, width: 18 }} tintColor={"#000"} />
                      </Pressable>
                      <Image source={{ uri: imagePathUri }} style={{ height: "100%", width: "100%" }} />
                    </View>
                  }
                </View>
              </View>
            </ScrollView>
          </View>
          <Pressable
            disabled={submitLoader}
            style={[
              styles.saveButton,
              {
                backgroundColor: "#264941",
                width: "95%",
                alignSelf: "center",
                position: "absolute",
                bottom: 50,
              },
            ]}
            onPress={handleSubmitHelpndSupport}
          >
            {
              submitLoader ? <ActivityIndicator size={"small"} /> : <Text style={styles.saveText}>Submit</Text>
            }
          </Pressable>
        </ImageBackground>
      </LinearGradient>
      <Modal transparent visible={openSelectDateTypeModal} animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={() => setOpenSelectDateTypeModal(false)}
        />
        <View
          style={{
            backgroundColor: "#fff",
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: fontPixel(22), color: "#000", fontFamily: FONTS.tenonMediumFont, alignSelf: "center" }}>Please Select</Text>
            {
              dropDownList?.map((item, index) => {
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setSubjectError(false);
                      setSelectedSubjectType(item);
                      setOpenSelectDateTypeModal(false);
                    }}
                    style={{
                      paddingVertical: 20,
                      borderBottomWidth: index == dropDownList?.length - 1 ? 0 : 1,
                      borderColor: "#eee",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: fontPixel(18), color: "#000", fontFamily: FONTS.tenonMediumFont }}>{item}</Text>
                  </Pressable>
                )
              })
            }
          </View>
        </View>
      </Modal>
      <Modal transparent visible={openImageSelectModal} animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={() => setOpenImageSelectModal(false)}
        />
        <View
          style={{
            backgroundColor: "#fff",
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <View>
            <Pressable
              onPress={() => {
                setOpenImageSelectModal(false);
                setTimeout(() => {
                  openImagePicker();
                }, 100);
              }}
              style={{
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderColor: "#eee",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: fontPixel(18), color: "#000", fontFamily: FONTS.tenonMediumFont }}>Pick From Gallery</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOpenSelectDateTypeModal(false);
                openCamera();
              }}
              style={{
                paddingVertical: 20,
                marginTop: 0,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: fontPixel(18), color: "#000", fontFamily: FONTS.tenonMediumFont }}>Open Camera</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HelpAndSupportScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    // marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    // paddingTop: 10,
  },
  headerTitle: {
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonBoldFont,
    color: "#fff",
    marginLeft: 12,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  saveButton: {
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#264941",
    marginTop: 20,
    width: "60%",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonRegularFont
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 6,
  },
});
