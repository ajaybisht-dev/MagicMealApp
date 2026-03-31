import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Icons } from '../../theme/AssetsUrl';
import { IMG_URL } from '../../../config';
import { fontPixel, heightPixel, widthPixel } from '../../utils/responsive';
import { FONTS } from '../../theme/FontsLink';

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
  decLoading: boolean;
  incLoading: boolean;
  serviceProviderVendorType: any;
}

interface Props {
  surpriseBoxData: SurpriseBox;
  onPress?: () => void;
  onPressDelete?: () => void;
  onPressAddToCart: () => void;
  onPressDecreaseQty: () => void;
  onPressIncreaseQty: () => void;
}

const OrderPlaceCart: React.FC<Props> = ({
  surpriseBoxData,
  onPressDelete,
  onPressAddToCart,
  onPressDecreaseQty,
  onPressIncreaseQty,
}) => {
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

  const handleImageData = (image_url: any, deal: any, serviceProviderVendorType: any) => {
      if (!image_url) {
          if (deal == "Others") {
              switch (serviceProviderVendorType) {
                  case "Bakery": return Icons.BakeryIcon
                  case "Grocery": return Icons.GroceryIcon
                  case "Butcher": return Icons.ButcherIcon
                  default: break;
              }
          } else {
              switch (deal) {
                  case "Non Veg": return Icons.NonVegBoxIcon
                  case "Veg": return Icons.VegBoxIcon
                  case "Vegan": return Icons.VeganBoxIcon
                  case "Sea Food": return Icons.SeaFoodBoxIcon
                  default:
                      break;
              }
          }
      } else {
          const normalizedPath = image_url.replace(/\\/g, "/");
          return { uri: IMG_URL + normalizedPath };
      }
  };

//   const handleImageData = (
//     image_url: any,
//     deal: any,
//     serviceProviderVendorType: any,
//     surpriseBoxName: any,
//   ) => {
//     if (image_url) {
//       const normalizedPath = image_url.replace(/\\/g, '/');
//       return { uri: IMG_URL + normalizedPath };
//     }

//     switch (serviceProviderVendorType) {
//       case 'Restaurant':
//         if (surpriseBoxName?.includes('Non Veg')) return Icons.NonVegBoxIcon;
//         if (surpriseBoxName?.includes('Vegan')) return Icons.VeganBoxIcon;
//         if (surpriseBoxName?.includes('Veg')) return Icons.VegBoxIcon;
//         if (surpriseBoxName?.includes('Sea Food')) return Icons.SeaFoodBoxIcon;
//         return Icons.SeaFoodBoxIcon;

//       case 'Bakery':
//         return Icons.BakeryIcon;

//       case 'Grocery':
//         return Icons.GroceryIcon;

//       case 'Butcher':
//         return Icons.ButcherIcon;

//       default:
//         return Icons.SeaFoodBoxIcon;
//     }
//   };

  return (
    <View style={{ opacity: surpriseBoxData?.noOfBoxRemaing == 0 ? 0.5 : 1 }}>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <View style={styles.productSection}>
          <Image
            source={handleImageData(
              surpriseBoxData?.sbImageURL,
              surpriseBoxData?.surpriseBoxMealType[0]?.mealType,
              surpriseBoxData?.serviceProviderVendorType,
            //   surpriseBoxData?.surpriseBoxName,
            )}
            style={styles.productImage}
          />
        </View>
        <View
          style={{
            width: '85%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 5,
          }}
        >
          <View>
            <View style={styles.productDetails}>
              <Text style={styles.mealName} numberOfLines={2}>
                {surpriseBoxData?.surpriseBoxName?.length > 15
                  ? surpriseBoxData?.surpriseBoxName.slice(0, 15) + '...'
                  : surpriseBoxData?.surpriseBoxName}
              </Text>
            </View>
            <View style={{}}>
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
              {surpriseBoxData?.quantity == 0 ? (
                <View style={styles.quantitySection}>
                  <Pressable
                    style={[
                      styles.qtyButton,
                      {
                        width: 'auto',
                        height: 'auto',
                        paddingVertical: 4,
                        paddingHorizontal: 20,
                      },
                    ]}
                    onPress={onPressAddToCart}
                  >
                    <Text
                      style={[
                        styles.qtyText,
                        {
                          fontSize: fontPixel(13),
                          fontFamily: FONTS.tenonBoldFont,
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
                    {surpriseBoxData?.decLoading ? (
                      <View style={styles.qtyButton}>
                        <ActivityIndicator size={'small'} color={'#fff'} />
                      </View>
                    ) : (
                      <Pressable
                        onPress={onPressDecreaseQty}
                        style={styles.qtyButton}
                      >
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
                    )}
                    <View style={styles.qtyBox}>
                      <Text style={styles.qtyValue}>
                        {surpriseBoxData?.quantity}
                      </Text>
                    </View>
                    {surpriseBoxData?.incLoading ? (
                      <View style={styles.qtyButton}>
                        <ActivityIndicator size={'small'} color={'#fff'} />
                      </View>
                    ) : (
                      <Pressable
                        onPress={onPressIncreaseQty}
                        style={styles.qtyButton}
                      >
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
                    )}
                  </View>
                </View>
              )}
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

export default OrderPlaceCart;

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
    // borderRightWidth: 1,
    // borderRightColor: "#DDDDDD",
    paddingLeft: 5,
  },
  productImage: {
    width: widthPixel(36),
    height: heightPixel(36),
    resizeMode: 'contain',
  },
  productDetails: {
    marginTop: 5,
    marginBottom: 5,
  },
  mealName: {
    fontSize: fontPixel(16),
    fontFamily: FONTS.tenonBoldFont,
    color: '#2E2E2E',
  },
  priceText: {
    fontSize: fontPixel(16),
    color: '#2E2E2E',
    fontFamily: FONTS.tenonMediumFont,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#9D9D9D',
    fontSize: fontPixel(16),
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
    fontFamily: FONTS.muliBoldFont,
    top: 5,
    marginLeft: 15,
  },

  quantitySection: {
    marginTop: 0,
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
    backgroundColor: '#264941',
  },
  qtyText: {
    fontSize: fontPixel(15),
    color: '#fff',
    fontFamily: FONTS.tenonBoldFont,
  },
  qtyBox: {
    width: widthPixel(50),
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: fontPixel(14),
    color: '#15090A',
    fontFamily: FONTS.tenonBoldFont,
  },

  locationSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  timeText: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },

  reviewSection: {
    paddingHorizontal: 20,
  },
  reviewHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    fontSize: 14,
    color: '#333',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#555',
  },
  reviewValue: {
    fontSize: 14,
    color: '#333',
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A3AFF',
  },

  vendorButton: {
    alignSelf: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  vendorButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkoutButton: {},
  checkoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});
