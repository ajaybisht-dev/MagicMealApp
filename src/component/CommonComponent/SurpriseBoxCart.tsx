import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Icons } from '../../theme/AssetsUrl';
import { IMG_URL } from '../../../config';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { FONTS } from '../../theme/FontsLink';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';

interface SurpriseBox {
  serviceProviderName: string;
  surpriseBoxName: string;
  discountedPercent: number;
  actualPrice: number;
  discountedPrice: number;
  surpriseBoxRating: number;
  distanceInKm: number;
  noOfBoxRemaing: number;
  collectionFromTime: number;
  collectionToTime: number;
  timeToAMPM: string;
  sbImageURL: string;
  quantity: number;
  serviceProviderAddress: string;
  surpriseBoxMealType: any;
  mealType: string;
  serviceProviderVendorType: any;
}

interface Props {
  surpriseBoxData: SurpriseBox;
  onPress?: () => void;
  onPressDelete?: () => void;
  onPressAddToCart: () => void;
  onPressDecreaseQty: () => void;
  onPressIncreaseQty: () => void;
  serviceProviderName: any;
}

const SurpriseBoxCart: React.FC<Props> = ({
  surpriseBoxData,
  onPressDelete,
  onPressAddToCart,
  onPressDecreaseQty,
  onPressIncreaseQty,
  serviceProviderName,
}) => {
  
  const vendorTypeData = useSelector(
    (state: RootState) => state?.totalSavingSlice?.vendorTypeData,
  );
  // const handleImageData = (image_url: any, deal: any) => {
  //     if (!image_url) {
  //         switch (deal) {
  //             case "Non Veg": return Icons.NonVegBoxIcon
  //             case "Veg": return Icons.VegBoxIcon
  //             case "Vegan": return Icons.VeganBoxIcon
  //             case "Sea Food": return Icons.SeaFoodBoxIcon
  //             default: break;
  //         }
  //     } else {
  //         const normalizedPath = image_url.replace(/\\/g, "/");
  //         return { uri: IMG_URL + normalizedPath };
  //     }
  // };

  const handleImageData = (
    image_url: any,
    deal: any,
    serviceProviderName: any,
    serviceProviderVendorType: any,
  ) => {
    if (!image_url) {
      if (deal === 'Others') {
        switch (serviceProviderName) {
          case 'Bakery':
            return Icons.BakeryIcon;
          case 'Grocery':
            return Icons.GroceryIcon;
          case 'Butcher':
            return Icons.ButcherIcon;
          default:
            break;
        }
      } else {
        switch (deal) {
          case 'Non Veg':
            return Icons.NonVegBoxIcon;
          case 'Veg':
            return Icons.VegBoxIcon;
          case 'Vegan':
            return Icons.VeganBoxIcon;
          case 'Sea Food':
            return Icons.SeaFoodBoxIcon;
          default:
            break;
        }
      }
    } else {
      const normalizedPath = image_url.replace(/\\/g, '/');
      return { uri: IMG_URL + normalizedPath };
    }
  };

  return (
    <View
      style={{
        borderWidth: surpriseBoxData?.quantity == 0 ? 1 : 2,
        padding: 2,
        borderRadius: 20,
        borderTopLeftRadius: 0,
        borderColor:
          surpriseBoxData?.noOfBoxRemaing > 0
            ? surpriseBoxData?.quantity == 0
              ? '#ddd'
              : '#2F7C32'
            : '#ddd',
        opacity: surpriseBoxData?.noOfBoxRemaing == 0 ? 0.5 : 1,
      }}
    >
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingTop: '1%',
          paddingBottom: '3%',
        }}
      >
        <View style={styles.productSection}>
          {surpriseBoxData?.noOfBoxRemaing == 0 ? (
            <Image
              source={handleImageData(
                surpriseBoxData?.sbImageURL,
                surpriseBoxData?.surpriseBoxMealType[0]?.mealType,
                serviceProviderName,
                surpriseBoxData?.serviceProviderVendorType,
              )}
              style={styles.productImage}
              tintColor={'#D0D0D0'}
            />
          ) : (
            <Image
              source={handleImageData(
                surpriseBoxData?.sbImageURL,
                surpriseBoxData?.surpriseBoxMealType[0]?.mealType,
                serviceProviderName,
                surpriseBoxData?.serviceProviderVendorType,
              )}
              style={styles.productImage}
            />
          )}
        </View>
        <View style={{ width: '65%' }}>
          <View>
            <View style={styles.productDetails}>
              <Text style={styles.mealName} numberOfLines={2}>
                {surpriseBoxData?.surpriseBoxName}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={styles.priceText}>
                <Text style={styles.oldPrice}>
                  {`AED ${
                    surpriseBoxData?.quantity > 0
                      ? surpriseBoxData?.actualPrice * surpriseBoxData?.quantity
                      : surpriseBoxData?.actualPrice
                  }`}{' '}
                </Text>{' '}
                {`AED ${
                  surpriseBoxData?.quantity > 0
                    ? surpriseBoxData?.discountedPrice *
                      surpriseBoxData?.quantity
                    : surpriseBoxData?.discountedPrice
                }`}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.tenonMediumFont,
                  color: '#666666',
                  fontSize: fontPixel(12),
                  marginLeft: 5,
                }}
              >{`${surpriseBoxData?.discountedPercent}% OFF`}</Text>
            </View>
          </View>
          {surpriseBoxData?.noOfBoxRemaing > 0 ? (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {surpriseBoxData?.quantity == 0 ||
              surpriseBoxData?.noOfBoxRemaing == 0 ? (
                <View style={styles.quantitySection}>
                  <Pressable
                    style={[
                      styles.qtyButton,
                      {
                        width: 'auto',
                        height: 'auto',
                        paddingVertical: 4,
                        paddingHorizontal: 20,
                        backgroundColor:
                          surpriseBoxData?.noOfBoxRemaing == 0
                            ? '#D0D0D0'
                            : '#264941',
                      },
                    ]}
                    onPress={onPressAddToCart}
                    disabled={surpriseBoxData?.noOfBoxRemaing == 0}
                  >
                    <Text
                      style={[
                        styles.qtyText,
                        {
                          fontSize: fontPixel(13),
                          fontFamily: FONTS.muliSemiBoldFont,
                        },
                      ]}
                    >
                      Add To Cart
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.quantitySection}>
                  <View style={styles.qtyControls}>
                    <Pressable
                      style={[
                        styles.qtyButton,
                        {
                          backgroundColor:
                            surpriseBoxData?.noOfBoxRemaing == 0
                              ? '#D0D0D0'
                              : '#264941',
                        },
                      ]}
                      onPress={onPressDecreaseQty}
                      disabled={surpriseBoxData?.noOfBoxRemaing == 0}
                    >
                      {/* <Text style={[styles.qtyText, { top: 0 }]}>–</Text> */}
                      <View
                        style={{
                          height: heightPixel(15),
                          width: widthPixel(15),
                        }}
                      >
                        <Image
                          source={Icons.MinusIcon}
                          tintColor={'#fff'}
                          style={{ height: '100%', width: '100%' }}
                          resizeMode="contain"
                        />
                      </View>
                    </Pressable>
                    <View
                      style={{ width: widthPixel(50), alignItems: 'center' }}
                    >
                      <Text style={styles.qtyValue}>
                        {surpriseBoxData?.quantity}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.qtyButton,
                        {
                          backgroundColor:
                            surpriseBoxData?.noOfBoxRemaing == 0
                              ? '#D0D0D0'
                              : '#264941',
                        },
                      ]}
                      onPress={onPressIncreaseQty}
                      disabled={surpriseBoxData?.noOfBoxRemaing == 0}
                    >
                      {/* <Text style={[styles.qtyText, { top: 0 }]}>+</Text> */}
                      <View
                        style={{
                          height: heightPixel(15),
                          width: widthPixel(15),
                        }}
                      >
                        <Image
                          source={Icons.AddIcon}
                          tintColor={'#fff'}
                          style={{ height: '100%', width: '100%' }}
                          resizeMode="contain"
                        />
                      </View>
                    </Pressable>
                  </View>
                </View>
              )}

              <Text
                style={[
                  styles.stockText,
                  {
                    color:
                      surpriseBoxData?.noOfBoxRemaing > 3
                        ? '#109D7D'
                        : '#D34D40',
                  },
                ]}
              >
                {`${
                  surpriseBoxData?.noOfBoxRemaing > 3
                    ? surpriseBoxData?.noOfBoxRemaing + ' Available'
                    : surpriseBoxData?.noOfBoxRemaing + ' Left!'
                }`}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={[styles.stockText, { opacity: 0.5, marginLeft: 0 }]}>
                Out of stock
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default SurpriseBoxCart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backArrow: {
    fontSize: 20,
    color: '#333',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  productSection: {
    flexDirection: 'row',
    marginTop: 5,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#DDDDDD',
    paddingLeft: 10,
    width: '28%',
  },
  productImage: {
    width: widthPixel(70),
    height: heightPixel(70),
    resizeMode: 'contain',
    marginRight: 14,
  },
  productDetails: {
    marginBottom: 5,
  },
  mealName: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    color: '#2E2E2E',
  },
  priceText: {
    fontSize: fontPixel(18),
    color: '#2E2E2E',
    fontFamily: FONTS.tenonMediumFont,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#9D9D9D',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  discountText: {
    fontSize: 13,
    color: '#333',
  },
  savingText: {
    fontSize: 13,
    color: '#333',
  },
  stockText: {
    fontSize: fontPixel(13),
    fontFamily: FONTS.tenonMediumFont,
    top: 5,
    marginLeft: 15,
  },

  quantitySection: {
    marginTop: 10,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 6,
  },
  qtyButton: {
    width: widthPixel(28),
    height: heightPixel(24),
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: fontPixel(15),
    color: '#fff',
    fontFamily: FONTS.tenonMediumFont,
  },
  qtyValue: {
    fontSize: fontPixel(14),
    fontFamily: FONTS.tenonMediumFont,
    color: '#15090A',
  },
});
