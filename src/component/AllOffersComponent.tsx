import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Icons } from '../theme/AssetsUrl';
import { IMG_URL } from '../../config';
import { fontPixel, heightPixel, widthPixel } from '../utils/responsive';
import { FONTS } from '../theme/FontsLink';
import StarRatingComponent from './StarRatingComponent';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';

interface Offer {
  id: string;
  serviceProviderName: string;
  image: any;
  surpriseBoxName: string;
  discountedPercent: string;
  actualPrice: string;
  discountedPrice: string;
  spRating: string;
  distanceInKm: string;
  noOfBoxes: string;
  collectionFromTime: string;
  collectionToTime: string;
  timeToAMPM: string;
  sbImageURL: string;
  surpriseBoxMealType: any;
  timeFromAMPM: any;
  serviceProviderVendorType: any;
  noOfBoxRemaing: any;
}

interface Props {
  offer: Offer;
  onPress?: () => void;
}

const AllOffersComponent: React.FC<Props> = ({ offer, onPress }) => {
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
    vendorTypeData: any,
    serviceProviderVendorType: any,
  ) => {
    if (!image_url) {
      if (serviceProviderVendorType !== 'Restaurant') {
        switch (serviceProviderVendorType) {
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
    <Pressable onPress={onPress} style={styles.offerCard}>
      <View style={styles.offerTopRow}>
        <View style={styles.offerLeft}>
          <View
            style={{
              marginRight: 20,
              borderRightWidth: 1,
              borderRightColor: '#DDDDDD',
              paddingRight: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={handleImageData(
                offer?.sbImageURL,
                offer?.surpriseBoxMealType[0]?.mealType,
                vendorTypeData,
                offer?.serviceProviderVendorType,
              )}
              style={styles.offerImage}
              // resizeMode={FastImage.resizeMode.contain}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.offerStock,
                { fontSize: fontPixel(22), lineHeight: 18 },
              ]}
            >
              {offer.noOfBoxRemaing}
            </Text>
            <Text style={[styles.offerStock, { marginBottom: 10 }]}>
              Available
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 5,
              }}
            >
              <Text style={styles.offerRestaurant}>
                {offer.serviceProviderName?.length > 15
                  ? offer.serviceProviderName.slice(0, 15) + '...'
                  : offer.serviceProviderName}
              </Text>
              {offer.spRating && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <StarRatingComponent
                    rating={parseFloat(offer.spRating) ?? 0}
                    onChange={newRating => console.log(newRating)}
                    color="#FFB800"
                    size={12}
                    readOnly={true}
                    showText={false}
                    maxStar={1}
                  />
                  <Text
                    style={{
                      color: '#666666',
                      fontFamily: FONTS.tenonMediumFont,
                      fontSize: fontPixel(16),
                      marginLeft: 5,
                    }}
                  >
                    {offer?.spRating && parseFloat(offer?.spRating)?.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.offerItem}>{offer.surpriseBoxName}</Text>
            {/* <Text style={styles.offerPrice}>
                            <Text style={styles.oldPrice}>AED {offer.actualPrice}</Text> AED {offer.discountedPrice} ({offer.discountedPercent}% OFF)
                        </Text> */}

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 3,
                marginBottom: 10,
              }}
            >
              <Text style={styles.oldPrice}>AED {offer.actualPrice} </Text>
              <Text style={styles.offerPrice}>
                AED {offer.discountedPrice}{' '}
              </Text>
              <Text style={styles.discountPercentage}>
                {offer.discountedPercent}% OFF
              </Text>
            </View>

            <View style={styles.offerBottomRow}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Image
                    source={Icons.DistanceIcon}
                    style={{ height: heightPixel(18), width: widthPixel(18) }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.offerDetail}> {offer.distanceInKm} KM</Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <View>
                  <Image
                    source={Icons.TimingIcon}
                    style={{ height: heightPixel(15), width: widthPixel(15) }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.offerDetail}>
                  {' '}
                  {`${offer.collectionFromTime}`}
                </Text>
                {offer?.timeFromAMPM != offer?.timeToAMPM ? (
                  <Text style={styles.offerDetail}>
                    {' '}
                    {`${offer?.timeFromAMPM}`} -
                  </Text>
                ) : (
                  <Text style={styles.offerDetail}> -</Text>
                )}
                <Text style={styles.offerDetail}>
                  {' '}
                  {`${offer.collectionToTime}`} {offer.timeToAMPM}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default AllOffersComponent;

const styles = StyleSheet.create({
  offerCard: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 6,
    paddingRight: 6,
    // marginBottom: 16,
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  offerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  offerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  offerImage: {
    marginTop: 5,
    width: widthPixel(57),
    height: heightPixel(57),
    resizeMode: 'contain',
    marginBottom: 8,
  },
  offerRestaurant: {
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonBoldFont,
    color: '#2E2E2E',
  },
  offerItem: {
    fontSize: fontPixel(14),
    color: '#666666',
    fontFamily: FONTS.tenonMediumFont,
    marginBottom: 5,
  },
  offerRating: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  offerPrice: {
    color: '#2E2E2E',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
    marginBottom: 0,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#9D9D9D',
    fontSize: fontPixel(18),
    fontFamily: FONTS.tenonMediumFont,
  },
  discountPercentage: {
    color: '#666666',
    fontSize: fontPixel(12),
    fontFamily: FONTS.tenonMediumFont,
  },
  offerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    // width:"88%"
  },
  offerDetail: {
    fontSize: fontPixel(14),
    color: '#666666',
    fontFamily: FONTS.tenonMediumFont,
  },
  offerStock: {
    fontSize: fontPixel(13),
    color: '#666666',
    fontFamily: FONTS.tenonMediumFont,
  },
});
