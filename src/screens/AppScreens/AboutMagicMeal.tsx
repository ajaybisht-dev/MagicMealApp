import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  Text
} from 'react-native';
import WebView from 'react-native-webview';
import {
  DrawerActions,
  useNavigation,
  NavigationProp
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Icons, Images } from '../../theme/AssetsUrl';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { FONTS } from '../../theme/FontsLink';

type NavType = NavigationProp<any>;

const AboutMagicMeal: React.FC = () => {

  const navigation = useNavigation<NavType>();

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#264941", "#264941"]} style={{ flex: 1 }}>
        <ImageBackground
          source={Images.LogoBg}
          style={{ height: heightPixel(350), flex: 1 }}
          resizeMode="contain"
          imageStyle={{ tintColor: "#23302A" }}
        >
          <View style={styles.headerNav}>
            <Pressable style={styles.header} onPress={handleOpenDrawer}>
              <Image
                source={Icons.MenuIcon}
                resizeMode="contain"
                style={{
                  height: heightPixel(20),
                  width: widthPixel(20),
                  marginRight: 10,
                }}
              />
              <Text style={styles.headerTitle}>About Magic Meal</Text>
            </Pressable>
          </View>

          <WebView
            source={{ uri: "https://picsum.photos/" }}
            style={{ flex: 1 }}
          />

        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default AboutMagicMeal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: fontPixel(20),
    fontFamily: FONTS.tenonBoldFont,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
});