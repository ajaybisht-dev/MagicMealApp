import React, { useEffect, useState } from 'react';
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
  Alert,
} from 'react-native';
import { Icons, Images } from '../../theme/AssetsUrl';
import TextInputComponent from '../../component/TextInput';
import {
  CommonActions,
  DrawerActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CameraOptions,
  ImageLibraryOptions,
  launchCamera,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';
import { request, PERMISSIONS, openSettings } from 'react-native-permissions';
import { API_URL, IMG_URL } from '../../../config';
import {
  validateName,
  validateOldPassword,
  validatePassword,
  validatePasswordNConfirmPassword,
  validatePasswordNConfirmPasswordProfile,
  validatePhone,
} from '../../utils/validation';
import {
  changeProfilePassword,
  DeactivateUserAccount,
  getUserProfile,
  setUserProfile,
} from '../../../helpers/Services/userProfile';
import CustomToast from '../../component/CustomToast';
import LinearGradient from 'react-native-linear-gradient';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { FONTS } from '../../theme/FontsLink';
import { DefaultStyle } from '../../theme/styles/DefaultStyle';
import { getData, removeData } from '../../utils/storage';
import axios from 'axios';
import { userDataReducer } from '../../store/Slices/userProfileSlice';
import { useDispatch } from 'react-redux';
import { setLogoutData } from '../../store/Slices/logoutSlice';
import { addApiCartReducer } from '../../store/Slices/addToCartSlice';
import { setMealDataList } from '../../store/Slices/mealQuantitySlice';

interface ValidationErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [imagePath, setImagePath] = useState<any>(null);
  const [extension, setExtension] = useState('');
  const [wrongPasswordMessage, setWrongPassowrdMessage] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [onChangeFlag, setOnChangeFlag] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [validationError, setValidationError] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [imageData, setImageData] = useState<any>(null);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [validationMessageUserName, setValidationMessageUserName] =
    useState<any>('');
  const [validationMessageNumber, setValidationMessageNumber] =
    useState<any>('');
  const [openImageSelectModal, setOpenImageSelectModal] = useState(false);
  const [deleteAccountConfirmationModal, setDeleteAccountCofirmationModal] =
    useState(false);
  const [logoutConfirmationModal, setLogoutCofirmationModal] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
      getUserProfileData();
    }
  }, [isFocused]);

  const fetchUserData = async () => {
    const userData = JSON.parse(
      (await AsyncStorage.getItem('userProfileData')) || '{}',
    );
    let name = `${userData?.firstName ?? ''} ${
      userData?.lastName ?? ''
    }`.trim();
    // setFullName(name);
    // setEmail(userData?.email);
    // setPhone(userData?.phoneNumber);
  };

  const handleDevicePermission = () => {
    if (Platform.OS === 'android') {
      const sdkInt = Platform.Version;
      if (sdkInt >= 33) {
        request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
          .then(result => {
            if (result === 'granted') {
              // openImagePicker();
              setOpenImageSelectModal(true);
            } else {
              openSettings();
            }
          })
          .catch(error => console.error('Permission Request Error:', error));
      } else {
        request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
          .then(result => {
            if (result === 'granted') {
              // openImagePicker();
              setOpenImageSelectModal(true);
            } else {
              openSettings();
            }
          })
          .catch(error => console.error('Permission Request Error:', error));
      }
    } else if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.MEDIA_LIBRARY)
        .then(result => {
          if (result === 'granted') {
            // openImagePicker();
            setOpenImageSelectModal(true);
          } else {
            openSettings();
          }
        })
        .catch((error: any) =>
          console.error('Permission Request Error:', error),
        );
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
        setImageLoadError(false);
        return;
      }

      if (response.errorCode || response.errorMessage) {
        setOnChangeFlag(false);
        setImageLoadError(false);
        return;
      }

      const asset = response.assets && response.assets[0];
      if (!asset) {
        setOnChangeFlag(false);
        setImageLoadError(false);
        return;
      }

      // OPTIONAL: File size check
      // if (asset.fileSize && asset.fileSize < 1000000) {
      let ex1 = /.png/;
      let ex2 = /.jpg/;
      let ex3 = /.jpeg/;
      let ex4 = /.JPG/;
      let ex5 = /.webp/;
      let data = response.assets[0].uri && {
        uri: response.assets[0]?.uri,
        type: response.assets[0]?.type,
        name: response.assets[0]?.fileName,
      };
      let extensionData =
        (ex1.test(response.assets[0].fileName) ? 'png' : '') ||
        (ex2.test(response.assets[0].fileName) ? 'jpg' : '') ||
        (ex3.test(response.assets[0].fileName) ? 'jpeg' : '') ||
        (ex4.test(response.assets[0].fileName) ? 'JPG' : '') ||
        (ex5.test(response.assets[0].fileName) ? 'webp' : '');

      setExtension(extensionData);
      setImageData(data);
      setImagePath(asset.uri);
      setOnChangeFlag(true);
      setImageLoadError(false);
      // }
    });
  };

  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      saveToPhotos: true,
    };

    launchCamera(options, (response: any) => {
      if (response.didCancel) {
        setOpenImageSelectModal(true);
        console.log('User cancelled');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        const asset = response.assets?.[0];
        if (!asset) return;

        // if (asset.fileSize < 1000000) {

        const data = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
        };

        setImageData(data);
        setImagePath(asset.uri);

        // Detect extension
        const fileName = asset.fileName || '';

        let extensionData =
          (/.png$/i.test(fileName) && 'png') ||
          (/.jpg$/i.test(fileName) && 'jpg') ||
          (/.jpeg$/i.test(fileName) && 'jpeg') ||
          (/.webp$/i.test(fileName) && 'webp') ||
          '';

        setExtension(extensionData);
        setOpenImageSelectModal(false);
      }
      // }
    });
  };

  const getUserProfileData = async () => {
    await getUserProfile()
      .then(async response => {
        if (response) {
          dispatch(userDataReducer(response));
          let imageUrl = IMG_URL + response?.imageUrl;
          imageUrl = imageUrl.replace(/\\/g, '/');
          let fullName = (
            response?.firstName +
            (response?.lastName ? ' ' + (response?.lastName || '') : '')
          ).trim();
          if (response?.imageUrl) {
            setImagePath(imageUrl);
          }
          setImageData(null);
          setFullName(fullName);
          setEmail(response?.email);
          setPhone(response?.phoneNumber);
        }
      })
      .catch(async error => {
        // if (error == "Please enter valid credentials") {
        //   await AsyncStorage.removeItem("loginToken");
        //   // navigation.replace("AuthNavigation");
        // }
      });
  };

  const handleSaveProfileDetails = async () => {
    const userData = await getData('userData');
    const userNameValidation = validateName(fullName);
    const phoneNumberValidation = validatePhone(phone);
    if (!userNameValidation && !phoneNumberValidation) {
      setValidationMessageUserName('');
      setValidationMessageNumber('');
      let formData = new FormData();
      formData.append('Id', userData?.userID);
      formData.append('FirstName', fullName ?? '');
      formData.append('LastName', '');
      formData.append('PhoneNumber', phone ?? '');
      formData.append('CountryCode', '+971');
      formData.append('Email', email ?? '');
      formData.append('Username', email ?? '');
      formData.append('Gender', '');
      formData.append('Dob', '');
      formData.append('Image', imageData ?? '');
      formData.append('UploadType', "0");
      formData.append('Extension', extension ?? '');
      formData.append('DeleteCurrentImage', imageData ? "true" : "false");

      setSubmitLoader(true);
      await axios
        .post(API_URL + 'personal/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${userData?.token}`,
          },
        })
        .then(async (response: any) => {
          if (response?.succeeded) {
            setIsEditProfile(false);
            getUserProfileData();
            setSubmitLoader(false);
            setOnChangeFlag(false);
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
          console.error('Error updating profile:', error);
        });
    } else {
      setValidationMessageUserName(userNameValidation);
      setValidationMessageNumber(phoneNumberValidation);
    }
  };

  const handleChangeSave = async () => {
    const errors: Record<string, string> = {};
    const newPasswordValidation = validatePassword(newPassword);
    const passwordError = validatePasswordNConfirmPasswordProfile(
      newPassword,
      confirmPassword,
    );
    const oldPasswordError = validateOldPassword(oldPassword);
    if (oldPasswordError) {
      errors.oldPassword = oldPasswordError;
    } else if (oldPassword == newPassword) {
      errors.newPassword = 'Old Password and New Password cannot be the same';
    } else if (newPasswordValidation) {
      errors.newPassword = newPasswordValidation;
    } else if (!confirmPassword) {
      errors.confirmPassword = 'Confirm Password is required';
    } else if (confirmPassword != newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      return;
    }

    setValidationError({});
    let payload = {
      password: oldPassword,
      newPassword: newPassword,
      confirmNewPassword: confirmPassword,
    };

    await changeProfilePassword(payload)
      .then(response => {
        if (response?.succeeded) {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowChangePassword(false);
          setShowToast(true);
          setToastMessage(response?.messages[0]);
          setIsSuccess(true);
          setTimeout(() => {
            setShowToast(false);
            handleAccountLogoutFunction(2);
          }, 1000);
        } else {
          setWrongPassowrdMessage(response?.messages[0]);
          // setShowChangePassword(false);
          // setShowToast(true);
          // setIsSuccess(false);
          // setToastMessage(response?.messages[0]);
          // setTimeout(() => {
          //   setShowToast(false);
          // }, 1000);
        }
      })
      .catch(error => {
        setShowToast(true);
        setIsSuccess(false);
        setToastMessage('Something went wrong');
        setTimeout(() => {
          setShowToast(false);
        }, 1000);
      });
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleGoToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'DrawerNavigation',
            state: {
              routes: [
                {
                  name: 'Home',
                  state: {
                    routes: [
                      {
                        name: 'TabNavigation',
                        state: {
                          routes: [{ name: 'Home' }],
                          index: 0,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
    );
  };

  const getInitials = (fullName?: string) => {
    if (!fullName || typeof fullName !== 'string') return '';

    const parts = fullName.trim().split(/\s+/);

    const first = parts[0] || '';
    const last = parts[1] || '';

    if (first && last) {
      return `${first[0].toUpperCase()}${last[0].toUpperCase()}`;
    }

    if (first.length >= 2) {
      return `${first[0].toUpperCase()}${first[1].toUpperCase()}`;
    }

    return first ? first[0].toUpperCase() : '';
  };

  const handleDeleteAccountAPI = async () => {
    let payload = {
      userOTP: '',
      username: email,
    };
    await DeactivateUserAccount(payload).then(async (response: any) => {
      if (response?.succeeded) {
        dispatch({ type: 'UserData/account_delete' });
        await AsyncStorage.clear();
        setDeleteAccountCofirmationModal(false);
        setShowToast(true);
        setToastMessage(response?.messages[0]);
        setIsSuccess(true);
        setTimeout(() => {
          setShowToast(false);
          navigation.replace('AuthNavigation');
        }, 1000);
      }
    });
  };

  const handleAccountLogout = async () => {
    setLogoutCofirmationModal(true);
  };

  const handleAccountLogoutFunction = async (flag: any) => {
    setLogoutCofirmationModal(false);
    dispatch(setLogoutData('Logout Successfully'));
    await removeData('userData');
    await removeData('user_id');
    dispatch(addApiCartReducer([]));
    dispatch(setMealDataList([]));
    await AsyncStorage.removeItem('userProfileData');
    await AsyncStorage.removeItem('CartDataArray');
    if (flag == 1) {
      setShowToast(true);
      setToastMessage('Logout Successfully');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        navigation.replace('AuthNavigation');
      }, 1000);
    } else {
      navigation.replace('AuthNavigation');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#264941', '#264941']} style={{ flex: 1 }}>
        {showToast && (
          <CustomToast message={toastMessage} isSuccess={isSuccess} />
        )}
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1 }}
          resizeMode="contain"
          imageStyle={{ tintColor: '#23302A' }}
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
              <Text style={styles.headerTitle}>My Profile</Text>
            </Pressable>
            <Pressable onPress={() => handleGoToHome()}>
              <Image
                source={Icons.HomeIcon}
                resizeMode="contain"
                style={{ height: heightPixel(27), width: widthPixel(27) }}
                tintColor={'#fff'}
              />
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: '#fff',
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
                position: 'absolute',
                bottom: -40,
                right: -40,
              }}
            >
              <Image
                source={Images.BottomCircle}
                style={DefaultStyle.imageSize}
                resizeMode="contain"
                tintColor={'#F4F4F4'}
              />
            </View>
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 60 }}
              keyboardShouldPersistTaps={'always'}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 15,
                }}
              >
                <View>
                  <Text style={styles.sectionTitle}>Personal Details</Text>
                </View>
                <Pressable
                  onPress={() => setIsEditProfile(true)}
                  disabled={isEditProfile}
                >
                  {!isEditProfile && (
                    <Image
                      source={Icons.EditIcon}
                      resizeMode="contain"
                      style={{ height: heightPixel(27), width: widthPixel(27) }}
                    />
                  )}
                </Pressable>
              </View>

              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D8D8D8',
                  borderRadius: 20,
                  borderTopLeftRadius: 0,
                  padding: 10,
                  marginTop: 10,
                }}
              >
                {/* Profile Image */}
                <View style={styles.imageContainer}>
                  <Text
                    style={{
                      color: '#7E8389',
                      fontFamily: FONTS.tenonRegularFont,
                      fontSize: fontPixel(16),
                      marginBottom: 10,
                    }}
                  >
                    Profile Image
                  </Text>
                  <View style={{ alignItems: 'center' }}>
                    {imagePath ? (
                      <View>
                        {imageData ? (
                          <Pressable
                            style={{
                              position: 'absolute',
                              zIndex: 99,
                              backgroundColor: '#DDD',
                              right: 10,
                              borderRadius: 50,
                              padding: 2,
                            }}
                            onPress={() => getUserProfileData()}
                          >
                            <Image
                              source={Icons.CrossIcon}
                              style={{
                                height: heightPixel(18),
                                width: widthPixel(18),
                              }}
                              tintColor={'#000'}
                            />
                          </Pressable>
                        ) : null}
                        <Image
                          source={{ uri: imagePath }}
                          style={styles.profileImage}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.profileImage,
                          { justifyContent: 'center', alignItems: 'center' },
                        ]}
                      >
                        <Text style={styles.nameText}>
                          {getInitials(fullName)}
                        </Text>
                      </View>
                    )}

                    {isEditProfile && (
                      <Pressable
                        style={styles.editIconContainer}
                        onPress={handleDevicePermission}
                      >
                        <Image
                          source={Icons.ProfileEditIcon}
                          style={[
                            styles.editIcon,
                            { height: '100%', width: '100%' },
                          ]}
                          resizeMode="contain"
                          tintColor={'#707070'}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
                <View style={{ paddingBottom: 10 }}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor={'#DDD'}
                    value={fullName}
                    onChangeText={setFullName}
                    editable={isEditProfile ? true : false}
                    style={[
                      styles.label1,
                      { marginTop: isEditProfile ? 5 : -5 },
                      isEditProfile && { borderWidth: 1, paddingLeft: 10 },
                    ]}
                  />
                  {validationMessageUserName && (
                    <Text style={styles.errorText}>
                      {validationMessageUserName}
                    </Text>
                  )}

                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    placeholder="Enter your phone number"
                    value={phone}
                    // maxLength={10}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={'#DDD'}
                    editable={isEditProfile ? true : false}
                    style={[
                      styles.label1,
                      { marginTop: isEditProfile ? 5 : -5 },
                      isEditProfile && { borderWidth: 1, paddingLeft: 10 },
                    ]}
                  />
                  {validationMessageNumber && (
                    <Text style={styles.errorText}>
                      {validationMessageNumber}
                    </Text>
                  )}

                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor={'#DDD'}
                    value={email}
                    onChangeText={setEmail}
                    // editable={isEditProfile ? true : false}
                    editable={false}
                    style={[
                      styles.label1,
                      { marginTop: isEditProfile ? 5 : -5 },
                      isEditProfile && { borderWidth: 1, paddingLeft: 10 },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {/* Save Button */}
              {isEditProfile ? (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Pressable
                    style={styles.saveButton}
                    onPress={async () => {
                      setIsEditProfile(false);
                      fetchUserData();
                      setImagePath(null);
                      setValidationMessageUserName('');
                      setValidationMessageNumber('');
                      await getUserProfileData();
                    }}
                  >
                    <Text style={[styles.saveText, { color: '#264941' }]}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveButton, { backgroundColor: '#264941' }]}
                    onPress={handleSaveProfileDetails}
                    disabled={submitLoader}
                  >
                    {submitLoader ? (
                      <ActivityIndicator size={'small'} />
                    ) : (
                      <Text style={styles.saveText}>Save</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Pressable
                    style={[
                      styles.saveButton,
                      { width: '80%', alignSelf: 'center' },
                    ]}
                    onPress={() => setShowChangePassword(!showChangePassword)}
                  >
                    <Text style={[styles.saveText, { color: '#264941' }]}>
                      Change Password
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDeleteAccountCofirmationModal(true)}
                    style={{
                      marginTop: '15%',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={Icons.DeleteIcon}
                      resizeMode="contain"
                      style={{ height: heightPixel(20), width: widthPixel(20) }}
                    />
                    <Text
                      style={{
                        color: '#9D9D9D',
                        fontFamily: FONTS.tenonMediumFont,
                        fontSize: fontPixel(14),
                      }}
                    >
                      {'  '}Delete Account
                    </Text>
                  </Pressable>
                  <Pressable
                    style={{ marginTop: '10%' }}
                    onPress={() => handleAccountLogout()}
                  >
                    <Text
                      style={{
                        color: '#9D9D9D',
                        fontFamily: FONTS.tenonMediumFont,
                        fontSize: fontPixel(14),
                      }}
                    >
                      {'Logout'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </ImageBackground>
      </LinearGradient>
      <Modal
        visible={showChangePassword}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Your content goes here */}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: fontPixel(22),
                    fontFamily: FONTS.tenonBoldFont,
                    marginBottom: 10,
                    color: '#000000',
                  }}
                >
                  Change Password
                </Text>
              </View>
              <Pressable
                style={{ height: heightPixel(20), width: widthPixel(20) }}
                onPress={() => [
                  setShowChangePassword(false),
                  setValidationError({}),
                  setValidationMessageUserName(''),
                  setValidationMessageNumber(''),
                  setOldPassword(''),
                  setNewPassword(''),
                  setConfirmPassword(''),
                  setWrongPassowrdMessage(''),
                ]}
              >
                <Image
                  source={Icons.CrossIcon}
                  style={styles.editIcon}
                  resizeMode="contain"
                  tintColor={'#000000'}
                />
              </Pressable>
            </View>

            <View>
              <Text style={[styles.label, { marginBottom: 5 }]}>
                Old Password
              </Text>
              <TextInputComponent
                placeholder="Enter old password"
                value={oldPassword}
                onChangeText={text => {
                  const filtered = text.replace(
                    /[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
                    '',
                  );
                  if (filtered?.length > 0) {
                    setWrongPassowrdMessage('');
                  }
                  setOldPassword(filtered);

                  if (validationError.oldPassword) {
                    setValidationError(prev => ({
                      ...prev,
                      oldPassword: '',
                    }));
                  }
                }}
                secureTextEntry
                isPassword
              />

              {validationError.oldPassword && (
                <Text style={styles.errorText}>
                  {validationError.oldPassword}
                </Text>
              )}
              {wrongPasswordMessage && (
                <Text style={styles.errorText}>{wrongPasswordMessage}</Text>
              )}
              <Text style={[styles.label, { marginBottom: 5 }]}>
                New Password
              </Text>
              <TextInputComponent
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={text => {
                  const filtered = text.replace(
                    /[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
                    '',
                  );
                  setNewPassword(filtered);
                  if (validationError.newPassword)
                    setValidationError(prev => ({
                      ...prev,
                      password: '',
                    }));
                }}
                secureTextEntry
                isPassword
              />
              {validationError.newPassword && (
                <Text style={styles.errorText}>
                  {validationError.newPassword}
                </Text>
              )}
              <Text style={[styles.label, { marginBottom: 5 }]}>
                Confirm Password
              </Text>
              <TextInputComponent
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={text => {
                  const filtered = text.replace(
                    /[\s\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
                    '',
                  );
                  setConfirmPassword(filtered);
                  if (validationError.newPassword)
                    setValidationError(prev => ({
                      ...prev,
                      confirmPassword: '',
                    }));
                }}
                secureTextEntry
                isPassword
              />
              {validationError.confirmPassword && (
                <Text style={styles.errorText}>
                  {validationError.confirmPassword}
                </Text>
              )}
            </View>
            <Pressable
              style={[
                styles.saveButton,
                {
                  backgroundColor: '#264941',
                  width: '100%',
                  alignSelf: 'center',
                },
              ]}
              onPress={handleChangeSave}
            >
              <Text style={styles.saveText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal transparent visible={openImageSelectModal} animationType="none">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          onPress={() => setOpenImageSelectModal(false)}
        />
        <View
          style={{
            backgroundColor: '#fff',
            position: 'absolute',
            bottom: 0,
            width: '100%',
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
                borderColor: '#eee',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: fontPixel(18),
                  color: '#000',
                  fontFamily: FONTS.tenonMediumFont,
                }}
              >
                Pick From Gallery
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOpenImageSelectModal(false);
                openCamera();
              }}
              style={{
                paddingVertical: 20,
                marginTop: 0,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: fontPixel(18),
                  color: '#000',
                  fontFamily: FONTS.tenonMediumFont,
                }}
              >
                Open Camera
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={deleteAccountConfirmationModal}
        animationType="none"
        transparent
      >
        <Pressable
          style={{ flex: 1, backgroundColor: '#000000aa' }}
          onPress={() => setDeleteAccountCofirmationModal(false)}
        >
          <View
            style={{
              position: 'absolute',
              backgroundColor: '#fff',
              bottom: 0,
              width: '100%',
              borderTopLeftRadius: 60,
              borderTopRightRadius: 60,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                paddingTop: '5%',
                paddingBottom: '10%',
              }}
            >
              <View
                style={{
                  height: heightPixel(25),
                  width: widthPixel(25),
                  marginBottom: 15,
                }}
              >
                {/* <Image source={Icons.DeleteIcon} style={DefaultStyle.imageSize} resizeMode="contain" tintColor={"#264941"} /> */}
              </View>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={styles.confirmationText}>
                  Are you sure you want to
                </Text>
                <Text style={styles.confirmationText}>
                  delete your account?
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '60%',
                }}
              >
                <Pressable
                  style={styles.accountDeleteButton}
                  onPress={() => setDeleteAccountCofirmationModal(false)}
                >
                  <Text style={styles.deleteText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.accountDeleteButton,
                    { backgroundColor: '#264941' },
                  ]}
                  onPress={() => handleDeleteAccountAPI()}
                >
                  <Text style={[styles.deleteText, { color: '#fff' }]}>
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
      <Modal visible={logoutConfirmationModal} animationType="none" transparent>
        <Pressable
          style={{ flex: 1, backgroundColor: '#000000aa' }}
          onPress={() => setLogoutCofirmationModal(false)}
        >
          <View
            style={{
              position: 'absolute',
              backgroundColor: '#fff',
              bottom: 0,
              width: '100%',
              borderTopLeftRadius: 60,
              borderTopRightRadius: 60,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                paddingTop: '5%',
                paddingBottom: '10%',
              }}
            >
              <View
                style={{
                  height: heightPixel(25),
                  width: widthPixel(25),
                  marginBottom: 15,
                }}
              >
                <Image
                  source={Icons.DeleteIcon}
                  style={DefaultStyle.imageSize}
                  resizeMode="contain"
                  tintColor={'#264941'}
                />
              </View>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={styles.confirmationText}>
                  Are you sure you want to
                </Text>
                <Text style={styles.confirmationText}>Logout?</Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '60%',
                }}
              >
                <Pressable
                  style={styles.accountDeleteButton}
                  onPress={() => setLogoutCofirmationModal(false)}
                >
                  <Text style={styles.deleteText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.accountDeleteButton,
                    { backgroundColor: '#264941' },
                  ]}
                  onPress={() => handleAccountLogoutFunction(1)}
                >
                  <Text style={[styles.deleteText, { color: '#fff' }]}>
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    // marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#333',
    transform: [{ rotate: '-90deg' }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  imageContainer: {
    width: widthPixel(100),
    height: heightPixel(100),
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#707070',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: -15,
    padding: 6,
    borderRadius: 20,
    height: heightPixel(38),
    width: widthPixel(38),
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  editIcon: {
    width: '100%',
    height: '100%',
    tintColor: '#fff',
  },
  label: {
    fontSize: fontPixel(16),
    color: '#555',
    marginLeft: 4,
    marginTop: 10,
    marginBottom: 0,
    fontFamily: FONTS.tenonRegularFont,
  },
  label1: {
    fontSize: fontPixel(18),
    color: '#15090A',
    marginLeft: 0,
    fontFamily: FONTS.tenonMediumFont,
    borderColor: '#D8D8D8',
    borderRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'transparent',
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.tenonBoldFont,
    color: '#15090A',
    marginBottom: 10,
  },
  saveButton: {
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#264941',
    marginTop: 20,
    width: '45%',
  },
  saveText: {
    color: '#fff',
    fontFamily: FONTS.tenonMediumFont,
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    fontSize: fontPixel(14),
    marginTop: 4,
    fontFamily: FONTS.tenonRegularFont,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
  },
  nameText: {
    fontSize: fontPixel(30),
    fontFamily: FONTS.tenonBoldFont,
  },
  accountDeleteButton: {
    borderWidth: 1,
    borderRadius: 50,
    width: '45%',
    alignItems: 'center',
    paddingVertical: 8,
    borderColor: '#264941',
  },
  deleteText: {
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonMediumFont,
    color: '#264941',
  },
  confirmationText: {
    color: '#264941',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
  },
});
